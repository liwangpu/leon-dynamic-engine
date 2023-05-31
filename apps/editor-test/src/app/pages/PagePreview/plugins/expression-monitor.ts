import { IExpressionEffect, RendererPluginRegister } from '@lowcode-engine/renderer';
import { CommonSlot, ComponentTypes, IButtonComponentConfiguration } from '@lowcode-engine/primary-component-package';

export function ExpressionMonitorPluginRegister(): RendererPluginRegister {

  return ({ expression }) => {
    return {
      init() {

        expression.registerMonitor(
          { type: ComponentTypes.button, parentType: [ComponentTypes.listPage, ComponentTypes.detailPage], slot: CommonSlot.operators },
          ({ current }: { current: IButtonComponentConfiguration }) => {

            const effects: Array<IExpressionEffect> = [];
      
            if (current.enableBindTabs && current.bindTabs && current.bindTabs.length) {
              for (const tabId of current.bindTabs) {
                const exp: any = {
                  key: `button_bind_tab_visible@btn:${current.id}@tab:${tabId}`,
                  componentId: current.id,
                  expression: `
                  const tabId='${tabId}';
                  const tabs=this.getParent(tabId);
                  if(!tabs){
                    return true;
                  }
                  return this.getState(tabs.id,'activeKey')===tabId;
                  `,
                  target: current.id,
                  property: 'visible',
                  rank: 1
                };
      
                effects.push(exp);
              }
            }
      
            return effects;
          }
        );

      },
    };
  };
}