import Note from "../models/Note.js";
import { askAI } from "./aiController.js";

// @route GET /api/notes
export const getNotes = async (req, res, next) => {
  try {
    const { search, folder, tag } = req.query;
    const query = { user: req.user._id };
    if (folder) query.folder = folder;
    if (tag) query.tags = tag;
    if (search) query.$text = { $search: search };

    const notes = await Note.find(query).sort({ pinned: -1, updatedAt: -1 });
    res.json({ success: true, notes });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/notes/:id
export const getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    res.json({ success: true, note });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/notes
export const createNote = async (req, res, next) => {
  try {
    const { title, content, subject, tags, folder } = req.body;
    const note = await Note.create({
      user: req.user._id,
      title: title || "Untitled note",
      content: content || "",
      subject,
      tags,
      folder,
    });
    res.status(201).json({ success: true, note });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/notes/:id
export const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    res.json({ success: true, note });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/notes/:id
export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    res.json({ success: true, message: "Note deleted" });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/notes/:id/summarize
export const summarizeNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });

    const summary = await askAI([
      { role: "system", content: "You are a concise study assistant. Summarize the given note in under 120 words, using clear bullet points." },
      { role: "user", content: note.content },
    ]);

    note.aiSummary = summary;
    await note.save();
    res.json({ success: true, summary });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/notes/:id/flashcards
export const generateFlashcardsFromNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });

    const raw = await askAI([
      {
        role: "system",
        content:
          'Generate 6 flashcards from the note as strict JSON only: {"flashcards":[{"question":"...","answer":"..."}]}. No markdown, no commentary.',
      },
      { role: "user", content: note.content },
    ]);

    let flashcards = [];
    try {
      flashcards = JSON.parse(raw.replace(/```json|```/g, "").trim()).flashcards;
    } catch {
      flashcards = [];
    }

    res.json({ success: true, flashcards });
  } catch (err) {
    next(err);
  }
};
