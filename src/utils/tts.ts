
// 简单的内存缓存，防止重复点击时重复请求网络
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
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.error('TTS request failed');
      return;
    }

    // 3. 处理音频流
    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    
    // 4. 存入缓存
    audioCache[text] = audioUrl;

    // 5. 播放
    const audio = new Audio(audioUrl);
    
    // Safari 需要在用户交互（点击）的回调中直接调用 play，否则可能会被拦截
    // 我们这个函数通常是在 onClick 中调用的，所以可以正常工作
    await audio.play();

  } catch (error) {
    console.error('Error playing audio:', error);
    // 降级策略：如果网络失败，才尝试浏览器原生（虽然可能发音不准，总比没声音好）
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        window.speechSynthesis.speak(utterance);
    }
  }
};
