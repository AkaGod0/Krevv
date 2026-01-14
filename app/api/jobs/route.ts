export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();

  const oldJob = body.id
    ? await prisma.job.findUnique({ where: { id: body.id } })
    : null;

  const job = body.id
    ? await prisma.job.update({ where: { id: body.id }, data: body })
    : await prisma.job.create({ data: body });

  // ✅ AUTO-SUBMIT ONLY WHEN IT BECOMES ACTIVE
  if (oldJob?.status !== "active" && job.status === "active") {
    await fetch("https://krevv.com/api/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urlList: [`https://krevv.com/jobs/${job.slug}`],
      }),
    });
  }

  return Response.json({ success: true });
}
