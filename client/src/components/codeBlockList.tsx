// import React from 'react';
// import { Card, Button, Row, Col, Container } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';
// import { CodeBlock } from '../pages/LobbyPage';
// import '../styles/codeBlockList.css';

// interface CodeBlockListProps {
//   codeBlocks: CodeBlock[];
// }

// const CodeBlockList: React.FC<CodeBlockListProps> = ({ codeBlocks }) => {
//   const navigate = useNavigate();

//   return (
//     <Container>
//       <Row className="justify-content-center mt-4">
//         {codeBlocks.map((block) => (
//           <Col
//             key={block._id}
//             xs={12}
//             md={8}
//             lg={6}
//             className="mb-4"
//           >
//             <Card className="h-100 shadow-sm">
//               <Card.Body className="d-flex flex-column">
//                 <Card.Title>{block.title}</Card.Title>
//                 <Card.Text className="text-truncate">
//                   {block.code}
//                 </Card.Text>
//                 <Button
//                   variant="primary"
//                   className="mt-auto"
//                   onClick={() => navigate(`/codeblock/${block._id}`)}
//                 >
//                   Open Code Block
//                 </Button>
//               </Card.Body>
//             </Card>
//           </Col>
//         ))}
//       </Row>
//     </Container>
//   );
// };

// export default CodeBlockList;


import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { CodeBlock } from '../pages/LobbyPage';

interface CodeBlockListProps {
  codeBlocks: CodeBlock[];
}

export const CodeBlockList: React.FC<CodeBlockListProps> = ({ codeBlocks }) => {
  const navigate = useNavigate();
  const customColors = ['#F19CBB', '#1AC69C', '#3FA4FF', '#C478FF'];

  return (
    <ListGroup className="w-100">
      {codeBlocks.map((block, index) => {
        const color = customColors[index] || '#333'; 

        return (
          <ListGroup.Item
            key={block._id}
            action
            onClick={() => navigate(`/codeblock/${block._id}`)}
            style={{
              backgroundColor: color,
              color: 'white',
              textAlign: 'center',
              marginBottom: '10px'
            }}
          >
            {block.title}
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};


