import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

export const buildEditorExtensions = (placeholder: string) => [
  StarterKit.configure({
    codeBlock: {
      HTMLAttributes: {
        class:
          "rounded-2xl bg-slate-900 text-slate-100 p-6 font-mono text-sm shadow-inner border border-slate-800",
      },
    },
  }),
  Markdown.configure({
    html: false,
    tightLists: true,
    tightListClass: "tight",
    breaks: true,
    transformPastedText: true,
    transformCopiedText: false,
  }),
  Image.configure({
    HTMLAttributes: {
      class: "max-w-full h-auto rounded-2xl mx-auto my-8 shadow-md",
    },
  }),
  Placeholder.configure({ placeholder }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right", "justify"],
    defaultAlignment: "justify",
  }),
  Table.configure({ resizable: false, HTMLAttributes: { class: "tt-table" } }),
  TableRow,
  TableHeader,
  TableCell,
  TaskList,
  TaskItem.configure({ nested: true }),
];