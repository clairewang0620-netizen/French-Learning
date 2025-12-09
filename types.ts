
export enum Level {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
}

export interface Word {
  id: string;
  french: string;
  ipa: string;
  chinese: string;
  part_of_speech: string;
  example: string;
  example_chinese: string;
  audio?: string;
  level: Level;
  category: string;
  tags?: string[];
  gender?: 'm' | 'f' | null;
  synonyms?: string[];
  antonyms?: string[];
  conjugation?: string | null;
}

export interface Sentence {
  id: string;
  category: string;
  subcategory: string;
  french: string;
  ipa: string;
  chinese: string;
  audio?: string;
  level: Level;
  situation: string;
  alternative?: string[];
  notes?: string;
}

export interface GrammarPoint {
  id: string;
  category: string;
  title: string;
  level: Level;
  explanation: string;
  rules: string[];
  examples: {
    french: string;
    chinese: string;
    audio?: string;
    explanation?: string;
  }[];
  exceptions?: {
    case: string;
    example: string;
    explanation: string;
  }[];
  common_mistakes?: string[];
}

export interface ReadingArticle {
  id: string;
  title: string;
  level: Level;
  word_count: number;
  reading_time: string;
  content: string;
  translation: string;
  audio?: string;
  vocabulary: Partial<Word>[];
  questions: {
    id: string;
    question: string;
    type?: string;
    options: string[];
    correct_answer: number | string; // index or string value
    explanation: string;
  }[];
  grammar_points?: {
    point: string;
    explanation: string;
  }[];
  cultural_notes?: string[];
}

export interface QuizQuestion {
  id: string;
  type: 'vocab' | 'grammar' | 'listening' | 'reading';
  category?: string;
  question: string;
  question_audio?: string;
  options: string[]; // Or complex object if needed
  correctAnswer: number;
  explanation: string;
  level: Level;
  points?: number;
}

// Spaced Repetition & Error Tracking
export interface WrongItem {
  id: string;
  type: 'word' | 'sentence' | 'quiz' | 'grammar';
  wrongCount: number;
  lastWrongDate: string; // ISO date
  nextReviewDate: string; // ISO date
  masteryLevel: number; // 0-5
}

export interface UserProgress {
  wordsMastered: number;
  dailyStreak: number;
  totalStudyTimeMinutes: number;
  lastStudyDate: string;
  categoryProgress: Record<string, number>;
  quizScores: { date: string; score: number }[];
  mistakes: Record<string, WrongItem>; // Map by ID
}
