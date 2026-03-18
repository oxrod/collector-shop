import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  usersApi,
  categoriesApi,
  articlesApi,
  Article,
  Category,
  UserInterest,
  articleImageUrl,
} from "../services/api";
import keycloak from "../services/keycloak";

export default function ProfilePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    Promise.all([
      usersApi.getMe().then((u: any) => setUsername(u.username)),
      articlesApi.getAll().then(setArticles),
      categoriesApi.getAll().then(setCategories),
      usersApi
        .getInterests()
        .then(setInterests)
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const myArticles = articles.filter((a) => a.seller?.username === username);
  const interestIds = new Set(interests.map((i) => i.categoryId));

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

  const BoxIcon = () => (
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
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7l8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );

  const toggleInterest = async (catId: string) => {
    if (interestIds.has(catId)) {
      await usersApi.removeInterest(catId);
      setInterests((prev) => prev.filter((i) => i.categoryId !== catId));
    } else {
      const added = await usersApi.addInterest(catId);
      setInterests((prev) => [...prev, added]);
    }
  };

  if (loading)
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );

  return (
    <div className="page">
      <h1 className="page-title">Mon profil</h1>

      {/* User info */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="card-body" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "white",
              }}
            >
              {username?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h2 style={{ fontWeight: 700 }}>{username}</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                {keycloak.tokenParsed?.email || ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interests */}
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
        Centres d'intérêt
      </h2>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.9rem",
          marginBottom: "1rem",
        }}
      >
        Sélectionnez vos catégories pour des recommandations personnalisées.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "2rem",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleInterest(cat.id)}
            className={interestIds.has(cat.id) ? "chip chip-active" : "chip"}
          >
            {cat.name}
          </button>
        ))}
        {categories.length === 0 && (
          <span style={{ color: "var(--text-muted)" }}>
            Aucune catégorie disponible.
          </span>
        )}
      </div>

      {/* My articles */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>
          <span style={{ verticalAlign: "middle" }}>
            <BoxIcon />
          </span>{" "}
          Mes articles ({myArticles.length})
        </h2>
        <Link
          to="/publish"
          className="btn btn-primary"
          style={{ fontSize: "0.85rem" }}
        >
          Gérer mes annonces
        </Link>
      </div>

      {myArticles.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>
          Vous n'avez pas encore publié d'article.
        </p>
      ) : (
        <div className="articles-grid">
          {myArticles.map((article) => (
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
    </div>
  );
}
