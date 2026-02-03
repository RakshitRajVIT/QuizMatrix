// Join Quiz Page - Enter quiz code to join a live quiz
// Validates code and redirects to lobby/live question

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { useQuiz, useRegisteredQuizzes } from '../../hooks/useQuiz';
import { useAuth } from '../../context/AuthContext';

const JoinQuiz = () => {
    const navigate = useNavigate();
    const { getQuizByCode, joinQuiz, isUserAllowedToJoin } = useQuiz();
    const { user } = useAuth();
    const { quizzes: registeredQuizzes, loading: registeredLoading } = useRegisteredQuizzes();

    const [quizCode, setQuizCode] = useState('');
    const [error, setError] = useState('');
    const [joining, setJoining] = useState(false);

    const handleCodeChange = (e) => {
        // Auto-uppercase and limit to 6 chars
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        setQuizCode(value);
        setError('');
    };

    const handleJoin = async (e) => {
        e.preventDefault();

        if (quizCode.length !== 6) {
            setError('Please enter a valid 6-character quiz code');
            return;
        }

        setJoining(true);
        setError('');

        try {
            // Find quiz by code
            const quiz = await getQuizByCode(quizCode);

            if (!quiz) {
                setError('Quiz not found. Please check the code and try again.');
                setJoining(false);
                return;
            }

            if (quiz.status === 'draft') {
                setError('This quiz hasn\'t started yet. Please wait for the host.');
                setJoining(false);
                return;
            }

            if (quiz.status === 'ended') {
                setError('This quiz has already ended.');
                setJoining(false);
                return;
            }

            // Check if quiz is restricted and user is allowed
            if (quiz.isRestricted) {
                const isAllowed = await isUserAllowedToJoin(quiz.id, user.email);
                if (!isAllowed) {
                    setError('You are not registered for this quiz. Please contact the quiz host.');
                    setJoining(false);
                    return;
                }
            }

            // Join the quiz
            await joinQuiz(quiz.id);

            // Navigate to quiz
            navigate(`/quiz/${quiz.id}`);

        } catch (err) {
            console.error('Join error:', err);
            setError('Failed to join quiz. Please try again.');
        }

        setJoining(false);
    };

    const handleJoinRegisteredQuiz = async (quiz) => {
        if (quiz.status === 'draft') {
            setError('This quiz hasn\'t started yet. Please wait for the host.');
            return;
        }

        if (quiz.status === 'ended') {
            setError('This quiz has already ended.');
            return;
        }

        setJoining(true);
        try {
            await joinQuiz(quiz.id);
            navigate(`/quiz/${quiz.id}`);
        } catch (err) {
            console.error('Join error:', err);
            setError('Failed to join quiz. Please try again.');
        }
        setJoining(false);
    };

    // Filter quizzes by status
    const upcomingQuizzes = registeredQuizzes.filter(q => q.status === 'draft'); // Only draft = not started
    const waitingQuizzes = registeredQuizzes.filter(q => q.status === 'waiting'); // Waiting = can join lobby
    const liveQuizzes = registeredQuizzes.filter(q => q.status === 'live');

    return (
        <div className="join-quiz-page">
            <Header />

            <main className="join-content">
                <div className="join-container">
                    {/* Hero Section */}
                    <div className="join-hero">
                        <div className="hero-icon">🎯</div>
                        <h1>Join a Live Quiz</h1>
                        <p>Enter the quiz code shared by your host</p>
                    </div>

                    {/* Join Form */}
                    <form onSubmit={handleJoin} className="join-form">
                        {error && (
                            <div className="error-message">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div className="code-input-container">
                            <input
                                type="text"
                                value={quizCode}
                                onChange={handleCodeChange}
                                placeholder="ENTER CODE"
                                className="code-input"
                                maxLength={6}
                                autoFocus
                            />
                            <span className="code-hint">6-character code (e.g., MATRIX)</span>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-large full-width"
                            disabled={joining || quizCode.length !== 6}
                        >
                            {joining ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Joining...
                                </>
                            ) : (
                                '🚀 Join Quiz'
                            )}
                        </button>
                    </form>

                    {/* Registered Quizzes Section */}
                    {!registeredLoading && (liveQuizzes.length > 0 || waitingQuizzes.length > 0 || upcomingQuizzes.length > 0) && (
                        <div className="registered-quizzes-section">
                            <h3>📋 Your Registered Quizzes</h3>
                            
                            {/* Live Quizzes */}
                            {liveQuizzes.length > 0 && (
                                <div className="quiz-category">
                                    <h4>🔴 Live Now</h4>
                                    <div className="registered-quiz-list">
                                        {liveQuizzes.map(quiz => (
                                            <div key={quiz.id} className="registered-quiz-card live">
                                                <div className="quiz-info">
                                                    <span className="quiz-title">{quiz.title}</span>
                                                    <span className="quiz-code">Code: {quiz.quizCode}</span>
                                                </div>
                                                <button
                                                    className="btn btn-accent btn-small"
                                                    onClick={() => handleJoinRegisteredQuiz(quiz)}
                                                    disabled={joining}
                                                >
                                                    Join Now →
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Waiting Quizzes - Can join lobby */}
                            {waitingQuizzes.length > 0 && (
                                <div className="quiz-category">
                                    <h4>🟡 Open for Joining</h4>
                                    <div className="registered-quiz-list">
                                        {waitingQuizzes.map(quiz => (
                                            <div key={quiz.id} className="registered-quiz-card waiting">
                                                <div className="quiz-info">
                                                    <span className="quiz-title">{quiz.title}</span>
                                                    <span className="quiz-code">Code: {quiz.quizCode}</span>
                                                </div>
                                                <button
                                                    className="btn btn-primary btn-small"
                                                    onClick={() => handleJoinRegisteredQuiz(quiz)}
                                                    disabled={joining}
                                                >
                                                    Join Lobby →
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upcoming Quizzes - Draft, not yet open */}
                            {upcomingQuizzes.length > 0 && (
                                <div className="quiz-category">
                                    <h4>⏳ Upcoming</h4>
                                    <div className="registered-quiz-list">
                                        {upcomingQuizzes.map(quiz => (
                                            <div key={quiz.id} className="registered-quiz-card upcoming">
                                                <div className="quiz-info">
                                                    <span className="quiz-title">{quiz.title}</span>
                                                    <span className="quiz-code">Code: {quiz.quizCode}</span>
                                                </div>
                                                <span className="status-badge draft">
                                                    Not Started
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info */}
                    <div className="join-info">
                        <h4>How it works:</h4>
                        <ol>
                            <li>Get the quiz code from your host</li>
                            <li>Enter the code above and click Join</li>
                            <li>Wait in the lobby until the quiz starts</li>
                            <li>Answer questions as fast as you can!</li>
                        </ol>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JoinQuiz;
