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
  TrendingUp,
  Search,
  FileText,
  X,
  Eye,
  ExternalLink,
  Globe,
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

  // Dummy description text for all jobs
  const DUMMY_DESCRIPTION = "Join our team and be part of an innovative company that values creativity, collaboration, and growth. We offer competitive benefits and a dynamic work environment.";

  // Helper to get salary - ALWAYS returns something
  const getSalary = (salary: string) => {
    if (!salary || salary.trim() === "") {
      return "Competitive salary";
    }
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
      full_time: "bg-green-100 text-green-700",
      part_time: "bg-blue-100 text-blue-700",
      contract: "bg-purple-100 text-purple-700",
      freelance: "bg-orange-100 text-orange-700",
      internship: "bg-pink-100 text-pink-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Loader2 className="animate-spin text-yellow-700 w-8 h-8" />
    </div>
  );

  return (
    <main className="bg-[#fffaf6] min-h-screen text-gray-800 overflow-x-hidden scroll-smooth relative">
      {/* Copied Modal */}
      <AnimatePresence>
        {copied && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-8 right-8 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-[100]">
            ✅ Link copied!
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center text-center overflow-visible pb-32">
        <img src="/coverpage.jpeg" alt="coverpage" className="absolute inset-0 w-full h-full object-cover brightness-75 z-0" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-0" />
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative z-[60] max-w-5xl px-4 sm:px-6 w-full">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-tight drop-shadow-2xl px-4">
            The future of work is here — <span className="text-amber-400">flexible, global,</span> and built on trust
          </h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-6 sm:mt-8 text-base sm:text-lg md:text-2xl font-medium text-amber-100 max-w-3xl mx-auto leading-relaxed drop-shadow-lg px-4">
            We are your trusted marketplace for modern work—connecting verified opportunities with skilled talent, so careers and businesses grow on their own terms.
          </motion.p>

          {/* Search Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-10 sm:mt-12 max-w-3xl mx-auto relative px-4">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
              <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Search for jobs or blog posts..." className="w-full pl-14 pr-14 py-4 sm:py-5 rounded-full text-gray-800 bg-white shadow-2xl focus:ring-4 focus:ring-amber-300 outline-none text-base sm:text-lg" />
              {searchQuery && <button onClick={clearSearch} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"><X size={22} /></button>}
            </div>

            <AnimatePresence>
              {showSearchResults && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={clearSearch} className="fixed inset-0 bg-black/30 z-[70]" />}
            </AnimatePresence>

            <AnimatePresence>
              {showSearchResults && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full mt-3 w-full bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[500px] overflow-y-auto z-[80]">
                  {searching ? (
                    <div className="p-8 text-center">
                      <Loader2 className="animate-spin text-amber-500 w-6 h-6 mx-auto" />
                      <p className="mt-2 text-gray-600">Searching...</p>
                    </div>
                  ) : (
                    <>
                      {searchResults.jobs.length > 0 && (
                        <div className="p-4 border-b border-gray-100">
                          <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Briefcase size={16} />Jobs ({searchResults.jobs.length})</h3>
                          <div className="space-y-2">
                            {searchResults.jobs.map((job) => (
                              <Link key={job._id} href={`/jobs/${job.slug}`} onClick={clearSearch} className="block p-3 hover:bg-amber-50 rounded-lg transition">
                                <div className="flex items-start gap-3">
                                  <div className="bg-amber-100 rounded-lg p-2 flex-shrink-0"><Briefcase size={16} className="text-amber-600" /></div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-800 truncate">{job.title}</h4>
                                    <p className="text-sm text-gray-600 truncate">{job.company} • {job.location}</p>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      {searchResults.posts.length > 0 && (
                        <div className="p-4">
                          <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><FileText size={16} />Blog Posts ({searchResults.posts.length})</h3>
                          <div className="space-y-2">
                            {searchResults.posts.map((post) => (
                              <Link key={post._id} href={`/post/${post.slug}`} onClick={clearSearch} className="block p-3 hover:bg-amber-50 rounded-lg transition">
                                <div className="flex items-start gap-3">
                                  <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0"><FileText size={16} className="text-blue-600" /></div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-800 line-clamp-1">{post.title}</h4>
                                    <p className="text-sm text-gray-600">By {post.author} • {new Date(post.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      {searchResults.jobs.length === 0 && searchResults.posts.length === 0 && (
                        <div className="p-8 text-center">
                          <Search className="mx-auto text-gray-300 mb-3" size={48} />
                          <p className="text-gray-600">No results found for "{searchQuery}"</p>
                          <div className="flex gap-3 justify-center mt-4">
                            <Link href="/jobs" onClick={clearSearch}><button className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600">Browse Jobs</button></Link>
                            <Link href="/post" onClick={clearSearch}><button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">Browse Posts</button></Link>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURED JOBS SECTION */}
      <section className="max-w-7xl mx-auto mt-8 sm:mt-12 px-4 sm:px-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#3e2a1a] flex items-center gap-2 sm:gap-3"><TrendingUp className="text-amber-500" size={32} />Featured Jobs</h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Discover opportunities from top companies worldwide</p>
          </div>
          <Link href="/jobs" className="hidden md:block text-amber-600 hover:text-amber-700 font-semibold transition">View All Jobs →</Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, idx) => (
            <motion.div key={job._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.1 }} className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all p-6 border border-gray-100 hover:border-amber-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getJobTypeColor(job.type)}`}>{job.type?.replace("_", " ").toUpperCase()}</span>
                  {job.isExternal && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1"><Globe size={10} />{job.company}</span>}
                </div>
                <span className="text-xs text-gray-400">{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>

              <h3 className="text-xl font-bold text-[#3e2a1a] mb-2 hover:text-amber-700 transition cursor-pointer line-clamp-2">{job.title}</h3>

              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <Building2 size={16} />
                <span className="text-sm font-medium">{job.company}</span>
              </div>

              {/* Description - DUMMY TEXT */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {DUMMY_DESCRIPTION}
              </p>

              {/* Job details - ALWAYS SHOWS */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <MapPin size={16} className="text-amber-500" />
                  <span>{job.location || "Remote"}</span>
                </div>
                {/* Salary - ALWAYS SHOWS */}
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <DollarSign size={16} className="text-green-500" />
                  <span>{getSalary(job.salary)}</span>
                </div>
                {job.experienceLevel && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Briefcase size={16} className="text-blue-500" />
                    <span>{job.experienceLevel}</span>
                  </div>
                )}
              </div>

              {job.isExternal ? (
                <a href={job.externalApplyUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg shadow transition-all flex items-center justify-center gap-2">
                  Apply at {job.company}
                  <ExternalLink size={16} />
                </a>
              ) : (
                <Link href={`/jobs/${job.slug}`}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg shadow transition-all">View Details</motion.button>
                </Link>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                <Clock size={14} />
                {job.isExternal ? <span>Via {job.company}</span> : <span>Posted by {job.postedBy?.firstName || "Unknown"} {job.postedBy?.lastName || ""}</span>}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="md:hidden mt-8 text-center">
          <Link href="/jobs"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all">View All Jobs</motion.button></Link>
        </div>
      </section>

      {/* RECENT BLOG POSTS SECTION */}
      <section className="max-w-7xl mx-auto mt-16 sm:mt-20 px-4 sm:px-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#3e2a1a]">Recent Posts</h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Insights, tips, and stories from the world of remote work</p>
          </div>
          <Link href="/post" className="hidden md:block text-amber-600 hover:text-amber-700 font-semibold transition">View All Posts →</Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.1 }} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden hover:-translate-y-1">
              <Link href={`/post/${post.slug}`}>
                <img src={post.image || "https://via.placeholder.com/400x250"} alt={post.title} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" />
              </Link>
              <div className="p-6">
                <Link href={`/post/${post.slug}`}><h3 className="text-lg font-semibold text-[#3e2a1a] mb-2 hover:text-amber-700 transition line-clamp-2">{post.title}</h3></Link>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post?.content?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 100) + "..."}</p>
                <div className="flex items-center text-sm text-gray-400 gap-2">
                  <span>{post.author}</span><span>•</span><span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <button onClick={() => handleLike(post._id)} disabled={liking === post._id} className={`flex items-center gap-1 transition ${liking === post._id ? "opacity-50 cursor-not-allowed" : "text-pink-500 hover:text-pink-600"}`} type="button">
                    <Heart size={18} /><span className="text-sm">{post.likesCount || 0}</span>
                  </button>
                  <div className="flex items-center gap-1 text-gray-500"><Eye size={16} /><span className="text-sm">{post.views || 0}</span></div>
                  <Link href={`/post/${post.slug}`} className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition"><MessageCircle size={18} /><span className="text-sm">{post.commentsCount || 0}</span></Link>
                  <button onClick={() => handleShare(post.slug)} className="flex items-center gap-1 text-green-600 hover:text-green-700 transition ml-auto"><Share2 size={18} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="md:hidden mt-8 text-center">
          <Link href="/post"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all">View All Posts</motion.button></Link>
        </div>
      </section>

      {/* CLOSING SECTION */}
      <motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center py-20 mt-20 bg-gradient-to-t from-[#fef6e4] to-[#fffaf6]">
        <h3 className="text-3xl font-bold text-[#3e2a1a] mb-4">Ready to Start Your Journey? 💼</h3>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8 px-4">Join thousands of professionals finding their dream remote jobs and freelance opportunities. Your next career move starts here.</p>
        <div className="flex gap-4 justify-center flex-wrap px-4">
          <Link href="/jobs"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all">Browse Jobs</motion.button></Link>
          <Link href="/post"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white hover:bg-gray-50 text-amber-600 border-2 border-amber-500 font-semibold px-8 py-3 rounded-full shadow-lg transition-all">Read Blog</motion.button></Link>
        </div>
      </motion.section>
    </main>
  );
}
