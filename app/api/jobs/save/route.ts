import { autoSubmitIndexNow } from "@/lib/autoIndexNow";
import { prisma } from "@/lib/prisma"; // 👈 REQUIRED

export const runtime = "nodejs"; // 👈 FIXES DEPLOYMENT

export async function POST(req: Request) {
  const body = await req.json();

  const oldJob = body.id
    ? await prisma.job.findUnique({ where: { id: body.id } })
    : null;

  const job = body.id
    ? await prisma.job.update({
        where: { id: body.id },
        data: body,
      })
    : await prisma.job.create({
        data: body,
      });

  await autoSubmitIndexNow({
    slug: job.slug,
    status: job.status,
    oldStatus: oldJob?.status,
    type: "job",
  });

  return Response.json({ success: true });
}
