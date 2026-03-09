# 📱 Integrasi iPhone Shortcut → Finance Dashboard

## Gambaran Umum

Shortcut iPhone Anda saat ini mengirim data ke **Notion API**. Sekarang kita akan mengubahnya agar langsung mengirim ke **Finance Dashboard API** Anda sendiri, lengkap dengan informasi **siapa yang membuat transaksi**.

---

## 🔧 Langkah 1: Jalankan Migration Database

Buka **Supabase Dashboard → SQL Editor**, lalu jalankan:

```sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by_name TEXT DEFAULT 'System';
```

Ini menambahkan kolom `created_by_name` di tabel transaksi untuk melacak siapa pembuat transaksi.

---

## 📲 Langkah 2: Ubah iPhone Shortcut

### Yang Perlu Diubah di "Get Contents of" Action:

| Setting | Sebelum (Notion) | Sesudah (Finance Dashboard) |
|---------|-------------------|-----------------------------|
| **URL** | `https://api.notion.com/v1/pages` | `https://DOMAIN-VERCEL-ANDA.vercel.app/api/transaction` |
| **Method** | POST | POST *(tetap sama)* |

### Headers — Ubah Semua:

| Header | Sebelum | Sesudah |
|--------|---------|---------|
| **Authorization** | `Bearer ntn_10132418...` | `Bearer finance_secure_access_2026_xyz` |
| **Content-Type** | `application/json` *(tetap)* | `application/json` |
| **Notion-Version** | `2022-06-28` | ❌ **HAPUS** (tidak perlu) |

> **Catatan:** Token Bearer `finance_secure_access_2026_xyz` diambil dari file `.env.local` Anda (`API_WEBHOOK_BEARER_TOKEN`).

---

### Request Body — Ubah Strukturnya:

Hapus property `parent` (database_id), dan tambahkan field `User`.

**Struktur JSON baru yang harus dikirim:**

```json
{
  "properties": {
    "Amount": {
      "type": "number",
      "number": 50000
    },
    "Keterangan": {
      "type": "rich_text",
      "rich_text": [
        {
          "plain_text": "Makan siang"
        }
      ]
    },
    "Jenis Transaksi": {
      "type": "rich_text",
      "rich_text": [
        {
          "plain_text": "Pengeluaran"
        }
      ]
    },
    "Date": {
      "type": "date",
      "date": {
        "start": "2026-03-09T10:00:00.000+07:00"
      }
    },
    "Category": {
      "type": "rich_text",
      "rich_text": [
        {
          "plain_text": "Makan diluar"
        }
      ]
    },
    "Payment": {
      "type": "rich_text",
      "rich_text": [
        {
          "plain_text": "Cash"
        }
      ]
    },
    "User": {
      "type": "rich_text",
      "rich_text": [
        {
          "plain_text": "Guntur"
        }
      ]
    }
  }
}
```

---

## 📲 Langkah 3: Langkah Detail di iPhone Shortcut

Ikuti urutan action berikut di Shortcuts app:

### Action 1: Choose from Menu — "Pilih Jenis Transaksi"
- Opsi: **Pengeluaran**, **Pemasukan**
- Set variable `jenisTransaksi` = Text (hasilnya)

### Action 2: Choose from Menu — "Pilih Metode Pembayaran"
- Opsi: **Bank**, **Cash** (sesuaikan dengan Master Payment Methods Anda)
- Set variable `metodeBayar` = Text (hasilnya)

### Action 3: Choose from Menu — "Pilih Category"
- Opsi: **Makan diluar**, **Rokok**, **Sembako**, dll.
- Set variable `category` = Text (hasilnya)

### Action 4: Ask for Input — "Masukkan Jumlah"
- Type: Number
- Set variable `amount` = hasilnya

### Action 5: Ask for Input — "Keterangan"
- Type: Text
- Set variable `keterangan` = hasilnya

### Action 6: Current Date
- Format Date → ISO 8601
- Set variable `tanggal` = hasilnya

### ⭐ Action 7 (BARU): Text — Nama User
- Text: `Guntur` (atau nama iPhone user yang menggunakan shortcut ini)
- Set variable `userName` = hasilnya

