import { useEffect, useMemo, useState } from "react";
import type { User } from "../../services/api";
import { adminUsersApi } from "../../services/api";

type Role = User["role"];

export default function AdminUsersModeration() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [roleById, setRoleById] = useState<Record<string, Role>>({});

  const fetchUsers = () => {
    setLoading(true);
    adminUsersApi
      .getModerationQueue()
      .then((u) => {
        setUsers(u);
        setRoleById(
          Object.fromEntries(
            u.map((x) => [x.id, x.role as Role]),
          ) as Record<string, Role>,
        );
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const canUpdate = useMemo(() => {
    // Placeholder: in case we later add rules about what admin can change
    return true;
  }, []);

  const update = async (id: string) => {
    const role = roleById[id];
    if (!role) return;

    setUpdatingId(id);
    setError("");
    try {
      await adminUsersApi.updateRole(id, role);
      await fetchUsers();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally {
      setUpdatingId(null);
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

      {users.length === 0 ? (
        <div className="card" style={{ textAlign: "center" }}>
          <div className="card-body" style={{ padding: "3rem" }}>
            <p style={{ fontSize: "1.1rem", color: "var(--text-muted)" }}>
              Aucun utilisateur à modérer.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {users.map((u) => (
            <div key={u.id} className="card">
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
                    <div style={{ fontWeight: 800 }}>{u.username}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      {u.email} • rôle actuel: <b>{u.role}</b>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <select
                      className="form-input"
                      value={roleById[u.id] ?? u.role}
                      onChange={(e) =>
                        setRoleById((prev) => ({
                          ...prev,
                          [u.id]: e.target.value as Role,
                        }))
                      }
                      disabled={!canUpdate || updatingId === u.id}
                      style={{ width: 190 }}
                    >
                      <option value="buyer">buyer</option>
                      <option value="seller">seller</option>
                      <option value="admin">admin</option>
                    </select>

                    <button
                      className="btn btn-primary"
                      style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
                      disabled={updatingId === u.id}
                      onClick={() => update(u.id)}
                    >
                      {updatingId === u.id ? "..." : "Mettre à jour"}
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

