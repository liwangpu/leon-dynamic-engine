import { IDynamicComponentProps, useDynamicComponentEngine } from '@tiangong/core';
import { observer } from 'mobx-react-lite';
import React, { memo, useMemo } from 'react';
import classnames from 'classnames';
import { ITableComponentConfiguration } from '../../models';
import styles from './index.module.less';

const Table: React.FC<IDynamicComponentProps<ITableComponentConfiguration>> = memo(observer(props => {

  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();
  const CustomRenderDynamicComponent = dynamicEngine.getCustomComponentRenderFactory();

  const Operators = useMemo(() => {
    if (!conf.operators || !conf.operators.length) { return null; }
    return conf.operators.map(c => (<DynamicComponent key={c.id} configuration={c} />))
  }, [conf.operators]);

  const OperatorColumn = useMemo(() => {
    if (!conf.operatorColumn || !conf.operatorColumn.length) { return null; }
    return conf.operatorColumn.map(c => (<DynamicComponent key={c.id} configuration={c} />))
  }, [conf.operatorColumn]);

  const Columns = useMemo(() => {
    if (!conf.columns || !conf.columns.length) { return null; }
    return conf.columns.map(c => (
      <CustomRenderDynamicComponent key={c.id} configuration={c}>
        <div className={styles['col']} data-dynamic-component={c.id} title={c.title}>
          <div className={styles['col__header']}>{c.title}</div>
          <div className={classnames(
            styles['col__content'],
            styles['col__content--data'],
          )}>-</div>
        </div>
      </CustomRenderDynamicComponent>
    ));
  }, [conf.columns]);

  return (
    <div className={styles['table']} data-dynamic-component={conf.id}>
      <div className={styles['table__header']}>
        <p className={styles['table__title']}>{conf.title || '表格'}</p>
        <div className={styles['operators']} data-dynamic-component-container='operators' data-dynamic-container-direction='horizontal' data-dynamic-container-owner={conf.id}>
          {Operators}
        </div>
      </div>
      <div className={styles['table__content']}>
        <div className={styles['columns']} data-dynamic-component-container='columns' data-dynamic-container-direction='horizontal' data-dynamic-container-owner={conf.id}>
          {Columns}
        </div>
        <div className={styles['operator-column']}>
          <div className={classnames(
            styles['col'],
            styles['col--operator'],
          )}>
            <div className={classnames(
              styles['col__header'],
              styles['col__header--operator']
            )}>操作</div>
            <div className={classnames(
              styles['col__content'],
              styles['col__content--operator']
            )} data-dynamic-component-container='operatorColumn' data-dynamic-container-owner={conf.id}>
              {OperatorColumn}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}));

Table.displayName = 'Table';

export default Table;