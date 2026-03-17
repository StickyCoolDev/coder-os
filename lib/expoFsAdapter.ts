import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';

const ensureDir = async (path: string) => {
  const parts = path.split('/');
  parts.pop();
  const dir = parts.join('/');
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
};

export const expoFsAdapter: any = {
  readFile: async (path: string, options?: any) => {
    const data = await FileSystem.readAsStringAsync(path, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const buffer = Buffer.from(data, 'base64');
    
    return options?.encoding === 'utf8' ? buffer.toString('utf8') : new Uint8Array(buffer);
  },
  writeFile: async (path: string, data: any) => {
    await ensureDir(path);
    const content = Buffer.isBuffer(data) ? data.toString('base64') : Buffer.from(data).toString('base64');
    await FileSystem.writeAsStringAsync(path, content, { encoding: FileSystem.EncodingType.Base64 });
  },
  mkdir: async (path: string) => {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  },
  rmdir: async (path: string) => {
    await FileSystem.deleteAsync(path, { idempotent: true }); 
  },
  readdir: async (path: string) => {
    return await FileSystem.readDirectoryAsync(path);
  },
  unlink: async (path: string) => {
    await FileSystem.deleteAsync(path, { idempotent: true });
  },
  stat: async (path: string) => {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) {
      const err = new Error('ENOENT');
      (err as any).code = 'ENOENT';
      throw err;
    }
    return {
      size: info.size || 0,
      mtimeMs: info.modificationTime * 1000,
      isDirectory: () => info.isDirectory,
      isFile: () => !info.isDirectory,
      isSymbolicLink: () => false,
    };
  },
  lstat: function (path: string) { return this.stat(path); },
  readlink: async () => { throw new Error('Not implemented'); },
  symlink: async () => { throw new Error('Not implemented'); },
};

expoFsAdapter.promises = expoFsAdapter;

