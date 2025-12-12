// functions/api/tts.js
export async function onRequest({ request, env }) {
  try {
    const { text } = await request.json();
    if (!text) return new Response(JSON.stringify({ error: "Missing text" }), { status: 400 });

    const res = await fetch("https://aistudio.google.com/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.AI_STUDIO_API_KEY}`
      },
      body: JSON.stringify({
        text,
        voice: "fr-FR",  // 法语发音
        format: "mp3"
      })
    });

    if (!res.ok) {
      const textErr = await res.text();
      return new Response(JSON.stringify({ error: textErr }), { status: 500 });
    }

    const arrayBuffer = await res.arrayBuffer();
    return new Response(arrayBuffer, { headers: { "Content-Type": "audio/mpeg" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
