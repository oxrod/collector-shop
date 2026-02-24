import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { articlesApi } from "../services/api";

export default function PublishArticlePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    shippingCost: "",
    photoUrls: "",
    condition: "Bon état",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title || !form.description || !form.price) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const price = parseFloat(form.price);
    if (isNaN(price) || price < 5) {
      setError("Le prix doit être supérieur à 5€.");
      return;
    }

    const shippingCost = form.shippingCost ? parseFloat(form.shippingCost) : 0;

    // Parse photo URLs (comma-separated)
    const photoUrls = form.photoUrls
      ? form.photoUrls
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean)
      : [];

    setLoading(true);
    try {
      const article = await articlesApi.create({
        title: form.title,
        description: form.description,
        price,
        shippingCost,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
        condition: form.condition || undefined,
      });

      setSuccess(
        `Article "${article.title}" publié avec succès ! Statut: ${article.status}`,
      );
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la publication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Publier un article</h1>

      <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="card-body" style={{ padding: "2rem" }}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Titre *
              </label>
              <input
                id="title"
                className="form-input"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ex: Game Boy Color édition Pikachu"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description * (minimum 50 mots)
              </label>
              <textarea
                id="description"
                className="form-textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Décrivez votre objet de collection en détail (état, historique, particularités...)"
                required
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="price">
                  Prix (€) *
                </label>
                <input
                  id="price"
                  className="form-input"
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="5.00"
                  min="5"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="shippingCost">
                  Frais de port (€)
                </label>
                <input
                  id="shippingCost"
                  className="form-input"
                  type="number"
                  name="shippingCost"
                  value={form.shippingCost}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="condition">
                État
              </label>
              <select
                id="condition"
                className="form-input"
                name="condition"
                value={form.condition}
                onChange={handleChange}
              >
                <option value="Neuf">Neuf</option>
                <option value="Très bon état">Très bon état</option>
                <option value="Bon état">Bon état</option>
                <option value="Correct">Correct</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="photoUrls">
                URLs des photos (séparées par des virgules)
              </label>
              <input
                id="photoUrls"
                className="form-input"
                type="text"
                name="photoUrls"
                value={form.photoUrls}
                onChange={handleChange}
                placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.8rem",
                fontSize: "1rem",
                marginTop: "0.5rem",
              }}
            >
              {loading ? "Publication en cours..." : "📦 Publier l'article"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
