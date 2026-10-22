import { db } from '@vercel/postgres';
import {arrayBufferToBase64, stringToArrayBuffer} from "../lib/base64";

export const config = {
    runtime: 'edge',
};

function errorResponse(status, code, message) {
    return new Response(JSON.stringify({code, message}), {
        status,
        headers: {'content-type': 'application/json'},
    });
}

export default async function handler(request) {
    try {
        const {username, email, password} = await request.json();

        if (!username || !email || !password) {
            return errorResponse(400, "MISSING_FIELDS", "Tous les champs sont obligatoires");
        }

        const client = await db.connect();
        const {rowCount} = await client.sql`select 1 from users where username = ${username} or email = ${email}`;
        if (rowCount > 0) {
            return errorResponse(409, "ALREADY_EXISTS", "Ce nom d'utilisateur ou cet email est déjà utilisé");
        }

        const hash = await crypto.subtle.digest('SHA-256', stringToArrayBuffer(username + password));
        const hashed64 = arrayBufferToBase64(hash);
        const externalId = crypto.randomUUID().toString();

        await client.sql`insert into users (username, password, email, created_on, external_id)
                         values (${username}, ${hashed64}, ${email}, now(), ${externalId})`;

        return new Response(JSON.stringify({username}), {
            status: 200,
            headers: {'content-type': 'application/json'},
        });
    } catch (error) {
        console.log(error);
        return errorResponse(500, "SERVER_ERROR", "Erreur lors de l'inscription");
    }
}
