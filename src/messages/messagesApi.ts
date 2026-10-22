import type {Message, PublicUser, Room} from "../model/common";
import {useSession} from "../store/session";

function authHeaders(): Record<string, string> {
    const token = useSession.getState().token;
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
    };
}

async function handle(response: Response) {
    if (response.status === 401) {
        useSession.getState().clearSession();
        window.location.href = "/login";
        throw new Error("UNAUTHORIZED");
    }
    if (!response.ok) {
        const error = await response.json() as {message?: string};
        throw new Error(error.message ?? "Erreur serveur");
    }
    return response;
}

export async function fetchUsers(): Promise<PublicUser[]> {
    const response = await handle(await fetch("/api/users", {headers: authHeaders()}));
    return response.json();
}

export async function fetchRooms(): Promise<Room[]> {
    const response = await handle(await fetch("/api/rooms", {headers: authHeaders()}));
    return response.json();
}

export async function fetchMessages(target: {type: "user" | "room", id: number}): Promise<Message[]> {
    const query = target.type === "room" ? `room_id=${target.id}` : `user_id=${target.id}`;
    const response = await handle(await fetch(`/api/message?${query}`, {headers: authHeaders()}));
    // LPUSH met le plus récent en premier : on remet dans l'ordre chronologique
    return (await response.json() as Message[]).reverse();
}

export async function sendMessage(content: string, target: {type: "user" | "room", id: number}, image?: string): Promise<void> {
    const body = target.type === "room"
        ? {content, image, targetRoomId: target.id}
        : {content, image, targetUserId: target.id};
    const response = await handle(await fetch("/api/message", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
    }));
    await response.json();
}

const MAX_SIZE = 4 * 1024 * 1024;

export async function uploadImage(file: File): Promise<string> {
    if (file.size > MAX_SIZE) {
        throw new Error("Image trop volumineuse (max 4 Mo)");
    }
    const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
        reader.readAsDataURL(file);
    });
    const response = await handle(await fetch("/api/upload", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({filename: file.name, contentType: file.type, data}),
    }));
    const {url} = await response.json() as {url: string};
    return url;
}
