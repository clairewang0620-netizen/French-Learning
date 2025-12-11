
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Flashcards from './components/Flashcards';
import SentencesView from './components/Sentences';
import GrammarView from './components/GrammarViewer';
import ReadingView from './components/ReadingViewer';
import QuizView from './components/Quiz';
import WrongQuestionsView from './components/WrongQuestions';

import { SAMPLE_WORDS, SAMPLE_SENTENCES, SAMPLE_GRAMMAR, SAMPLE_ARTICLES, SAMPLE_QUIZ } from './constants';
import { getProgress, addStudyTime } from './services/storageService';
import { UserProgress } from './types';

const App: React.FC = () => {
  const [page, setPage] = useState('dashboard');
  const [progress, setProgress] = useState<UserProgress>(getProgress());

  // Simulate tracking study time
  useEffect(() => {
    const interval = setInterval(() => {
        addStudyTime(1);
        setProgress(getProgress()); // Update UI
    }, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard progress={progress} />;
      case 'words':
        return <Flashcards words={SAMPLE_WORDS} />;
      case 'sentences':
        return <SentencesView sentences={SAMPLE_SENTENCES} />;
      case 'grammar':
        return <GrammarView items={SAMPLE_GRAMMAR} />;
      case 'reading':
        return <ReadingView articles={SAMPLE_ARTICLES} />;
      case 'quiz':
        return <QuizView questions={SAMPLE_QUIZ} />;
      case 'review':
        return <WrongQuestionsView />;
      default:
        return <Dashboard progress={progress} />;
    }
  };

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {renderContent()}
    </Layout>
  );
};

export default App;
