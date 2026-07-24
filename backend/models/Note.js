import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, default: "" }, // markdown
    subject: { type: String, default: "General" },
    tags: [{ type: String }],
    folder: { type: String, default: "Uncategorized" },
    pinned: { type: Boolean, default: false },
    aiSummary: { type: String, default: "" },
  },
  { timestamps: true }
);

noteSchema.index({ title: "text", content: "text", tags: "text" });

export default mongoose.model("Note", noteSchema);
