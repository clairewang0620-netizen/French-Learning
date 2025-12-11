
import { UserProgress, WrongItem } from '../types';

const STORAGE_KEY = 'french_app_progress_v2';

const DEFAULT_PROGRESS: UserProgress = {
  wordsMastered: 0,
  dailyStreak: 0,
  totalStudyTimeMinutes: 0,
  lastStudyDate: new Date().toISOString(),
  categoryProgress: {
    'A1': 0,
    'A2': 0,
    'B1': 0,
    'B2': 0,
    'C1': 0,
  },
  quizScores: [],
  mistakes: {}
};

export const getProgress = (): UserProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PROGRESS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load progress", e);
  }
  return DEFAULT_PROGRESS;
};

export const saveProgress = (progress: UserProgress) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

export const addStudyTime = (minutes: number) => {
  const current = getProgress();
  current.totalStudyTimeMinutes += minutes;
  
  const today = new Date().toISOString().split('T')[0];
  const last = current.lastStudyDate.split('T')[0];
  
  if (today !== last) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (last === yesterdayStr) {
      current.dailyStreak += 1;
    } else {
      current.dailyStreak = 1;
    }
  }
  
  current.lastStudyDate = new Date().toISOString();
  saveProgress(current);
};

// Helper to get status for UI lists
export const getWordStatus = (id: string): WrongItem | null => {
  const progress = getProgress();
  return progress.mistakes[id] || null;
};

// Spaced Repetition Logic (Simplified Sm-2 inspired)
export const markItemResult = (id: string, type: 'word' | 'sentence' | 'quiz', isCorrect: boolean) => {
  const progress = getProgress();
  const today = new Date();
  
  let item = progress.mistakes[id];
  
  if (!item) {
    if (isCorrect) {
      // If never seen before and correct, assume mastered or don't add to mistakes
      progress.wordsMastered += 1;
      saveProgress(progress);
      return;
    }
    // Initialize new mistake item
    item = {
      id,
      type,
      wrongCount: 0,
      lastWrongDate: today.toISOString(),
      nextReviewDate: today.toISOString(), // Review immediately
      masteryLevel: 0
    };
  }

  if (isCorrect) {
    item.masteryLevel += 1;
    // Calculate next review date based on mastery
    // Level 0: 1 day, Level 1: 3 days, Level 2: 7 days, Level 3: 14 days, Level 4: 30 days
    const daysToAdd = [1, 3, 7, 14, 30][Math.min(item.masteryLevel, 4)];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    item.nextReviewDate = nextDate.toISOString();
    
    // If mastered enough, remove from mistakes list to "Graduated"
    if (item.masteryLevel >= 5) {
      delete progress.mistakes[id];
      progress.wordsMastered += 1;
    } else {
      progress.mistakes[id] = item;
    }
  } else {
    item.wrongCount += 1;
    item.masteryLevel = 0; // Reset mastery
    item.lastWrongDate = today.toISOString();
    item.nextReviewDate = today.toISOString(); // Review today/tomorrow
    progress.mistakes[id] = item;
  }
  
  saveProgress(progress);
};

export const getItemsDueForReview = (): WrongItem[] => {
  const progress = getProgress();
  const now = new Date();
  return Object.values(progress.mistakes).filter(item => {
    return new Date(item.nextReviewDate) <= now;
  });
};
