"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Schema definition for the CodeBlock model
const CodeBlockSchema = new mongoose_1.Schema({
    blockTitle: { type: String, required: true },
    blockCode: { type: String, required: true },
    correctSolution: { type: String, required: true },
});
// Export the model
exports.default = (0, mongoose_1.model)('CodeBlock', CodeBlockSchema);
