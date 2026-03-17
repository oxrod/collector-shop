# Backlog fonctionnel (V1 POC)

Reformulation des exigences en User Stories avec critères d’acceptation. Au moins une fonctionnalité métier complète est couverte.

---

## Fonctionnalité : Gestion des articles (catalogue et publication)

### US-1 : Consultation du catalogue sans compte

**En tant que** visiteur  
**Je veux** consulter la liste des articles en vente  
**Afin de** découvrir les offres avant de m’inscrire.

**Critères d’acceptation :**

- [ ] La liste des articles est accessible sans authentification (GET /api/articles).
- [ ] Chaque article affiche au minimum : titre, description, prix, photo(s).
- [ ] La réponse est paginée ou limitée pour des raisons de performance.

---

### US-2 : Publication d’un article (vendeur authentifié)

**En tant que** vendeur authentifié  
**Je veux** publier un article avec photos, description et prix  
**Afin de** le proposer à la vente sur la plateforme.

**Critères d’acceptation :**

- [ ] Seuls les utilisateurs authentifiés peuvent créer un article (sinon 401).
- [ ] Les champs obligatoires sont : titre, description, prix (et photos selon règles métier).
- [ ] Les données invalides (ex. prix négatif, titre vide) renvoient 400.
- [ ] L’article créé est en attente de validation avant mise en ligne (si workflow de modération).

---

### US-3 : Santé de l’API

**En tant que** système ou opérateur  
**Je veux** vérifier que l’API est disponible  
**Afin de** surveiller la disponibilité du service.

**Critères d’acceptation :**

- [ ] GET /api/health retourne 200 et un statut cohérent (ex. status: "ok").
- [ ] Le health check peut inclure la connexion à la base de données.

---

## Priorisation (exemple)

| Id   | Priorité | Thème           |
|------|----------|-----------------|
| US-3 | P0       | Disponibilité   |
| US-1 | P1       | Catalogue       |
| US-2 | P1       | Publication     |

Les implémentations correspondantes sont couvertes par les tests unitaires et E2E (voir `tests/e2e/articles.test.ts` et modules backend/articles).
