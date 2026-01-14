import { NextResponse } from "next/server";

const INDEXNOW_KEY = process.env.INDEXNOW_KEY!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.krevv.com";

export async function POST(req: Request) {
  try {
    const { slug, action } = await req.json();

    if (!slug) {
      return NextResponse.json(
        { error: "Post slug is required" },
        { status: 400 }
      );
    }

    // Only blog post URLs
    const postUrl = `${SITE_URL}/post/${slug}`;

    const payload = {
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      urlList: [postUrl],
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
      url: postUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "IndexNow post ping failed" },
      { status: 500 }
    );
  }
}
