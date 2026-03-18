# PDFHelper – Frontend

A Next.js chat interface for uploading and conversing with PDF documents. Users can upload a PDF (locally or to the cloud), view it in an in-browser reader, and ask questions that are answered by the backend API.

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** (the lockfile is pnpm-based)
- The [PDFHelper backend](http://localhost:8000) running on port `8000` (or wherever `NEXT_PUBLIC_API_BASE_URL` points)

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Create a local env file
cp .env.example .env.local   # then edit values as needed

# 3. Start the dev server
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000). It redirects to `/chat` automatically.

## Environment Variables

Create a `.env.local` file in the project root (git-ignored by default).

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the backend API | `http://localhost:8000/api/v1` |

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Do not put secrets here.

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
