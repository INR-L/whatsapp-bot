let commands = [];

function pnix(info, func) {
  let infos = {
    pattern: info.pattern,
    on: info.on,
    type: info.type || "others",
    fromMe: info.fromMe,
    desc: info.desc || "",
    onlyGroup: info.onlyGroup,
    function: func
  };
  commands.push(infos);
return infos;
}
module.exports = { pnix, commands };
