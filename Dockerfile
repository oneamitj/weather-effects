# Static site: serve the effects and cards with nginx.
FROM nginx:1.27-alpine

COPY sitemap.xml /usr/share/nginx/html/
COPY *.html *.js /usr/share/nginx/html/
COPY cards/ /usr/share/nginx/html/cards/

EXPOSE 80
