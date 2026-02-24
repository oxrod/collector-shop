import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import keycloak from "./services/keycloak";
import ArticlesPage from "./pages/ArticlesPage";
import PublishArticlePage from "./pages/PublishArticlePage";
import ArticleDetailPage from "./pages/ArticleDetailPage";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);

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
          {authenticated && (
            <Link to="/publish" className="btn btn-primary">
              + Publier
            </Link>
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
      </Routes>
    </>
  );
}

function NeedLogin({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="page" style={{ textAlign: "center", paddingTop: "4rem" }}>
      <h2>Connexion requise</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
        Vous devez être connecté pour publier un article.
      </p>
      <button className="btn btn-primary" onClick={onLogin}>
        Se connecter
      </button>
    </div>
  );
}

export default App;
