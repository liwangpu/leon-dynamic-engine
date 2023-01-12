import React, { memo, useState } from 'react';
import styles from './index.module.less';
import RealTimeRenderer from '../../components/RealTimeRenderer';
import { IComponentConfiguration, IProjectSchema } from '@tiangong/core';
import { Button } from 'antd';

const INITIAL_SCHEMA: IComponentConfiguration = {
  id: 'p1',
  type: 'detail-page',
  title: '测试页面',
  operators: [
    {
      id: 'b1',
      type: 'button',
      title: '按钮1'
    }
  ],
  children: [
    {
      id: 'block1',
      type: 'block',
      title: '基础信息',
      columns: 2,
      children: [
        {
          id: 'text1',
          type: 'text',
          field: 'name',
          title: '姓名'
        },
        {
          id: 'number1',
          type: 'number',
          field: 'age',
          title: '年纪'
        },
        {
          id: 'number2',
          type: 'number',
          field: 'height',
          title: '身高'
        },
        {
          id: 'text2',
          type: 'text',
          field: 'remark',
          title: '备注'
        }
      ]
    }
  ],
  // rules: [
  //   {
  //     field: 'age',
  //     operator: '>=',
  //     value: 12,
  //     sub: [
  //       {
  //         field: 'height',
  //         operator: '>=',
  //         value: 160,
  //         interactions: [
  //           {
  //             type: 'hideField',
  //             effectedField: 'remark'
  //           }
  //         ]
  //       }
  //     ]
  //   }
  // ]
};

const FULL_PAGE_CACHE_KEY = 'full-page-schema';

const EditorPage: React.FC = memo(() => {

  const getSchemaCache = () => {
    const str = localStorage.getItem(FULL_PAGE_CACHE_KEY);
    if (str) {
      return JSON.parse(str);
    }
    return INITIAL_SCHEMA;
  };

  const setSchemaCache = (val: IProjectSchema) => {
    localStorage.setItem('full-page', JSON.stringify(val));
    setSchema(val);
  };

  const clearSchemaCache = () => {
    localStorage.removeItem(FULL_PAGE_CACHE_KEY);
    setSchema(getSchemaCache());
  };

  const [schema, setSchema] = useState<IProjectSchema>(getSchemaCache());
  const hasCache = !!localStorage.getItem(FULL_PAGE_CACHE_KEY);

  return (
    <div className={styles['page']}>
      <div className={styles['page__header']}>
        <Button type="primary" size='small' danger disabled={!hasCache} onClick={clearSchemaCache}>清除缓存</Button>
      </div>
      <div className={styles['page__content']}>
        <RealTimeRenderer value={schema} onChange={setSchemaCache} />
      </div>
    </div>
  );
});

EditorPage.displayName = 'EditorPage';

export default EditorPage;
