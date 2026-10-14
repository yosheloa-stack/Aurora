// ALUGUEL AUTOMÁTICO DO AURORA (ponte com o site autolikesystem.com.br).
//
// O site vende o aluguel; quando o Pix é aprovado, o pedido aparece em
// /api/bot/alugueis/pendentes. Este módulo busca essa fila, entra no grupo
// pelo convite, guarda o número do cliente como dono do bot SÓ naquele grupo
// e devolve o resultado pro site. Quando a mensalidade vence, o bot avisa,
// sai do grupo e o site marca como expirado.
//
// O token (AURORA_RENTAL_TOKEN) nunca fica no git: vem da variável de ambiente
// ou do comando !tokenaluguel, que grava em database/aluguel/config.json
// (ignorado pelo git).
const fs = require('fs')
const path = require('path')
const axios = require('axios')

const pasta = path.join(__dirname, 'database', 'aluguel')
const arqAlugueis = path.join(pasta, 'alugueis.json')
const arqConfig = path.join(pasta, 'config.json')
const SITE_PADRAO = 'https://autolikesystem.com.br'
const INTERVALO_MS = 30000
const DIA_MS = 86400000

if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true })

const lerArq = (arq, padrao) => {
  try { return JSON.parse(fs.readFileSync(arq, 'utf8')) } catch { return padrao }
}
const gravarArq = (arq, dados) => fs.writeFileSync(arq, JSON.stringify(dados, null, 2) + '\n')

const config = () => lerArq(arqConfig, {}) || {}
const salvarConfig = patch => gravarArq(arqConfig, { ...config(), ...patch })
const token = () => String(process.env.AURORA_RENTAL_TOKEN || config().token || '').trim()
const site = () => String(process.env.AURORA_SITE_URL || config().site || SITE_PADRAO).trim().replace(/\/+$/, '')

const lista = () => {
  const d = lerArq(arqAlugueis, [])
  return Array.isArray(d) ? d : []
}
const salvarLista = d => gravarArq(arqAlugueis, d)

const soDigitos = v => String(v || '').replace(/\D/g, '')
const jidDoNumero = numero => {
  const n = soDigitos(numero)
  return n.length >= 10 ? n + '@s.whatsapp.net' : ''
}
const ativo = a => a && a.grupo_jid && new Date(a.expira).getTime() > Date.now()

// O aluguel ativo de um grupo (o de validade mais longa, se tiver renovação).
function doGrupo(grupoJid) {
  return lista()
    .filter(a => a.grupo_jid === grupoJid && ativo(a))
    .sort((a, b) => new Date(b.expira) - new Date(a.expira))[0] || null
}

// Dono do aluguel = o número que o cliente cadastrou no site, e só no grupo
// que ele alugou. Em qualquer outro grupo ele é membro comum.
function ehDonoDoGrupo(grupoJid, senderJid) {
  const a = doGrupo(grupoJid)
  if (!a || !a.dono_jid) return false
  return soDigitos(a.dono_jid) === soDigitos(String(senderJid || '').split('@')[0].split(':')[0])
}

async function chamaSite(caminho, opcoes = {}) {
  const r = await axios({
    url: site() + caminho,
    method: opcoes.method || 'GET',
    data: opcoes.body,
    headers: { 'x-aurora-token': token(), 'Content-Type': 'application/json' },
    timeout: 20000,
    validateStatus: () => true,
  })
  if (r.status === 401) throw new Error('token do aluguel diferente do site (confira AURORA_RENTAL_TOKEN nos dois lados)')
  if (r.status >= 400) throw new Error('site respondeu ' + r.status + ': ' + JSON.stringify(r.data || {}).slice(0, 160))
  return r.data || {}
}

const avisarSite = (pedidoId, patch) => chamaSite('/api/bot/alugueis/resultado', {
  method: 'POST',
  body: { pedido_id: pedidoId, ...patch },
})

// Entra pelo convite. Se o bot já está no grupo, o WhatsApp recusa o convite:
// aí pega o id do grupo pelo próprio convite e confere se ainda é membro.
async function entrarNoGrupo(sock, codigo) {
  try {
    const jid = await sock.groupAcceptInvite(codigo)
    if (jid) return jid
  } catch (e) {
    let info = null
    try { info = await sock.groupGetInviteInfo(codigo) } catch {}
    if (info && info.id) {
      try { await sock.groupMetadata(info.id); return info.id } catch {}
    }
    throw new Error('não consegui entrar no grupo pelo convite (link revogado, grupo cheio ou só admins aprovam)')
  }
  throw new Error('o WhatsApp não devolveu o grupo do convite')
}

