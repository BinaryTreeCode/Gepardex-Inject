import {
    mysqlTable,
    bigint,
    varchar,
    text,
    timestamp,
    mysqlEnum,
    boolean
} from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';

export const plans = mysqlTable('plans', {
    id: bigint('id', { mode: 'number', unsigned: true }).primaryKey().autoincrement().notNull(),
    name: varchar('name', { length: 50 }).notNull(),
    description: text('description'),
    price: bigint('price', { mode: 'number' }).default(0).notNull(),
    maxMessages: bigint('max_messages', { mode: 'number' }).default(100).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});


export const users = mysqlTable('users', {
    id: bigint('id', { mode: 'number', unsigned: true }).primaryKey().autoincrement().notNull(),
    admin: boolean('admin').default(false).notNull(),
    planId: bigint('plan_id', { mode: 'number', unsigned: true })
        .references(() => plans.id),

    username: varchar('username', { length: 50 }).notNull(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const chats = mysqlTable('chats', {
    id: bigint('id', { mode: 'number', unsigned: true }).primaryKey().autoincrement().notNull(),

    userId: bigint('user_id', { mode: 'number', unsigned: true })
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),

    title: varchar('title', { length: 100 }).default('Nuevo Chat').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});


export const messages = mysqlTable('mensajes', {
    id: bigint('id', { mode: 'number', unsigned: true }).primaryKey().autoincrement().notNull(),

    chatId: bigint('chat_id', { mode: 'number', unsigned: true })
        .notNull()
        .references(() => chats.id, { onDelete: 'cascade' }),

    role: mysqlEnum('role', ['user', 'assistant', 'system']).notNull(),

    content: text('content').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Un Usuario tiene muchos Chats y un Plan
export const usersRelations = relations(users, ({ one, many }) => ({
    chats: many(chats),
    plan: one(plans, {
        fields: [users.planId],
        references: [plans.id],
    }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
    users: many(users),
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