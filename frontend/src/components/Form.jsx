import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";
import Boton from "./Boton";
import "../styles/form.css"
import Logo from "../assets/logo.svg";

function Form({route, method}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault()

        try {
            const res = await api.post(route, {username, password});
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <div className="logo-container">
                <img src={Logo} alt="Logo de la clínica" className="form-logo" />
            </div>
            <div className="form-fields">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {loading && <LoadingIndicator />}
                <Boton texto="Login" tipo="primario" disabled={loading} />
            </div>
        </form>
    )
}

export default Form