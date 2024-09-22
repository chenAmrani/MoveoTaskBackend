// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import CodeEditor from '../components/codeBlockEditor';
// import { initSocketConnection } from '../utilities/api-client';
// import { Container, Row, Col } from 'react-bootstrap';
// import '../styles/codeBlockPage.css';
// import axios from 'axios';
// import { CodeBlock } from '../pages/LobbyPage';

// const CodeBlockPage: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [role, setRole] = useState<'mentor' | 'student'>('student'); // Default to student
//   const [code, setCode] = useState('');
//   const [codeBlockTitle, setCodeBlockTitle] = useState<string>('');
//   const [socket, setSocket] = useState<ReturnType<typeof initSocketConnection> | null>(null);

//   useEffect(() => {
//     const fetchCodeBlock = async () => {
//       try {
//         const response = await axios.get<CodeBlock>(`http://localhost:3000/codeblocks/${id}`);
//         console.log('Fetched code block:', response.data);
//         setCodeBlockTitle(response.data.blockTitle);
//         setCode(response.data.blockCode);
//       } catch (error) {
//         console.error('Error fetching code block:', error);
//       }
//     };
//     fetchCodeBlock();
//   }, [id]);

//   useEffect(() => {
//     const socket = initSocketConnection();
//     setSocket(socket);

//     // Join the code block
//     socket.emit('joinCodeBlock', id);

//     // Listen for role assignment from the server
//     socket.on('roleAssignment', ({ role }) => {
//       console.log(`Role assigned: ${role}`);
//       setRole(role);
//     });

//     // Listen for code updates
//     socket.on('codeChange', (newCode: string) => {
//       console.log('Code updated:', newCode);
//       setCode(newCode);
//     });

//     // Handle mentor leaving the session
//     socket.on('mentorLeft', () => {
//       console.log('Mentor left event received');
//       if (role === 'student') {
//         console.log('Student is resetting code and navigating to LobbyPage');
//         socket.emit('resetCode', { codeBlockId: id });
//         setTimeout(() => {
//           navigate('/LobbyPage');
//         }, 100); // slight delay to ensure socket and role state updates
//       }
//     });

//     // Clean up on unmount
//     return () => {
//       if (role === 'mentor') {
//         console.log('Mentor is leaving, emitting mentorLeaving event');
//         socket.emit('mentorLeft', { codeBlockId: id });
//       }
//       console.log('Disconnecting socket');
//       socket.disconnect();
//     };
//   }, [id, role, navigate]);

//   const handleCodeChange = (newCode: string) => {
//     setCode(newCode);
//     if (role === 'student') {
//       console.log('Student is emitting code change');
//       socket?.emit('codeChange', { codeBlockId: id, newCode });
//     }
//   };

//   return (
//     <Container fluid className="code-block-container">
//       <div className="code-block-title">
//         <h1>{codeBlockTitle}</h1>
//       </div>
//       <Row>
//         <Col md={3}>
//           <div className="role-permissions">
//             <h1>Role: {role}</h1>
//             <p>Permissions: {role === 'mentor' ? 'View Only' : 'Edit'}</p>
//           </div>
//         </Col>
//         <Col md={9}>
//           <div className="code-editor-wrapper">
//             <CodeEditor code={code} onChange={handleCodeChange} isEditable={role === 'student'} />
//           </div>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default CodeBlockPage;



import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodeEditor from '../components/codeBlockEditor';
import { initSocketConnection } from '../utilities/api-client';
import { Container, Row, Col } from 'react-bootstrap';
import '../styles/codeBlockPage.css';
import axios from 'axios';
import { CodeBlock } from '../pages/LobbyPage';

const CodeBlockPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<'mentor' | 'student'>('student'); // Default to student
  const [code, setCode] = useState('');
  const [codeBlockTitle, setCodeBlockTitle] = useState<string>('');
  const [studentCount, setStudentCount] = useState<number>(0);
  const [socket, setSocket] = useState<ReturnType<typeof initSocketConnection> | null>(null);
  const [showSmiley, setShowSmiley] = useState(false);

  useEffect(() => {
    const fetchCodeBlock = async () => {
      try {
        const response = await axios.get<CodeBlock>(`http://localhost:3000/codeblocks/${id}`);
        setCodeBlockTitle(response.data.blockTitle);
        setCode(response.data.blockCode);
      } catch (error) {
        console.error('Error fetching code block:', error);
      }
    };
    fetchCodeBlock();
  }, [id]);

  useEffect(() => {
    const socket = initSocketConnection();
    setSocket(socket);

    // Join the code block
    socket.emit('joinCodeBlock', id);

    // Listen for role assignment from the server
    socket.on('roleAssignment', ({ role }) => {
      setRole(role);
    });

    // Listen for code updates
    socket.on('codeChange', (newCode: string) => {
      setCode(newCode);
    });

    // Listen for mentor leaving
    socket.on('mentorLeft', () => {
      if (role === 'student') {
        navigate('/');
      }
    });

    // Listen for student count updates
    socket.on('studentCount', ({ studentCount }) => {
      setStudentCount(studentCount);
    });

    // Listen for smiley event
    socket.on('showSmiley', () => {
      setShowSmiley(true);
    });

    // Clean up on unmount
    return () => {
      if (role === 'mentor') {
        socket.emit('mentorLeft', { codeBlockId: id });
      }
      socket.disconnect();
    };
  }, [id, role, navigate]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (role === 'student') {
      socket?.emit('codeChange', { codeBlockId: id, newCode });
    }
  };

  return (
    <Container fluid className="code-block-container">
      <div className="code-block-title">
        <h1>{codeBlockTitle}</h1>
      </div>
      {showSmiley ? (
        <div className="smiley-face">😊</div>
      ) : (
        <Row>
          <Col md={3}>
            <div className="role-permissions">
              <h1>Role: {role}</h1>
              <p>Permissions: {role === 'mentor' ? 'View Only' : 'Edit'}</p>
              <p>Students in Room: {studentCount}</p>
            </div>
          </Col>
          <Col md={9}>
            <div className="code-editor-wrapper">
              <CodeEditor code={code} onChange={handleCodeChange} isEditable={role === 'student'} />
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CodeBlockPage;
