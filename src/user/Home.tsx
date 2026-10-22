import React from "react";
import {Container, Card, Button} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {useSession} from "../store/session";

export function Home() {
    const username = useSession((state) => state.username);
    const token = useSession((state) => state.token);
    const clearSession = useSession((state) => state.clearSession);
    const navigate = useNavigate();

    if (!token) {
        navigate("/login");
        return null;
    }

    const logout = () => {
        clearSession();
        navigate("/login");
    };

    return (
        <Container className="auth-page">
            <Card className="auth-card">
                <Card.Body className="text-center">
                    <Card.Title>Bienvenue {username} 👋</Card.Title>
                    <p className="text-muted">La messagerie arrive bientôt.</p>
                    <Button variant="outline-danger" onClick={logout}>Se déconnecter</Button>
                </Card.Body>
            </Card>
        </Container>
    );
}
