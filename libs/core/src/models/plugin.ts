
export interface IPlugin {
  init(): void;
  destroy?(): void;
}

export interface IPluginRegister<Context = any> {
  (context: Context): IPlugin;
}