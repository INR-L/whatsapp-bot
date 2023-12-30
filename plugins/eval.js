const {pnix} = require('../lib');
const util = require("util");
const bs = require("@whiskeysockets/baileys");
const lib = require('../lib');
const Config = require("../config")
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const cheerio = require('cheerio');

pnix({
    pattern: "eval",
    type: "owner",
    desc: "Send evaled data for your request",
    usage: "Give evaled data for your script",
    fromMe: false, // Assuming fromMe should be false, adjust if needed
    on: "all",
}, async (message, match, client) => {
    let code = message.body.replace('>eval', '').trim();
    try {
        if (!code) return await message.reply("What's your JavaScript code?");

        // Only execute the code if it starts with ">eval"
        if (message.body.startsWith('>')) {
            const input = clean(code);
            let text = `*INPUT*\n\`\`\`${input}\`\`\`\n`;

            let evaled;
            if (code.includes("-s") && code.includes("-as")) {
                code = code.replace("-as", "").replace("-s", "");
                evaled = await eval(`(async() => { ${code} })()`);
            } else if (code.includes("-as")) {
                code = code.replace("-as", "");
                evaled = await eval(`(async() => { ${code} })()`);
            } else if (code.includes("-s")) {
                code = code.replace("-s", "");
                evaled = await eval(code);
            } else {
                evaled = await eval(code);
            }

            if (typeof evaled !== "string") evaled = util.inspect(evaled, { depth: 0 });

            let output = clean(evaled);
            text += `\n*OUTPUT*\n\`\`\`${output}\n\`\`\``;
            await message.send(text);
        }
    } catch (e) {
        const err = clean(e);
        let text = `\n*ERROR*\n\`\`\`${err}\n\`\`\``;
        await message.reply(text);
    }
});

function clean(text) {
    if (typeof text === "string") {
        return text.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`);
    } else {
        return text;
    }
}
