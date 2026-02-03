// Manage Questions Page - Add, edit, and delete quiz questions
// Each question has text, 4 options, and correct answer selection

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useQuiz, useQuizSubscription, useQuestionsSubscription } from '../../hooks/useQuiz';
import { validateQuestionData } from '../../utils/helpers';
import { ADMIN_EMAILS } from '../../firebase/firebase';

const ManageQuestions = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { quiz, loading: quizLoading } = useQuizSubscription(quizId);
    const { questions, loading: questionsLoading } = useQuestionsSubscription(quizId);
    const { addQuestion, updateQuestion, deleteQuestion, startQuiz, updateQuiz, shareQuiz, unshareQuiz } = useQuiz();

    const [showForm, setShowForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [formData, setFormData] = useState({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: -1
    });
    const [errors, setErrors] = useState([]);
    const [saving, setSaving] = useState(false);

    // Duration editor state
    const [editingDuration, setEditingDuration] = useState(false);
    const [newDuration, setNewDuration] = useState(30);
    const [savingDuration, setSavingDuration] = useState(false);

    // Share state
    const [shareEmail, setShareEmail] = useState('');
    const [sharingInProgress, setSharingInProgress] = useState(false);

    // Sync newDuration with quiz when quiz loads
    useEffect(() => {
        if (quiz?.timePerQuestion) {
            setNewDuration(quiz.timePerQuestion);
        }
    }, [quiz?.timePerQuestion]);

    // Reset form when editing question changes
    useEffect(() => {
        if (editingQuestion) {
            setFormData({
                text: editingQuestion.text,
                options: [...editingQuestion.options],
                correctAnswer: editingQuestion.correctAnswer
            });
            setShowForm(true);
        } else {
            resetForm();
        }
    }, [editingQuestion]);

    const resetForm = () => {
        setFormData({
            text: '',
            options: ['', '', '', ''],
            correctAnswer: -1
        });
        setErrors([]);
        setShowForm(false);
        setEditingQuestion(null);
    };

    const handleTextChange = (e) => {
        setFormData(prev => ({ ...prev, text: e.target.value }));
        setErrors([]);
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
        setErrors([]);
    };

    const handleCorrectAnswerChange = (index) => {
        setFormData(prev => ({ ...prev, correctAnswer: index }));
        setErrors([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateQuestionData(formData);
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setSaving(true);
        try {
            if (editingQuestion) {
                await updateQuestion(quizId, editingQuestion.id, formData);
            } else {
                await addQuestion(quizId, formData);
            }
            resetForm();
        } catch (error) {
            console.error('Error saving question:', error);
            setErrors(['Failed to save question. Please try again.']);
        }
        setSaving(false);
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm('Delete this question?')) return;

        try {
            await deleteQuestion(quizId, questionId);
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Failed to delete question');
        }
    };

    const handleStartQuiz = async () => {
        if (questions.length === 0) {
            alert('Please add at least one question before starting the quiz');
            return;
        }

        if (!window.confirm('Start the quiz? Participants will be able to join with the quiz code.')) {
            return;
        }

        try {
            await startQuiz(quizId);
            navigate(`/admin/quiz/${quizId}/control`);
        } catch (error) {
            console.error('Error starting quiz:', error);
            alert('Failed to start quiz');
        }
    };

    // Duration editor handlers
    const handleSaveDuration = async () => {
        if (newDuration < 5 || newDuration > 120) {
            alert('Duration must be between 5 and 120 seconds');
            return;
        }

        setSavingDuration(true);
        try {
            await updateQuiz(quizId, { timePerQuestion: newDuration });
            setEditingDuration(false);
        } catch (error) {
            console.error('Error updating duration:', error);
            alert('Failed to update duration');
        }
        setSavingDuration(false);
    };

    // Share handlers
    const handleShareQuiz = async () => {
        const email = shareEmail.trim().toLowerCase();
        if (!email) return;

        // Check if it's a valid admin email
        if (!ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email)) {
            alert('This email is not registered as an admin');
            return;
        }

        // Can't share with yourself
        if (email === quiz.creatorEmail?.toLowerCase()) {
            alert('Cannot share with quiz creator');
            return;
        }

        setSharingInProgress(true);
        try {
            await shareQuiz(quizId, email);
            setShareEmail('');
        } catch (error) {
            console.error('Error sharing quiz:', error);
            alert('Failed to share quiz');
        }
        setSharingInProgress(false);
    };

    const handleUnshareQuiz = async (email) => {
        if (!window.confirm(`Remove ${email} from shared admins?`)) return;

        setSharingInProgress(true);
        try {
            await unshareQuiz(quizId, email);
        } catch (error) {
            console.error('Error removing share:', error);
            alert('Failed to remove admin');
        }
        setSharingInProgress(false);
    };

    const timePresets = [15, 30, 45, 60, 90];

    if (quizLoading || questionsLoading) {
        return <LoadingSpinner message="Loading questions..." />;
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

    const optionLabels = ['A', 'B', 'C', 'D'];

    return (
        <div className="manage-questions-page">
            <Header />

            <main className="page-content">
                {/* Page Header */}
                <div className="page-header">
                    <button
                        className="btn btn-ghost back-btn"
                        onClick={() => navigate('/admin')}
                    >
                        ← Back
                    </button>
                    <div className="header-info">
                        <h1>{quiz.title}</h1>
                        <p>Quiz Code: <strong className="quiz-code">{quiz.quizCode}</strong></p>
                    </div>
                    <div className="header-actions">
                        {questions.length > 0 && quiz.status === 'draft' && (
                            <button
                                className="btn btn-accent"
                                onClick={handleStartQuiz}
                            >
                                🚀 Start Quiz
                            </button>
                        )}
                    </div>
                </div>

                {/* Quiz Settings - Duration Editor */}
                <div className="quiz-settings-card">
                    <div className="setting-row">
                        <div className="setting-label">
                            <span className="setting-icon">⏱️</span>
                            <span>Time per Question</span>
                        </div>
                        {!editingDuration ? (
                            <div className="setting-value">
                                <strong>{quiz.timePerQuestion}s</strong>
                                {quiz.status === 'draft' && (
                                    <button
                                        className="btn btn-ghost btn-small"
                                        onClick={() => setEditingDuration(true)}
                                    >
                                        ✏️ Edit
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="setting-editor">
                                <div className="time-presets">
                                    {timePresets.map(time => (
                                        <button
                                            key={time}
                                            className={`preset-btn ${newDuration === time ? 'active' : ''}`}
                                            onClick={() => setNewDuration(time)}
                                        >
                                            {time}s
                                        </button>
                                    ))}
                                </div>
                                <div className="custom-time">
                                    <input
                                        type="number"
                                        min="5"
                                        max="120"
                                        value={newDuration}
                                        onChange={(e) => setNewDuration(parseInt(e.target.value) || 5)}
                                    />
                                    <span>seconds</span>
                                </div>
                                <div className="setting-actions">
                                    <button
                                        className="btn btn-ghost btn-small"
                                        onClick={() => {
                                            setNewDuration(quiz.timePerQuestion);
                                            setEditingDuration(false);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary btn-small"
                                        onClick={handleSaveDuration}
                                        disabled={savingDuration}
                                    >
                                        {savingDuration ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Share Setting */}
                    <div className="setting-row" style={{ marginTop: 'var(--space-lg)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-lg)' }}>
                        <div className="setting-label">
                            <span className="setting-icon">👥</span>
                            <span>Share with Admins</span>
                        </div>
                        <div className="share-section">
                            <div className="share-input-row">
                                <input
                                    type="email"
                                    placeholder="Admin email address"
                                    value={shareEmail}
                                    onChange={(e) => setShareEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleShareQuiz()}
                                />
                                <button
                                    className="btn btn-primary btn-small"
                                    onClick={handleShareQuiz}
                                    disabled={sharingInProgress || !shareEmail.trim()}
                                >
                                    {sharingInProgress ? '...' : '+ Share'}
                                </button>
                            </div>
                            {quiz.sharedWith && quiz.sharedWith.length > 0 && (
                                <div className="shared-list">
                                    {quiz.sharedWith.map(email => (
                                        <div key={email} className="shared-chip">
                                            <span>{email}</span>
                                            <button
                                                className="btn-remove"
                                                onClick={() => handleUnshareQuiz(email)}
                                                title="Remove"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <span className="hint">Only registered admins can be added</span>
                        </div>
                    </div>
                </div>

                <div className="questions-layout">
                    {/* Questions List */}
                    <div className="questions-list">
                        <div className="list-header">
                            <h2>Questions ({questions.length})</h2>
                            {!showForm && quiz.status === 'draft' && (
                                <button
                                    className="btn btn-primary btn-small"
                                    onClick={() => setShowForm(true)}
                                >
                                    + Add Question
                                </button>
                            )}
                        </div>

                        {questions.length === 0 ? (
                            <div className="empty-questions">
                                <p>No questions yet. Add your first question!</p>
                            </div>
                        ) : (
                            <div className="questions-cards">
                                {questions.map((question, idx) => (
                                    <div key={question.id} className="question-card">
                                        <div className="question-number">Q{idx + 1}</div>
                                        <div className="question-content">
                                            <p className="question-text">{question.text}</p>
                                            <div className="options-preview">
                                                {question.options.map((opt, optIdx) => (
                                                    <span
                                                        key={optIdx}
                                                        className={`option-tag ${optIdx === question.correctAnswer ? 'correct' : ''}`}
                                                    >
                                                        {optionLabels[optIdx]}: {opt}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {quiz.status === 'draft' && (
                                            <div className="question-actions">
                                                <button
                                                    className="btn btn-ghost btn-small"
                                                    onClick={() => setEditingQuestion(question)}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-small"
                                                    onClick={() => handleDeleteQuestion(question.id)}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Question Form */}
                    {showForm && quiz.status === 'draft' && (
                        <div className="question-form-container">
                            <form onSubmit={handleSubmit} className="question-form">
                                <div className="form-header-inline">
                                    <h3>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={resetForm}
                                    >
                                        ✕
                                    </button>
                                </div>

                                {errors.length > 0 && (
                                    <div className="error-box">
                                        {errors.map((error, idx) => (
                                            <p key={idx}>⚠️ {error}</p>
                                        ))}
                                    </div>
                                )}

                                {/* Question Text */}
                                <div className="form-group">
                                    <label>Question Text *</label>
                                    <textarea
                                        value={formData.text}
                                        onChange={handleTextChange}
                                        placeholder="Enter your question..."
                                        rows={3}
                                        autoFocus
                                    />
                                </div>

                                {/* Options */}
                                <div className="form-group">
                                    <label>Answer Options (click to mark as correct) *</label>
                                    <div className="options-input">
                                        {formData.options.map((option, idx) => (
                                            <div
                                                key={idx}
                                                className={`option-input-row ${formData.correctAnswer === idx ? 'is-correct' : ''}`}
                                                onClick={() => handleCorrectAnswerChange(idx)}
                                            >
                                                <span className="option-letter">{optionLabels[idx]}</span>
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                    placeholder={`Option ${optionLabels[idx]}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                {formData.correctAnswer === idx && (
                                                    <span className="correct-badge">✓ Correct</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="hint">Click on an option to mark it as the correct answer</span>
                                </div>

                                {/* Submit */}
                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={resetForm}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Add Question')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ManageQuestions;
