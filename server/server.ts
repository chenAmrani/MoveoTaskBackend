// import initApp from "./app";
// import http from "http";
// import { Server } from "socket.io";
// import CodeBlock from "./models/codeBlock";


// initApp().then((app) => {
//   const server = http.createServer(app);
//   const io = new Server(server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST"],
//       allowedHeaders: ["Content-Type"],
//       credentials: true
//     }
//   });

//     const codeBlockRooms = new Map<string, { mentor: string | null; students: string[] }>();

    
//     io.on("connection", (socket) => {
//       console.log("User connected:", socket.id);

      
//       socket.on("joinCodeBlock", async (codeBlockId: string) => {
//         if (!codeBlockRooms.has(codeBlockId)) {
//           codeBlockRooms.set(codeBlockId, { mentor: null, students: [] });
//         }

//         const room = codeBlockRooms.get(codeBlockId);
//         const codeBlock = await CodeBlock.findById(codeBlockId); 
//         const solution = codeBlock?.correctSolution; 

      
//         let role;
//         if (!room?.mentor) {
//           role = "mentor";
//           room!.mentor = socket.id;
//         } else {
//           role = "student";
//           room!.students.push(socket.id);
//         }

//         socket.join(codeBlockId);
//         socket.emit("roleAssignment", { role });
//         io.in(codeBlockId).emit("studentCount", { studentCount: room?.students.length || 0 });

        
//         socket.on("codeChange", async ({ codeBlockId, newCode }) => {
//           try {
//             await CodeBlock.findByIdAndUpdate(codeBlockId, { code: newCode });
            
//             socket.to(codeBlockId).emit("codeChange", newCode); 

//             if (newCode === solution) {
//               io.in(codeBlockId).emit("showSmiley");
//               console.log(`Solution matched for code block ${codeBlockId}, showing smiley.`);
//             }
//           } catch (err) {
//             console.error(`Error updating code block ${codeBlockId}:`, err);
//             socket.emit("error", "Failed to update code block");
//           }
//         });

     
//         socket.on("mentorLeft", ({ codeBlockId }) => {
//           if (room?.mentor === socket.id) {
//             room.mentor = null;
//             io.in(codeBlockId).emit("mentorLeft"); 
//             room.students = []; 
//           }
//         });

       
//         socket.on("disconnect", () => {
//           console.log("User disconnected:", socket.id);
//           for (const [roomId, room] of codeBlockRooms.entries()) {
//             if (room.mentor === socket.id) {
//               io.in(roomId).emit("mentorLeft");
//               codeBlockRooms.delete(roomId);
//             } else if (room.students.includes(socket.id)) {
//               room.students = room.students.filter((studentId) => studentId !== socket.id);
//               io.in(roomId).emit("studentCount", { studentCount: room.students.length });
//             }
//           }
//         });
//       });
//     });

//     const port = process.env.PORT || 3000;
//     server.listen(port, () => {
//       console.log(`Server running on http://localhost:${port}`);
//     });
 
// });


import initApp from "./app";
import http from "http";
import { Server } from "socket.io";
import CodeBlock from "./models/codeBlock";
import mongoose from "mongoose";
import Room from "./models/Room";  // Assume Room is a model like CodeBlock

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
      let room = await Room.findOne({ codeBlockId });
      if (!room) {
        room = new Room({ codeBlockId, mentor: socket.id, students: [] });
        await room.save();
        console.log(`New room created with ${socket.id} as mentor.`);
      }

      const codeBlock = await CodeBlock.findById(codeBlockId); 
      const solution = codeBlock?.correctSolution;

      let role;
      if (!room.mentor) {
        role = "mentor";
        room.mentor = socket.id;
      } else {
        role = "student";
        room.students.push(socket.id);
        await room.save();
      }

      socket.join(codeBlockId);
      socket.emit("roleAssignment", { role });
      io.in(codeBlockId).emit("studentCount", { studentCount: room.students.length });

      socket.on("codeChange", async ({ newCode }) => {
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

      socket.on("mentorLeft", async () => {
        if (room.mentor === socket.id) {
          room.mentor = null;
          room.students = [];
          await room.save();
          io.in(codeBlockId).emit("mentorLeft");
        }
      });

      socket.on("disconnect", async () => {
        console.log("User disconnected:", socket.id);
        if (room.mentor === socket.id) {
          io.in(codeBlockId).emit("mentorLeft");
          await Room.deleteOne({ codeBlockId });
        } else if (room.students.includes(socket.id)) {
          room.students = room.students.filter(id => id !== socket.id);
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