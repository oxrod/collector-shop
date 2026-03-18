import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { chatApi, ChatMessage, articlesApi, Article } from "../services/api";
import keycloak from "../services/keycloak";

export default function ChatPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const myId = keycloak.tokenParsed?.sub || "";

  useEffect(() => {
    if (!articleId) return;
    articlesApi
      .getOne(articleId)
      .then(setArticle)
      .catch(() => {});
  }, [articleId]);

  // Polling for messages
  useEffect(() => {
    if (!articleId) return;
    const fetchMessages = () => {
      chatApi
        .getMessages(articleId)
        .then(setMessages)
        .catch(() => {})
        .finally(() => setLoading(false));
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [articleId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !articleId || !article) return;
    const receiverId = article.sellerId === myId ? "" : article.sellerId;
    try {
      const msg = await chatApi.sendMessage(
        articleId,
        receiverId,
        input.trim(),
      );
      setMessages((prev) => [...prev, msg]);
      setInput("");
    } catch {
      // message non envoyé
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const MessageSquareIcon = () => (
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

  return (
    <div
      className="page"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 65px)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1rem 0",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
          flexShrink: 0,
        }}
      >
        <Link
          to={article ? `/articles/${article.id}` : "/articles"}
          style={{ color: "var(--text-muted)" }}
        >
          ←
        </Link>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            <span style={{ verticalAlign: "middle" }}>
              <MessageSquareIcon />
            </span>
            {article ? ` Discussion — ${article.title}` : " Chat"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Messages actualisés automatiquement
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          padding: "0.5rem 0",
        }}
      >
        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ marginBottom: "0.5rem" }}>
              <MessageSquareIcon />
            </div>
            <p>Aucun message. Commencez la conversation !</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === myId;
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: isMe ? "flex-end" : "flex-start",
                  maxWidth: "70%",
                }}
              >
                <div
                  className={
                    isMe ? "chat-bubble chat-me" : "chat-bubble chat-other"
                  }
                >
                  {!isMe && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--primary)",
                        display: "block",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {m.sender?.username || "Utilisateur"}
                    </span>
                  )}
                  <p style={{ margin: 0 }}>{m.content}</p>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      display: "block",
                      textAlign: "right",
                      marginTop: "0.3rem",
                    }}
                  >
                    {new Date(m.createdAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <input
          className="form-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message..."
          style={{ flex: 1 }}
        />
        <button
          className="btn btn-primary"
          onClick={send}
          disabled={!input.trim()}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
