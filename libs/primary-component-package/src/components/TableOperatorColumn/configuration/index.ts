import { IMetadataRegister, SharedSetterType } from '@lowcode-engine/component-configuration-shared';
import { SetterType } from '@lowcode-engine/dynamic-form';
import { ComponentTypes } from '../../../enums';

const registerMetadata: IMetadataRegister = register => {

  register({
    type: ComponentTypes.tableOperatorColumn,
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
                      setter: SharedSetterType.componentType,
                      name: 'type',
                      label: '组件类型',
                      required: true,
                      disabled: true,
                    },
                    {
                      key: 'tileButtonCount',
                      setter: SetterType.number,
                      name: 'tileButtonCount',
                      label: '默认显示按钮数量',
                    },
                  ]
                },
              ],
            },
          ],
        },
      ],
    };
  });
};

export default registerMetadata;