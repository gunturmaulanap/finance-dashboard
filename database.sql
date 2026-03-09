-- Create Master Categories Table
CREATE TABLE master_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pemasukan', 'pengeluaran')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Master Payment Methods Table
CREATE TABLE master_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC NOT NULL,
  description TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('pemasukan', 'pengeluaran')),
  category_id UUID REFERENCES master_categories(id) ON DELETE SET NULL,
  payment_method_id UUID REFERENCES master_payment_methods(id) ON DELETE SET NULL,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by_name TEXT DEFAULT 'System',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Users Role Table
CREATE TABLE users_role (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'superadmin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE master_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_role ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated full access on master_categories" ON master_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access on master_payment_methods" ON master_payment_methods FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access on transactions" ON transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access on users_role" ON users_role FOR ALL TO authenticated USING (true);

-- Note: The /api/transaction endpoint will use the Supabase Service Role Key 
-- to bypass RLS and authenticate via a static Bearer token directly.

-- SEED DATA
INSERT INTO master_categories (name, type) VALUES
('Makan diluar', 'pengeluaran'),
('Rokok', 'pengeluaran'),
('Sembako', 'pengeluaran'),
('Transportasi', 'pengeluaran'),
('Gaji', 'pemasukan'),
('Freelance', 'pemasukan');

INSERT INTO master_payment_methods (name) VALUES
('Bank BCA'),
('Bank Mandiri'),
('Gopay'),
('OVO'),
('Cash');
