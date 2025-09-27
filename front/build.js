import esbuild from "esbuild";
import stylePlugin from "esbuild-style-plugin";
const isDev = process.env.NODE_ENV === "development" || process.argv.includes("--dev");

esbuild.build({
    entryPoints: [
        "src/index.ts"
    ],
    outdir: "dist",
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    sourcemap: true,
    minify: !isDev,
    splitting: false,
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