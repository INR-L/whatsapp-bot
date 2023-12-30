const { pnix, mode} = require("../lib");
const emojis = ["🍒", "🕊", "💵", "🍭"];

pnix({
    pattern: "slot",
    type: "main",
    desc: "Check Bot Runtime",
    fromMe: mode
}, async(msg) => {
        const spinResult = [];

        for (let i = 0; i < 3; i++) {
            const randomEmojiIndex = Math.floor(Math.random() * emojis.length);
            spinResult.push(emojis[randomEmojiIndex]);
        }

        const [x, y, z] = spinResult;
        
        const slotDisplay = `
    🎰 ┃ *SLOTS* 
 ────────────
 | ${x} : ${y} : ${z} |
 ────────────
    🎰┃🎰┃ 🎰
`;

        const isWinner = spinResult.every((emoji) => emoji === spinResult[0]);
        
        const resultMessage = isWinner
            ? "*Congratulations You Won 🎉*"
            : "*You Lose Better Luck Next Time 😔*";
        
        await msg.reply(`${slotDisplay}\n${resultMessage}`);
});
