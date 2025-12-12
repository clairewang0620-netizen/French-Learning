// functions/api/tts.js
export async function onRequest(context) {
  const { request, env } = context;

  try {
    const { text } = await request.json();
    if (!text) {
      return new Response(JSON.stringify({ error: "Missing text" }), { status: 400 });
    }

    // Gemini TTS 正确 URL
    const url = "https://generativelanguage.googleapis.com/v1beta2/text:speech:synthesize";

    // 请求体格式（最新 Gemini TTS）
    const body = {
      input: { text },
      voice: {
        languageCode: "fr-FR",
        name: "fr-FR-Standard-A"
      },
      audioConfig: {
        audioEncoding: "MP3"
      }
    };

    const res = await fetch(`${url}?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: errText }), { status: 500 });
    }

    const data = await res.json();

    // data.audioContent 是 Base64
    const audioBase64 = data.audioContent;
    if (!audioBase64) throw new Error("No audio returned");

    const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));

    return new Response(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
