/*
* Não utilize o nome original do bot.
* Utilize com respeito e responsabilidade.
* Author: Yosh.
* Site api pra funcionar os downloads: https://tokito-apis.com.br
*/

const { getContentType, jidNormalizedUser, proto, prepareWAMessageMedia, generateWAMessageFromContent, getFileBuffer, getGroupAdmins, getMembros, getRandom, fs, path, os, colors, performance, linguagem, mess, axios, setting, nescessario, vip, caminhoVip, arquivo, pasta, fuso } = require('./DADOS_TOKITO/database/lib/exports.js')


const { NomeDoBot, ownerName, prefix, channel, channeldl, API_URL, API_KEY_TOKITO, ownerNumber, CREDENTIALS_USER } = setting


if (!fs.existsSync(path.dirname(arquivo))) fs.mkdirSync(path.dirname(arquivo), { recursive: true })
if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true })
if (!fs.existsSync(arquivo)) fs.writeFileSync(arquivo, JSON.stringify({}, null, 2))

const ler = () => {
try {
const dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'))
return dados && typeof dados === 'object' && !Array.isArray(dados) ? dados : {}
} catch {
return {}
}
}

const salvar = dados => fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2))

const extrair = message => {
let atual = message || {}
for (let i = 0; i < 6; i++) {
const proxima = atual?.ephemeralMessage?.message || atual?.viewOnceMessage?.message || atual?.viewOnceMessageV2?.message || atual?.viewOnceMessageV2Extension?.message || atual
if (proxima === atual) break
atual = proxima
}
return atual
}

const apagar = midia => {
try {
if (!midia?.arquivo) return
const local = path.join(pasta, midia.arquivo)
if (fs.existsSync(local)) fs.unlinkSync(local)
} catch {}
}

