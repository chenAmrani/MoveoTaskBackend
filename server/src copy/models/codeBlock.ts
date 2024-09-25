import mongoose, { Schema } from 'mongoose';

export interface ICodeBlock {
  title: string;
  code: string;
  solution: string;
}

const codeBlockSchema = new Schema<ICodeBlock>({
  title: { type: String, required: true },
  code: { type: String, required: true },
  solution: { type: String, required: true }
});

export default mongoose.model<ICodeBlock>('CodeBlock', codeBlockSchema);
