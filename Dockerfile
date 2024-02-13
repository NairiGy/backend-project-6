FROM node:18-slim

RUN apt-get update && apt-get install -yq \
  build-essential \
  python3

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

ENV NODE_ENV=development
RUN make build

CMD ["bash", "-c", "make db-migrate && npm start"]
