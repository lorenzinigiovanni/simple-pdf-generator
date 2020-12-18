import path from 'path';

export function getFileExtension(filename: string): string {
    return path.extname(filename).substring(1);
}
