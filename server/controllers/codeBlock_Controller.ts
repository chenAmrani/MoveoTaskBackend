import { Request, Response } from 'express';
import CodeBlock from '../models/codeBlock';

// Controller to handle fetching all code blocks
const getAllCodeBlocks = async (req: Request, res: Response) => {
  try {
    const codeBlocks = await CodeBlock.find();
    res.status(200).json(codeBlocks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch code blocks', error });
  }
};

// Controller to handle fetching a code block by ID
const getCodeBlockById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const codeBlock = await CodeBlock.findById(id);
    if (!codeBlock) {
      return res.status(404).json({ message: 'Code block not found' });
    }
    res.status(200).json(codeBlock);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch code block', error });
  }
};

// Controller to handle fetching the solution of a code block by ID
const getSolutionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const codeBlock = await CodeBlock.findById(id);
    if (!codeBlock) {
      return res.status(404).json({ message: 'Code block not found' });
    }
    res.status(200).json({ solution: codeBlock.correctSolution });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch solution', error });
  }
};


export default{
    getAllCodeBlocks,
    getCodeBlockById,
    getSolutionById
};