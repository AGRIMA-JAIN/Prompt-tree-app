const { z } = require("zod");


 //CreatePromptBody
const CreatePromptBody = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().min(1, "title is required"),
  description: z.string().optional().default(""),
  parentId: z.number().int().positive().nullable().optional(),
});


//UpdateNotesBody
const UpdateNotesBody = z.object({
  notes: z.string().default(""),
});


 //CreateNodeBody
 const CreateNodeBody = z.object({
  name: z.string().min(1, "name is required"),
  action: z.string().optional().default(""),
});


 //UpdateNodeNotesBody
 const UpdateNodeNotesBody = z.object({
  notes: z.string().default(""),
});

module.exports = {
  CreatePromptBody,
  UpdateNotesBody,
  CreateNodeBody,
  UpdateNodeNotesBody,
};
