import React, { useState, useMemo, useEffect } from 'react';
import { Word, Level } from '../types';
import { Volume2, RotateCw, CheckCircle2, XCircle, Tag, Filter, List, ArrowLeft } from 'lucide-react';
import { markItemResult, getWordStatus } from '../services/storageService';

const Flashcards = ({ words }) => {
  const [viewMode, setViewMode] = useState('list');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });

  const filteredWords = useMemo(() => {
    return words.filter(w => {
      const matchLevel = selectedLevel === 'All' || w.level === selectedLevel;
      const matchCat = selectedCategory === 'All' || w.category === selectedCategory;
      return matchLevel && matchCat;
    });
  }, [words, selectedLevel, selectedCategory]);

  const currentWord = filteredWords[currentIndex];

  const categories = useMemo(() => {
    const cats = new Set(words.map(w => w.category));
    return ['All', ...Array.from(cats)];
  }, [words]);

  // 新：播放从后端返回的 MP3
  const playAudio = async (e, text) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error("TTS请求失败");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartStudy = index => {
    setCurrentIndex(index);
    setViewMode('study');
    setIsFlipped(false);
    setSessionStats({ correct: 0, wrong: 0 });
  };

  const handleNext = correct => {
    markItemResult(currentWord.id, 'word', correct);
    if (correct) setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    else setSessionStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));

    setIsFlipped(false);
    if (currentIndex < filteredWords.length - 1) setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    else {
      alert(`本组练习完成！\n正确: ${sessionStats.correct + (correct?1:0)}\n需复习: ${sessionStats.wrong + (correct?0:1)}`);
      setViewMode('list');
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="w-full max-w-5xl mx-auto px-2 md:px-4">
        {/* 筛选与单词列表 */}
        {/* ...省略，与原来 list 视图一致，只需在音量按钮 onClick 调用 playAudio */}
        {/* 例如：<button onClick={(e) => playAudio(e, word.french)} /> */}
      </div>
    );
  }

  if (!currentWord) return <div className="p-8 text-center text-slate-500">加载中...</div>;

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4">
      {/* Card 视图 */}
      {/* 点击音量按钮时 */}
      <button onClick={(e) => playAudio(e, currentWord.french)}>
        <Volume2 size={24} />
      </button>
      {/* 其他 Card 内容保持不变 */}
    </div>
  );
};

export default Flashcards;
