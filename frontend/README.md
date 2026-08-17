# Desafio - Frontend

Aplicacao frontend em React com Vite e TypeScript. Inclui UI com Tailwind CSS.

utilizado o backend disponibilizado pelo professor

## Tecnologias

- React
- TypeScript
- Vite
- TailwindCSS
- React Router DOM
- React Hook Form
- React Leaflet
- Leaflet
- Sonner
- Lucide React

## Requisitos

- Node.js (recomendado LTS)
- npm
- Docker + Docker Compose (para executar via compose.yml)

## Como rodar o projeto (local)

Instale as dependencias:

```bash
npm install
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```
projeto estará disponível em http://localhost:5173

Build de producao:

```bash
npm run build
```

Preview do build:

```bash
npm run preview
```

## Como executar com Docker Compose

O arquivo compose.yml define tres servicos: app, db (Postgres) e localstack (S3). A aplicacao usa as variaveis:

- DATABASE_URL=postgresql://bootcamp:bootcamp@postgres:5432/bootcamp
- S3_ENDPOINT=http://localstack:4566

Suba os servicos:

```bash
docker compose up -d
```
Lembra de criar a bucket:

```bash
docker exec -it localstack awslocal s3 mb s3://bootcamp
```

A aplicacao fica disponivel em:

- http://localhost:3000

Parar os servicos:

```bash
docker compose down
```
Observação importante:

bug no backend disponibilizado para a execução do front:
o xp do usuario é disponibilizado corretamente, mas o nível não está sendo recalculado, ficando nível 1 pra sempre.

Autor:

Lucas de Oliveira Mendes Felix
