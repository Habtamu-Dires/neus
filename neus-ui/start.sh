#!/bin/bash

sed -i "s#__API_URL_PLACEHOLDER__#${API_URL}#g" /usr/share/nginx/html/index.html
sed -i "s#__KEYCLOAK_URL_PLACEHOLDER__#${KEYCLOAK_URL}#g" /usr/share/nginx/html/index.html
sed -i "s#__REALM_PLACEHOLDER__#${REALM}#g" /usr/share/nginx/html/index.html
sed -i "s#__CLIENT_ID_PLACEHOLDER__#${CLIENT_ID}#g" /usr/share/nginx/html/index.html
sed -i "s#__REDIRECT_URL_PLACEHOLDER__#${REDIRECT_URL}#g" /usr/share/nginx/html/index.html

# start nginx
nginx -g "daemon off;"
