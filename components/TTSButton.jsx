// components/TTSButton.jsx
import React from "react";

/**
 * props:
 *  - text: 要发音的文字
 *  - className: 按钮样式（可选）
 */
export default function TTSButton({ text, className = "" }) {
  const handlePlay = async () => {
    if (!text) return;
    try {
      // 调用 Pages Functions
      const resp = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!resp.ok) {
        console.error("TTS API error", await resp.text());
        return;
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);

      let audio = document.getElementById("__tts_audio__");
      if (!audio) {
        audio = document.createElement("audio");
        audio.id = "__tts_audio__";
        document.body.appendChild(audio);
      } else {
        audio.pause();
        audio.src = "";
      }

      audio.src = url;
      // Safari 要求由用户交互触发，确保这里是点击事件
      const p = audio.play();
      if (p && typeof p.catch === "function") {
        p.catch(err => {
          console.warn("Play prevented", err);
        });
      }
      audio.onended = () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error("playTTS error", e);
    }
  };

  return (
    <button className={className} onClick={handlePlay} aria-label={`播放 ${text}`}>
      🔊
    </button>
  );
}
