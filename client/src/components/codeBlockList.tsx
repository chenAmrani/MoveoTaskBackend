import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { CodeBlock } from '../pages/LobbyPage';

interface CodeBlockListProps {
  codeBlocks: CodeBlock[];
}

const CodeBlockList: React.FC<CodeBlockListProps> = ({ codeBlocks }) => {
  const navigate = useNavigate();
  const customColors = ['#FFFF', '#FFFF', '#FFFF', '#FFFF'];
console.log("codeBlocks",codeBlocks);
  return (
    <ListGroup className="w-100">
      {codeBlocks.map((block, index) => {
        const color = customColors[index] || '#ffff'; 

        return (
          <ListGroup.Item
            key={block._id}
            action
            onClick={() => navigate(`/codeblock/${block._id}`)}
            style={{
              backgroundColor: color,
              color: 'red',
              textAlign: 'center',
              marginBottom: '10px'
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
