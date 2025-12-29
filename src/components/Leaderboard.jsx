// Leaderboard - Displays ranked list of participants with scores
// Updates in real-time and highlights current user

import { useAuth } from '../context/AuthContext';

const Leaderboard = ({
    participants = [],
    showRank = true,
    maxDisplay = 10,
    title = "Leaderboard"
}) => {
    const { user } = useAuth();

    // Sort participants by score (highest first), then by join time
    const sortedParticipants = [...participants].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(a.joinedAt) - new Date(b.joinedAt);
    });

    // Get top N participants
    const displayList = sortedParticipants.slice(0, maxDisplay);

    // Find current user's rank
    const currentUserRank = sortedParticipants.findIndex(p => p.oduid === user?.uid) + 1;

    // Get medal emoji for top 3
    const getMedal = (rank) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return null;
        }
    };

    return (
        <div className="leaderboard">
            <h3 className="leaderboard-title">{title}</h3>

            {displayList.length === 0 ? (
                <p className="leaderboard-empty">No participants yet</p>
            ) : (
                <div className="leaderboard-list">
                    {displayList.map((participant, index) => {
                        const rank = index + 1;
                        const isCurrentUser = participant.oduid === user?.uid;
                        const medal = getMedal(rank);

                        return (
                            <div
                                key={participant.oduid}
                                className={`leaderboard-item ${isCurrentUser ? 'current-user' : ''} ${rank <= 3 ? 'top-three' : ''}`}
                            >
                                {showRank && (
                                    <span className="rank">
                                        {medal || `#${rank}`}
                                    </span>
                                )}
                                <div className="participant-info">
                                    {participant.photoURL && (
                                        <img
                                            src={participant.photoURL}
                                            alt=""
                                            className="participant-avatar"
                                            referrerPolicy="no-referrer"
                                        />
                                    )}
                                    <span className="participant-name">
                                        {participant.displayName || 'Anonymous'}
                                        {isCurrentUser && <span className="you-badge">(You)</span>}
                                    </span>
                                </div>
                                <span className="score">{participant.score || 0}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Show current user if they're not in top N */}
            {currentUserRank > maxDisplay && (
                <div className="current-user-rank">
                    <span>Your Rank: #{currentUserRank}</span>
                    <span>Score: {sortedParticipants[currentUserRank - 1]?.score || 0}</span>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
