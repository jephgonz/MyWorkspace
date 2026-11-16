import { compile } from 'tailwindcss';
import { readFile, writeFile } from 'fs/promises';

async function main() {
    const input = await readFile('resources/css/app.css', 'utf8');
    const { css } = await compile(input);
    await writeFile('public/assets/css/app.css', css);
    console.log('CSS built successfully.');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
