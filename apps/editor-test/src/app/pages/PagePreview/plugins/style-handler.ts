import { GRID_SYSTEM_SECTION_TOTAL, RendererPluginRegister } from '@lowcode-engine/renderer';
import { IFormItemConfiguration } from '@lowcode-engine/primary-component-package';

export function StyleHandlerPluginRegister(): RendererPluginRegister {

  return ({ style }) => {
    return {
      init() {

        style.registerHandler({ type: null }, ({ current }: { current: IFormItemConfiguration }) => {
          const _style: { [key: string]: any } = {};
          if (current.width) {
            _style['width'] = current.width;
          }

          if (current.fullHeight) {
            _style['flex'] = '1 0 auto';
            _style['height'] = '0';
          } else {
            if (current.height) {
              _style['height'] = current.height;
            }
          }

          if (current.gridRowSpan) {
            _style['gridRow'] = `span ${current.gridRowSpan}`;
            _style['minHeight'] = `${current.gridRowSpan * 60}px`;
          }

          if (current.gridColumnSpan) {
            let sec = GRID_SYSTEM_SECTION_TOTAL;
            try {
              const fn = new Function(`return ${current.gridColumnSpan}`);
              sec = fn() * GRID_SYSTEM_SECTION_TOTAL;
            } catch (err) {
              console.error(`gridColumnStart转化失败,数值信息为${current.gridColumnSpan}`);
            }
            _style['gridColumnStart'] = `span ${sec}`;
          }

          return _style;
        });

      },
    };
  };
}