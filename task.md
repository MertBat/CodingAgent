# AI GitHub Issue Agent - Development Plan

## Amaç

GitHub üzerinde oluşturulan bir issue'nun, AI Agent tarafından çözülmesi.

Sistem:

1. GitHub Issue okunur.
2. Development branch çekilir.
3. Aider + DeepSeek issue'yu analiz eder.
4. Kod değişiklikleri yapılır.
5. Commit oluşturulur.
6. Remote branch'e push edilir.
7. (İleride) PR oluşturulabilir.

---

# Faz 1 - Local Proof of Concept

## Hedef

Tek bir repo üzerinde local makinede çalışır hale getirmek.

### Görevler

* [ ] Node.js projesi oluştur
* [ ] Express veya Fastify kur
* [ ] Aider kurulumu yap
* [ ] DeepSeek API key tanımla
* [ ] Test reposu oluştur
* [ ] Node.js'ten Aider çalıştır
* [ ] Dosya değişikliği yapabildiğini doğrula
* [ ] Git commit oluştur
* [ ] Git push işlemini test et

### Çıktı

Node.js uygulaması aşağıdaki işlemi yapabilmeli:

```text
Task Prompt
    ↓
Aider
    ↓
Kod Değişikliği
    ↓
Commit
    ↓
Push
```

---

# Faz 2 - GitHub Issue Entegrasyonu

## Hedef

Issue içeriğini otomatik okuyup prompt'a dönüştürmek.

### Görevler

* [ ] GitHub Token oluştur
* [ ] GitHub API entegrasyonu yap
* [ ] Issue başlığını çek
* [ ] Issue açıklamasını çek
* [ ] Prompt oluşturucu geliştir

### Prompt Formatı

Repository: sale-api

Branch: development

Issue Title:
{title}

Issue Description:
{body}

Requirements:

* Existing code style must be preserved
* Build must succeed
* Update tests if needed
* Do not introduce breaking changes

### Çıktı

Issue numarası verilince AI çalışabilmeli.

```text
Issue #123
    ↓
Prompt Builder
    ↓
Aider
```

---

# Faz 3 - Branch Yönetimi

## Hedef

Development branch'i korumak.

### Görevler

* [ ] Branch oluştur

Örnek:

```text
ai/issue-123
```

* [ ] Branch checkout
* [ ] Commit
* [ ] Push

### Çıktı

```text
development
      ↓
ai/issue-123
      ↓
push
```

---

# Faz 4 - HTTP API

## Hedef

Dışarıdan tetiklenebilir hale getirmek.

### Endpoint

POST /run-task

Request:

```json
{
  "repo": "sale-api",
  "issueNumber": 123
}
```

Response:

```json
{
  "success": true,
  "jobId": "abc123"
}
```

### Görevler

* [ ] API oluştur
* [ ] Validation ekle
* [ ] API Key koruması ekle
* [ ] Loglama ekle

---

# Faz 5 - VPS Deployment

## Hedef

Sistemi sunucuda sürekli çalıştırmak.

### Görevler

* [ ] VPS'e Node.js kur
* [ ] Aider kur
* [ ] PM2 kur
* [ ] Environment değişkenleri ekle
* [ ] GitHub token ekle
* [ ] DeepSeek token ekle

### Çıktı

```text
VPS
 ├── Agent API
 ├── Aider
 ├── Git Repositories
 └── Logs
```

---

# Faz 6 - GitHub Action Tetikleme

## Hedef

GitHub üzerinden manuel başlatmak.

### Workflow

```text
GitHub
    ↓
Workflow Dispatch
    ↓
Node API
    ↓
Aider
```

### Görevler

* [ ] Workflow oluştur
* [ ] VPS API çağrısı ekle
* [ ] Secret tanımla
* [ ] Başarılı/Başarısız durumlarını logla

---

# Faz 7 - İyileştirmeler

## Gelecek Özellikler

* [ ] PR oluşturma
* [ ] Kod review
* [ ] Build doğrulama
* [ ] Test çalıştırma
* [ ] Queue sistemi
* [ ] Paralel işler
* [ ] Slack bildirimi
* [ ] Discord bildirimi
* [ ] Telegram bot
* [ ] Web dashboard
* [ ] Çoklu repo desteği
* [ ] Claude desteği
* [ ] Gemini desteği
* [ ] Kimi desteği

---

# Minimum Çalışan Ürün (MVP)

Başarı kriteri:

1. Localde çalışıyor.
2. GitHub issue okuyabiliyor.
3. Development branch'i çekebiliyor.
4. Aider ile kod değiştirebiliyor.
5. Commit atabiliyor.
6. Push edebiliyor.
7. GitHub Action ile tetiklenebiliyor.
