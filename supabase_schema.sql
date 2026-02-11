-- Execute este SQL no SQL Editor do seu dashboard Supabase
-- https://supabase.com/dashboard/project/_/sql

-- 1. Tabela para os servidores de cheats (Blacklist)
CREATE TABLE IF NOT EXISTS cheat_servers (
    id TEXT PRIMARY KEY,
    name TEXT
);

-- 2. Tabela para a Whitelist (Admins/Investigadores)
CREATE TABLE IF NOT EXISTS whitelist (
    user_id TEXT PRIMARY KEY,
    username TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela para Histórico de Deteções (Analytics)
-- NOTA: Se já existir e der erro, apague a tabela antiga antes de rodar este comando
CREATE TABLE IF NOT EXISTS detection_logs (
    user_id TEXT PRIMARY KEY,
    detected_in TEXT, -- Servidores onde foi apanhado
    type TEXT, -- 'auto' ou 'manual'
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela Legada (Cache) - Mantida para compatibilidade se necessário
CREATE TABLE IF NOT EXISTS server_members (
    user_id TEXT,
    guild_id TEXT,
    username TEXT,
    roles TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, guild_id)
);

-- 5. Tabela para controlo de uso do comando !check
CREATE TABLE IF NOT EXISTS user_usage (
    user_id TEXT PRIMARY KEY,
    usage_count INTEGER DEFAULT 0,
    last_use TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Políticas de Segurança (RLS) - Evita erro de duplicado
ALTER TABLE server_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON server_members;
CREATE POLICY "Allow all access" ON server_members FOR ALL USING (true) WITH CHECK (true);
