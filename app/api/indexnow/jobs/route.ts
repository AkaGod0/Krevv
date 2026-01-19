import { NextResponse } from "next/server";

const INDEXNOW_KEY = process.env.INDEXNOW_KEY!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.krevv.com";

export async function POST(req: Request) {
  try {
    const { slug, action } = await req.json();

    if (!slug) {
      return NextResponse.json(
        { error: "Job slug is required" },
        { status: 400 }
      );
    }

    // Only allow job URLs
    const jobUrl = `${SITE_URL}/jobs/${slug}`;

    const payload = {
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      urlList: [jobUrl],
    };

    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("IndexNow ping failed");
    }

    return NextResponse.json({
      success: true,
      action,
      url: jobUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "IndexNow job ping failed" },
      { status: 500 }
    );
  }
}
