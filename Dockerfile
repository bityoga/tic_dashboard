# Reference : https://github.com/mhart/alpine-node#example-dockerfile-for-your-own-nodejs-project
# This stage installs our modules
FROM mhart/alpine-node:12
LABEL stage=tic-dashboard-app-stage1-docker-builder
WORKDIR /app
COPY package.json package-lock.json ./

# If you have native dependencies, you'll need extra tools
# RUN apk add --no-cache make gcc g++ python3
RUN apk add --no-cache make g++ python3
RUN apk add unzip

RUN npm ci --prod

# Then we copy over the modules from above onto a `slim` image
FROM mhart/alpine-node:slim-12
LABEL stage=tic-dashboard-app-stage2-docker-builder

# If possible, run your container using `docker run --init`
# Otherwise, you can use `tini`:
# RUN apk add --no-cache tini
# ENTRYPOINT ["/sbin/tini", "--"]

WORKDIR /app
COPY --from=0 /app .
COPY . .

EXPOSE 3003
CMD [ "node", "app.js" ]
