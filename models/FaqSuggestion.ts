import mongoose, { Schema } from 'mongoose';

const FaqSuggestionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    question: { type: String, required: true },
    suggestedAnswer: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
    adminReview: { type: String },
  },
  { timestamps: true }
);

// Compound index for student dashboard queries
FaqSuggestionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.FaqSuggestion || mongoose.model('FaqSuggestion', FaqSuggestionSchema);
