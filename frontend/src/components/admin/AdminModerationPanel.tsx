import { useState } from "react";
import AdminModerationMenu from "./AdminModerationMenu";
import AdminPendingArticles from "./AdminPendingArticles";
import AdminUsersModeration from "./AdminUsersModeration";

type Tab = "articles" | "users";

export default function AdminModerationPanel() {
  const [tab, setTab] = useState<Tab>("articles");

  return (
    <div className="page">
      <h1 className="page-title">Administration</h1>
      <AdminModerationMenu tab={tab} onTabChange={setTab} />

      {tab === "articles" ? <AdminPendingArticles /> : <AdminUsersModeration />}
    </div>
  );
}

