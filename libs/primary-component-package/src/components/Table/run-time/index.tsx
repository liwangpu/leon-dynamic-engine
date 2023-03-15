import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import { Table as AntdTable } from 'antd';
import React, { memo, useMemo } from 'react';
import { ITableComponentConfiguration } from '../../../models';
import { faker } from '@faker-js/faker';
import styles from './index.module.less';

const Table: React.FC<IDynamicComponentProps<ITableComponentConfiguration>> = memo(props => {

  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();
  // const OperatorColumn = useMemo(() => {
  //   if (!conf.operatorColumn || !conf.operatorColumn.length) { return null; }
  //   return conf.operatorColumn.map(c => (<Button key={c.id} type="text" size='small'>{c.title}</Button>))
  // }, [conf.operatorColumn]);

  const Operators = useMemo(() => {
    if (!conf.operators || !conf.operators.length) { return null; }
    return conf.operators.map(c => (<DynamicComponent key={c.id} configuration={c} />))
  }, [conf.operators]);

  const columns = useMemo<Array<{ [key: string]: any }>>(() => {
    if (!conf.columns?.length) { return []; }
    const columns: Array<{ [key: string]: any }> = conf.columns.map(c => ({
      key: c.id,
      dataIndex: c.id,
      title: c.title,
    }));

    const commandCol = {
      title: '操作',
      key: 'command',
      fixed: 'right',
      width: 160,
      render: () => (
        <>
          {/* {OperatorColumn} */}
        </>
      ),
    };

    columns.push(commandCol);

    return columns;
  }, [conf.columns]);

  const dataSource = useMemo<Array<{ [key: string]: any }>>(() => {
    const datas = [];
    if (conf.columns?.length) {
      const data = { key: faker.datatype.uuid() };
      conf.columns.forEach(c => {
        data[c.id] = '-';
      });
      datas.push(data);
    }
    return datas;
  }, [conf.columns]);

  return (
    <div className={styles['table']}>
      <div className={styles['table__operators']}>{Operators}</div>
      <AntdTable columns={columns} dataSource={dataSource} />
    </div>
  );
});

Table.displayName = 'Table';

export default Table;