import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import { Button, Table as AntdTable } from 'antd';
import React, { memo, useMemo } from 'react';
import { ITableComponentConfiguration } from '../../../models';
import { faker } from '@faker-js/faker';
import styles from './index.module.less';
import { TableSelectionMode } from '../../../enums';

const Table: React.FC<IDynamicComponentProps<ITableComponentConfiguration>> = memo(props => {

  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentFactory();
  const OperatorColumn = useMemo(() => {
    if (!conf.operatorColumn || !conf.operatorColumn.children) { return null; }
    return conf.operatorColumn.children.map(c => (<Button key={c.id} type="text" size='small'>{c.title}</Button>))
  }, [conf.operatorColumn]);

  const getRowSelection = () => {
    if (!conf.selectionColumn) { return null; }
    return {
      type: conf.selectionColumn.selectionMode === TableSelectionMode.multiple ? 'checkbox' : 'radio' as any,
      onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: (record: any) => ({
        // disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
  };



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
          {OperatorColumn}
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
      <AntdTable
        rowSelection={getRowSelection()}
        columns={columns}
        dataSource={dataSource}
      />
    </div>
  );
});

Table.displayName = 'Table';

export default Table;