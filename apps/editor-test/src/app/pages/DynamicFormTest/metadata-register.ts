import { DynamicForm, SetterType, ISetter as IPrimarySetter, IBaseSetter } from '@lowcode-engine/component-configuration-shared';
import { ComponentTypes } from '@lowcode-engine/primary-component-package';

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
      ]
    };
  });

  DynamicForm.instance.registerMetadata({
    type: ComponentTypes.button
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
                // {
                //   setter: MySetterType.custom1,
                //   name: 'cus1',
                //   label: '自定义',
                //   lksdf: 'sdfds'
                // }
              ]
            },
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
          title: '属性',
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
                      setter: SetterType.stringSetter,
                      name: 'title',
                      label: '标题',
                      required: true
                    },
                    {
                      setter: SetterType.listSetter,
                      name: 'users',
                      label: '用户',
                      itemSetter: 'custom-list-item',
                    },
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
  });
}