import CodeBlock, { ICodeBlock } from '../models/codeBlock';

// Get all code blocks from the database
const getAllCodeBlocks = async (): Promise<ICodeBlock[]> => {
  return await CodeBlock.find();
};

// Get code block by ID from the database
const getCodeBlockById = async (id: string): Promise<ICodeBlock | null> => {
  return await CodeBlock.findById(id);
};

// Fetch the solution for a code block by ID
const getSolutionById = async (id: string): Promise<string | null> => {
    const codeBlock = await CodeBlock.findById(id);
    return codeBlock ? codeBlock.solution : null;
  };

export default{
    getAllCodeBlocks,
    getCodeBlockById,
    getSolutionById
};
