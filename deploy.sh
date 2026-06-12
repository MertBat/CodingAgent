#!/bin/bash
# AI GitHub Issue Agent - VPS Kurulum Scripti
# Bu scripti VPS'te çalıştırın

set -e

echo "=== AI GitHub Issue Agent - VPS Kurulumu ==="

# 1. Paketler
echo "[1/5] Paketler kuruluyor..."
sudo apt-get update -y
sudo apt-get install -y nodejs git python3 python3-pip python3-venv curl
sudo npm install -g pm2

# 2. Proje
echo "[2/5] Proje klonlanıyor..."
cd /opt
sudo git clone https://github.com/MertBat/ai-github-issue-agent.git
sudo chown -R $(whoami):$(whoami) ai-github-issue-agent
cd ai-github-issue-agent
npm install

# 3. Aider
echo "[3/5] Aider kuruluyor..."
python3 -m venv venv
source venv/bin/activate
pip install aider-chat
AIDER_PATH=$(which aider)
deactivate

# 4. .env
echo "[4/5] .env dosyası oluşturuluyor..."
cp .env.example .env
echo "AIDER_PATH=$AIDER_PATH" >> .env
echo ""
echo ">>> .env dosyasını düzenle: nano /opt/ai-github-issue-agent/.env"
echo ">>> GITHUB_TOKEN, GITHUB_OWNER, DEEPSEEK_API_KEY değerlerini gir"

# 5. Logs
mkdir -p logs

echo ""
echo "[5/5] Kurulum tamamlandı!"
echo ""
echo ">>> .env dosyasını düzenledikten sonra:"
echo "    cd /opt/ai-github-issue-agent"
echo "    pm2 start ecosystem.config.js"
echo "    pm2 save"
echo "    pm2 startup"
echo ""
echo ">>> Test: curl http://localhost:3000/health"
