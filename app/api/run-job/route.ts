// app/api/run-job/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { model, input, messages, inputValue } = body;
    
    // Check which type of request this is
    // 1. Image generation (has inputValue)
    // 2. Chat completion (has messages array)
    // 3. Standard text completion (has input)
    
    // 1. Handle image generation
    if (inputValue) {
      console.log("Image generation request:", { model, prompt: inputValue });
      
      const lilypadRes = await fetch("https://anura-testnet.lilypad.tech/api/v1/image/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.LILYPAD_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: inputValue,
          model: model || "sdxl-turbo", // Default to sdxl-turbo if no model specified
        }),
      });

      if (!lilypadRes.ok) {
        const text = await lilypadRes.text(); // fallback to raw response
        throw new Error(`Lilypad API Error: ${text}`);
      }

      const imageBlob = await lilypadRes.blob();
      const arrayBuffer = await imageBlob.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = lilypadRes.headers.get("content-type") || "image/png";

      return NextResponse.json({
        image: `data:${mimeType};base64,${base64Image}`,
      });
    }
    // 2. Handle chat completion
    else if (Array.isArray(messages) && messages.length > 0) {
      console.log("Chat completion request:", { 
        model, 
        messageCount: messages.length 
      });
      
      // Log the full messages array to help with debugging
      console.log("Processing chat messages:", JSON.stringify(messages));
      
      const res = await fetch("https://anura-testnet.lilypad.tech/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
          "Authorization": `Bearer ${process.env.LILYPAD_API_KEY}`,
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: 2048,
          temperature: 0.7
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API error:", errorText);
        return NextResponse.json({ 
          error: `API request failed: ${res.status} ${res.statusText}` 
        }, { 
          status: res.status 
        });
      }

      try {
        const data = await res.json();
        console.log("API response received:", data);
        
        // Ensure we're getting the correct format from the API
        const assistantResponse = data.choices?.[0]?.message?.content;
        
        if (!assistantResponse) {
          console.error("Unexpected API response format:", data);
          return NextResponse.json({
            error: "Unexpected response format from the model API"
          }, { status: 500 });
        }
        
        return NextResponse.json({
          output: assistantResponse
        });
      } catch (parseError) {
        console.error("Error parsing API response:", parseError);
        return NextResponse.json({
          error: "Failed to parse model response"
        }, { status: 500 });
      }
    }
    // 3. Handle standard text completion
    else {
      console.log("Standard completion request:", { model, input });
      
      const res = await fetch("https://anura-testnet.lilypad.tech/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
          "Authorization": `Bearer ${process.env.LILYPAD_API_KEY}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: input }],
          max_tokens: 2048,
          temperature: 0.7
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API error:", errorText);
        return NextResponse.json({ error: "Failed to process request" }, { status: res.status });
      }

      const data = await res.json();
      const assistantResponse = data.choices[0].message.content;
      
      return NextResponse.json({ output: assistantResponse });
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error processing request: ${error.message}` },
        { status: 500 }
      );
    }
  }
}