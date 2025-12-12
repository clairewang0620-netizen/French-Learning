import React, { useState, useMemo } from 'react';
import { Volume2 } from 'lucide-react';
import { markItemResult } from '../services/storageService';

const Flashcards = ({ words }) => {
  const [viewMode, setViewMode] = useState('list');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const filteredWords = useMemo(() => words, [words]);
  const currentWord = filteredWords[currentIndex];

  const playAudio = async (text) => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('TTS 请求失败');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error('playAudio 捕获错误:', err);
    }
  };

  const handleNext = (correct) => {
    markItemResult(currentWord.id, 'word', correct);
    setIsFlipped(false);
    if (currentIndex < filteredWords.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setViewMode('list');
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="flashcard-list">
        {filteredWords.map((word, idx) => (
          <div key={word.id}>
            <span>{word.french}</span>
            <button onClick={() => playAudio(word.french)}>
              <Volume2 />
            </button>
            <button onClick={() => setCurrentIndex(idx) & setViewMode('study')}>
              学习
            </button>
          </div>
        ))}
      </div>
    );
  }

  if (!currentWord) return <div>加载中...</div>;

  return (
    <div className="flashcard-study">
      <div className={`card ${isFlipped ? 'flipped' : ''}`}>
        <div className="front">{currentWord.french}</div>
        <div className="back">{currentWord.chinese}</div>
      </div>
      <button onClick={() => setIsFlipped(!isFlipped)}>翻转</button>
      <button onClick={() => playAudio(currentWord.french)}>播放发音</button>
      <button onClick={() => handleNext(true)}>正确</button>
      <button onClick={() => handleNext(false)}>错误</button>
    </div>
  );
};

export default Flashcards;
