// import initApp from "./app";
// import http from 'http';
// import { Server,Socket } from 'socket.io';
// import CodeBlock from './models/codeBlock';


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

//    const codeBlockRooms = new Map<string, string[]>();

//   // Listen for new socket connections
//   io.on('connection', (socket: Socket) => {
//     console.log('A user connected:', socket.id);


//     socket.on('joinCodeBlock', (codeBlockId:string) => {
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

//     socket.on('codeChange', async({ codeBlockId, newCode }: { codeBlockId: string, newCode: string }) => { 
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

//   server.listen(process.env.PORT, () => {
//     console.log(`Server running on http://localhost:${process.env.PORT}`);
//   });
// });

import initApp from "./app";
import http from 'http';
import { Server, Socket } from 'socket.io';
import CodeBlock from './models/codeBlock';

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

  const codeBlockRooms = new Map<string, string[]>(); // roomId -> array of socket ids
  const mentors = new Map<string, string>(); // roomId -> mentor socket id

  io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinCodeBlock', (codeBlockId: string) => {
      if (!codeBlockRooms.has(codeBlockId)) {
        codeBlockRooms.set(codeBlockId, []);
      }
      const codeBlockMembers = codeBlockRooms.get(codeBlockId);
      const role = codeBlockMembers?.length === 0 ? 'mentor' : 'student';
      
      if (role === 'mentor') {
        mentors.set(codeBlockId, socket.id); // Save mentor
      }

      codeBlockMembers?.push(socket.id);
      socket.join(codeBlockId);
      socket.emit('roleAssignment', { role });

      // Notify room about number of students
      const studentCount = codeBlockMembers?.filter(id => id !== mentors.get(codeBlockId)).length || 0;
      io.to(codeBlockId).emit('studentCountUpdate', { count: studentCount });

      console.log(`User ${socket.id} joined code block room: ${codeBlockId} as ${role}`);
    });

    socket.on('codeChange', async ({ codeBlockId, newCode }: { codeBlockId: string, newCode: string }) => {
      try {
        await CodeBlock.findByIdAndUpdate(codeBlockId, { code: newCode });
        socket.to(codeBlockId).emit('codeUpdate', newCode);
        console.log(`Broadcasting code change for code block: ${codeBlockId}`);
      } catch (err) {
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

          // If the disconnected user is the mentor
          if (socket.id === mentors.get(room)) {
            mentors.delete(room);
            // Move all students to LobbyPage
            io.to(room).emit('mentorLeft', { message: 'Mentor has left, moving students to LobbyPage' });
            io.to(room).socketsLeave(room); // Disconnect students from room
          }

          // If no members left, delete room
          if (filteredMembers.length === 0) {
            codeBlockRooms.delete(room);
          }

          console.log(`User ${socket.id} removed from room: ${room}`);
        }
      }
    });
  });

  server.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });
});

