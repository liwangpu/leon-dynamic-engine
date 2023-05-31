import { EditorPluginRegister } from '@lowcode-engine/editor';
import { ComponentTypes, ITabComponentConfiguration, ITabsComponentConfiguration } from '@lowcode-engine/primary-component-package';

export function ConfigurationDeleteEffectPluginRegister(): EditorPluginRegister {

  return ({ configurationDeleteEffect, configuration, store }) => {
    return {
      init() {
        configurationDeleteEffect.registerHandler({ type: ComponentTypes.tab, count: 1 }, () => {
          alert('最后一个页签不能删除');
          return false;
        },
          ({ current, parent }: { current: ITabComponentConfiguration, parent: ITabsComponentConfiguration }) => {
            // 如果当前的页签是默认页签,那么需要把多页签组件默认页签信息更新
            // if (current.isDefault) {
            //   const firstTab = parent.children[0];

            //   configuration.updateComponents([
            //     ({ id: parent.id, type: parent.type, defaultActiveTab: firstTab.id } as Partial<ITabsComponentConfiguration>),
            //     ({ id: firstTab.id, type: firstTab.type, isDefault: true } as Partial<ITabComponentConfiguration>),
            //   ]);
            // }

            // console.log(`current:`,current);
          });

        configurationDeleteEffect.registerHandler(
          { type: ComponentTypes.tab },
          null,
          ({ current, parent }: { current: ITabComponentConfiguration, parent: ITabsComponentConfiguration }) => {
            if (parent.children?.length) {

              const defaultTab = parent.children.find(c => c.isDefault) || parent.children[0];
              if (defaultTab) {
                store.state.setState(parent.id, 'activeKey', defaultTab.id);
              }

              configuration.updateComponents([
                ({
                  id: defaultTab.id,
                  type: defaultTab.type,
                  isDefault: true,
                } as ITabComponentConfiguration),
                ({
                  id: parent.id,
                  type: parent.type,
                  defaultActiveTab: defaultTab.id,
                } as ITabsComponentConfiguration),
              ]);
            }
          });
      }
    };
  };
}