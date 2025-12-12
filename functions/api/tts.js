// functions/tts.js
export async function onRequest(context) {
  const { request, env } = context;

  try {
    const { text } = await request.json();
    if (!text) return new Response(JSON.stringify({ error: "Missing text" }), { status: 400 });

    // Gemini TTS API URL
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${env.AI_STUDIO_API_KEY}`;

    // 调用 Gemini 生成 MP3
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: { audioConfig: { audioEncoding: "MP3" } }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: errText }), { status: 500 });
    }

    const data = await res.json();

    // Gemini 返回的 audioContent（Base64）
    const audioBase64 = data?.candidates?.[0]?.audio?.audioUri || data?.candidates?.[0]?.audio?.audioContent;
    if (!audioBase64) throw new Error("No audio returned");

    // 转为 ArrayBuffer
    const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));

    return new Response(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
