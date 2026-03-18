import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Article, Category, Shop } from "../../services/api";

type SavePayload = {
  title: string;
  description: string;
  price: number;
  shippingCost: number;
  photoUrls?: string[];
  condition?: string;
  categoryId?: string;
  shopId?: string;
};

type Props = {
  categories: Category[];
  shops: Shop[];
  initialArticle: Article | null;
  submitting: boolean;
  onCancel: () => void;
  onSave: (payload: SavePayload) => Promise<void>;
};

const emptyForm = {
  title: "",
  description: "",
  price: "",
  shippingCost: "",
  photoUrls: "",
  condition: "Bon état",
  categoryId: "",
  shopId: "",
};

export default function SellerArticleForm({
  categories,
  shops,
  initialArticle,
  submitting,
  onCancel,
  onSave,
}: Props) {
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialArticle) {
      setForm({ ...emptyForm });
      setError("");
      return;
    }

    setForm({
      title: initialArticle.title ?? "",
      description: initialArticle.description ?? "",
      price: String(initialArticle.price ?? ""),
      shippingCost: String(initialArticle.shippingCost ?? ""),
      photoUrls: (initialArticle.photoUrls ?? []).join(", "),
      condition: initialArticle.condition ?? "Bon état",
      categoryId: initialArticle.categoryId ?? "",
      shopId: initialArticle.shopId ?? "",
    });
    setError("");
  }, [initialArticle]);

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.description || !form.price) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const price = parseFloat(form.price);
    if (isNaN(price) || price < 5) {
      setError("Le prix doit être supérieur à 5 €.");
      return;
    }

    const shippingCost = form.shippingCost ? parseFloat(form.shippingCost) : 0;

    const photoUrls = form.photoUrls
      ? form.photoUrls
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean)
      : [];

    const payload: SavePayload = {
      title: form.title,
      description: form.description,
      price,
      shippingCost,
      photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
      condition: form.condition || undefined,
      categoryId: form.categoryId || undefined,
      shopId: form.shopId || undefined,
    };

    try {
      await onSave(payload);
      onCancel();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Erreur lors de l'enregistrement.",
      );
    }
  };

  return (
    <div className="card" style={{ maxWidth: "700px", margin: "0 auto 2rem" }}>
      <div className="card-body" style={{ padding: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>
            {initialArticle ? "Modifier l'article" : "Publier un article"}
          </h2>
          <button
            className="btn btn-outline"
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
            onClick={onCancel}
            type="button"
            disabled={submitting}
          >
            Annuler
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

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
              placeholder="Décrivez votre objet de collection en détail…"
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

          <div style={{ display: "flex", gap: "1rem" }}>
            <div className="form-group" style={{ flex: 1 }}>
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
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="categoryId">
                Catégorie
              </label>
              <select
                id="categoryId"
                className="form-input"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
              >
                <option value="">-- Aucune --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {shops.length > 0 && (
            <div className="form-group">
              <label className="form-label" htmlFor="shopId">
                Boutique
              </label>
              <select
                id="shopId"
                className="form-input"
                name="shopId"
                value={form.shopId}
                onChange={handleChange}
              >
                <option value="">-- Aucune --</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            disabled={submitting}
            style={{
              width: "100%",
              padding: "0.8rem",
              fontSize: "1rem",
              marginTop: "0.5rem",
            }}
          >
            {submitting
              ? "Enregistrement…"
              : initialArticle
                ? "Enregistrer les modifications"
                : "Publier l'article"}
          </button>
        </form>
      </div>
    </div>
  );
}

