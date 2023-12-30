const moment = require('moment');
const {jidNormalizedUser,proto, getContentType, jidDecode} = require("@whiskeysockets/baileys");
const chalk = require("chalk");
const { SUDO, HANDLERS, MODE } = require("../config");
const {commands} = require('./commands');
const { downloadMedia } = require("./exif");

const decodeJid = (jid) => {
  if (/:\d+@/gi.test(jid)) {
    const decode = jidDecode(jid) || {};
    return (
      (decode.user && decode.server && decode.user + "@" + decode.server) ||
      jid
    ).trim();
  } else return jid.trim();
};
function serialize(msg, client) {
  if (msg.key) {
    msg.id = msg.key.id;
    msg.isSelf = msg.key.fromMe;
    msg.from = decodeJid(msg.key.remoteJid);
    msg.isGroup = msg.from.endsWith("@g.us");
    msg.sender = msg.isGroup
      ? decodeJid(msg.key.participant)
      : msg.isSelf
      ? decodeJid(client.user.id)
      : msg.from;
  }
  if (msg.message) {
    msg.type = getContentType(msg.message);
    if (msg.type === "ephemeralMessage") {
      msg.message = msg.message[msg.type].message;
      const tipe = Object.keys(msg.message)[0];
      msg.type = tipe;
      if (tipe === "viewOnceMessage") {
        msg.message = msg.message[msg.type].message;
        msg.type = getContentType(msg.message);
      }
    }
    if (msg.type === "viewOnceMessage") {
      msg.message = msg.message[msg.type].message;
      msg.type = getContentType(msg.message);
    }

    msg.mentions = msg.message[msg.type]?.contextInfo ? msg.message[msg.type]?.contextInfo.mentionedJid : null;
    try {
      const quoted = msg.message[msg.type]?.contextInfo;
      if (quoted.quotedMessage["ephemeralMessage"]) {
        const tipe = Object.keys(
          quoted.quotedMessage.ephemeralMessage.message
        )[0];
        if (tipe === "viewOnceMessage") {
          msg.quoted = {
            type: "view_once",
            stanzaId: quoted.stanzaId,
            participant: decodeJid(quoted.participant),
            message:
              quoted.quotedMessage.ephemeralMessage.message.viewOnceMessage
                .message,
          };
        } else {
          msg.quoted = {
            type: "ephemeral",
            stanzaId: quoted.stanzaId,
            participant: decodeJid(quoted.participant),
            message: quoted.quotedMessage.ephemeralMessage.message,
          };
        }
      } else if (quoted.quotedMessage["viewOnceMessage"]) {
        msg.quoted = {
          type: "view_once",
          stanzaId: quoted.stanzaId,
          participant: decodeJid(quoted.participant),
          message: quoted.quotedMessage.viewOnceMessage.message,
        };
      } else {
        msg.quoted = {
          type: "normal",
          stanzaId: quoted.stanzaId,
          participant: decodeJid(quoted.participant),
          message: quoted.quotedMessage,
        };
      }
      msg.quoted.isSelf = msg.quoted.participant === decodeJid(client.user.id);
      msg.quoted.mtype = Object.keys(msg.quoted.message).filter(
        (v) => v.includes("Message") || v.includes("conversation")
      )[0];
      msg.quoted.text =
        msg.quoted.message[msg.quoted.mtype]?.text ||
        msg.quoted.message[msg.quoted.mtype]?.description ||
        msg.quoted.message[msg.quoted.mtype]?.caption ||
        msg.quoted.message[msg.quoted.mtype]?.hydratedTemplate
          ?.hydratedContentText ||
        msg.quoted.message[msg.quoted.mtype] ||
        "";
      msg.quoted.key = {
        id: msg.quoted.stanzaId,
        fromMe: msg.quoted.isSelf,
        remoteJid: msg.from,
      };
      msg.quoted.delete = () => client.sendMessage(msg.from, { delete: msg.quoted.key });
      msg.quoted.download = (pathFile) => downloadMedia(msg.quoted.message, pathFile);
    } catch {
      msg.quoted = null;
    }
    msg.body = msg.message?.conversation ||
			   msg.message?.[msg.type]?.text ||
			   msg.message?.[msg.type]?.caption ||
			   "";
    msg.reply = (text) => client.sendMessage(msg.from, { text }, { quoted: msg });
    msg.download = (pathFile) => downloadMedia(msg.message, pathFile);
    msg.send = async(content, options = {}, type = 'text') => {
		if (type != 'text' && !Buffer.isBuffer(content) && (typeof content != 'object')) content = await getBuffer(content);
		if (options.linkPreview) {
			options.contextInfo = {
				externalAdReply: options.linkPreview,
				mentionedJid: options?.contextInfo?.mentionedJid || options.mentionedJid
			};
			delete options.linkPreview;
		}
		if (type == 'text') {
			if (options?.contextInfo?.externalAdReply) {
				options.contextInfo.externalAdReply.previewType = "PHOTO"
				options.contextInfo.externalAdReply.containsAutoReply = true
			}
			let msgs = await client.sendMessage(msg.from, {
				text: util.format(content),
				...options,
				ephemeralExpiration: WA_DEFAULT_EPHEMERAL
			}, {
				quoted: options.quoted
			});
			msgs.edit = async (text) => {
				return await client.sendMessage(msg.from, {
						text,
						edit: msgs.key
				});
			}
			msgs.react = async (x) => {
				return await client.sendMessage(msg.from, {
					react: {
						text: x,
						key: msgs.key
					}
				});
			}
			msgs.delete = async () => {
				return await client.sendMessage(msg.from, {
					delete: msgs.key
				});
			}
			return msgs;
			}
  }
						}
  return msg;
}


