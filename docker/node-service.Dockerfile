# 모든 Node/TS 마이크로서비스 공용 Dockerfile (build arg SERVICE로 선택).
# context는 저장소 루트 — file:../../libs/contracts 의존성 해석을 위해 contracts를 함께 복사.
FROM node:20-alpine
ARG SERVICE
WORKDIR /app

# 1) 공유 계약 빌드 (서비스가 dist를 import)
COPY libs/contracts ./libs/contracts
RUN cd libs/contracts && npm install && npm run build

# 2) 서비스 설치
COPY services/${SERVICE} ./services/${SERVICE}
WORKDIR /app/services/${SERVICE}
RUN npm install

CMD ["npm", "run", "dev"]
