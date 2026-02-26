import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      host: "krevv.com",
      key: "fa8248d8b0224bd89c5693b7035a0fde",
      keyLocation: "https://krevv.com/fa8248d8b0224bd89c5693b7035a0fde.txt",
      urlList: body.urlList,
    }),
  });

  return NextResponse.json({ success: res.ok });
}
