"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const codeBlock_1 = __importDefault(require("../models/codeBlock"));
// Controller to handle fetching all code blocks
const getAllCodeBlocks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const codeBlocks = yield codeBlock_1.default.find();
        res.status(200).json(codeBlocks);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch code blocks', error });
    }
});
// Controller to handle fetching a code block by ID
const getCodeBlockById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const codeBlock = yield codeBlock_1.default.findById(id);
        if (!codeBlock) {
            return res.status(404).json({ message: 'Code block not found' });
        }
        res.status(200).json(codeBlock);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch code block', error });
    }
});
// Controller to handle fetching the solution of a code block by ID
const getSolutionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const codeBlock = yield codeBlock_1.default.findById(id);
        if (!codeBlock) {
            return res.status(404).json({ message: 'Code block not found' });
        }
        res.status(200).json({ solution: codeBlock.correctSolution });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch solution', error });
    }
});
exports.default = {
    getAllCodeBlocks,
    getCodeBlockById,
    getSolutionById
};
