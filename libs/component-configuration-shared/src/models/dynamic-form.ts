import { IConfigurationPackageModule } from '@lowcode-engine/core';
import { ISetterPanelContext } from '@lowcode-engine/editor';
import { ISetter, ISetterMetadataGenerator } from './i-setter';
import { initSetter } from '../components/setters';

const SHARED_DYNAMIC_FORM_INSTANCE = '__lce__shared_dynamic_form_instance';

export class DynamicForm {

  private static _instance: DynamicForm;
  private readonly metadataRegedit = new Map<string, ISetterMetadataGenerator>();
  private readonly setterRegedit = new Map<string, React.FC>();
  private constructor() {
    //       
  }

  public static get instance(): DynamicForm {
    // TODO: 在webpack hmr模式下,DynamicForm无法保持单例模式,先用window存储实例,临时处理,待后面研究
    if (!this._instance) {
      // @ts-ignore
      if (!window[SHARED_DYNAMIC_FORM_INSTANCE]) {
        this._instance = new DynamicForm();
        initSetter();
        // @ts-ignore
        window[SHARED_DYNAMIC_FORM_INSTANCE] = this._instance;
      } else {
        // @ts-ignore
        this._instance = window[SHARED_DYNAMIC_FORM_INSTANCE];
      }
    }
    return this._instance;
  }

  public static destroy() {
    // if (this._instance) {
    //   this._instance.metadataRegedit.clear();
    //   this._instance.setterRegedit.clear();
    //   this._instance = null as any;
    // }
  }

  public async loadForm(): Promise<IConfigurationPackageModule> {
    return import('../components/DynamicForm');
  }

  public registerMetadata(context: ISetterPanelContext, metaGenerator: ISetterMetadataGenerator): void {
    const key = DynamicForm.getMetadataRegeditKey(context);
    this.metadataRegedit.set(key, metaGenerator);
  }

  public registerSetter(type: string, Component: React.FC<any>): void {
    this.setterRegedit.set(type, Component);
  }

  public getMetadata(context: ISetterPanelContext): ISetterMetadataGenerator | undefined {
    const key = DynamicForm.getMetadataRegeditKey(context);
    return this.metadataRegedit.get(key);
  }

  public getSetter(type: string): React.FC | undefined {
    if (!type) { return; }
    return this.setterRegedit.get(type);
  }

  private static getMetadataRegeditKey(context: ISetterPanelContext) {
    let key = `type:${context.type}`;
    if (context.parentType) {
      key += `/parentType:${context.parentType}`;
    }
    if (context.slot) {
      key += `/slot:${context.slot}`;
    }
    return key;
  };
}
