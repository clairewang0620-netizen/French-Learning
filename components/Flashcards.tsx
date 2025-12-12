import React, { useState, useMemo } from 'react';
import { Volume2, RotateCw, CheckCircle2, XCircle } from 'lucide-react';

const Flashcards = ({ words }) => {
  const [viewMode, setViewMode] = useState('list');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });

  const filteredWords = useMemo(() => words, [words]);
  const currentWord = filteredWords[currentIndex];

  const playAudio = async (e, text) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error("TTS 请求失败");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error("playAudio 捕获错误:", err);
    }
  };

  const handleNext = (correct) => {
    if (correct) setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    else setSessionStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));

    setIsFlipped(false);
    if (currentIndex < filteredWords.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
    } else {
      alert(`本组练习完成！\n正确: ${sessionStats.correct + (correct ? 1 : 0)}\n需复习: ${sessionStats.wrong + (correct ? 0 : 1)}`);
      setViewMode('list');
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <h2 className="text-2xl mb-4">单词列表</h2>
        <ul>
          {filteredWords.map((word, idx) => (
            <li key={word.id} className="flex justify-between items-center border-b py-2">
              <span>{word.french} - {word.chinese}</span>
              <div>
                <button onClick={(e) => playAudio(e, word.french)} className="mr-2">
                  <Volume2 size={20} />
                </button>
                <button onClick={() => { setCurrentIndex(idx); setViewMode('study'); setIsFlipped(false); setSessionStats({ correct: 0, wrong: 0 }); }}>
                  开始学习
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!currentWord) return <div className="p-8 text-center">加载中...</div>;

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-4">
      <div className={`relative w-full h-64 p-6 border rounded-lg shadow-lg bg-white flex flex-col justify-center items-center ${isFlipped ? 'rotate-y-180' : ''}`}>
        <h3 className="text-3xl mb-4">{isFlipped ? currentWord.chinese : currentWord.french}</h3>
        <button onClick={(e) => playAudio(e, currentWord.french)} className="mb-2">
          <Volume2 size={24} />
        </button>
        <button onClick={() => setIsFlipped(prev => !prev)} className="mb-2 border px-4 py-1 rounded">
          翻转
        </button>
        <div className="flex gap-4 mt-4">
          <button onClick={() => handleNext(true)} className="border px-4 py-1 rounded flex items-center gap-1 text-green-600">
            <CheckCircle2 /> 正确
          </button>
          <button onClick={() => handleNext(false)} className="border px-4 py-1 rounded flex items-center gap-1 text-red-600">
            <XCircle /> 错误
          </button>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
