# Aurora Base

Bot de WhatsApp baseado em [Baileys](https://github.com/WhiskeySockets/Baileys).

## Requisitos

- Node.js 20
- npm

## Instalação

```bash
npm install
```

## Como iniciar

```bash
npm start
```

Na primeira execução será exibido um QR Code no terminal para conectar a conta do WhatsApp.

## Configuração

Edite `DADOS_TOKITO/database/config-all.json`:

- `prefix` — prefixo dos comandos (padrão: `!`)
- `NomeDoBot` — nome do bot
- `ownerName` / `ownerNumber` — dono do bot
- `API_URL` / `API_KEY_TOKITO` — API usada para downloads (substitua `SEU-TOKEN` pela sua chave)

## Estrutura

```
DADOS_TOKITO/
  connect.js          # conexão / socket do WhatsApp
  database/
    config-all.json   # configurações gerais
    lib/              # bibliotecas internas (menus, globals, exports)
    membros/          # dados de membros (vip)
    grupos/           # dados por grupo
  INFO_DADOS/         # logos e dados necessários
tokito.js             # handler principal de mensagens
start.sh              # loop de reinício automático
```

> Os dados de sessão/autenticação são gerados em tempo de execução e não são versionados (ver `.gitignore`).
