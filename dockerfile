FROM node:8 as base
WORKDIR /app
COPY package*.json ./
ENV HOST 0.0.0.0
ENV PORT 80

# -------- DEVELOPMENT ----------
FROM base as build-dev

RUN npm install

COPY . .

ENV NODE_ENV=development

CMD npm run dev

# --------- PREVIEW --------------

FROM base as build-preview

COPY . . 
ENV NODE_ENV=preview
RUN npm run build
CMD npm run start

# --------- PRODUCTION -----------

FROM build-preview as build-prod

ENV NODE_ENV=production
CMD npm run build-run


