FROM postgres:16-alpine

COPY init.sql /docker-entrypoint-initdb.d/
COPY seed.sql /docker-entrypoint-initdb.d/

ENV POSTGRES_DB=marketplace
ENV POSTGRES_USER=marketplace
ENV POSTGRES_PASSWORD=marketplace_secret

EXPOSE 5432
