import { useEffect, useMemo, useState } from "react";
import type { Article, Category, Shop } from "../../services/api";
import {
  articlesApi,
  categoriesApi,
  shopsApi,
} from "../../services/api";
import SellerArticleForm from "./SellerArticleForm";
import SellerArticlesList from "./SellerArticlesList";

export default function SellerArticlesDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchArticles = () => {
    setLoading(true);
    articlesApi
      .getMine()
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
    categoriesApi.getAll().then(setCategories).catch(() => {});
    shopsApi.getAll().then(setShops).catch(() => {});
  }, []);

  const stats = useMemo(() => {
    const validated = articles.filter((a) => a.status === "validated").length;
    const pending = articles.filter((a) => a.status === "pending").length;
    const rejected = articles.filter((a) => a.status === "rejected").length;
    const sold = articles.filter((a) => a.status === "sold").length;
    return { validated, pending, rejected, sold };
  }, [articles]);

  const openNewForm = () => {
    setEditingArticle(null);
    setError("");
    setSuccess("");
    setFormOpen(true);
  };

  const openEditForm = (article: Article) => {
    setEditingArticle(article);
    setError("");
    setSuccess("");
    setFormOpen(true);
  };

  const handleCancel = () => {
    setFormOpen(false);
    setEditingArticle(null);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cet article ?")) return;

    setDeletingId(id);
    setError("");
    try {
      await articlesApi.delete(id);
      setSuccess("Article supprimé.");
      fetchArticles();
    } catch {
      setError("Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (payload: any) => {
    setSubmitting(true);
    setError("");
    try {
      if (editingArticle) {
        await articlesApi.update(editingArticle.id, payload);
        setSuccess("Article mis à jour !");
      } else {
        await articlesApi.create(payload);
        setSuccess("Article publié avec succès !");
      }
      fetchArticles();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          Mes articles
        </h1>
        <button className="btn btn-primary" onClick={openNewForm}>
          + Nouvel article
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[
          { label: "Total", value: articles.length, color: "var(--text)" },
          { label: "Validés", value: stats.validated, color: "var(--success)" },
          { label: "En attente", value: stats.pending, color: "var(--warning)" },
          { label: "Rejetés", value: stats.rejected, color: "var(--danger)" },
          { label: "Vendus", value: stats.sold, color: "var(--primary)" },
        ].map((s) => (
          <div
            key={s.label}
            className="card"
            style={{ textAlign: "center", cursor: "default" }}
          >
            <div className="card-body" style={{ padding: "1rem" }}>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  color: s.color,
                }}
              >
                {loading ? "-" : s.value}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && !formOpen && <div className="alert alert-error">{error}</div>}
      {success && !formOpen && (
        <div className="alert alert-success">{success}</div>
      )}

      {formOpen && (
        <SellerArticleForm
          categories={categories}
          shops={shops}
          initialArticle={editingArticle}
          submitting={submitting}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      )}

      {!formOpen && (
        <>
          {loading ? (
            <div className="loading">
              <div className="spinner" />
            </div>
          ) : articles.length === 0 ? (
            <div className="card" style={{ textAlign: "center" }}>
              <div className="card-body" style={{ padding: "3rem" }}>
                <p
                  style={{
                    fontSize: "1.1rem",
                    color: "var(--text-muted)",
                    marginBottom: "1rem",
                  }}
                >
                  Vous n'avez encore publié aucun article.
                </p>
                <button className="btn btn-primary" onClick={openNewForm}>
                  Publier votre premier article
                </button>
              </div>
            </div>
          ) : (
            <SellerArticlesList
              articles={articles}
              onEdit={openEditForm}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          )}
        </>
      )}
    </div>
  );
}

