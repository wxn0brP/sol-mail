import esbuild from "esbuild";
import stylePlugin from "esbuild-style-plugin";
const isDev = process.env.NODE_ENV === "development" || process.argv.includes("--dev");

esbuild.build({
    entryPoints: [
        "src/html.ts",
        "src/index.ts",
        "src/pages/*.ts",
    ],
    outdir: "dist",
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    sourcemap: !isDev,
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