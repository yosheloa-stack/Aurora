/* 
* Não utilize o nome original do bot.
* Utilize com respeito e responsabilidade.
* Author: Yosh.
* Site api pra funcionar os downloads: https://tokito-apis.com.br
*/

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, delay } = require('@whiskeysockets/baileys')
const { fs, path, util, NodeCache, colors, pino, readline, Boom, estado, banner2, banner3 } = require('./database/lib/exports.js')
const setting = require('./database/config-all.json'), qrterminal = require('qrcode-terminal')

const NomeDoBot = setting.NomeDoBot, prefix = setting.prefix, ownerNumber = setting.ownerNumber, VERSAO = setting.VERSAO || '1.0.0', SUPORTE_NUMBER = setting.SUPORTE_NUMBER || ownerNumber
const qrcode = path.join(__dirname, 'database', 'qrcode'), handler = require.resolve('../tokito.js'), logger = pino({ level: 'silent' })
const cache = new NodeCache(), fotos = new NodeCache({ stdTTL: 1800, checkperiod: 60 })
const rl = readline.createInterface({ input: process.stdin, output: process.stdout }), pergunta = texto => new Promise(resolve => rl.question(texto, resolve))

let tokitojs = require(handler), iniciando = false, reconectando = false, metodo = null, ultimoqr = null

if (!fs.existsSync(qrcode)) fs.mkdirSync(qrcode, { recursive: true })

const grupos = path.join(__dirname, 'database', 'grupos', 'ATIVAÇÕES-TOKITO')
if (!fs.existsSync(grupos)) fs.mkdirSync(grupos, { recursive: true })

const numeros = valor => String(valor || '').replace(/\D/g, '')

const normalizar = jid => {
jid = String(jid || '')
if (!jid) return ''

if (jid.includes(':')) {
const numero = jid.split(':')[0]
if (numero) return `${numero}@s.whatsapp.net`
}

if (jid.endsWith('@lid') || jid.endsWith('@g.us') || jid.endsWith('@s.whatsapp.net')) return jid
if (jid.endsWith('@c.us')) return jid.replace('@c.us', '@s.whatsapp.net')

const numero = numeros(jid)
return numero ? `${numero}@s.whatsapp.net` : jid
}

const grupopath = jid => path.join(grupos, `${jid}.json`)

const lergrupo = jid => {
try {
const arquivo = grupopath(jid)
if (!fs.existsSync(arquivo)) return null

const dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'))
return Array.isArray(dados) ? dados : null
} catch {
return null
}
}

const participante = (alvo, membros = []) => {
let jid = typeof alvo === 'string'
? alvo
: alvo?.phoneNumber ||
alvo?.participantAlt ||
alvo?.jid ||
alvo?.id ||
alvo?.participant ||
alvo?.lid ||
''

if (String(jid).includes('@lid')) {
const achou = membros.find(item =>
item?.id === jid ||
item?.lid === jid ||
item?.jid === jid ||
item?.participant === jid
)

jid =
achou?.phoneNumber ||
achou?.participantAlt ||
achou?.jid ||
jid
}

return normalizar(jid)
}

const legenda = (mensagem, dados) => {
const mencao = dados.numero ? `@${dados.numero}` : 'usuário'

const tags = {
'#numero#': mencao,
'#numerodele#': mencao,
'#nomegrupo#': dados.grupo,
'#nomedogp#': dados.grupo,
'#prefixo#': dados.prefixo,
'#nomedobot#': dados.bot,
'#hora#': dados.hora,
'#dia#': dados.dia,
'#data#': dados.data,
'#ano#': dados.ano,
'#year#': dados.ano,
'#yeah#': dados.ano,
'#estado#': dados.estado,
'#membros#': dados.membros
}

let texto = String(mensagem || '')

for (const [tag, valor] of Object.entries(tags)) {
texto = texto.split(tag).join(String(valor))
}

return texto
}

const boasvindas = async(tokito, grupo, usuario, config, entrou, texto) => {
const contexto = { mentionedJid: usuario ? [usuario] : [] }
const campo = entrou ? 'fundobv' : 'fundosaiu'
const fundo = config?.[campo], tipo = config?.[`${campo}_tipo`]

if (fundo && tipo) {
const buffer = Buffer.from(fundo, 'base64')

if (tipo === 'video') {
return tokito.sendMessage(grupo, {
video: buffer,
mimetype: 'video/mp4',
gifPlayback: true,
caption: texto,
contextInfo: contexto
})
}

return tokito.sendMessage(grupo, {
image: buffer,
caption: texto,
contextInfo: contexto
})
}

let foto = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'

try {
foto = await global.fotobv(usuario, foto)
} catch {}

return tokito.sendMessage(grupo, {
image: { url: foto },
caption: texto,
contextInfo: contexto
})
}

