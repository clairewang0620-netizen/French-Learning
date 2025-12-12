// functions/api/tts.js
export async function onRequest(context) {
  const { request, env } = context;
  try {
    const { text } = await request.json();
    if (!text) return new Response(JSON.stringify({ error: 'Missing text' }), { status: 400 });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/text:synthesize?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: 'fr-FR', name: 'fr-FR-Wavenet-A' },
          audioConfig: { audioEncoding: 'MP3' }
        })
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: errText }), { status: 500 });
    }

    const data = await res.json();
    const audioContent = data.audioContent; // base64

    const audioBuffer = Uint8Array.from(atob(audioContent), (c) => c.charCodeAt(0));
    return new Response(audioBuffer, { headers: { 'Content-Type': 'audio/mpeg' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
