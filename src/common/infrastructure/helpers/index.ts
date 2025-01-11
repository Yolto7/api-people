export const bufferMimeType = {
  png: '89504e47', // PNG
  jpg: 'ffd8ffe0', // JPG/JPEG
  jpeg: 'ffd8ffe1', // JPG/JPEG
  gif: '47494638', // GIF
  bmp: '424d', // BMP
  webp: '52494646', // WEBP
};

export function getBufferMimeType(buffer: Buffer) {
  const header = buffer.toString('hex', 0, 8);
  for (const [format, magic] of Object.entries(bufferMimeType)) {
    if (header.startsWith(magic)) {
      return format;
    }
  }

  return '';
}

export function getMethodsByPrototype<T>(prototype: T): { [key: string]: keyof T } {
  const methods: { [key: string]: keyof T } = {};

  Object.getOwnPropertyNames(prototype)
    .filter((prop) => typeof prototype[prop as keyof T] === 'function' && prop !== 'constructor')
    .forEach((methodName) => {
      methods[methodName] = methodName as keyof T;
    });

  return methods;
}

export function getPropertyValueByType<T, K>(obj: T, type: new (...args: any[]) => K): K {
  return Object.entries(obj as any)
    .filter(([_, value]) => value instanceof type)
    .map(([_, value]) => value as K)[0];
}

export async function streamToBuffer(stream: any) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}
