import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { endpoint, category } = await req.json();

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
    const returnedData = category === 'image' ?
      data.data.models :
      data.data

    return NextResponse.json(returnedData);
  } catch (error) {
    console.error("[Lilypad Fetch Models Error]", error);
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
  }
}
