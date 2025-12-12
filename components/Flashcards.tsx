import React, { useState, useMemo, useEffect } from 'react';
import { Word, Level } from '../types';
import { Volume2, RotateCw, CheckCircle2, XCircle, Tag, Filter, List, ArrowLeft, AlertCircle } from 'lucide-react';
import { markItemResult, getWordStatus } from '../services/storageService';

interface FlashcardsProps {
  words: Word[];
}

const Flashcards: React.FC<FlashcardsProps> = ({ words }) => {
  const [viewMode, setViewMode] = useState<'list' | 'study'>('list');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
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


  // ---------------------------
  // 替换后的播放语音（后端 TTS）
  // Safari 100% 可用
  // ---------------------------
  const playAudio = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation();

    try {
      const url = `/api/tts?q=${encodeURIComponent(text)}`;
      const audio = new Audio(url);
      await audio.play();
    } catch (err) {
      console.error('Audio playback failed', err);
    }
  };


  const handleStartStudy = (index: number) => {
    setCurrentIndex(index);
    setViewMode('study');
    setIsFlipped(false);
    setSessionStats({ correct: 0, wrong: 0 });
  };

  const handleNext = (correct: boolean) => {
    markItemResult(currentWord.id, 'word', correct);

    if (correct) {
      setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setSessionStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }

    setIsFlipped(false);

    if (currentIndex < filteredWords.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    } else {
      alert(`本组练习完成！\n正确: ${sessionStats.correct + (correct ? 1 : 0)}\n需复习: ${sessionStats.wrong + (correct ? 0 : 1)}`);
      setViewMode('list');
    }
  };


  // --------- List View ---------
  if (viewMode === 'list') {
    return (
      <div className="w-full max-w-5xl mx-auto px-2 md:px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <List className="text-indigo-600" /> 单词列表
          </h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
            <select 
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-slate-50 rounded-lg px-3 py-2 text-sm"
            >
              <option value="All">所有等级</option>
              <option value={Level.A1}>A1 - 基础</option>
              <option value={Level.A2}>A2 - 初级</option>
              <option value={Level.B1}>B1 - 中级</option>
              <option value={Level.B2}>B2 - 中高级</option>
              <option value={Level.C1}>C1 - 高级</option>
            </select>

            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 rounded-lg px-3 py-2 text-sm"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'All' ? '所有分类' : c}</option>
              ))}
            </select>
          </div>
        </div>


        {/* Word list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((word, index) => {
            const status = getWordStatus(word.id);
            return (
              <div 
                key={word.id}
                onClick={() => handleStartStudy(index)}
                className="bg-white p-4 rounded-xl border border-slate-100 hover:border-indigo-300 transition cursor-pointer"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    {word.level}
                  </span>

                  {status && (
                    <span className="text-[10px] text-orange-600">
                      待复习 ({status.masteryLevel}/5)
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">{word.french}</h3>
                    <p className="text-slate-500 text-sm">{word.chinese}</p>
                  </div>

                  <button 
                    onClick={(e) => playAudio(e, word.french)}
                    className="p-2 text-slate-400 hover:text-indigo-600"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-400">
                  <Tag size={12} /> {word.category}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }


  // -------- Study mode ---------
  if (!currentWord) return <div className="p-8 text-center">加载中...</div>;

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4">

      {/* Navigation */}
      <div className="w-full flex justify-between items-center mb-6">
        <button 
          onClick={() => setViewMode('list')}
          className="text-slate-500 hover:text-indigo-600 flex items-center gap-2"
        >
          <ArrowLeft size={20} /> 返回列表
        </button>

        <span className="text-slate-400 text-sm">
          {currentIndex + 1} / {filteredWords.length}
        </span>
      </div>

      {/* Card */}
      <div 
        className="relative w-full h-[450px] cursor-pointer mb-8"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>

          {/* Front side */}
          <div className="absolute w-full h-full bg-white rounded-3xl shadow-xl p-8 backface-hidden">
            <h2 className="text-5xl font-bold text-center mb-6">{currentWord.french}</h2>

            <button 
              onClick={(e) => playAudio(e, currentWord.french)}
              className="p-3 bg-indigo-50 text-indigo-600 rounded-full"
            >
              <Volume2 size={24} />
            </button>

            <p className="absolute bottom-8 text-slate-400 text-sm flex items-center gap-2 animate-pulse">
              <RotateCw size={14} /> 点击翻转查看释义
            </p>
          </div>

          {/* Back side */}
          <div className="absolute w-full h-full bg-slate-900 rounded-3xl text-white p-8 rotate-y-180 backface-hidden">
            <h3 className="text-3xl font-bold mb-2">{currentWord.chinese}</h3>

            <p className="text-indigo-300 text-xl font-mono mb-4">{currentWord.ipa}</p>

            <p className="italic text-indigo-100 mb-2">"{currentWord.example}"</p>
            <p className="text-slate-400 text-sm">{currentWord.example_chinese}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 w-full max-w-md">
        <button 
          onClick={() => handleNext(false)}
          className="flex
