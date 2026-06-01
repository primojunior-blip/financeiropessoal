# Configurar Secrets do GitHub para Deploy Automático

Para que o GitHub Actions possa fazer deploy na VPS e usar o Supabase, configure estes secrets:

## 1. Acessar Settings do Repositório

1. Vá para seu repositório no GitHub: https://github.com/primojunior-blip/financeiropessoal
2. Clique em **Settings**
3. No menu à esquerda, vá para **Secrets and variables** → **Actions**

## 2. Adicionar Secrets Necessários

Clique em "New repository secret" e adicione:

### VPS SSH Connection
- **VPS_HOST**: IP ou hostname da sua VPS Hostinger (ex: `192.168.1.100`)
- **VPS_USER**: Usuário SSH (geralmente `root`)
- **VPS_PORT**: Porta SSH (padrão: `22`)
- **VPS_SSH_KEY**: Conteúdo completo da sua chave SSH privada

Para gerar chave SSH (se não tiver):
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa
# Deixe passphrase vazia
# Copie conteúdo de ~/.ssh/id_rsa e cole no secret
```

### Supabase Connection
- **DATABASE_URL**: String de conexão do Supabase (com URL encoding da senha se necessário)

Exemplo:
```
postgresql://postgres:SuaSenh%40123@db.xxxxx.supabase.co:5432/postgres
```

### Deploy Path
- **DEPLOY_PATH**: Caminho na VPS onde o app será deploiado (ex: `/home/financeiro`)

## 3. Configurar Chave SSH na VPS

1. No painel Hostinger, vá para **SSH Access**
2. Copie sua chave pública (`~/.ssh/id_rsa.pub` do seu computador)
3. Cole em **Authorized Keys** na VPS
4. Salve

## 4. Verificar Deploy Automático

1. Faça um commit local:
```bash
git add .
git commit -m "chore: add github secrets setup"
git push origin main
```

2. Vá para **Actions** no GitHub
3. Veja a workflow "Deploy to VPS" executando
4. Clique nela para ver logs
5. Se tudo correr bem, sua app estará no endereço IP da VPS:3000

## 5. Acessar a Aplicação

Na VPS, você pode testar com:
```bash
ssh -i ~/.ssh/id_rsa root@SEU_IP_VPS
cd /home/financeiro
docker ps  # Deve mostrar container rodando
curl http://localhost:3000  # Deve retornar HTML da app
```

## Troubleshooting

### SSH Connection Failed
- Verifique se a chave SSH está no formato correto (-----BEGIN RSA PRIVATE KEY-----)
- Confirme que a chave pública está em Authorized Keys na VPS

### Docker Image Build Failed
- Verifique logs no GitHub Actions
- Pode ser problema de dependências em `package.json`

### App não conecta ao Supabase
- Confirme que `DATABASE_URL` no secret está correto
- Teste localmente com `node debug-connection.js`

### Port 3000 não está acessível
- Verifique firewall na VPS: `sudo ufw allow 3000`
- Reinicie container: `docker restart financeiropessoal`
