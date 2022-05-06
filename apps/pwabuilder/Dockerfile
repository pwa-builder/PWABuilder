FROM node:14

EXPOSE 3000

WORKDIR /app
COPY . . 

ENV PORT 80

WORKDIR /app/apps/pwabuilder
RUN npm install --unsafe-perm

CMD npm start
