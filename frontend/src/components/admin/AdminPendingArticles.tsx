import { useEffect, useState } from "react";
import type { Article } from "../../services/api";
import { adminArticlesApi } from "../../services/api";

export default function AdminPendingArticles() {
  const [pending, setPending] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  const fetchPending = () => {
    setLoading(true);
    adminArticlesApi
      .getPending()
      .then(setPending)
      .catch(() => setPending([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const moderate = async (id: string, status: "validated" | "rejected") => {
    setModeratingId(id);
    setError("");
    try {
      await adminArticlesApi.moderate(id, status);
      await fetchPending();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors de la modération.");
    } finally {
      setModeratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      {pending.length === 0 ? (
        <div className="card" style={{ textAlign: "center" }}>
          <div className="card-body" style={{ padding: "3rem" }}>
            <p style={{ fontSize: "1.1rem", color: "var(--text-muted)" }}>
              Aucun article en attente.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {pending.map((article) => (
            <div key={article.id} className="card">
              <div className="card-body">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: "0.25rem" }}>
                      {article.title}
                    </div>
                    <div
                      style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}
                    >
                      {article.seller?.username
                        ? `Par ${article.seller.username}`
                        : "Vendeur inconnu"}{" "}
                      • {article.price} €
                    </div>
                    <div style={{ marginTop: "0.4rem" }}>
                      <span className="card-status status-pending">
                        En attente
                      </span>
                      {article.condition && (
                        <span
                          style={{
                            color: "var(--text-muted)",
                            marginLeft: "0.75rem",
                            fontSize: "0.9rem",
                          }}
                        >
                          {article.condition}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                  >
                    <button
                      className="btn btn-primary"
                      style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
                      disabled={moderatingId === article.id}
                      onClick={() => moderate(article.id, "validated")}
                    >
                      {moderatingId === article.id ? "..." : "Valider"}
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
                      disabled={moderatingId === article.id}
                      onClick={() => moderate(article.id, "rejected")}
                    >
                      {moderatingId === article.id ? "..." : "Rejeter"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
