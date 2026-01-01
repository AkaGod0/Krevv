// lib/metadata.ts

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
}

export const siteMetadata = {
  siteName: "Krevv",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.krevv.com",
  defaultOgImage: "/og-image.png",
};

export const pageMetadata: Record<string, PageMetadata> = {
  // Main Pages
  home: {
    title: "Krevv - Find Your Dream Remote Job in Nigeria & Worldwide",
    description:
      "Discover verified job opportunities in Nigeria and remote roles worldwide. Browse full-time, part-time, freelance, and internship positions. Your trusted job platform.",
    keywords: "jobs in Nigeria, remote jobs, freelance work, job search, employment, career opportunities",
  },
  
  jobs: {
    title: "Browse Jobs - Find Remote & Local Opportunities | Krevv",
    description:
      "Explore thousands of verified job listings. Filter by location, job type, salary, and experience level. Apply to your dream job today.",
    keywords: "job listings, remote jobs, Nigeria jobs, job search, employment opportunities",
  },
  
  posts: {
    title: "Career Blog - Job Tips, Guides & Resources | Krevv",
    description:
      "Read expert career advice, job search tips, CV writing guides, interview preparation, and industry insights to advance your career.",
    keywords: "career advice, job tips, CV writing, interview tips, career development",
  },
  
  about: {
    title: "About Krevv - Your Trusted Job Platform",
    description:
      "Learn about Krevv's mission to connect job seekers with verified employers. Discover how we're revolutionizing job search in Nigeria and beyond.",
    keywords: "about Krevv, job platform, company mission, career platform",
  },
  
  contact: {
    title: "Contact Us - Get in Touch with Krevv Support",
    description:
      "Have questions? Contact Krevv support team. We're here to help with job listings, employer inquiries, and platform assistance.",
    keywords: "contact Krevv, customer support, help, inquiries",
  },
  
  faq: {
    title: "Frequently Asked Questions (FAQ) - Krevv Help Center",
    description:
      "Find answers to common questions about Krevv, job applications, employer posting, safety tips, and platform features.",
    keywords: "FAQ, help, questions, support, how to apply, job posting",
  },
  
  // Legal Pages
  terms: {
    title: "Terms of Use - Krevv Legal Agreement",
    description:
      "Read Krevv's terms of use, user agreement, and platform rules. Understand your rights and responsibilities when using our job platform.",
    keywords: "terms of use, user agreement, legal terms, platform rules",
  },
  
  privacy: {
    title: "Privacy Policy - How Krevv Protects Your Data",
    description:
      "Learn how Krevv collects, uses, and protects your personal information. Our commitment to your privacy and data security.",
    keywords: "privacy policy, data protection, personal information, GDPR",
  },
  
  dmca: {
    title: "DMCA & Copyright Policy - Krevv Intellectual Property",
    description:
      "Krevv's Digital Millennium Copyright Act (DMCA) policy. Learn how to report copyright infringement and protect intellectual property.",
    keywords: "DMCA, copyright policy, intellectual property, infringement",
  },
  
  dataRetention: {
    title: "Data Retention & Disclosure Notice - Krevv Data Policy",
    description:
      "Understand how long Krevv retains your data, our disclosure practices, and your rights regarding personal information.",
    keywords: "data retention, data disclosure, information storage, data rights",
  },
  
  contentLicensing: {
    title: "Content Licensing Clause - Krevv User Content Rights",
    description:
      "Learn about content ownership, user-generated content rights, and licensing terms on Krevv platform.",
    keywords: "content licensing, user rights, content ownership, intellectual property",
  },
  
  antiScam: {
    title: "Anti-Scam & Safety Policy - Stay Safe on Krevv",
    description:
      "Protect yourself from job scams. Learn safety tips, red flags, and how Krevv ensures verified job listings.",
    keywords: "anti-scam, job safety, scam protection, verified jobs, safety tips",
  },
  
  employerVerification: {
    title: "Employer Verification Guidelines - Krevv Trust & Safety",
    description:
      "How Krevv verifies employers, ensures legitimate job postings, and maintains platform integrity for job seekers.",
    keywords: "employer verification, verified companies, trust, authenticity",
  },
  
  employerPosting: {
    title: "Employer Posting Policy - How to Post Jobs on Krevv",
    description:
      "Guidelines for employers posting jobs on Krevv. Learn posting requirements, best practices, and prohibited content.",
    keywords: "employer policy, job posting, posting guidelines, employer rules",
  },
  
  cookies: {
    title: "Cookie Policy - How Krevv Uses Cookies",
    description:
      "Learn about cookies used on Krevv, how they improve your experience, and how to manage cookie preferences.",
    keywords: "cookie policy, cookies, tracking, privacy, preferences",
  },
  
  // Auth Pages
  login: {
    title: "Login - Access Your Krevv Account",
    description:
      "Sign in to your Krevv account to apply for jobs, manage applications, and access saved opportunities.",
    keywords: "login, sign in, account access, user login",
  },
  
  signup: {
    title: "Sign Up - Create Your Free Krevv Account",
    description:
      "Join Krevv today! Create a free account to apply for jobs, save opportunities, and get personalized job recommendations.",
    keywords: "sign up, register, create account, join Krevv",
  },
  
  // User Pages
  profile: {
    title: "My Profile - Manage Your Krevv Account",
    description:
      "Update your profile, manage account settings, and personalize your job search experience on Krevv.",
    keywords: "profile, account settings, user profile, manage account",
  },
  
  applications: {
    title: "My Applications - Track Your Job Applications | Krevv",
    description:
      "View and manage all your job applications. Track application status, view employer responses, and stay organized.",
    keywords: "job applications, application tracking, application status, my jobs",
  },
  
  myJobs: {
    title: "My Posted Jobs - Manage Your Job Listings | Krevv",
    description:
      "Manage jobs you've posted on Krevv. Edit listings, view applications, and find the best candidates.",
    keywords: "my jobs, posted jobs, manage listings, employer dashboard",
  },
  
  // Admin Pages (Protected)
  adminDashboard: {
    title: "Admin Dashboard - Krevv Management Panel",
    description:
      "Manage Krevv platform, users, job listings, and analytics. Administrative control panel.",
    keywords: "admin, dashboard, management, analytics",
  },
};

// Helper function to generate metadata
export function generateMetadata(page: string, customTitle?: string, customDescription?: string) {
  const metadata = pageMetadata[page] || pageMetadata.home;
  
  return {
    title: customTitle || `${metadata.title} | ${siteMetadata.siteName}`,
    description: customDescription || metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: customTitle || metadata.title,
      description: customDescription || metadata.description,
      url: siteMetadata.siteUrl,
      siteName: siteMetadata.siteName,
      images: [
        {
          url: metadata.ogImage || siteMetadata.defaultOgImage,
          width: 1200,
          height: 630,
          alt: metadata.title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: customTitle || metadata.title,
      description: customDescription || metadata.description,
      images: [metadata.ogImage || siteMetadata.defaultOgImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}