import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { articlesApi, Article } from "../services/api";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    articlesApi
      .getAll()
      .then(setArticles)
      .catch((_err) => setError("Erreur lors du chargement des articles"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <div className="hero">
        <h1>Bienvenue sur Collector.shop</h1>
        <p>
          Découvrez des objets de collection vintage mis en vente par notre
          communauté de passionnés.
        </p>
      </div>

      <div className="page">
        {error && <div className="alert alert-error">{error}</div>}

        {articles.length === 0 ? (
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
            {articles.map((article) => (
              <Link
                to={`/articles/${article.id}`}
                key={article.id}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="card">
                  {article.photoUrls && article.photoUrls.length > 0 ? (
                    <img
                      src={article.photoUrls[0]}
                      alt={article.title}
                      className="card-image"
                    />
                  ) : (
                    <div
                      className="card-image"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "3rem",
                      }}
                    >
                      📦
                    </div>
                  )}
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
                    {article.condition && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          background: "var(--bg-secondary, #f0f0f0)",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          marginBottom: "0.5rem",
                          display: "inline-block",
                        }}
                      >
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
    </>
  );
}
