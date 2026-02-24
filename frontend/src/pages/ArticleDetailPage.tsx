import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { articlesApi, Article } from "../services/api";

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      articlesApi
        .getOne(id)
        .then(setArticle)
        .catch(() => setArticle(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

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
        <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          Retour aux articles
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <Link
        to="/"
        style={{
          color: "var(--text-muted)",
          marginBottom: "1rem",
          display: "inline-block",
        }}
      >
        ← Retour aux articles
      </Link>

      <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
        {article.photoUrls && article.photoUrls.length > 0 ? (
          <img
            src={article.photoUrls[0]}
            alt={article.title}
            className="card-image"
            style={{ height: "400px" }}
          />
        ) : (
          <div
            className="card-image"
            style={{
              height: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "5rem",
            }}
          >
            📦
          </div>
        )}
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
              <span
                style={{
                  fontSize: "0.8rem",
                  background: "var(--bg-secondary, #f0f0f0)",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "4px",
                }}
              >
                {article.condition}
              </span>
            )}
            {article.category && (
              <span
                style={{
                  fontSize: "0.8rem",
                  background: "var(--bg-secondary, #f0f0f0)",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "4px",
                }}
              >
                {article.category.name}
              </span>
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

          {article.seller && (
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "1rem",
                color: "var(--text-muted)",
              }}
            >
              Vendu par{" "}
              <strong style={{ color: "var(--text)" }}>
                {article.seller.username}
              </strong>
              {article.shop && (
                <>
                  {" "}
                  · Boutique :{" "}
                  <strong style={{ color: "var(--text)" }}>
                    {article.shop.name}
                  </strong>
                </>
              )}
              {" · "}
              Publié le{" "}
              {new Date(article.createdAt).toLocaleDateString("fr-FR")}
            </div>
          )}

          {article.status === "validated" && (
            <button
              className="btn btn-primary"
              style={{
                width: "100%",
                marginTop: "1.5rem",
                padding: "1rem",
                fontSize: "1.1rem",
              }}
            >
              Acheter maintenant
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
