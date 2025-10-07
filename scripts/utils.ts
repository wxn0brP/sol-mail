import readline from "readline";

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

export async function prompt(question: string): Promise<string> {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
}
