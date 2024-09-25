import express from 'express';
import codeBlockController from '../controllers/codeBlockController';

const router = express.Router();

// Get all code blocks
router.get('/', codeBlockController.getAllCodeBlocks);

// Get code block by ID
router.get('/:id', codeBlockController.getCodeBlockById);

// Route to get the solution of a code block by ID
router.get('/:id/solution', codeBlockController.getSolutionById);

export default router;