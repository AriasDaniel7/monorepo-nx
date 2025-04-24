#!/bin/bash

# Crear directorio de certificados si no existe
mkdir -p ./certs

echo "Extrayendo certificados SSL de PostgreSQL..."

# Extraer certificados del contenedor
docker cp postgresql:/opt/bitnami/postgresql/certs/ca.crt ./certs/
docker cp postgresql:/opt/bitnami/postgresql/certs/client.crt ./certs/
docker cp postgresql:/opt/bitnami/postgresql/certs/client.key ./certs/

# Verificar que los archivos se hayan extraído correctamente
if [ -f ./certs/client.key ]; then
    echo -e "\e[32mCertificados extraídos con éxito a la carpeta ./certs\e[0m"
else
    echo -e "\e[31mError al extraer certificados. Asegúrate de que el contenedor 'postgresql' esté en ejecución.\e[0m"
fi