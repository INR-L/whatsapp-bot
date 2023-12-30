

const toBool = (x) => x === 'true';

module.exports = {
    SESSION_ID: process.env.SESSION_ID || 'inrl~mF9RCwRF',
    HANDLERS: process.env.HANDLERS || '.',//[.]
    BOT_NAME: process.env.BOT_NAME || 'the-enrl',
    OWNER_NAME: process.env.OWNER_NAME || '🙃',
    OWNER_NUMBER: process.env.OWNER_NUMBER || '919074692450',
    SUDO: process.env.SUDO || '919074692450,917025099154',
    MODE: (process.env.MODE || 'public').trim(),
    STICKER_DATA: process.env.STICKER_DATA || '🎯inrl-𝙼𝙳;loki-x☘️',
};
