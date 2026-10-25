#!/bin/bash
set -e

/usr/sbin/nginx

exec node /stremio/server.js
