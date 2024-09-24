import initApp from "./app";
import http from "http";
import { Server } from "socket.io";
import CodeBlock from "./models/codeBlock";


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

//   const codeBlockRooms = new Map<string,string[]>();
//   //{ block1: ['user123', 'user456'] }
  
//   io.on('connection', (socket) => {
//     console.log('A user connected:', socket.id);

//     socket.on('joinCodeBlock', (codeBlockId) => {
//       if(!codeBlockRooms.has(codeBlockId)){
//         codeBlockRooms.set(codeBlockId,[]);
//       }
//       const codeBlockMembers = codeBlockRooms.get(codeBlockId);
//       const role= codeBlockMembers?.length === 0? 'mentor' : 'student';
//       codeBlockMembers?.push(socket.id);
//       socket.join(codeBlockId);
//       socket.emit('roleAssignment', { role });
//       console.log(`User ${socket.id} joined code block room: ${codeBlockId} as ${role}`);
//     });

//     socket.on('codeChange', async({ codeBlockId, newCode }) => {
//       try{
//         await CodeBlock.findByIdAndUpdate(codeBlockId, { code: newCode });
//         socket.to(codeBlockId).emit('codeUpdate', newCode);
//         console.log(`Broadcasting code change for code block: ${codeBlockId}`);
//       }catch(err){
//         console.error(`Error updating code block ${codeBlockId}:`, err);
//         socket.emit('error', 'Failed to update code block');
//       }
//     });

//     socket.on('disconnect', () => {
//       console.log('User disconnected:', socket.id);
//       for (const room of codeBlockRooms.keys()) {
//         const members = codeBlockRooms.get(room);
//         if (members?.includes(socket.id)) {
//           const filteredMembers = members.filter((member)=> member !== socket.id);
//           codeBlockRooms.set(room,filteredMembers);
//           console.log(`User ${socket.id} removed from room: ${room}`);
//           if (members.length === 0) {
//             codeBlockRooms.delete(room);
//           }
//         }
//       }
//     });
//   });

//     const port = process.env.PORT || 3000;
//     server.listen(port, () => {
//       console.log(`Server running on http://localhost:${port}`);
//     });
 
// });

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

  const codeBlockRooms = new Map<string,string[]>();
  
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinCodeBlock', (codeBlockId) => {
      if(!codeBlockRooms.has(codeBlockId)){
        codeBlockRooms.set(codeBlockId, []); // Initialize room if it doesn't exist
      }
      const codeBlockMembers = codeBlockRooms.get(codeBlockId) || [];
      
      const role = codeBlockMembers.length === 0 ? 'mentor' : 'student'; // First user becomes mentor, rest are students
      
      codeBlockMembers.push(socket.id); // Add user to the room's member list
      codeBlockRooms.set(codeBlockId, codeBlockMembers); // Update the room with the new member list
      
      socket.join(codeBlockId); // User joins the room

      // Emit role assignment to the user
      socket.emit('roleAssignment', { role });

      // Broadcast the updated student count to all users in the room
      const studentCount = codeBlockMembers.length - 1; // Students exclude the mentor
      io.to(codeBlockId).emit('studentCount', { studentCount });

      console.log(`User ${socket.id} joined code block room: ${codeBlockId} as ${role}`);
    });

    socket.on('codeChange', async({ codeBlockId, newCode }) => {
      try{
        await CodeBlock.findByIdAndUpdate(codeBlockId, { code: newCode });
        socket.to(codeBlockId).emit('codeUpdate', newCode);
        console.log(`Broadcasting code change for code block: ${codeBlockId}`);
      }catch(err){
        console.error(`Error updating code block ${codeBlockId}:`, err);
        socket.emit('error', 'Failed to update code block');
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      for (const room of codeBlockRooms.keys()) {
        const members = codeBlockRooms.get(room);
        if (members?.includes(socket.id)) {
          const filteredMembers = members.filter(member => member !== socket.id);
          codeBlockRooms.set(room, filteredMembers);
          console.log(`User ${socket.id} removed from room: ${room}`);

          if (filteredMembers.length === 0) {
            codeBlockRooms.delete(room); // Remove room if no members
          } else {
            const studentCount = filteredMembers.length - 1; // Recalculate student count
            io.to(room).emit('studentCount', { studentCount });
          }
        }
      }
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});





