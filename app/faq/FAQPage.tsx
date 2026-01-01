"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
  Briefcase,
  Shield,
  BookOpen,
  Headphones,
  Building2,
  Search,
} from "lucide-react";
import Link from "next/link";

interface FAQ {
  question: string;
  answer: string | string[];
  category: string;
}

const faqs: FAQ[] = [
  // General Questions
  {
    category: "General",
    question: "What is Krevv?",
    answer:
      "Krevv is an online job posting platform that connects job seekers with employers by listing verified job opportunities in Nigeria and remote roles from around the world.",
  },
  {
    category: "General",
    question: "Is Krevv free to use?",
    answer:
      "Yes. Job seekers can browse and apply for jobs on Krevv completely free of charge.",
  },
  {
    category: "General",
    question: "Do I need to create an account to apply for jobs?",
    answer:
      "In most cases, no account is required. Some employers may redirect you to their official application page.",
  },
  {
    category: "General",
    question: "What types of jobs are posted on Krevv?",
    answer: [
      "Krevv features:",
      "• Full-time jobs",
      "• Part-time jobs",
      "• Remote jobs",
      "• Internships",
      "• Contract and freelance roles",
    ],
  },

  // Job Listings & Applications
  {
    category: "Job Listings & Applications",
    question: "How often are jobs updated on Krevv?",
    answer:
      "New job listings are added daily to ensure users have access to the latest opportunities.",
  },
  {
    category: "Job Listings & Applications",
    question: "How can I apply for a job on Krevv?",
    answer:
      "Click the Apply Now button on any job listing and follow the employer's application instructions.",
  },
  {
    category: "Job Listings & Applications",
    question: "Does Krevv guarantee job placement?",
    answer:
      "No. Krevv is a job listing platform and does not influence hiring decisions made by employers.",
  },
  {
    category: "Job Listings & Applications",
    question: "Are all jobs on Krevv verified?",
    answer:
      "Krevv reviews job listings before publishing. However, applicants should always exercise caution and never pay to apply for a job.",
  },

  // Employers & Recruiters
  {
    category: "Employers & Recruiters",
    question: "How can employers post a job on Krevv?",
    answer:
      "Employers can submit job listings through the Post a Job page by providing accurate job details and company information.",
  },
  {
    category: "Employers & Recruiters",
    question: "Is job posting free for employers?",
    answer:
      "Krevv offers both free and paid job posting options, including featured listings for increased visibility.",
  },
  {
    category: "Employers & Recruiters",
    question: "How long does a job listing stay active?",
    answer:
      "Job listings typically remain active for 14–30 days, depending on the selected posting option.",
  },
  {
    category: "Employers & Recruiters",
    question: "Can employers edit or remove a job post?",
    answer:
      "Yes. Employers can request edits or removal of their job listing by contacting Krevv support.",
  },

  // Safety & Scam Awareness
  {
    category: "Safety & Scam Awareness",
    question: "Does Krevv charge applicants any fees?",
    answer: "No. Krevv never charges job seekers to apply for jobs.",
  },
  {
    category: "Safety & Scam Awareness",
    question: "How can I avoid job scams?",
    answer: [
      "• Do not pay application fees",
      "• Avoid sharing sensitive personal information",
      "• Verify company details before applying",
    ],
  },
  {
    category: "Safety & Scam Awareness",
    question: "How can I report a suspicious job listing?",
    answer:
      "Use the Report Job option on the job page or contact Krevv via the contact page.",
  },

  // Career Resources
  {
    category: "Career Resources",
    question: "Does Krevv offer career advice?",
    answer:
      "Yes. Krevv publishes career guides, CV tips, interview advice, and job search resources.",
  },
  {
    category: "Career Resources",
    question: "Can I subscribe to job alerts?",
    answer:
      "Yes. Users can subscribe to email alerts to receive the latest job postings.",
  },

  // Technical & Support
  {
    category: "Technical & Support",
    question: "Why can't I apply for some jobs?",
    answer:
      "Some job listings redirect to external employer websites where applications are managed directly.",
  },
  {
    category: "Technical & Support",
    question: "Is Krevv mobile-friendly?",
    answer:
      "Yes. Krevv is fully responsive and works well on mobile phones, tablets, and desktops.",
  },
  {
    category: "Technical & Support",
    question: "How can I contact Krevv?",
    answer:
      "You can reach Krevv through the Contact Us page or via the official email listed on the website.",
  },
];

