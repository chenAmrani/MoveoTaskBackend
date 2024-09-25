"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const codeBlock_Controller_1 = __importDefault(require("../controllers/codeBlock_Controller"));
const router = express_1.default.Router();
// Get all code blocks
router.get('/', codeBlock_Controller_1.default.getAllCodeBlocks);
// Get code block by ID
router.get('/:id', codeBlock_Controller_1.default.getCodeBlockById);
// Route to get the solution of a code block by ID
router.get('/:id/solution', codeBlock_Controller_1.default.getSolutionById);
exports.default = router;
