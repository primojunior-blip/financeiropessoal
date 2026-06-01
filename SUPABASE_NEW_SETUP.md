# Criar Novo Projeto Supabase

Siga estes passos se o projeto anterior foi deletado:

## 1. Criar Novo Projeto

1. Vá para [supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique em "New project"
3. Preencha:
   - **Project name**: `financeiropessoal`
   - **Database password**: Use uma senha sem caracteres especiais, ex: `FinanceiroPessoal2024`
   - **Region**: Escolha a mais próxima (recomendo `South America - São Paulo` se disponível)
4. Clique em "Create new project"
5. Aguarde 1-2 minutos enquanto a infraestrutura é criada

## 2. Obter Connection String

1. Após criar o projeto, vá para **Settings** → **Database**
2. Clique em "Connection pooling" ou "Connection string"
3. Selecione **URI** e copie a string
4. Cole em `.env` como `DATABASE_URL`

## 3. Obter Chaves da API

1. Vá para **Settings** → **API**
2. Copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4. Atualizar .env

```bash
nano .env
# Atualize com os novos valores
```

## 5. Testar Conexão

```bash
node debug-connection.js
# Deve aparecer ✅ Conectado ao banco de dados!
```

## 6. Criar Tabelas

```bash
npx prisma db push
```

## 7. Deploy na VPS

```bash
git add .env (ou não, se quiser manter seguro)
git commit -m "chore: update supabase connection"
git push origin main
# GitHub Actions fará deploy automático
```

---

**IMPORTANTE**: Se a senha contiver caracteres especiais (@, #, %, &), use URL encoding na CONNECTION STRING, não na senha original.

Exemplo:
- Senha original: `myPassword@123`
- Na URL: `postgresql://user:myPassword%40123@host:5432/db`
