import type { NextRequest } from "next/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { messages, customization, sessionId } = await req.json()

    // Get API key from environment variables
    const apiKey = process.env.OPENROUTER_API_KEY

    console.log("API Key exists:", !!apiKey)
    console.log("API Key length:", apiKey?.length || 0)

    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not found in environment variables")
      return new Response("I'm sorry, the AI service is not properly configured. Please check the API key.", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    }

    // Build system prompt based on customization and consultant
    let systemPrompt = "You are a helpful AI assistant."

    if (customization?.consultantPrompt) {
      systemPrompt = customization.consultantPrompt
    } else if (customization?.role) {
      const rolePrompts = {
        teacher: "You are a knowledgeable and patient teacher. Explain concepts clearly and encourage learning.",
        poet: "You are a creative poet. Respond with artistic flair and use beautiful, expressive language.",
        doctor:
          "You are a medical professional. Provide helpful health information while emphasizing the importance of consulting real doctors.",
        mentor: "You are a wise mentor. Provide guidance, support, and encouragement to help others grow.",
        friend: "You are a caring friend. Be supportive, understanding, and conversational.",
        historian: "You are a knowledgeable historian. Share fascinating historical insights and context.",
        scientist:
          "You are a curious scientist. Approach topics with analytical thinking and evidence-based reasoning.",
        chef: "You are an experienced chef. Share culinary knowledge, recipes, and cooking tips.",
        therapist:
          "You are a supportive therapist. Listen actively and provide emotional support and coping strategies.",
        comedian: "You are a witty comedian. Use humor appropriately while still being helpful.",
      }
      systemPrompt = rolePrompts[customization.role as keyof typeof rolePrompts] || systemPrompt
    }

    if (customization?.tone) {
      const toneModifiers = {
        professional: " Maintain a professional and formal tone.",
        friendly: " Be warm, approachable, and conversational.",
        empathetic: " Be understanding, supportive, and emotionally aware.",
        direct: " Be straightforward, concise, and to-the-point.",
        encouraging: " Be motivational, positive, and confidence-building.",
        detailed: " Provide comprehensive, thorough explanations.",
      }
      systemPrompt += toneModifiers[customization.tone as keyof typeof toneModifiers] || ""
    }

    if (customization?.language && customization.language !== "english") {
      const languageInstructions = {
        arabic: " Respond in Arabic (العربية).",
        french: " Respond in French (Français).",
        yoruba: " Respond in Yoruba.",
        hausa: " Respond in Hausa.",
      }
      systemPrompt += languageInstructions[customization.language as keyof typeof languageInstructions] || ""
    }

    // Prepare messages for API
    const apiMessages = [{ role: "system", content: systemPrompt }, ...messages]

    console.log("Making request to OpenRouter API...")
    console.log("Using model: deepseek/deepseek-r1-0528:free")

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "AI Chatbot Platform",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528:free",
        messages: apiMessages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    console.log("OpenRouter response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenRouter API error:", response.status, errorText)

      // Return a helpful error message
      let errorMessage = "I'm having trouble connecting to the AI service. "

      if (response.status === 401) {
        errorMessage += "There seems to be an authentication issue. Please check the API key configuration."
      } else if (response.status === 429) {
        errorMessage += "The service is currently busy. Please try again in a moment."
      } else {
        errorMessage += "Please try again later."
      }

      return new Response(errorMessage, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response."

    console.log("AI Response received successfully")

    return new Response(aiResponse, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("I'm experiencing technical difficulties. Please try again.", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }
}
