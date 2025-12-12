// functions/api/tts.js
export async function onRequest(context) {
  const { request, env } = context;

  try {
    const { text } = await request.json();
    if (!text) {
      return new Response(JSON.stringify({ error: "Missing text" }), { status: 400 });
    }

    // Gemini TTS API URL
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

    const body = {
      prompt: [
        {
          content: text,
          type: "TEXT"
        }
      ],
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 1.0,
        pitch: 0,
        voice: "fr-FR"  // 强制法语发音
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

    // Gemini 返回 Base64
    const audioBase64 = data?.candidates?.[0]?.audio?.audioContent;
    if (!audioBase64) throw new Error("No audio returned from Gemini");

    // 转为 ArrayBuffer
    const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));

    return new Response(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