const evento = async(tokito, atualizacao) => {
const eventos = Array.isArray(atualizacao) ? atualizacao : [atualizacao]

for (const item of eventos) {
try {
const grupo = item?.id, acao = item?.action

if (!grupo?.endsWith('@g.us')) continue
if (!['add', 'remove'].includes(acao)) continue

const dataGp = lergrupo(grupo)
const config = dataGp?.[0]?.wellcome?.[0]

if (!config?.bemvindo1) continue

const metadata = await tokito.groupMetadata(grupo)
const membros = metadata?.participants || [], total = membros.length

let cfg = setting

try {
cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'database', 'config-all.json'), 'utf8'))
} catch {}

const agora = new Date()
const hora = agora.toLocaleTimeString('pt-BR', { timeZone: 'America/Fortaleza', hour: '2-digit', minute: '2-digit' })
const dia = agora.toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza', weekday: 'long' })
const data = agora.toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' })
const ano = agora.toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza', year: 'numeric' })

for (const membro of item?.participants || []) {
const usuario = participante(membro, membros)
const numero = String(usuario || '').includes('@lid') ? '' : String(usuario || '').split('@')[0].split(':')[0].replace(/\D/g, '')
const entrou = acao === 'add'

const dados = {
numero,
grupo: metadata?.subject || dataGp?.[0]?.name || 'Grupo',
prefixo: cfg.prefix || '!',
bot: cfg.NomeDoBot || 'Bot',
hora,
dia,
data,
ano,
estado: estado(numero),
membros: total
}

const texto = legenda(entrou ? config.legendabv : config.legendasaiu, dados)

await boasvindas(tokito, grupo, usuario, config, entrou, texto)
await delay(500)
}
} catch(error) {
console.log(colors.red('❌ Erro no bem-vindo:'), error?.message || error)
}
}
}

const motivo = codigo => {
return Object.keys(DisconnectReason).find(chave => DisconnectReason[chave] === codigo) || 'desconhecido'
}

const erro = console.error, aviso = console.warn, info = console.info

const bloqueados = [
'Failed to decrypt message with any known session',
'Bad MAC Error',
'Bad MAC',
'SessionCipher.decryptWithSessions',
'verifyMAC',
'Closing session: SessionEntry',
'Removing old closed session: SessionEntry {',
'Closing stale open session for new outgoing prekey bundle'
]

console.error = function() {
const mensagem = util.format(...arguments)
if (bloqueados.some(texto => mensagem.includes(texto))) return
erro.apply(console, arguments)
}

console.warn = function() {
const mensagem = util.format(...arguments)
if (bloqueados.some(texto => mensagem.includes(texto))) return
aviso.apply(console, arguments)
}

console.info = function() {
const mensagem = util.format(...arguments)
if (bloqueados.some(texto => mensagem.includes(texto))) return
info.apply(console, arguments)
}

const parear = async tokito => {
const telefone = await pergunta(colors.cyan('\nDigite o número do WhatsApp que deseja conectar ↴\n--> '))
const numero = numeros(telefone)

if (!numero || numero.length < 11) {
console.log(colors.red('\nNúmero inválido. Digite com DDI e DDD.\nExemplo: 5511999999999\n'))
return parear(tokito)
}

try {
const codigo = await tokito.requestPairingCode(numero)

console.log(colors.cyan(`
┍─݊━⵿໋݊─⊣ ( 🧊 𝐂𝐎́𝐃𝐈𝐆𝐎 𝐃𝐄 𝐂𝐎𝐍𝐄𝐗𝐀̃𝐎 🧊 ) ⊢─⵿໋݊━⵿໋݊─┑
┃ 𖤐𝆺𝅥˚ —̳͟͞͞ 📱 Código: ${colors.white(codigo)}
┃ 𖤐𝆺𝅥˚ —̳͟͞͞ 🧊 WhatsApp > Aparelhos conectados
┃ 𖤐𝆺𝅥˚ —̳͟͞͞ 🧊 Conectar aparelho
┃ 𖤐𝆺𝅥˚ —̳͟͞͞ 🧊 Conectar com número de telefone
┕─݊━⵿໋݊─⊣ ( 🧊 ${NomeDoBot} 🧊 ) ⊢─⵿໋݊━⵿໋݊━⵿໋݊─┙
`))
} catch(error) {
console.log(colors.red('\n❌ Não foi possível gerar o código de conexão.\n'))
console.log(error)
}
}

