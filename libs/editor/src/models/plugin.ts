import { IEditorContext } from './editor-manager';

export interface IPlugin {
  init(): void;
  destroy?(): void;
}

export interface IPluginRegister {
  (context: IEditorContext): IPlugin;
}