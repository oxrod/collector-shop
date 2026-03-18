import { useEffect, useRef, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import ArticlesPage from "./pages/ArticlesPage";
import CategoriesPage from "./pages/CategoriesPage";
import ChatPage from "./pages/ChatPage";
import LandingPage from "./pages/LandingPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import PublishArticlePage from "./pages/PublishArticlePage";
import RegisterPage from "./pages/RegisterPage";
import ShopPage from "./pages/ShopPage";
import { notificationsApi, usersApi } from "./services/api";
import keycloak, { initKeycloak } from "./services/keycloak";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const postAuthFetched = useRef(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const kcRoles = keycloak.tokenParsed?.realm_access?.roles ?? [];
  const isSellerOrAdmin =
    userRole === "seller" ||
    userRole === "admin" ||
    kcRoles.includes("seller") ||
    kcRoles.includes("admin");

  useEffect(() => {
    initKeycloak()
      .then((auth) => {
        setAuthenticated(auth);
        setInitialized(true);
      })
      .catch((err) => {
        console.error("Keycloak init error:", err);
        setInitialized(true);
      });
  }, []);

  useEffect(() => {
    if (!authenticated) {
      setUnreadCount(0);
      setUserRole(null);
      setRoleLoading(false);
      postAuthFetched.current = false;
      return;
    }

    if (postAuthFetched.current) return;
    postAuthFetched.current = true;
    setRoleLoading(true);

    usersApi
      .getMe()
      .then((u: any) => setUserRole(u.role ?? null))
      .catch(() => {
        const kcRoles =
          keycloak.tokenParsed?.realm_access?.roles ?? [];
        if (kcRoles.includes("admin")) setUserRole("admin");
        else if (kcRoles.includes("seller")) setUserRole("seller");
        else setUserRole(null);
      })
      .finally(() => setRoleLoading(false));

    notificationsApi
      .getUnread()
      .then((n) => setUnreadCount(n.length))
      .catch(() => setUnreadCount(0));
  }, [authenticated]);

  useEffect(() => {
    if (!userMenuOpen) return;

    const onDocClick = (e: MouseEvent) => {
      const el = userMenuRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [userMenuOpen]);

  const handleLogin = () => keycloak.login();
  const handleLogout = () =>
    keycloak.logout({ redirectUri: window.location.origin });

  const NotificationBellIcon = () => (
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
      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );

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
        <div className="navbar-links">
          <Link to="/" className="navbar-brand">
            Collector.shop
          </Link>
          <Link to="/articles" className="btn btn-outline">
            Articles
          </Link>
          <Link to="/categories" className="btn btn-outline">
            Catégories
          </Link>
        </div>

        <div className="navbar-links">
          {authenticated && isSellerOrAdmin && (
            <Link to="/publish" className="btn btn-primary">
              + Publier
            </Link>
          )}
          {authenticated && (
            <>
              <Link to="/notifications" className="nav-icon-btn">
                <NotificationBellIcon />
                {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
              </Link>

              <div ref={userMenuRef} className="topbar-dropdown">
                <button
                  type="button"
                  className="nav-icon-btn"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  ⋮
                </button>

                {userMenuOpen && (
                  <div className="topbar-dropdown-menu" role="menu">
                    <Link
                      to="/profile"
                      className="topbar-dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Mon profil
                    </Link>
                    <button
                      type="button"
                      className="topbar-dropdown-item topbar-dropdown-button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      Déconnexion ({keycloak.tokenParsed?.preferred_username})
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {!authenticated && (
            <>
              <Link to="/register" className="btn btn-outline">
                Créer un compte
              </Link>
              <button className="btn btn-primary" onClick={handleLogin}>
                Connexion
              </button>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route
          path="/publish"
          element={
            !authenticated ? (
              <NeedLogin onLogin={handleLogin} />
            ) : roleLoading ? (
              <div className="loading"><div className="spinner" /></div>
            ) : isSellerOrAdmin ? (
              <PublishArticlePage />
            ) : (
              <SellerOnly />
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
        <Route path="/register" element={<RegisterPage />} />
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

function SellerOnly() {
  return (
    <div className="page" style={{ textAlign: "center", paddingTop: "4rem" }}>
      <h2>Accès réservé aux vendeurs</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
        Vous devez disposer du rôle vendeur ou administrateur pour publier un article.
      </p>
    </div>
  );
}

export default App;