const agora = () => {
const partes = new Intl.DateTimeFormat('pt-BR', { timeZone: fuso, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date())
const dados = {}
for (const parte of partes) if (parte.type !== 'literal') dados[parte.type] = parte.value
return { data: `${dados.year}-${dados.month}-${dados.day}`, hora: `${dados.hour}:${dados.minute}` }
}

const enviar = async(tokito, jid, texto, midia) => {
if (midia?.arquivo) {
const local = path.join(pasta, midia.arquivo)
if (fs.existsSync(local)) {
const buffer = fs.readFileSync(local)
if (midia.tipo === 'video') return tokito.sendMessage(jid, { video: buffer, mimetype: 'video/mp4', caption: texto })
if (midia.tipo === 'image') return tokito.sendMessage(jid, { image: buffer, caption: texto })
}
}
return tokito.sendMessage(jid, { text: texto })
}

const processar = async() => {
const tokito = global.socketGruposProgramadosTokito
if (!tokito || global.executandoGruposProgramadosTokito) return
global.executandoGruposProgramadosTokito = true

try {
const grupos = ler(), horario = agora(), chave = `${horario.data}-${horario.hora}`
let mudou = false

for (const jid of Object.keys(grupos)) {
const grupo = grupos[jid]
if (!grupo?.ativo) continue

const fechar = grupo.fechar === horario.hora && grupo.ultimoFechamento !== chave
const abrir = grupo.abrir === horario.hora && grupo.ultimaAbertura !== chave
if (!fechar && !abrir) continue

try {
const meta = await tokito.groupMetadata(jid), participantes = meta?.participants || [], admins = getGroupAdmins(participantes), membros = getMembros(participantes)
const numero = String(tokito.user?.id || '').split(':')[0].split('@')[0], bot = jidNormalizedUser(`${numero}@s.whatsapp.net`), adms = admins.map(i => jidNormalizedUser(String(i || '')))
if (!adms.includes(bot)) throw new Error('O bot não é administrador deste grupo')

if (fechar) {
await tokito.groupSettingUpdate(jid, 'announcement')
await enviar(tokito, jid, mess.fechado(grupo.fechar, meta?.subject || 'Grupo'), grupo.fecharmidia)
grupo.ultimoFechamento = chave
mudou = true
console.log(colors.yellow(`🔒 Grupo fechado automaticamente: ${meta?.subject || jid}`))
}

if (abrir) {
await tokito.groupSettingUpdate(jid, 'not_announcement')
await enviar(tokito, jid, mess.aberto(grupo.abrir, meta?.subject || 'Grupo', admins.length + membros.length), grupo.abrirmidia || grupo.midia)
grupo.ultimaAbertura = chave
mudou = true
console.log(colors.green(`🔓 Grupo aberto automaticamente: ${meta?.subject || jid}`))
}
} catch(error) {
console.log(colors.red(`❌ Erro no grupo programado ${jid}:`), error?.message || error)
}
}

if (mudou) salvar(grupos)
} catch(error) {
console.log(colors.red('❌ Erro no sistema de grupos programados:'), error)
} finally {
global.executandoGruposProgramadosTokito = false
}
}

if (global.intervaloGruposProgramadosTokito) clearInterval(global.intervaloGruposProgramadosTokito)
global.intervaloGruposProgramadosTokito = null
global.executandoGruposProgramadosTokito = false

const iniciar = tokito => {
global.socketGruposProgramadosTokito = tokito
if (global.intervaloGruposProgramadosTokito) return
processar().catch(() => {})
global.intervaloGruposProgramadosTokito = setInterval(() => processar().catch(() => {}), 20000)
}


const pastaGrupos = path.join(__dirname, 'DADOS_TOKITO', 'database', 'grupos', 'ATIVAÇÕES-TOKITO')
if (!fs.existsSync(pastaGrupos)) fs.mkdirSync(pastaGrupos, { recursive: true })

const groupJsonPathTokito = jid => path.join(pastaGrupos, `${jid}.json`)
const salvarJson = (local, dados) => fs.writeFileSync(local, JSON.stringify(dados, null, 2) + '\n')
const lerJson = (local, padrao) => {
try {
const dados = JSON.parse(fs.readFileSync(local, 'utf8'))
return Array.isArray(dados) && dados.length ? dados : padrao
} catch {
salvarJson(local, padrao)
return padrao
}
}

const arquivoLikeLimite = path.join(__dirname, 'DADOS_TOKITO', 'database', 'likes', 'limite-likes.json')
if (!fs.existsSync(path.dirname(arquivoLikeLimite))) fs.mkdirSync(path.dirname(arquivoLikeLimite), { recursive: true })
if (!fs.existsSync(arquivoLikeLimite)) fs.writeFileSync(arquivoLikeLimite, JSON.stringify({}, null, 2))

const lerLikeLimite = () => {
try {
const dados = JSON.parse(fs.readFileSync(arquivoLikeLimite, 'utf8'))
return dados && typeof dados === 'object' && !Array.isArray(dados) ? dados : {}
} catch {
return {}
}
}

const salvarLikeLimite = dados => fs.writeFileSync(arquivoLikeLimite, JSON.stringify(dados, null, 2))

const dataDeHoje = () => new Intl.DateTimeFormat('pt-BR', { timeZone: fuso, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).split('/').reverse().join('-')

const LIMITE_LIKE_VIP = 7
const LIMITE_LIKE_MEMBRO = 1

const checarLimiteLike = (sender, vipAtivo) => {
const dados = lerLikeLimite()
const hoje = dataDeHoje()
const registro = dados[sender]
const usados = (registro && registro.data === hoje) ? registro.qtd : 0
const limite = vipAtivo ? LIMITE_LIKE_VIP : LIMITE_LIKE_MEMBRO
return { permitido: usados < limite, usados, limite, restante: Math.max(limite - usados, 0) }
}

const registrarUsoLike = sender => {
const dados = lerLikeLimite()
const hoje = dataDeHoje()
const registro = dados[sender]
const usados = (registro && registro.data === hoje) ? registro.qtd : 0
dados[sender] = { data: hoje, qtd: usados + 1 }
salvarLikeLimite(dados)
}

const dadosGrupo = (nome, jid) => [{
name: nome || 'Grupo',
groupId: jid,
wellcome: [{
bemvindo1: false,
legendabv: `「🧊」 #numero#
- *🧊 | ᴜᴍ ɴᴏᴠᴏ ᴍᴇᴍʙʀᴏ ᴇɴᴛʀᴏᴜ ɴᴏ ɢʀᴜᴘᴏ…* ↴
『🧊』ɢʀᴜᴘᴏ: #nomegrupo#
『🧊』ᴍᴇᴍʙʀᴏs: #membros#
『🧊』ᴇsᴛᴀᴅᴏ: #estado#
『🧊』ʜᴏʀᴀ: #hora#

*ꜰɪᴄᴀᴍᴏꜱ ᴍᴜɪᴛᴏ ꜰᴇʟɪᴢᴇꜱ ᴘᴏʀ ᴛᴇʀ ᴠᴏᴄᴇ̂ ᴄᴏɴᴏꜱᴄᴏ.*
> *🧊 | ᴜsᴇ #prefixo#menu ᴘᴀʀᴀ ᴠᴇʀ ᴏs ᴄᴏᴍᴀɴᴅᴏs.*`,
legendasaiu: `「🧊」 #numero#
- *🧊 | ᴜᴍ ᴍᴇᴍʙʀᴏ ꜱᴀɪᴜ ᴅᴏ ɢʀᴜᴘᴏ…* ↴
『🧊』ɢʀᴜᴘᴏ: #nomegrupo#
『🧊』ᴍᴇᴍʙʀᴏs: #membros#
『🧊』ʜᴏʀᴀ: #hora#

*ᴀɢʀᴀᴅᴇᴄᴇᴍᴏꜱ ᴘᴇʟᴀ ᴘᴀʀᴛɪᴄɪᴘᴀᴄ̧ᴀ̃ᴏ.*`,
fundobv: null,
fundobv_tipo: null,
fundosaiu: null,
fundosaiu_tipo: null
}]
}]

process.on('uncaughtException', function(err) {
console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
console.error(err.stack)
})

async function starttokito(tokito, upsert) {
try {

iniciar(tokito)

for (const info of upsert?.messages || []) {
const from = info.key?.remoteJid
const isGroup = from?.endsWith('@g.us')
const isStatus = from === 'status@broadcast'

if (!from || isStatus) continue
if (!info.message) continue
if (info.key?.fromMe) continue
if (upsert.type === 'append') continue

const mensagem = info.message?.ephemeralMessage?.message || info.message?.viewOnceMessage?.message || info.message?.viewOnceMessageV2?.message || info.message?.viewOnceMessageV2Extension?.message || info.message

if (!mensagem) continue

const type = getContentType(mensagem), content = JSON.stringify(mensagem), pushname = info.pushName || 'Usuário'

try {
await tokito.readMessages([info.key])
} catch {}

function extrairTexto(message) {
const paths = [
'conversation',
'viewOnceMessageV2.message.imageMessage.caption',
'viewOnceMessageV2.message.videoMessage.caption',
'imageMessage.caption',
'videoMessage.caption',
'extendedTextMessage.text',
'viewOnceMessage.message.videoMessage.caption',
'viewOnceMessage.message.imageMessage.caption',
'documentMessage.caption',
'documentWithCaptionMessage.message.documentMessage.caption',
'buttonsResponseMessage.selectedButtonId',
'listResponseMessage.singleSelectReply.selectedRowId',
'templateButtonReplyMessage.selectedId',
'interactiveResponseMessage.nativeFlowResponseMessage.paramsJson'
]

for (const caminho of paths) {
const value = caminho.split('.').reduce((obj, key) => obj?.[key], message)

if (value) {
if (caminho.includes('paramsJson')) {
try {
const resposta = JSON.parse(value)
return resposta?.id || resposta?.selectedId || resposta?.rowId || ''
} catch {
return ''
}
}

return value
}
}

return ''
}

var body = String(extrairTexto(mensagem) || '').trim()
var Procurar_String = body
var budy2 = body.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

global.prefix = prefix

let isCmd = body.startsWith(prefix)
let args = isCmd ? body.slice(prefix.length).trim().split(/[ \t]+/) : body.split(/[ \t]+/)
let command = isCmd ? String(args.shift() || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ç/g, 'c') : null
let q = args.join(' ')

var budy = type === 'conversation' ? mensagem?.conversation : type === 'extendedTextMessage' ? mensagem?.extendedTextMessage?.text : ''
var PR_String = Procurar_String.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

let groupMetadata = ''

try {
groupMetadata = isGroup ? await tokito.groupMetadata(from) : ''
} catch {
groupMetadata = ''
}

const groupName = isGroup ? groupMetadata?.subject || '' : ''
const groupDesc = isGroup ? groupMetadata?.desc || '' : ''
const groupMembers = isGroup ? groupMetadata?.participants || [] : []


const dirGroup = isGroup ? groupJsonPathTokito(from) : ''
const data_IDGP = isGroup ? dadosGrupo(groupName, from) : undefined
if (isGroup && !fs.existsSync(dirGroup)) salvarJson(dirGroup, data_IDGP)
let dataGp = isGroup ? lerJson(dirGroup, data_IDGP) : undefined
if (isGroup && (!dataGp?.[0]?.wellcome?.[0])) {
dataGp = data_IDGP
salvarJson(dirGroup, dataGp)
}
const setGp = dados => { if (isGroup) salvarJson(dirGroup, dados) }
const isWelkom = isGroup ? Boolean(dataGp?.[0]?.wellcome?.[0]?.bemvindo1) : undefined

let sender = jidNormalizedUser(
isGroup
? info?.key?.participantAlt || info?.key?.senderAlt || info?.participantAlt || info?.key?.participant || info?.participant || ''
: info?.key?.senderAlt || info?.key?.participantAlt || info?.key?.remoteJidAlt || info?.key?.remoteJid || from
)

if (String(sender || '').includes('@lid')) {
sender = jidNormalizedUser(info?.key?.participantAlt || info?.key?.senderAlt || info?.participantAlt || info?.key?.remoteJidAlt || sender)
}

sender = String(sender || '').includes('@')
? `${String(sender).split('@')[0].split(':')[0]}@${String(sender).split('@')[1]}`
: String(sender || '').split(':')[0]

const NumeroDoBot = String(tokito.user?.id || '').split(':')[0].split('@')[0]
const botNumber = jidNormalizedUser(`${NumeroDoBot}@s.whatsapp.net`)
const messagesC = PR_String.slice(0).trim().split(/ +/).shift().toLowerCase()
const argss = body.split(/ +/g)

const numeroDonoLimpo = String(ownerNumber || '').replace(/\D/g, '')
const nmrdn = numeroDonoLimpo ? `${numeroDonoLimpo}@s.whatsapp.net` : ''
const donosExtras = [1, 2, 3, 4, 5, 6].map(i => String(nescessario[`numero_dono${i}`] || '').replace(/\D/g, '')).filter(numero => numero.length >= 10).map(numero => `${numero}@s.whatsapp.net`)
const numerodono = [...new Set([nmrdn, ...donosExtras].filter(Boolean))]

const isBotoff = nescessario.botoff

const isBot = info.key?.fromMe === true
const SoDono = numerodono.includes(sender) || isBot
const DonoOficial = nmrdn ? nmrdn === sender : false

const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : []
const membrosGrupo = isGroup ? getMembros(groupMembers) : []
const adminsNormalizados = groupAdmins.map(admin => jidNormalizedUser(String(admin || '')))
const senderNormalizado = jidNormalizedUser(String(sender || ''))
const botNormalizado = jidNormalizedUser(String(botNumber || ''))
const isGroupAdmins = SoDono || adminsNormalizados.includes(senderNormalizado)
const isBotGroupAdmins = !isGroup || adminsNormalizados.includes(botNormalizado)

let vipAlterado = false

for (let i = vip.length - 1; i >= 0; i--) {
const membroVip = vip[i]

if (membroVip?.infinito === true || !membroVip?.expiraEm) continue

const expiracao = new Date(membroVip.expiraEm).getTime()

if (!Number.isFinite(expiracao) || expiracao <= Date.now()) {
vip.splice(i, 1)
vipAlterado = true
}
}

if (vipAlterado) fs.writeFileSync(caminhoVip, JSON.stringify(vip, null, 2))

const isVip = vip.map(i => i.id).includes(sender) || SoDono
const isCargo = SoDono ? 'Mestre' : isVip ? 'VIP' : 'Membro'
const isChVip = isVip ? 'ꜱɪᴍ ✅' : 'ɴᴀᴏ ❌'
const Res_SoDono = mess.onlyOwner()

// FUNÇÕES DE MARCAÇÕES ESSENCIAL \\

const normalizar = jid => {
jid = String(jid || '')

if (!jid) return ''

if (jid.includes('@lid') && isGroup && groupMetadata?.participants) {
const achou = groupMetadata.participants.find(p => p?.id === jid || p?.lid === jid || p?.jid === jid || p?.participant === jid)

if (achou?.jid) return achou.jid
if (achou?.phoneNumber) return achou.phoneNumber
if (achou?.participantPn) return achou.participantPn
}

return jid
}

const ctxMsg = mensagem?.extendedTextMessage?.contextInfo || mensagem?.stickerMessage?.contextInfo || mensagem?.imageMessage?.contextInfo || mensagem?.videoMessage?.contextInfo || info.message?.extendedTextMessage?.contextInfo || info.message?.imageMessage?.contextInfo || info.message?.videoMessage?.contextInfo || {}
const quotedParticipant = normalizar(ctxMsg.participantAlt || ctxMsg.participant || '')
const mentionedList = Array.isArray(ctxMsg.mentionedJid) ? ctxMsg.mentionedJid.map(normalizar).filter(Boolean) : []
const menc_sticker = mentionedList.length > 0 ? mentionedList[0] : quotedParticipant || null
let menc_prt = quotedParticipant || ''
const menc_jid2 = mentionedList
const qSeguro = String(q || '')
const temMention = qSeguro.includes('@')
const menc_os2 = temMention ? menc_jid2.length > 0 ? menc_jid2[0] : menc_sticker || null : menc_prt || menc_sticker
const menc_jid = normalizar(menc_os2 || sender)
const sender_ou_n = temMention ? menc_jid2?.[0] || menc_sticker || sender : menc_prt || menc_sticker || sender
const numClean = txt => String(txt || '').replace(/[()+\-\/\s]/g, '') + '@s.whatsapp.net'
const mrc_ou_numero = qSeguro.length > 6 && !temMention ? numClean(qSeguro) : normalizar(menc_prt || menc_sticker || sender)
const marc_tds = temMention ? normalizar(menc_jid) : qSeguro.length > 6 && !temMention ? numClean(qSeguro) : normalizar(menc_prt || menc_sticker || sender)
const menc_prt_nmr = qSeguro.length > 12 && !temMention ? numClean(qSeguro) : normalizar(menc_prt || menc_sticker || sender)

//////////////////////////====//////////////////////////////////

const dataHoraBR = new Date().toLocaleString('pt-BR', { timeZone: fuso })
const horaBR = new Date().toLocaleTimeString('pt-BR', { timeZone: fuso, hour: '2-digit', minute: '2-digit', second: '2-digit' })

let baileysVersion = 'desconhecida'

try {
const pkgPath = path.join(__dirname, 'node_modules', '@whiskeysockets', 'baileys', 'package.json')
baileysVersion = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))?.version || 'desconhecida'
} catch {
baileysVersion = 'desconhecida'
}

const numeroSender = String(sender || '').split('@')[0].split(':')[0].replace(/\D/g, '')
const messageId = String(info.key?.id || '')
const whatIsPhone = messageId.substring(0, 2) === '3A' ? 'iPhone 🍎' : messageId.length > 21 ? 'Android 👤' : 'Whatsapp Web 🌐'

const newsletter = channeldl && channeldl !== '0@newsletter' ? {
isForwarded: true,
forwardingScore: 1,
forwardedNewsletterMessageInfo: {
newsletterJid: channeldl,
newsletterName: NomeDoBot,
serverMessageId: ''
}
} : {}

const isVerificado = nescessario.verificado

const SeloMeta = {
key: {
participant: '13135550002@s.whatsapp.net',
remoteJid: 'status@broadcast',
fromMe: false,
id: 'AURORA-VERIFICADO'
},
message: {
contactMessage: {
displayName: `${pushname}`,
vcard: `BEGIN:VCARD
VERSION:3.0
N:;${pushname};;;
FN:${pushname}
item1.TEL;waid=13135550002:13135550002
item1.X-ABLabel:Verificado
END:VCARD`,
contextInfo: {
forwardingScore: 1,
isForwarded: true
}
}
}
}

let selo = isVerificado ? SeloMeta : info

const reply = async(text, mentions = []) => {
if (!text) text = ' '

return tokito.sendMessage(from, {
text: String(text),
contextInfo: {
...newsletter,
mentionedJid: mentions
}
}, {
quoted: selo
})
}

const reagir = async(jid, emoji) => {
return tokito.sendMessage(jid, {
react: {
text: emoji,
key: info.key
}
})
}

const chatType = isGroup ? 'GRUPO' : 'PRIVADO'
const groupInfo = isGroup ? `(${groupName || 'SEM NOME'})` : '(Privado)'
const msgType = isCmd ? 'COMANDO' : 'MENSAGEM'

const msgContent = isCmd
? `${prefix}${command}${q ? ` ${q}` : ''}`
: body ||
(mensagem?.imageMessage ? `[ IMAGEM${mensagem.imageMessage.caption ? `: ${mensagem.imageMessage.caption}` : ''} ]` :
mensagem?.videoMessage ? `[ VÍDEO${mensagem.videoMessage.caption ? `: ${mensagem.videoMessage.caption}` : ''} ]` :
mensagem?.audioMessage ? '[ ÁUDIO ]' :
mensagem?.stickerMessage ? '[ FIGURINHA ]' :
mensagem?.documentMessage ? `[ DOCUMENTO: ${mensagem.documentMessage.fileName || 'ARQUIVO'} ]` :
mensagem?.contactMessage ? '[ CONTATO ]' :
mensagem?.contactsArrayMessage ? '[ CONTATOS ]' :
mensagem?.locationMessage ? '[ LOCALIZAÇÃO ]' :
mensagem?.liveLocationMessage ? '[ LOCALIZAÇÃO AO VIVO ]' :
mensagem?.reactionMessage ? `[ REAÇÃO: ${mensagem.reactionMessage.text || 'SEM EMOJI'} ]` :
mensagem?.pollCreationMessage ? `[ ENQUETE: ${mensagem.pollCreationMessage.name || 'SEM TÍTULO'} ]` :
mensagem?.pollCreationMessageV2 ? `[ ENQUETE: ${mensagem.pollCreationMessageV2.name || 'SEM TÍTULO'} ]` :
mensagem?.pollCreationMessageV3 ? `[ ENQUETE: ${mensagem.pollCreationMessageV3.name || 'SEM TÍTULO'} ]` :
'[ MENSAGEM SEM TEXTO ]')

const branco = valor => colors.white(String(valor ?? ''))

console.log(
`${colors.cyan('╭──. ݁ ⛧ ₊ ⊹ . ݁ ˖ ❆ິ̸ . ݁──╮')}
${colors.cyan('|')} ${branco(isGroup ? '👥 MENSAGEM NO GRUPO' : '👤 MENSAGEM NO PRIVADO')}
${colors.cyan('╰──. ݁ ⛧ ₊ ⊹ . ݁ ˖ ❆ິ̸ . ݁──╯')}
${colors.cyan('╭──. ݁ ⛧ ₊ ⊹ . ݁ ˖ ❆ິ̸ . ݁──╮')}
${colors.cyan('| 👤 USUÁRIO:')} ${branco(String(pushname || 'SEM NOME').toUpperCase())}
${colors.cyan('| 📱 NÚMERO:')} ${branco(numeroSender || 'NÃO IDENTIFICADO')}
${colors.cyan('| 📲 APARELHO:')} ${branco(whatIsPhone || 'DESCONHECIDO')}
${colors.cyan('| 💬 CHAT:')} ${branco(`${chatType} ${groupInfo}`)}
${colors.cyan('| 📨 TIPO:')} ${branco(msgType)}
${colors.cyan('| 📝 CONTEÚDO:')} ${branco(msgContent)}
${colors.cyan('| 🕒 HORA:')} ${branco(dataHoraBR)}
${colors.cyan('╰──. ݁ ⛧ ₊ ⊹ 🧊 . ݁ ˖ ❆ິ̸ . ݁──╯')}`
)

if (!isCmd) continue
if(isBotoff && !SoDono) return

const yoshMenu = async(texto, emoji = '🧊') => {
await reagir(from, emoji)

const caminhoVideo = path.join(__dirname, 'DADOS_TOKITO', 'INFO_DADOS', 'LOGOS', 'fotomenu.mp4')
const caminhoImagem = path.join(__dirname, 'DADOS_TOKITO', 'INFO_DADOS', 'LOGOS', 'fotomenu.png')
const contextInfo = { ...newsletter, mentionedJid: [sender] }

if (fs.existsSync(caminhoVideo)) {
return tokito.sendMessage(from, {
video: fs.readFileSync(caminhoVideo),
mimetype: 'video/mp4',
gifPlayback: true,
caption: texto,
contextInfo
}, {
quoted: selo
})
}

if (fs.existsSync(caminhoImagem)) {
return tokito.sendMessage(from, {
image: fs.readFileSync(caminhoImagem),
caption: texto,
contextInfo
}, {
quoted: selo
})
}

return tokito.sendMessage(from, {
text: texto,
contextInfo
}, {
quoted: selo
})
}


switch (command) {

case 'dono1':
case 'dono2':
case 'dono3':
case 'dono4':
case 'dono5':
case 'dono6': {
if (!SoDono) return reply(mess.onlyOwner())

const chave = `numero_dono${command.replace('dono', '')}`
const numeroAntigo = String(nescessario[chave] || '').replace(/\D/g, '')

if (!q && !menc_os2) {
if (!numeroAntigo) return reply(mess.ownerSlotEmpty())

nescessario[chave] = '.'
fs.writeFileSync('./DADOS_TOKITO/INFO_DADOS/nescessario.json', JSON.stringify(nescessario, null, 2))

return tokito.sendMessage(from, {
text: mess.ownerRemoved(numeroAntigo),
contextInfo: { ...newsletter, mentionedJid: [`${numeroAntigo}@s.whatsapp.net`] }
}, { quoted: selo })
}

let numeroNovo = menc_os2 ? String(menc_os2).split('@')[0] : String(q || '').replace(/\D/g, '')
numeroNovo = numeroNovo.replace(/\D/g, '')

if (!numeroNovo) return reply(mess.ownerNumberRequired())

nescessario[chave] = numeroNovo
fs.writeFileSync('./DADOS_TOKITO/INFO_DADOS/nescessario.json', JSON.stringify(nescessario, null, 2))

await tokito.sendMessage(from, {
text: mess.ownerAdded(numeroNovo),
contextInfo: { ...newsletter, mentionedJid: [`${numeroNovo}@s.whatsapp.net`] }
}, { quoted: selo })
}
break

case 'deldono': {
if (!SoDono) return reply(mess.onlyOwner())
if (!q) return reply(mess.ownerSlotRequired())

const numDono = Number(String(q).replace(/\D/g, ''))

if (!Number.isInteger(numDono) || numDono < 1 || numDono > 6) {
return reply(mess.ownerSlotInvalid())
}

const chave = `numero_dono${numDono}`
const numeroAntigo = String(nescessario[chave] || '').replace(/\D/g, '')

if (!numeroAntigo) {
return reply(mess.ownerSlotNotRegistered(numDono))
}

nescessario[chave] = '.'

fs.writeFileSync(
'./DADOS_TOKITO/INFO_DADOS/nescessario.json',
JSON.stringify(nescessario, null, 2)
)

await tokito.sendMessage(from, {
text: mess.ownerRemoved(numeroAntigo),
contextInfo: {
...newsletter,
mentionedJid: [`${numeroAntigo}@s.whatsapp.net`]
}
}, {
quoted: selo
})
}
break


case 'donos': {
const principal = String(ownerNumber || '').replace(/\D/g, '')

const extras = [1, 2, 3, 4, 5, 6]
.map(slot => ({
slot,
numero: String(nescessario[`numero_dono${slot}`] || '').replace(/\D/g, '')
}))
.filter(dono => dono.numero.length >= 10)

const numeros = [...new Set([
principal,
...extras.map(dono => dono.numero)
].filter(numero => numero.length >= 10))]

const mencoes = numeros.map(numero => `${numero}@s.whatsapp.net`)

await tokito.sendMessage(from, {
text: mess.donos(ownerName, principal, extras),
contextInfo: {
...newsletter,
mentionedJid: mencoes
}
}, {
quoted: selo
})
}
break
case 'nome-bot': {
if (!SoDono) return reply(mess.onlyOwner())

const novoNome = String(q || '').trim()
if (!novoNome) return reply(mess.botNameRequired(prefix))

setting.NomeDoBot = novoNome

fs.writeFileSync(
'./DADOS_TOKITO/database/config-all.json',
JSON.stringify(setting, null, 2)
)

await reply(mess.botNameChanged(novoNome))
}
break

case 'nome-dono':
case 'nick-dono': {
if (!SoDono) return reply(mess.onlyOwner())

const novoNomeDono = String(q || '').trim()
if (!novoNomeDono) return reply(mess.ownerNameRequired(prefix))

setting.ownerName = novoNomeDono

fs.writeFileSync(
'./DADOS_TOKITO/database/config-all.json',
JSON.stringify(setting, null, 2)
)

await reply(mess.ownerNameChanged(novoNomeDono))
}
break

case 'donobot':
case 'numero-dono': {
if (!SoDono) return reply(mess.onlyOwner())

let alvo = menc_os2 || menc_prt || String(q || '')
if (Array.isArray(alvo)) alvo = alvo[0]

alvo = normalizar(alvo)

let numero = String(alvo || '').split('@')[0].replace(/\D/g, '')
if (!numero) numero = String(q || '').replace(/\D/g, '')
if (!numero) return reply(mess.mainOwnerRequired(prefix))

setting.ownerNumber = numero

fs.writeFileSync(
'./DADOS_TOKITO/database/config-all.json',
JSON.stringify(setting, null, 2)
)

await tokito.sendMessage(from, {
text: mess.mainOwnerChanged(numero),
contextInfo: {
...newsletter,
mentionedJid: [`${numero}@s.whatsapp.net`]
}
}, {
quoted: selo
})
}
break

case 'channel':
case 'setchannel': {
if (!SoDono) return reply(mess.onlyOwner())

const entradaCanal = String(q || '').trim()
if (!entradaCanal) return reply(mess.channelRequired(prefix, command))

if (entradaCanal === '0') {
setting.channeldl = '0@newsletter'

fs.writeFileSync(
'./DADOS_TOKITO/database/config-all.json',
JSON.stringify(setting, null, 2)
)

return reply(mess.channelDisabled())
}

try {
let jidReal = entradaCanal.endsWith('@newsletter') ? entradaCanal : ''

if (!jidReal) {
const convite = entradaCanal
.replace(/.*whatsapp\.com\/channel\//i, '')
.replace(/.*wa\.me\/channel\//i, '')
.split(/[\/?\s]/)[0]

if (!convite) return reply(mess.error())

const meta = await tokito.newsletterMetadata('invite', convite)
jidReal = meta?.jid || meta?.id || ''
}

if (!jidReal) return reply(mess.error())

setting.channeldl = jidReal

fs.writeFileSync(
'./DADOS_TOKITO/database/config-all.json',
JSON.stringify(setting, null, 2)
)

await reply(mess.channelEnabled(jidReal, entradaCanal))

} catch(e) {
console.log('[SETCHANNEL ERRO]', e)
await reply(mess.error())
}
}
break

case 'prefixo':
case 'setprefix': {
if (!SoDono) return reply(mess.onlyOwner())

const novoPrefixo = String(q || '').trim()
if (!novoPrefixo) return reply(mess.prefixRequired())

setting.prefix = novoPrefixo

fs.writeFileSync(
'./DADOS_TOKITO/database/config-all.json',
JSON.stringify(setting, null, 2)
)

await reply(mess.prefixChanged(novoPrefixo))
}
break

case 'fotomenu':
case 'fundomenu': {
if (!SoDono) return reply(mess.onlyOwner())

const contexto = info.message?.extendedTextMessage?.contextInfo || info.message?.imageMessage?.contextInfo || info.message?.videoMessage?.contextInfo || {}
const marcada = contexto.quotedMessage || mensagem || {}
const midia = marcada?.ephemeralMessage?.message || marcada?.viewOnceMessage?.message || marcada?.viewOnceMessageV2?.message || marcada?.viewOnceMessageV2Extension?.message || marcada
const video = midia?.videoMessage
const imagem = midia?.imageMessage
const videoPath = path.join(__dirname, 'DADOS_TOKITO', 'INFO_DADOS', 'LOGOS', 'fotomenu.mp4')
const imagemPath = path.join(__dirname, 'DADOS_TOKITO', 'INFO_DADOS', 'LOGOS', 'fotomenu.png')

if (video) {
await reagir(from, '⏳')
const buffer = await getFileBuffer(video, 'video')
if (fs.existsSync(imagemPath)) fs.unlinkSync(imagemPath)
fs.writeFileSync(videoPath, buffer)
await reagir(from, '✅')
return reply(mess.menuMediaSaved('video'))
}

if (imagem) {
await reagir(from, '⏳')
const buffer = await getFileBuffer(imagem, 'image')
if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath)
fs.writeFileSync(imagemPath, buffer)
await reagir(from, '✅')
return reply(mess.menuMediaSaved('image'))
}

await reply(mess.menuMediaRequired())
}
break
case 'boton':
case 'botoff': {
if (!SoDono) return reply(mess.onlyOwner())

if (!isBotoff) {
nescessario.botoff = true

fs.writeFileSync(
'./DADOS_TOKITO/INFO_DADOS/nescessario.json',
JSON.stringify(nescessario, null, 2)
)

await reagir(from, '🔴')

await reply(
'*ᴏ ʙᴏᴛ ꜰᴏɪ ᴅᴇsʟɪɢᴀᴅᴏ ᴄᴏᴍ sᴜᴄᴇssᴏ ᴘʀᴀ ᴜsᴏ ᴅᴇ ᴍᴇᴍʙʀᴏs ᴇ ᴀᴅᴍs ᴅᴇ ɢʀᴜᴘᴏs 🙇🏻‍♂️*'
)

} else {
nescessario.botoff = false

fs.writeFileSync(
'./DADOS_TOKITO/INFO_DADOS/nescessario.json',
JSON.stringify(nescessario, null, 2)
)

await reagir(from, '🟢')

await reply(
'*ᴀᴛɪᴠᴀɴᴅᴏ ᴛᴏᴅᴏs ᴏs ꜰᴜɴᴄɪᴏɴᴀᴍᴇɴᴛᴏs ᴅᴏ ʙᴏᴛ ɴᴏᴠᴀᴍᴇɴᴛᴇ 🙇🏻‍♂️*'
)
}
}
break



case 'verificado':
case 'selo': {
if (!SoDono) return reply(Res_SoDono)

nescessario.verificado = !nescessario.verificado
fs.writeFileSync('./DADOS_TOKITO/INFO_DADOS/nescessario.json', JSON.stringify(nescessario, null, 2))
selo = nescessario.verificado ? SeloMeta : info

if (nescessario.verificado) {
await reply(mess.verifiedEnabled())
} else {
await reply(mess.verifiedDisabled())
}
}
break

case 'bemvindo': {
try {
if (!isGroup) return reply(mess.sogrupo())
if (!isGroupAdmins) return reply(mess.soadm())
if (!isBotGroupAdmins) return reply(mess.botadm())

dataGp[0].name = groupName
dataGp[0].wellcome[0].bemvindo1 = !isWelkom
setGp(dataGp)

await reagir(from, dataGp[0].wellcome[0].bemvindo1 ? '✅' : '❌')
return reply(mess.bemvindo(dataGp[0].wellcome[0].bemvindo1))
} catch(e) {
console.log('Erro no bemvindo:', e)
return reply(mess.error())
}
}
break

case 'legendabv':
case 'legendasaiu': {
try {
if (!isGroup) return reply(mess.sogrupo())
if (!isGroupAdmins) return reply(mess.soadm())
if (!isBotGroupAdmins) return reply(mess.botadm())
if (!q) return reply(mess.tags(prefix, command))

const campo = command === 'legendabv' ? 'legendabv' : 'legendasaiu'
dataGp[0].name = groupName
dataGp[0].wellcome[0][campo] = String(q).trim()
setGp(dataGp)

await reagir(from, '✅')
return reply(mess.legenda(campo === 'legendabv' ? 'entrada' : 'saída'))
} catch(e) {
console.log('Erro na legenda do bem-vindo:', e)
return reply(mess.error())
}
}
break

case 'fundobv':
case 'fundosaiu': {
try {
if (!isGroup) return reply(mess.sogrupo())
if (!isGroupAdmins) return reply(mess.soadm())
if (!isBotGroupAdmins) return reply(mess.botadm())

const marcada = extrair(ctxMsg?.quotedMessage || mensagem)
const video = marcada?.videoMessage
const imagem = marcada?.imageMessage
if (!video && !imagem) return reply(mess.midia())

await reagir(from, '⏳')
const tipo = video ? 'video' : 'image'
const buffer = await getFileBuffer(video || imagem, tipo)
const campo = command === 'fundobv' ? 'fundobv' : 'fundosaiu'

dataGp[0].name = groupName
dataGp[0].wellcome[0][campo] = buffer.toString('base64')
dataGp[0].wellcome[0][`${campo}_tipo`] = tipo
setGp(dataGp)

await reagir(from, '✅')
return reply(mess.fundo(campo === 'fundobv' ? 'entrada' : 'saída'))
} catch(e) {
console.log('Erro ao salvar fundo do bem-vindo:', e)
await reagir(from, '❌').catch(() => {})
return reply(mess.error())
}
}
break

case 'delfundos': {
try {
if (!isGroup) return reply(mess.sogrupo())
if (!isGroupAdmins) return reply(mess.soadm())
if (!isBotGroupAdmins) return reply(mess.botadm())

dataGp[0].wellcome[0].fundobv = null
dataGp[0].wellcome[0].fundobv_tipo = null
dataGp[0].wellcome[0].fundosaiu = null
dataGp[0].wellcome[0].fundosaiu_tipo = null
setGp(dataGp)

await reagir(from, '✅')
return reply(mess.fundos())
} catch(e) {
console.log('Erro no delfundos:', e)
return reply(mess.error())
}
}
break

case 'ban': {
try {
if (!isGroup) return reply(mess.sogrupo())
if (!isGroupAdmins) return reply(mess.soadm())
if (!isBotGroupAdmins) return reply(mess.botadm())

let alvo = menc_os2 || menc_prt || String(q || '')
if (Array.isArray(alvo)) alvo = alvo[0]

if (!String(alvo).includes('@')) {
const numero = String(alvo).replace(/\D/g, '')
alvo = numero ? `${numero}@s.whatsapp.net` : ''
}

alvo = normalizar(alvo)
if (!alvo) return reply(mess.marque())
if (alvo === botNumber) return reply(mess.nobot())
if (numerodono.includes(alvo)) return reply(mess.nodono())

await tokito.groupParticipantsUpdate(from, [alvo], 'remove')

await tokito.sendMessage(from, {
text: mess.banido(alvo),
contextInfo: { ...newsletter, mentionedJid: [alvo] }
}, { quoted: selo })

} catch(e) {
console.log('Erro no ban:', e)
await reply(mess.falha())
}
}
break

case 'promover': {
try {
if (!isGroup) return reply(mess.sogrupo())
if (!isGroupAdmins) return reply(mess.soadm())
if (!isBotGroupAdmins) return reply(mess.botadm())

let alvo = menc_os2 || menc_prt || String(q || '')
if (Array.isArray(alvo)) alvo = alvo[0]

if (!String(alvo).includes('@')) {
const numero = String(alvo).replace(/\D/g, '')
alvo = numero ? `${numero}@s.whatsapp.net` : ''
}

alvo = normalizar(alvo)
if (!alvo) return reply(mess.marque())

const admins = groupAdmins.map(i => normalizar(i))
if (admins.includes(alvo)) return reply(mess.jaadm())

await tokito.groupParticipantsUpdate(from, [alvo], 'promote')

await tokito.sendMessage(from, {
text: mess.promovido(alvo),
contextInfo: { ...newsletter, mentionedJid: [alvo] }
}, { quoted: selo })

} catch(e) {
console.log('Erro ao promover:', e)
await reply(mess.falha())
}
}
break

case 'rebaixar': {
try {
if (!isGroup) return reply(mess.sogrupo())
if (!isGroupAdmins) return reply(mess.soadm())
if (!isBotGroupAdmins) return reply(mess.botadm())

let alvo = menc_os2 || menc_prt || String(q || '')
if (Array.isArray(alvo)) alvo = alvo[0]

if (!String(alvo).includes('@')) {
const numero = String(alvo).replace(/\D/g, '')
alvo = numero ? `${numero}@s.whatsapp.net` : ''
}

alvo = normalizar(alvo)
if (!alvo) return reply(mess.marque())
if (alvo === botNumber) return reply(mess.nobot())
if (numerodono.includes(alvo)) return reply(mess.nodono())

const admins = groupAdmins.map(i => normalizar(i))
if (!admins.includes(alvo)) return reply(mess.naoadm())

await tokito.groupParticipantsUpdate(from, [alvo], 'demote')

await tokito.sendMessage(from, {
text: mess.rebaixado(alvo),
contextInfo: { ...newsletter, mentionedJid: [alvo] }
}, { quoted: selo })

} catch(e) {
console.log('Erro ao rebaixar:', e)
await reply(mess.falha())
}
}
break

case 'menu': {
try {
await reagir(from, '🧊')

const caminhoVideo = path.join(__dirname, 'DADOS_TOKITO', 'INFO_DADOS', 'LOGOS', 'fotomenu.mp4')
const caminhoImagem = path.join(__dirname, 'DADOS_TOKITO', 'INFO_DADOS', 'LOGOS', 'fotomenu.png')

const temVideo = fs.existsSync(caminhoVideo)
const temImagem = fs.existsSync(caminhoImagem)

if (!temVideo && !temImagem) {
return reply('❌ Nenhuma mídia de menu encontrada')
}

const menuMedia = await prepareWAMessageMedia(
temVideo ? { video: { url: caminhoVideo }, mimetype: 'video/mp4', gifPlayback: true, seconds: 8 } : { image: { url: caminhoImagem } },
{ upload: tokito.waUploadToServer }
)

const listaMenus = {
title: '🧊⃞ ᴍᴇɴᴜ-ʟɪsᴛᴀs ⃞🧊',
sections: [{
title: '🧊⃞ ᴇsᴄᴏʟʜᴀ ᴜᴍ ᴍᴇɴᴜ ⃞🧊',
rows: [
{ title: '🧊⃞ ᴍᴇɴᴜ ᴘʀɪɴᴄɪᴘᴀʟ ⃞🧊', description: 'ᴍᴏsᴛʀᴀ ᴏs ᴄᴏᴍᴀɴᴅᴏs ᴘʀɪɴᴄɪᴘᴀɪs, ʀᴀɴᴅᴏᴍ ᴇ ᴅᴏᴡɴʟᴏᴀᴅs.', id: `${prefix}menuzz` },
{ title: '🧊⃞ ᴍᴇɴᴜ ᴀᴅᴍ ⃞🧊', description: 'ᴍᴏsᴛʀᴀ ᴏs ᴄᴏᴍᴀɴᴅᴏs ᴅᴇ ᴀᴅᴍɪɴɪsᴛʀᴀᴄᴀᴏ ᴅᴏ ɢʀᴜᴘᴏ.', id: `${prefix}menuadm` },
{ title: '🧊⃞ ᴍᴇɴᴜ ᴅᴏɴᴏ ⃞🧊', description: 'ᴍᴏsᴛʀᴀ ᴏs ᴄᴏᴍᴀɴᴅᴏs ᴇxᴄʟᴜsɪᴠᴏs ᴅᴏ ᴅᴏɴᴏ.', id: `${prefix}menudono` },
{ title: '🧊⃞ ᴘɪɴɢ ⃞🧊', description: 'ᴍᴏsᴛʀᴀ ᴀ ᴠᴇʟᴏᴄɪᴅᴀᴅᴇ ᴇ ᴏ ᴅᴇsᴇᴍᴘᴇɴʜᴏ ᴅᴏ ʙᴏᴛ.', id: `${prefix}ping` },
{ title: '🧊⃞ ᴄʀɪᴀᴅᴏʀ ⃞🧊', description: 'ᴍᴏsᴛʀᴀ ᴀs ɪɴғᴏʀᴍᴀᴄᴏᴇs ᴇ ᴏ ᴄᴏɴᴛᴀᴛᴏ ᴅᴏ ᴄʀɪᴀᴅᴏʀ.', id: `${prefix}criador` },
{ title: '🧊⃞ ᴅᴏɴᴏs ⃞🧊', description: 'ᴍᴏsᴛʀᴀ ᴛᴏᴅᴏs ᴏs ᴅᴏɴᴏs ᴄᴀᴅᴀsᴛʀᴀᴅᴏs ɴᴏ ʙᴏᴛ.', id: `${prefix}donos` },
{ title: '🧊⃞ ʟɪsᴛᴀ ᴠɪᴘ ⃞🧊', description: 'ᴍᴏsᴛʀᴀ ᴛᴏᴅᴏs ᴏs ᴜsᴜᴀʀɪᴏs ᴠɪᴘ ᴄᴀᴅᴀsᴛʀᴀᴅᴏs.', id: `${prefix}viplist` }
]
}]
}

const carouselMessage = {
cards: [{
header: {
hasMediaAttachment: true,
videoMessage: menuMedia.videoMessage
},
headerType: 'VIDEO',
body: {
text: `❪🧊.ꯧᴍᴇɴᴜ ʟɪsᴛꯧ⸼🧊❫
┏☆∻∹⋰ ★∻∹⋰ ☆∻∹⋰ ★∻∹⋰┓
├⊹ 🧊 ʙᴏᴛ: ${NomeDoBot}
├⊹ 🧊 ᴄʀɪᴀᴅᴏʀ: ${ownerName}
├⊹ 🧊 ᴜsᴜᴀʀɪᴏ: ${pushname}
├⊹ 🧊 ᴄᴀʀɢᴏ: ${isCargo}
├⊹ 🧊 ᴠɪᴘ: ${isChVip}
├⊹ 🧊 ᴅɪsᴘᴏsɪᴛɪᴠᴏ: ${whatIsPhone}
├⊹ 🧊 ʙᴀɪʟᴇʏs: ${baileysVersion}
┗☆∻∹⋰ ★∻∹⋰ ☆∻∹⋰ ★∻∹⋰┛`
},
footer: { text: 'ᴇsᴄᴏʟʜᴀ ᴜᴍᴀ ᴏᴘᴄᴀᴏ ᴀʙᴀɪxᴏ' },
nativeFlowMessage: { buttons: [{ name: 'single_select', buttonParamsJson: JSON.stringify(listaMenus) }] }
}]
}

const botoes = [{
name: 'single_select',
buttonParamsJson: JSON.stringify(listaMenus)
}]

await tokito.relayMessage(from, {
interactiveMessage: {
contextInfo: {
stanzaId: selo.key.id,
participant: selo.key.participant || selo.key.remoteJid,
quotedMessage: selo.message,
mentionedJid: [sender]
},
body: { text: `*🧊⃞ ᴀǫᴜɪ ᴇsᴛᴀ sᴇᴜ ᴍᴇɴᴜ ⃞🧊*` },
footer: { text: '' },
carouselMessage: {
cards: [{
header: {
hasMediaAttachment: true,
videoMessage: menuMedia.videoMessage || menuMedia.imageMessage
},
body: {
text: `❪🧊.ꯧᴍᴇɴᴜ ʟɪsᴛꯧ⸼🧊❫
┏☆∻∹⋰ ★∻∹⋰ ☆∻∹⋰ ★∻∹⋰┓
├⊹ 🧊 ʙᴏᴛ: ${NomeDoBot}
├⊹ 🧊 ᴄʀɪᴀᴅᴏʀ: ${ownerName}
├⊹ 🧊 ᴜsᴜᴀʀɪᴏ: ${pushname}
├⊹ 🧊 ᴄᴀʀɢᴏ: ${isCargo}
├⊹ 🧊 ᴠɪᴘ: ${isChVip}
├⊹ 🧊 ᴅɪsᴘᴏsɪᴛɪᴠᴏ: ${whatIsPhone}
├⊹ 🧊 ʙᴀɪʟᴇʏs: ${baileysVersion}
┗☆∻∹⋰ ★∻∹⋰ ☆∻∹⋰ ★∻∹⋰┛`
},
footer: { text: 'ᴇsᴄᴏʟʜᴀ ᴜᴍᴀ ᴏᴘᴄᴀᴏ ᴀʙᴀɪxᴏ' },
nativeFlowMessage: { buttons: botoes }
}]
}
}
}, {
additionalNodes: [{
tag: 'biz',
attrs: {},
content: [{
tag: 'interactive',
attrs: { type: 'native_flow', v: '1' },
content: [{
tag: 'native_flow',
attrs: { v: '9', name: 'mixed' },
content: []
}]
}]
}]
})

} catch(e) {
console.log('ᴇʀʀᴏ ɴᴏ ᴍᴇɴᴜ:', e)
await tokito.sendMessage(from, {
text: mess.error()
}, {
quoted: selo
})
}
}
break
case 'menuadm': {
if (!isGroup) return reply('*❌ | ᴇsᴛᴇ ᴍᴇɴᴜ sᴏ ᴘᴏᴅᴇ sᴇʀ ᴀʙᴇʀᴛᴏ ᴇᴍ ɢʀᴜᴘᴏs.*')
if (!isGroupAdmins) return reply('*❌ | ᴇsᴛᴇ ᴍᴇɴᴜ ᴇ ᴇxᴄʟᴜsɪᴠᴏ ᴘᴀʀᴀ ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀᴇs.*')

await yoshMenu(
linguagem.menuadm(NomeDoBot, sender, isCargo, isChVip, horaBR, prefix, ownerName, baileysVersion)
)
}
break

case 'menudono': {
if (!SoDono) return reply(mess.onlyOwner())

await yoshMenu(
linguagem.menudono(NomeDoBot, sender, isCargo, isChVip, horaBR, prefix, ownerName, baileysVersion)
)
}
break

case 'menuzz': {
try {
await yoshMenu(linguagem.menu(NomeDoBot, sender, isCargo, isChVip, horaBR, prefix, ownerName, baileysVersion))
} catch(e) {
console.log('Erro no menu principal:', e)
await reply(mess.error())
}
}
break

case 'play':
case 'ytplay': {
try {
if (!q || !q.trim()) return reply(`*❌ | ᴘᴏʀ ғᴀᴠᴏʀ, ɪɴsɪʀᴀ ᴏ ɴᴏᴍᴇ ᴅᴀ ᴍᴜsɪᴄᴀ.*

*📌 | ᴇxᴇᴍᴘʟᴏ:*
> ${prefix + command} ᴠᴇᴍ ᴄᴀ`)

await reagir(from, '🎧')

const contextInfo = { ...newsletter, mentionedJid: [sender] }
const pesquisa = q.trim()
const apiPlay = `${API_URL}/api/youtube-play?query=${encodeURIComponent(pesquisa)}&q=${encodeURIComponent(pesquisa)}&apikey=${encodeURIComponent(API_KEY_TOKITO)}`

const { data } = await axios.get(apiPlay, {
timeout: 60000,
headers: { 'User-Agent': 'Mozilla/5.0', accept: 'application/json' }
})

if (!data?.status || !data?.resultado) {
await reagir(from, '❌')
return reply('*❌ | ɴᴀᴏ ᴇɴᴄᴏɴᴛʀᴇɪ ɴᴇɴʜᴜᴍ ᴀᴜᴅɪᴏ.*')
}

const res = data.resultado
const title = String(res?.title || res?.titulo || 'ɴᴀᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ')
const canal = String(res?.canal || res?.channel || res?.author || 'ɴᴀᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ')
const duration = String(res?.duration || res?.duracao || '0:00')
const views = String(res?.views_formatado || res?.views || 'ɴᴀᴏ ɪɴғᴏʀᴍᴀᴅᴏ')
const thumbnail = res?.image || res?.thumbnail || res?.thumb || null
const url = String(res?.url || res?.link || pesquisa)
const download = typeof res?.download === 'string' ? res.download : res?.download?.url || res?.download?.link || res?.audio || res?.audio_url || res?.download_url || null
const nomeArquivo = String(res?.filename || `${title}.mp3`).replace(/[\\/:*?"<>|]/g, '').slice(0, 100)

if (!download) {
await reagir(from, '❌')
return reply('*❌ | ᴀ ᴀᴘɪ ɴᴀᴏ ʀᴇᴛᴏʀɴᴏᴜ ᴏ ʟɪɴᴋ ᴅᴏ ᴀᴜᴅɪᴏ.*')
}

const texto = `*🎧 | ᴘʟᴀʏ ᴀᴜᴅɪᴏ*

- *🤖 | ʙᴏᴛ → ${NomeDoBot}*
- *👤 | ᴜsᴜᴀʀɪᴏ → ${pushname}*
- *🎶 | ᴛɪᴛᴜʟᴏ → ${title}*
- *📺 | ᴄᴀɴᴀʟ → ${canal}*
- *⏱️ | ᴅᴜʀᴀᴄᴀᴏ → ${duration}*
- *👁️ | ᴠɪsᴜᴀʟɪᴢᴀᴄᴏᴇs → ${views}*
- *🔗 | ʟɪɴᴋ → ${url}*

> *⏳ ᴇɴᴠɪᴀɴᴅᴏ ᴀᴜᴅɪᴏ...*`

if (thumbnail) {
await tokito.sendMessage(from, {
image: { url: thumbnail },
caption: texto,
contextInfo
}, {
quoted: selo
})
} else {
await tokito.sendMessage(from, {
text: texto,
contextInfo
}, {
quoted: selo
})
}

await tokito.sendMessage(from, {
audio: { url: download },
mimetype: 'audio/mpeg',
ptt: false,
fileName: nomeArquivo,
contextInfo
}, {
quoted: selo
})

await reagir(from, '✅')

} catch(e) {
console.log('[PLAY ERRO]', e?.response?.data || e)
await reagir(from, '❌').catch(() => {})

await reply(`*❌ | ᴇʀʀᴏ ᴀᴏ ʙᴜsᴄᴀʀ ᴏ ᴀᴜᴅɪᴏ.*

> ${e?.response?.data?.mensagem || e?.response?.data?.resultado || e?.message || 'Erro desconhecido'}`)
}
}
break

case 'play2': {
try {
if (!q || !q.trim()) return reply(`*❌ | ᴘᴏʀ ғᴀᴠᴏʀ, ɪɴsɪʀᴀ ᴏ ɴᴏᴍᴇ ᴅᴀ ᴍᴜsɪᴄᴀ.*

*📌 | ᴇxᴇᴍᴘʟᴏ:*
> ${prefix + command} ᴠᴇᴍ ᴄᴀ`)

await reagir(from, '🎧')
await reply(mess.wait())

const pesquisa = q.trim()
const contextInfo = { ...newsletter, mentionedJid: [sender] }
const apiPlay = `${API_URL}/api/youtube-play?query=${encodeURIComponent(pesquisa)}&q=${encodeURIComponent(pesquisa)}&apikey=${encodeURIComponent(API_KEY_TOKITO)}`

const { data } = await axios.get(apiPlay, {
timeout: 60000,
headers: { 'User-Agent': 'Mozilla/5.0', accept: 'application/json' }
})

if (!data?.status || !data?.resultado) {
await reagir(from, '❌')
return reply('*❌ | ɴᴀᴏ ᴇɴᴄᴏɴᴛʀᴇɪ ɴᴇɴʜᴜᴍ ʀᴇsᴜʟᴛᴀᴅᴏ.*')
}

const res = data.resultado
const title = String(res?.title || res?.titulo || 'ɴᴀᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ')
const canal = String(res?.canal || res?.channel || res?.author || 'ɴᴀᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ')
const duration = String(res?.duration || res?.duracao || '0:00')
const views = String(res?.views_formatado || res?.views || 'ɴᴀᴏ ɪɴғᴏʀᴍᴀᴅᴏ')
const thumbnail = res?.image || res?.thumbnail || res?.thumb || null
const url = String(res?.url || res?.link || pesquisa)

const texto = `*🎧 | ᴘʟᴀʏ ᴍᴜsɪᴄᴀ*

- *🤖 | ʙᴏᴛ → ${NomeDoBot}*
- *👤 | ᴜsᴜᴀʀɪᴏ → ${pushname}*
- *🎶 | ᴛɪᴛᴜʟᴏ → ${title}*
- *📺 | ᴄᴀɴᴀʟ → ${canal}*
- *⏱️ | ᴅᴜʀᴀᴄᴀᴏ → ${duration}*
- *👁️ | ᴠɪsᴜᴀʟɪᴢᴀᴄᴏᴇs → ${views}*
- *🔗 | ʟɪɴᴋ → ${url}*

> *📌 ᴇsᴄᴏʟʜᴀ ᴏ ғᴏʀᴍᴀᴛᴏ ᴀʙᴀɪxᴏ.*`

let header = proto.Message.InteractiveMessage.Header.create({
hasMediaAttachment: false
})

if (thumbnail) {
const media = await prepareWAMessageMedia({
image: { url: thumbnail }
}, {
upload: tokito.waUploadToServer
})

header = proto.Message.InteractiveMessage.Header.create({
hasMediaAttachment: true,
imageMessage: media.imageMessage
})
}

const interactiveMessage = proto.Message.InteractiveMessage.create({
header,
body: proto.Message.InteractiveMessage.Body.create({ text: texto }),
footer: proto.Message.InteractiveMessage.Footer.create({ text: NomeDoBot }),
nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
buttons: [
{
name: 'quick_reply',
buttonParamsJson: JSON.stringify({
display_text: '🎧 BAIXAR ÁUDIO',
id: `${prefix}play_audio ${url}`
})
},
{
name: 'quick_reply',
buttonParamsJson: JSON.stringify({
display_text: '🎥 BAIXAR VÍDEO',
id: `${prefix}play_video ${url}`
})
}
]
}),
contextInfo
})

const mensagemPlay = generateWAMessageFromContent(from, {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 2
},
interactiveMessage
}
}
}, {
quoted: selo,
userJid: tokito.user.id
})

await tokito.relayMessage(from, mensagemPlay.message, {
messageId: mensagemPlay.key.id
})

await reagir(from, '✅')

} catch(e) {
console.log('[PLAY2 ERRO]', e?.response?.data || e)
await reagir(from, '❌').catch(() => {})

await reply(`*❌ | ᴇʀʀᴏ ᴀᴏ ʙᴜsᴄᴀʀ ᴀ ᴍᴜsɪᴄᴀ.*

> ${e?.response?.data?.mensagem || e?.response?.data?.resultado || e?.message || 'Erro desconhecido'}`)
}
}
break

case 'play_audio': {
try {
if (!q || !q.trim()) return reply(`*❌ | ɪɴsɪʀᴀ ᴏ ɴᴏᴍᴇ ᴏᴜ ʟɪɴᴋ ᴅᴀ ᴍᴜsɪᴄᴀ.*

*📌 | ᴇxᴇᴍᴘʟᴏ:*
> ${prefix + command} ᴠᴇᴍ ᴄᴀ`)

await reagir(from, '🎧')
await reply(mess.wait())

const pesquisa = q.trim()
const contextInfo = { ...newsletter, mentionedJid: [sender] }
const apiUrl = `${API_URL}/api/youtube-audio?q=${encodeURIComponent(pesquisa)}&apikey=${encodeURIComponent(API_KEY_TOKITO)}`

await tokito.sendMessage(from, {
audio: { url: apiUrl },
mimetype: 'audio/mpeg',
fileName: 'audio.mp3',
ptt: false,
contextInfo
}, {
quoted: selo
})

await reagir(from, '✅')

} catch(e) {
console.log('[PLAY AUDIO ERRO]', e?.response?.data || e)
await reagir(from, '❌').catch(() => {})

await reply(`*❌ | ᴇʀʀᴏ ᴀᴏ ʙᴀɪxᴀʀ ᴏ ᴀᴜᴅɪᴏ.*

> ${e?.response?.data?.mensagem || e?.response?.data?.resultado || e?.message || 'Erro desconhecido'}`)
}
}
break

case 'play_video': {
try {
if (!q || !q.trim()) return reply(`*❌ | ɪɴsɪʀᴀ ᴏ ɴᴏᴍᴇ ᴏᴜ ʟɪɴᴋ ᴅᴏ ᴠɪᴅᴇᴏ.*

*📌 | ᴇxᴇᴍᴘʟᴏ:*
> ${prefix + command} ᴠᴇᴍ ᴄᴀ`)

await reagir(from, '🎥')
await reply(mess.wait())

const pesquisa = q.trim()
const contextInfo = { ...newsletter, mentionedJid: [sender] }
const apiUrl = `${API_URL}/api/youtube-video?q=${encodeURIComponent(pesquisa)}&apikey=${encodeURIComponent(API_KEY_TOKITO)}`

await tokito.sendMessage(from, {
video: { url: apiUrl },
mimetype: 'video/mp4',
fileName: 'video.mp4',
caption: `*🎥 | ᴘʟᴀʏ ᴠɪᴅᴇᴏ*

- *👤 | ᴜsᴜᴀʀɪᴏ → ${pushname}*
- *🤖 | ʙᴏᴛ → ${NomeDoBot}*`,
contextInfo
}, {
quoted: selo
})

await reagir(from, '✅')

} catch(e) {
console.log('[PLAY VIDEO ERRO]', e?.response?.data || e)
await reagir(from, '❌').catch(() => {})

await reply(`*❌ | ᴇʀʀᴏ ᴀᴏ ʙᴀɪxᴀʀ ᴏ ᴠɪᴅᴇᴏ.*

> ${e?.response?.data?.mensagem || e?.response?.data?.resultado || e?.message || 'Erro desconhecido'}`)
}
}
break

case 'ping': {
const inicio = performance.now()

try {
await tokito.sendPresenceUpdate('available', from)
} catch {}

const latencia = (performance.now() - inicio).toFixed(2)
const uptime = process.uptime()
const dias = Math.floor(uptime / 86400)
const horas = Math.floor((uptime % 86400) / 3600)
const minutos = Math.floor((uptime % 3600) / 60)
const segundos = Math.floor(uptime % 60)
const memoria = process.memoryUsage()
const heapUsado = (memoria.heapUsed / 1024 / 1024).toFixed(2)
const ramTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2)
const ramLivre = (os.freemem() / 1024 / 1024 / 1024).toFixed(2)

await reply(`- *🏃‍♂️ | 𝐏𝐈𝐍𝐆 𝐃𝐎 𝐁𝐎𝐓*
- *⚡ | 𝙻𝙰𝚃Ê𝙽𝙲𝙸𝙰 → ${latencia} ms*
- *🕒 | 𝙾𝙽𝙻𝙸𝙽𝙴 → ${dias}d ${horas}h ${minutos}m ${segundos}s*
- *🧠 | 𝙷𝙴𝙰𝙿 → ${heapUsado} MB*
- *💻 | 𝚁𝙰𝙼 𝙻𝙸𝚅𝚁𝙴 → ${ramLivre} GB / ${ramTotal} GB*
- *📦 | 𝙽𝙾𝙳𝙴 → ${process.version}*
- *⚙️ | 𝙱𝙰𝙸𝙻𝙴𝚈𝚂 → ${baileysVersion}*`)
}
break



case 'criador': {
const numeroCriador = String(ownerNumber || '').replace(/\D/g, '')
await reply(`*👑 | ᴄʀɪᴀᴅᴏʀ ᴅᴏ ʙᴏᴛ*

*👤 | ɴᴏᴍᴇ:* ${ownerName}
*📱 | ɴᴜᴍᴇʀᴏ:* +${numeroCriador}
*🔗 | ᴄᴏɴᴛᴀᴛᴏ:* https://wa.me/${numeroCriador}`)
}
break

case 'addvip': {
if (!SoDono) return reply(mess.onlyOwner())

const barra = String(q || '').replace(/\s*\/\s*/g, '/')
let partesVip = barra.split('/')
let tempo50 = partesVip.length > 1 ? partesVip.pop() : ''
let nmr = partesVip.join('/')

if (!tempo50 && menc_os2 && /^\d+$/.test(barra)) {
tempo50 = barra
nmr = ''
}

const diasVip = Number(tempo50)
if (!menc_os2 && !nmr) return reply(`*❌ | ᴠᴏᴄᴇ ᴇsǫᴜᴇᴄᴇᴜ ᴅᴇ ᴍᴀʀᴄᴀʀ ᴏ ᴜsᴜᴀʀɪᴏ.*\n\n*📌 | ᴇxᴇᴍᴘʟᴏ:*\n> ${prefix + command} @usuario/30`)
if (!Number.isInteger(diasVip) || diasVip < 0) return reply(`*❌ | ɪɴғᴏʀᴍᴇ ᴀ ǫᴜᴀɴᴛɪᴅᴀᴅᴇ ᴅᴇ ᴅɪᴀs.*\n\n*📌 | ᴠɪᴘ ᴛᴇᴍᴘᴏʀᴀʀɪᴏ:*\n> ${prefix + command} @usuario/30\n\n*📌 | ᴠɪᴘ ɪɴғɪɴɪᴛᴏ:*\n> ${prefix + command} @usuario/0`)

let usur = menc_os2 || nmr
if (Array.isArray(usur)) usur = usur[0]
usur = normalizar(usur)
if (!String(usur).includes('@')) usur = `${String(usur).replace(/\D/g, '')}@s.whatsapp.net`

if (!usur || usur === '@s.whatsapp.net') return reply('*❌ | ɴᴀᴏ ғᴏɪ ᴘᴏssɪᴠᴇʟ ɪᴅᴇɴᴛɪғɪᴄᴀʀ ᴏ ᴜsᴜᴀʀɪᴏ.*')

const indiceVip = vip.map(i => i.id).indexOf(usur)
const infinito = diasVip === 0
const agora = Date.now()

if (indiceVip >= 0) {
if (vip[indiceVip].infinito === true && !infinito) return reply('*❌ | ᴇssᴇ ᴜsᴜᴀʀɪᴏ ᴊᴀ ᴘᴏssᴜɪ ᴠɪᴘ ɪɴғɪɴɪᴛᴏ.*')

if (infinito) {
vip[indiceVip].infinito = true
vip[indiceVip].dias = 0
vip[indiceVip].expiraEm = null
} else {
const expiracaoAtual = new Date(vip[indiceVip].expiraEm || 0).getTime()
const inicio = expiracaoAtual > agora ? expiracaoAtual : agora
vip[indiceVip].infinito = false
vip[indiceVip].expiraEm = new Date(inicio + diasVip * 86400000).toISOString()
vip[indiceVip].dias = Math.ceil((new Date(vip[indiceVip].expiraEm).getTime() - agora) / 86400000)
}

vip[indiceVip].save = Number(new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit' }))
} else {
vip.push({
id: usur,
dias: diasVip,
save: Number(new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit' })),
infinito,
expiraEm: infinito ? null : new Date(agora + diasVip * 86400000).toISOString()
})
}

fs.writeFileSync(caminhoVip, JSON.stringify(vip, null, 2))

await tokito.sendMessage(from, {
text: infinito
? `*✅ | @${usur.split('@')[0]} ғᴏɪ ᴀᴅɪᴄɪᴏɴᴀᴅᴏ ᴀᴏ ᴠɪᴘ ɪɴғɪɴɪᴛᴏ!*`
: `*✅ | ${diasVip} ᴅɪᴀ${diasVip !== 1 ? 's' : ''} ᴅᴇ ᴠɪᴘ ғᴏ${diasVip !== 1 ? 'ʀᴀᴍ' : 'ɪ'} ᴀᴅɪᴄɪᴏɴᴀᴅᴏ${diasVip !== 1 ? 's' : ''} ᴀ @${usur.split('@')[0]}!*`,
contextInfo: { ...newsletter, mentionedJid: [usur] }
}, { quoted: selo })
}
break

case 'delvip': {
if (!SoDono) return reply(mess.onlyOwner())

let alvo = menc_os2 || String(q || '').replace(/\D/g, '')
if (Array.isArray(alvo)) alvo = alvo[0]
alvo = normalizar(alvo)
if (!String(alvo).includes('@')) alvo = `${String(alvo).replace(/\D/g, '')}@s.whatsapp.net`

if (!alvo || alvo === '@s.whatsapp.net') return reply(`*❌ | ᴍᴀʀǫᴜᴇ ᴏ ᴜsᴜᴀʀɪᴏ ᴏᴜ ᴅɪɢɪᴛᴇ ᴏ ɴᴜᴍᴇʀᴏ.*\n\n> ${prefix + command} @usuario`)

const indiceVip = vip.map(i => i.id).indexOf(alvo)
if (indiceVip < 0) return reply('*❌ | ᴇssᴇ ᴜsᴜᴀʀɪᴏ ɴᴀᴏ ᴇsᴛᴀ ɴᴀ ʟɪsᴛᴀ ᴠɪᴘ.*')

vip.splice(indiceVip, 1)
fs.writeFileSync(caminhoVip, JSON.stringify(vip, null, 2))

await tokito.sendMessage(from, {
text: `*✅ | @${alvo.split('@')[0]} ғᴏɪ ʀᴇᴍᴏᴠɪᴅᴏ ᴅᴀ ʟɪsᴛᴀ ᴠɪᴘ ᴄᴏᴍ sᴜᴄᴇssᴏ!*`,
contextInfo: { ...newsletter, mentionedJid: [alvo] }
}, { quoted: selo })
}
break

case 'viplist':
case 'listavip': {
if (!vip.length) return reply('*📋 | ᴇxɪsᴛᴇᴍ 0 ᴜsᴜᴀʀɪᴏs ᴠɪᴘ.*')

const mentionsVip = vip.map(v => v.id)
const listaVip = vip.map((v, index) => {
let expiracao = '*ᴠɪᴘ ɪɴғɪɴɪᴛᴏ*'

if (v.infinito !== true) {
const diasRestantes = v.expiraEm
? Math.max(0, Math.ceil((new Date(v.expiraEm).getTime() - Date.now()) / 86400000))
: Number(v.dias || 0)
const dataExpira = v.expiraEm
? new Date(v.expiraEm).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
: 'ɴᴀᴏ ɪɴғᴏʀᴍᴀᴅᴀ'
expiracao = `*${diasRestantes} ᴅɪᴀ${diasRestantes !== 1 ? 's' : ''}*\n• ᴅᴀᴛᴀ: ${dataExpira}`
}

return `*[${index + 1}]* - @${v.id.split('@')[0]}\n• ᴇxᴘɪʀᴀᴄᴀᴏ: ${expiracao}`
}).join('\n––\n')

await tokito.sendMessage(from, {
text: `*[ᴛᴏᴛᴀʟ: ${vip.length}]* - ʟɪsᴛᴀ ᴅᴇ ᴜsᴜᴀʀɪᴏs ᴠɪᴘ:\n–\n${listaVip}`,
contextInfo: { ...newsletter, mentionedJid: mentionsVip }
}, { quoted: selo })
}
break

case 'limparvip':
case 'clearvip':
case 'resetvip': {
if (!SoDono) return reply(mess.onlyOwner())
if (!vip.length) return reply('*❌ | ᴀ ʟɪsᴛᴀ ᴠɪᴘ ᴊᴀ ᴇsᴛᴀ ᴠᴀᴢɪᴀ.*')

const totalVip = vip.length
vip.splice(0, vip.length)
fs.writeFileSync(caminhoVip, JSON.stringify(vip, null, 2))

await tokito.sendMessage(from, {
text: `*✅ | @${sender.split('@')[0]} ʟɪᴍᴘᴏᴜ ᴛᴏᴅᴀ ᴀ ʟɪsᴛᴀ ᴠɪᴘ!*\n\n*📊 | ᴛᴏᴛᴀʟ ʀᴇᴍᴏᴠɪᴅᴏ: ${totalVip} ᴜsᴜᴀʀɪᴏ${totalVip !== 1 ? 's' : ''}.*`,
contextInfo: { ...newsletter, mentionedJid: [sender] }
}, { quoted: selo })
}
break

case 'fechargp': {
try {
if (!isGroup) return reply(mess.grupo())
if (!isGroupAdmins) return reply(mess.adm())
if (!isBotGroupAdmins) return reply(mess.botadm())

const hora = String(q || '').trim(), regra = /^([01]\d|2[0-3]):[0-5]\d$/
if (!regra.test(hora)) return reply(mess.fechar(prefix))

const grupos = ler(), atual = grupos[from] || {}, ctx = mensagem?.extendedTextMessage?.contextInfo || mensagem?.imageMessage?.contextInfo || mensagem?.videoMessage?.contextInfo || {}, marcada = extrair(ctx?.quotedMessage)
const imagem = marcada?.imageMessage, video = marcada?.videoMessage
let midia = atual.fecharmidia || null

await reagir(from, '⏳')

if (video) {
const buffer = await getFileBuffer(video, 'video'), nome = `${from.split('@')[0]}-f-${Date.now()}-${getRandom('.mp4')}`, destino = path.join(pasta, nome)
fs.writeFileSync(destino, buffer)
apagar(midia)
midia = { tipo: 'video', arquivo: nome }
} else if (imagem) {
const buffer = await getFileBuffer(imagem, 'image'), nome = `${from.split('@')[0]}-f-${Date.now()}-${getRandom('.jpg')}`, destino = path.join(pasta, nome)
fs.writeFileSync(destino, buffer)
apagar(midia)
midia = { tipo: 'image', arquivo: nome }
}

grupos[from] = { ...atual, ativo: true, fechar: hora, fecharmidia: midia, ultimoFechamento: null }
salvar(grupos)
await reagir(from, '✅')
return reply(mess.fechar(prefix, hora))
} catch(error) {
console.log('❌ Erro no fechargp:', error)
await reagir(from, '❌').catch(() => {})
return reply(mess.error())
}
}
break

case 'abrirgp': {
try {
if (!isGroup) return reply(mess.grupo())
if (!isGroupAdmins) return reply(mess.adm())
if (!isBotGroupAdmins) return reply(mess.botadm())

const hora = String(q || '').trim(), regra = /^([01]\d|2[0-3]):[0-5]\d$/
if (!regra.test(hora)) return reply(mess.abrir(prefix))

const grupos = ler(), atual = grupos[from] || {}, ctx = mensagem?.extendedTextMessage?.contextInfo || mensagem?.imageMessage?.contextInfo || mensagem?.videoMessage?.contextInfo || {}, marcada = extrair(ctx?.quotedMessage)
const imagem = marcada?.imageMessage, video = marcada?.videoMessage
let midia = atual.abrirmidia || atual.midia || null

await reagir(from, '⏳')

if (video) {
const buffer = await getFileBuffer(video, 'video'), nome = `${from.split('@')[0]}-a-${Date.now()}-${getRandom('.mp4')}`, destino = path.join(pasta, nome)
fs.writeFileSync(destino, buffer)
apagar(midia)
midia = { tipo: 'video', arquivo: nome }
} else if (imagem) {
const buffer = await getFileBuffer(imagem, 'image'), nome = `${from.split('@')[0]}-a-${Date.now()}-${getRandom('.jpg')}`, destino = path.join(pasta, nome)
fs.writeFileSync(destino, buffer)
apagar(midia)
midia = { tipo: 'image', arquivo: nome }
}

const novo = { ...atual, ativo: true, abrir: hora, abrirmidia: midia, ultimaAbertura: null }
delete novo.midia
grupos[from] = novo
salvar(grupos)
await reagir(from, '✅')
return reply(mess.abrir(prefix, hora))
} catch(error) {
console.log('❌ Erro no abrirgp:', error)
await reagir(from, '❌').catch(() => {})
return reply(mess.error())
}
}
break
case 'delhorario': {
try {
if (!isGroup) return reply(mess.sogrupo())
if (!isGroupAdmins) return reply(mess.soadm())

const grupos = ler()
const dados = grupos[from]

if (!dados) return reply(mess.semhorario())

const midias = [
dados.midiaFechar,
dados.midiaAbrir,
dados.fechar?.midia,
dados.abrir?.midia,
dados.midia
].filter(Boolean)

const arquivos = new Set()

for (const midia of midias) {
if (!midia?.arquivo || arquivos.has(midia.arquivo)) continue
arquivos.add(midia.arquivo)
apagar(midia)
}

delete grupos[from]
salvar(grupos)

await reagir(from, '✅')
return reply(mess.apagado())

} catch(e) {
console.log('Erro no delhorario:', e)
await reagir(from, '❌').catch(() => {})
return reply(mess.falha())
}
}
break
case 'totalcmd':
case 'totalcomandos': {
try {
const codigo = fs.readFileSync(__filename, 'utf8')
const casos = [...codigo.matchAll(/case\s+['"`]([^'"`]+)['"`]\s*:/g)].map(item => item[1])
const comandos = [...new Set(casos)].filter(Boolean)

await reply(`*🧊 | ᴛᴏᴛᴀʟ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs*

*📦 | ᴇsᴛᴀ ʙᴀsᴇ ᴘᴏssᴜɪ:* ${comandos.length} ᴄᴏᴍᴀɴᴅᴏs
*🤖 | ʙᴏᴛ:* ${NomeDoBot}
*🧩 | ᴘʀᴇғɪxᴏ:* ${prefix}`)
} catch(e) {
console.log('Erro no totalcmd:', e)
await reply(mess.error())
}
}
break
case 'reiniciar':
case 'r': {
if (!SoDono) return reply(Res_SoDono)

await reply('*ᴏᴋᴀʏ ᴍᴇsᴛʀᴇ, ɪʀᴇɪ ʀᴇɪɴɪᴄɪᴀʀ, ᴀɢᴜᴀʀᴅᴇ ᴜᴍ ᴍᴏᴍᴇɴᴛᴏ... 🙇‍♂️*')

setTimeout(() => {
process.exit(0)
}, 1200)
}
break

case 'info':
case 'player':
case 'perfil': {
try {
if (!q) return reply(`Use: ${prefix}info <UID> [regiao]\n\nEx: ${prefix}info 123456789 BR`)

const partes = q.trim().split(/\s+/)
const uid = String(partes[0] || '').replace(/\D/g, '')
const region = String(partes[1] || 'BR').toUpperCase()
if (!uid || uid.length < 6) return reply('❌ UID inválido! Use apenas números.')

await reagir(from, '🔎')

const API_KEY = 'permanente_fc5f4b82a52b482d2cdd'
const BASE_URL = 'https://fluxggx.squareweb.app'

const { data } = await axios.get(`${BASE_URL}/info-player?key=${API_KEY}&uid=${uid}&region=${region}`, { validateStatus: () => true })

if (!data || !data.success) {
await reagir(from, '❌')
return reply(`❌ *${data?.message || 'Jogador não encontrado'}*\n> Código: ${data?.error || 'ERRO'}`)
}

const b = data.data.basicInfo || {}
const s = data.data.socialInfo || {}
const dia = data.data.diamondCostRes || {}
const cs = data.data.creditScoreInfo || {}
const fmt = n => (n == null ? '—' : Number(n).toLocaleString('pt-BR'))
const dataBR = ts => { const n = Number(ts); return n ? new Date(n * 1000).toLocaleDateString('pt-BR') : '—' }

const info = `╭─────「 👤 *PERFIL FREE FIRE* 」
│
│  🏷️  *${b.nickname || 'Jogador'}*
│  🆔  ${b.accountId || uid}
│
├─「 📊 *Conta* 」
│  ⭐  Nível: *${b.level ?? '—'}*  ·  EXP: ${fmt(b.exp)}
│  🌍  Região: *${b.region || region}*
│  🎮  Versão: ${b.releaseVersion || '—'}
│  📅  Criada: ${dataBR(b.createAt)}
│
├─「 🏆 *Ranking* 」
│  🥇  BR: ${fmt(b.rank)}  ·  ${fmt(b.rankingPoints)} pts
│  🎯  CS: ${fmt(b.csRank)}  (máx ${fmt(b.csMaxRank ?? b.maxRank)})
│  🗓️  Temporada: ${b.seasonId ?? '—'}
│
├─「 💎 *Extras* 」
│  💎  Diamantes gastos: ${fmt(dia.diamondCost)}
│  🔰  Credit Score: ${cs.creditScore ?? '—'}
│  ✍️  ${s.signature || 'Sem assinatura'}
│
╰─────「 ${NomeDoBot} 」`

await reagir(from, '✅')
return reply(info)
} catch (error) {
console.error('Erro ao consultar info:', error.message)
await reagir(from, '❌').catch(() => {})
return reply(`❌ Erro ao consultar jogador: ${error.message}`)
}
}
break

case 'skin':
case 'personagem':
case 'character': {
try {
if (!q) return reply(`Use: ${prefix}skin <UID>`)

const uid = q.replace(/\D/g, '')
if (!uid || uid.length < 6) return reply('❌ UID inválido! Use apenas números.')

await reply('⏳ Gerando imagem do personagem...')

const API_KEY = 'permanente_fc5f4b82a52b482d2cdd'
const BASE_URL = 'https://fluxggx.squareweb.app'

const response = await axios.get(`${BASE_URL}/get-skin?key=${API_KEY}&id=${uid}`)

if (!response.data.success) {
return reply(`❌ ${response.data.message || 'Jogador não encontrado'}`)
}

const { conta, imagem } = response.data.data

const imageResponse = await axios.get(imagem.url, { responseType: 'arraybuffer' })
const imageBuffer = Buffer.from(imageResponse.data, 'binary')

const caption = `
👤 *${conta.nome}*
📊 Nível: ${conta.nivel}
❤️ Likes: ${conta.curtidas.toLocaleString('pt-BR')}

_Imagem do personagem com skins_
`

await tokito.sendMessage(from, {
image: imageBuffer,
caption: caption
}, { quoted: selo })

} catch (error) {
console.error('Erro ao gerar skin:', error.message)
return reply(`❌ Erro ao gerar imagem: ${error.message}`)
}
}
break

case 'like':
case 'curtida':
case 'enviarlike': {
try {
if (!q) return reply(`Use: ${prefix}like <UID> [regiao]\n\nEx: ${prefix}like 123456789 BR`)

const partes = q.trim().split(/\s+/)
const uid = String(partes[0] || '').replace(/\D/g, '')
const region = String(partes[1] || 'BR').toUpperCase()
if (!uid || uid.length < 6) return reply('❁ ┊ UID inválido, amora! Use apenas números. 🎀')

const limiteInfo = checarLimiteLike(sender, isVip)
if (!limiteInfo.permitido) {
return reply(`╭┈┈┈❁˚ 🎀 ˚❁┈┈┈╮
   *ʟɪᴍɪᴛᴇ ᴅɪᴀ́ʀɪᴏ ᴀᴛɪɴɢɪᴅᴏ*
╰┈┈┈❁˚ 🎀 ˚❁┈┈┈╯

✿ Poxa, ${isVip ? 'você já usou seus' : 'você já usou seu'} *${limiteInfo.limite}* ${limiteInfo.limite > 1 ? 'likes de hoje' : 'like de hoje'} 🥺💗

${isVip ? '💎 Você já é *VIP*, volte amanhã pra mandar mais likes!' : `🔓 Quer mandar até *${LIMITE_LIKE_VIP}x* por dia? Vire *VIP* e libere mais likes, flor! 🌸`}

╰────── ${NomeDoBot} ──────╯`)
}

await reagir(from, '❤️')

const API_KEY = 'permanente_fc5f4b82a52b482d2cdd'
const BASE_URL = 'https://fluxggx.squareweb.app'

const { data } = await axios.get(`${BASE_URL}/send-like?key=${API_KEY}&uid=${uid}&region=${region}&token=100`, { validateStatus: () => true })

if (!data || !data.sucesso) {
await reagir(from, '⏳')
if (data && data.em_recarga) {
return reply(`╭─────「 ⏳ *EM RECARGA* 」
│
│  🆔  ${uid}
│  ⏰  Falta: *${data.restante || '—'}*
│  📅  Volta: ${data.proxima_vez_br || '—'}
│
╰─「 _Esse ID já recebeu likes hoje._ 」`)
}
return reply(`❌ *${data?.mensagem || data?.message || 'Não foi possível enviar os likes.'}*`)
}

registrarUsoLike(sender)
const limiteApos = checarLimiteLike(sender, isVip)

const c = (data.data && data.data.conta) || {}
const L = (data.data && data.data.likes) || {}
const fmt = n => (n == null ? '—' : Number(String(n).replace(/\./g, '')).toLocaleString('pt-BR'))

// nível real (best-effort)
let linhaNivel = ''
try {
const inf = await axios.get(`${BASE_URL}/info-player?key=${API_KEY}&uid=${uid}&region=${region}`, { validateStatus: () => true })
const nivel = inf.data?.success ? (inf.data.data?.basicInfo?.level ?? null) : null
if (nivel != null) linhaNivel = `\n│  ⭐  Nível: ${nivel}`
} catch {}

const info = `╭┈┈┈❁˚ 💗 ˚❁┈┈┈╮
   *ʟɪᴋᴇs ᴇɴᴠɪᴀᴅᴏs* 🎀
╰┈┈┈❁˚ 💗 ˚❁┈┈┈╯

🏷️  *${c.nome_conta || data.nome || 'Jogador'}*
🆔  ${uid}${linhaNivel}
🌍  Região: ${c.region || region}

✿┈┈┈┈┈┈┈┈┈┈┈┈┈✿
📊  Antes: ${fmt(L.antes)}
➕  Enviados: *${fmt(L.enviadas)}*
🚀  Depois: ${fmt(L.depois)}
✿┈┈┈┈┈┈┈┈┈┈┈┈┈✿

🎟️  ${isVip ? '💎 Status: VIP' : '🌷 Status: Membro'}
📅  Usados hoje: *${limiteApos.usados}/${limiteApos.limite}*

╰─「 ✅ _Enviado com carinho · ${NomeDoBot}_ 」`

await reagir(from, '✅')
return reply(info)
} catch (error) {
console.error('Erro ao enviar likes:', error.message)
await reagir(from, '❌').catch(() => {})
return reply(`❌ Erro ao enviar likes: ${error.message}`)
}
}
break

case 'likestatus':
case 'status':
case 'recarga': {
try {
if (!q) return reply(`Use: ${prefix}likestatus <UID>`)

const uid = q.replace(/\D/g, '')
if (!uid || uid.length < 6) return reply('❌ UID inválido! Use apenas números.')

const API_KEY = 'permanente_fc5f4b82a52b482d2cdd'
const BASE_URL = 'https://fluxggx.squareweb.app'

const { data } = await axios.get(`${BASE_URL}/like-status?key=${API_KEY}&id=${uid}`, { validateStatus: () => true })

if (!data || !data.success) {
return reply(`❌ *Não consegui consultar o status.*`)
}

if (data.em_recarga) {
return reply(`╭─────「 ⏳ *AGUARDE A RECARGA* 」
│
│  🆔  ${data.id || uid}
│  ❌  Pode enviar: *Não*
│  ⏰  Falta: *${data.restante || '—'}*
│  📅  Volta: ${data.proxima_vez_br || '—'}
│
╰─「 ${NomeDoBot} 」`)
}

return reply(`╭─────「 ✅ *PRONTO PRA RECEBER* 」
│
│  🆔  ${data.id || uid}
│  ✅  Pode enviar: *Sim*
│  💎  Status: Ativo
│
╰─「 ${NomeDoBot} 」`)
} catch (error) {
console.error('Erro ao verificar status:', error.message)
return reply(`❌ Erro ao verificar status: ${error.message}`)
}
}
break

case 'st':
case 'stk':
case 'f':
case 'fig':
case 'figu':
case 'sticker':
case 'fsticker':
case 's': {
const contexto = info.message?.extendedTextMessage?.contextInfo || info.message?.imageMessage?.contextInfo || info.message?.videoMessage?.contextInfo || {}
const marcada = contexto.quotedMessage || mensagem || {}
const midia = marcada?.ephemeralMessage?.message || marcada?.viewOnceMessage?.message || marcada?.viewOnceMessageV2?.message || marcada?.viewOnceMessageV2Extension?.message || marcada
const imagem = midia?.imageMessage
const video = midia?.videoMessage

if (!imagem && !video) return reply(mess.marqueMidia ? mess.marqueMidia() : '*Marque uma imagem ou vídeo (máx. 10s) com o comando.*')
if (video && video.seconds > 10) return reply('*O vídeo precisa ter no máximo 10 segundos.*')

try {
await reagir(from, '⏳')
const { exec } = require('child_process')
const entrada = path.join(os.tmpdir(), `stk_${Date.now()}.${video ? 'mp4' : 'png'}`)
const saida = path.join(os.tmpdir(), `stk_${Date.now()}.webp`)
const buffer = await getFileBuffer(video || imagem, video ? 'video' : 'image')
fs.writeFileSync(entrada, buffer)

const cmd = video
? `ffmpeg -i "${entrada}" -vcodec libwebp -filter:v fps=fps=15 -lossless 0 -compression_level 6 -q:v 50 -loop 0 -preset default -an -vsync 0 -s 512:512 "${saida}"`
: `ffmpeg -i "${entrada}" -vcodec libwebp -filter:v scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:-1:-1:color=#00000000 -lossless 1 -q:v 100 "${saida}"`

exec(cmd, async (err) => {
try {
if (err || !fs.existsSync(saida)) { await reagir(from, '❌'); return reply(mess.error()) }
const webp = fs.readFileSync(saida)
await tokito.sendMessage(from, { sticker: webp, contextInfo: { ...newsletter } }, { quoted: selo })
await reagir(from, '✅')
} catch (e) {
console.log('Erro ao enviar sticker:', e)
await reply(mess.error())
} finally {
try { if (fs.existsSync(entrada)) fs.unlinkSync(entrada) } catch {}
try { if (fs.existsSync(saida)) fs.unlinkSync(saida) } catch {}
}
})
} catch (e) {
console.log('Erro no sticker:', e)
await reagir(from, '❌')
await reply(mess.error())
}
}
break

case 'guilda':
case 'buscarguilda':
case 'guildas': {
try {
if (!q) return reply(`Use: ${prefix}guilda <nome> [regiao]\n\nEx: ${prefix}guilda ROOT KILL BR`)

const regioes = ['BR','US','SAC','NA','IND','BD','ID','ME','VN','TH','CIS','PK','SG','EU','TW']
const partes = q.trim().split(/\s+/)
let region = 'BR'
if (partes.length > 1 && regioes.includes(partes[partes.length - 1].toUpperCase())) {
region = partes.pop().toUpperCase()
}
const nome = partes.join(' ').trim()
if (!nome) return reply('❌ Informe o nome da guilda.')

await reagir(from, '🔎')

const KEY_FFS = 'ggx_e8aad50f78d8b41eb5382eb8fc2883640f17537d7d868e7b'
const BASE_FFS = 'https://freefireservices.com'

const { data } = await axios.get(`${BASE_FFS}/api/v1/guildas/search?name=${encodeURIComponent(nome)}&region=${region}&key=${KEY_FFS}`, { validateStatus: () => true })

if (!data || !data.success || !Array.isArray(data.data) || data.data.length === 0) {
await reagir(from, '❌')
return reply(`❌ *${data?.message || 'Nenhuma guilda encontrada'}*\n> Código: ${data?.error || 'GUILD_NOT_FOUND'}`)
}

const fmt = n => (n == null ? '—' : Number(n).toLocaleString('pt-BR'))
const dataBR = ts => { const n = Number(ts); return n ? new Date(n * 1000).toLocaleDateString('pt-BR') : '—' }

let txt = `╭─────「 🏰 *BUSCA DE GUILDA* 」\n│  🔎 Resultados: *${data.total ?? data.data.length}*\n│  🌍 Região: *${region}*\n╰─────\n`

for (const g of data.data.slice(0, 5)) {
txt += `\n╭─「 ⚔️ *${g.guildName || 'Guilda'}* 」\n│  🆔  ${g.guildId || '—'}\n│  📜  ${g.guildSlogan || 'Sem slogan'}\n│  👑  Líder UID: ${g.leaderUid || '—'}\n│  ⭐  Nível: ${g.guildLevel ?? '—'}  ·  👥 ${g.totalMembers ?? '—'} membros\n│  🎯  Req: Nível ${fmt(g.minLevelRequired)} · BR ${fmt(g.minBrRankRequired)} · CS ${fmt(g.minCsRankRequired)}\n│  📊  Pontos: ${fmt(g.totalActivityPoints)} (semana ${fmt(g.weeklyActivityPoints)})\n│  📅  Criada: ${dataBR(g.creationTime)}\n╰─────\n`
}

txt += `\n> ${NomeDoBot}`

await reagir(from, '✅')
return reply(txt.trim())
} catch (error) {
console.error('Erro ao buscar guilda:', error.message)
await reagir(from, '❌').catch(() => {})
return reply(`❌ Erro ao buscar guilda: ${error.message}`)
}
}
break

case 'guildainfo':
case 'infoguilda':
case 'guildaid': {
try {
if (!q) return reply(`Use: ${prefix}guildainfo <ID> [regiao]\n\nEx: ${prefix}guildainfo 2006911795 BR`)

const partes = q.trim().split(/\s+/)
const uid = String(partes[0] || '').replace(/\D/g, '')
const region = String(partes[1] || 'BR').toUpperCase()
if (!uid || uid.length < 6) return reply('❌ ID da guilda inválido! Use apenas números.')

await reagir(from, '🔎')

const KEY_FFS = 'ggx_e8aad50f78d8b41eb5382eb8fc2883640f17537d7d868e7b'
const BASE_FFS = 'https://freefireservices.com'

const { data } = await axios.get(`${BASE_FFS}/api/v1/guildas/info?uid=${uid}&region=${region}&key=${KEY_FFS}`, { validateStatus: () => true })

if (!data || !data.success || !data.data) {
await reagir(from, '❌')
return reply(`❌ *${data?.message || 'Guilda não encontrada'}*\n> Código: ${data?.error || 'GUILD_NOT_FOUND'}`)
}

const g = data.data
const fmt = n => (n == null ? '—' : Number(n).toLocaleString('pt-BR'))

const info = `╭─────「 🏰 *INFO DA GUILDA* 」
│
│  ⚔️  *${g.guildName || 'Guilda'}*
│  🆔  ${g.guildId || uid}
│  🌍  Região: *${g.region || region}*
│  💬  ${g.welcomeMessage || 'Sem mensagem'}
│
├─「 📊 *Status* 」
│  💰  Saldo: ${fmt(g.balance)}
│  🏅  Score: ${fmt(g.score)}
│  ✨  XP: ${fmt(g.xp)}
│  ⬆️  Upgrades: ${fmt(g.upgrades)}
│  🏆  Conquistas: ${fmt(g.achievements)}
│  ⏱️  Tempo de jogo: ${fmt(g.playTime)}
│
├─「 👥 *Membros* 」
│  👤  ${fmt(g.totalMembers)} / ${fmt(g.maxMembers)}
│  📅  Criada: ${g.created_at || '—'}
│
╰─────「 ${NomeDoBot} 」`

await reagir(from, '✅')
return reply(info)
} catch (error) {
console.error('Erro ao consultar guilda:', error.message)
await reagir(from, '❌').catch(() => {})
return reply(`❌ Erro ao consultar guilda: ${error.message}`)
}
}
break

default: {
await reply(mess.commandNotFound(prefix))
}
break
}

}

} catch(erro) {
console.log(colors.red('❌ erro ao reiniciar :('), erro)
}
}

module.exports = starttokito
