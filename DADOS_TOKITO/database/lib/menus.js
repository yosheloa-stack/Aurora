/*
* Decorações dos menus da base.
* Author: Yosh.
*/

exports.menu = (NomeDoBot, sender, isCargo, isChVip, hora, prefix, ownerName, baileysVersion) => {
return `╭┄┈╌ ⋆｡‧₊˚ ✿ ˚₊‧｡⋆ ╌┈┄╮
┆⋆ 🎀 𝑩𝑶𝑻 ⋆ ${NomeDoBot}
┆⋆ 🎀 𝑪𝑹𝑰𝑨𝑫𝑶𝑹𝑨 ⋆ ${ownerName}
┆⋆ 🎀 𝑼𝑺𝑼Á𝑹𝑰𝑨 ⋆ @${sender.split('@')[0]}
┆⋆ 🎀 𝑪𝑨𝑹𝑮𝑶 ⋆ ${isCargo}
┆⋆ 🎀 𝑽𝑰𝑷 ⋆ ${isChVip}
┆⋆ 🎀 𝑯𝑶𝑹𝑨 ⋆ ${hora}
┆⋆ 🎀 𝑩𝑨𝑰𝑳𝑬𝒀𝑺 ⋆ ${baileysVersion}
╰┄┈╌ ⋆｡‧₊˚ ✿ ˚₊‧｡⋆ ╌┈┄╯

╭┄┈╌ ⋆｡‧₊˚ ✿ ˚₊‧｡⋆ ╌┈┄╮
┆ ♡ 𝙼𝙴𝙽𝚄 𝙿𝚁𝙸𝙽𝙲𝙸𝙿𝙰𝙻
┆ ❀ ${prefix}menuadm
┆ ❀ ${prefix}menudono
╰┄┈╌ ⋆｡‧₊˚ ✿ ˚₊‧｡⋆ ╌┈┄╯

╭┄┈╌ ⋆｡‧₊˚ ✿ ˚₊‧｡⋆ ╌┈┄╮
┆ ♡ 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝚂
┆ ❀ ${prefix}play nome
┆ ❀ ${prefix}play2 nome
┆ ❀ ${prefix}play_audio nome/link
┆ ❀ ${prefix}play_video nome/link
╰┄┈╌ ⋆｡‧₊˚ ✿ ˚₊‧｡⋆ ╌┈┄╯

╭┄┈╌ ⋆｡‧₊˚ ✿ ˚₊‧｡⋆ ╌┈┄╮
┆ ♡ 𝚁𝙰𝙽𝙳𝙾𝙼
┆ ❀ ${prefix}ping
┆ ❀ ${prefix}criador
┆ ❀ ${prefix}donos
┆ ❀ ${prefix}viplist
╰┄┈╌ ⋆｡‧₊˚ ✿ ˚₊‧｡⋆ ╌┈┄╯`

}

exports.menuadm = (NomeDoBot, sender, isCargo, isChVip, hora, prefix, ownerName, baileysVersion) => {
return `╭┄┈╌ ⋆｡‧₊˚ ✿ ˚₊‧｡⋆ ╌┈┄╮
┆⋆ 🎀 𝑩𝑶𝑻 ⋆ ${NomeDoBot}
┆⋆ 🎀 𝑼𝑺𝑼Á𝑹𝑰𝑨 ⋆ @${sender.split('@')[0]}
┆⋆ 🎀 𝑪𝑨𝑹𝑮𝑶 ⋆ ${isCargo}
┆⋆ 🎀 𝑯𝑶𝑹𝑨 ⋆ ${hora}
╰┄┈╌ ⋆｡‧₊˚ ✿ ˚₊‧｡⋆ ╌┈┄╯

╭┄┈╌ ⋆｡‧₊˚ ✿ ˚₊‧｡⋆ ╌┈┄╮
┆ ♡ 𝙼𝙴𝙽𝚄-𝙰𝙳𝙼𝙸𝙽
┆ ❀ ${prefix}fechargp 22:00
┆ ❀ ${prefix}abrirgp 07:00
┆ ❀ ${prefix}delhorario
┆ ❀ ${prefix}ban @usuario
┆ ❀ ${prefix}promover @usuario
┆ ❀ ${prefix}rebaixar @usuario
┆ ❀ ${prefix}bemvindo
┆ ❀ ${prefix}legendabv texto
┆ ❀ ${prefix}legendasaiu texto
┆ ❀ ${prefix}fundobv
┆ ❀ ${prefix}fundosaiu
┆ ❀ ${prefix}delfundos
╰┄┈╌ ⋆｡‧₊˚ ✿ ˚₊‧｡⋆ ╌┈┄╯`
}

exports.menudono = (NomeDoBot, sender, isCargo, isChVip, hora, prefix, ownerName, baileysVersion) => {
return `╭┄┈╌ ⋆｡‧₊˚ ✿ ˚₊‧｡⋆ ╌┈┄╮
┆⋆ 🎀 𝑩𝑶𝑻 ⋆ ${NomeDoBot}
┆⋆ 🎀 𝑪𝑹𝑰𝑨𝑫𝑶𝑹𝑨 ⋆ ${ownerName}
┆⋆ 🎀 𝑼𝑺𝑼Á𝑹𝑰𝑨 ⋆ @${sender.split('@')[0]}
┆⋆ 🎀 𝑪𝑨𝑹𝑮𝑶 ⋆ ${isCargo}
┆⋆ 🎀 𝑯𝑶𝑹𝑨 ⋆ ${hora}
╰┄┈╌ ⋆｡‧₊˚ ✿ ˚₊‧｡⋆ ╌┈┄╯

╭┄┈╌ ⋆｡‧₊˚ ✿ ˚₊‧｡⋆ ╌┈┄╮
┆ ♡ 𝙼𝙴𝙽𝚄-𝙳𝙾𝙽𝙰
┆ ❀ ${prefix}verificado
┆ ❀ ${prefix}nome-bot novo nome
┆ ❀ ${prefix}nome-dono novo nome
┆ ❀ ${prefix}numero-dono @usuario
┆ ❀ ${prefix}dono1 @usuario
┆ ❀ ${prefix}dono2 @usuario
┆ ❀ ${prefix}dono3 @usuario
┆ ❀ ${prefix}dono4 @usuario
┆ ❀ ${prefix}dono5 @usuario
┆ ❀ ${prefix}dono6 @usuario
┆ ❀ ${prefix}deldono 1
┆ ❀ ${prefix}donos
┆ ❀ ${prefix}setchannel link
┆ ❀ ${prefix}setprefix !
┆ ❀ ${prefix}fotomenu
┆ ❀ ${prefix}addvip @usuario/30
┆ ❀ ${prefix}addvip @usuario/0
┆ ❀ ${prefix}delvip @usuario
┆ ❀ ${prefix}limparvip
┆ ❀ ${prefix}reiniciar
╰┄┈╌ ⋆｡‧₊˚ ✿ ˚₊‧｡⋆ ╌┈┄╯`
}
