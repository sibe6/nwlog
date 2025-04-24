# NWLOG

Tracks packets from selected device

![image](https://github.com/user-attachments/assets/97f9f3e4-73a1-42fb-8ce5-fccb394ed8ce)

## Requirements

Install Docker and Docker Compose

```bash
sudo mkdir -p /etc/apt/keyrings 
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## How to Run

Set correct IP for server at `frontend/nginx.prod.conf` 

Run
```bash
docker compose build
docker compose up -d
```
