# Quiz API Backend

## 1. Project Description

This is a simple, RESTful API backend for a quiz application built with Node.js and Express.js. It provides core functionality to create quizzes, add multiple-choice questions (with options and correct answers), fetch questions (hiding correct answers), and submit user answers to calculate a score. The API uses in-memory storage for data persistence during runtime, making it lightweight and easy to set up for development or testing.

Key Features:
- Create quizzes with titles.
- Add single-choice questions with options.
- Retrieve questions for a quiz (without revealing correct answers).
- Submit answers and get a score (e.g., 3/5).
- Bonus: List all quizzes.

The design follows RESTful principles with clear endpoints, error handling, and separation of concerns (models, services, controllers). It's extensible for production (e.g., add a database like MongoDB).

## 2. Setup and Running Locally

### Prerequisites
- **Node.js**: Version 14 or higher (includes npm). Download from [nodejs.org](https://nodejs.org).
- **Code Editor**: VS Code or similar.
- **Terminal**: Command-line tool (e.g., Terminal on macOS/Linux, PowerShell on Windows).
- Optional: Postman or curl for API testing.

### Step-by-Step Setup
1. **Create Project Directory**:
   ```
   mkdir quiz-api
   cd quiz-api
   ```

2. **Initialize Node.js Project**:
   ```
   npm init -y
   ```

3. **Install Dependencies**:
   - Core (Express for server, UUID for IDs):
     ```
     npm install express uuid
     ```
   - For testing (Jest):
     ```
     npm install --save-dev jest
     ```

4. **Add Project Files**:
   - Create `server.js` in the root directory and paste the provided server code (from the initial implementation).
   - (Optional) Create a `tests` folder: `mkdir tests`
   - Create `tests/quiz.test.js` and paste the provided test code.

5. **Configure Scripts** (Edit `package.json` under `"scripts"`):
   ```json
   "scripts": {
     "start": "node server.js",
     "test": "jest",
     "test:watch": "jest --watch"
   }
   ```

6. **Fix for Tests** (In `server.js`):
   - Change `let quizzes = []; let questions = [];` to `global.quizzes = []; global.questions = [];` (after imports).
   - At the end of `server.js` (before `app.listen`), add: `module.exports = { QuizService };`.

7. **Run the Server**:
   ```
   npm start
   ```
   - Output: `Quiz API running at http://localhost:3000`
   - The server listens on port 3000. Test endpoints using curl/Postman (see examples below).
   - Stop: `Ctrl+C`.

### API Testing Examples (Using curl)
Ensure the server is running. Replace `YOUR_QUIZ_ID` with an actual ID from creating a quiz.

- **Create Quiz** (`POST /quizzes`):
  ```
  curl -X POST http://localhost:3000/quizzes     -H "Content-Type: application/json"     -d '{"title": "Math Quiz"}'
  ```
  Response: `{"id": "uuid-here", "title": "Math Quiz"}`

- **Add Question** (`POST /quizzes/:quizId/questions`):
  ```
  curl -X POST http://localhost:3000/quizzes/YOUR_QUIZ_ID/questions     -H "Content-Type: application/json"     -d '{
      "text": "What is 2+2?",
      "options": [{"id":"a","text":"3"}, {"id":"b","text":"4"}],
      "correctOptionId": "b"
    }'
  ```

- **Fetch Questions** (`GET /quizzes/:quizId/questions`):
  ```
  curl http://localhost:3000/quizzes/YOUR_QUIZ_ID/questions
  ```

- **Submit Answers** (`POST /quizzes/:quizId/submit`):
  ```
  curl -X POST http://localhost:3000/quizzes/YOUR_QUIZ_ID/submit     -H "Content-Type: application/json"     -d '{
      "answers": [{"questionId": "question-uuid", "selectedOptionId": "b"}]
    }'
  ```
  Response: `{"score": 1, "total": 1}`

- **List Quizzes** (Bonus: `GET /quizzes`):
  ```
  curl http://localhost:3000/quizzes
  ```

**Notes**:
- Data is in-memory (resets on server restart).
- Errors return JSON (e.g., 400 for invalid input, 404 for missing quiz).
- For GUI testing, use Postman: Set method, URL, headers (`Content-Type: application/json`), and raw JSON body.

### Troubleshooting Common Issues
- **"Quiz not found" (404)**: Ensure `quizId` is copied correctly from create response. Recreate if server restarted.
- **"Text, options, and correctOptionId are required" (400)**: For adding questions—check JSON body has all fields (text string, options array with id/text, correctOptionId matching an option id).
- **Submit Errors**: Use `/submit` endpoint (not `/questions`). Ensure answers array covers all questions and IDs match fetched data.
- **Server Crashes**: Check console for errors (e.g., missing dependencies). Restart with `npm start`.
- **Port in Use**: Change port in `server.js` (e.g., `app.listen(3001)`).

## 3. Running Test Cases

The project includes unit tests for the core `QuizService` logic using Jest. These test creation, addition, fetching, submission, scoring, and validation. No server needed—tests run directly on the service.

### Setup for Tests
- Ensure Jest is installed (`npm install --save-dev jest`).
- Apply the fixes in Section 2 (global storage and export in `server.js`).
- Fix the test file if needed: In `tests/quiz.test.js`, ensure `question` is defined before use in the scoring test (see code comments).

### Run Tests
1. In the project root terminal:
   ```
   npm test
   ```
   - Runs all tests in `tests/*.test.js`.
   - Expected: 5 passing tests (createQuiz, addQuestion/getQuestions, submitAnswers scoring, submitAnswers validation, getAllQuizzes).

2. **Specific Options**:
   - Run a single test: `npm test -- --testNamePattern="submitAnswers scoring"`
   - Watch mode (re-runs on changes): `npm run test:watch`
   - Coverage: Add `"test:coverage": "jest --coverage"` to scripts, then `npm run test:coverage`.

3. **Expected Output** (Success):
   ```
   PASS  tests/quiz.test.js
   QuizService
     ✓ createQuiz (3 ms)
     ✓ addQuestion and getQuestions (1 ms)
     ✓ submitAnswers scoring (1 ms)
     ✓ submitAnswers validation (1 ms)
     ✓ getAllQuizzes (1 ms)

   Test Suites: 1 passed, 1 total
   Tests:       5 passed, 5 total
   ```

**Troubleshooting Tests**:
- **Import Errors**: Check path in `require('../server.js')`.
- **Global Not Defined**: Apply the global fix.
- **Failures**: Jest shows details (e.g., "Expected: 1, Received: 0"). Debug `server.js` logic.
- Add more tests in `quiz.test.js` as needed (e.g., for invalid inputs).

For integration tests (HTTP endpoints), extend with Supertest (`npm i -D supertest`).
