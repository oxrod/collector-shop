import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  articlesApi,
  reviewsApi,
  Article,
  Review,
  PriceHistoryEntry,
  articleImageUrl,
} from "../services/api";
import keycloak from "../services/keycloak";

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<{
    average: number;
    count: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      articlesApi
        .getOne(id)
        .then(setArticle)
        .catch(() => null),
      articlesApi
        .getPriceHistory(id)
        .then(setPriceHistory)
        .catch(() => []),
    ]).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (article?.sellerId) {
      reviewsApi
        .getByUser(article.sellerId)
        .then(setReviews)
        .catch(() => []);
      reviewsApi
        .getAverageRating(article.sellerId)
        .then(setAvgRating)
        .catch(() => {});
    }
  }, [article]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="page" style={{ textAlign: "center" }}>
        <h2>Article introuvable</h2>
        <Link
          to="/articles"
          className="btn btn-primary"
          style={{ marginTop: "1rem" }}
        >
          Retour aux articles
        </Link>
      </div>
    );
  }

  const ChartIcon = () => (
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
      <path d="M3 3v18h18" />
      <path d="M7 14l2-2 3 3 6-7" />
    </svg>
  );

  const MessageIcon = () => (
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
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
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
        ← Retour aux articles
      </Link>

      <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <img
          src={articleImageUrl(article)}
          alt={article.title}
          className="card-image"
          style={{ height: "400px" }}
        />
        <div className="card-body" style={{ padding: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              marginBottom: "1rem",
            }}
          >
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>
              {article.title}
            </h1>
            <span className={`card-status status-${article.status}`}>
              {article.status}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}
          >
            {article.condition && (
              <span className="chip">{article.condition}</span>
            )}
            {article.category && (
              <span className="chip">{article.category.name}</span>
            )}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <p
              className="card-price"
              style={{ fontSize: "2rem", marginBottom: "0.25rem" }}
            >
              {Number(article.price).toFixed(2)} €
            </p>
            {article.shippingCost > 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                + {Number(article.shippingCost).toFixed(2)} € de frais de port
              </p>
            )}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                color: "var(--text-muted)",
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              Description
            </h3>
            <p style={{ lineHeight: 1.8 }}>{article.description}</p>
          </div>

          {/* Price history */}
          {priceHistory.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  marginBottom: "0.75rem",
                }}
              >
                <span style={{ verticalAlign: "middle" }}>
                  <ChartIcon />
                </span>{" "}
                Historique des prix
              </h3>
              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  fontSize: "0.85rem",
                }}
              >
                {priceHistory.map((ph) => (
                  <div
                    key={ph.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.4rem 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span>
                      <span
                        style={{
                          textDecoration: "line-through",
                          color: "var(--danger)",
                        }}
                      >
                        {Number(ph.oldPrice).toFixed(2)} €
                      </span>
                      {" → "}
                      <span
                        style={{ color: "var(--success)", fontWeight: 600 }}
                      >
                        {Number(ph.newPrice).toFixed(2)} €
                      </span>
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {new Date(ph.changedAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seller info */}
          {article.seller && (
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "1rem",
                color: "var(--text-muted)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                Vendu par{" "}
                <strong style={{ color: "var(--text)" }}>
                  {article.seller.username}
                </strong>
                {article.shop && (
                  <>
                    {" · "}
                    <Link
                      to={`/shops/${article.shopId}`}
                      style={{ color: "var(--primary)" }}
                    >
                      Boutique : {article.shop.name}
                    </Link>
                  </>
                )}
                {" · "}Publié le{" "}
                {new Date(article.createdAt).toLocaleDateString("fr-FR")}
                {avgRating && avgRating.count > 0 && (
                  <>
                    {" · "}
                    <span style={{ color: "var(--warning)" }}>
                      ★ {avgRating.average.toFixed(1)}
                    </span>{" "}
                    ({avgRating.count} avis)
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            {article.status === "validated" && (
              <button
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: "1rem",
                  fontSize: "1.1rem",
                }}
              >
                Acheter maintenant
              </button>
            )}
            {keycloak.authenticated && (
              <Link
                to={`/chat/${article.id}`}
                className="btn btn-outline"
                style={{ padding: "1rem", fontSize: "1.1rem" }}
              >
                <span style={{ verticalAlign: "middle" }}>
                  <MessageIcon />
                </span>{" "}
                Contacter le vendeur
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div style={{ maxWidth: "800px", margin: "2rem auto 0" }}>
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            <span style={{ verticalAlign: "middle" }}>
              <DocIcon />
            </span>{" "}
            Avis sur ce vendeur
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {reviews.slice(0, 5).map((r) => (
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
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.8rem",
                      }}
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
        </div>
      )}
    </div>
  );
}
