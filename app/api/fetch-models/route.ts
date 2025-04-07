import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { endpoint } = await req.json();

  if (!process.env.LILYPAD_API_KEY) {
    return NextResponse.json({ error: "Missing Lilypad API key" }, { status: 500 });
  }

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LILYPAD_API_KEY}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Lilypad API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data.data.models); // handles both formats
  } catch (error) {
    console.error("[Lilypad Fetch Models Error]", error);
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
  }
}
