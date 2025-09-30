import readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// @ts-ignore
async function prompt(question) {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
}

const name = await prompt("Enter the name: ");
const pass = await prompt("Enter the password: ");

const res = await fetch("http://localhost:19851/auth/register", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, pass }),
});

const data = await res.json();
console.log(data);
rl.close();