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
      key: "f13aba78e18948c2b26c078fdbfe0e3e",
      keyLocation: "https://krevv.com/f13aba78e18948c2b26c078fdbfe0e3e.txt",
      urlList: body.urlList,
    }),
  });

  return NextResponse.json({ success: res.ok });
}
