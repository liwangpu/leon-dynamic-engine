import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import React, { memo, useMemo } from 'react';
import classnames from 'classnames';
import { ITableComponentConfiguration } from '../../models';
import styles from './index.module.less';
import { TableFeature, TableSelectionMode } from '../../enums';
import { Checkbox, Radio } from 'antd';

const Table: React.FC<IDynamicComponentProps<ITableComponentConfiguration>> = memo(props => {

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
    if (!conf.operatorColumn || !features.enableOperator) { return null; }
    return (
      <DynamicComponent configuration={conf.operatorColumn} />
    );
  }, [conf.operatorColumn, features.enableOperator]);

  const SelectionColumn = useMemo(() => {
    if (!conf.selectionColumn) { return null; }
    return (
      <CustomRenderDynamicComponent configuration={conf.selectionColumn}>
        <div className={classnames(
          styles['custom-column'],
          styles['custom-column--line-number']
        )}>
          <div className={classnames(
            styles['col'],
            'line-number-col'
          )}>
            <div className={styles['col__header']}>
              {conf.selectionColumn.selectionMode === TableSelectionMode.multiple ? (
                <Checkbox></Checkbox>
              ) : null}
            </div>
            <div className={classnames(
              styles['col__content'],
              styles['col__content--data'],
            )}>
              {conf.selectionColumn.selectionMode === TableSelectionMode.multiple ? (
                <Checkbox></Checkbox>
              ) : (
                <Radio></Radio>
              )}
            </div>
          </div>
        </div>
      </CustomRenderDynamicComponent>
    )
  }, [conf.selectionColumn]);

  const SerialNumberColumn = useMemo(() => {
    if (!features.enableSerialNumberColumn) { return null; }
    if (!conf.serialNumberColumn) { return null; }
    return (
      <CustomRenderDynamicComponent configuration={conf.serialNumberColumn}>
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
      </CustomRenderDynamicComponent>
    )
  }, [conf.serialNumberColumn, features.enableSerialNumberColumn]);

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

  const Pagination = useMemo(() => {
    if (!conf.pagination || !features.enablePagination) { return null; }
    return (
      <DynamicComponent configuration={conf.pagination} />
    );
  }, [conf.pagination, features.enablePagination]);

  return (
    <div className={styles['table']}>
      <div className={styles['table__header']}>
        <p className={styles['table__title']}>{conf.title || '表格'}</p>
        <div className={styles['operators']} data-dynamic-component-container='operators' data-dynamic-container-direction='horizontal' data-dynamic-container-owner={conf.id}>
          {Operators}
        </div>
      </div>
      <div className={styles['table__content']}>
        {SelectionColumn}
        {SerialNumberColumn}
        <div className={styles['columns']} data-dynamic-component-container='columns' data-dynamic-container-direction='horizontal' data-dynamic-container-owner={conf.id}>
          {Columns}
        </div>
        {OperatorColumn}
      </div>
      <div className={styles['table__footer']}>
        {Pagination}
      </div>
    </div>
  );
});

Table.displayName = 'Table';

export default Table;