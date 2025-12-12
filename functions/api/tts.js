export async function onRequestPost({ request, env }) {
  try {
    const { text } = await request.json();
    const apiKey = env.GEMINI_API_KEY;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: `请生成法语 TTS MP3 音频，文本为: ${text}` }
          ]
        }
      ],
      generationConfig: {
        audioConfig: {
          audioEncoding: "MP3"
        }
      }
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    const audioBase64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioBase64) {
      return new Response(JSON.stringify({ error: "生成失败" }), { status: 500 });
    }

    const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));

    return new Response(audioBytes, {
      headers: { "Content-Type": "audio/mpeg" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
