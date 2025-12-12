// functions/api/tts.js
// Pages Function: POST { text: "Bonjour" } -> 返回法语 mp3 音频
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const text = (body && body.text) ? String(body.text) : "";
    if (!text) return new Response("Missing text", { status: 400 });

    // 缓存键（简单实现）
    const key = `tts:${btoa(text).slice(0,64)}`;

    // 如果设置了 KV 绑定 TTS_CACHE，优先返回缓存
    if (env && env.TTS_CACHE) {
      const cached = await env.TTS_CACHE.get(key, { type: "arrayBuffer" });
      if (cached) {
        return new Response(cached, {
          headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=2592000" }
        });
      }
    }

    let audioBuffer;

    // 优先尝试 Cloudflare AI（如果你的账号已支持并绑定 env.AI）
    if (env && env.AI && typeof env.AI.run === "function") {
      const resp = await env.AI.run("@cf/openai/tts-1", {
        model: "gpt-4o-mini-tts",
        input: text,
        voice: "alloy",
        format: "mp3"
      });
      // 某些返回类型可直接转 arrayBuffer
      audioBuffer = await (resp.arrayBuffer ? resp.arrayBuffer() : resp);
    } else {
      // Fallback 到第三方 TTS（示例：ElevenLabs / 其它）
      // 你必须在 Pages 的 Settings -> Environment variables 添加 TTS_PROVIDER_API_KEY
      const providerKey = env.TTS_PROVIDER_API_KEY || "";
      if (!providerKey) {
        return new Response("No TTS provider configured", { status: 502 });
      }

      // 下面示例为通用 POST 请求，请根据你选的服务调整 headers/body
      const providerResp = await fetch("https://api.elevenlabs.io/v1/text-to-speech/fr-FR", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": providerKey
        },
        body: JSON.stringify({
          text,
          voice: "alloy", // provider-specific
          format: "mp3"
        }),
      });

      if (!providerResp.ok) {
        const txt = await providerResp.text();
        return new Response("TTS provider error: " + txt, { status: 502 });
      }
      audioBuffer = await providerResp.arrayBuffer();
    }

    // 写入 KV（如果绑定）
    if (env && env.TTS_CACHE && audioBuffer) {
      await env.TTS_CACHE.put(key, audioBuffer);
    }

    return new Response(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=2592000" }
    });
  } catch (err) {
    return new Response("Server error: " + String(err), { status: 500 });
  }
}
