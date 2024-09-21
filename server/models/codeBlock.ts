import { Schema, model, Document } from 'mongoose';

// Interface for CodeBlock document
export interface CodeBlockDocument extends Document {
  blockTitle: string;
  blockCode: string;
  correctSolution: string;
}

// Schema definition for the CodeBlock model
const CodeBlockSchema = new Schema<CodeBlockDocument>({
  blockTitle: { type: String, required: true },
  blockCode: { type: String, required: true },
  correctSolution: { type: String, required: true },
});

// Export the model
export default model<CodeBlockDocument>('CodeBlock', CodeBlockSchema);
