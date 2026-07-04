# Corrigir Connection String do Supabase

## Erro Encontrado
```
Error: (ENOTFOUND) tenant/user postgres.klruigddjntsrgfsgnen not found
```

O problema é que a connection string está usando um formato incorreto de user.

## Solução

1. **Vá ao painel Supabase**: https://supabase.com/dashboard
2. **Settings** → **Database** → **Connection Pooling**
3. **Selecione "Session" mode**
4. **Copie exatamente assim:**

A connection string **correta** deve ter este formato:

```
postgresql://postgres:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**NÃO use:**
```
postgresql://postgres.klruigddjntsrgfsgnen:[password]@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

O user deve ser **apenas `postgres`**, não `postgres.klruigddjntsrgfsgnen`.

## Atualizar .env

Copie a connection string **exata** do painel Supabase (Session mode) para o `.env`:

```bash
nano .env
# Atualize a linha:
# DATABASE_URL="postgresql://postgres:SENHA@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

**Importante:** 
- Use a **porta 6543** (Session Pooler), não 5432
- User é **postgres** (sem o project ID)
- Host começa com **aws-0-us-east-1** ou **aws-1-us-east-1** (depende da região)

## Testar

```bash
npm run dev
# Acesse http://localhost:3000
```
