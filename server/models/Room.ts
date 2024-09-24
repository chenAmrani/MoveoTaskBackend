import mongoose, { Schema, Document } from 'mongoose';

interface IRoom extends Document {
  codeBlockId: string;
  mentor: string | null;
  students: string[];
}

const RoomSchema: Schema = new Schema({
  codeBlockId: { type: String, required: true, unique: true },
  mentor: { type: String, default: null },
  students: { type: [String], default: [] }
});

export default mongoose.model<IRoom>('Room', RoomSchema);