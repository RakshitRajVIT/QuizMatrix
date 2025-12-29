// Admin Leaderboard / Results Page - Final quiz results with CSV download
// Shows all participants ranked by score

import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import Leaderboard from '../../components/Leaderboard';
import { useQuizSubscription, useParticipantsSubscription } from '../../hooks/useQuiz';
import { convertToCSV, downloadCSV } from '../../utils/helpers';

const AdminLeaderboard = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { quiz, loading: quizLoading } = useQuizSubscription(quizId);
    const { participants, loading: participantsLoading } = useParticipantsSubscription(quizId);

    const handleDownloadCSV = () => {
        const csvContent = convertToCSV(participants, quiz.title);
        const filename = `${quiz.title.replace(/\s+/g, '_')}_results.csv`;
        downloadCSV(csvContent, filename);
    };

    if (quizLoading || participantsLoading) {
        return <LoadingSpinner message="Loading results..." />;
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

    // Sort participants by score
    const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

    return (
        <div className="admin-results-page">
            <Header />

            <main className="results-content">
                {/* Header */}
                <div className="results-header">
                    <button
                        className="btn btn-ghost back-btn"
                        onClick={() => navigate('/admin')}
                    >
                        ← Back to Dashboard
                    </button>
                    <div className="header-center">
                        <h1>{quiz.title}</h1>
                        <p>Quiz Results</p>
                    </div>
                    <button
                        className="btn btn-primary download-btn"
                        onClick={handleDownloadCSV}
                        disabled={participants.length === 0}
                    >
                        📥 Download CSV
                    </button>
                </div>

                {/* Stats Summary */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-icon">👥</span>
                        <span className="stat-value">{participants.length}</span>
                        <span className="stat-label">Participants</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">❓</span>
                        <span className="stat-value">{quiz.totalQuestions || 0}</span>
                        <span className="stat-label">Questions</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">🏆</span>
                        <span className="stat-value">
                            {sortedParticipants[0]?.score || 0}
                        </span>
                        <span className="stat-label">Top Score</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">📊</span>
                        <span className="stat-value">
                            {participants.length > 0
                                ? Math.round(participants.reduce((a, b) => a + (b.score || 0), 0) / participants.length)
                                : 0
                            }
                        </span>
                        <span className="stat-label">Average Score</span>
                    </div>
                </div>

                {/* Podium for Top 3 */}
                {sortedParticipants.length >= 3 && (
                    <div className="podium">
                        {/* 2nd Place */}
                        <div className="podium-place second">
                            <img
                                src={sortedParticipants[1]?.photoURL || '/default-avatar.png'}
                                alt=""
                                className="podium-avatar"
                                referrerPolicy="no-referrer"
                            />
                            <span className="podium-name">{sortedParticipants[1]?.displayName}</span>
                            <span className="podium-score">{sortedParticipants[1]?.score}</span>
                            <div className="podium-block">🥈</div>
                        </div>

                        {/* 1st Place */}
                        <div className="podium-place first">
                            <img
                                src={sortedParticipants[0]?.photoURL || '/default-avatar.png'}
                                alt=""
                                className="podium-avatar"
                                referrerPolicy="no-referrer"
                            />
                            <span className="podium-name">{sortedParticipants[0]?.displayName}</span>
                            <span className="podium-score">{sortedParticipants[0]?.score}</span>
                            <div className="podium-block">🥇</div>
                        </div>

                        {/* 3rd Place */}
                        <div className="podium-place third">
                            <img
                                src={sortedParticipants[2]?.photoURL || '/default-avatar.png'}
                                alt=""
                                className="podium-avatar"
                                referrerPolicy="no-referrer"
                            />
                            <span className="podium-name">{sortedParticipants[2]?.displayName}</span>
                            <span className="podium-score">{sortedParticipants[2]?.score}</span>
                            <div className="podium-block">🥉</div>
                        </div>
                    </div>
                )}

                {/* Full Leaderboard */}
                <div className="full-results">
                    <Leaderboard
                        participants={participants}
                        title="Complete Rankings"
                        maxDisplay={100}
                    />
                </div>
            </main>
        </div>
    );
};

export default AdminLeaderboard;
