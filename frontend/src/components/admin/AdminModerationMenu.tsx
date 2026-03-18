type Tab = "articles" | "users";

type Props = {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
};

export default function AdminModerationMenu({ tab, onTabChange }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
        flexWrap: "wrap",
        marginBottom: "1.5rem",
      }}
    >
      <button
        type="button"
        className={`chip ${tab === "articles" ? "chip-active" : ""}`}
        onClick={() => onTabChange("articles")}
      >
        Articles en attente
      </button>
      <button
        type="button"
        className={`chip ${tab === "users" ? "chip-active" : ""}`}
        onClick={() => onTabChange("users")}
      >
        Moderation utilisateurs
      </button>
    </div>
  );
}

