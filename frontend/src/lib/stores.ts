import { writable } from 'svelte/store';

export interface Chat {
    id: number;
    title: string;
}


export interface Message {
    role: 'user' | 'assistant';
    content: string;
}


export const chats = writable<Chat[]>([]);
export const messages = writable<Message[]>([]);

export const isLoggedIn = writable(false);
export const isAdmin = writable(false);
export const username = writable('perfil');

export const selectedChatId = writable<number | null>(null);
export const selectedModel = writable<string>('qwen');

export const showLogin = writable(false);
export const showSettings = writable(false);
