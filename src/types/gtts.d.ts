declare module 'gtts' {
  export default class GTTS {
    constructor(text: string, lang: string);
    save(filepath: string, callback: (err: Error | null) => void): void;
  }
}
