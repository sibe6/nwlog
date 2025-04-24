FROM node:18

WORKDIR /app

COPY app/package*.json ./

RUN apt-get update && \
    apt-get install -y libnode108 libpcap-dev build-essential python3  && \
    rm -rf /var/lib/apt/lists/*

RUN npm install

COPY app ./

EXPOSE 3000

CMD ["npm", "start"]
