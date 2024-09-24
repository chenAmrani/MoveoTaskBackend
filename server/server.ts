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

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  
    socket.on("joinCodeBlock", async (codeBlockId: string) => {
      console.log(`User ${socket.id} attempting to join room ${codeBlockId}`);
      let room = await Room.findOne({ codeBlockId });
      if (!room) {
        console.log(`No room found for ${codeBlockId}, creating new room.`);
        room = new Room({ codeBlockId });
        await room.save();
      } else {
        console.log(`Room found for ${codeBlockId}, mentor: ${room.mentor}, students: ${room.students.length}`);
      }
  
      let role;
      if (!room.mentor) {
        role = "mentor";
        room.mentor = socket.id;
        console.log(`Assigning mentor role to ${socket.id} for room ${codeBlockId}`);
      } else {
        role = "student";
        room.students.push(socket.id);
        console.log(`Assigning student role to ${socket.id} for room ${codeBlockId}`);
      }
  
      await room.save();
      socket.join(codeBlockId);
      socket.emit("roleAssignment", { role });
      io.in(codeBlockId).emit("studentCount", { studentCount: room.students.length });
    });
  
    socket.on("disconnect", () => {
      console.log(`User ${socket.id} disconnected.`);
      // Handle disconnection logic
    });
  });
  

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
