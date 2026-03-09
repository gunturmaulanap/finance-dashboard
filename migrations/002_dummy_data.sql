-- ============================================
-- MIGRATION + DUMMY DATA
-- Jalankan seluruh file ini di Supabase SQL Editor
-- ============================================

-- 1. Tambah kolom created_by_name (jika belum ada)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by_name TEXT DEFAULT 'System';

-- 2. Tambah Master Categories yang belum ada
INSERT INTO master_categories (name, type) VALUES
  ('Kebutuhan Lainnya', 'pengeluaran'),
  ('Family', 'pengeluaran'),
  ('Self Reward', 'pengeluaran'),
  ('Special Day', 'pengeluaran')
ON CONFLICT DO NOTHING;

-- 3. Tambah Master Payment Methods yang belum ada
INSERT INTO master_payment_methods (name) VALUES
  ('Bank')
ON CONFLICT DO NOTHING;

-- 4. DUMMY TRANSACTIONS — PEMASUKAN (Income)
INSERT INTO transactions (amount, description, transaction_type, category_id, payment_method_id, transaction_date, created_by_name)
VALUES
  (1124313, 'Bank Mandiri', 'pemasukan',
    (SELECT id FROM master_categories WHERE name = 'Makan diluar' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-01T19:11:00+07:00', 'Guntur'),

  (17459723, 'BluAccount', 'pemasukan',
    (SELECT id FROM master_categories WHERE name = 'Family' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-01T19:12:00+07:00', 'Guntur'),

  (150000, 'Refund Chat GPT', 'pemasukan',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-04T12:34:00+07:00', 'Guntur');

-- 5. DUMMY TRANSACTIONS — PENGELUARAN (Expenses)
INSERT INTO transactions (amount, description, transaction_type, category_id, payment_method_id, transaction_date, created_by_name)
VALUES
  -- March 1
  (90471, 'Mama Kampus Godean', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Sembako' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-01T08:43:00+07:00', 'Guntur'),

  (102000, 'Iritisari Kadipilo', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Sembako' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-01T09:20:00+07:00', 'Guntur'),

  (22600, 'Indomaret', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Sembako' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-01T09:31:00+07:00', 'Guntur'),

  (27500, 'Laundry One Click', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-01T09:34:00+07:00', 'Guntur'),

  (21000, 'Tukang Sayur', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Sembako' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-01T09:39:00+07:00', 'Guntur'),

  (55000, 'Cetakan di Iritisari', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-01T11:11:00+07:00', 'Guntur'),

  (115000, 'Paha Ayam 3kg', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Sembako' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-01T12:57:00+07:00', 'Guntur'),

  (134209, 'NutriFarm Bundling Murah', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Family' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-01T13:43:00+07:00', 'Guntur'),

  (26000, 'Top Up Shopee Lala', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-01T13:44:00+07:00', 'Guntur'),

  (10000, 'Tahu Walk', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Makan diluar' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'cash' LIMIT 1),
    '2026-03-01T19:10:00+07:00', 'Guntur'),

  (30000, 'Sate Ayam', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Makan diluar' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'cash' LIMIT 1),
    '2026-03-01T19:10:00+07:00', 'Guntur'),

  -- March 2
  (20000, 'Pulsa telkomsel lala', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-02T11:14:00+07:00', 'Guntur'),

  (336000, 'Tiket Kereta Jogja-Pwt', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-02T14:31:00+07:00', 'Guntur'),

  (10000, 'Gorengan', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Makan diluar' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'cash' LIMIT 1),
    '2026-03-02T19:41:00+07:00', 'Guntur'),

  -- March 3
  (101000, 'Top Up Shopee Lala', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-03T12:13:00+07:00', 'Guntur'),

  (46000, 'Kelengkeng & Kartu Arfan', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Family' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-03T12:19:00+07:00', 'Guntur'),

  (28000, 'Telor 1kg', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Sembako' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'cash' LIMIT 1),
    '2026-03-03T12:17:00+07:00', 'Guntur'),

  (71844, 'Bibit Kelengkeng Merah', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Family' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-03T16:03:00+07:00', 'Guntur'),

  -- March 4
  (46000, 'Print Skripsi', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-04T09:07:00+07:00', 'Guntur'),

  (15500, 'Bensin Mio', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-04T10:44:00+07:00', 'Guntur'),

  (50000, 'Bensin PCX', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-04T12:33:00+07:00', 'Guntur'),

  (45000, 'Lampu Kamar Sebelah', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-04T12:35:00+07:00', 'Guntur'),

  (20000, 'Chat GPT Business', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-04T12:36:00+07:00', 'Guntur'),

  (22100, 'La Minerale', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Sembako' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-04T12:37:00+07:00', 'Guntur'),

  (253500, 'CCTV + Micro SD', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-04T12:37:00+07:00', 'Guntur'),

  (45000, 'Ganti lampu kamar', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-04T15:10:00+07:00', 'Guntur'),

  (7000, 'Cabe, teri', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Sembako' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-04T15:25:00+07:00', 'Guntur'),

  (5000, 'Neli', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Sembako' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'cash' LIMIT 1),
    '2026-03-04T15:26:00+07:00', 'Guntur'),

  (34000, 'Alpukat kocok', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Self Reward' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-04T15:27:00+07:00', 'Guntur'),

  -- March 5
  (141800, 'Skintific TRH Esqa', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-05T15:24:00+07:00', 'Guntur'),

  (24000, 'Naspad 2 bungkus', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Makan diluar' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-05T19:03:00+07:00', 'Guntur'),

  (14000, 'Es Kelapa Muda', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Makan diluar' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'cash' LIMIT 1),
    '2026-03-05T19:06:00+07:00', 'Guntur'),

  (10000, 'Gorengan', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Makan diluar' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-05T19:06:00+07:00', 'Guntur'),

  -- March 8
  (28500, 'Ice Cream', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-08T10:48:00+07:00', 'Guntur'),

  (12784, 'Kapas Gigi', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-08T10:48:00+07:00', 'Guntur'),

  (24200, 'Bubur Instan', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Sembako' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-08T10:49:00+07:00', 'Guntur'),

  (5000, 'Teh Tarik', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Makan diluar' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-08T10:49:00+07:00', 'Guntur'),

  (51000, 'Sawitdah Pak Husain', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-08T10:51:00+07:00', 'Guntur'),

  (5000, 'Jus Nanas', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Makan diluar' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-08T10:51:00+07:00', 'Guntur'),

  (19750, 'Bubur Shopee Food', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Makan diluar' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-08T10:51:00+07:00', 'Guntur'),

  (8500, 'Sikat Gigi', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-08T10:52:00+07:00', 'Guntur'),

  (10480, 'Kentang', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Sembako' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-08T10:52:00+07:00', 'Guntur'),

  (41000, 'Alpukat, Buah Naga, Pisang', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Sembako' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-08T10:53:00+07:00', 'Guntur'),

  (50000, 'La Minerale Galon x 2', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Sembako' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'cash' LIMIT 1),
    '2026-03-08T10:53:00+07:00', 'Guntur'),

  (34000, 'Alpukat Kocok', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Makan diluar' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-08T10:54:00+07:00', 'Guntur'),

  (51000, 'Alfagift', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'bank' LIMIT 1),
    '2026-03-08T12:58:00+07:00', 'Guntur'),

  (50000, 'Jasa bersih2 rumput', 'pengeluaran',
    (SELECT id FROM master_categories WHERE name = 'Kebutuhan Lainnya' LIMIT 1),
    (SELECT id FROM master_payment_methods WHERE LOWER(name) = 'cash' LIMIT 1),
    '2026-03-08T13:10:00+07:00', 'Guntur');
