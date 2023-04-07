import { IEditorContext } from './editor-manager';

export interface IPlugin {
  init(): Promise<void>;
  destroy?(): Promise<void>;
}

export interface IPluginRegister {
  (context: IEditorContext): IPlugin;
}