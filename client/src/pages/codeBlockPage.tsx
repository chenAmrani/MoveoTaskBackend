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
  const [code, setCode] = useState(''); // Code that is being edited/displayed
  const [codeBlockTitle, setCodeBlockTitle] = useState<string>(''); // Code block title
  const [studentCount, setStudentCount] = useState<number>(0); // Number of students in the room
  const [socket, setSocket] = useState<ReturnType<typeof initSocketConnection> | null>(null); // Socket connection
  const [showSmiley, setShowSmiley] = useState(false); // Whether to show smiley face

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

    // Join the code block room
    socket.emit('joinCodeBlock', id);

    // Listen for role assignment from the server
    socket.on('roleAssignment', ({ role }) => {
      setRole(role);
    });

    socket.on('codeUpdate', (newCode: string) => {
      setCode(newCode);
    });

    // Listen for code updates from other users (mentor sees student updates)
    socket.on('codeChange', (newCode: string) => {
      setCode(newCode);
    });

    // Listen for mentor leaving and redirect students
    socket.on('mentorLeft', () => {
      if (role === 'student') {
        navigate('/'); // Redirect students to the lobby if the mentor leaves
      }
    });

    // Listen for student count updates
    socket.on('studentCount', ({ studentCount }) => {
      setStudentCount(studentCount);
    });

    // Listen for smiley event when the student matches the solution
    socket.on('showSmiley', () => {
      setShowSmiley(true);
    });

    // Clean up socket connection on unmount
    return () => {
      if (role === 'mentor') {
        socket.emit('mentorLeft', { codeBlockId: id });
      }
      socket.disconnect();
    };
  }, [id, role, navigate]);

  // Handle code changes made by the student
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (role === 'student') {
      // Emit code change to the server for real-time broadcast to the mentor
      socket?.emit('codeChange', { codeBlockId: id, newCode });
    }
  };

  return (
    <Container fluid className="code-block-container">
      <div className="code-block-title">
        <h1>{codeBlockTitle}</h1>
      </div>
      {showSmiley ? (
        <div className="smiley-face">😊</div> // Show smiley face if the code matches the solution
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
