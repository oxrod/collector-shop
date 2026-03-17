import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import keycloak from "./services/keycloak";
import { notificationsApi } from "./services/api";
import ArticlesPage from "./pages/ArticlesPage";
import PublishArticlePage from "./pages/PublishArticlePage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import CategoriesPage from "./pages/CategoriesPage";
import ShopPage from "./pages/ShopPage";
import ChatPage from "./pages/ChatPage";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    keycloak
      .init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri:
          window.location.origin + "/silent-check-sso.html",
        checkLoginIframe: false,
      })
      .then((auth) => {
        setAuthenticated(auth);
        setInitialized(true);
      })
      .catch((err) => {
        console.error("Keycloak init error:", err);
        setInitialized(true);
      });
  }, []);

  // Poll unread notifications count
  useEffect(() => {
    if (!authenticated) return;
    const fetchUnread = () => {
      notificationsApi
        .getUnread()
        .then((n) => setUnreadCount(n.length))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [authenticated]);

  const handleLogin = () => keycloak.login();
  const handleLogout = () =>
    keycloak.logout({ redirectUri: window.location.origin });

  if (!initialized) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          🎮 Collector.shop
        </Link>
        <div className="navbar-links">
          <Link to="/" className="btn btn-outline">
            Articles
          </Link>
          <Link to="/categories" className="btn btn-outline">
            Catégories
          </Link>
          {authenticated && (
            <>
              <Link to="/publish" className="btn btn-primary">
                + Publier
              </Link>
              <Link to="/notifications" className="nav-icon-btn">
                🔔
                {unreadCount > 0 && (
                  <span className="nav-badge">{unreadCount}</span>
                )}
              </Link>
              <Link to="/profile" className="nav-icon-btn">
                👤
              </Link>
            </>
          )}
          {authenticated ? (
            <button className="btn btn-outline" onClick={handleLogout}>
              Déconnexion ({keycloak.tokenParsed?.preferred_username})
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleLogin}>
              Connexion
            </button>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<ArticlesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route
          path="/publish"
          element={
            authenticated ? (
              <PublishArticlePage />
            ) : (
              <NeedLogin onLogin={handleLogin} />
            )
          }
        />
        <Route path="/articles/:id" element={<ArticleDetailPage />} />
        <Route path="/shops/:id" element={<ShopPage />} />
        <Route
          path="/profile"
          element={
            authenticated ? (
              <ProfilePage />
            ) : (
              <NeedLogin onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/notifications"
          element={
            authenticated ? (
              <NotificationsPage />
            ) : (
              <NeedLogin onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/chat/:articleId"
          element={
            authenticated ? <ChatPage /> : <NeedLogin onLogin={handleLogin} />
          }
        />
      </Routes>
    </>
  );
}

function NeedLogin({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="page" style={{ textAlign: "center", paddingTop: "4rem" }}>
      <h2>Connexion requise</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
        Vous devez être connecté pour accéder à cette page.
      </p>
      <button className="btn btn-primary" onClick={onLogin}>
        Se connecter
      </button>
    </div>
  );
}

export default App;
