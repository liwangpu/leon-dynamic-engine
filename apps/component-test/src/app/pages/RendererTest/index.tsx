import React, { memo, useContext, useMemo, useState } from 'react';
import styles from './index.module.less';
import { IComponentConfiguration, IProjectSchema } from '@lowcode-engine/core';
import { Button } from 'antd';
import { RendererPluginRegister, Renderer, GRID_SYSTEM_SECTION_TOTAL } from '@lowcode-engine/renderer';
import { ComponentPackageContext } from '../../contexts';

const INITIAL_SCHEMA: IComponentConfiguration = {
  id: 'p1',
  type: 'detail-page',
  title: '测试页面',
  width: '100%',
  height: '100%',
  children: [
    {
      id: 'block1',
      type: 'block',
      title: '基础信息',
      children: [
        {
          id: 'text1',
          type: 'text',
          field: 'name',
          title: '姓名',
          gridColumnSpan: '1/2'
        },
        {
          id: 'number1',
          type: 'number',
          field: 'age',
          title: '年纪',
          gridColumnSpan: '1/2'
        },
        {
          id: 'number2',
          type: 'number',
          field: 'height',
          title: '身高',
          gridColumnSpan: '1/2'
        },
        {
          id: 'text2',
          type: 'text',
          field: 'remark',
          title: '备注',
          gridColumnSpan: '1/2'
        }
      ]
    }
  ],
};

const Page: React.FC = memo(() => {

  const packages = useContext(ComponentPackageContext);
  const [schema, setSchema] = useState<IProjectSchema>(INITIAL_SCHEMA);

  const plugins = useMemo<Array<RendererPluginRegister>>(() => {
    return [
      ({ project, style }) => {
        return {
          init() {
            style.registerHandler({ type: null }, ({ current }) => {
              const _style: { [key: string]: any } = {};
              if (current.width) {
                _style['width'] = current.width;
              }
    
              if (current.fullHeight) {
                _style['flex'] = '1 0 auto';
                _style['height'] = '0';
              } else if (current.height) {
                _style['height'] = current.height;
              }
    
              if (current.gridRowSpan) {
                _style['gridRow'] = `span ${current.gridRowSpan}`;
                _style['minHeight'] = `${current.gridRowSpan * 60}px`;
              }
    
              if (current.gridColumnSpan) {
                let sec = GRID_SYSTEM_SECTION_TOTAL;
                try {
                  // eslint-disable-next-line no-new-func
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
      }
    ];
  }, []);

  return (
    <div className={styles['page']}>
      <div className={styles['page__header']}>
        <Button type="primary" size='small' danger >清除缓存</Button>
      </div>
      <div className={styles['page__content']}>
        <Renderer schema={schema} packages={packages} plugins={plugins} />
      </div>
    </div>
  );
});

Page.displayName = 'Page';

export default Page;
