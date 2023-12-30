const { calculatePing, pnix, mode} = require("../lib");

pnix({
    pattern: "ping",
    type: "main",
    desc: "Bot response.",
    fromMe: mode
}, async(msg, match) => {
        await msg.reply(`*📡Pong!* ${calculatePing(msg.messageTimestamp, Date.now())} Ms`);
})
