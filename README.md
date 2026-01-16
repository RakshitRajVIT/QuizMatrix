# 🎯 QuizMatrix - Real-Time Live Quiz Platform

**QuizMatrix** is a modern, real-time quiz platform for clubs and events. Built with React and Firebase, it lets you host live quizzes, manage questions, and track scores instantly.

[Live Site](https://matrix-4bee5.web.app)

![Matrix Club Logo](public/matrix-logo.svg)

## ✨ Features

### For Admins (Quiz Hosts)
- 📝 Create quizzes with custom titles and timing
- ➕ Add unlimited questions with 4 options each
- 🎮 Live quiz control (start, next question, end)
- 📊 Real-time leaderboard during quiz
- 📥 Download results as CSV

### For Participants (Students)
- 🔗 Join quiz with 6-character code
- ⏱️ Synchronized countdown timer
- 🔒 Answer lock after submission
- 🏆 Live score tracking
- 📈 Final leaderboard view

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Firebase project (free tier is sufficient)

### 1. Install Dependencies
```bash
cd QuizMatrix
npm install
```

### 2. Configure Firebase

#### Step 2.1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project" → Name it "QuizMatrix"
3. Disable Google Analytics (optional for free tier)
4. Wait for project creation

#### Step 2.2: Enable Authentication
1. In Firebase Console, go to **Authentication** → **Get Started**
2. Click **Sign-in method** tab
3. Click **Google** → Enable it
4. Set your project public name and support email
5. Click **Save**

#### Step 2.3: Create Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Start in **Test mode** (we'll add security rules later)
3. Select your preferred region
4. Click **Done**

#### Step 2.4: Get Firebase Config
1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** → Click **Web** icon (</>)
3. Register app name: "QuizMatrix"
4. Copy the `firebaseConfig` object

#### Step 2.5: Update Config File
Open `src/firebase/firebase.js` and replace the placeholder config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

#### Step 2.6: Add Admin Emails
In the same file, add Gmail addresses that should have admin access:

```javascript
export const ADMIN_EMAILS = [
  "your-email@gmail.com",
  "matrixclub@gmail.com",
  // Add more admin emails as needed
];
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🚀 Deployment to Firebase Hosting

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase Project
```bash
firebase init
```
- Select **Hosting** and **Firestore**
- Choose your project
- Set public directory to `dist`
- Configure as single-page app: **Yes**
- Don't overwrite `index.html`

### 4. Deploy Security Rules
The security rules are already defined in `firestore.rules`. Deploy them:
```bash
firebase deploy --only firestore:rules
```

### 5. Build and Deploy
```bash
npm run build
firebase deploy --only hosting
```

Your app will be live at `https://your-project-id.web.app`

## 📁 Project Structure

```
QuizMatrix/
├── public/
│   └── matrix-logo.svg          # Logo
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Navigation header
│   │   ├── Timer.jsx            # Countdown timer
│   │   ├── Leaderboard.jsx      # Score rankings
│   │   ├── LoadingSpinner.jsx   # Loading indicator
│   │   └── ProtectedRoute.jsx   # Auth guard
│   ├── context/
│   │   └── AuthContext.jsx      # Auth state management
│   ├── firebase/
│   │   └── firebase.js          # Firebase config
│   ├── hooks/
│   │   └── useQuiz.js           # Quiz operations & subscriptions
│   ├── pages/
│   │   ├── Login.jsx            # Google sign-in page
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CreateQuiz.jsx
│   │   │   ├── ManageQuestions.jsx
│   │   │   ├── QuizControl.jsx
│   │   │   └── AdminLeaderboard.jsx
│   │   └── participant/
│   │       ├── JoinQuiz.jsx
│   │       └── LiveQuestion.jsx
│   ├── utils/
│   │   └── helpers.js           # Utility functions
│   ├── App.jsx                  # Main app with routing
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── firestore.rules              # Security rules
├── firebase.json                # Hosting config
└── package.json
```

## 🔐 Security Rules

The `firestore.rules` file implements these protections:
- ✅ Only authenticated users can access the app
- ✅ Only admins can create/control quizzes
- ✅ Participants can only submit once per question
- ✅ Responses are immutable after submission
- ✅ Score manipulation is prevented

## 📊 Firestore Collections

### `users`
Stores user profiles with admin status.

### `quizzes`
Quiz metadata including status, code, and settings.

### `quizzes/{id}/questions`
Questions for each quiz with options and correct answer.

### `quizzes/{id}/participants`
Joined participants with scores.

### `quizzes/{id}/responses`
Individual answer submissions.

## 🎨 Customization

### Change Branding Colors
Edit CSS variables in `src/index.css`:
```css
:root {
  --color-primary: #8B5CF6;     /* Main purple */
  --color-secondary: #06B6D4;    /* Accent cyan */
}
```

### Add More Admins
Update the `ADMIN_EMAILS` array in `src/firebase/firebase.js`.

## 📱 Mobile Support

The app is fully responsive and works on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktops

## 🆘 Troubleshooting

### "Permission denied" errors
- Deploy security rules: `firebase deploy --only firestore:rules`
- Ensure you're logged in with an admin email

### Google Sign-In not working
- Verify Google auth is enabled in Firebase Console
- Check authorized domains in Firebase Auth settings

### Quiz code not found
- Ensure quiz status is "waiting" or "live"
- Check the code is exactly 6 characters, uppercase

## 📄 License

Built for Matrix Club. Feel free to customize for your organization!

---

**Made with ❤️ for Matrix Club**