const suporte = async() => {
console.log(colors.cyan(`\n🌊 Suporte: https://wa.me/${numeros(SUPORTE_NUMBER)}\n`))
}

const painel = async tokito => {
console.log(colors.cyan(`
❪🧊.ꯧ𝙿𝙰𝙸𝙽𝙴𝙻 𝙳𝙴 𝙲𝙾𝙽𝚃𝚁𝙾𝙻𝙴ꯧ⸼🧊❫
┏☆∻∹⋰ ★∻∹⋰ ☆∻∹⋰ ★∻∹⋰┓
├̟⊹ 📱 〔 1 〕 ➢ Código de conexão
├̟⊹ 🧊 〔 2 〕 ➢ QR-Code WhatsApp
├̟⊹ 🌊 〔 3 〕 ➢ Suporte / Ajuda
┗☆∻∹⋰ ★∻∹⋰ ☆∻∹⋰ ★∻∹⋰┛
`))

const opcao = String(await pergunta(colors.white('╰━━➤ ')) || '').trim()

switch(opcao) {
case '1':
metodo = 'codigo'
await parear(tokito)
break

case '2':
metodo = 'qr'
console.log(colors.cyan('\n📱 Preparando o QR-Code para conexão...\n'))

if (ultimoqr) {
qrterminal.generate(ultimoqr, { small: true })
console.log(colors.yellow('\nAbra o WhatsApp > Aparelhos conectados > Conectar aparelho.\n'))
}
break

case '3':
await suporte()
await delay(2000)
return painel(tokito)

default:
console.log(colors.red('\n❌ Opção inválida.\n'))
return painel(tokito)
}
}

const expfile = require.resolve('./database/lib/exports.js'), globalfile = require.resolve('./database/lib/global.js'), libfile = require.resolve('./database/lib/index.js'), menufile = require.resolve('./database/lib/menus.js')
const configfile = require.resolve('./database/config-all.json'), nesfile = require.resolve('./INFO_DADOS/nescessario.json'), vipfile = require.resolve('./database/membros/vip.json')
const arquivos = [handler, expfile, globalfile, libfile, menufile, configfile, nesfile, vipfile]

let recarregando = false

const limpar = () => {
for (const arquivo of arquivos) delete require.cache[arquivo]
}

const recarregar = arquivo => {
if (recarregando) return
recarregando = true

setTimeout(() => {
try {
limpar()

const novo = require(handler)
if (typeof novo !== 'function') throw new Error('tokito.js não está exportando uma função.')

tokitojs = novo

const mensagens = require(globalfile)
console.log(colors.blue(mensagens.reloadSuccess(path.basename(arquivo))))
} catch(error) {
try {
const mensagens = require(globalfile)
console.log(colors.red(mensagens.reloadError(path.basename(arquivo))))
} catch {
console.log(colors.red('Não foi possível carregar as alterações.'))
}

console.log(error)
} finally {
recarregando = false
}
}, 300)
}

for (const arquivo of arquivos) {
fs.watchFile(arquivo, { interval: 800 }, (atual, anterior) => {
if (atual.mtimeMs === anterior.mtimeMs) return
recarregar(arquivo)
})
}

