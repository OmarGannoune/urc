import { put } from '@vercel/blob';
import {getConnecterUser, triggerNotConnected} from "../lib/session";

const MAX_SIZE = 4 * 1024 * 1024; // limite de la request body Vercel (~4.5Mo)
const ALLOWED = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export default async (request, response) => {
    try {
        const user = await getConnecterUser(request);
        if (user === undefined || user === null) {
            console.log("Not connected");
            triggerNotConnected(response);
            return;
        }

        if (request.method !== "POST") {
            response.status(405).json({code: "METHOD_NOT_ALLOWED", message: "Méthode non supportée"});
            return;
        }

        const {filename, contentType, data} = request.body;
        if (!data || !ALLOWED.includes(contentType)) {
            response.status(400).json({code: "BAD_FILE", message: "Fichier invalide (png, jpeg, gif, webp uniquement)"});
            return;
        }

        const buffer = Buffer.from(data, "base64");
        if (buffer.length > MAX_SIZE) {
            response.status(413).json({code: "TOO_LARGE", message: "Image trop volumineuse (max 4 Mo)"});
            return;
        }

        const safeName = (filename ?? "image").replace(/[^a-zA-Z0-9._-]/g, "_");
        const pathname = `images/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;

        const blob = await put(pathname, buffer, {
            access: "public",
            contentType,
            addRandomSuffix: false,
        });

        response.status(200).json({url: blob.url});
    } catch (error) {
        console.log(error);
        response.status(500).json({code: "SERVER_ERROR", message: "Échec de l'envoi de l'image"});
    }
};
