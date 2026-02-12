// /src/app/api/ai/meal-macros/route.ts
import { NextResponse } from "next/server";

type ReqBody = { text: string };

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 400 });
    }

    const body = (await req.json()) as ReqBody;
    const text = (body?.text || "").trim();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    // Tool schema (function calling)
    const tools = [
      {
        type: "function",
        function: {
          name: "set_meal_macros",
          description:
            "Estimate meal macros from a short food description. Return numeric kcal, protein_g, fat_g, carbs_g. Use best effort; if uncertain, make conservative estimates.",
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              kcal: { type: "number" },
              protein_g: { type: "number" },
              fat_g: { type: "number" },
              carbs_g: { type: "number" },
              confidence: { type: "number", description: "0..1 confidence" },
              notes: { type: "string", description: "Short reasoning for user/debug (1 sentence max)" },
            },
            required: ["kcal", "protein_g", "fat_g", "carbs_g", "confidence"],
          },
        },
      },
    ];

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    const payload = {
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a nutrition assistant. Estimate calories and macros from food text. Output only via the provided tool. If the user gives no portion sizes, assume a typical serving. Do not give medical advice.",
        },
        {
          role: "user",
          content: `Food: ${text}\nReturn estimated macros.`,
        },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "set_meal_macros" } },
      temperature: 0.2,
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await r.json();

    if (!r.ok) {
      return NextResponse.json({ error: json?.error?.message || "OpenAI request failed" }, { status: 500 });
    }

    const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = toolCall?.function?.arguments;

    if (!argsRaw) {
      return NextResponse.json({ error: "No tool output from model" }, { status: 500 });
    }

    let args: any = null;
    try {
      args = JSON.parse(argsRaw);
    } catch {
      return NextResponse.json({ error: "Failed to parse tool output" }, { status: 500 });
    }

    const out = {
      kcal: Math.max(0, Math.round(Number(args.kcal) || 0)),
      p: Math.max(0, Math.round(Number(args.protein_g) || 0)),
      f: Math.max(0, Math.round(Number(args.fat_g) || 0)),
      c: Math.max(0, Math.round(Number(args.carbs_g) || 0)),
      confidence: Math.min(1, Math.max(0, Number(args.confidence) || 0)),
      notes: typeof args.notes === "string" ? args.notes : "",
    };

    return NextResponse.json(out);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}