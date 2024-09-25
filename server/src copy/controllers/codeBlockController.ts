import { Request, Response } from 'express';
import CodeBlock from '../models/codeBlock';
import codeBlockService from '../services/codeBlockService';

// Get all code blocks
const getAllCodeBlocks = async (req: Request, res: Response) => {
  try {
    const codeBlocks = await codeBlockService.getAllCodeBlocks();
    res.json(codeBlocks);
  } catch (err) {
    res.status(500).json( {message: "Failed to get All Code Blocks", err });
  }
};

// Get code block by ID
const getCodeBlockById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const codeBlock = await codeBlockService.getCodeBlockById(id);
    if (!codeBlock) {
      return res.status(404).json({ message: 'Code block not found' });
    }
    res.json(codeBlock);
  } catch (err) {
    res.status(500).json({message: "Failed to get  Code Block by id", err });
  }
};

// Get solution by code block ID
const getSolutionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const solution = await codeBlockService.getSolutionById(id);
    if (solution === null) {
      return res.status(404).json({ message: 'Solution not found or no solution available' });
    }
    res.json({ solution });
  } catch (err) {
    res.status(500).json({message: "Failed to get  solution by id", err });
  }
};

export default{
    getAllCodeBlocks,
    getCodeBlockById,
    getSolutionById
};
