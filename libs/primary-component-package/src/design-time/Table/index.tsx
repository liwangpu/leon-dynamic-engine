import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import classnames from 'classnames';
import { ITableComponentConfiguration } from '../../models';
import styles from './index.module.less';
import { TableFeature } from '../../enums';

const Table: React.FC<IDynamicComponentProps<ITableComponentConfiguration>> = observer(props => {

  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();
  const CustomRenderDynamicComponent = dynamicEngine.getCustomComponentRenderFactory();

  const features = useMemo(() => {
    const s = new Set<TableFeature>(conf.features || []);
    return {
      enableOperator: s.has(TableFeature.operationColumn),
      enableSerialNumberColumn: s.has(TableFeature.serialNumberColumn),
      enablePagination: s.has(TableFeature.pagination)
    };
  }, [conf.features]);

  const Operators = useMemo(() => {
    if (!conf.operators || !conf.operators.length) { return null; }
    return conf.operators.map(c => (<DynamicComponent key={c.id} configuration={c} />))
  }, [conf.operators]);

  const OperatorColumn = useMemo(() => {
    if (!features.enableOperator) { return null; }
    if (!conf.operatorColumn || !conf.operatorColumn.length) { return null; }
    return conf.operatorColumn.map(c => (<DynamicComponent key={c.id} configuration={c} />))
  }, [conf.operatorColumn]);

  const Columns = useMemo(() => {
    if (!conf.columns || !conf.columns.length) { return null; }
    return conf.columns.map(c => (
      <CustomRenderDynamicComponent key={c.id} configuration={c}>
        <div className={styles['col']} title={c.title}>
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
    <div className={styles['table']}>
      <div className={styles['table__header']}>
        <p className={styles['table__title']}>{conf.title || '表格'}</p>
        <div className={styles['operators']} data-dynamic-component-container='operators' data-dynamic-container-direction='horizontal' data-dynamic-container-owner={conf.id}>
          {Operators}
        </div>
      </div>
      <div className={styles['table__content']}>
        {features.enableSerialNumberColumn && (
          <div className={classnames(
            styles['custom-column'],
            styles['custom-column--line-number']
          )}>
            <div className={classnames(
              styles['col'],
              'line-number-col'
            )}>
              <div className={styles['col__header']}>序号</div>
              <div className={classnames(
                styles['col__content'],
                styles['col__content--data'],
              )}>-</div>
            </div>
          </div>
        )}
        <div className={styles['columns']} data-dynamic-component-container='columns' data-dynamic-container-direction='horizontal' data-dynamic-container-owner={conf.id}>
          {Columns}
        </div>
        {features.enableOperator && (
          <div className={styles['custom-column']}>
            <div className={classnames(
              styles['col'],
              styles['col--operator'],
            )}>
              <div className={classnames(
                styles['col__header'],
                styles['col__header--operator']
              )}>
                <span>操作</span>
              </div>
              <div className={classnames(
                styles['col__content'],
                styles['col__content--operator']
              )} data-dynamic-component-container='operatorColumn' data-dynamic-container-owner={conf.id}>
                {OperatorColumn}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

Table.displayName = 'Table';

export default Table;