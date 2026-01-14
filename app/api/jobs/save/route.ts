import { autoSubmitIndexNow } from "@/lib/autoIndexNow";

export async function POST(req: Request) {
  const data = await req.json();

  // Create or update job
  const oldJob = data.id
    ? await db.job.findUnique({ where: { id: data.id } })
    : null;

  const job = data.id
    ? await db.job.update({ where: { id: data.id }, data })
    : await db.job.create({ data });

  // ✅ Auto IndexNow
  await autoSubmitIndexNow({
    id: job.id,
    slug: job.slug,
    status: job.status,
    oldStatus: oldJob?.status,
    type: "job",
    indexNowSubmitted: job.indexNowSubmitted,
  });

  // Optional: mark as submitted
  if (job.status === "active" && !job.indexNowSubmitted) {
    await db.job.update({
      where: { id: job.id },
      data: { indexNowSubmitted: true },
    });
  }

  return Response.json({ success: true });
}
