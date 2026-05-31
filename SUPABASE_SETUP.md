# Configuração do Supabase

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Project name**: financeiropessoal (ou outro nome)
   - **Database Password**: crie uma senha forte
   - **Region**: escolha a região mais próxima
5. Aguarde o projeto ser criado (2-5 minutos)

## 2. Obter a Connection String

1. Na dashboard do projeto, vá para **Settings** → **Database**
2. Copie a **Connection string** (JDBC, URI ou psql)
3. A URL terá este formato:
   ```
   postgresql://postgres:[password]@[host]:[port]/postgres?schema=public
   ```

## 3. Configurar Variáveis de Ambiente

### Localmente

```bash
cp .env.example .env
# Edite .env e atualize DATABASE_URL
nano .env
```

Adicione:
```env
DATABASE_URL="postgresql://postgres:[password]@[host]:[port]/postgres?schema=public"
```

### No VPS (Hostinger)

1. Acesse o servidor SSH
2. Edite o arquivo `.env`:
   ```bash
   nano /caminho/para/financeiropessoal/.env
   ```
3. Adicione a mesma `DATABASE_URL`

## 4. Gerar Migrações

```bash
# Criar migration inicial
npx prisma migrate dev --name init

# Ou, se já tem banco criado, apenas sincronizar schema
npx prisma db push
```

## 5. Teste Localmente

```bash
npm run dev
```

Acesse `http://localhost:3000` e teste a aplicação.

## 6. Deploy

Após configurar `.env` no VPS com `DATABASE_URL` do Supabase, faça:

```bash
git push origin main
```

O GitHub Actions vai:
1. Conectar ao Supabase automaticamente (via DATABASE_URL)
2. Fazer build e deploy
3. Rodar as migrações se necessário

## 📝 Notas Importantes

- **Não exponha DATABASE_URL**: nunca commite `.env` no repositório
- **Backup regular**: configure backups automáticos no Supabase
- **RLS (Row Level Security)**: considere habilitar no futuro para segurança
- **Connection pooling**: use `?pgbouncer=true` na URL se tiver muitas conexões

## 🔧 Troubleshooting

### Erro: "cannot connect to database"
- Verifique se `DATABASE_URL` está correta
- Confirme que o firewall permite conexões

### Erro: "relation does not exist"
- Execute: `npx prisma db push` para sincronizar o schema
- Ou: `npx prisma migrate dev` para criar nova migration
