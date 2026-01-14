import { autoSubmitIndexNow } from "@/lib/autoIndexNow";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // 👈 REQUIRED

export async function POST(req: Request) {
  const body = await req.json();

  const oldPost = body.id
    ? await prisma.blog.findUnique({ where: { id: body.id } })
    : null;

  const post = body.id
    ? await prisma.blog.update({
        where: { id: body.id },
        data: body,
      })
    : await prisma.blog.create({
        data: body,
      });

  await autoSubmitIndexNow({
    slug: post.slug,
    status: post.status,
    oldStatus: oldPost?.status,
    type: "blog",
  });

  return Response.json({ success: true });
}
