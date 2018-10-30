FROM node:8

WORKDIR /app

COPY package*.json /app

RUN npm install

COPY . /app

ENV NODE_ENV=development

ENV HOST 0.0.0.0
ENV PORT 80

CMD npm run dev


