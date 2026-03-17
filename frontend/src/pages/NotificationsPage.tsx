import { useState, useEffect } from "react";
import { notificationsApi, Notification } from "../services/api";

const typeIcons: Record<string, string> = {
  article_published: "📦",
  article_validated: "✅",
  article_rejected: "❌",
  payment_received: "💰",
  payment_sent: "💸",
  order_confirmed: "🛒",
  price_change: "📈",
  interest_match: "🎯",
  fraud_alert: "🚨",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi
      .getAll()
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await notificationsApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  if (loading)
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1 className="page-title" style={{ margin: 0 }}>
          🔔 Notifications
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: "1rem",
                marginLeft: "0.5rem",
                background: "var(--danger)",
                color: "white",
                padding: "0.15rem 0.6rem",
                borderRadius: "20px",
                fontWeight: 700,
              }}
            >
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button className="btn btn-outline" onClick={markAllRead}>
            Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "var(--text-muted)",
          }}
        >
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔕</p>
          <p>Aucune notification pour le moment.</p>
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {notifications.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                opacity: n.isRead ? 0.6 : 1,
                cursor: n.isRead ? "default" : "pointer",
                transition: "opacity 0.3s",
              }}
              onClick={() => !n.isRead && markRead(n.id)}
            >
              <div
                className="card-body"
                style={{
                  padding: "1rem 1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>
                  {typeIcons[n.type] || "📨"}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong>{n.title}</strong>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {new Date(n.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.9rem",
                      margin: "0.25rem 0 0",
                    }}
                  >
                    {n.message}
                  </p>
                </div>
                {!n.isRead && (
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "var(--primary)",
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
