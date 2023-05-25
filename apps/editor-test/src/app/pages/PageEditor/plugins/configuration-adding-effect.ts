import { GenerateComponentCode, GenerateComponentId } from '@lowcode-engine/core';
import { IPluginRegister } from '@lowcode-engine/editor';
import { ComponentTypes, GridSystemSection, ITableComponentConfiguration, ITabsComponentConfiguration } from '@lowcode-engine/primary-component-package';
import { buttonGroupTypes, ComponentIndexTitleIncludeGroupTypes, FormInputGroupTypes, selfSlotGroupTypes } from '../../../consts';
import { useComponentConfigGenerator } from '../../../hooks';

/**
 * 组件添加副作用注册插件
 * @param options 
 * @returns 
 */
export function ConfigurationAddingEffectPluginRegister(options: { confGenerator: ReturnType<typeof useComponentConfigGenerator> }): IPluginRegister {

  return ({ configurationAddingEffect, configuration }) => {
    return {
      init() {
        // configurationAddingEffect.registerHandler({ parentType: ComponentTypes.block, first: true }, ({ current, first, last, index, even, odd, count }) => {
        //   console.log(`--------------------- block 1 ---------------------`);
        //   console.log(`title:`, current.title, current.type);
        //   console.log(`first:`, first);
        //   console.log(`last:`, last);
        //   console.log(`even:`, even);
        //   console.log(`odd:`, odd);
        //   console.log(`index:`, index);
        //   console.log(`count:`, count);
        //   if (current.type === ComponentTypes.number) {
        //     showMessage('区块里面的第一个不能是数字输入框');
        //     return null;
        //   }
        //   // showMessage('区块里面的内容不能超过3个');
        //   return current;
        // });

        // configurationAddingEffect.registerHandler({ parentType: ComponentTypes.block, count: 4 }, ({ current, first, last, index, even, odd, count }) => {
        //   console.log(`--------------------- block 2 ---------------------`);
        //   // console.log(`title:`, current.title);
        //   // console.log(`first:`, first);
        //   // console.log(`last:`, last);
        //   // console.log(`even:`, even);
        //   // console.log(`odd:`, odd);
        //   // console.log(`index:`, index);
        //   // console.log(`count:`, count);
        //   showMessage('区块里面的内容不能超过3个');
        //   return null;
        // });

        configurationAddingEffect.registerHandler({ parentType: ComponentTypes.block, type: FormInputGroupTypes }, ({ current }) => {
          // eslint-disable-next-line no-param-reassign
          current.gridColumnSpan = GridSystemSection['1/2'];
          return current;
        });

        configurationAddingEffect.registerHandler({ parentType: ComponentTypes.block, type: ComponentTypes.textarea }, ({ current }) => {
          // eslint-disable-next-line no-param-reassign
          current.gridRowSpan = 3;
          return current;
        });

        configurationAddingEffect.registerHandler({ type: ComponentTypes.table, }, async ({ current }: { current: ITableComponentConfiguration }) => {
          let initialTableConf: Partial<ITableComponentConfiguration> = await options.confGenerator.generateTable();
          return { ...initialTableConf, ...current };
        }
        );

        configurationAddingEffect.registerHandler({ type: ComponentTypes.tabs }, ({ current }: { current: ITabsComponentConfiguration }) => {
          current.children = [
            {
              id: GenerateComponentId(ComponentTypes.tab),
              type: ComponentTypes.tab,
              title: '页签 1',
              isDefault: true
            },
            {
              id: GenerateComponentId(ComponentTypes.tab),
              type: ComponentTypes.tab,
              title: '页签 2',
            },
            {
              id: GenerateComponentId(ComponentTypes.tab),
              type: ComponentTypes.tab,
              title: '页签 3',
            },
          ];

          current.defaultActiveTab = current.children[0].id;
          current.direction = 'horizontal';
          current.fullHeight = true;
          return current;
        });

        // configurationAddingEffect.registerHandler({ type: VideoPlayerComponentTypes.videoPlayer }, ({ current }: { current: IVideoPlayerComponentConfiguration }) => {
        //   current.vedioUrl = 'https://www.runoob.com/try/demo_source/movie.ogg';
        //   return current;
        // });

        configurationAddingEffect.registerHandler({}, ({ current }) => {
          const typeCount = configuration.getComponentTypeCount(current.type);
          // eslint-disable-next-line no-param-reassign
          if (!current.code) {
            current.code = GenerateComponentCode(current.type);
          }
          if (ComponentIndexTitleIncludeGroupTypes.has(current.type)) {
            if (current.title) {
              // 取出组件标题,如果后面一位不是数字,加上数字标识
              const lastChar = current.title[current.title.length - 1];
              const isIndex = !isNaN(parseInt(lastChar));
              if (!isIndex) {
                current.title = `${current.title} ${typeCount + 1}`;
              }
            }
          }
          return current;
        });

      }
    };
  };
}