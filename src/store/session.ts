import {create} from "zustand";
import type {Session} from "../model/common";

interface SessionState {
    token: string;
    username?: string;
    externalId: string;
    id?: number;
    setSession: (session: Session) => void;
    clearSession: () => void;
}

function read(key: string): string {
    return sessionStorage.getItem(key) ?? "";
}

export const useSession = create<SessionState>((set) => ({
    token: read("token"),
    username: read("username") || undefined,
    externalId: read("externalId"),
    id: Number(read("id")) || undefined,
    setSession: (session) => {
        sessionStorage.setItem("token", session.token);
        sessionStorage.setItem("username", session.username ?? "");
        sessionStorage.setItem("externalId", session.externalId);
        sessionStorage.setItem("id", String(session.id ?? ""));
        set({token: session.token, username: session.username, externalId: session.externalId, id: session.id});
    },
    clearSession: () => {
        sessionStorage.clear();
        set({token: "", username: undefined, externalId: "", id: undefined});
    },
}));
