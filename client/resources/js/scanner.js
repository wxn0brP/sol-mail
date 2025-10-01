export async function findServer(port) {
    console.log(`Searching for server on port ${port}...`);

    const myIp = await getMyIp();
    if (!myIp) {
        console.log("Could not get my IP address");
        return null;
    }

    const network = getNetwork(myIp, 24);
    const hosts = generateHosts(network, 24);

    console.log(`Scanning ${hosts.length} hosts in network ${network}...`);

    const server = await findFirstWorkingHost(hosts, port);
    if (server) {
        console.log("Found:", server);
        return server;
    }

    console.log("Server not found");
    return null;
}

function findFirstWorkingHost(hosts, port) {
    return new Promise((resolve, reject) => {
        for (const host of hosts)
            fetch(`http://${host}:${port}/server.find`).then(res => res.ok && resolve(host)).catch(() => { });
        setTimeout(() => resolve(null), 5000);
    });
}

async function getMyIp() {
    try {
        const stdout = await exec("ipconfig");
        const lines = stdout.split("\n");

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.includes("IPv4") || trimmed.includes("IP Address")) {
                const parts = trimmed.split(":");
                if (parts.length > 1) {
                    const ip = parts[1].trim();
                    if (isValidIp(ip)) {
                        return ip;
                    }
                }
            }
        }

        const stdout2 = await exec("ip addr show");
        /** @type {string[]} */
        const ips = stdout2.trim().split(" ");
        for (const ip of ips) {
            if (!isValidIp(ip)) continue;
            if (ip.startsWith("10.") || ip.startsWith("172.") || ip.startsWith("192.168")) return ip;
        }

    } catch (error) {
        console.log("Error getting my IP address:", error);
    }

    return null;
}

function isValidIp(ip) {
    const parts = ip.split(".");
    if (parts.length !== 4) return false;

    for (const part of parts) {
        const num = parseInt(part);
        if (isNaN(num) || num < 0 || num > 255) return false;
    }

    return true;
}

function getNetwork(ip, prefix) {
    const parts = ip.split(".").map(Number);
    const mask = 0xFFFFFFFF << (32 - prefix);

    const network = [
        parts[0] & (mask >>> 24 & 255),
        parts[1] & (mask >>> 16 & 255),
        parts[2] & (mask >>> 8 & 255),
        parts[3] & (mask & 255)
    ];

    return network.join(".");
}

function generateHosts(network, prefix) {
    const hosts = [];
    const base = network.split(".").map(Number);

    const start = 1;
    const end = prefix === 24 ? 254 : 2;

    for (let i = start; i <= end; i++) {
        hosts.push(`${base[0]}.${base[1]}.${base[2]}.${i}`);
    }

    return hosts;
}

async function getSystem() {
    try {
        await exec("ver");
        return "windows";
    } catch {
        return "unix";
    }
}