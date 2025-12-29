// Quiz Control Page - Admin control panel during live quiz
// Shows current question, controls, and real-time participant count

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import Leaderboard from '../../components/Leaderboard';
import { useQuiz, useQuizSubscription, useQuestionsSubscription, useParticipantsSubscription } from '../../hooks/useQuiz';

const QuizControl = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { quiz, loading: quizLoading } = useQuizSubscription(quizId);
    const { questions } = useQuestionsSubscription(quizId);
    const { participants } = useParticipantsSubscription(quizId);
    const { nextQuestion, endQuiz } = useQuiz();

    const [transitioning, setTransitioning] = useState(false);

    const handleNextQuestion = async () => {
        setTransitioning(true);
        try {
            const hasMore = await nextQuestion(quizId, quiz.currentQuestionIndex, questions.length);
            if (!hasMore) {
                // Quiz ended
                navigate(`/admin/quiz/${quizId}/results`);
            }
        } catch (error) {
            console.error('Error moving to next question:', error);
            alert('Failed to move to next question');
        }
        setTransitioning(false);
    };

    const handleEndQuiz = async () => {
        if (!window.confirm('Are you sure you want to end the quiz now?')) return;

        try {
            await endQuiz(quizId);
            navigate(`/admin/quiz/${quizId}/results`);
        } catch (error) {
            console.error('Error ending quiz:', error);
            alert('Failed to end quiz');
        }
    };

    if (quizLoading) {
        return <LoadingSpinner message="Loading quiz control..." />;
    }

    if (!quiz) {
        return (
            <div className="error-page">
                <h2>Quiz not found</h2>
                <button className="btn btn-primary" onClick={() => navigate('/admin')}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const currentQuestion = quiz.currentQuestionIndex >= 0
        ? questions[quiz.currentQuestionIndex]
        : null;

    const optionLabels = ['A', 'B', 'C', 'D'];

    return (
        <div className="quiz-control-page">
            <Header />

            <main className="control-content">
                {/* Status Bar */}
                <div className="control-status-bar">
                    <div className="status-info">
                        <h1>{quiz.title}</h1>
                        <div className="status-chips">
                            <span className="chip">Code: <strong>{quiz.quizCode}</strong></span>
                            <span className={`chip status-${quiz.status}`}>
                                {quiz.status === 'waiting' && '⏳ Waiting for start'}
                                {quiz.status === 'live' && '🔴 LIVE'}
                                {quiz.status === 'ended' && '✅ Ended'}
                            </span>
                        </div>
                    </div>
                    <div className="participant-count">
                        <span className="count-number">{participants.length}</span>
                        <span className="count-label">Participants</span>
                    </div>
                </div>

                <div className="control-layout">
                    {/* Main Control Area */}
                    <div className="control-main">
                        {/* Waiting State */}
                        {quiz.status === 'waiting' && (
                            <div className="waiting-state">
                                <div className="waiting-icon">⏳</div>
                                <h2>Waiting for Participants</h2>
                                <p>Share the quiz code with participants:</p>
                                <div className="big-code">{quiz.quizCode}</div>
                                <p className="participant-info">
                                    {participants.length} participant(s) have joined
                                </p>
                                <button
                                    className="btn btn-primary btn-large"
                                    onClick={handleNextQuestion}
                                    disabled={transitioning || participants.length === 0}
                                >
                                    {transitioning ? 'Starting...' : '🚀 Start First Question'}
                                </button>
                                {participants.length === 0 && (
                                    <p className="hint">Wait for at least one participant to join</p>
                                )}
                            </div>
                        )}

                        {/* Live Question State */}
                        {quiz.status === 'live' && currentQuestion && (
                            <div className="live-question-control">
                                <div className="question-progress">
                                    Question {quiz.currentQuestionIndex + 1} of {questions.length}
                                </div>

                                <div className="current-question-card">
                                    <h2 className="question-text">{currentQuestion.text}</h2>

                                    <div className="options-display">
                                        {currentQuestion.options.map((option, idx) => (
                                            <div
                                                key={idx}
                                                className={`option-display ${idx === currentQuestion.correctAnswer ? 'correct-answer' : ''}`}
                                            >
                                                <span className="option-letter">{optionLabels[idx]}</span>
                                                <span className="option-text">{option}</span>
                                                {idx === currentQuestion.correctAnswer && (
                                                    <span className="correct-mark">✓</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="control-actions">
                                    <button
                                        className="btn btn-primary btn-large"
                                        onClick={handleNextQuestion}
                                        disabled={transitioning}
                                    >
                                        {transitioning ? 'Loading...' : (
                                            quiz.currentQuestionIndex + 1 >= questions.length
                                                ? '🏁 Finish Quiz'
                                                : '➡️ Next Question'
                                        )}
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={handleEndQuiz}
                                        disabled={transitioning}
                                    >
                                        End Quiz Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Ended State */}
                        {quiz.status === 'ended' && (
                            <div className="ended-state">
                                <div className="ended-icon">🏆</div>
                                <h2>Quiz Ended!</h2>
                                <button
                                    className="btn btn-primary btn-large"
                                    onClick={() => navigate(`/admin/quiz/${quizId}/results`)}
                                >
                                    View Results
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Leaderboard Sidebar */}
                    <div className="control-sidebar">
                        <Leaderboard
                            participants={participants}
                            title="Live Leaderboard"
                            maxDisplay={15}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default QuizControl;
