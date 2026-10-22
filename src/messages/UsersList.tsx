import React from "react";
import {useNavigate, useParams} from "react-router-dom";
import {ListGroup} from "react-bootstrap";
import {useMessaging} from "../store/messaging";
import {useSession} from "../store/session";

export function UsersList() {
    const users = useMessaging((state) => state.users);
    const rooms = useMessaging((state) => state.rooms);
    const myId = useSession((state) => state.id);
    const navigate = useNavigate();
    const {type, id} = useParams();

    const others = users.filter((user) => user.user_id !== myId);

    const itemClass = (itemType: string, itemId: number) =>
        (type === itemType && Number(id) === itemId) ? "active-conversation" : "";

    return (
        <div className="users-list">
            <h6 className="list-title">Salons</h6>
            <ListGroup>
                {rooms.map((room) => (
                    <ListGroup.Item
                        key={"room-" + room.room_id}
                        action
                        className={itemClass("room", room.room_id)}
                        onClick={() => navigate(`/messages/room/${room.room_id}`)}
                    >
                        # {room.name}
                    </ListGroup.Item>
                ))}
            </ListGroup>

            <h6 className="list-title">Utilisateurs</h6>
            <ListGroup>
                {others.map((user) => (
                    <ListGroup.Item
                        key={"user-" + user.user_id}
                        action
                        className={itemClass("user", user.user_id)}
                        onClick={() => navigate(`/messages/user/${user.user_id}`)}
                    >
                        <div>{user.username}</div>
                        {user.last_login &&
                            <small className="text-muted">vu le {user.last_login}</small>
                        }
                    </ListGroup.Item>
                ))}
                {others.length === 0 &&
                    <ListGroup.Item className="text-muted">Aucun autre utilisateur</ListGroup.Item>
                }
            </ListGroup>
        </div>
    );
}
