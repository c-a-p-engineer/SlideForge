FROM mcr.microsoft.com/playwright:v1.58.0-noble

WORKDIR /app

ARG DRAWIO_VERSION=30.0.4

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    fonts-noto-cjk \
    fonts-noto-cjk-extra \
    fonts-ipafont-gothic \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /tmp/drawio.deb \
    "https://github.com/jgraph/drawio-desktop/releases/download/v${DRAWIO_VERSION}/drawio-amd64-${DRAWIO_VERSION}.deb" \
  && apt-get update \
  && apt-get install -y --no-install-recommends /tmp/drawio.deb \
  && rm -f /tmp/drawio.deb \
  && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "render", "--", "--input", "slides/business", "--format", "pdf"]
