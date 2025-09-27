FROM pwabuilder.azurecr.io/pwa-android-build-box:master AS base

WORKDIR /app
COPY . .

# need to copy files in /static directory so that we can include next-steps.html in the package zip.
COPY static/ ./static/ 

ENV PORT=5858
EXPOSE 5858

ENV JAVA_OPTS="-Xmx20000m"

ENV NODE_ENV=development
RUN npm install
ENV NODE_ENV=production

CMD npm start