import { IEditorContext } from './editor-manager';

export interface IEditorStorage {
  getItem(key: string): any;
  setItem(key: string, value: any): void;
  clear(): void;
}

export class EditorStorage implements IEditorStorage {

  private readonly storage = new Map<string, any>();
  public constructor(private context: IEditorContext) { }

  public getItem(key: string): any {
    return this.storage.get(key);
  }

  public setItem(key: string, value: any): void {
    this.storage.set(key, value)
  }

  public clear(): void {
    this.storage.clear();
  }

}