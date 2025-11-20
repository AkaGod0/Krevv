"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DOMPurify from 'dompurify'; 


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

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/slug/${slug}`);
        const data = await res.json();
        const postData = data.post || data;

        setPost({ ...postData, views: (postData.views || 0) + 1 });
        setLikesCount(postData.likes?.length || 0);

        // FIXED: Get FULL nested comments
        const commentsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${postData._id}`);
        const commentsData = await commentsRes.json();
        setComments(commentsData || []);

        // Related posts
        const relatedRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/${postData._id}/related`
        );
        const relatedData = await relatedRes.json();
        setRelatedPosts(relatedData.related || relatedData);

        // Trending posts
        const allPostsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`);
        const allPostsData = await allPostsRes.json();
        const allPostsList = allPostsData.posts || allPostsData;

        const trendingList = allPostsList
          .filter((p: any) => p._id !== postData._id)
          .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
          .slice(0, 5);
        setTrendingPosts(trendingList);

        // Check like status
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

  const safeSlug = slugify(post.slug); // 👈 FIX

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


if (!post)
  return (
    <div className="animate-pulse space-y-6 max-w-3xl mx-auto p-6">
      <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-64 bg-gray-300 rounded-xl"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );


  return (
    <div className="container mx-auto px-4 md:px-6 py-10 max-w-6xl flex flex-col lg:flex-row gap-8">
      {/* Main content */}
      <div className="flex-1">
        {toast && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
            {toast}
          </div>
        )}

        <motion.img
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          src={post.image}
          alt={post.title}
          className="w-full rounded-lg shadow-md mb-6"
        />

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold mb-2"
        >
          {post.title}
        </motion.h1>

        <p className="text-gray-500 mb-4"> {post.views || 0} views  Category:  {post.category}</p>

        {/* Keywords */}
        {Array.isArray(post.keywords) && post.keywords.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {post.keywords.map((kw: string, idx: number) => (
              <a
                key={idx}
                className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-amber-200 transition"
              >
                #{kw}
              </a>
            ))}
          </div>
        )}

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


        {/* Content */}
   <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8
                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                prose-img:max-w-full prose-img:h-auto prose-img:mx-auto
                prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                prose-a:break-all
                prose-headings:font-bold 
                prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl 
                prose-ul:list-disc prose-ul:ml-6
                prose-ol:list-decimal prose-ol:ml-6
                prose-li:my-1"
>

  {/* Render the content safely */}
  <div
    dangerouslySetInnerHTML={{
      __html: DOMPurify.sanitize(
        typeof post?.content === "string" ? post.content : ""
      ),
    }}
  />
</div>




        <div className="flex items-center space-x-3 mb-8">
          <button
            onClick={handleLike}
            className={`px-4 py-2 rounded-md font-semibold transition-transform transform hover:scale-105 ${
              liked ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            {liked ? "Liked" : "Like"}
          </button>
          <span className="text-gray-600 font-medium">{likesCount} Likes</span>

          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-md bg-green-500 text-white font-semibold hover:bg-green-600 transition-all"
          >
            Share
          </button>

          {toast && (
            <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
              {toast}
            </div>
          )}
        </div>

                <div>
          <h2 className="text-xl font-bold mb-4">Comments ({comments.length})</h2>
          <form onSubmit={handleComment} className="mb-6 space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md"
              required
            />
            <textarea
              placeholder="Write a comment..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-all"
            >
              Post Comment
            </button>
          </form>

          <div className="space-y-8">
            {comments.length === 0 ? (
              <p className="text-gray-500">No comments yet. Be the first!</p>
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

        {/* Related Posts */}
        {Array.isArray(relatedPosts) && relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Related Posts</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {relatedPosts.map((related, index) => (
                <motion.a
                  key={index}
                  href={`/post/${related.slug}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform overflow-hidden"
                >
                  <img
                    src={related.image}
                    alt={related.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                       {related.views || 0} views
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Trending */}
      <aside className="w-full lg:w-80 flex-shrink-0 mt-8 lg:mt-0">
        <h3 className="text-xl font-bold mb-4">Most Trending</h3>

        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={async (e) => {
              const query = e.target.value;
              setSearchQuery(query);

              if (!query.trim()) {
                setSearchResults([]);
                return;
              }

              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`);
                const data = await res.json();
                const allPosts = data.posts || data;

                const filtered = allPosts.filter((p: any) => {
                  const lower = query.toLowerCase();
                  return (
                    p.title?.toLowerCase().includes(lower) ||
                    p.keywords?.some((k: string) => k.toLowerCase().includes(lower))
                  );
                });

                setSearchResults(filtered.slice(0, 6));
              } catch (err) {
                console.error("Search failed:", err);
              }
            }}
            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {searchResults.length > 0 && (
            <div className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-md mt-1 w-full max-h-64 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <a
                  key={idx}
                  href={`/post/${result.slug}`}
                  className="block px-3 py-2 hover:bg-amber-50 border-b last:border-none transition"
                >
                  <p className="text-gray-800 font-medium line-clamp-1">{result.title}</p>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {Array.isArray(result.keywords) ? result.keywords.join(", ") : ""}
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {trendingPosts.length > 0 ? (
            trendingPosts.map((t: any, idx: number) => (
              <motion.a
                key={idx}
                href={`/post/${t.slug}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="block bg-white p-3 rounded-md shadow hover:shadow-md hover:bg-amber-50 transition-all"
              >
                <h4 className="font-semibold text-gray-800 line-clamp-2">{t.title}</h4>
                <p className="text-sm text-gray-500"> {t.views || 0} views</p>
              </motion.a>
            ))
          ) : (
            <p className="text-gray-500">No trending posts found.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

// RECURSIVE COMMENT THREAD — ONLY THIS IS ADDED
// LIMITED REPLIES + "VIEW MORE" — ONLY THIS IS NEW
const CommentWithLimitedReplies = ({ comment, postId, setComments }: { comment: any; postId: string; setComments: any }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyName, setReplyName] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [visibleReplies, setVisibleReplies] = useState(2); // Show only 2 at first

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
      setVisibleReplies(prev => prev + 1); // Show the new reply
    }
  };

  return (
    <div className="border-b pb-8 last:border-b-0">
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 border p-4 rounded-md"
      >
        <p className="font-semibold text-gray-800">{comment.name}</p>
        <p className="text-gray-600 mt-1">{comment.message}</p>

        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-sm text-blue-600 hover:text-blue-800 mt-3 font-medium"
        >
          {showReplyForm ? "Cancel" : "Reply"}
        </button>

        {showReplyForm && (
          <form onSubmit={submitReply} className="mt-4 space-y-3 bg-white p-4 rounded border">
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
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
            >
              Post Reply
            </button>
          </form>
        )}
      </motion.div>

      {/* Show only limited replies */}
      {shownReplies.length > 0 && (
        <div className="ml-10 mt-4 space-y-4">
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

      {/* "View more replies" button */}
      {hasMore && (
        <div className="ml-10 mt-3">
          <button
            onClick={() => setVisibleReplies(prev => Math.min(prev + 2, totalReplies))}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
          >
            View {totalReplies - visibleReplies} more {totalReplies - visibleReplies === 1 ? "reply" : "replies"} →
          </button>
        </div>
      )}

      {/* Show total count if more than 2 */}
      {totalReplies > 2 && visibleReplies === 2 && (
        <div className="ml-10 mt-2 text-sm text-gray-500">
          {totalReplies} {totalReplies === 1 ? "reply" : "replies"} total
        </div>
      )}
    </div>
  );
};