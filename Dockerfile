FROM stremio/server:latest

USER root

RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

ENV NO_CORS=1
ENV APP_PATH=/data/stremio-server

RUN rm -f /etc/nginx/sites-enabled/default && \
    { \
      echo 'server {'; \
      echo '    listen 7860;'; \
      echo '    access_log /dev/stdout;'; \
      echo '    location / {'; \
      echo '        proxy_pass http://127.0.0.1:11470;'; \
      echo '        proxy_http_version 1.1;'; \
      echo '        proxy_set_header Upgrade $http_upgrade;'; \
      echo '        proxy_set_header Connection "upgrade";'; \
      echo '        proxy_set_header Host $host;'; \
      echo '        proxy_set_header X-Real-IP $remote_addr;'; \
      echo '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;'; \
      echo '        proxy_set_header X-Forwarded-Proto $scheme;'; \
      echo '    }'; \
      echo '}'; \
    } > /etc/nginx/sites-available/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default && \
    sed -i 's/^user\s.*/user 1000;/' /etc/nginx/nginx.conf && \
    sed -i 's|pid /run/nginx.pid;|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf && \
    sed -i 's|error_log .*|error_log /dev/stderr;|' /etc/nginx/nginx.conf && \
    sed -i 's|http {|http {\n    client_body_temp_path /tmp/client_body;\n    proxy_temp_path /tmp/proxy_temp;\n    fastcgi_temp_path /tmp/fastcgi_temp;\n    uwsgi_temp_path /tmp/uwsgi_temp;\n    scgi_temp_path /tmp/scgi_temp;|' /etc/nginx/nginx.conf

RUN mkdir -p /data/stremio-server && chown -R 1000:1000 /data /stremio

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER 1000

EXPOSE 7860

ENTRYPOINT []
CMD ["/entrypoint.sh"]
