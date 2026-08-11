const fs = require('fs');
const path = require('path');

const caminhoRespostas = path.join(__dirname, 'respostas.json');
let dadosAI = { respostas: [], padrao: "Desculpe, não entendi. Digite /ajuda para ver os comandos." };
try { if (fs.existsSync(caminhoRespostas)) dadosAI = JSON.parse(fs.readFileSync(caminhoRespostas, 'utf8')); } catch {}

// ═══════════════════════════════════════════════
// 📋 CATEGORIAS DE COMANDOS POR PERMISSÃO
// ═══════════════════════════════════════════════
const CMD_DONO = [
  'antipv', 'liberargp', 'bloqueargp', 'bon', 'botoff',
  'addvip', 'delvip', 'limparvip', 'fechargp', 'abrirgp', 'delhorario',
  'reiniciar', 'r', 'nome-bot', 'nome-dono', 'donobot', 'channel',
  'prefixo', 'fotomenu', 'verificado', 'selo', 'dono1', 'dono2', 'dono3',
  'dono4', 'dono5', 'dono6', 'deldono', 'donos', 'listagp'
];

const CMD_ADM = [
  'mute', 'demute', 'ban', 'promover', 'rebaixar', 'bemvindo',
  'legendabv', 'legendasaiu', 'fundobv', 'fundosaiu', 'delfundos',
  'antidivulgacao', 'antispam'
];

const CMD_PUBLICO = [
  'like', 'play', 'revelar', 'ver', 'foto', 'dp', 'menu', 'ping',
  'criador', 'st', 'stk', 'guilda', 'guildainfo', 'skin', 'play2',
  'play_audio', 'play_video', 'likestatus', 'status', 'recarga',
  'totalcmd', 'player', 'perfil'
];

