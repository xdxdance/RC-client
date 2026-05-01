import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, integer, jsonb, index, serial, varchar } from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";

// 文章表
export const articles = pgTable(
  "articles",
  {
    id: serial().primaryKey(),
    url: text("url").notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    summary: text("summary"),
    cover_image: text("cover_image"),
    source: varchar("source", { length: 50 }).notNull().default("other"),
    content: text("content"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("articles_source_idx").on(table.source),
    index("articles_created_at_idx").on(table.created_at),
  ]
);

// 笔记表
export const notes = pgTable(
  "notes",
  {
    id: serial().primaryKey(),
    article_id: integer("article_id").references(() => articles.id, { onDelete: "set null" }),
    content: text("content").notNull(),
    thought: text("thought"),
    note_type: varchar("note_type", { length: 20 }).notNull().default("摘录"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("notes_article_id_idx").on(table.article_id),
    index("notes_note_type_idx").on(table.note_type),
    index("notes_created_at_idx").on(table.created_at),
  ]
);

// 标签表
export const tags = pgTable(
  "tags",
  {
    id: serial().primaryKey(),
    name: varchar("name", { length: 50 }).notNull().unique(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("tags_name_idx").on(table.name),
  ]
);

// 笔记-标签关联表
export const noteTags = pgTable(
  "note_tags",
  {
    id: serial().primaryKey(),
    note_id: integer("note_id").notNull().references(() => notes.id, { onDelete: "cascade" }),
    tag_id: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("note_tags_note_id_idx").on(table.note_id),
    index("note_tags_tag_id_idx").on(table.tag_id),
  ]
);

// 创建 Schema
const { createInsertSchema, createSelectSchema } = createSchemaFactory({ coerce: { date: true } });

// Article schemas
export const insertArticleSchema = createInsertSchema(articles).pick({
  url: true,
  title: true,
  summary: true,
  cover_image: true,
  source: true,
  content: true,
});
export const selectArticleSchema = createSelectSchema(articles);
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

// Note schemas
export const insertNoteSchema = createInsertSchema(notes).pick({
  article_id: true,
  content: true,
  thought: true,
  note_type: true,
});
export const selectNoteSchema = createSelectSchema(notes);
export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

// Tag schemas
export const insertTagSchema = createInsertSchema(tags).pick({
  name: true,
});
export const selectTagSchema = createSelectSchema(tags);
export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

// NoteTag schemas
export const insertNoteTagSchema = createInsertSchema(noteTags).pick({
  note_id: true,
  tag_id: true,
});
export const selectNoteTagSchema = createSelectSchema(noteTags);
export type NoteTag = typeof noteTags.$inferSelect;
export type InsertNoteTag = z.infer<typeof insertNoteTagSchema>;

import { z } from "zod";
