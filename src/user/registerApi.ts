import type {EmptyCallback, ErrorCallback} from "../model/common";
import {CustomError} from "../model/CustomError";

export interface RegisterInput {
    username: string;
    email: string;
    password: string;
}

export function registerUser(input: RegisterInput, onResult: EmptyCallback, onError: ErrorCallback) {
    fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    })
        .then(async (response) => {
            if (response.ok) {
                onResult();
            } else {
                const error = await response.json() as CustomError;
                onError(error);
            }
        }, onError);
}
