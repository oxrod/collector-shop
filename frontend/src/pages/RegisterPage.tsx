import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email || !form.username) {
      setError("Veuillez renseigner un email et un pseudo.");
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        email: form.email,
        username: form.username,
        password: form.password || undefined,
      });
      setSuccess(
        "Compte créé avec succès. Vous pouvez maintenant vous connecter.",
      );
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la création du compte.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Créer un compte</h1>
      <div className="card" style={{ maxWidth: 480, margin: "0 auto" }}>
        <div className="card-body" style={{ padding: "2rem" }}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                value={form.email}
                onChange={handleChange}
                placeholder="vous@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Pseudo *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="form-input"
                value={form.username}
                onChange={handleChange}
                placeholder="collect0r"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                value={form.password}
                onChange={handleChange}
                placeholder="Optionnel (géré par Keycloak en production)"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", marginTop: "1rem" }}
            >
              {loading ? "Création du compte..." : "Créer mon compte"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

