import { File, Directory, Paths } from 'expo-file-system';
import { Buffer } from 'buffer';

const ensureDir = async (path: string) => {
  const parts = path.split('/');
  parts.pop();
  const dirPath = parts.join('/');
  if (!dirPath) return;
  
  const dir = new Directory(dirPath);
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
};

export const expoFsAdapter: any = {
  readFile: async (path: string, options?: any) => {
    const file = new File(path);
    if (options?.encoding === 'utf8') {
      return await file.text();
    }
    const bytes = await file.bytes();
    return new Uint8Array(bytes);
  },
  writeFile: async (path: string, data: any) => {
    await ensureDir(path);
    const file = new File(path);
    if (typeof data === 'string') {
      file.write(data);
    } else {
      const bytes = Buffer.isBuffer(data) ? new Uint8Array(data) : (data instanceof Uint8Array ? data : new Uint8Array(data));
      file.write(bytes);
    }
  },
  mkdir: async (path: string) => {
    const dir = new Directory(path);
    if (!dir.exists) {
      dir.create({ intermediates: true });
    }
  },
  rmdir: async (path: string) => {
    const dir = new Directory(path);
    if (dir.exists) {
      dir.delete();
    }
  },
  readdir: async (path: string) => {
    const dir = new Directory(path);
    if (!dir.exists) {
      const err = new Error('ENOENT');
      (err as any).code = 'ENOENT';
      throw err;
    }
    const contents = dir.list();
    return contents.map(item => item.name).filter(Boolean);
  },
  unlink: async (path: string) => {
    const info = Paths.info(path);
    if (info.exists) {
      if (info.isDirectory) {
        new Directory(path).delete();
      } else {
        new File(path).delete();
      }
    }
  },
  stat: async (path: string) => {
    const info = Paths.info(path);
    if (!info.exists) {
      const err = new Error('ENOENT');
      (err as any).code = 'ENOENT';
      throw err;
    }
    
    const mtimeMs = info.modificationTime || Date.now();
    const mtime = new Date(mtimeMs);
    const mtimeSeconds = Math.floor(mtimeMs / 1000);
    const mtimeNanoseconds = (mtimeMs % 1000) * 1000000;
    
    return {
      size: info.size || 0,
      mtimeMs,
      mtime,
      mtimeSeconds,
      mtimeNanoseconds,
      ctimeMs: mtimeMs,
      ctime: mtime,
      ctimeSeconds: mtimeSeconds,
      ctimeNanoseconds: mtimeNanoseconds,
      atimeMs: mtimeMs,
      atime: mtime,
      atimeSeconds: mtimeSeconds,
      atimeNanoseconds: mtimeNanoseconds,
      uid: 0,
      gid: 0,
      dev: 0,
      ino: 0,
      nlink: 1,
      mode: info.isDirectory ? 0o40755 : 0o100644,
      isDirectory: () => info.isDirectory,
      isFile: () => !info.isDirectory,
      isSymbolicLink: () => false,
    };
  },
  lstat: (path: string) => expoFsAdapter.stat(path),
  readlink: async () => { throw new Error('Not implemented'); },
  symlink: async () => { throw new Error('Not implemented'); },
};

expoFsAdapter.promises = expoFsAdapter;