// ═══════════════════════════════════════════════
// 🔄 MAPEAMENTO DE VARIAÇÕES (para entender fala natural)
// ═══════════════════════════════════════════════
const VARIOES_COMANDOS = {
  // Admin - MUTE
  'mute': 'mute', 'muteia': 'mute', 'mutar': 'mute', 'silencia': 'mute',
  'silenciar': 'mute', 'mudo': 'mute', 'deleta': 'mute',

  // Admin - DESMUTE
  'desmuted': 'demute', 'desmute': 'demute', 'desmutea': 'demute',
  'desmutar': 'demute', 'libera': 'demute', 'liberar': 'demute',
  'tira mute': 'demute', 'tiramute': 'demute',

  // Admin - BAN
  'ban': 'ban', 'bane': 'ban', 'bana': 'ban', 'expulsa': 'ban',
  'expulsar': 'ban', 'remove': 'ban', 'retira': 'ban', 'tira': 'ban',
  'saca': 'ban', 'sacar': 'ban', 'kick': 'ban', 'tirar': 'ban',

  // Admin - PROMOVER
  'promove': 'promover', 'promover': 'promover', 'promo': 'promover',
  'eleva': 'promover', 'admin': 'promover', 'admi': 'promover',
  'dar adm': 'promover', 'daradmin': 'promover', 'daradm': 'promover',
  'da adm': 'promover', 'daadmin': 'promover', 'daadm': 'promover',
  'deixa admin': 'promover', 'deixaadmin': 'promover', 'deixaadm': 'promover',
  'coloca admin': 'promover', 'colocaadmin': 'promover', 'colocaadm': 'promover',

  // Admin - REBAIXAR
  'rebaixa': 'rebaixar', 'rebaixar': 'rebaixar', 'tira adm': 'rebaixar',
  'tiraadmin': 'rebaixar', 'tiraadm': 'rebaixar', 'tira admin': 'rebaixar',
  'desprover': 'rebaixar', 'despromover': 'rebaixar', 'retira adm': 'rebaixar',
  'retiraadmin': 'rebaixar', 'retiraadm': 'rebaixar', 'retirar adm': 'rebaixar',
  'retiraradmin': 'rebaixar', 'retiraradm': 'rebaixar',

  // Dono - GRUPOS
  'fechagp': 'fechargp', 'fechar': 'fechargp', 'abre': 'abrirgp',
  'abrir': 'abrirgp', 'abregrupo': 'abrirgp', 'abrirgrupo': 'abrirgp',
  'bloqueia': 'bloqueargp', 'bloquear': 'bloqueargp', 'bloqueiagp': 'bloqueargp',
  'desbloqueia': 'liberargp', 'desbloquear': 'liberargp', 'desbloqueiagp': 'liberargp',
  'libera': 'liberargp', 'liberagp': 'liberargp',

  // Dono - REINICIAR
  'reinicia': 'reiniciar', 'restart': 'reiniciar', 'reiniciar': 'reiniciar',

  // Dono - BOT ON/OFF
  'botoff': 'botoff', 'boton': 'boton',

  // Dono - ANTIPV
  'antipv': 'antipv', 'antivpv': 'antipv', 'antiprivado': 'antipv',

  // Públicos - LIKE
  'curte': 'like', 'curtir': 'like', 'envia like': 'like',

  // Públicos - REVELAR
  'revela': 'revelar', 'revelar': 'revelar', 'ver': 'ver', 'mostra': 'revelar',

  // Públicos - FOTO
  'foto': 'foto', 'dp': 'dp', 'perfil': 'perfil',

  // Públicos - PLAY
  'play': 'play', 'tocar': 'play', 'musica': 'play', 'music': 'play',
  'song': 'play', 'reproduz': 'play', 'reproduzir': 'play',

  // Públicos - MENU
  'menu': 'menu', 'ajuda': 'menu', 'help': 'menu', 'comandos': 'menu',

  // Públicos - CRIADOR
  'criador': 'criador', 'dono': 'criador', 'cria': 'criador',

  // Públicos - PING
  'ping': 'ping', 'pong': 'ping',

  // Públicos - STATUS
  'status': 'status',

  // Públicos - PLAY2
  'play2': 'play2', 'play_audio': 'play_audio', 'play_video': 'play_video',

  // Públicos - LIKE STATUS
  'likestatus': 'likestatus', 'recarga': 'recarga', 'verifica': 'likestatus',
  'verificar': 'likestatus',

  // Públicos - GUILDA
  'guilda': 'guilda', 'guildas': 'guilda', 'busca guilda': 'guilda',
  'guildainfo': 'guildainfo', 'info guilda': 'guildainfo',

  // Públicos - SKIN
  'skin': 'skin', 'personagem': 'skin', 'character': 'skin',

  // Públicos - PLAYER
  'player': 'player'
};

