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

export function translateKey(value: string): string {
  const keys: Record<string, string> = {
    name: 'nombre',
    height: 'altura',
    mass: 'masa',
    hair_color: 'colorPelo',
    skin_color: 'colorPiel',
    eye_color: 'colorOjo',
    birth_year: 'aniversario',
    gender: 'genero',
    created: 'fechaFundado',
  };

  return keys[value];
}
