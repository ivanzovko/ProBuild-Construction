import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Ključ nedostaje u .env.local" }, { status: 500 });
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
            content: `Ti si ProBuild AI asistent, stručnjak za korisničku podršku građevinske platforme ProBuild.hr.
            
            O TEBI:
            - Odgovaraj isključivo na HRVATSKOM jeziku.
            - Budi profesionalan, ali pristupačan i brz.
            - Tvoj cilj je pomoći korisnicima s informacijama o platformi.

            O PROBUILD PLATFORMI:
            - ProBuild povezuje klijente s najboljim građevinskim tvrtkama.
            - Korištenje za klijente je 100% BESPLATNO.
            - Tvrtke plaćaju pretplatu za uvrštavanje na listu.
            - Nudimo usluge: adaptacije, novogradnja, instalacije, krovovi, fasade itd.
            - Imamo sustav 'Live Tracking' za praćenje projekata u stvarnom vremenu.
            - Sigurnost: Koristimo AES-256 enkripciju za podatke korisnika.

            KONTAKT INFORMACIJE:
            - Email: support@probuild.hr
            - Telefon: +385 91 234 567
            - Radno vrijeme podrške: 08:00 - 16:00 (pon-pet).

            UPUTE:
            - Ako klijent pita kako zatražiti ponudu, reci mu da ode na stranicu 'Services' i klikne 'Inquiry'.
            - Ako pita za cijene tvojih usluga, objasni da je platforma besplatna za njih, a ponude dobivaju direktno od firmi.
            - Odgovaraj kratko, u maksimalno 2-3 rečenice.` 
          },
          { role: "user", content: lastMessage }
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: "Greška na AI servisu" }, { status: response.status });
    }

    const aiText = data.choices?.[0]?.message?.content || "Nažalost, trenutno nemam odgovor na to pitanje.";
    return NextResponse.json({ text: aiText });
  } catch (error) {
    return NextResponse.json({ error: "Interna greška servera" }, { status: 500 });
  }
}