-- Script para corrigir roles de usuários que possam ter ficado com valor inválido
-- Verifica se há usuários sem role definido

-- Ver usuários sem role
SELECT id, name, email, role, created_at 
FROM users 
WHERE role IS NULL 
ORDER BY created_at DESC;

-- Ver contagem de usuários por role
SELECT role, COUNT(*) as total 
FROM users 
GROUP BY role 
ORDER BY total DESC;

-- CORREÇÃO (se necessário): definir role padrão USER para usuários sem role
-- UPDATE users 
-- SET role = 'USER':::"UserRole" 
-- WHERE role IS NULL;
