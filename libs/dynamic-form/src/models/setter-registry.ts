import { initSetter } from '../components/setters';

const SETTER_REGISTRY_INSTANCE = '__lce__setter_registry_instance';

export class SetterRegistry {

  private readonly setterRegedit = new Map<string, React.FC>();
  private static _instance: SetterRegistry;
  private constructor() {
    //
  }

  public static get instance(): SetterRegistry {
    // TODO: 在webpack hmr模式下,DynamicForm无法保持单例模式,先用window存储实例,临时处理,待后面研究
    if (!this._instance) {
      // @ts-ignore
      if (!window[SETTER_REGISTRY_INSTANCE]) {
        this._instance = new SetterRegistry();
        initSetter();
        // @ts-ignore
        window[SETTER_REGISTRY_INSTANCE] = this._instance;
      } else {
        // @ts-ignore
        this._instance = window[SETTER_REGISTRY_INSTANCE];
      }
    }
    return this._instance;
  }

  public registerSetter(type: string, Component: React.FC<any>): void {
    this.setterRegedit.set(type, Component);
  }

  public getSetter(type: string): React.FC | undefined {
    if (!type) { return; }
    return this.setterRegedit.get(type);
  }

}