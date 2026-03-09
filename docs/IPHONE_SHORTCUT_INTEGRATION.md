# 📱 Integrasi iPhone Shortcut → Finance Dashboard

## Gambaran Umum

Shortcut iPhone mengirim data ke **Finance Dashboard API** Anda. Berikut panduan lengkap konfigurasi yang benar.

---

## ⚠️ Penyebab Error "Missing required fields"

Error ini terjadi karena cara iPhone Shortcuts membangun JSON berbeda dengan Notion API.

iPhone Shortcuts mengirim field di dalam `properties` sebagai **"1 item"** (array native), bukan objek Notion.

**Format yang dikirim Shortcut:**
```json
{
  "properties": {
    "Keterangan": ["Makan siang"],
    "Amount": [50000],
    "Transaction type": ["pengeluaran"],
    "Date": ["2026-03-09"],
    "Payment": ["Cash"],
    "Category": ["Makan diluar"],
    "Jenis Transaksi": ["Pengeluaran"]
  },
  "User": "Guntur"
}
```

API sudah diupdate untuk membaca format ini ✅

---

## 🔧 Konfigurasi Shortcut yang Benar

### 1. Bagian "Get Contents of URL"

| Setting | Value |
|---|---|
| **URL** | `https://DOMAIN-ANDA.vercel.app/api/transaction` |
| **Method** | POST |

### 2. Headers

| Key | Value |
|---|---|
| Authorization | `Bearer finance_secure_access_2026_xyz` |
| Content-Type | `application/json` |

### 3. Request Body → JSON

Tambahkan 2 field di **root level**:
- `properties` → **Dictionary** (berisi semua field transaksi)
- `User` → **Text** (nama Anda, misal: `Guntur`)

---

### 4. Isi `properties` Dictionary

Di dalam `properties`, tambahkan field-field berikut. **Setiap field nilainya adalah "1 item"** (bukan text langsung):

| Field Name | Type | Value |
|---|---|---|
| `Keterangan` | 1 item | Variable: keterangan (dari Ask for Input) |
| `Amount` | 1 item | Variable: amount (dari Ask for Input) |
| `Transaction type` | 1 item | Variable: jenisTransaksi |
| `Date` | 1 item | Variable: tanggal (formatted ISO) |
| `Payment` | 1 item | Variable: metodeBayar |
| `Category` | 1 item | Variable: category |
| `Jenis Transaksi` | 1 item | Variable: jenisTransaksi |

> **Catatan:** Field `Jenis Transaksi` menggunakan value `Pengeluaran` atau `Pemasukan` (case-insensitive)

---

## 📲 Struktur Actions Shortcut (Urutan)

```
1. [Choose from Menu] "Pilih Jenis Transaksi"
   - Pengeluaran → Text "pengeluaran" → Set Variable: jenisTransaksi
   - Pemasukan   → Text "pemasukan"  → Set Variable: jenisTransaksi

2. [Choose from Menu] "Pilih Category"
   - Makan diluar → Text "Makan diluar" → Set Variable: category
   - Sembako      → Text "Sembako"      → Set Variable: category
   - (dst sesuai Master Categories dashboard)

3. [Choose from Menu] "Pilih Payment"
   - Cash → Text "Cash" → Set Variable: metodeBayar
   - Bank → Text "Bank" → Set Variable: metodeBayar

4. [Ask for Input: Number] "Jumlah" → Set Variable: amount

5. [Ask for Input: Text] "Keterangan" → Set Variable: keterangan

6. [Date] Current Date → [Format Date: ISO 8601] → Set Variable: tanggal

7. [Text] "Guntur" → Set Variable: userName

8. [Get Contents of URL]
   URL: https://DOMAIN.vercel.app/api/transaction
   Method: POST
   Headers:
     Authorization: Bearer finance_secure_access_2026_xyz
     Content-Type: application/json
   Body: JSON
     → properties (Dictionary):
         Keterangan     : [Variable: keterangan]   (1 item)
         Amount         : [Variable: amount]        (1 item)
         Jenis Transaksi: [Variable: jenisTransaksi](1 item)
         Date           : [Variable: tanggal]       (1 item)
         Payment        : [Variable: metodeBayar]   (1 item)
         Category       : [Variable: category]      (1 item)
     → User: [Variable: userName]  ← di ROOT, bukan dalam properties
```

---

## 🧪 Test via cURL

```bash
curl -X POST https://DOMAIN-ANDA.vercel.app/api/transaction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer finance_secure_access_2026_xyz" \
  -d '{
    "properties": {
      "Keterangan": ["Kopi Susu"],
      "Amount": [25000],
      "Jenis Transaksi": ["pengeluaran"],
      "Date": ["2026-03-09"],
      "Payment": ["Cash"],
      "Category": ["Makan diluar"]
    },
    "User": "Guntur"
  }'
```

Respons sukses:
```json
{
  "success": true,
  "data": { "id": "...", "amount": 25000 }
}
```

---

## ⚠️ Pastikan Nama Category & Payment Sama

Nama **Category** dan **Payment** di Shortcut harus sama persis (case-insensitive) dengan yang ada di **Master Data** dashboard:

| Di Shortcut | Di Master Categories |
|---|---|
| `Makan diluar` | ✅ |
| `makan diluar` | ✅ (case-insensitive) |
| `Makan di Luar` | ❌ Tidak cocok! |
