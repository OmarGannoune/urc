import React, {useEffect, useRef, useState} from "react";
import {Form, Button, InputGroup} from "react-bootstrap";
import {useMessaging} from "../store/messaging";
import {useSession} from "../store/session";
import {uploadImage} from "./messagesApi";
import type {Message, ReplyRef} from "../model/common";
import {
    Image as ImageIcon,
    PaperPlaneRight,
    X,
    Chats,
    ArrowBendUpLeft,
    Smiley,
} from "@phosphor-icons/react";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

function messageKey(message: Message): string {
    return message.id ?? `${message.from}-${message.date}`;
}

function toReplyRef(message: Message): ReplyRef {
    return {
        id: messageKey(message),
        from: message.from,
        fromName: message.fromName,
        content: message.content,
        date: message.date,
        image: message.image ?? null,
    };
}

export function Conversation() {
    const selection = useMessaging((state) => state.selection);
    const messages = useMessaging((state) => state.messages);
    const users = useMessaging((state) => state.users);
    const rooms = useMessaging((state) => state.rooms);
    const myId = useSession((state) => state.id);
    const send = useMessaging((state) => state.send);
    const react = useMessaging((state) => state.react);
    const [content, setContent] = useState("");
    const [image, setImage] = useState<string | undefined>(undefined);
    const [replyTo, setReplyTo] = useState<ReplyRef | null>(null);
    const [pickerFor, setPickerFor] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    // reset brouillon quand on change de conversation
    useEffect(() => {
        setReplyTo(null);
        setPickerFor(null);
        setContent("");
        setImage(undefined);
    }, [selection]);

    if (selection === null) {
        return (
            <div className="empty-state">
                <Chats size={44} weight="duotone"/>
                <p>Choisissez une conversation à gauche</p>
            </div>
        );
    }

    const title = selection.type === "room"
        ? "# " + (rooms.find((room) => room.room_id === selection.id)?.name ?? "")
        : (users.find((user) => user.user_id === selection.id)?.username ?? "");

    const scrollTo = (id: string) => {
        const element = document.querySelector(`[data-mid="${id}"]`);
        element?.scrollIntoView({behavior: "smooth", block: "center"});
    };

    const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (file === undefined) {
            return;
        }
        setUploading(true);
        try {
            setImage(await uploadImage(file));
        } catch (error) {
            console.log(error);
            alert((error as Error).message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (content.trim() === "" && !image) {
            return;
        }
        send(content, image, replyTo);
        setContent("");
        setImage(undefined);
        setReplyTo(null);
    };

    return (
        <div className="conversation">
            <h5 className="conversation-title">{title}</h5>

            <div className="message-list">
                {messages.length === 0 &&
                    <div className="empty-state">
                        <Chats size={32} weight="duotone"/>
                        <p>Aucun message</p>
                    </div>
                }
                {messages.map((message) => {
                    const key = messageKey(message);
                    const reactions = message.reactions ?? {};
                    return (
                        <div
                            key={key}
                            data-mid={key}
                            className={"message " + (message.from === myId ? "message-sent" : "message-received")}
                        >
                            {message.reply &&
                                <div
                                    className="reply-quote"
                                    onClick={() => scrollTo(message.reply!.id)}
                                    title="Aller au message cité"
                                >
                                    <span className="reply-quote-author">{message.reply.fromName}</span>
                                    <span className="reply-quote-text">
                                        {message.reply.content || (message.reply.image ? "Image" : "")}
                                    </span>
                                </div>
                            }
                            <div className="message-meta">
                                {message.fromName} · {new Date(message.date).toLocaleString()}
                            </div>
                            {message.image &&
                                <a href={message.image} target="_blank" rel="noreferrer">
                                    <img src={message.image} alt="image" className="message-image"/>
                                </a>
                            }
                            {message.content && <div className="message-content">{message.content}</div>}

                            {Object.keys(reactions).length > 0 &&
                                <div className="reaction-chips">
                                    {EMOJIS.filter((emoji) => (reactions[emoji] ?? []).length > 0).map((emoji) => {
                                        const ids = reactions[emoji] ?? [];
                                        const mine = ids.some((id) => Number(id) === Number(myId));
                                        return (
                                            <button
                                                key={emoji}
                                                type="button"
                                                className={"reaction-chip" + (mine ? " mine" : "")}
                                                onClick={() => react(key, emoji)}
                                            >
                                                <span>{emoji}</span>
                                                <span>{ids.length}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            }

                            <div className="message-actions">
                                <button
                                    type="button"
                                    className="message-action-btn"
                                    title="Répondre"
                                    onClick={() => setReplyTo(toReplyRef(message))}
                                >
                                    <ArrowBendUpLeft size={14}/>
                                </button>
                                <button
                                    type="button"
                                    className="message-action-btn"
                                    title="Réagir"
                                    onClick={() => setPickerFor(pickerFor === key ? null : key)}
                                >
                                    <Smiley size={14}/>
                                </button>
                                {pickerFor === key &&
                                    <div className="reaction-picker">
                                        {EMOJIS.map((emoji) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => {
                                                    react(key, emoji);
                                                    setPickerFor(null);
                                                }}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                }
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef}/>
            </div>

            {image &&
                <div className="image-preview">
                    <img src={image} alt="aperçu"/>
                    <Button size="sm" variant="outline-secondary" onClick={() => setImage(undefined)}>
                        <X size={14}/> Retirer
                    </Button>
                </div>
            }

            <Form onSubmit={handleSubmit} className="message-form">
                {replyTo &&
                    <div className="reply-bar">
                        <ArrowBendUpLeft size={15}/>
                        <span className="reply-bar-text">
                            Réponse à <b>{replyTo.fromName}</b> : {replyTo.content || (replyTo.image ? "Image" : "")}
                        </span>
                        <button type="button" className="message-action-btn" onClick={() => setReplyTo(null)}>
                            <X size={14}/>
                        </button>
                    </div>
                }
                <InputGroup className="mb-2">
                    <Form.Control
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        placeholder="Message"
                    />
                    <Button
                        variant="outline-primary"
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                    >
                        <ImageIcon size={16} weight="fill"/> {uploading ? "Envoi..." : "Image"}
                    </Button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/webp"
                        hidden
                        onChange={handleFile}
                    />
                </InputGroup>
                <Button type="submit" variant="primary" className="w-100">
                    <PaperPlaneRight size={16} weight="fill"/> Envoyer
                </Button>
            </Form>
        </div>
    );
}
