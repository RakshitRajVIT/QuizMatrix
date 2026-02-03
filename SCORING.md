# QuizMatrix Scoring System

## How Scores Are Calculated

QuizMatrix uses a **speed-based scoring system** that rewards both accuracy and quick responses.

---

## Score Formula

```
Total Score = Base Score + Speed Bonus
```

### Base Score: **100 points**
- Awarded for every **correct answer**
- Wrong answers earn **0 points**

### Speed Bonus: **Up to 50 points**
- Faster responses earn more bonus points
- Formula: `Speed Bonus = (1 - timeTaken / maxTime) × 50`

---

## Examples

### Example 1: Quick Answer
| Setting | Value |
|---------|-------|
| Time limit per question | 30 seconds |
| Time taken to answer | 5 seconds |
| Answer | ✅ Correct |

**Calculation:**
- Base Score = 100
- Speed Bonus = (1 - 5/30) × 50 = 0.833 × 50 = **41 points**
- **Total = 141 points**

---

### Example 2: Slow Answer
| Setting | Value |
|---------|-------|
| Time limit per question | 30 seconds |
| Time taken to answer | 25 seconds |
| Answer | ✅ Correct |

**Calculation:**
- Base Score = 100
- Speed Bonus = (1 - 25/30) × 50 = 0.167 × 50 = **8 points**
- **Total = 108 points**

---

### Example 3: Last Second Answer
| Setting | Value |
|---------|-------|
| Time limit per question | 30 seconds |
| Time taken to answer | 30 seconds |
| Answer | ✅ Correct |

**Calculation:**
- Base Score = 100
- Speed Bonus = (1 - 30/30) × 50 = 0 × 50 = **0 points**
- **Total = 100 points**

---

### Example 4: Wrong Answer
| Setting | Value |
|---------|-------|
| Time limit per question | 30 seconds |
| Time taken to answer | 2 seconds |
| Answer | ❌ Wrong |

**Calculation:**
- **Total = 0 points** (wrong answers always get 0)

---

## Summary Table

| Time Taken (30s limit) | Speed Bonus | Total Score |
|------------------------|-------------|-------------|
| 0 seconds | +50 | 150 |
| 5 seconds | +41 | 141 |
| 10 seconds | +33 | 133 |
| 15 seconds | +25 | 125 |
| 20 seconds | +16 | 116 |
| 25 seconds | +8 | 108 |
| 30 seconds | +0 | 100 |

---

## Key Points

1. ✅ **Correct answers** = 100-150 points
2. ❌ **Wrong answers** = 0 points
3. ⏱️ **Faster = More points**
4. 📊 **Minimum score for correct answer** = 100 points
5. 🏆 **Maximum score for correct answer** = 150 points

---

## Leaderboard

Participants are ranked by **total score** (sum of all question scores). In case of a tie, the participant who answered faster overall ranks higher.
