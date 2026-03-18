import AdminModerationPanel from "../components/admin/AdminModerationPanel";
import SellerArticlesDashboard from "../components/publish/SellerArticlesDashboard";
import keycloak from "../services/keycloak";

export default function PublishArticlePage() {
  const roles = keycloak.tokenParsed?.realm_access?.roles ?? [];
  const isAdmin = roles.includes("admin");

  return isAdmin ? <AdminModerationPanel /> : <SellerArticlesDashboard />;
}
