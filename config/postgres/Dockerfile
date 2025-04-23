FROM bitnami/postgresql:17.4.0

USER root

# Instalar OpenSSL si es necesario (normalmente ya está instalado)
RUN apt-get update && apt-get install -y --no-install-recommends openssl

# Crear el directorio para los certificados
RUN mkdir -p /opt/bitnami/postgresql/certs
RUN mkdir -p /certs-export

# Generar certificados SSL
RUN openssl req -new -x509 -days 365 -nodes \
    -out /opt/bitnami/postgresql/certs/ca.crt \
    -keyout /opt/bitnami/postgresql/certs/ca.key \
    -subj "/CN=root-ca" && \
    openssl genrsa -out /opt/bitnami/postgresql/certs/server.key 2048 && \
    openssl req -new -key /opt/bitnami/postgresql/certs/server.key \
    -out /opt/bitnami/postgresql/certs/server.csr -subj "/CN=postgresql" && \
    openssl x509 -req -in /opt/bitnami/postgresql/certs/server.csr \
    -days 365 -CA /opt/bitnami/postgresql/certs/ca.crt \
    -CAkey /opt/bitnami/postgresql/certs/ca.key -CAcreateserial \
    -out /opt/bitnami/postgresql/certs/server.crt

# Generar certificado de cliente
RUN openssl genrsa -out /opt/bitnami/postgresql/certs/client.key 2048 && \
    openssl req -new -key /opt/bitnami/postgresql/certs/client.key -out /opt/bitnami/postgresql/certs/client.csr -subj "/CN=postgres" && \
    openssl x509 -req -in /opt/bitnami/postgresql/certs/client.csr -days 365 -CA /opt/bitnami/postgresql/certs/ca.crt -CAkey /opt/bitnami/postgresql/certs/ca.key -CAcreateserial -out /opt/bitnami/postgresql/certs/client.crt

# Copiar certificados al directorio de exportación
RUN cp /opt/bitnami/postgresql/certs/ca.crt /certs-export/ && \
    cp /opt/bitnami/postgresql/certs/client.crt /certs-export/ && \
    cp /opt/bitnami/postgresql/certs/client.key /certs-export/ && \
    chmod -R 755 /certs-export

# Configurar permisos correctos para PostgreSQL
RUN chmod 0600 /opt/bitnami/postgresql/certs/server.key && \
    chmod 0600 /opt/bitnami/postgresql/certs/ca.key && \
    chown -R 1001:1001 /opt/bitnami/postgresql/certs

# Volver al usuario no-root
USER 1001