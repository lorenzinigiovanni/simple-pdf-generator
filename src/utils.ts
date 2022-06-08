import path from 'path';

export function getFileExtension(filename: string): string {
    return path.extname(filename).substring(1);
}

export function stringify(obj: Record<string, any>): string {
    const cleaned = JSON.stringify(obj, null, 2);

    return cleaned.replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, function (match) {
        return match.replace(/"/g, '');
    });
}
