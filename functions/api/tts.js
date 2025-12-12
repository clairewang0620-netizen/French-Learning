// functions/api/tts.js
// Cloudflare Pages Function: respond to POST { text: "Bonjour" } and return mp3 audio
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const text = (body && body.text) ? String(body.text) : "";
    if (!text) return new Response("Missing text", { status: 400 });

    // Optional: use KV to cache mp3 by hash to avoid repeated TTS generation
    // Requires you to create and bind a KV namespace named TTS_CACHE in Pages settings.
    const hash = btoa(text).slice(0, 64); // simple key (ok for demo)

    if (env && env.TTS_CACHE) {
      const cached = await env.TTS_CACHE.get(hash, { type: "arrayBuffer" });
      if (cached) {
        return new Response(cached, {
          headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=2592000" },
        });
      }
    }

    // === Cloudflare AI TTS (example) ===
    // NOTE: adjust to the actual API available on your Cloudflare account.
    // If you do not have Cloudflare AI, you can swap to another TTS provider (ElevenLabs, Google TTS, etc.)
    // This example presumes an environment binding `AI` (Cloudflare's AI invokable) or uses fetch to a provider.

    // Example: call Cloudflare AI via environment (if available).
    // If your account does not provide env.AI.run, use fetch to external TTS provider here.
    let audioBuffer;
    if (env && env.AI && typeof env.AI.run === "function") {
      // If you have Cloudflare AI extension available
      const resp = await env.AI.run("@cf/openai/tts-1", {
        model: "gpt-4o-mini-tts",
        input: text,
        voice: "alloy",
        format: "mp3"
      });
      // resp is ArrayBuffer or similar -- convert to ArrayBuffer if needed
      audioBuffer = await resp.arrayBuffer?.() ?? resp;
    } else {
      // Fallback: example for using an external TTS endpoint you control (e.g., a paid TTS provider)
      // Replace PROVIDER_TTS_ENDPOINT and API_KEY with your provider details.
      const providerResp = await fetch("https://api.your-tts-provider.example/v1/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.TTS_PROVIDER_API_KEY ?? ""}`
        },
        body: JSON.stringify({
          text,
          voice: "fr-FR",
          format: "mp3",
          // provider-specific options...
        }),
      });
      if (!providerResp.ok) {
        const txt = await providerResp.text();
        return new Response("TTS provider error: " + txt, { status: 502 });
      }
      audioBuffer = await providerResp.arrayBuffer();
    }

    // Save to KV (if available)
    if (env && env.TTS_CACHE && audioBuffer) {
      // env.TTS_CACHE.put requires base64 or ArrayBuffer via special option in Worker; for Pages Functions use binary buffer
      await env.TTS_CACHE.put(hash, audioBuffer);
    }

    return new Response(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=2592000" },
    });

  } catch (err) {
    return new Response("Server error: " + String(err), { status: 500 });
  }
}
