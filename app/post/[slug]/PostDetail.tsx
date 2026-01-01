"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from 'dompurify'; 
import { User, Mail, Calendar, Shield } from "lucide-react";
import '../../styles/post-detail.css'

export default function PostDetail({ slug }: { slug: string }) {
  const [post, setPost] = useState<any>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showAuthorCard, setShowAuthorCard] = useState(false);
  const [author, setAuthor] = useState<any>(null);
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/slug/${slug}`);
        const data = await res.json();
        const postData = data.post || data;

        setPost({ ...postData, views: (postData.views || 0) + 1 });
        setLikesCount(postData.likes?.length || 0);

        if (postData.postedBy) {
          try {
            const authorRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/admin/profile/${postData.postedBy}`
            );
            if (authorRes.ok) {
              const authorData = await authorRes.json();
              setAuthor(authorData);
            }
          } catch (err) {
            console.log("Could not fetch author by ID");
          }
        } else if (postData.author) {
          try {
            const authorRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/admin/profile/username/${postData.author}`
            );
            if (authorRes.ok) {
              const authorData = await authorRes.json();
              setAuthor(authorData);
            }
          } catch (err) {
            console.log("Could not fetch author by username");
          }
        }

        const commentsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${postData._id}`);
        const commentsData = await commentsRes.json();
        setComments(commentsData || []);

        const relatedRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/${postData._id}/related`
        );
        const relatedData = await relatedRes.json();
        setRelatedPosts(relatedData.related || relatedData);

        const trendingRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/trending`);
        const trendingData = await trendingRes.json();
        setTrendingPosts(trendingData.trending || trendingData);

        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        const likedRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/likes/${postData._id}/check?ip=${ipData.ip}`
        );
        const likedData = await likedRes.json();
        setLiked(likedData.liked);
      } catch (err) {
        console.error("Failed to fetch post details:", err);
      }
    }
    fetchPost();
  }, [slug]);

  const handleLike = async () => {
    if (!post?._id) return;
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipRes.json();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/likes/${post._id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ipAddress: ipData.ip }),
    });
    const data = await res.json();
    setLiked(data.liked);
    setLikesCount(data.likesCount);
  };

  const handleComment = async (e: any) => {
    e.preventDefault();
    if (!post?._id) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${post._id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [...prev, { ...newComment, replies: [] }]);
      setName("");
      setMessage("");
      setToast("Comment added successfully!");
      setTimeout(() => setToast(""), 3000);
    }
  };

  function slugify(str: string) {
    return str
      .toLowerCase()
      .trim()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  }

  const handleShare = () => {
    if (!post?.slug) return;
    const safeSlug = slugify(post.slug);
    const postUrl = `${window.location.origin}/post/${safeSlug}`;

    navigator.clipboard.writeText(postUrl)
      .then(() => {
        setToast("Link copied!");
        setTimeout(() => setToast(""), 2000);
      })
      .catch(() => {
        setToast("Failed to copy link");
        setTimeout(() => setToast(""), 2000);
      });
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowAuthorCard(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowAuthorCard(false);
    }, 300);
  };

  const handleCardMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleCardMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowAuthorCard(false);
    }, 300);
  };

  if (!post)
    return (
      <div className="animate-pulse space-y-6 max-w-3xl mx-auto p-4 sm:p-6">
        <div className="h-6 sm:h-8 bg-gray-300 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-48 sm:h-64 bg-gray-300 rounded-xl"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-10 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {toast && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 text-sm sm:text-base">
              {toast}
            </div>
          )}

       <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="w-full aspect-video overflow-hidden rounded-lg shadow-md mb-4 sm:mb-6"
>
  <img
    src={post.image}
    alt={post.title}
    className="w-full h-full object-cover"
  />
</motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 break-words"
          >
            {post.title}
          </motion.h1>

          <p className="text-sm sm:text-base text-gray-500 mb-4">
            {post.views || 0} views ·{" "}
            <span className="text-blue-600 font-semibold">
              {post.category}
            </span>
          </p>

          {/* Author Section */}
          <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-3 gap-2 mb-4 sm:mb-6 flex-wrap">
            <div 
              className="relative inline-block"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleMouseEnter}
            >
              <span className="font-semibold text-blue-600 cursor-pointer hover:underline">
                {post.author || (author ? `${author.firstName} ${author.lastName}` : 'Admin')}
              </span>

              <AnimatePresence>
                {showAuthorCard && author && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={handleCardMouseEnter}
                    onMouseLeave={handleCardMouseLeave}
                    className="
                      absolute 
                      left-0
                      top-full
                      mt-2 
                      w-[calc(100vw-2rem)] max-w-xs sm:max-w-sm
                      bg-white rounded-xl shadow-2xl border border-gray-200 p-4 sm:p-6 z-50
                      max-h-[80vh] overflow-y-auto
                    "
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0">
                        {author.profileImage ? (
                          <img
                            src={author.profileImage}
                            alt={`${author.firstName} ${author.lastName}`}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-blue-500"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
                            {author.firstName?.charAt(0)}{author.lastName?.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                            {author.firstName} {author.lastName}
                          </h4>
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                        </div>
                        
                        <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 truncate">
                          {author.username}
                        </p>

                        {author.bio && (
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-3">
                            {author.bio}
                          </p>
                        )}

                        <div className="space-y-1.5 sm:space-y-2">
                          {author.email && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                              <span className="truncate">{author.email}</span>
                            </div>
                          )}
                          
                          {author.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                              <span>{author.phone}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Shield className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">Administrator & Content Creator</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="hidden sm:inline">•</span>
            <span className="text-xs sm:text-sm">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": post.title,
                "image": post.image,
                "author": {
                  "@type": "Person",
                  "name": post.author?.name || "Unknown",
                },
                "datePublished": post.createdAt,
                "dateModified": post.updatedAt || post.createdAt,
                "keywords": post.keywords || [],
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/post/${post.slug}`,
                },
                "description": post.content
                  || (typeof post?.content === "string" ? post.content.slice(0, 150) : ""),
              }),
            }}
          />

          {/* Content with responsive table wrapper */}
          <div className="mb-6 sm:mb-8 post-content-wrapper">
            <div 
              className="
                prose prose-sm sm:prose-base lg:prose-lg 
                max-w-none text-gray-700 leading-relaxed
                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-4 sm:prose-img:my-8
                prose-img:max-w-full prose-img:h-auto prose-img:mx-auto
                prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                prose-a:break-words
                prose-headings:font-bold prose-headings:break-words
                prose-h1:text-2xl sm:prose-h1:text-3xl md:prose-h1:text-4xl 
                prose-h2:text-xl sm:prose-h2:text-2xl md:prose-h2:text-3xl 
                prose-h3:text-lg sm:prose-h3:text-xl md:prose-h3:text-2xl
                prose-ul:list-disc prose-ul:ml-4 sm:prose-ul:ml-6
                prose-ol:list-decimal prose-ol:ml-4 sm:prose-ol:ml-6
                prose-li:my-1
                prose-p:break-words
                prose-code:break-words
              "
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  typeof post?.content === "string" ? post.content : ""
                ),
              }}
            />
          </div>

          {/* Rest of your component continues... */}
          {/* Action Buttons, Comments, Related Posts, etc. */}
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <button
              onClick={handleLike}
              className={`px-3 sm:px-4 py-2 rounded-md font-semibold transition-transform transform hover:scale-105 text-sm sm:text-base ${
                liked ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {liked ? "Liked" : "Like"}
            </button>
            <span className="text-gray-600 font-medium text-sm sm:text-base">{likesCount} Likes</span>

            <button
              onClick={handleShare}
              className="px-3 sm:px-4 py-2 rounded-md bg-green-500 text-white font-semibold hover:bg-green-600 transition-all text-sm sm:text-base"
            >
              Share
            </button>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Comments ({comments.length})</h2>
            <form onSubmit={handleComment} className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 p-2 sm:p-3 rounded-md text-sm sm:text-base"
                required
              />
              <textarea
                placeholder="Write a comment..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-300 p-2 sm:p-3 rounded-md text-sm sm:text-base"
                rows={3}
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-all text-sm sm:text-base"
              >
                Post Comment
              </button>
            </form>

            <div className="space-y-6 sm:space-y-8">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm sm:text-base">No comments yet. Be the first!</p>
              ) : (
                comments.map((comment) => (
                  <CommentWithLimitedReplies
                    key={comment._id}
                    comment={comment}
                    postId={post._id}
                    setComments={setComments}
                  />
                ))
              )}
            </div>
          </div>

          {Array.isArray(relatedPosts) && (
            <div className="mt-8 sm:mt-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Related Posts</h2>
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.length === 0 ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="animate-pulse bg-gray-200 rounded-lg h-40 sm:h-48"
                    ></div>
                  ))
                ) : (
                  relatedPosts.map((related, index) => (
                    <motion.a
                      key={index}
                      href={`/post/${related.slug}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="block bg-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform overflow-hidden"
                    >
                      <img
                        src={related.image}
                        alt={related.title}
                        className="w-full h-32 sm:h-40 object-cover"
                      />
                      <div className="p-3 sm:p-4">
                        <h3 className="text-sm sm:text-lg font-semibold text-gray-800 line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">
                          {related.views || 0} views
                        </p>
                      </div>
                    </motion.a>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - keeping previous code */}
        <aside className="w-full lg:w-80 flex-shrink-0 mt-6 lg:mt-0">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Most Trending</h3>
          
          <div className="mb-4 sm:mb-6 relative">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);

                if (!value.trim()) {
                  setSearchResults([]);
                  return;
                }

                if ((window as any).searchTimeout) clearTimeout((window as any).searchTimeout);

                (window as any).searchTimeout = setTimeout(async () => {
                  try {
                    const res = await fetch(
                      `${process.env.NEXT_PUBLIC_API_URL}/posts/search?q=${encodeURIComponent(value.trim())}&startsWith=true`
                    );

                    if (!res.ok) {
                      setSearchResults([]);
                      return;
                    }

                    const data = await res.json();
                    let results: any[] = [];
                    if (Array.isArray(data)) results = data;
                    else if (data.posts) results = data.posts;
                    else if (data.results) results = data.results;
                    else if (data.data) results = data.data;

                    setSearchResults(results.slice(0, 8));
                  } catch (err) {
                    console.error("Search failed:", err);
                    setSearchResults([]);
                  }
                }, 300);
              }}
              onBlur={() => {
                setTimeout(() => setSearchResults([]), 200);
              }}
              className="w-full border border-gray-300 p-2 sm:p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />

            {searchResults.length > 0 && (
              <div className="absolute inset-x-0 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
                {searchResults.map((post) => (
                  <a
                    key={post._id || post.id}
                    href={`/post/${post.slug}`}
                    onMouseDown={(e) => e.preventDefault()} 
                    onClick={() => {
                      setSearchResults([]);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 hover:bg-amber-50 border-b border-gray-100 last:border-b-0 transition"
                  >
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate text-sm sm:text-base">{post.title}</p>
                      <p className="text-xs text-gray-500">
                        {post.views || 0} views • {post.category || "General"}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            {trendingPosts.length === 0 ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse bg-gray-200 h-16 sm:h-20 rounded-md"
                ></div>
              ))
            ) : (
              trendingPosts.map((t: any, idx: number) => (
                <motion.a
                  key={idx}
                  href={`/post/${t.slug}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="block bg-white p-2 sm:p-3 rounded-md shadow hover:shadow-md hover:bg-amber-50 transition-all"
                >
                  <h4 className="font-semibold text-gray-800 line-clamp-2 text-sm sm:text-base">{t.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-500">{t.views || 0} views</p>
                </motion.a>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

// Comment Component remains the same
const CommentWithLimitedReplies = ({ comment, postId, setComments }: { comment: any; postId: string; setComments: any }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyName, setReplyName] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [visibleReplies, setVisibleReplies] = useState(2);

  const totalReplies = comment.replies?.length || 0;
  const shownReplies = comment.replies?.slice(0, visibleReplies) || [];
  const hasMore = visibleReplies < totalReplies;

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyName.trim() || !replyMessage.trim()) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: replyName,
        message: replyMessage,
        parent: comment._id,
      }),
    });

    if (res.ok) {
      const newReply = await res.json();

      const addReplyRecursive = (comments: any[]): any[] => {
        return comments.map((c) => {
          if (c._id === comment._id) {
            return {
              ...c,
              replies: [...(c.replies || []), { ...newReply, replies: [] }]
            };
          }
          if (c.replies?.length > 0) {
            return { ...c, replies: addReplyRecursive(c.replies) };
          }
          return c;
        });
      };

      setComments((prev: any[]) => addReplyRecursive(prev));
      setReplyName("");
      setReplyMessage("");
      setShowReplyForm(false);
      setVisibleReplies(prev => prev + 1);
    }
  };

  return (
    <div className="border-b pb-6 sm:pb-8 last:border-b-0">
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 border p-3 sm:p-4 rounded-md"
      >
        <p className="font-semibold text-gray-800 text-sm sm:text-base">{comment.name}</p>
        <p className="text-gray-600 mt-1 text-sm sm:text-base break-words">{comment.message}</p>

        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 mt-2 sm:mt-3 font-medium"
        >
          {showReplyForm ? "Cancel" : "Reply"}
        </button>

        {showReplyForm && (
          <form onSubmit={submitReply} className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 bg-white p-3 sm:p-4 rounded border">
            <input
              type="text"
              placeholder="Your name"
              value={replyName}
              onChange={(e) => setReplyName(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded text-sm"
              required
            />
            <textarea
              placeholder="Write a reply..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded text-sm resize-none"
              rows={3}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium hover:bg-blue-700"
            >
              Post Reply
            </button>
          </form>
        )}
      </motion.div>

      {shownReplies.length > 0 && (
        <div className="ml-4 sm:ml-10 mt-3 sm:mt-4 space-y-3 sm:space-y-4">
          {shownReplies.map((reply: any) => (
            <CommentWithLimitedReplies
              key={reply._id}
              comment={reply}
              postId={postId}
              setComments={setComments}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="ml-4 sm:ml-10 mt-2 sm:mt-3">
          <button
            onClick={() => setVisibleReplies(prev => Math.min(prev + 2, totalReplies))}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium underline"
          >
            View {totalReplies - visibleReplies} more {totalReplies - visibleReplies === 1 ? "reply" : "replies"} →
          </button>
        </div>
      )}
    </div>
  );
};