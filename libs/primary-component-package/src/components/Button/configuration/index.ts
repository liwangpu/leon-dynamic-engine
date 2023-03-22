import { IMetadataRegister, SharedSetterType } from '@lowcode-engine/component-configuration-shared';
import { SetterType } from '@lowcode-engine/dynamic-form';
import { ComponentTypes, PrimarySetterType } from '../../../enums';

const registerMetadata: IMetadataRegister = register => {

  register({
    type: ComponentTypes.button,
  }, async () => {

    return {
      children: [
        {
          key: 'tabs',
          setter: SetterType.tabs,
          children: [
            {
              key: 'event',
              setter: SetterType.tabPane,
              label: '事件',
              children: [
                {
                  key: 'event',
                  setter: SetterType.group,
                  name: 'event',
                  children: [
                    {
                      key: 'click',
                      name: 'click',
                      setter: SetterType.group,
                      label: '单击事件',
                      children: [
                        {
                          key: 'before',
                          setter: SetterType.group,
                          name: 'before',
                          children: [
                            {
                              key: 's1',
                              setter: SetterType.secondaryHeading,
                              label: '执行前',
                              children: [
                                {
                                  key: 'enablePrompt',
                                  setter: SetterType.boolean,
                                  name: 'enablePrompt',
                                  label: '启用操作提示',
                                },
                                {
                                  key: 'prompt',
                                  setter: SetterType.string,
                                  name: 'prompt',
                                  label: '操作提示',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          key: 'execute',
                          name: 'execute',
                          setter: SetterType.group,
                          children: [
                            {
                              key: 's1',
                              setter: SetterType.secondaryHeading,
                              label: '执行中',
                              children: [
                                {
                                  key: 'actions',
                                  name: 'actions',
                                  setter: SetterType.list,
                                  sortable: true,
                                  listItem: PrimarySetterType.buttonActionItem,
                                  listFooter: PrimarySetterType.buttonActionListFooter,
                                },
                              ],
                            },
                          ],
                        },
                        {
                          key: 'after',
                          name: 'after',
                          setter: SetterType.group,
                          children: [
                            {
                              key: 's1',
                              setter: SetterType.secondaryHeading,
                              label: '执行后',
                              children: [
                                {
                                  key: 'enablePrompt',
                                  setter: SetterType.boolean,
                                  name: 'enablePrompt',
                                  label: '提示成功',
                                },
                                {
                                  key: 'prompt',
                                  setter: SetterType.string,
                                  name: 'prompt',
                                  label: '成功提示',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
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
                  ],
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