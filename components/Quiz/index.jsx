// components/Quiz/index.js
// ============================================
// Barrel Export - Quiz Module
// ============================================
export { default } from './Quiz';
export { default as QuizIntro } from './QuizIntro';
export { default as QuizQuestion } from './QuizQuestion';
export { default as QuizResult } from './QuizResult';

export {
  specialtyQuestions,
  getQuestionsBySpecialty,
  getQuestionCountBySpecialty,
  specialtiesInfo,
} from './quizData';

export { specialties } from './specialties';