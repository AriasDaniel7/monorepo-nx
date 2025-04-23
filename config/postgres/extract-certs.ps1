# Crear directorio de certificados si no existe
New-Item -Path .\certs -ItemType Directory -Force

Write-Host "Extrayendo certificados SSL de PostgreSQL..."

# Extraer certificados del contenedor
docker cp postgresql:/opt/bitnami/postgresql/certs/ca.crt .\certs\
docker cp postgresql:/opt/bitnami/postgresql/certs/client.crt .\certs\
docker cp postgresql:/opt/bitnami/postgresql/certs/client.key .\certs\

# Verificar que los archivos se hayan extraído correctamente
if (Test-Path .\certs\client.key) {
    Write-Host "Certificados extraídos con éxito a la carpeta ./certs" -ForegroundColor Green
} else {
    Write-Host "Error al extraer certificados. Asegúrate de que el contenedor 'postgresql' esté en ejecución." -ForegroundColor Red
}