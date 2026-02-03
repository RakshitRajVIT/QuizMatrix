// Admin Dashboard - Main hub for quiz management
// Lists all quizzes created by the admin with status indicators

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAdminQuizzes, useQuiz } from '../../hooks/useQuiz';
import { formatDateTime, getStatusColor } from '../../utils/helpers';

const AdminDashboard = () => {
    const { quizzes, loading } = useAdminQuizzes();
    const { deleteQuiz, restartQuiz, createQuizFromJSON } = useQuiz();
    const navigate = useNavigate();
    const [deleting, setDeleting] = useState(null);
    const [restarting, setRestarting] = useState(null);

    // JSON import state
    const [showJsonModal, setShowJsonModal] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [jsonError, setJsonError] = useState('');
    const [importing, setImporting] = useState(false);

    const handleDeleteQuiz = async (quizId, e) => {
        e.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this quiz? This cannot be undone.')) {
            return;
        }

        setDeleting(quizId);
        try {
            await deleteQuiz(quizId);
        } catch (error) {
            console.error('Error deleting quiz:', error);
            alert('Failed to delete quiz');
        }
        setDeleting(null);
    };

    const handleRestartQuiz = async (quizId, e) => {
        e.stopPropagation();

        if (!window.confirm('Restart this quiz? All scores will be reset.')) {
            return;
        }

        setRestarting(quizId);
        try {
            await restartQuiz(quizId);
        } catch (error) {
            console.error('Error restarting quiz:', error);
            alert('Failed to restart quiz');
        }
        setRestarting(null);
    };

    const handleImportJSON = async () => {
        setJsonError('');

        // Parse JSON
        let jsonData;
        try {
            jsonData = JSON.parse(jsonInput);
        } catch {
            setJsonError('Invalid JSON format. Please check your input.');
            return;
        }

        setImporting(true);
        try {
            const result = await createQuizFromJSON(jsonData);
            setShowJsonModal(false);
            setJsonInput('');
            alert(`Quiz created successfully!\nCode: ${result.quizCode}\nQuestions: ${result.questionCount}`);
            navigate(`/admin/quiz/${result.id}`);
        } catch (error) {
            setJsonError(error.message);
        }
        setImporting(false);
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'draft': return '📝 Draft';
            case 'waiting': return '⏳ Waiting';
            case 'live': return '🔴 LIVE';
            case 'ended': return '✅ Ended';
            default: return status;
        }
    };

    const sampleJSON = `{
  "title": "Sample Quiz",
  "timePerQuestion": 30,
  "questions": [
    {
      "text": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": 1
    }
  ]
}`;

    if (loading) {
        return <LoadingSpinner message="Loading your quizzes..." />;
    }

    return (
        <div className="admin-dashboard">
            <Header />

            <main className="dashboard-content">
                {/* Dashboard Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>My Quizzes</h1>
                        <p>Create and manage your live quizzes</p>
                    </div>
                    <div className="header-buttons">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowJsonModal(true)}
                        >
                            📥 Import JSON
                        </button>
                        <button
                            className="btn btn-primary create-btn"
                            onClick={() => navigate('/admin/create')}
                        >
                            <span>+</span> Create New Quiz
                        </button>
                    </div>
                </div>

                {/* JSON Import Modal */}
                {showJsonModal && (
                    <div className="modal-overlay" onClick={() => setShowJsonModal(false)}>
                        <div className="modal-content json-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Import Quiz from JSON</h2>
                                <button className="btn btn-ghost" onClick={() => setShowJsonModal(false)}>✕</button>
                            </div>

                            <div className="modal-body">
                                <p className="modal-hint">Paste your quiz JSON below:</p>

                                {jsonError && (
                                    <div className="error-box">
                                        <p>⚠️ {jsonError}</p>
                                    </div>
                                )}

                                <textarea
                                    className="json-textarea"
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                    placeholder={sampleJSON}
                                    rows={12}
                                />

                                <details className="json-format-help">
                                    <summary>📋 JSON Format Example</summary>
                                    <pre>{sampleJSON}</pre>
                                </details>
                            </div>

                            <div className="modal-footer">
                                <button className="btn btn-ghost" onClick={() => setShowJsonModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleImportJSON}
                                    disabled={importing || !jsonInput.trim()}
                                >
                                    {importing ? 'Importing...' : 'Import Quiz'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quizzes Grid */}
                {quizzes.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h2>No quizzes yet</h2>
                        <p>Create your first quiz to get started!</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/admin/create')}
                        >
                            Create Quiz
                        </button>
                    </div>
                ) : (
                    <div className="quizzes-grid">
                        {quizzes.map((quiz) => (
                            <div
                                key={quiz.id}
                                className="quiz-card"
                                onClick={() => navigate(`/admin/quiz/${quiz.id}`)}
                            >
                                {/* Status Badge */}
                                <div className={`status-badge ${getStatusColor(quiz.status)}`}>
                                    {getStatusLabel(quiz.status)}
                                </div>

                                {/* Quiz Info */}
                                <h3 className="quiz-title">{quiz.title}</h3>

                                <div className="quiz-meta">
                                    <div className="meta-item">
                                        <span className="meta-icon">❓</span>
                                        <span>{quiz.totalQuestions || 0} questions</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="meta-icon">⏱️</span>
                                        <span>{quiz.timePerQuestion}s per question</span>
                                    </div>
                                </div>

                                <div className="quiz-code">
                                    <span>Code:</span>
                                    <strong>{quiz.quizCode}</strong>
                                </div>

                                <div className="quiz-date">
                                    Created: {formatDateTime(quiz.createdAt)}
                                </div>

                                {/* Actions */}
                                <div className="quiz-actions">
                                    {quiz.status === 'draft' && (
                                        <button
                                            className="btn btn-small btn-secondary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/admin/quiz/${quiz.id}/questions`);
                                            }}
                                        >
                                            Add Questions
                                        </button>
                                    )}
                                    {(quiz.status === 'waiting' || quiz.status === 'live') && (
                                        <button
                                            className="btn btn-small btn-accent"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/admin/quiz/${quiz.id}/control`);
                                            }}
                                        >
                                            Control Panel
                                        </button>
                                    )}
                                    {quiz.status === 'ended' && (
                                        <button
                                            className="btn btn-small btn-secondary"
                                            onClick={(e) => handleRestartQuiz(quiz.id, e)}
                                            disabled={restarting === quiz.id}
                                        >
                                            {restarting === quiz.id ? '...' : '🔄 Restart'}
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-small btn-danger"
                                        onClick={(e) => handleDeleteQuiz(quiz.id, e)}
                                        disabled={deleting === quiz.id}
                                    >
                                        {deleting === quiz.id ? '...' : '🗑️'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;

