---
title: Stremio Server
emoji: 🎬
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Stremio Server

Runs [stremio/server](https://hub.docker.com/r/stremio/server) on Hugging Face Spaces.

## Deploy

1. Create a new Space at https://huggingface.co/new-space
2. Set **SDK** to **Docker**
3. Upload these files (Dockerfile, entrypoint.sh, README.md)
4. The Space will build and start automatically

## Usage

Open your Space URL — it redirects to the Stremio Web app with the server pre-configured.

## ⚠️ Limitations

- **No persistent storage** — settings/cache reset on restart
- **P2P/torrent traffic may violate HF Spaces ToS** — use at your own risk
- **Free Spaces sleep after inactivity** — wake-up takes 10–30s
- **Streaming performance depends on HF's network** — may not work reliably for high-bitrate content
