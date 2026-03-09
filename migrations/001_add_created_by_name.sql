-- ============================================
-- MIGRATION: Add created_by_name to transactions
-- Run this in Supabase SQL Editor
-- ============================================

-- Add column to track WHO created the transaction (from iPhone Shortcut)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by_name TEXT DEFAULT 'System';
