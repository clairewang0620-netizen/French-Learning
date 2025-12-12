// components/Flashcards.jsx
import React, { useState, useMemo } from 'react';
import { Volume2, RotateCw, CheckCircle2, XCircle, Tag, Filter, List, ArrowLeft } from 'lucide-react';
import { markItemResult, getWordStatus } from '../services/storageService';
import { Level } from '../types';

const Flashcards = ({ words }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' 或 'study'
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });

  // 筛选单词
  const filteredWords = useMemo(() => {
    return words.filter(w => {
      const matchLevel = selectedLevel === 'All' || w.level === selectedLevel;
      const matchCat = selectedCategory === 'All' || w.category === selectedCategory;
      return matchLevel && matchCat;
    });
  }, [words, selectedLevel, selectedCategory]);

  const currentWord = filteredWords[currentIndex];

  // 分类选项
  const categories = useMemo(() => {
    const cats = new Set(words.map(w => w.category));
    return ['All', ...Array.from(cats)];
  }, [words]);

  // 播放 TTS 音频
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
    if (currentIndex < filteredWords.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    } else {
      alert(`本组练习完成！\n正确: ${sessionStats.correct + (correct ? 1 : 0)}\n需复习: ${sessionStats.wrong + (correct ? 0 : 1)}`);
      setViewMode('list');
    }
  };

  // ---------- 列表视图 ----------
  if (viewMode === 'list') {
    return (
      <div className="w-full max-w-5xl mx-auto px-2 md:px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <List className="text-indigo-600" /> 单词列表
          </h2>
          <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 px-2">
              <Filter size={16} />
            </div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-slate-50 border-transparent rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 hover:bg-slate-100 transition-colors"
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
              className="bg-slate-50 border-transparent rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 hover:bg-slate-100 transition-colors"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'All' ? '所有分类' : c}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 bg-white rounded-2xl border border-slate-100 p-12">
            <Filter size={48} className="mb-4 opacity-50" />
            <p className="text-xl font-medium">没有找到单词</p>
            <p className="text-sm opacity-75">请尝试切换筛选条件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map((word, index) => {
              const status = getWordStatus(word.id);
              return (
                <div
                  key={word.id}
                  onClick={() => handleStartStudy(index)}
                  className="bg-white p-4 rounded-xl border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      word.level.startsWith('A') ? 'bg-green-100 text-green-700' :
                      word.level.startsWith('B') ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {word.level}
                    </span>
                    {status && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        待复习 ({status.masteryLevel}/5)
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{word.french}</h3>
                      <p className="text-slate-500 text-sm">{word.chinese}</p>
                    </div>
                    <button
                      onClick={(e) => playAudio(e, word.french)}
                      className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400">
                    <Tag size={12} /> {word.category}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ---------- 学习卡片视图 ----------
  if (!currentWord) return <div className="p-8 text-center text-slate-500">加载中...</div>;

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4">
      <div className="w-full flex justify-between items-center mb-6">
        <button
          onClick={() => setViewMode('list')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> 返回列表
        </button>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm font-mono">
            {currentIndex + 1} / {filteredWords.length}
          </span>
        </div>
      </div>

      {/* Card 容器 */}
      <div
        className="relative w-full h-[450px] cursor-pointer perspective-1000 group mb-8"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full duration-500 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : '' }}>
          {/* Front */}
          <div className="absolute w-full h-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 flex flex-col items-center justify-center backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
            <div className="absolute top-6 right-6">
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                currentWord.level.startsWith('A') ? 'bg-green-100 text-green-700' :
                currentWord.level.startsWith('B') ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {currentWord.level}
              </span>
            </div>
            <span className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-4 flex items-center gap-1">
              <Tag size={12}/> {currentWord.category}
            </span>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-800 text-center mb-6 break-words max-w-full">{currentWord.french}</h2>
            <div className="flex items-center gap-2 mb-8">
              {currentWord.gender && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-mono">{currentWord.gender === 'm' ? 'masc.' : 'fem.'}</span>}
              <button
                onClick={(e) => playAudio(e, currentWord.french)}
                className="p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
              >
                <Volume2 size={24} />
              </button>
            </div>
            <p className="absolute bottom-8 text-slate-400 text-sm flex items-center gap-2 animate-pulse">
              <RotateCw size={14} /> 点击翻转查看释义
            </p>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full bg-slate-900 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center backface-hidden text-white rotate-y-180" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="text-center w-full">
              <h3 className="text-3xl font-bold mb-2">{currentWord.chinese}</h3>
              <p className="text-indigo-300 text-xl font-mono mb-6 border-b border-indigo-500/30 pb-4 inline-block">{currentWord.ipa}</p>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm mb-4 text-left">
                <p className="text-indigo-100 italic mb-2 text-lg">"{currentWord.example}"</p>
                <p className="text-slate-400 text-sm">{currentWord.example_chinese}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                  <div className="text-xs text-slate-400 w-full mb-2">
                    近义词: {currentWord.synonyms.join(', ')}
                  </div>
                )}
                <span className="px-2 py-1 bg-indigo-600 rounded text-xs">{currentWord.part_of_speech}</span>
                {currentWord.tags?.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-white/10 rounded text-xs">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 w-full max-w-md">
        <button
          onClick={() => handleNext(false)}
          className="flex-1 bg-red-50 border-2 border-red-100 text-red-600 hover:bg-red-100 hover:border-red-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95"
        >
          <XCircle size={20} /> 没记住
        </button>
        <button
          onClick={() => handleNext(true)}
          className="flex-1 bg-indigo-600 border-2 border-indigo-600 text-white hover:bg-indigo-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all transform active:scale-95"
        >
          <CheckCircle2 size={20} /> 记住了
        </button>
      </div>
    </div>
  );
};

export default Flashcards;
