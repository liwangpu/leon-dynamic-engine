import React, { memo, useEffect, useLayoutEffect, useState } from 'react';
import { faker } from '@faker-js/faker';
import styles from './index.module.less';
import RealTimeRenderer from '../../components/RealTimeRenderer';
import { IComponentConfiguration } from '@tiangong/core';

const INITIAL_SCHEMA: IComponentConfiguration = {
  id: 'table1',
  type: 'table',
  title: '表格',
  operators: [
    {
      id: 'b1',
      type: 'button',
      title: '保存'
    }
  ],
  columns: [
    {
      id: 't1',
      type: 'text',
      title: '姓名'
    }
  ]
};

const TableTest: React.FC = memo(() => {

  const [schema, setSchema] = useState<IComponentConfiguration>(INITIAL_SCHEMA);

  return (
    <div className={styles['page']}>
      <div className={styles['page__header']}>

      </div>
      <div className={styles['page__content']}>
        <RealTimeRenderer value={schema} onChange={setSchema} />
      </div>
    </div>
  );
});

TableTest.displayName = 'TableTest';

export default TableTest;