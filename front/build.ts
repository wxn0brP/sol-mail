import esbuild from "esbuild";
import stylePlugin from "esbuild-style-plugin";
import { copyFileSync } from "fs";
const isDev = process.env.NODE_ENV === "development" || process.argv.includes("--dev");

await esbuild.build({
    entryPoints: [
        "src/*.ts",
        "src/pages/*.ts",
    ],
    outdir: "dist",
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    sourcemap: true,
    minify: !isDev,
    splitting: true,
    keepNames: true,
    loader: {},
    logLevel: "info",
    plugins: [
        stylePlugin({
            renderOptions: {
                sassOptions: {
                    silenceDeprecations: ["legacy-js-api"],
                    style: "compressed"
                }
            }
        })
    ],
}).catch(() => process.exit(1));

const copy = (file: string) => copyFileSync("node_modules/@wxn0brp/flanker-ui/dist/" + file, "dist/" + file);
copy("html.js");
copy("html.js.map");