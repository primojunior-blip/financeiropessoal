# 🚀 Deployment Final - Conexão Supabase OK

## Status: ✅ Supabase Conectado

- ✅ Connection string atualizada para Session Pooler
- ✅ Banco de dados sincronizado
- ✅ Tabelas criadas com sucesso

## Próximos Passos para Deploy

**Se está usando EasyPanel** (interface web da VPS), veja: [EASYPANEL_SETUP.md](EASYPANEL_SETUP.md)

**Se está usando Docker Compose via CLI:**

### 1. Atualizar .env na VPS

SSH na sua VPS e atualize o arquivo `.env`:

```bash
ssh root@SEU_IP_VPS
cd /home/financeiro  # ou seu DEPLOY_PATH
nano .env
```

Cole estas variáveis:
```
DATABASE_URL="postgresql://postgres.klruigddjntsrgfsgnen:kNLfeRIQRjdRMqMH@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://klruigddjntsrgfsgnen.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_hiC5dZHoIZwpglqP7_ZvLQ_US3hq1VF"
NODE_ENV="production"
JWT_SECRET="seu_secret_jwt_aqui_mudar_depois"
```

**IMPORTANTE**: Não compartilhe essas credenciais em públicos!

### 2. Configurar GitHub Secrets (Alternativo)

Se preferir usar GitHub Actions para deploy automático:

1. Vá para seu repo: https://github.com/primojunior-blip/financeiropessoal
2. **Settings** → **Secrets and variables** → **Actions**
3. Adicione novo secret: **DATABASE_URL** com a connection string acima
4. Adicione outros secrets conforme `.env.example`

Veja: [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md)

### 3. Deploy com Docker Compose

Na VPS:

```bash
# Se ainda não fez pull do código
git clone https://github.com/primojunior-blip/financeiropessoal.git
cd financeiropessoal

# Ou se já clonou
git pull origin main

# Buildar e rodar
docker-compose up -d --build
```

### 4. Verificar Status

```bash
# Ver logs
docker-compose logs -f app

# Testar endpoint
curl http://localhost:3000

# Verificar banco de dados
docker-compose exec app npx prisma studio  # UI para gerenciar dados
```

### 5. Acessar a Aplicação

- **Localmente**: http://localhost:3000
- **Na VPS**: http://SEU_IP_VPS:3000
- **Com domínio**: Configure DNS + nginx reverse proxy (opcional)

## Troubleshooting

### Container não inicia

```bash
# Ver erro completo
docker-compose logs app

# Debugar .env
docker-compose exec app env | grep DATABASE_URL

# Testar conexão dentro do container
docker-compose exec app node debug-connection.js
```

### App conecta mas dados não aparecem

Pode ser que precise rodar as migrations:

```bash
docker-compose exec app npx prisma db push
docker-compose exec app npx prisma migrate deploy
```

### Port 3000 não acessível

```bash
# Verificar firewall
sudo ufw allow 3000

# Verificar se container está rodando
docker ps

# Reiniciar
docker-compose restart app
```

## Próximos Passos Opcionais

1. **Usar domínio próprio**: Configure DNS + nginx reverse proxy
2. **SSL/HTTPS**: Use Let's Encrypt + nginx
3. **Backup automático**: Configure backups do Supabase
4. **Monitoramento**: Adicione logs, Sentry, ou New Relic

---

**Parabéns! 🎉 Seu app está pronto para produção!**

Qualquer dúvida, execute `node debug-connection.js` para diagnosticar problemas.