const categories = [
  { name: "General", icon: HelpCircle, color: "amber" },
  { name: "Job Listings & Applications", icon: Briefcase, color: "blue" },
  { name: "Employers & Recruiters", icon: Building2, color: "purple" },
  { name: "Safety & Scam Awareness", icon: Shield, color: "red" },
  { name: "Career Resources", icon: BookOpen, color: "green" },
  { name: "Technical & Support", icon: Headphones, color: "indigo" },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(faq.answer)
        ? faq.answer.join(" ").toLowerCase().includes(searchQuery.toLowerCase())
        : faq.answer.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const cat = categories.find((c) => c.name === category);
    return cat?.color || "gray";
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.name === category);
    const Icon = cat?.icon || HelpCircle;
    return <Icon size={20} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50 py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4 md:mb-6 shadow-lg">
            <HelpCircle className="text-white" size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-3 md:mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about Krevv, our services, and how
            we help you find your dream job.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 md:mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search for questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 md:py-4 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition"
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 md:mb-10"
        >
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold text-xs md:text-sm transition ${
                selectedCategory === "All"
                  ? "bg-amber-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold text-xs md:text-sm transition flex items-center gap-2 ${
                    selectedCategory === category.name
                      ? `bg-${category.color}-500 text-white shadow-lg`
                      : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
                  }`}
                  style={
                    selectedCategory === category.name
                      ? {
                          backgroundColor:
                            category.color === "amber"
                              ? "#f59e0b"
                              : category.color === "blue"
                              ? "#3b82f6"
                              : category.color === "purple"
                              ? "#a855f7"
                              : category.color === "red"
                              ? "#ef4444"
                              : category.color === "green"
                              ? "#10b981"
                              : "#6366f1",
                        }
                      : {}
                  }
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{category.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-3 md:space-y-4">
          {filteredFAQs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 md:py-16 bg-white rounded-xl shadow-md"
            >
              <Search className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-2">
                No results found
              </h3>
              <p className="text-sm md:text-base text-gray-500">
                Try adjusting your search or filter
              </p>
            </motion.div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden border-l-4"
                style={{
                  borderLeftColor:
                    getCategoryColor(faq.category) === "amber"
                      ? "#f59e0b"
                      : getCategoryColor(faq.category) === "blue"
                      ? "#3b82f6"
                      : getCategoryColor(faq.category) === "purple"
                      ? "#a855f7"
                      : getCategoryColor(faq.category) === "red"
                      ? "#ef4444"
                      : getCategoryColor(faq.category) === "green"
                      ? "#10b981"
                      : "#6366f1",
                }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-4 md:px-6 py-4 md:py-5 flex items-start md:items-center justify-between gap-4 text-left hover:bg-gray-50 transition"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1 md:mt-0">
                      {getCategoryIcon(faq.category)}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs md:text-sm text-gray-500 font-semibold mb-1 block">
                        {faq.category}
                      </span>
                      <h3 className="text-base md:text-lg font-semibold text-gray-800">
                        {faq.question}
                      </h3>
                    </div>
                  </div>
                  <ChevronDown
                    className={`flex-shrink-0 text-gray-400 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    size={20}
                  />
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-6 pb-4 md:pb-5 pt-0">
                        <div className="pl-0 md:pl-8 text-sm md:text-base text-gray-600 leading-relaxed">
                          {Array.isArray(faq.answer) ? (
                            <div>
                              {faq.answer.map((line, i) => (
                                <p key={i} className="mb-1">
                                  {line}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p>{faq.answer}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 md:mt-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 md:p-10 text-center text-white shadow-xl"
        >
          <Headphones className="mx-auto mb-4" size={48} />
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            Still have questions?
          </h2>
          <p className="text-base md:text-lg text-amber-50 mb-6 md:mb-8 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our support team is here
            to help you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link href="/contact">
              <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white text-amber-600 font-bold rounded-xl hover:bg-amber-50 transition shadow-lg text-sm md:text-base">
                Contact Support
              </button>
            </Link>
            <Link href="/jobs">
              <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition text-sm md:text-base">
                Browse Jobs
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}