FROM docker.repo-ci.sfera.inno.local/sumd-docker-lib/ubi8-python39-npm:1.1 as build-deps

ARG NPM_REGISTRY
ARG NPM_ADMIRAL_REGISTRY
ARG NPM_EMAIL
ARG NPM_AUTH

WORKDIR /usr/src/app
RUN cp -r /node_modules /usr/src/app/node_modules
COPY package.json ./

RUN npm config set always-auth true && \
    npm config set chromedriver_skip_download true && \
    npm config set email ${EMAIL} && \
    npm config set _auth ${NPM_AUTH} && \
    npm config set @admiral-ds:registry ${NPM_ADMIRAL_REGISTRY} && \
    npm i --only-production --registry=${NPM_REGISTRY}

COPY . ./
RUN npm run build

FROM docker.repo-ci.sfera.inno.local/sumd-docker-lib/nginx:1.20.2
COPY --from=build-deps /usr/src/app/dist /usr/share/nginx/html
# COPY app/template /usr/share/nginx/html/template
COPY default.conf /etc/nginx/conf.d/default.conf
RUN chgrp -R root /var/cache/nginx /var/run /var/log/nginx && \
    chmod -R 770 /var/cache/nginx /var/run /var/log/nginx
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]