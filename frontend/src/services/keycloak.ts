import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    // With ingress: Keycloak at /auth. Override with VITE_KEYCLOAK_URL if needed.
    url: import.meta.env.VITE_KEYCLOAK_URL || (typeof window !== 'undefined' ? `${window.location.origin}/auth` : ''),
    realm: import.meta.env.VITE_KEYCLOAK_REALM || 'marketplace',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'marketplace-app',
});

let initPromise: Promise<boolean> | null = null;

export function initKeycloak(): Promise<boolean> {
    if (!initPromise) {
        initPromise = keycloak.init({
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri:
                window.location.origin + '/silent-check-sso.html',
            checkLoginIframe: false,
        });
    }

    return initPromise;
}

export default keycloak;
