import { NoteColor } from "@prisma/client";

export type NoteSortField = "createdAt" | "updatedAt" | "title";
export type SortOrder = "asc" | "desc";

export interface NoteListItem {
  id: string;
  title: string | null;
  contentPreview: string;
  color: NoteColor;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
