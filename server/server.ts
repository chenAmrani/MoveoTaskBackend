import initApp from "./app";
import http from "http";
import { Server } from "socket.io";
import CodeBlock from "./models/codeBlock"

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

    const codeBlockRooms = new Map<string, string[]>(); 
    // Example structure: { block1: ['user123', 'user456'] }

    // Socket.IO connection handler
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Join a code block room
      socket.on("joinCodeBlock", (codeBlockId: string) => {
        if (!codeBlockRooms.has(codeBlockId)) {
          codeBlockRooms.set(codeBlockId, []);
        }

        const codeBlockMembers = codeBlockRooms.get(codeBlockId);
        const role = codeBlockMembers?.length === 0 ? "mentor" : "student";

        codeBlockMembers?.push(socket.id);
        socket.join(codeBlockId);
        socket.emit("roleAssignment", { role });
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

      // Handle user disconnection
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        for (const [room, members] of codeBlockRooms.entries()) {
          if (members.includes(socket.id)) {
            const filteredMembers = members.filter((member) => member !== socket.id);
            codeBlockRooms.set(room, filteredMembers);
            console.log(`User ${socket.id} removed from room: ${room}`);

            // If no members are left in the room, delete the room
            if (filteredMembers.length === 0) {
              codeBlockRooms.delete(room);
            }
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
