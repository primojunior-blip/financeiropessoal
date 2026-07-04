# 🔍 Como Encontrar a Connection String do Session Pooler

## Passo 1: Dashboard Supabase
Acesse: https://supabase.com/dashboard

## Passo 2: Selecione seu Projeto
Procure pelo projeto com ID: `klruigddjntsrgfsgnen`

## Passo 3: Vá para Database Settings
No **rodapé do menu esquerdo**, clique em **"Settings"**

Ou use este link direto:
```
https://supabase.com/dashboard/project/klruigddjntsrgfsgnen/settings/database
```

## Passo 4: Procure "Connection pooling"
Role para baixo até ver a seção **"Connection pooling"**

Deve aparecer algo assim:
```
┌─────────────────────────────────────────┐
│ Connection pooling                      │
├─────────────────────────────────────────┤
│ Mode: [Session ▼] [Transaction]         │
│                                         │
│ Connection string:                      │
│ postgresql://postgres:****@             │
│ aws-0-us-east-1.pooler.supabase.com    │
│ :6543/postgres                          │
│                                         │
│ [Copiar ▣]                              │
└─────────────────────────────────────────┘
```

## Passo 5: Copie a String
- **Certifique-se que está em "Session" mode**
- Clique no botão de **Copiar**
- Cole em um editor de texto

## O que PROCURAR:
✅ **Correto (Session Pooler):**
```
postgresql://postgres:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
                              ↑ começa com "aws-"
                                                      ↑ porta 6543
```

❌ **Incorreto (Host direto):**
```
postgresql://postgres:PASSWORD@db.klruigddjntsrgfsgnen.supabase.co:5432/postgres
                              ↑ começa com "db."
                                                      ↑ porta 5432
```

## Se Não Encontrar "Connection pooling"
1. Verifique se está em **Settings** → **Database**
2. Procure por um menu suspenso que diz **"Pooler configuration"**
3. Se não ver, pode estar em **Settings** → **API** (menos comum)

---

**Copie a string com "aws-" e porta 6543 e me manda!** 🚀
