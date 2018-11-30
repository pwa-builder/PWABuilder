FROM node:8 as base
WORKDIR /app
COPY package*.json ./
ENV HOST 0.0.0.0
ENV PORT 80
RUN npm install
COPY . .

# -------- DEVELOPMENT ----------
FROM base as build-dev

ENV NODE_ENV=development

CMD npm run dev

# --------- PREVIEW --------------

FROM base as build-preview

ENV NODE_ENV=preview
RUN npm run build
CMD ["node", "server.js"]

# --------- PRODUCTION -----------

FROM base as build-prod

ENV NODE_ENV=production
RUN npm run build
CMD ["node", "server.js"]


