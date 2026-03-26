FROM mcr.microsoft.com/playwright:v1.58.0-noble

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends fonts-noto-cjk fonts-noto-cjk-extra fonts-ipafont-gothic \
  && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "render", "--", "--input", "slides/business", "--format", "pdf"]
