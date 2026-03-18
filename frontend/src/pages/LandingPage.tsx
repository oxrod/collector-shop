import { Link } from "react-router-dom";
import type { ReactNode } from "react";

function IconWrapper({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "small";
}) {
  return (
    <span
      className={variant === "small" ? "landing-icon landing-icon--small" : "landing-icon"}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function IconCheckCircle() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="9" strokeWidth="2" />
      <path d="M8 12.2l2.2 2.2L16.4 8.2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLightning() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
      <path
        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M22 21v-2a4 4 0 0 0-3-3.87"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 3.13a4 4 0 0 1 0 7.75"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconEye() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
      <path
        d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconScale() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
      <path d="M12 3v18" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 6h10" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 10h12" strokeWidth="2" strokeLinecap="round" />
      <path d="M5.5 10l-2 4.5H8l-2.5-4.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 10l-2 4.5h4.5l-2.5-4.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMessageSquare() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
      <path
        d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChartBar() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
      <path d="M3 3v18h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 14v3" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 10v7" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 6v11" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="2" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="9" strokeWidth="2" />
      <path d="M12 7v6l4 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconQuote() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
      <path
        d="M10 11a4 4 0 0 1-4 4v5h6v-9a4 4 0 0 0-2-3z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 11a4 4 0 0 1-4 4v5h6v-9a4 4 0 0 0-2-3z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <>
      <div className="hero landing-hero">
        <div className="landing-hero-content">
          <h1>Collectez, échangez, découvrez.</h1>
          <p>
            Collector.shop met en relation des vendeurs passionnés et des
            collectionneurs. Parcourez des annonces de qualité et trouvez votre
            prochain coup de coeur.
          </p>

          <div className="landing-cta-row">
            <Link to="/articles" className="btn btn-primary">
              Voir les articles
            </Link>
            <Link to="/categories" className="btn btn-outline">
              Explorer les catégories
            </Link>
          </div>

          <div className="landing-hero-subline">
            Simple, clair, orienté collection.
          </div>
        </div>
      </div>

      <div className="page">
        <h2 className="landing-section-title">Pourquoi Collector.shop ?</h2>

        <div className="landing-arguments">
          <div className="landing-argument">
            <h3>
              <IconWrapper>
                <IconCheckCircle />
              </IconWrapper>
              Annonces vérifiées
            </h3>
            <p>
              Une communauté active qui met en avant des objets présentés avec
              soin.
            </p>
          </div>
          <div className="landing-argument">
            <h3>
              <IconWrapper>
                <IconLightning />
              </IconWrapper>
              Expérience fluide
            </h3>
            <p>
              Recherchez, comparez et discutez simplement avec les vendeurs.
            </p>
          </div>
          <div className="landing-argument">
            <h3>
              <IconWrapper>
                <IconUsers />
              </IconWrapper>
              Communauté de passionnés
            </h3>
            <p>
              Des profils clairs et des échanges centrés sur l’objet, pas sur
              le bruit.
            </p>
          </div>
        </div>

        <div className="landing-divider" />

        <h2 className="landing-section-title">Comment ça marche</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <h3>
              <IconWrapper>
                <IconEye />
              </IconWrapper>
              1. Découvrez
            </h3>
            <p>
              Parcourez les annonces validées et filtrez par catégorie pour
              aller droit au but.
            </p>
          </div>
          <div className="landing-step">
            <h3>
              <IconWrapper>
                <IconScale />
              </IconWrapper>
              2. Comparez
            </h3>
            <p>
              Regardez l'essentiel: état, prix, frais éventuels et historique.
            </p>
          </div>
          <div className="landing-step">
            <h3>
              <IconWrapper>
                <IconMessageSquare />
              </IconWrapper>
              3. Contactez
            </h3>
            <p>
              Discutez avec le vendeur, clarifiez les détails, puis finalisez.
            </p>
          </div>
        </div>

        <div className="landing-divider" />

        <h2 className="landing-section-title">Chiffres clés</h2>
        <div className="landing-stats">
          <div className="landing-stat">
            <div className="landing-stat-value">+1&nbsp;000</div>
            <div className="landing-stat-label">
              <IconWrapper variant="small">
                <IconChartBar />
              </IconWrapper>
              annonces consultées
            </div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-value">+80</div>
            <div className="landing-stat-label">
              <IconWrapper variant="small">
                <IconLightning />
              </IconWrapper>
              vendeurs actifs
            </div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-value">20+</div>
            <div className="landing-stat-label">
              <IconWrapper variant="small">
                <IconGrid />
              </IconWrapper>
              catégories
            </div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-value">&lt;24h</div>
            <div className="landing-stat-label">
              <IconWrapper variant="small">
                <IconClock />
              </IconWrapper>
              délai de prise de contact*
            </div>
          </div>
        </div>

        <div className="landing-footnote">
          *Indication moyenne basée sur les discussions récentes.
        </div>

        <div className="landing-divider" />

        <h2 className="landing-section-title">Catégories populaires</h2>
        <div className="landing-argument">
          <div className="landing-chip-row">
            {[
              "Jeux vidéo",
              "Cartes & figurines",
              "Jeux de société",
              "Accessoires",
              "Autres",
            ].map((label) => (
              <Link
                key={label}
                to="/categories"
                className="landing-chip-link"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="landing-divider" />

        <h2 className="landing-section-title">Avis des collectionneurs</h2>
        <div className="landing-testimonials">
          <div className="landing-testimonial">
            <div className="landing-quote-icon">
              <IconWrapper variant="small">
                <IconQuote />
              </IconWrapper>
            </div>
            <p className="landing-quote">
              "On trouve vite, et les annonces donnent confiance. La navigation est
              simple."
            </p>
            <div className="landing-quote-meta">M., collectionneur</div>
          </div>
          <div className="landing-testimonial">
            <div className="landing-quote-icon">
              <IconWrapper variant="small">
                <IconQuote />
              </IconWrapper>
            </div>
            <p className="landing-quote">
              "Le filtre par catégorie fait gagner du temps. Les échanges sont
              clairs."
            </p>
            <div className="landing-quote-meta">S., vendeur</div>
          </div>
          <div className="landing-testimonial">
            <div className="landing-quote-icon">
              <IconWrapper variant="small">
                <IconQuote />
              </IconWrapper>
            </div>
            <p className="landing-quote">
              "Minimaliste mais efficace. On peut se concentrer sur l'objet."
            </p>
            <div className="landing-quote-meta">A., acheteur</div>
          </div>
        </div>

        <div className="landing-divider" />

        <h2 className="landing-section-title">FAQ</h2>
        <div className="landing-faq">
          <details>
            <summary>
              <span className="landing-icon landing-icon--faq" aria-hidden="true">
                ?
              </span>
              Comment sont validées les annonces ?
            </summary>
            <p>
              Les annonces passent par une étape de validation afin de limiter
              les contenus non conformes et améliorer la qualité globale.
            </p>
          </details>
          <details>
            <summary>
              <span className="landing-icon landing-icon--faq" aria-hidden="true">
                ?
              </span>
              Puis-je contacter un vendeur directement ?
            </summary>
            <p>
              Oui. Depuis une page d’annonce, vous pouvez démarrer une
              conversation pour clarifier les détails.
            </p>
          </details>
          <details>
            <summary>
              <span className="landing-icon landing-icon--faq" aria-hidden="true">
                ?
              </span>
              Comment choisir une catégorie ?
            </summary>
            <p>
              Rendez-vous sur "Catégories" puis explorez. Les filtres
              permettent de réduire le bruit et trouver plus vite.
            </p>
          </details>
        </div>
      </div>
    </>
  );
}

