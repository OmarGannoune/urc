import {CustomError} from "./CustomError";

export const AUTHENT_HEADER = "Authorization";
export const BEARER = "Bearer ";

export interface User {
    user_id: number;
    username: string;
    email?: string;
    password: string;
    last_login?: string;
    external_id?: string;
}

export interface Session {
    token: string;
    username?: string;
    id?: number;
    externalId: string;
}

export interface PublicUser {
    user_id: number;
    username: string;
    last_login?: string;
}

export interface Room {
    room_id: number;
    name: string;
    created_on?: string;
}

export interface ReplyRef {
    id: string;
    from: number;
    fromName: string;
    content: string;
    date: string;
    image?: string | null;
}

export interface Message {
    id?: string;
    from: number;
    fromName: string;
    content: string;
    date: string;
    image?: string | null;
    reply?: ReplyRef | null;
    reactions?: Record<string, number[]>;
}


export interface EmptyCallback {
    (): void;
}

export interface SessionCallback {
    (session: Session): void;
}


export interface ErrorCallback {
    (error: CustomError): void;
}

