// 简单的内存缓存
const audioCache: Record<string, string> = {};

/**
 * 播放法语 TTS
 * @param text 要朗读的文本
 */
export const playTTS = async (text: string) => {
  if (!text) return;

  try {
    // 1. 检查缓存
    if (audioCache[text]) {
      const audio = new Audio(audioCache[text]);
      await audio.play();
      return;
    }

    // 2. 请求后端 API
    console.log("Requesting TTS for:", text);
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TTS API Error (${response.status}):`, errorText);
      throw new Error(`TTS API failed: ${response.status}`);
    }

    // 3. 处理音频流
    const blob = await response.blob();
    if (blob.size < 100) {
        throw new Error("Audio blob too small, likely error");
    }
    const audioUrl = URL.createObjectURL(blob);
    
    // 4. 存入缓存
    audioCache[text] = audioUrl;

    // 5. 播放
    const audio = new Audio(audioUrl);
    await audio.play();

  } catch (error) {
    console.error('Frontend TTS Playback Error:', error);
    // 最后的降级：浏览器原生（在Safari上可能发英语，但总比没声音好）
    if ('speechSynthesis' in window) {
        console.warn("Falling back to browser speech synthesis");
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR'; 
        window.speechSynthesis.speak(utterance);
    } else {
        alert("无法播放音频，请检查网络连接");
    }
  }
};