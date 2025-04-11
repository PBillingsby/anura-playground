import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      model,
      messages,
      temperature = 0.7,
      max_tokens,
      inputValue,
      category,
      number_of_results = 3,
    }: {
      model: string;
      messages?: any[];
      temperature?: number;
      max_tokens?: number;
      inputValue?: string;
      category: "chat" | "image" | "webSearch";
      number_of_results?: number;
    } = body;

    switch (category) {
      case "image": {
        if (!inputValue) {
          return NextResponse.json({ error: "Missing inputValue" }, { status: 400 });
        }

        const res = await fetch("https://anura-testnet.lilypad.tech/api/v1/image/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.LILYPAD_API_KEY}`,
          },
          body: JSON.stringify({
            prompt: inputValue,
            model: model || "sdxl-turbo",
          }),
        });

        if (!res.ok) {
          const error = await res.text();
          throw new Error(`Image API error: ${error}`);
        }

        const blob = await res.blob();
        const buffer = Buffer.from(await blob.arrayBuffer()).toString("base64");
        const mime = res.headers.get("content-type") || "image/png";

        return NextResponse.json({
          image: `data:${mime};base64,${buffer}`,
        });
      }

      case "chat": {
        if (!Array.isArray(messages) || messages.length === 0) {
          return NextResponse.json({ error: "Missing messages" }, { status: 400 });
        }

        const res = await fetch("https://anura-testnet.lilypad.tech/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${process.env.LILYPAD_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens,
          }),
        });

        if (!res.ok) {
          const error = await res.text();
          throw new Error(`Chat API error: ${error}`);
        }

        const data = await res.json();
        const output = data.choices?.[0]?.message?.content;

        if (!output) {
          throw new Error("Invalid response format from chat API.");
        }

        return NextResponse.json({ output });
      }

      case "webSearch": {
        if (!inputValue) {
          return NextResponse.json({ error: "Missing inputValue (query)" }, { status: 400 });
        }

        const res = await fetch("https://anura-testnet.lilypad.tech/api/v1/websearch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.LILYPAD_API_KEY}`,
          },
          body: JSON.stringify({
            query: inputValue,
            number_of_results,
          }),
        });

        if (!res.ok) {
          const error = await res.text();
          throw new Error(`Websearch API error: ${error}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json({ error: "Unsupported category" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Run-job error:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
