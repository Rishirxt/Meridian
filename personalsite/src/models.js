import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * ─── TASKS SCHEMA ────────────────────────────────────────────────────────────
 * Currently managed as 'todos' in localStorage.
 */
const TaskSchema = new Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
  priority: { type: String, enum: ['high', 'normal', 'low'], default: 'normal' },
  tag: { type: String, default: 'general' },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  userId: { type: Schema.Types.ObjectId, ref: 'User' }, // For multi-user support later
}, { timestamps: true });

/**
 * ─── HABITS SCHEMA ───────────────────────────────────────────────────────────
 * Currently managed as 'habits' in localStorage.
 */
const HabitSchema = new Schema({
  name: { type: String, required: true },
  icon: { type: String, default: '✦' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

/**
 * ─── HABIT LOGS SCHEMA ───────────────────────────────────────────────────────
 * Currently managed as 'habit_done' (a flat object mapping keys like "id-date-idx").
 * In MongoDB, we store these as individual completion records.
 */
const HabitLogSchema = new Schema({
  habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  status: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

/**
 * ─── GOALS SCHEMA ────────────────────────────────────────────────────────────
 * Currently managed as 'goals' in localStorage.
 */
const GoalSchema = new Schema({
  name: { type: String, required: true },
  desc: { type: String },
  icon: { type: String, default: '🎯' },
  color: { type: String, default: 'var(--gold)' },
  progress: { type: Number, default: 0 },
  deadline: { type: String },
  completed: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

/**
 * ─── FOCUS SESSIONS SCHEMA ───────────────────────────────────────────────────
 * Currently managed as 'focus_sessions' in localStorage.
 */
const FocusSessionSchema = new Schema({
  task: { type: String, required: true },
  category: { type: String, default: 'General' },
  duration: { type: Number, required: true }, // Minutes
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String }, // Format: HH:MM
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

/**
 * ─── NOTES SCHEMA ────────────────────────────────────────────────────────────
 * Currently managed as 'notes' in localStorage.
 */
const NoteSchema = new Schema({
  title: { type: String, default: 'Untitled Note' },
  body: { type: String, default: '' },
  tag: { type: String, default: 'General' },
  color: { type: String, default: 'var(--gold)' },
  date: { type: String }, // User-friendly date string
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

/**
 * ─── USER SETTINGS SCHEMA ────────────────────────────────────────────────────
 * Captures miscellaneous state like mood and pomodoro preferences.
 */
const UserSettingsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true },
  mood: { type: String },
  pom_sessions: { type: Number, default: 0 },
  pom_work: { type: Number, default: 25 },
  pom_short: { type: Number, default: 5 },
}, { timestamps: true });

// Export Models
export const Task = mongoose.model('Task', TaskSchema);
export const Habit = mongoose.model('Habit', HabitSchema);
export const HabitLog = mongoose.model('HabitLog', HabitLogSchema);
export const Goal = mongoose.model('Goal', GoalSchema);
export const FocusSession = mongoose.model('FocusSession', FocusSessionSchema);
export const Note = mongoose.model('Note', NoteSchema);
export const UserSettings = mongoose.model('UserSettings', UserSettingsSchema);
