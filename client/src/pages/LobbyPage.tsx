import React, { useEffect, useState } from 'react';

import axios from 'axios'; 

import { Container } from 'react-bootstrap';
// import CodeBlockEditor from '../components/codeBlockEditor';
import {CodeBlockList} from "../../src/components/codeBlockList.tsx";
// import "../styles/lobbyPage.css";
import "../styles/LobbyPage.css";

export interface CodeBlock {
  _id: string;
  title: string;
  code:string;
}

const LobbyPage: React.FC = () => {

  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);

  useEffect(() => {
    const fetchCodeBlocks = async () => {
      try {
        const response = await axios.get<CodeBlock[]>('https://moveo-task-pink.vercel.app/codeblocks'); 
        setCodeBlocks(response.data);
      } catch (error) {
        console.error('Error fetching code blocks:', error);
      }
    };

    fetchCodeBlocks();
  }, []);



  return (
    <Container fluid className="lobbyPage">
      <div>
        <div className="text-center mb-5">
          <h1 className="mb-5">Welcome Tom code web</h1>
          <h2 className="mb-4">please choose one Code Block</h2>
        </div> 
        <CodeBlockList codeBlocks={codeBlocks} />
      </div>
    </Container>
  );
};

export default LobbyPage;
