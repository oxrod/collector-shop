import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    // Build-time VITE_KEYCLOAK_URL can accidentally point to the internal
    // service name (e.g. "http://keycloak:8080"). Prefer the current origin.
    url: import.meta.env.VITE_KEYCLOAK_URL || `${window.location.origin}/auth`,
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
