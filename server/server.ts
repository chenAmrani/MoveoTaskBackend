import initApp from "./app";
import http from "http";
import { Server } from "socket.io";
import CodeBlock from "./models/codeBlock";

// Initialize the application
const startServer = async () => {
  try {
    const app = await initApp();

    // Create the HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO with CORS options
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
      }
    });

    const codeBlockRooms = new Map<string, { mentor: string | null, students: string[] }>(); 
    // Example structure: { block1: { mentor: 'user123', students: ['user456', 'user789'] } }

    // Socket.IO connection handler
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Join a code block room
      socket.on("joinCodeBlock", (codeBlockId: string) => {
        if (!codeBlockRooms.has(codeBlockId)) {
          codeBlockRooms.set(codeBlockId, { mentor: null, students: [] });
        }

        const room = codeBlockRooms.get(codeBlockId);

        // Assign role based on the current state of the room
        let role;
        if (!room?.mentor) {
          role = "mentor";
          room!.mentor = socket.id; 
        } else {
          role = "student";
          room!.students.push(socket.id); 
        }

        socket.join(codeBlockId);
        socket.emit("roleAssignment", { role });

        // Broadcast the updated number of students in the room
        io.in(codeBlockId).emit("studentCount", { studentCount: room?.students.length || 0 });
        console.log(`User ${socket.id} joined code block room: ${codeBlockId} as ${role}`);
      });

      // Handle code changes
      socket.on("codeChange", async ({ codeBlockId, newCode }: { codeBlockId: string; newCode: string }) => {
        try {
          await CodeBlock.findByIdAndUpdate(codeBlockId, { code: newCode });
          socket.to(codeBlockId).emit("codeUpdate", newCode);
          console.log(`Broadcasting code change for code block: ${codeBlockId}`);
        } catch (err) {
          console.error(`Error updating code block ${codeBlockId}:`, err);
          socket.emit("error", "Failed to update code block");
        }
      });

     
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        for (const [roomId, room] of codeBlockRooms.entries()) {
          if (room.mentor === socket.id) {
            console.log(`Mentor ${socket.id} left the room: ${roomId}`);
            room.mentor = null;
            io.in(roomId).emit("mentorLeft"); 
            room.students.forEach((studentId) => {
              io.sockets.sockets.get(studentId)?.leave(roomId); 
            });
            room.students = []; 
          } else if (room.students.includes(socket.id)) {
          
            room.students = room.students.filter((studentId) => studentId !== socket.id);
            io.in(roomId).emit("studentCount", { studentCount: room.students.length }); 
            console.log(`Student ${socket.id} left the room: ${roomId}`);
          }


          if (!room.mentor && room.students.length === 0) {
            codeBlockRooms.delete(roomId);
            console.log(`Room ${roomId} has been deleted`);
          }
        }
      });
    });

    // Start the server
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });

  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

// Run the server
startServer();
