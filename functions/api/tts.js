// /functions/api/tts.js
export async function onRequest(context) {
  const { request, env } = context;

  try {
    const { text } = await request.json();
    if (!text) return new Response(JSON.stringify({ error: "Missing text" }), { status: 400 });

    // AI Studio 或 ElevenLabs TTS API
    const res = await fetch("https://aistudio.google.com/api/tts", {  // 如果是 ElevenLabs，请替换为它的 URL
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.GEMINI_API_KEY}` // 你在 Pages 设置的 Secret
      },
      body: JSON.stringify({
        text: text,
        voice: "fr-FR",   // 法语
        format: "mp3"
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: errText }), { status: 500 });
    }

    const blobBuffer = await res.arrayBuffer();

    return new Response(blobBuffer, {
      headers: {
        "Content-Type": "audio/mpeg"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
