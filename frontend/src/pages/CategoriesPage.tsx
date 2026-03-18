import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  categoriesApi,
  articlesApi,
  Category,
  Article,
  articleImageUrl,
} from "../services/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      categoriesApi.getAll().then(setCategories),
      articlesApi.getAll().then(setArticles),
    ]).finally(() => setLoading(false));
  }, []);

  const filtered = selectedId
    ? articles.filter((a) => a.categoryId === selectedId)
    : articles;

  const selectedName =
    categories.find((c) => c.id === selectedId)?.name || "Toutes";

  const TagIcon = () => (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.6 13.4 11 3H3v8l9.6 9.6a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8z" />
      <path d="M7.5 7.5h.01" />
    </svg>
  );

  if (loading)
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );

  return (
    <div className="page">
      <h1 className="page-title">
        <span style={{ verticalAlign: "middle" }}>
          <TagIcon />
        </span>{" "}
        Catégories
      </h1>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "2rem",
        }}
      >
        <button
          className={selectedId === null ? "chip chip-active" : "chip"}
          onClick={() => setSelectedId(null)}
        >
          Toutes
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={selectedId === cat.id ? "chip chip-active" : "chip"}
            onClick={() => setSelectedId(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <h2
        style={{
          fontSize: "1.2rem",
          fontWeight: 600,
          marginBottom: "1rem",
          color: "var(--text-muted)",
        }}
      >
        {selectedName} — {filtered.length} article
        {filtered.length !== 1 ? "s" : ""}
      </h2>

      {filtered.length === 0 ? (
        <p
          style={{
            color: "var(--text-muted)",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          Aucun article dans cette catégorie.
        </p>
      ) : (
        <div className="articles-grid">
          {filtered.map((article) => (
            <Link
              to={`/articles/${article.id}`}
              key={article.id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="card">
                <img
                  src={articleImageUrl(article)}
                  alt={article.title}
                  className="card-image"
                />
                <div className="card-body">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <h3 className="card-title">{article.title}</h3>
                    <span className={`card-status status-${article.status}`}>
                      {article.status}
                    </span>
                  </div>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.9rem",
                      marginBottom: "0.8rem",
                    }}
                  >
                    {article.description.length > 100
                      ? article.description.substring(0, 100) + "..."
                      : article.description}
                  </p>
                  <span className="card-price">
                    {Number(article.price).toFixed(2)} €
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
