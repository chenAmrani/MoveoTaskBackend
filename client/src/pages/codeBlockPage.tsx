import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from '../components/codeBlockEditor.tsx';
import { initSocketConnection } from '../utilities/api-client';
import { Container, Row, Col } from 'react-bootstrap';
// import '../styles/CodeBlockPage.css';
import axios from 'axios';
import { CodeBlock } from '../pages/LobbyPage'

const CodeBlockPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [role, setRole] = useState<'mentor' | 'student'>('student');
  const [code, setCode] = useState('');
  const [codeBlockTitle, setCodeBlockTitle] = useState<string>('');
  const [socket, setSocket] = useState<ReturnType<typeof initSocketConnection> | null>(null);


  useEffect(() => {
    const fetchCodeBlock = async () => {
      try {
        const response = await axios.get<CodeBlock>(`https://moveo-task-pink.vercel.app/codeblocks/${id}`);
        setCodeBlockTitle(response.data.title);
        setCode(response.data.code);
      } catch (error) {
        console.error('Error fetching code block:', error);
      }
    };
    fetchCodeBlock();

    const socket = initSocketConnection();
    
    setSocket(socket);

    socket.emit('joinCodeBlock', id); 

    socket.on('roleAssignment', ({ role }) => {
      setRole(role);
    });

    socket.on('codeUpdate', (newCode: string) => {
      setCode(newCode);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

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

      <Row >
        <Col md={3}>
          <div className="role-permissions">
            <h3>Role: {role}</h3>
            <p>Permissions: {role === 'mentor' ? 'View Only' : 'Edit'}</p>
          </div>
        </Col>
        <Col md={9}>
          <div className="code-editor-wrapper">
            <CodeEditor code={code} onChange={handleCodeChange} isEditable={role === 'student'} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CodeBlockPage;
