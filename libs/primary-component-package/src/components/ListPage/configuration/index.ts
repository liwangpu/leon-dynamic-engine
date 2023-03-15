import { IMetadataRegister } from '@lowcode-engine/component-configuration-shared';
import { SetterType } from '@lowcode-engine/dynamic-form';
import { ComponentTypes, PrimarySetterType } from '../../../enums';

const registerMetadata: IMetadataRegister = add => {

  add({
    type: ComponentTypes.listPage
  }, async () => {

    return {
      children: [
        {
          key: 'tabs',
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
                      setter: PrimarySetterType.componentType,
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
                    }
                  ],
                },
              ]
            },
          ]
        }
      ]
    };
  });
};

export default registerMetadata;