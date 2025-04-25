# MyMonorepo

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is almost ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Finish your remote caching setup

[Click here to finish setting up your workspace!](https://cloud.nx.app/connect/bS2OuHEP3f)

## Docker Setup

1. Copy the environment file from `config/.env.template` to the root of the project as `.env`

2. Run Docker

```bash
docker-compose down && docker-compose up -d --build
```

## Extract certificates to root (Only on Windows with PowerShell)

```bash
npm run extract-certs
```

## Development Commands

### Run Projects

Frontend:

```bash
npx nx serve frontend
```

Backend:

```bash
npx nx serve backend
```

### Build Projects

Frontend:

```bash
npx nx build frontend
```

Backend:

```bash
npx nx build backend
```

## SSL Connection Setup (Optional)

1. Create a `certs` folder in the project root if it doesn't exist
2. First run `npm run extract-certs` to extract certificates
3. Make sure OpenSSL is installed on your system, then run the following commands:

```bash
# Generate client private key
openssl genrsa -out certs/client.key 2048

# Generate certificate signing request (CSR)
openssl req -new -key certs/client.key -out certs/client.csr -subj "/CN=postgres"

# Sign the certificate with the CA
openssl x509 -req -in certs/client.csr -days 365 -CA certs/ca.crt -CAkey certs/ca.key -CAcreateserial -out certs/client.crt
```
