FROM quay.io/keycloak/keycloak:23.0

COPY realm-config/marketplace-realm.json /opt/keycloak/data/import/

ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=admin

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start-dev", "--import-realm"]
