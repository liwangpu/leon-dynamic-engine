import { IMetadataRegister, SharedSetterType } from '@lowcode-engine/component-configuration-shared';
import { SetterType } from '@lowcode-engine/dynamic-form';
import { ComponentTypes, TableSelectionMode } from '../../../enums';

const registerMetadata: IMetadataRegister = register => {

  register({
    type: ComponentTypes.tableSelectionColumn,
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
                      key: 'selectionMode',
                      setter: SetterType.radio,
                      name: 'selectionMode',
                      label: '选择方式',
                      data: [
                        { value: TableSelectionMode.single, label: '单选' },
                        { value: TableSelectionMode.multiple, label: '多选' },
                      ]
                    },
                  ],
                }
              ],
            },
          ],
        },
      ],
    };
  });
};

export default registerMetadata;