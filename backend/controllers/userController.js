import User from "../models/User.js";

// @route PUT /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, goals, theme, avatar } = req.body;
    const user = req.user;
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (goals !== undefined) user.goals = goals;
    if (theme !== undefined) user.theme = theme;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();
    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

const todayKey = () => new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" in server-local UTC day

// @route GET /api/users/dashboard
export const getDashboardSummary = async (req, res, next) => {
  try {
    const user = req.user;
    const isToday = user.studyMinutesDate === todayKey();

    res.json({
      success: true,
      dashboard: {
        name: user.name,
        streak: user.streak,
        xp: user.xp,
        level: user.level,
        motivation: pickMotivation(),
        todayStudyMinutes: isToday ? user.studyMinutesToday : 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/users/track-study
// Called by the frontend as a periodic "heartbeat" (e.g. every 60s) while the
// user is actively on the page, so we can tally real study minutes per day.
export const trackStudyMinute = async (req, res, next) => {
  try {
    const user = req.user;
    const key = todayKey();

    if (user.studyMinutesDate !== key) {
      user.studyMinutesDate = key;
      user.studyMinutesToday = 0;
    }

    // minutes param lets the client report a small batch (defaults to 1); clamp to avoid abuse
    const minutes = Math.min(Math.max(Number(req.body.minutes) || 1, 1), 5);
    user.studyMinutesToday += minutes;
    user.xp += minutes; // small XP trickle for active study time
    await user.save();

    res.json({ success: true, todayStudyMinutes: user.studyMinutesToday, xp: user.xp });
  } catch (err) {
    next(err);
  }
};

function pickMotivation() {
  const quotes = [
    "Small steps every day lead to big results.",
    "Discipline beats motivation. Show up anyway.",
    "You don't have to be great to start, but you have to start to be great.",
    "Focus on progress, not perfection.",
    "The expert in anything was once a beginner.",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}