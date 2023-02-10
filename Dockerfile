FROM nginx:stable-alpine
WORKDIR /var/DynamicEngineApp
COPY ./dist/apps/editor-test .
COPY ./nginx.conf /etc/nginx/conf.d/default.conf