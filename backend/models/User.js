import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const deviceSessionSchema = new mongoose.Schema(
  {
    device: String,
    ip: String,
    userAgent: String,
    loggedInAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 300 },
    goals: [{ type: String }],
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    refreshTokens: [{ type: String, select: false }],
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastStudyDate: { type: Date },
    studyMinutesToday: { type: Number, default: 0 },
    studyMinutesDate: { type: String, default: "" }, // stores a "YYYY-MM-DD" key; reset when the day changes
    deviceHistory: [deviceSessionSchema],
    role: { type: String, enum: ["student", "admin"], default: "student" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    goals: this.goals,
    theme: this.theme,
    xp: this.xp,
    level: this.level,
    streak: this.streak,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);