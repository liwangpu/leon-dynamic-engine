import { DynamicForm, SetterType, ISetter as IPrimarySetter, IBaseSetter } from '@lowcode-engine/component-configuration-shared';
import { ComponentTypes } from '@lowcode-engine/primary-component-package';
import { CustomListItem, CustomListFooter } from './setters';

enum MySetterType {
  custom1 = 'custom-1'
};

export interface ICustom1TypeSetter extends IBaseSetter {
  setter: MySetterType.custom1;
}

export default function registerMetadata(): void {
  DynamicForm.instance.registerMetadata({
    type: ComponentTypes.block
  }, async () => {

    return {
      tabs: [
        {
          title: '属性',
          children: [
            {
              setter: SetterType.primaryHeadingSetter,
              title: '基本信息',
              children: [
                {
                  setter: SetterType.stringSetter,
                  name: 'title',
                  label: '标题',
                  required: true
                },
                {
                  setter: SetterType.stringSetter,
                  name: 'code',
                  label: '编码',
                }
              ]
            },
          ]
        }
      ],
      onLoad: async (conf) => {
        console.log(`load`);
      },
      onDestroy: async () => {
        console.log(`destroy`);
      }
    };
  });

  DynamicForm.instance.registerMetadata({
    type: ComponentTypes.button
  }, async () => {
    return {
      tabs: [
        {
          title: '属性',
          children: [
            {
              setter: SetterType.primaryHeadingSetter,
              title: '基本信息',
              children: [
                {
                  setter: SetterType.stringSetter,
                  name: 'title',
                  label: '标题',
                  required: true
                },
                {
                  setter: SetterType.stringSetter,
                  name: 'code',
                  label: '编码',
                },
                {
                  setter: SetterType.numberSetter,
                  name: 'age',
                  label: '年纪',
                },
                {
                  setter: MySetterType.custom1,
                  name: 'cus1',
                  label: '自定义',
                  lksdf: 'sdfds'
                },

              ]
            },
          ]
        },
        {
          title: '事件',
          children: [
            {
              setter: SetterType.primaryHeadingSetter,
              title: '单击事件',
              children: [
                {
                  setter: SetterType.secondaryHeadingSetter,
                  title: '执行前',
                  children: [
                    {
                      setter: SetterType.stringSetter,
                      name: 'title',
                      label: '标题',
                      required: true
                    },
                  ]
                }
              ]
            }
          ]
        },
      ]
    };
  });

  DynamicForm.instance.registerMetadata({
    type: 'custom-component'
  }, async () => {

    return {
      tabs: [
        {
          title: '事件',
          children: [
            {
              setter: SetterType.primaryHeadingSetter,
              title: '单击事件',
              children: [
                {
                  setter: SetterType.secondaryHeadingSetter,
                  title: '执行中',
                  children: [
                    {
                      setter: SetterType.listSetter,
                      name: 'users',
                      label: '用户',
                      listItem: CustomListItem,
                      sortable: true,
                      dragHandle: '.drag-handle',
                      listFooter: CustomListFooter,
                    },
                  ]
                }
              ]
            }
          ]
        },
        {
          title: '属性',
          children: [
            {
              setter: SetterType.primaryHeadingSetter,
              title: '基本信息',
              children: [
                {
                  setter: SetterType.stringSetter,
                  name: 'title',
                  label: '标题',
                  required: true
                },
                {
                  setter: SetterType.stringSetter,
                  name: 'code',
                  label: '编码',
                },
                {
                  setter: SetterType.primaryHeadingSetter,
                  title: '教师信息',
                  children: [
                    {
                      setter: SetterType.groupSetter,
                      name: 'teacher',
                      children: [
                        {
                          setter: SetterType.stringSetter,
                          name: 'name',
                          label: '姓名',
                        },
                        {
                          setter: SetterType.stringSetter,
                          name: 'age',
                          label: '年纪',
                        },
                        {
                          setter: SetterType.groupSetter,
                          name: 'info',
                          children: [
                            {
                              setter: SetterType.secondaryHeadingSetter,
                              title: '附属信息',
                              children: [
                                {
                                  setter: SetterType.stringSetter,
                                  name: 'remark',
                                  label: '备注',
                                },
                              ]
                            },
                          ],
                        },
                      ]
                    },
                  ],
                },
              ]
            },
          ]
        },
      ]
    };
  });
}
