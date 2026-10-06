import mongoose, { Schema } from 'mongoose';

export interface IFaq {
  _id: string | mongoose.Types.ObjectId;
  question: string;
  answer: string;
  category: string;
  embedding?: number[];
  embeddingHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FaqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, required: true, index: true },
    embedding: { type: [Number], select: false },
    embeddingHash: { type: String, select: false },
  },
  { timestamps: true }
);

FaqSchema.index({ question: 'text', answer: 'text' });

export default mongoose.models.Faq || mongoose.model('Faq', FaqSchema);