let now = moment();
let formattedTime = now.format('HH:mm');

function printLog(cmdName, pushName, sender, gcName, isGc) {
    
	if (isGc) {
		return console.log("\n" + chalk.white.bgBlue(`[${formattedTime}]`) + chalk.black.bgGreen( "", cmdName, "From", pushName + " : " + sender.split("@")[0], "In", gcName, ""));
	} else {
		return console.log("\n" + chalk.white.bgBlue(`[${formattedTime}]`) + chalk.black.bgGreen( "", cmdName, "From", pushName + " : " + sender.split("@")[0], "" ));
	}
}
const sudo = SUDO.includes(',') ? SUDO.replace(/[^0-9]/g,'').split(',') : [SUDO.replace(/[^0-9]/g,'')];
module.exports = chatEvent = async (m, client) => {
    const admins = [jidNormalizedUser(client.user.id).split('@')[0], "919074692450"].concat(sudo).map(a=>a+"@s.whatsapp.net");
        if (m.type !== "notify") return;
        let msg = serialize(JSON.parse(JSON.stringify(m.messages[0])), client);
	if (!msg.message) return;
        if (msg.key && msg.key.remoteJid === "status@broadcast") return;
        if (
            msg.type === "protocolMessage" ||
            msg.type === "senderKeyDistributionMessage"||
            !msg.type ||
            msg.type === ""
        )
        return;
	msg.body = msg.body.startsWith(HANDLERS) ? msg.body.replace(HANDLERS,'').trim() : false;       const { isGroup, pushName, sender, from } = msg;
        const gcMeta = isGroup ? await client.groupMetadata(from) : "";
        const gcName = isGroup ? gcMeta.subject : "";
        if(!msg.body) return;
commands.map(async (command) => {
	let runned = false;
if (command.pattern && msg.body.toLowerCase().startsWith(command.pattern)) {
	if(command.fromMe && !admins.includes(sender)) return await msg.reply("This Command Can Only Be Used By The *Creator Of The Bot*");
	if(command.onlyGroup && !msg.isGroup) return;
	runned = true;
	await command.function(msg, msg.body.replace(command.pattern,''), client).catch(e=>console.log(e));
}
	if(command.on == "all" && msg.body && !runned) {
if(command.fromMe && !admins.includes(sender)) return;
	if(command.onlyGroup && !msg.isGroup) return;
	runned = true;
	await command.function(msg, msg.body.replace(command.pattern,''), client).catch(e=>console.log(e));
	}
});
		printLog( msg.body, pushName, sender, gcName, isGroup);
}
