interface Env {
  AI: any;
}

export const onRequestPost = async (context: any) => {
  const { request, env } = context;

  try {
    let text = "";
    try {
      const body = await request.json() as { text: string };
      text = body.text;
    } catch (e) {
      return new Response("Invalid JSON body", { status: 400 });
    }

    if (!text) {
      return new Response("Text is required", { status: 400 });
    }

    // --- STRATEGY 1: Cloudflare Workers AI (Preferred) ---
    // Requires 'AI' binding in Cloudflare Dashboard -> Pages -> Settings -> Functions
    if (env.AI) {
      try {
        // Using a model known for decent multilingual support
        // Note: Specific French optimization varies by model, but this is the native way
        const response = await env.AI.run("@cf/openai/tts-1", {
            text: text,
            voice: "alloy", // or 'shimmer', 'onyx', etc.
            format: "mp3"
        });
        
        return new Response(response, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Source": "Cloudflare-AI"
          }
        });
      } catch (aiError) {
        console.error("Cloudflare AI failed, falling back to Google:", aiError);
        // Fall through to strategy 2
      }
    }

    // --- STRATEGY 2: Google TTS (Fallback) ---
    // Robust fallback for when AI is not configured or fails
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=fr&client=tw-ob`;

    const ttsResponse = await fetch(googleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://translate.google.com/"
      }
    });

    if (!ttsResponse.ok) {
        throw new Error(`Google TTS returned status: ${ttsResponse.status}`);
    }

    const audioBlob = await ttsResponse.blob();

    return new Response(audioBlob, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Source": "Google-Fallback"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};