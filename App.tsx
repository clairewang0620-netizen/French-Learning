import { useState } from "react";

const words = [
  { word: "Bonjour", meaning: "你好" },
  { word: "Merci", meaning: "谢谢" },
  { word: "Au revoir", meaning: "再见" }
];

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const speak = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "fr-FR";
      window.speechSynthesis.speak(utterance);
    }
  };

  const showList = selectedIndex === null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">法语单词学习</h1>

      {showList ? (
        <ul className="w-full max-w-md bg-white rounded-xl shadow p-4 space-y-2">
          {words.map((w, idx) => (
            <li
              key={idx}
              className="cursor-pointer p-2 rounded hover:bg-blue-100"
              onClick={() => setSelectedIndex(idx)}
            >
              {w.word}
            </li>
          ))}
        </ul>
      ) : (
        <div className="w-full max-w-md bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">
            {words[selectedIndex].word}
          </h2>
          <p className="text-gray-700 mb-4">
            {words[selectedIndex].meaning}
          </p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            onClick={() => speak(words[selectedIndex].word)}
          >
            发音
          </button>
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={() => setSelectedIndex(null)}
          >
            返回列表
          </button>
        </div>
      )}
    </div>
  );
}
