FROM node:14

EXPOSE 3000

WORKDIR /app
COPY . . 

ENV PORT 80
RUN npm install

CMD npm start