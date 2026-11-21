FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html

COPY IMG_20261120_112739.jpg /usr/share/nginx/html/IMG_20261120_112739.jpg
COPY IMG_20261120_112819.jpg /usr/share/nginx/html/IMG_20261120_112819.jpg
COPY IMG_20261120_112853.jpg /usr/share/nginx/html/IMG_20261120_112853.jpg
COPY IMG_20261120_123359.jpg /usr/share/nginx/html/IMG_20261120_123359.jpg
COPY IMG_20261120_123747.jpg /usr/share/nginx/html/IMG_20261120_123747.jpg

EXPOSE 80
