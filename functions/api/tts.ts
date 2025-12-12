
interface Env {
  // 如果未来需要使用 KV 或 D1，可以在这里定义
}

export const onRequestPost = async (context: any) => {
  try {
    const { request } = context;
    
    // 1. 解析请求体
    const body = await request.json() as { text: string };
    const text = body.text;

    if (!text) {
      return new Response("Text is required", { status: 400 });
    }

    // 2. 构建 Google TTS URL (使用法语 'fr' 引擎)
    // client=tw-ob 是 Google 公开的 TTS 接口参数
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=fr&client=tw-ob`;

    // 3. 伪装 User-Agent 请求 Google 服务器 (防止被拦截)
    const ttsResponse = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Referer": "https://translate.google.com/"
      }
    });

    if (!ttsResponse.ok) {
        throw new Error(`TTS Provider returned ${ttsResponse.status}`);
    }

    // 4. 获取音频流
    const audioBlob = await ttsResponse.blob();

    // 5. 返回音频流给前端
    return new Response(audioBlob, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable" // 强缓存，节省流量
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
