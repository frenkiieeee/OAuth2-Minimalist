FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY client/package.json ./client/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm -r build

EXPOSE 3000 5173

CMD ["pnpm", "dev"]