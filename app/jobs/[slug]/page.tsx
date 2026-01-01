import { Metadata } from "next";
import JobDetailClient from "./JobDetailClient";

// ✅ Generate dynamic metadata for each job
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    // Fetch job data
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/jobs/slug/${slug}`,
      { cache: 'no-store' } // Always get fresh data
    );
    
    if (!res.ok) {
      return {
        title: "Job Not Found | Krevv",
        description: "The job you're looking for could not be found.",
      };
    }
    
    const job = await res.json();
    
    // Clean description (remove HTML tags if any, limit to 155 chars)
    const cleanDescription = job.description
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Clean whitespace
      .trim()
      .slice(0, 155);
    
    const fullDescription = `${cleanDescription}... Apply now for ${job.title} at ${job.company}. Location: ${job.location}. Salary: ${job.salary}. Experience: ${job.experienceLevel}.`;
    
    return {
      title: `${job.title} at ${job.company} | Krevv`,
      description: fullDescription,
      keywords: `${job.title}, ${job.company}, ${job.location}, ${job.type}, ${job.experienceLevel}, job opening, career opportunity`,
      
      // ✅ Open Graph tags (for Facebook, LinkedIn, WhatsApp)
      openGraph: {
        title: `${job.title} at ${job.company}`,
        description: fullDescription,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.krevv.com'}/jobs/${job.slug}`,
        siteName: 'Krevv',
        type: 'website',
        images: [
          {
            url: job.image || '/og-image.png', // Use job image if available
            width: 1200,
            height: 630,
            alt: `${job.title} at ${job.company}`,
          },
        ],
      },
      
      // ✅ Twitter Card tags
      twitter: {
        card: 'summary_large_image',
        title: `${job.title} at ${job.company}`,
        description: fullDescription,
        images: [job.image || '/og-image.png'],
      },
      
      // ✅ Additional metadata
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.krevv.com'}/jobs/${job.slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Job Details | Krevv",
      description: "View job details and apply for this position on Krevv.",
    };
  }
}

export default async function JobDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  return <JobDetailClient params={params} />;
}