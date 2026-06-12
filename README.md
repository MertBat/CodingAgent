# AI GitHub Issue Agent

AI GitHub Issue Agent - Otomatik issue çözümleyici

## Mevcut Durum

- [x] **Faz 1** - Local Proof of Concept
- [x] **Faz 2** - GitHub Issue Entegrasyonu
- [x] **Faz 3** - Branch Yönetimi
- [x] **Faz 4** - HTTP API
- [ ] **Faz 5** - VPS Deployment
- [ ] **Faz 6** - GitHub Action Tetikleme
- [ ] **Faz 7** - İyileştirmeler

## Hızlı Başlangıç

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Environment değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenle

# 3. Sunucuyu başlat
npm start
```

## API Endpoint'leri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/health` | Health check |
| POST | `/run-task` | GitHub issue'yu çöz |
| POST | `/poc` | Doğrudan aider testi |

### /run-task

```json
{
  "repo": "sale-api",
  "issueNumber": 123
}
```

### /poc

```json
{
  "repo": "test-repo",
  "prompt": "src/index.js'de console.log'u sil"
}
```

## Örnek Akış

```text
GitHub Issue #123
       ↓
Node.js API /run-task
       ↓
GitHub API → Issue başlık + açıklama çek
       ↓
Branch: ai/issue-123 oluştur (development'dan)
       ↓
Aider + DeepSeek → Kod değişikliği
       ↓
Git commit + push
```

## Gereksinimler

- Node.js 18+
- Python 3.11+ (embeddable kurulu)
- Git
- DeepSeek API Key
- GitHub Token

## Yapılandırma

`.env` dosyası:

```env
# GitHub
GITHUB_TOKEN=ghp_xxx
GITHUB_OWNER=your-username

# AI (DeepSeek)
DEEPSEEK_API_KEY=sk-xxx

# Sunucu
PORT=3000
```

## VPS Deployment (Faz 5)

### 1. VPS'e bağlan ve gerekli paketleri kur

```bash
# Node.js 18+ kur
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git python3 python3-pip python3-venv

# PM2 kur
sudo npm install -g pm2
```

### 2. Projeyi klonla

```bash
git clone https://github.com/<your-user>/ai-github-issue-agent.git
cd ai-github-issue-agent
npm install
```

### 3. Python ortamı ve Aider kur

```bash
# Sanal ortam oluştur
python3 -m venv venv
source venv/bin/activate

# Aider kur
pip install aider-chat

# Hangisini kullanacağını bul (çıktıyı not et)
which aider
# Genelde: /usr/local/bin/aider veya /home/user/ai-github-issue-agent/venv/bin/aider
deactivate
```

### 4. Environment değişkenlerini ayarla

```bash
cp .env.example .env
nano .env
```

`AIDER_PATH`'i 3. adımda bulduğun yola ayarla. Örneğin:
```env
AIDER_PATH=/home/user/ai-github-issue-agent/venv/bin/aider
```

### 5. PM2 ile başlat

```bash
# Logs klasörünü oluştur
mkdir -p logs

# PM2 ile başlat
pm2 start ecosystem.config.js

# Otomatik başlasın (reboot sonrası)
pm2 save
pm2 startup
```

### 6. Test et

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

### PM2 Kullanımı

```bash
pm2 status              # Durum
pm2 logs                # Canlı log
pm2 restart ai-github-issue-agent  # Restart
pm2 stop ai-github-issue-agent     # Durdur
```

## Proje Yapısı

```text
├── src/
│   ├── index.js              # Express sunucu
│   └── services/
│       ├── github.js         # GitHub API entegrasyonu
│       ├── git.js            # Git işlemleri
│       └── aider.js          # Aider servisi
├── python/                    # Python embeddable + aider
├── workspace/                 # Klonlanan repo'lar
├── package.json
├── .env.example
└── task.md
```

## Sorun Giderme

**Aider komutu bulunamadı:**
```bash
# Python Scripts klasörünü PATH'e ekle
$env:Path = "C:\Users\...\CodingAgent\python\Scripts;$env:Path"
```

## Lisans

MIT
