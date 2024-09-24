import initApp from "./app";
import http from "http";
import { Server } from "socket.io";
import CodeBlock from "./models/codeBlock";
import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  codeBlockId: { type: String, required: true },
  mentor: { type: String, default: null },
  students: { type: [String], default: [] }
});

const Room = mongoose.model("Room", RoomSchema);

initApp().then((app) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true
    }
  });

  // Handle socket connection
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins a code block room
    socket.on("joinCodeBlock", async (codeBlockId: string) => {
      // Find or create a room in the database
      let room = await Room.findOne({ codeBlockId });
      if (!room) {
        room = new Room({ codeBlockId });
        await room.save();
      }

      const codeBlock = await CodeBlock.findById(codeBlockId);
      const solution = codeBlock?.correctSolution;

      let role;
      if (!room.mentor) {
        // First user becomes the mentor
        role = "mentor";
        room.mentor = socket.id;
      } else {
        // All subsequent users become students
        role = "student";
        room.students.push(socket.id);
      }

      await room.save();  // Persist mentor and student data

      socket.join(codeBlockId);
      socket.emit("roleAssignment", { role });

      io.in(codeBlockId).emit("studentCount", { studentCount: room.students.length });

      // Listen for code changes from students
      socket.on("codeChange", async ({ codeBlockId, newCode }) => {
        try {
          await CodeBlock.findByIdAndUpdate(codeBlockId, { code: newCode });
          
          socket.to(codeBlockId).emit("codeChange", newCode);

          if (newCode === solution) {
            io.in(codeBlockId).emit("showSmiley");
            console.log(`Solution matched for code block ${codeBlockId}, showing smiley.`);
          }
        } catch (err) {
          console.error(`Error updating code block ${codeBlockId}:`, err);
          socket.emit("error", "Failed to update code block");
        }
      });

      // Handle mentor leaving the room
      socket.on("mentorLeft", async () => {
        if (room?.mentor === socket.id) {
          room.mentor = ' ';
          room.students = [];
          await room.save();
          io.in(codeBlockId).emit("mentorLeft");
        }
      });

      // Handle user disconnection
      socket.on("disconnect", async () => {
        console.log("User disconnected:", socket.id);

        if (room?.mentor === socket.id) {
          io.in(codeBlockId).emit("mentorLeft");
          await Room.deleteOne({ codeBlockId });  // Delete room from the database
        } else if (room?.students.includes(socket.id)) {
          room.students = room.students.filter((studentId) => studentId !== socket.id);
          await room.save();
          io.in(codeBlockId).emit("studentCount", { studentCount: room.students.length });
        }
      });
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
