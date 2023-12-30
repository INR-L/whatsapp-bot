const { pnix, mode } = require("../lib");

pnix({
    pattern: "heart",
    type: "main",
    desc: "Heart demo.",
    fromMe: mode
}, async (msg, client) => {
    const abhi = "❤️ 🧡 💛 💖 💚 💓 💙 💜 💝 🖤 🤎 💕 🤍 💗";
   client.sendMessage(msg.from, { edit: { text: "📃", key: abhi } });
