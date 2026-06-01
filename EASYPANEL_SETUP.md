# 🚀 Deploy com EasyPanel

Guia para fazer deploy do app no EasyPanel da sua VPS Hostinger.

## 1. Acessar EasyPanel

1. Abra seu navegador: `https://SEU_IP_VPS:3000` (ou `https://seu-dominio.com`)
2. Faça login com suas credenciais EasyPanel

## 2. Criar Aplicação Docker

### Via GitHub (Recomendado)

1. No EasyPanel, clique em **"New Application"** ou **"Add Service"**
2. Selecione **"Docker Compose"** ou **"GitHub"**
3. Conecte seu repositório: `https://github.com/primojunior-blip/financeiropessoal.git`
4. Configure:
   - **Branch**: `main`
   - **Docker Compose file path**: `docker-compose.yml` (padrão)
   - **Port**: `3000`

### Variáveis de Ambiente

1. Na seção **"Environment Variables"** ou **"Env"**, adicione:

```
DATABASE_URL=postgresql://postgres.klruigddjntsrgfsgnen:kNLfeRIQRjdRMqMH@aws-1-us-east-1.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://klruigddjntsrgfsgnen.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_hiC5dZHoIZwpglqP7_ZvLQ_US3hq1VF
NODE_ENV=production
JWT_SECRET=seu_secret_jwt_aqui_mudar_depois
```

## 3. Configurar Domínio (Opcional)

Se quiser usar um domínio em vez do IP:

1. Vá em **Settings** → **Domains** ou **Proxy**
2. Adicione seu domínio
3. Aponte o DNS do seu domínio para o IP da VPS
4. EasyPanel pode gerar SSL automático (Let's Encrypt)

## 4. Deploy

1. Clique em **"Deploy"** ou **"Start"**
2. Aguarde o build (2-5 minutos)
3. Verifique os **logs** para erros

## 5. Acessar a Aplicação

- **IP**: `http://SEU_IP_VPS:3000`
- **Domínio**: `https://seu-dominio.com` (se configurado)

## Troubleshooting no EasyPanel

### Container não inicia

1. Vá em **Logs** (aba dentro da aplicação)
2. Procure por mensagens de erro
3. Verifique se as variáveis de ambiente estão corretas

### Testar Conexão ao Supabase

Se o container está rodando mas não conecta ao banco:

1. Abra um **Terminal** no EasyPanel (se disponível)
2. Execute:
   ```bash
   node debug-connection.js
   ```
3. Verifique a mensagem de erro

### Rebuild após atualizar código

1. Vá na aplicação
2. Clique em **"Rebuild"** ou **"Redeploy"**
3. EasyPanel vai fazer git pull e refazer o build automático

## Próximas Melhorias

1. **Auto-update**: Configure webhook GitHub → EasyPanel para deploy automático ao fazer push
2. **Backup**: Configure backup automático do banco no Supabase
3. **Monitoramento**: Adicione alertas no EasyPanel ou integre com Uptime Kuma
4. **SSL**: Ative HTTPS com Let's Encrypt (geralmente automático no EasyPanel)

---

**Dúvidas específicas do EasyPanel?** Consulte a documentação em: https://easypanel.io/docs
