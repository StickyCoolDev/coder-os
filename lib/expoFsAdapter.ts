import * as FileSystem from 'expo-file-system';
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

export const expoFsAdapter = {
  promises: {
    readFile: async (path: string, options?: any) => {
      const data = await FileSystem.readAsStringAsync(path, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const buffer = Buffer.from(data, 'base64');
      return options?.encoding === 'utf8' ? buffer.toString('utf8') : buffer;
    },
    writeFile: async (path: string, data: any) => {
      await ensureDir(path);
      const content = Buffer.isBuffer(data) ? data.toString('base64') : Buffer.from(data).toString('base64');
      await FileSystem.writeAsStringAsync(path, content, { encoding: FileSystem.EncodingType.Base64 });
    },
    mkdir: async (path: string) => {
      await FileSystem.makeDirectoryAsync(path, { intermediates: true });
    },
    readdir: async (path: string) => {
      return await FileSystem.readDirectoryAsync(path);
    },
    unlink: async (path: string) => {
      await FileSystem.deleteAsync(path);
    },
    stat: async (path: string) => {
      const info = await FileSystem.getInfoAsync(path);
      if (!info.exists) throw { code: 'ENOENT' };
      return {
        size: info.size || 0,
        mtimeMs: info.modificationTime * 1000,
        isDirectory: () => info.isDirectory,
        isFile: () => !info.isDirectory,
      };
    },
    lstat: function(path: string) { return this.stat(path); }
  },
};