> **Tips:** Jika beberapa orang menggunakan shortcut yang sama, ganti step ini dengan **"Ask for Input"** agar setiap orang bisa memasukkan nama mereka.

### Action 8: Get Contents of URL
| Setting | Nilai |
|---------|-------|
| **URL** | `https://DOMAIN-ANDA.vercel.app/api/transaction` |
| **Method** | POST |

**Headers:**
| Key | Value |
|-----|-------|
| Authorization | `Bearer finance_secure_access_2026_xyz` |
| Content-Type | `application/json` |

**Request Body (JSON):**

| Key Path | Value |
|----------|-------|
| `properties` → `Amount` → `type` | `number` |
| `properties` → `Amount` → `number` | Variable: `amount` |
| `properties` → `Keterangan` → `type` | `rich_text` |
| `properties` → `Keterangan` → `rich_text` → Item 1 → `plain_text` | Variable: `keterangan` |
| `properties` → `Jenis Transaksi` → `type` | `rich_text` |
| `properties` → `Jenis Transaksi` → `rich_text` → Item 1 → `plain_text` | Variable: `jenisTransaksi` |
| `properties` → `Date` → `type` | `date` |
| `properties` → `Date` → `date` → `start` | Variable: `tanggal` |
| `properties` → `Category` → `type` | `rich_text` |
| `properties` → `Category` → `rich_text` → Item 1 → `plain_text` | Variable: `category` |
| `properties` → `Payment` → `type` | `rich_text` |
| `properties` → `Payment` → `rich_text` → Item 1 → `plain_text` | Variable: `metodeBayar` |
| `properties` → `User` → `type` | `rich_text` |
| `properties` → `User` → `rich_text` → Item 1 → `plain_text` | Variable: `userName` |

**HAPUS** property `parent` (yang berisi `database_id` Notion).

---

## 🧪 Test di Terminal (cURL)

Sebelum mengubah shortcut, test dulu API-nya melalui terminal:

```bash
curl -X POST https://DOMAIN-ANDA.vercel.app/api/transaction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer finance_secure_access_2026_xyz" \
  -d '{
    "properties": {
      "Amount": { "type": "number", "number": 25000 },
      "Keterangan": { "type": "rich_text", "rich_text": [{ "plain_text": "Kopi Susu" }] },
      "Jenis Transaksi": { "type": "rich_text", "rich_text": [{ "plain_text": "Pengeluaran" }] },
      "Date": { "type": "date", "date": { "start": "2026-03-09T10:00:00.000+07:00" } },
      "Category": { "type": "rich_text", "rich_text": [{ "plain_text": "Makan diluar" }] },
      "Payment": { "type": "rich_text", "rich_text": [{ "plain_text": "Cash" }] },
      "User": { "type": "rich_text", "rich_text": [{ "plain_text": "Guntur" }] }
    }
  }'
```

Respons sukses:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "amount": 25000,
    "description": "Kopi Susu",
    "transaction_type": "pengeluaran",
    "created_by_name": "Guntur"
  }
}
```

---

## 🔄 Untuk Testing Lokal (localhost)

Jika belum deploy ke Vercel, ganti URL menjadi:

```
http://YOUR-LOCAL-IP:3000/api/transaction
```

> Gunakan IP lokal Mac (`ifconfig | grep inet`), bukan `localhost`, karena iPhone tidak bisa akses `localhost` komputer Anda.

---

## 📊 Hasil di Dashboard

Setelah transaksi masuk, di halaman **Transactions** akan muncul kolom baru **"Created By"** yang menampilkan nama user yang memasukkan data dari iPhone Shortcut.

---

## ⚠️ Penting: Sinkronisasi Master Data

Pastikan nama **Category** dan **Payment Method** di iPhone Shortcut **sama persis** (case-insensitive) dengan yang ada di Master Data dashboard:

| Di Shortcut | Di Master Categories |
|------------|---------------------|
| `Makan diluar` | ✅ Makan diluar |
| `makan diluar` | ✅ (case-insensitive) |
| `Makan di Luar` | ❌ Tidak cocok! |

Jika ada category/payment baru, tambahkan dulu di dashboard **Master Categories** / **Master Payment Methods** sebelum menggunakannya di Shortcut.