async function ativar(sock, item) {
  const salvos = lista()
  const ja = salvos.find(a => a.pedido_id === item.pedido_id)
  // Já ativado antes, mas o site não recebeu a resposta: só avisa de novo.
  if (ja && ja.grupo_jid) {
    await avisarSite(item.pedido_id, { status: 'ativo', grupo_jid: ja.grupo_jid, grupo_nome: ja.grupo_nome, expira: ja.expira })
    return
  }

  const grupoJid = await entrarNoGrupo(sock, item.invite_code)
  let grupoNome = ''
  try { grupoNome = (await sock.groupMetadata(grupoJid)).subject || '' } catch {}

  // Renovação: soma os dias em cima da validade que ainda resta no grupo.
  const atual = doGrupo(grupoJid)
  const base = atual ? new Date(atual.expira).getTime() : Date.now()
  const dias = Math.max(1, Math.floor(Number(item.dias) || 30))
  const expira = new Date(base + dias * DIA_MS).toISOString()
  const donoJid = jidDoNumero(item.dono_numero) || (atual && atual.dono_jid) || ''

  salvos.push({
    pedido_id: item.pedido_id,
    login: item.login || '',
    grupo_jid: grupoJid,
    grupo_nome: grupoNome,
    dono_jid: donoJid,
    dias,
    expira,
    ativado_em: new Date().toISOString(),
  })
  salvarLista(salvos)

  await avisarSite(item.pedido_id, { status: 'ativo', grupo_jid: grupoJid, grupo_nome: grupoNome, expira })

  const validade = new Date(expira).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  const marca = donoJid ? '@' + donoJid.split('@')[0] : 'o dono do aluguel'
  try {
    await sock.sendMessage(grupoJid, {
      text: `✅ *Aurora ativado neste grupo!*\n\n👑 Dono do bot aqui: ${marca}\n📅 Válido até: *${validade}*\n\nUse *!menu* para ver os comandos.`,
      mentions: donoJid ? [donoJid] : [],
    })
  } catch {}
}

async function vencer(sock) {
  const salvos = lista()
  const agora = Date.now()
  const restantes = []
  let mudou = false
  const saiuAgora = new Set()
  for (const a of salvos) {
    if (new Date(a.expira).getTime() > agora) { restantes.push(a); continue }
    // Outro pedido (renovação) ainda cobre o grupo: não sai.
    const coberto = salvos.some(b => b !== a && b.grupo_jid === a.grupo_jid && new Date(b.expira).getTime() > agora)
    if (!coberto && a.grupo_jid && !a.saiu && !saiuAgora.has(a.grupo_jid)) {
      saiuAgora.add(a.grupo_jid)
      try {
        await sock.sendMessage(a.grupo_jid, { text: `⏰ *O aluguel do Aurora neste grupo venceu.*\n\nPara renovar, acesse ${site()}/aluguel-bot` })
      } catch {}
      try { await sock.groupLeave(a.grupo_jid) } catch {}
      a.saiu = true
      mudou = true
    }
    try { await avisarSite(a.pedido_id, { status: 'expirado' }) } catch {
      // Sem resposta do site: guarda para avisar na próxima volta.
      restantes.push(a); continue
    }
  }
  if (mudou || restantes.length !== salvos.length) salvarLista(restantes)
}

let rodando = false
async function rodada() {
  const sock = global.socketAluguelAurora
  if (rodando || !sock || !token()) return
  rodando = true
  try {
    const d = await chamaSite('/api/bot/alugueis/pendentes')
    for (const item of d.alugueis || []) {
      try {
        await ativar(sock, item)
        console.log('[aluguel] ativado pedido ' + item.pedido_id)
      } catch (e) {
        console.log('[aluguel] falhou pedido ' + item.pedido_id + ': ' + e.message)
        try { await avisarSite(item.pedido_id, { status: 'erro', erro: e.message }) } catch {}
      }
    }
    await vencer(sock)
  } catch (e) {
    console.log('[aluguel] ' + e.message)
  } finally {
    rodando = false
  }
}

function iniciar(sock) {
  global.socketAluguelAurora = sock
  if (global.intervaloAluguelAurora) return
  if (!token()) console.log('[aluguel] sem token: mande !tokenaluguel <token> no privado do bot')
  setTimeout(() => rodada().catch(() => {}), 5000)
  global.intervaloAluguelAurora = setInterval(() => rodada().catch(() => {}), INTERVALO_MS)
}

module.exports = {
  iniciar, rodada, doGrupo, ehDonoDoGrupo, salvarConfig, token, site, lista,
}
