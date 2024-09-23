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
        const response = await axios.get<CodeBlock>(`https://moveo-task-six.vercel.app/codeblocks/${id}`);
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

    socket.emit('joinCodeBlock', id);

    socket.on('roleAssignment', ({ role }) => {
      setRole(role);
    });

    socket.on('codeUpdate', (newCode: string) => {
      setCode(newCode);
    });

    socket.on('codeChange', (newCode: string) => {
      setCode(newCode);
    });

    socket.on('mentorLeft', () => {
      if (role === 'student') {
        navigate('/'); 
      }
    });

    socket.on('studentCount', ({ studentCount }) => {
      setStudentCount(studentCount);
    });

    socket.on('showSmiley', () => {
      setShowSmiley(true);
    });

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
