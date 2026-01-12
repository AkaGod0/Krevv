import { Metadata } from "next";
import PostDetail from "./PostDetail";

async function getPost(slug: string) {
  // Decode the slug and replace spaces/encoded spaces with hyphens
  const cleanSlug = decodeURIComponent(slug)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-');       // Replace multiple hyphens with single hyphen

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/posts/slug/${cleanSlug}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data?.post || data;
}

// Helper function to safely get content preview
function getContentPreview(content: any, length: number = 150): string {
  if (!content) return "";
  if (typeof content !== "string") return "";
  
  // Strip HTML tags for clean preview
  const stripped = content.replace(/<[^>]*>/g, "").trim();
  return stripped.slice(0, length);
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

  if (!post) {
    return { title: "Post not found", description: "" };
  }

  // Use metaDescription if available, otherwise generate from content
  const description = post.metaDescription || 
                      post.description || 
                      getContentPreview(post.content, 150);

  const imageUrl = post.image?.startsWith("http")
    ? post.image
    : `${process.env.NEXT_PUBLIC_SITE_URL}${post.image || "/default-og.png"}`;

  return {
    title: post.title || "Untitled Post",
    description,
    openGraph: {
      title: post.title,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/post/${post.slug}`,
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [imageUrl],
      site: "@mysite",
      creator: "@mysite",
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Post not found</h1>
          <p className="text-gray-600">The post you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // ✅ JSON-LD for structured data - with safe content access
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title || "",
    image: post.image || "",
    author: {
      "@type": "Person",
      name: post.author || "Author Name",
    },
    datePublished: post.createdAt || new Date().toISOString(),
    description: post.metaDescription || 
                 post.description || 
                 getContentPreview(post.content, 150),
  };

  return (
    <>
      <PostDetail slug={post.slug || slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}