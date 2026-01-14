type IndexableContent = {
  id: string;
  slug: string;
  status: string;
  oldStatus?: string;
  type: "job" | "post";
  indexNowSubmitted?: boolean;
};

export async function autoSubmitIndexNow(data: IndexableContent) {
  const { slug, status, oldStatus, type, indexNowSubmitted } = data;

  // ✅ Submit ONLY when content becomes active/published
  const isActive =
    (type === "job" && status === "active") ||
    (type === "post" && status === "published");

  const wasActive =
    (type === "job" && oldStatus === "active") ||
    (type === "post" && oldStatus === "published");

  if (!isActive || wasActive || indexNowSubmitted) return;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const url =
    type === "job"
      ? `${baseUrl}/jobs/${slug}`
      : `${baseUrl}/post/${slug}`;

  try {
    await fetch(`${baseUrl}/api/indexnow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urlList: [url],
      }),
    });
  } catch (err) {
    console.error("IndexNow submission failed:", err);
  }
}
