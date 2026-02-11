import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing in .env.local" }, { status: 500 });
    }

    const lastMessage = messages[messages.length - 1].content;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `You are ProBuild AI Assistant, a customer support expert for the construction platform ProBuild.hr.
            
            ABOUT YOU:
            - Respond exclusively in ENGLISH.
            - Be professional, approachable, and quick.
            - Your goal is to help users with information about the platform.

            ABOUT PROBUILD PLATFORM:
            - ProBuild connects clients with the best construction companies.
            - Using the platform for clients is 100% FREE.
            - Companies pay a subscription to be listed.
            - Services offered: renovations, new construction, installations, roofing, facades, etc.
            - Features 'Live Tracking' for real-time project monitoring.
            - Security: We use AES-256 encryption for user data.

            CONTACT INFORMATION:
            - Email: pro.build.construction123@gmail.com
            - Phone: +385 91 234 567
            - Support Hours: 08:00 - 16:00 (Mon-Fri).

            INSTRUCTIONS:
            - If a client asks how to request a quote, tell them to go to the 'Services' page and click 'Inquiry'.
            - If they ask about pricing, explain that the platform is free for clients and quotes come directly from companies.
            - Keep responses short, maximum 2-3 sentences.` 
          },
          { role: "user", content: lastMessage }
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: "AI Service Error" }, { status: response.status });
    }

    const aiText = data.choices?.[0]?.message?.content || "Unfortunately, I don't have an answer to that right now.";
    return NextResponse.json({ text: aiText });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}