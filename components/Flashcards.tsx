import React, { useState, useMemo } from 'react';
import { Volume2, ArrowLeft, CheckCircle2, XCircle, Tag, Filter, List } from 'lucide-react';
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

  // 播放后端生成的 MP3
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
      alert("语音播放失败，请检查 API Key 或网络");
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
      alert(`本组练习完成！\n正确: ${sessionStats.correct + (correct ? 1 : 0)}\n需复习: ${sessionStats.wrong + (correct ? 0 : 1)}`);
      setViewMode('list');
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="w-full max-w-5xl mx-auto px-2 md:px-4">
        {/* 筛选栏 */}
        <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-xl border border-slate-100 shadow-sm mb-4">
          <Filter size={16} />
          <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)}>
            <option value="All">所有等级</option>
            <option value="A1">A1 - 基础</option>
            <option value="A2">A2 - 初级</option>
            <option value="B1">B1 - 中级</option>
            <option value="B2">B2 - 中高级</option>
            <option value="C1">C1 - 高级</option>
          </select>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* 单词列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((word, index) => (
            <div key={word.id} onClick={() => handleStartStudy(index)} className="p-4 border rounded cursor-pointer">
              <h3>{word.french}</h3>
              <p>{word.chinese}</p>
              <button onClick={e => playAudio(e, word.french)}><Volume2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentWord) return <div className="p-8 text-center text-slate-500">加载中...</div>;

  // Study 卡片视图
  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4">
      <div className="flex justify-between w-full mb-4">
        <button onClick={() => setViewMode('list')}><ArrowLeft size={20} /> 返回列表</button>
        <span>{currentIndex + 1} / {filteredWords.length}</span>
      </div>

      <div className="w-full h-64 bg-white border rounded p-4 flex flex-col items-center justify-center cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <h2 className="text-3xl mb-2">{currentWord.french}</h2>
        {isFlipped && <p className="text-xl">{currentWord.chinese}</p>}
        <button onClick={e => playAudio(e, currentWord.french)} className="mt-2">
          <Volume2 size={24} />
        </button>
      </div>

      <div className="flex gap-4 w-full mt-4">
        <button onClick={() => handleNext(false)}><XCircle size={20} /> 没记住</button>
        <button onClick={() => handleNext(true)}><CheckCircle2 size={20} /> 记住了</button>
      </div>
    </div>
  );
};

export default Flashcards;
