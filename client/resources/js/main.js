import { findServer } from "./scanner.js";
Neutralino.init();

async function _exec(c) {
    return await Neutralino.os.execCommand(c).then(res => res.stdOut);
}
window.exec = _exec;

const server = await findServer(19851);
if (server) {
    console.log(`Found server: ${server}`);
    localStorage.setItem("server", server);
    location.href = `http://${server}:19851`;
} else {
    console.log("Server not found");
    alert("Server not found");
}