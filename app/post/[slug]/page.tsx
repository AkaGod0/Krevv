import { Metadata } from "next";
import PostDetail from "./PostDetail";

async function getPost(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/posts/slug/${slug}`,
    { cache: "no-store" }
  );

  const data = await res.json();
  return data?.post || data; // handle either shape
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

  if (!post) {
    return { title: "Post not found", description: "" };
  }

  const contentPreview =
    typeof post?.content === "string"
      ? post.content.slice(0, 150)
      : "";

  const description = post?.description || contentPreview;

  const imageUrl = post.image?.startsWith("http")
    ? post.image
    : `${process.env.NEXT_PUBLIC_SITE_URL}${post.image || "/default-og.png"}`;

  return {
    title: post.title || "Untitled Post",
    description,
    openGraph: {
      title: post.title,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/posts/${post.slug}`,
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
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return <div>Post not found</div>;

  // ✅ JSON-LD for structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: post.image,
    author: {
      "@type": "Person",
      name: post.author || "Author Name",
    },
    datePublished: post.createdAt,
    description: post.description || post.content.slice(0, 150),
  };

  return (
    <>
      <PostDetail slug={slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
