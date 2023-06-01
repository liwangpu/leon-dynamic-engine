import { EditorPluginRegister } from '@lowcode-engine/editor';
import { ComponentTypes, ITabComponentConfiguration, ITabsComponentConfiguration } from '@lowcode-engine/primary-component-package';
import { notification } from 'antd';

export function ConfigurationDeleteEffectPluginRegister(): EditorPluginRegister {

  return ({ configurationDeleteEffect, configuration, store }) => {
    return {
      init() {
        configurationDeleteEffect.registerHandler({ type: ComponentTypes.tab, count: 1 }, () => {
          notification.open({
            message: '温馨提示',
            description: '至少保留一个页签不能删除',
            placement: 'bottomRight',
          });
          return false;
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