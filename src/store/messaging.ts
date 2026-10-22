import {create} from "zustand";
import type {Message, PublicUser, ReplyRef, Room} from "../model/common";
import {fetchMessages, fetchRooms, fetchUsers, sendMessage, toggleReaction} from "../messages/messagesApi";

export interface Selection {
    type: "user" | "room";
    id: number;
}

interface MessagingState {
    users: PublicUser[];
    rooms: Room[];
    selection: Selection | null;
    messages: Message[];
    error: string;
    loadUsers: () => Promise<void>;
    loadRooms: () => Promise<void>;
    select: (selection: Selection) => void;
    clearSelection: () => void;
    refreshMessages: () => Promise<void>;
    send: (content: string, image?: string, reply?: ReplyRef | null) => Promise<void>;
    react: (messageId: string, emoji: string) => Promise<void>;
}

export const useMessaging = create<MessagingState>((set, get) => ({
    users: [],
    rooms: [],
    selection: null,
    messages: [],
    error: "",

    loadUsers: async () => {
        try {
            set({users: await fetchUsers(), error: ""});
        } catch (error) {
            set({error: (error as Error).message});
        }
    },

    loadRooms: async () => {
        try {
            set({rooms: await fetchRooms(), error: ""});
        } catch (error) {
            set({error: (error as Error).message});
        }
    },

    select: (selection) => {
        set({selection, messages: [], error: ""});
        get().refreshMessages();
    },

    clearSelection: () => set({selection: null, messages: []}),

    refreshMessages: async () => {
        const selection = get().selection;
        if (selection === null) {
            return;
        }
        try {
            const messages = await fetchMessages(selection);
            set({messages, error: ""});
        } catch (error) {
            set({error: (error as Error).message});
        }
    },

    send: async (content, image, reply) => {
        const selection = get().selection;
        if (selection === null || (content.trim() === "" && !image)) {
            return;
        }
        try {
            await sendMessage(content, selection, image, reply);
            await get().refreshMessages();
        } catch (error) {
            set({error: (error as Error).message});
        }
    },

    react: async (messageId, emoji) => {
        const selection = get().selection;
        if (selection === null) {
            return;
        }
        try {
            await toggleReaction(messageId, emoji, selection);
            await get().refreshMessages();
        } catch (error) {
            set({error: (error as Error).message});
        }
    },
}));
