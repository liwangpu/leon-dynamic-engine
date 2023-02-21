import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import React, { memo, useMemo } from 'react';
import classnames from 'classnames';
import { ITableComponentConfiguration } from '../../models';
import styles from './index.module.less';
import { TableFeature } from '../../enums';

const Table: React.FC<IDynamicComponentProps<ITableComponentConfiguration>> = memo(props => {

  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();
  const CustomRenderDynamicComponent = dynamicEngine.getCustomComponentRenderFactory();

  // console.log(`table conf:`, conf);

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

  // const OperatorColumn = useMemo(() => {
  //   if (!features.enableOperator) { return null; }
  //   if (!conf.operatorColumn || !conf.operatorColumn.length) { return null; }
  //   return conf.operatorColumn.map(c => (<DynamicComponent key={c.id} configuration={c} />));
  // }, [conf.operatorColumn, features.enableOperator]);

  // const OperatorColumn = useMemo(() => {
  //   if (!features.enableOperator) { return null; }
  //   if (!conf.operatorColumn || !conf.operatorColumn.length) { return null; }
  //   return conf.operatorColumn.map(c => (<DynamicComponent key={c.id} configuration={c} />));
  // }, [conf.operatorColumn, features.enableOperator]);

  // const OperatorColumn = useMemo(() => {
  //   if (!features.enableOperator) { return null; }
  //   if (!conf.operatorColumn) { return null; }
  //   return (
  //     <CustomRenderDynamicComponent configuration={conf.operatorColumn}>
  //       <div className={styles['custom-column']}>
  //         <div className={classnames(
  //           styles['col'],
  //           styles['col--operator'],
  //         )}>
  //           <div className={classnames(
  //             styles['col__header'],
  //             styles['col__header--operator']
  //           )}>
  //             <span>操作</span>
  //           </div>
  //           <div className={classnames(
  //             styles['col__content'],
  //             styles['col__content--operator']
  //           )} data-dynamic-component-container='children' data-dynamic-container-owner={conf.operatorColumn.id}>
  //             {/* {OperatorColumn} */}
  //             {conf.operatorColumn.children&&conf.operatorColumn.children.map(c=>(<DynamicComponent key={c.id} configuration={c} />))}
  //           </div>
  //         </div>
  //       </div>
  //     </CustomRenderDynamicComponent>
  //   )
  // }, [conf.operatorColumn, features.enableOperator]);

  const OperatorColumn = useMemo(() => {
    if (!conf.operatorColumn || !features.enableOperator) { return null; }
    return (
      <DynamicComponent configuration={conf.operatorColumn} />
    );
  }, [conf.operatorColumn, features.enableOperator]);

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
        {SerialNumberColumn}
        <div className={styles['columns']} data-dynamic-component-container='columns' data-dynamic-container-direction='horizontal' data-dynamic-container-owner={conf.id}>
          {Columns}
        </div>
        {OperatorColumn}
        {/* {features.enableOperator && (
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
        )} */}
      </div>
      <div className={styles['table__footer']}>
        {Pagination}
      </div>
    </div>
  );
});

Table.displayName = 'Table';

export default Table;