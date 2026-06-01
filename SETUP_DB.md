# Troubleshooting da Conexão ao Supabase

Se está recebendo erro `P1001: Can't reach database server`, siga os passos:

## 1. Verificar Credenciais no Painel Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Settings** → **Database**
4. Copie a **Connection String** (URI ou JDBC)
5. Confirme:
   - Host: `db.klruigddjntsrgfsgnen.supabase.co`
   - Porta: `5432`
   - Database: `postgres`
   - Username: `postgres`
   - Password: A que você usou ao criar o projeto

## 2. Testar Conexão Localmente

```bash
# Copie a connection string exata do painel
# Se a senha tem caracteres especiais (@, #, %, etc), use % encoding

# Exemplo com @ na senha:
# Original: No@h90807060
# URL encoded: No%40h90807060

# Update do .env
nano .env
# DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.klruigddjntsrgfsgnen.supabase.co:5432/postgres"
```

## 3. Criar Tabelas

```bash
npx prisma db push
```

## 4. Se Continuar Falhando

- Verifique se o projeto Supabase está **ativo** (não parado)
- Confirme a senha digitando com cuidado
- Tente conectar via Dashboard → SQL Editor para validar as credenciais

## 5. Após Sucesso

```bash
npm run dev
```

Seu app conectará ao banco automaticamente! 🎉