// ═══════════════════════════════════════════════
// 🤖 FUNÇÃO PRINCIPAL DA IA
// ═══════════════════════════════════════════════
function responderAurora(tokito, from, sender, body, isGroup, isGroupAdmins, SoDono, prefix, reply, normalizar) {
  const msgLower = body.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, "");

  // 1️⃣ IDENTIFICAR PERFIL DO USUÁRIO
  let perfil = 'Membro';
  if (SoDono) perfil = 'Dono';
  else if (isGroupAdmins) perfil = 'Admin';

  // 2️⃣ VERIFICAR SE É UM PEDIDO DE COMANDO EXECUTÁVEL (PRIORIDADE MÁXIMA)
  const palavras = msgLower.split(/\s+|[,.;:!?\-#]+/).filter(p => p.length > 0);

  let comandoAlvo = null;
  let indiceComando = -1;

  // Busca no mapeamento de variações
  for (let i = 0; i < palavras.length; i++) {
    const palavra = palavras[i];
    if (VARIOES_COMANDOS[palavra]) {
      comandoAlvo = VARIOES_COMANDOS[palavra];
      indiceComando = i;
      break;
    }
  }

  // Se não achou nas variações, busca por palavra exata
  if (!comandoAlvo) {
    for (let i = 0; i < palavras.length; i++) {
      if (CMD_DONO.includes(palavras[i]) || CMD_ADM.includes(palavras[i]) || CMD_PUBLICO.includes(palavras[i])) {
        comandoAlvo = palavras[i];
        indiceComando = i;
        break;
      }
    }
  }

  // SE ENCONTROU COMANDO → EXECUTA (sem verificar palavras-chave!)
  if (comandoAlvo) {
    // 🔒 VERIFICAR PERMISSÃO
    let permitido = false;
    if (CMD_DONO.includes(comandoAlvo)) permitido = (perfil === 'Dono');
    else if (CMD_ADM.includes(comandoAlvo)) permitido = (perfil === 'Admin' || perfil === 'Dono');
    else permitido = true; // Público

    if (!permitido) {
      const restritoA = CMD_DONO.includes(comandoAlvo) ? 'Donos' : 'Administradores';
      return {
        text: `⚠️ *${perfil} não pode executar esse comando.*\n\n🔒 \`${comandoAlvo.toUpperCase()}\` é restrito a ${restritoA}.`,
        exec: null
      };
    }

    // 🚀 RETORNAR SINAL DE EXECUÇÃO INTERNA
    const resto = palavras.slice(indiceComando + 1).join(' ');

    return {
      type: 'execute',
      command: comandoAlvo,
      args: resto,
      from: from,
      sender: sender
    };
  }

  // 3️⃣ RESPOSTAS CONVERSACIONAIS - APENAS SE NÃO HOUVE COMANDO
  // A IA responde se for menção ou pergunta sobre o bot
  const temSaudacao = /^olá|oi|eai|bom dia|boa tarde|boa noite|salve|fala|hey|hello/i.test(msgLower);
  const temProvocacao = /brava|chata|estressada|burra|besta|parada|lixo|bot ruim|te odeio|idiota|inútil|tola|boba/i.test(msgLower);
  const temAgradecimento = /gostei|obrigado|valeu|thanks|agradeço|obg|mt obrigada/i.test(msgLower);
  const temQuemSou = /quem é você|quem te fez|seu nome|o que é você|seu dono|sobre você/i.test(msgLower);

  // Se não tem nada, NÃO RESPONDE (a menos que seja menção direta)
  if (!temSaudacao && !temProvocacao && !temAgradecimento && !temQuemSou) {
    return null;
  }

  // Busca no banco de respostas.json
  for (const item of dadosAI.respostas) {
    const match = item.palavras_chave.some(p => msgLower.includes(p.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, "")));
    if (match) {
      const resp = Array.isArray(item.resposta) ? item.resposta[Math.floor(Math.random() * item.resposta.length)] : item.resposta;
      return { text: resp, exec: null };
    }
  }

  // Respostas personalizadas por perfil
  if (temProvocacao) {
    const respostasBrava = [
      "Ei! Mantenha o respeito. Eu sou uma IA, mas tenho limites. Não provoque! 😒",
      "Isso não foi legal. Eu estou aqui para ajudar, não para brigar.",
      "🙄 Desculpa me corrigir, mas ser educado não custa nada.",
      "Que falta de educação! Eu faço o possível para ajudar e você me xinga?"
    ];
    return { text: respostasBrava[Math.floor(Math.random() * respostasBrava.length)], exec: null };
  }

  if (temAgradecimento) {
    const respostasObrigado = [
      "De nada! Estou aqui para ajudar. 🎀",
      "Fico feliz em ajudar! Qualquer dúvida, é só gritar.",
      "Por nada! É meu trabalho ser útil. 😉"
    ];
    return { text: respostasObrigado[Math.floor(Math.random() * respostasObrigado.length)], exec: null };
  }

  if (perfil === 'Dono' && temSaudacao) {
    return { text: "Olá, Mestre! 🎀 Aurora online. Como posso ajudar?", exec: null };
  }
  if (perfil === 'Admin' && temSaudacao) {
    return { text: "Olá, Admin! 🎀 Aurora no comando. Precisa de ajuda?", exec: null };
  }

  // Resposta padrão
  const respostasPadrao = Array.isArray(dadosAI.padrao)
    ? dadosAI.padrao
    : [dadosAI.padrao];
  return { text: respostasPadrao[Math.floor(Math.random() * respostasPadrao.length)], exec: null };
}

module.exports = { responderAurora };
