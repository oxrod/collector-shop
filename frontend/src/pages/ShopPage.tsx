import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  shopsApi,
  articlesApi,
  reviewsApi,
  Shop,
  Article,
  Review,
  articleImageUrl,
} from "../services/api";

export default function ShopPage() {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<{
    average: number;
    count: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      shopsApi
        .getOne(id)
        .then(setShop)
        .catch(() => null),
      articlesApi.getAll().then(setArticles),
      reviewsApi
        .getByUser(id)
        .then(setReviews)
        .catch(() => []),
    ]).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (shop?.ownerId) {
      reviewsApi
        .getAverageRating(shop.ownerId)
        .then(setAvgRating)
        .catch(() => {});
    }
  }, [shop]);

  if (loading)
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );

  if (!shop)
    return (
      <div className="page" style={{ textAlign: "center" }}>
        <h2>Boutique introuvable</h2>
        <Link
          to="/articles"
          className="btn btn-primary"
          style={{ marginTop: "1rem" }}
        >
          Retour aux articles
        </Link>
      </div>
    );

  const shopArticles = articles.filter((a) => a.shopId === id);

  const StoreIcon = () => (
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
      <path d="M3 9l1-3h16l1 3" />
      <path d="M5 9v12h14V9" />
      <path d="M9 21v-8h6v8" />
    </svg>
  );

  const DocIcon = () => (
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h8" />
    </svg>
  );

  return (
    <div className="page">
      <Link
        to="/articles"
        style={{
          color: "var(--text-muted)",
          marginBottom: "1rem",
          display: "inline-block",
        }}
      >
        ← Retour
      </Link>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="card-body" style={{ padding: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ verticalAlign: "middle" }}>
                  <StoreIcon />
                </span>{" "}
                {shop.name}
              </h1>
              {shop.description && (
                <p style={{ color: "var(--text-muted)" }}>{shop.description}</p>
              )}
            </div>
            {avgRating && avgRating.count > 0 && (
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--warning)",
                  }}
                >
                  {"⭐".repeat(Math.round(avgRating.average))}
                </div>
                <span
                  style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}
                >
                  {avgRating.average.toFixed(1)}/5 ({avgRating.count} avis)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>
        Articles de la boutique ({shopArticles.length})
      </h2>

      {shopArticles.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>
          Aucun article dans cette boutique.
        </p>
      ) : (
        <div className="articles-grid">
          {shopArticles.map((article) => (
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
                  <h3 className="card-title">{article.title}</h3>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span className="card-price">
                      {Number(article.price).toFixed(2)} €
                    </span>
                    <span className={`card-status status-${article.status}`}>
                      {article.status}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <>
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              margin: "2rem 0 1rem",
            }}
          >
            <span style={{ verticalAlign: "middle" }}>
              <DocIcon />
            </span>{" "}
            Avis clients
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {reviews.map((r) => (
              <div key={r.id} className="card">
                <div className="card-body" style={{ padding: "1rem 1.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--warning)" }}>
                        {"★".repeat(r.rating)}
                        {"☆".repeat(5 - r.rating)}
                      </span>
                      <strong style={{ marginLeft: "0.5rem" }}>
                        {r.reviewer?.username || "Anonyme"}
                      </strong>
                    </div>
                    <span
                      style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}
                    >
                      {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {r.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
