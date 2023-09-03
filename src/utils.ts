import path from 'path';
import fs from 'fs';

export function getFileExtension(filename: string): string {
    return path.extname(filename).substring(1);
}

export function stringify(obj: Record<string, any>): string {
    const cleaned = JSON.stringify(obj, null, 2);

    return cleaned.replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, function (match) {
        return match.replace(/"/g, '');
    });
}

export async function readContentOrFile(content?: string, filePath?: string): Promise<string> {
    if (content) return content;

    if (!filePath) return '';
    if ((await fs.promises.stat(filePath)).isDirectory()) return '';
    return (await fs.promises.readFile(filePath)).toString();
}