const conectar = async() => {
if (iniciando) return
iniciando = true

try {
const { version } = await fetchLatestBaileysVersion()
const { state, saveCreds } = await useMultiFileAuthState(qrcode)

const tokito = makeWASocket({
version,
logger,
browser: ['Linux', 'Opera', '10.0.22631'],
auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
msgRetryCounterCache: cache,
mobile: false,
fireInitQueries: true,
markOnlineOnConnect: true,
generateHighQualityLinkPreview: true,
connectTimeoutMs: 20000,
keepAliveIntervalMs: 40000,
defaultQueryTimeoutMs: 60000,
retryRequestDelayMs: 5000,
maxMsgRetryCount: 5,
syncFullHistory: false,
downloadHistory: false,
emitOwnEvents: false,
shouldSyncHistoryMessage: () => false,
getMessage: async key => {
const mensagem = global.messageStore?.[key?.id]
return mensagem?.message || { conversation: NomeDoBot }
}
})

global.tokito = tokito
global.qrTokitoAtual = null
global.mostrarQrTokito = false

global.fotobv = async(jid, fallback = 'https://telegra.ph/file/24fa902ead26340f3df2c.png') => {
try {
const final = normalizar(jid)
if (!final) return fallback

const chave = `foto:${final}`, salva = fotos.get(chave)
if (salva) return salva

let foto = null

try {
foto = await tokito.profilePictureUrl(final, 'image')
} catch {}

if (!foto && final.endsWith('@s.whatsapp.net')) {
try {
foto = await tokito.profilePictureUrl(`${numeros(final)}@c.us`, 'image')
} catch {}
}

foto = foto || fallback
fotos.set(chave, foto)

return foto
} catch {
return fallback
}
}

global.fotogp = async(jid, fallback = 'https://telegra.ph/file/24fa902ead26340f3df2c.png') => {
try {
const final = normalizar(jid)
if (!final || !final.endsWith('@g.us')) return fallback

const chave = `grupo:${final}`, salva = fotos.get(chave)
if (salva) return salva

let foto = null

try {
foto = await tokito.profilePictureUrl(final, 'image')
} catch {}

foto = foto || fallback
fotos.set(chave, foto)

return foto
} catch {
return fallback
}
}

tokito.ev.process(async eventos => {
if (eventos['group-participants.update']) {
await evento(tokito, eventos['group-participants.update'])
}

if (eventos['messages.upsert']) {
const upsert = eventos['messages.upsert']

try {
if (typeof tokitojs === 'function') await tokitojs(tokito, upsert)
} catch(error) {
console.log(colors.red('❌ Ocorreu um erro dentro do tokito.js.'))
console.log(error)
}
}

if (eventos['creds.update']) await saveCreds()

if (eventos['connection.update']) {
const { connection, lastDisconnect, qr } = eventos['connection.update']

if (qr) {
ultimoqr = qr
global.qrTokitoAtual = qr

if (metodo === 'qr' && !state.creds.registered) {
console.log(colors.cyan('\n📱 ESCANEIE O QR-CODE PARA CONECTAR O BOT:\n'))
qrterminal.generate(qr, { small: true })
console.log(colors.yellow('\nAbra o WhatsApp > Aparelhos conectados > Conectar aparelho.\n'))
}
}

switch(connection) {
case 'connecting':
console.log(colors.yellow(`🌫️ ${NomeDoBot} está conectando ao WhatsApp...`))
break

case 'open': {
global.startTime = Math.floor(Date.now() / 1000)
reconectando = false, metodo = null, ultimoqr = null, global.qrTokitoAtual = null, global.mostrarQrTokito = false
console.log(banner3?.string || colors.magenta('\nAURORA BASE\n'))
console.log(banner2?.string || colors.magenta('Yosh'))
console.log(colors.green(`\n✅ ${NomeDoBot} conectado com sucesso!\n`))

try {
await tokito.sendPresenceUpdate('available')
await tokito.updateProfileStatus(`[ ${NomeDoBot} ONLINE 🧊 ]`)
} catch {}

break
}

case 'close': {
const codigo = lastDisconnect?.error ? new Boom(lastDisconnect.error).output.statusCode : 0
const causa = motivo(codigo)

console.log(colors.red(`\n❌ Conexão fechada | Código: ${codigo} | Motivo: ${causa}\n`))

if (codigo === DisconnectReason.loggedOut || codigo === 401) {
console.log(colors.red('❌ Sessão encerrada. Apague DADOS_TOKITO/database/qrcode e conecte novamente.'))
process.exit(0)
}

if (reconectando) return

reconectando = true
console.log(colors.yellow('⚠️ Reconectando o bot em 5 segundos...'))

setTimeout(() => {
reconectando = false
iniciando = false
conectar()
}, 5000)

break
}
}
}
})

if (!state.creds.registered) await painel(tokito)

iniciando = false
} catch(error) {
console.log(colors.red('\n❌ Ocorreu um erro ao iniciar a conexão.\n'))
console.log(error)

setTimeout(() => {
iniciando = false
conectar()
}, 5000)
}
}

process.on('uncaughtException', erro => {
console.log(colors.red('❌ uncaughtException detectado:'))
console.log(erro)
})

process.on('unhandledRejection', erro => {
console.log(colors.red('❌ unhandledRejection detectado:'))
console.log(erro)
})

conectar().catch(erro => {
console.log(colors.red(`❌ Ocorreu um erro ao inicializar o bot: ${erro?.message || erro}`))
})