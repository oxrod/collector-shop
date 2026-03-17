# Plan de remédiation sécurité

Pour chaque vulnérabilité identifiée (audit V1, Snyk, Trivy, ZAP) : vulnérabilité, risque, action corrective, justification technique, priorisation.

---

## 1. Format des entrées

| Vulnérabilité | Risque | Action corrective | Justification technique | Priorité |
|---------------|--------|-------------------|-------------------------|----------|
| *À remplir à partir des rapports* | | | | P1 / P2 / P3 |

---

## 2. Exemples de remédiations (à adapter selon les résultats réels)

### R1 – Dépendances avec CVE (Snyk / npm audit)

- **Vulnérabilité** : CVE sur une dépendance transitive (ex. prototype pollution, XSS).
- **Risque** : Exploitation à distance ou élévation de privilèges selon la CVE.
- **Action** : Mettre à jour la dépendance vers une version corrigée (patch/minor) ; si pas de correctif, remplacer ou isoler le composant.
- **Justification** : Mise à jour recommandée par l’éditeur et par Snyk ; tests de non-régression après mise à jour.
- **Priorité** : P1 si critique/high, P2 si medium.

---

### R2 – Image de base vulnérable (Trivy)

- **Vulnérabilité** : CVE sur l’image Docker de base (ex. Alpine, Node).
- **Risque** : Compromission du conteneur ou de l’hôte.
- **Action** : Rebaser sur une image à jour (tag avec correctifs de sécurité) ; limiter les paquets installés dans l’image.
- **Justification** : Images maintenues et rebasées régulièrement ; réduction de la surface d’attaque.
- **Priorité** : P1 pour CRITICAL/HIGH.

---

### R3 – En-têtes de sécurité manquants (ZAP)

- **Vulnérabilité** : X-Content-Type-Options, X-Frame-Options, etc. absents ou incorrects.
- **Risque** : XSS, clickjacking, sniffing MIME.
- **Action** : Activer et configurer Helmet (déjà en place côté backend) ; vérifier la configuration en production (reverse proxy, CDN).
- **Justification** : Helmet applique les en-têtes recommandés ; en production, le reverse proxy peut les renforcer.
- **Priorité** : P2.

---

### R4 – API sans HTTPS en production

- **Vulnérabilité** : Transport non chiffré.
- **Risque** : Interception des tokens et données.
- **Action** : Activer TLS sur l’Ingress / load balancer ; utiliser cert-manager ou certificats fournis par l’hébergeur.
- **Justification** : Exigence consignes (HTTPS/TLS) et bonnes pratiques OWASP.
- **Priorité** : P1 pour la mise en production.

---

### R5 – Secrets en clair (variables, logs)

- **Vulnérabilité** : Clés API ou mots de passe en dur ou loggés.
- **Risque** : Fuite de secrets et accès non autorisé.
- **Action** : Utiliser uniquement des variables d’environnement ou un secret manager ; ne jamais logger les secrets ; audit des logs.
- **Justification** : Conformité et réduction du risque de fuite.
- **Priorité** : P1 si constaté, P2 en préventif.

---

## 3. Priorisation

- **P1** : Critique / High – à traiter avant mise en production ou dans les plus brefs délais.
- **P2** : Medium – planifié sur le prochain cycle.
- **P3** : Low / Info – backlog ou acceptation du risque documentée.

Ce document doit être alimenté avec les résultats réels des scans (Snyk, Trivy, ZAP) et de l’[Audit sécurité V1](audit-securite-v1.md).
