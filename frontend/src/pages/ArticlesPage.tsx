import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  articlesApi,
  categoriesApi,
  Article,
  Category,
  articleImageUrl,
} from "../services/api";
import keycloak from "../services/keycloak";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [recommended, setRecommended] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const promises: Promise<any>[] = [
      articlesApi.getAll().then(setArticles),
      categoriesApi
        .getAll()
        .then(setCategories)
        .catch(() => []),
    ];
    if (keycloak.authenticated) {
      promises.push(
        articlesApi
          .getRecommended()
          .then(setRecommended)
          .catch(() => []),
      );
    }
    Promise.all(promises)
      .catch(() => setError("Erreur lors du chargement des articles"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  const validatedArticles = articles.filter((a) => a.status === "validated");
  const filtered = selectedCat
    ? validatedArticles.filter((a) => a.categoryId === selectedCat)
    : validatedArticles;

  const TargetIcon = () => (
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
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 7v1" />
      <path d="M12 16v1" />
      <path d="M7 12h1" />
      <path d="M16 12h1" />
    </svg>
  );

  return (
    <div className="page">
      {error && <div className="alert alert-error">{error}</div>}

      {/* Recommended section */}
      {keycloak.authenticated && recommended.length > 0 && (
        <div style={{ marginBottom: "2.5rem" }}>
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            <span style={{ verticalAlign: "middle" }}>
              <TargetIcon />
            </span>{" "}
            Recommandés pour vous
          </h2>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              overflowX: "auto",
              paddingBottom: "0.5rem",
            }}
          >
            {recommended.slice(0, 6).map((article) => (
              <Link
                to={`/articles/${article.id}`}
                key={article.id}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  minWidth: 220,
                  flexShrink: 0,
                }}
              >
                <div className="card">
                  <img
                    src={articleImageUrl(article)}
                    alt={article.title}
                    className="card-image"
                    style={{ height: 150 }}
                  />
                  <div className="card-body" style={{ padding: "0.8rem" }}>
                    <h3 className="card-title" style={{ fontSize: "0.95rem" }}>
                      {article.title}
                    </h3>
                    <span className="card-price" style={{ fontSize: "1.1rem" }}>
                      {Number(article.price).toFixed(2)} €
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Category filter chips */}
      {categories.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <button
            className={selectedCat === null ? "chip chip-active" : "chip"}
            onClick={() => setSelectedCat(null)}
          >
            Toutes
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={selectedCat === cat.id ? "chip chip-active" : "chip"}
              onClick={() => setSelectedCat(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "var(--text-muted)",
          }}
        >
          <p style={{ fontSize: "1.2rem" }}>
            Aucun article disponible pour le moment.
          </p>
          <p>Soyez le premier à publier un article !</p>
        </div>
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
                  </div>
                  {article.condition && (
                    <span className="chip" style={{ marginBottom: "0.5rem" }}>
                      {article.condition}
                    </span>
                  )}
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <span className="card-price">
                        {Number(article.price).toFixed(2)} €
                      </span>
                      {article.shippingCost > 0 && (
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            marginLeft: "0.5rem",
                          }}
                        >
                          + {Number(article.shippingCost).toFixed(2)} € port
                        </span>
                      )}
                    </div>
                    {article.seller && (
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.85rem",
                        }}
                      >
                        par {article.seller.username}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
