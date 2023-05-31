import { IMetadataRegister, SharedSetterType } from '@lowcode-engine/component-configuration-shared';
import { SetterType } from '@lowcode-engine/dynamic-form';
import { ITabComponentConfiguration, ITabsComponentConfiguration } from '../../../models';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { SubSink } from 'subsink';
import { ComponentTypes } from '../../../enums';
import { IEditorContext } from '@lowcode-engine/editor';

const registerMetadata: IMetadataRegister = register => {

  register({
    type: ComponentTypes.tab
  }, async (editor: IEditorContext) => {
    const subs = new SubSink();
    return {
      children: [
        {
          key: 'tab',
          setter: SetterType.tabs,
          children: [
            {
              key: 'basic-info',
              setter: SetterType.tabPane,
              label: '属性',
              children: [
                {
                  key: 'basic-info',
                  setter: SetterType.primaryHeading,
                  label: '基础信息',
                  children: [
                    {
                      key: 'type',
                      setter: SharedSetterType.componentType,
                      name: 'type',
                      label: '组件类型',
                      disabled: true,
                    },
                    {
                      key: 'title',
                      setter: SetterType.string,
                      name: 'title',
                      label: '标题',
                      required: true,
                    },
                    {
                      key: 'code',
                      setter: SetterType.string,
                      name: 'code',
                      label: '编码',
                    },
                    {
                      key: 'isDefault',
                      setter: SetterType.boolean,
                      name: 'isDefault',
                      label: '默认页签',
                    },
                  ],
                },
              ]
            },
          ]
        }
      ],
      onLoad: async (config: ITabComponentConfiguration, obs: Observable<ITabComponentConfiguration>) => {
        // subs.sink = obs
        //   .pipe(map(c => c.isDefault))
        //   .pipe(distinctUntilChanged())
        //   .subscribe((isDefault: boolean) => {
        //     const { id } = config;
        //     const { store } = editor;
        //     const parentId = store.treeStore.selectComponentParentId(id);
        //     const parentConfig = store.configurationStore.configurations.get(parentId);
        //     const { origin: { defaultActiveTab } } = parentConfig as ITabsComponentConfiguration;

        //     if (isDefault) {
        //       if (defaultActiveTab !== id) {
        //         editor.configuration.updateComponents([
        //           { id: parentId, defaultActiveTab: id, type: ComponentTypes.tabs },
        //           { id: defaultActiveTab, isDefault: false, type: ComponentTypes.tab },
        //         ]);
        //       }
        //     } 
            
        //   });
      },
      onDestroy: async () => {
        subs.unsubscribe();
      },
    };
  });
};

export default registerMetadata;