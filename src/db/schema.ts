import {
    pgTable,
    serial,
    varchar,
    text,
    timestamp,
    pgEnum,
    boolean,
    integer
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const plans = pgTable('plans', {
    id: serial('id').primaryKey().notNull(),
    name: varchar('name', { length: 50 }).notNull(),
    description: text('description'),
    price: integer('price').default(0).notNull(),
    maxMessages: integer('max_messages').default(100).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});


export const users = pgTable('users', {
    id: serial('id').primaryKey().notNull(),
    admin: boolean('admin').default(false).notNull(),
    planId: integer('plan_id')
        .references(() => plans.id),

    username: varchar('username', { length: 50 }).notNull(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chats = pgTable('chats', {
    id: serial('id').primaryKey().notNull(),

    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),

    title: varchar('title', { length: 100 }).default('Nuevo Chat').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const roleEnum = pgEnum('role', ['user', 'assistant', 'system']);

export const messages = pgTable('mensajes', {
    id: serial('id').primaryKey().notNull(),

    chatId: integer('chat_id')
        .notNull()
        .references(() => chats.id, { onDelete: 'cascade' }),

    role: roleEnum('role').notNull(),

    content: text('content').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
    chats: many(chats),
    sessions: many(sessions),
    plan: one(plans, {
        fields: [users.planId],
        references: [plans.id],
    }),
}));



export const plansRelations = relations(plans, ({ many }) => ({
    users: many(users),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
    user: one(users, {
        fields: [chats.userId],
        references: [users.id],
    }),
    messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    chat: one(chats, {
        fields: [messages.chatId],
        references: [chats.id],
    }),
}));
