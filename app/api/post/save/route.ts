import { autoSubmitIndexNow } from "@/lib/autoIndexNow";

export async function POST(req: Request) {
  const data = await req.json();

  const oldPost = data.id
    ? await db.post.findUnique({ where: { id: data.id } })
    : null;

  const post = data.id
    ? await db.post.update({ where: { id: data.id }, data })
    : await db.post.create({ data });

  await autoSubmitIndexNow({
    id: post.id,
    slug: post.slug,
    status: post.status,
    oldStatus: oldPost?.status,
    type: "blog",
    indexNowSubmitted: post.indexNowSubmitted,
  });

  if (post.status === "published" && !post.indexNowSubmitted) {
    await db.post.update({
      where: { id: post.id },
      data: { indexNowSubmitted: true },
    });
  }

  return Response.json({ success: true });
}
