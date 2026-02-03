// Timer - Countdown timer component synced with server timestamp
// Displays remaining time and triggers callback when time is up

import { useState, useEffect, memo, useRef } from 'react';

const Timer = memo(({
    startTime,           // Server timestamp when question started
    duration,            // Duration in seconds
    onTimeUp,           // Callback when time runs out
    isActive = true     // Whether timer should be running
}) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const hasEndedRef = useRef(false);
    const onTimeUpRef = useRef(onTimeUp);

    // Keep ref updated
    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    // Reset when startTime changes (new question)
    useEffect(() => {
        hasEndedRef.current = false;
        setTimeLeft(duration);
    }, [startTime, duration]);

    useEffect(() => {
        if (!isActive || hasEndedRef.current) return;

        // Calculate time left based on server timestamp
        const calculateTimeLeft = () => {
            if (!startTime) return duration;

            const now = Date.now();
            let start;
            if (startTime.toDate) {
                start = startTime.toDate().getTime();
            } else if (startTime.seconds) {
                start = startTime.seconds * 1000;
            } else {
                start = new Date(startTime).getTime();
            }
            const elapsed = Math.floor((now - start) / 1000);
            return Math.max(0, duration - elapsed);
        };

        // Set initial time
        setTimeLeft(calculateTimeLeft());

        // Update every second (not 100ms to reduce re-renders)
        const interval = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);

            if (remaining <= 0 && !hasEndedRef.current) {
                hasEndedRef.current = true;
                clearInterval(interval);
                if (onTimeUpRef.current) onTimeUpRef.current();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, duration, isActive]);

    // Calculate percentage for progress bar
    const percentage = (timeLeft / duration) * 100;

    // Determine color based on time remaining
    const getTimerColor = () => {
        if (percentage > 50) return 'timer-green';
        if (percentage > 25) return 'timer-yellow';
        return 'timer-red';
    };

    return (
        <div className="timer-container">
            <div className="timer-display">
                <span className={`timer-text ${getTimerColor()}`}>
                    {timeLeft}
                </span>
                <span className="timer-label">seconds</span>
            </div>
            <div className="timer-bar-container">
                <div
                    className={`timer-bar ${getTimerColor()}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
});

Timer.displayName = 'Timer';

export default Timer;

