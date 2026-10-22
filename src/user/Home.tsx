import React from "react";
import {Container, Card, Button} from "react-bootstrap";
import {Navigate, useNavigate} from "react-router-dom";
import {useSession} from "../store/session";

export function Home() {
    const username = useSession((state) => state.username);
    const token = useSession((state) => state.token);
    const clearSession = useSession((state) => state.clearSession);
    const navigate = useNavigate();

    if (!token) {
        return <Navigate to="/login" replace/>;
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
                    <p className="text-muted">La messagerie est prête.</p>
                    <Button variant="primary" onClick={() => navigate("/messages")} className="me-2">
                        Ouvrir la messagerie
                    </Button>
                    <Button variant="outline-danger" onClick={logout}>Se déconnecter</Button>
                </Card.Body>
            </Card>
        </Container>
    );
}
