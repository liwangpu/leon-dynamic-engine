import { IEditorContext } from './editor-manager';

// localStorage.getItem();
// localStorage.setItem();
// localStorage.clear();

export interface IPlugin {
  init(): Promise<void>;
  destroy?(): Promise<void>;
}

export interface IPluginRegister {
  (context: IEditorContext): IPlugin;
}