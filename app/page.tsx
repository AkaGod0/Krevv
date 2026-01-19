"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Loader2,
  Share2,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Search,
  FileText,
  X,
  Eye,
  ExternalLink,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const stripHtmlAndImages = (html: string) => {
  if (!html) return "No content";
  return html.replace(/<img[^>]*>/g, "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 150) + (html.length > 150 ? "..." : "");
};

interface Post {
  _id: string;
  slug: string;
  title: string;
  content: string;
  author: string;
  image?: string;
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
  views: number;
}

interface Job {
  _id: string;
  title: string;
  slug: string;
  description: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  status: string;
  experienceLevel: string;
  createdAt: string;
  isExternal?: boolean;
  externalSource?: string;
  externalApplyUrl?: string;
  postedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ jobs: Job[]; posts: Post[] }>({ jobs: [], posts: [] });
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Dummy description - ONLY for external jobs
  const DUMMY_DESCRIPTION = "Join our team and be part of an innovative company that values creativity, collaboration, and growth. We offer competitive benefits and a dynamic work environment.";

  const getSalary = (salary: string) => {
    if (!salary || salary.trim() === "") return "Competitive salary";
    return salary;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts?page=1&limit=3`);
        const allPosts = postsRes.data?.data || postsRes.data || [];

        const postsWithCounts = await Promise.all(
          allPosts.map(async (post: Post) => {
            try {
              const likesRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/likes/${post._id}`);
              const commentsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/comments/${post._id}`);
              const commentsData = commentsRes.data;
              return {
                ...post,
                likesCount: likesRes.data.likesCount || 0,
                commentsCount: Array.isArray(commentsData) ? commentsData.length : commentsData.commentsCount || 0,
              };
            } catch {
              return { ...post, likesCount: 0, commentsCount: 0 };
            }
          })
        );
        setPosts(postsWithCounts);

        const jobsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/jobs?status=active&limit=12`);
        const jobsData = jobsRes.data?.data || jobsRes.data || [];
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setPosts([]);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setShowSearchResults(false);
      setSearchResults({ jobs: [], posts: [] });
      return;
    }
    setSearching(true);
    setShowSearchResults(true);
    try {
      const jobsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/jobs`);
      const allJobs = jobsRes.data?.data || jobsRes.data || [];
      const filteredJobs = (Array.isArray(allJobs) ? allJobs : [])
        .filter((job: Job) => {
          const searchLower = query.toLowerCase();
          return job.title?.toLowerCase().includes(searchLower) || job.company?.toLowerCase().includes(searchLower) || job.location?.toLowerCase().includes(searchLower) || job.description?.toLowerCase().includes(searchLower);
        })
        .slice(0, 5);

      const postsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts`);
      const allPosts = postsRes.data?.data || postsRes.data || [];
      const filteredPosts = (Array.isArray(allPosts) ? allPosts : [])
        .filter((post: Post) => {
          const searchLower = query.toLowerCase();
          return post.title?.toLowerCase().includes(searchLower) || stripHtmlAndImages(post.content).toLowerCase().includes(searchLower) || post.author?.toLowerCase().includes(searchLower);
        })
        .slice(0, 5);

      setSearchResults({ jobs: filteredJobs, posts: filteredPosts });
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults({ jobs: [], posts: [] });
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults({ jobs: [], posts: [] });
  };

  const handleLike = async (postId: string) => {
    try {
      setLiking(postId);
      const ipAddress = await axios.get("https://api.ipify.org?format=json");
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/likes/${postId}`, { ipAddress: ipAddress.data.ip });
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, likesCount: res.data.likesCount } : p));
    } catch (err) {
      console.error("Error liking post:", err);
    } finally {
      setLiking(null);
    }
  };

  const handleShare = (slug: string) => {
    const url = `${window.location.origin}/post/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getJobTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      full_time: "bg-emerald-50 text-emerald-700 border-emerald-200",
      part_time: "bg-sky-50 text-sky-700 border-sky-200",
      contract: "bg-violet-50 text-violet-700 border-violet-200",
      freelance: "bg-amber-50 text-amber-700 border-amber-200",
      internship: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return colors[type] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="text-center">
        <Loader2 className="animate-spin text-amber-600 w-12 h-12 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading amazing opportunities...</p>
      </div>
    </div>
  );

  return (
    <main className="bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30 min-h-screen text-gray-900">
      <AnimatePresence>
        {copied && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[200] flex items-center gap-3 border border-emerald-500"
          >
            <CheckCircle size={20} className="flex-shrink-0" />
            <span className="font-semibold">Link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative min-h-[90vh] flex items-center justify-center">
        <div className="absolute inset-0">
          <img 
            src="/coverpage.jpeg" 
            alt="Hero" 
            className="absolute inset-0 w-full h-full object-cover brightness-90" 
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-amber-900/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-400/30 rounded-full mb-8 backdrop-blur-sm"
            >
              <Sparkles className="text-amber-400" size={16} />
              <span className="text-amber-100 text-sm font-semibold">Your Career Journey Starts Here</span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight mb-6 px-4">
              The future of work is here — <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">flexible, global,</span> and built on trust
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-amber-100 max-w-4xl mx-auto mb-12 leading-relaxed px-4"
            >
              We are your trusted marketplace through the world of freelancing and remote jobs, helping you build a career that fits your life, so that careers and businesses grow.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="max-w-3xl mx-auto relative mb-16 px-4 z-[100]"
            >
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex items-center flex-1 gap-3 px-4 min-w-0 text-left">
                    <Search className="text-gray-400 flex-shrink-0" size={22} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search jobs, companies, or keywords..."
                      className="flex-1 py-4 text-gray-900 placeholder-gray-400 bg-white outline-none text-base min-w-0"
                    />
                  </div>
                  {searchQuery ? (
                    <button onClick={clearSearch} className="sm:flex-shrink-0 p-3 hover:bg-gray-100 rounded-xl transition-colors">
                      <X size={20} className="text-gray-500" />
                    </button>
                  ) : (
                    <button className="sm:flex-shrink-0 px-6 sm:px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                      Search <ArrowRight size={18} />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showSearchResults && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: 10 }} 
                      className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden max-h-[450px] overflow-y-auto z-[300] text-left"
                    >
                      {searching ? (
                        <div className="p-8 text-center">
                          <Loader2 className="animate-spin text-amber-500 w-6 h-6 mx-auto" />
                          <p className="mt-2 text-gray-600">Searching...</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {searchResults.jobs.length > 0 && (
                            <div className="p-4">
                              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2 px-2">
                                <Briefcase size={14} /> Jobs
                              </h3>
                              <div className="space-y-1">
                                {searchResults.jobs.map((job) => (
                                  <Link key={job._id} href={`/jobs/${job.slug}`} onClick={clearSearch} className="block p-3 hover:bg-amber-50 rounded-xl transition-all border border-transparent hover:border-amber-100">
                                    <div className="flex items-start gap-3">
                                      <div className="bg-amber-100 rounded-lg p-2 flex-shrink-0 text-amber-600"><Briefcase size={16} /></div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate text-sm">{job.title}</h4>
                                        <p className="text-xs text-gray-500 truncate">{job.company} • {job.location}</p>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                          {searchResults.posts.length > 0 && (
                            <div className="p-4">
                              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2 px-2">
                                <FileText size={14} /> Blog
                              </h3>
                              <div className="space-y-1">
                                {searchResults.posts.map((post) => (
                                  <Link key={post._id} href={`/post/${post.slug}`} onClick={clearSearch} className="block p-3 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100">
                                    <div className="flex items-start gap-3">
                                      <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0 text-blue-600"><FileText size={16} /></div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate text-sm">{post.title}</h4>
                                        <p className="text-xs text-gray-500">By {post.author}</p>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                          {searchResults.jobs.length === 0 && searchResults.posts.length === 0 && (
                            <div className="p-10 text-center">
                              <Search className="mx-auto text-gray-200 mb-3" size={40} />
                              <p className="text-gray-500 font-medium">No matches for "{searchQuery}"</p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-0">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">Featured Opportunities</h2>
            </div>
            <p className="text-gray-600 text-lg">Hand-picked roles from leading companies</p>
          </div>
          <Link href="/jobs">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-amber-500 text-gray-700 hover:text-amber-600 font-semibold rounded-xl transition-all group">
              View All Jobs <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, idx) => (
            <motion.div key={job._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-amber-300 hover:shadow-xl transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 size={24} className="text-white" />
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getJobTypeColor(job.type)}`}>
                    {job.type?.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">{job.title}</h3>
              <p className="text-sm font-semibold text-gray-600 mb-3">{job.company}</p>
              
              {/* ✅ Description - DUMMY for external, REAL for user-posted */}
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {job.isExternal ? DUMMY_DESCRIPTION : (job.description || DUMMY_DESCRIPTION)}
              </p>

              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-amber-500 flex-shrink-0" /> <span className="truncate">{job.location || "Remote"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign size={16} className="text-emerald-500 flex-shrink-0" /> <span className="truncate">{getSalary(job.salary)}</span>
                </div>
              </div>
              {job.isExternal ? (
                <a href={job.externalApplyUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all">
                  Apply at {job.company} <ExternalLink size={16} />
                </a>
              ) : (
                <Link href={`/jobs/${job.slug}`}>
                  <button className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all">View Details</button>
                </Link>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                <Clock size={14} /> <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-gray-50 to-gray-100/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">Latest Insights</h2>
              </div>
              <p className="text-gray-600 text-lg">Expert advice and career tips</p>
            </div>
            <Link href="/post">
              <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-amber-500 text-gray-700 hover:text-amber-600 font-semibold rounded-xl transition-all group">
                View All Posts <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post, idx) => (
              <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="group bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-amber-300 hover:shadow-xl transition-all">
                <Link href={`/post/${post.slug}`}>
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
                    <img src={post.image || "https://via.placeholder.com/400x250"} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </Link>
                <div className="p-6">
                  <Link href={`/post/${post.slug}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors line-clamp-2">{post.title}</h3>
                  </Link>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{stripHtmlAndImages(post.content)}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="font-semibold">{post.author}</span> <span>•</span> <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <button onClick={() => handleLike(post._id)} disabled={liking === post._id} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-rose-500 transition-colors disabled:opacity-50">
                      <Heart size={16} /> <span className="font-medium">{post.likesCount || 0}</span>
                    </button>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Eye size={16} /> <span className="font-medium">{post.views || 0}</span>
                    </div>
                    <Link href={`/post/${post.slug}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-500 transition-colors">
                      <MessageCircle size={16} /> <span className="font-medium">{post.commentsCount || 0}</span>
                    </Link>
                    <button onClick={() => handleShare(post.slug)} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-emerald-500 transition-colors ml-auto">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-400/30 rounded-full mb-8 backdrop-blur-sm">
              <Sparkles className="text-amber-400" size={16} />
              <span className="text-amber-100 text-sm font-semibold">Ready to Take the Next Step?</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Your Dream Career Awaits</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">Join thousands of professionals who've found their perfect remote role. Start your journey today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/jobs">
                <button className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-2xl transition-all flex items-center justify-center gap-3 text-lg">
                  Explore Opportunities <ArrowRight size={20} />
                </button>
              </Link>
              <Link href="/post">
                <button className="px-10 py-5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/20 rounded-xl transition-all flex items-center justify-center gap-3 text-lg">
                  Read Career Tips
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
