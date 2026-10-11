import { NextRequest, NextResponse } from "next/server";
import { findPretrainedResponse, SARPANCH_SYSTEM_PROMPT } from "@/lib/sarpanch-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = (body.message || "").trim();
    const history = Array.isArray(body.history) ? body.history : [];
    const lang = body.lang === "en" ? "en" : "hi";

    if (!message) {
      return NextResponse.json(findPretrainedResponse(""));
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    // If Groq API key is present, attempt generative AI via Groq (Llama 3.3 70B)
    if (groqApiKey && groqApiKey.trim().length > 10) {
      try {
        const messages = [
          {
            role: "system",
            content: `${SARPANCH_SYSTEM_PROMPT}\n\nUser preferred language: ${lang === "hi" ? "Hindi (हिन्दी)" : "English"}. Respond primarily in ${lang === "hi" ? "warm, respectful, accessible Hindi" : "helpful English"} with bullet points.`,
          },
          ...history.slice(-4), // keep last 4 context turns
          {
            role: "user",
            content: message,
          },
        ];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000); // 9 sec timeout for rapid response

        const groqModel = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqApiKey.trim()}`,
          },
          body: JSON.stringify({
            model: groqModel,
            messages,
            temperature: 0.6,
            max_tokens: 650,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (groqRes.ok) {
          const data = await groqRes.json();
          const reply = data.choices?.[0]?.message?.content?.trim();

          if (reply) {
            // Determine relevant deep-link suggestion based on reply and message content
            const lowerMsg = (message + " " + reply).toLowerCase();
            let suggested_action = undefined;

            if (lowerMsg.includes("crop") || lowerMsg.includes("doctor") || lowerMsg.includes("रोग") || lowerMsg.includes("बीमारी") || lowerMsg.includes("दवा") || lowerMsg.includes("रतुआ") || lowerMsg.includes("झुलसा")) {
              suggested_action = {
                label_hi: "📸 AI फसल डॉक्टर में फोटो जांचें",
                label_en: "📸 Check AI Crop Doctor",
                href: "/crop-doctor",
              };
            } else if (lowerMsg.includes("mandi") || lowerMsg.includes("मंडी") || lowerMsg.includes("भाव") || lowerMsg.includes("दाम") || lowerMsg.includes("rate")) {
              suggested_action = {
                label_hi: "⚖️ आज के लाइव मंडी भाव देखें",
                label_en: "⚖️ View Live Mandi Rates",
                href: "/mandi",
              };
            } else if (lowerMsg.includes("yojana") || lowerMsg.includes("scheme") || lowerMsg.includes("योजना") || lowerMsg.includes("kisan") || lowerMsg.includes("kcc") || lowerMsg.includes("बीमा")) {
              suggested_action = {
                label_hi: "🏛️ सरकारी योजनाएं पोर्टल खोलें",
                label_en: "🏛️ Open Schemes Portal",
                href: "/schemes",
              };
            } else if (lowerMsg.includes("panchayat") || lowerMsg.includes("vikas") || lowerMsg.includes("road") || lowerMsg.includes("sadak") || lowerMsg.includes("सड़क") || lowerMsg.includes("विकास") || lowerMsg.includes("बजट")) {
              suggested_action = {
                label_hi: "🏗️ गांव के विकास कार्य देखें",
                label_en: "🏗️ View Village Works",
                href: "/village-development",
              };
            }

            return NextResponse.json({
              answer_hi: reply,
              answer_en: reply,
              suggested_action,
              source: "groq_llm",
            });
          }
        }
      } catch {
        // Quiet fail-safe: activate pretrained agronomy model
      }
    }

    // Fail-safe / No API key mode: Use pre-trained village knowledge engine
    const fallbackResponse = findPretrainedResponse(message);
    return NextResponse.json(fallbackResponse);
  } catch (error: any) {
    console.error("Copilot route error, serving bulletproof fallback:", error);
    return NextResponse.json(findPretrainedResponse(""));
  }
}
