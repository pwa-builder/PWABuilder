FROM pwabuilder.azurecr.io/pwa-android-build-box:master AS base

WORKDIR /app
COPY . .

ENV PORT=5858
EXPOSE 5858

ENV JAVA_OPTS="-Xmx20000m"

ENV NODE_ENV=development
RUN npm install
ENV NODE_ENV=production

CMD npm start