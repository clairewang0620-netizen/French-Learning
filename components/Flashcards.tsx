import React, { useState, useMemo } from 'react';
import { Volume2, RotateCw, CheckCircle2, XCircle } from 'lucide-react';
import { markItemResult } from '../services/storageService';

const Flashcards = ({ words }) => {
  const [viewMode, setViewMode] = useState('list'); // list 或 study
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

  // 播放从后端返回的 TTS MP3
  const playAudio = async (e, text) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const responseText = await res.text();
      console.log('TTS 返回内容:', responseText);

      if (!res.ok) throw new Error("TTS请求失败");

      const audioBlob = new Blob([await res.arrayBuffer()], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error('playAudio 捕获错误:', err);
    }
  };

  const handleStartStudy = (index) => {
    setCurrentIndex(index);
    setViewMode('study');
    setIsFlipped(false);
    setSessionStats({ correct: 0, wrong: 0 });
  };

  const handleNext = (correct) => {
    markItemResult(currentWord.id, 'word', correct);
    if (correct) setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    else setSessionStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));

    setIsFlipped(false);
    if (currentIndex < filteredWords.length - 1) setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    else {
      alert(`本组练习完成！\n正确: ${sessionStats.correct + (correct ? 1 : 0)}\n需复习: ${sessionStats.wrong + (correct ? 0 : 1)}`);
      setViewMode('list');
    }
  };

  // 列表视图
  if (viewMode === 'list') {
    return (
      <div className="w-full max-w-5xl mx-auto px-2 md:px-4">
        <div className="flex justify-between my-4">
          <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
            <option>All</option>
            {[...new Set(words.map(w => w.level))].map(l => <option key={l}>{l}</option>)}
          </select>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <ul>
          {filteredWords.map((word, idx) => (
            <li key={word.id} className="flex justify-between items-center border p-2 my-1 rounded">
              <span>{word.french} - {word.english}</span>
              <div>
                <button onClick={(e) => playAudio(e, word.french)} className="mr-2">
                  <Volume2 size={20} />
                </button>
                <button onClick={() => handleStartStudy(idx)}>
                  学习
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // 学习卡片视图
  if (!currentWord) return <div className="p-8 text-center text-slate-500">加载中...</div>;

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4">
      <div className="border p-8 my-4 w-full rounded shadow text-center cursor-pointer"
           onClick={() => setIsFlipped(!isFlipped)}>
        <div className="text-2xl mb-4">{isFlipped ? currentWord.english : currentWord.french}</div>
        <button onClick={(e) => playAudio(e, currentWord.french)} className="mb-2">
          <Volume2 size={24} />
        </button>
      </div>
      <div className="flex space-x-4">
        <button onClick={() => handleNext(true)} className="px-4 py-2 bg-green-500 text-white rounded flex items-center">
          <CheckCircle2 size={20} className="mr-1"/> 正确
        </button>
        <button onClick={() => handleNext(false)} className="px-4 py-2 bg-red-500 text-white rounded flex items-center">
          <XCircle size={20} className="mr-1"/> 错误
        </button>
      </div>
      <div className="mt-4">当前进度: {currentIndex + 1} / {filteredWords.length}</div>
    </div>
  );
};

export default Flashcards;
