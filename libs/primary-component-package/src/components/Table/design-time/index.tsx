import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import React, { memo, useMemo } from 'react';
import classnames from 'classnames';
import { ISelectionColumnComponentConfiguration, ITableComponentConfiguration } from '../../../models';
import styles from './index.module.less';
import { CommonSlot, TableFeature, TableSelectionMode, TableSlot } from '../../../enums';
import { Checkbox, Radio } from 'antd';

const Table: React.FC<IDynamicComponentProps<ITableComponentConfiguration>> = memo(props => {

  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();
  const DynamicComponentContainer = dynamicEngine.getDynamicComponentContainerRenderFactory();

  const features = useMemo(() => {
    const s = new Set<TableFeature>(conf.features || []);
    return {
      enableOperator: s.has(TableFeature.operationColumn),
      enableSerialNumberColumn: s.has(TableFeature.serialNumberColumn),
      enablePagination: s.has(TableFeature.pagination)
    };
  }, [conf.features]);

  const OperatorColumn = useMemo(() => {
    if (!conf.operatorColumn || !features.enableOperator) { return null; }
    const c = conf.operatorColumn;
    return (
      <DynamicComponent configuration={c}>
        <div className={styles['col']}>
          <div className={styles['col__header']}>{c.title}</div>
          <DynamicComponentContainer
            className={styles['col__content']}
            configuration={c}
            slot={CommonSlot.children}
          />
        </div>
      </DynamicComponent>
    );
  }, [conf.operatorColumn, features.enableOperator]);

  const SelectionColumn = useMemo(() => {
    if (!conf.selectionColumn) { return null; }
    return (
      <DynamicComponentContainer
        className={[
          styles['custom-column'],
          styles['custom-column--line-number'],
        ]}
        configuration={conf}
        slot={TableSlot.selectionColumn}
      >
        {
          (cs: Array<ISelectionColumnComponentConfiguration>) => {
            return cs.map(c => (
              <div className={classnames(
                styles['col'],
                'line-number-col'
              )}>
                <div className={styles['col__header']}>
                  {c.selectionMode === TableSelectionMode.multiple ? (
                    <Checkbox></Checkbox>
                  ) : null}
                </div>
                <div className={classnames(
                  styles['col__content'],
                  styles['col__content--data'],
                )}>
                  {c.selectionMode === TableSelectionMode.multiple ? (
                    <Checkbox></Checkbox>
                  ) : (
                    <Radio></Radio>
                  )}
                </div>
              </div>
            ));
          }
        }
      </DynamicComponentContainer>
    );
  }, [conf.selectionColumn]);

  const Pagination = useMemo(() => {
    if (!conf.pagination || !features.enablePagination) { return null; }
    return (
      <DynamicComponent configuration={conf.pagination} />
    );
  }, [conf.pagination, features.enablePagination]);

  const renderOperators = () => {
    return (
      <DynamicComponentContainer
        className={styles['operators']}
        configuration={conf}
        slot={TableSlot.operators}
        direction='horizontal'
      />
    );
  };

  // const SerialNumberColumn = useMemo(() => {
  //   if (!features.enableSerialNumberColumn) { return null; }
  //   if (!conf.serialNumberColumn) { return null; }
  //   return (
  //     <CustomRenderDynamicComponent configuration={conf.serialNumberColumn}>
  //       <div className={classnames(
  //         styles['custom-column'],
  //         styles['custom-column--line-number']
  //       )}>
  //         <div className={classnames(
  //           styles['col'],
  //           'line-number-col'
  //         )}>
  //           <div className={styles['col__header']}>序号</div>
  //           <div className={classnames(
  //             styles['col__content'],
  //             styles['col__content--data'],
  //           )}>-</div>
  //         </div>
  //       </div>
  //     </CustomRenderDynamicComponent>
  //   )
  // }, [conf.serialNumberColumn, features.enableSerialNumberColumn]);

  // const Columns = useMemo(() => {
  //   if (!conf.columns || !conf.columns.length) { return null; }
  //   return conf.columns.map(c => (
  //     <CustomRenderDynamicComponent key={c.id} configuration={c}>
  //       <div className={styles['col']} title={c.title}>
  //         <div className={styles['col__header']}>{c.title}</div>
  //         <div className={classnames(
  //           styles['col__content'],
  //           styles['col__content--data'],
  //         )}>-</div>
  //       </div>
  //     </CustomRenderDynamicComponent>
  //   ));
  // }, [conf.columns]);

  const renderColumns = () => {
    return (
      <DynamicComponentContainer
        className={styles['columns']}
        configuration={conf}
        slot={TableSlot.columns}
        direction='horizontal'
      >
        {
          (cs: Array<ISelectionColumnComponentConfiguration>) => {
            return cs.map(c => (
              <DynamicComponent configuration={c} key={c.id}>
                <div className={styles['col']} title={c.title}>
                  <div className={styles['col__header']}>{c.title}</div>
                  <div className={classnames(
                    styles['col__content'],
                    styles['col__content--data'],
                  )}>-</div>
                </div>
              </DynamicComponent>
            ));
          }
        }
      </DynamicComponentContainer>
    );
  };

  return (
    <div className={styles['table']}>
      <div className={styles['table__header']}>
        <p className={styles['table__title']}>{conf.title || '表格'}</p>
        {renderOperators()}
      </div>
      <div className={styles['table__content']}>
        {renderColumns()}
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