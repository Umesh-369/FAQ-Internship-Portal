import mongoose, { Schema } from 'mongoose';

const QuerySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    category: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium', index: true },
    status: { type: String, enum: ['Pending', 'In Progress', 'Solved'], default: 'Pending', index: true },
    adminReply: { type: String },
  },
  { timestamps: true }
);

// Compound index for student dashboard queries
QuerySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Query || mongoose.model('Query', QuerySchema);
