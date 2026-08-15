FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN npm install -g pnpm && pnpm install

COPY . .

EXPOSE 5173

CMD ["pnpm", "run", "dev", "--host"]
