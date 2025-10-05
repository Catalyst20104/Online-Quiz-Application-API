const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 3000;

app.use(express.json());

let quizzes = []; // Array of quizzes
let questions = []; // Array of questions 

class Quiz {
  constructor(id, title) {
    this.id = id;
    this.title = title;
    this.questions = []; // Array of question IDs
  }
}

class Question {
  constructor(id, quizId, text, options, correctOptionId) {
    this.id = id;
    this.quizId = quizId;
    this.text = text;
    this.options = options; 
    this.correctOptionId = correctOptionId; 
  }
}

// Services 
const QuizService = {
  // Create a quiz
  createQuiz: (title) => {
    const id = uuidv4();
    const quiz = new Quiz(id, title);
    quizzes.push(quiz);
    return quiz;
  },

  // Get all quizzes 
  getAllQuizzes: () => {
    return quizzes.map(q => ({ id: q.id, title: q.title }));
  },

  // Add question to quiz
  addQuestion: (quizId, text, options, correctOptionId) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) throw new Error('Quiz not found');

    // Basic validation: ensure correctOptionId exists in options
    const correctOption = options.find(opt => opt.id === correctOptionId);
    if (!correctOption) throw new Error('Invalid correct option ID');

    const id = uuidv4();
    const question = new Question(id, quizId, text, options, correctOptionId);
    questions.push(question);
    quiz.questions.push(id);
    return question;
  },

  // Get questions for a quiz (without correct answer)
  getQuestions: (quizId) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) throw new Error('Quiz not found');

    return questions
      .filter(q => q.quizId === quizId)
      .map(q => ({
        id: q.id,
        text: q.text,
        options: q.options 
      }));
  },

  // Submit answers and calculate score
  submitAnswers: (quizId, answers) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) throw new Error('Quiz not found');

    const quizQuestions = questions.filter(q => q.quizId === quizId);
    const total = quizQuestions.length;

    if (answers.length !== total) {
      throw new Error('Answers must cover all questions');
    }

    let score = 0;
    answers.forEach(answer => {
      const question = quizQuestions.find(q => q.id === answer.questionId);
      if (question && question.correctOptionId === answer.selectedOptionId) {
        score++;
      }
    });

    return { score, total };
  }
};

// Controllers 
const QuizController = {
  createQuiz: (req, res) => {
    try {
      const { title } = req.body;
      if (!title) return res.status(400).json({ error: 'Title is required' });
      const quiz = QuizService.createQuiz(title);
      res.status(201).json({ id: quiz.id, title: quiz.title });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAllQuizzes: (req, res) => {
    try {
      const quizzesList = QuizService.getAllQuizzes();
      res.json(quizzesList);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  addQuestion: (req, res) => {
    try {
      const { quizId } = req.params;
      const { text, options, correctOptionId } = req.body;
      if (!text || !options || !correctOptionId) {
        return res.status(400).json({ error: 'Text, options, and correctOptionId are required' });
      }
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ error: 'Options must be an array with at least 2 items' });
      }
      const question = QuizService.addQuestion(quizId, text, options, correctOptionId);
      res.status(201).json({
        id: question.id,
        text: question.text,
        options: question.options
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getQuestions: (req, res) => {
    try {
      const { quizId } = req.params;
      const quizQuestions = QuizService.getQuestions(quizId);
      res.json(quizQuestions);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  submitAnswers: (req, res) => {
    try {
      const { quizId } = req.params;
      const { answers } = req.body; // Array of { questionId, selectedOptionId }
      if (!Array.isArray(answers)) {
        return res.status(400).json({ error: 'Answers must be an array' });
      }
      const result = QuizService.submitAnswers(quizId, answers);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

// Routes
app.post('/quizzes', QuizController.createQuiz);
app.get('/quizzes', QuizController.getAllQuizzes); // Bonus: List all quizzes

app.post('/quizzes/:quizId/questions', QuizController.addQuestion);
app.get('/quizzes/:quizId/questions', QuizController.getQuestions);
app.post('/quizzes/:quizId/submit', QuizController.submitAnswers);

app.listen(port, () => {
  console.log(`Quiz API running at http://localhost:${port}`);
});
module.exports = { app, QuizService }; // Export 