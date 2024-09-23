import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { CodeBlock } from '../pages/LobbyPage';

interface CodeBlockListProps {
  codeBlocks: CodeBlock[];
}

const CodeBlockList: React.FC<CodeBlockListProps> = ({ codeBlocks }) => {
  const navigate = useNavigate();
  const customColors = ['#2d2d2d', '#2d2d2d', '#2d2d2d', '#2d2d2d'];
console.log("codeBlocks",codeBlocks);
  return (
    <ListGroup className="list">
      {codeBlocks.map((block, index) => {
        const color = customColors[index] || '#ffff'; 

        return (
          <ListGroup.Item
            key={block._id}
            action
            onClick={() => navigate(`/codeblock/${block._id}`)}
            style={{
              backgroundColor: color,
              justifyContent: 'center',
              width: '100%',
              alignItems: 'center',
              color: 'white',
              textAlign: 'center',
              marginBottom: '25px',
              boxShadow: '0 4px 8px 0 rgba(0,0,0,0.8)',
              borderRadius: '10px',
            }}
          >
            {block.blockTitle}
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};

export default CodeBlockList;
