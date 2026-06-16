# SwimVault 프론트엔드 (Vite dev server). 운영 빌드는 M1에서 nginx 멀티스테이지로 교체.
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
