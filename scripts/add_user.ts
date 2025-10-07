import { prompt, rl } from "./utils";

const name = process.argv[2] || await prompt("Enter the name: ");
const pass = process.argv[3] || await prompt("Enter the password: ");
rl.close();

const res = await fetch("http://localhost:19851/auth/register", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, pass }),
});

const data = await res.json();
console.log(data);