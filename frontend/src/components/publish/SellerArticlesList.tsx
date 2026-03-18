import { Link } from "react-router-dom";
import { Article, articleImageUrl } from "../../services/api";

type Props = {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (articleId: string) => void;
  deletingId: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  validated: "Validé",
  pending: "En attente",
  rejected: "Rejeté",
  sold: "Vendu",
};

export default function SellerArticlesList({
  articles,
  onEdit,
  onDelete,
  deletingId,
}: Props) {
  if (articles.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {articles.map((article) => (
        <div key={article.id} className="card" style={{ cursor: "default" }}>
          <div
            className="card-body"
            style={{
              display: "flex",
              gap: "1.25rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <img
              src={articleImageUrl(article)}
              alt={article.title}
              style={{
                width: 80,
                height: 80,
                objectFit: "cover",
                borderRadius: 8,
                background: "var(--bg-input)",
                flexShrink: 0,
              }}
            />

            <div style={{ flex: 1, minWidth: 200 }}>
              <Link
                to={`/articles/${article.id}`}
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--text)",
                }}
              >
                {article.title}
              </Link>
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "center",
                  marginTop: "0.35rem",
                  flexWrap: "wrap",
                }}
              >
                <span className={`card-status status-${article.status}`}>
                  {STATUS_LABELS[article.status] ?? article.status}
                </span>
                {article.condition && (
                  <span
                    style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}
                  >
                    {article.condition}
                  </span>
                )}
                {article.category && (
                  <span
                    style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}
                  >
                    {article.category.name}
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                textAlign: "right",
                minWidth: 100,
                flexShrink: 0,
              }}
            >
              <div className="card-price">{article.price} €</div>
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.8rem",
                  marginTop: "0.2rem",
                }}
              >
                {new Date(article.createdAt).toLocaleDateString("fr-FR")}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                flexShrink: 0,
              }}
            >
              <button
                className="btn btn-outline"
                style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
                onClick={() => onEdit(article)}
              >
                Modifier
              </button>
              <button
                className="btn btn-danger"
                style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
                disabled={deletingId === article.id}
                onClick={() => onDelete(article.id)}
              >
                {deletingId === article.id ? "…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

