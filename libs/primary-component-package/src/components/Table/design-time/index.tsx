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
      enableSelectionColumn: s.has(TableFeature.selectionColumn),
      enablePagination: s.has(TableFeature.pagination)
    };
  }, [conf.features]);

  const OperatorColumn = useMemo(() => {
    if (!conf.operatorColumn || !features.enableOperator) { return null; }
    const c = conf.operatorColumn;

    return (
      <DynamicComponent configuration={c}>
        <div className={classnames(
          styles['col'],
          styles['operator-column'],
        )}>
          <div className={styles['col__header']}>{c.title}</div>
          <DynamicComponentContainer
            className={[
              styles['col__content'],
              styles['operator-column-container']
            ]}
            configuration={c}
            slot={CommonSlot.children}
          />
        </div>
      </DynamicComponent>
    );
  }, [conf.operatorColumn, features.enableOperator]);

  const SelectionColumn = useMemo(() => {
    if (!conf.selectionColumn || !features.enableSelectionColumn) { return null; }
    const c = conf.selectionColumn;
    const isMultipleSelect = c.selectionMode === TableSelectionMode.multiple;
    return (
      <DynamicComponent configuration={c}>
        <div className={classnames(
          styles['col'],
          styles['selection-column'],
        )}
        >
          <div className={classnames(
            styles['col__header'],
            styles['col__header--no-split-bar']
          )}>
            {isMultipleSelect && (
              <Checkbox  />
            )}
          </div>
          <div className={classnames(
            styles['col__content'],
            styles['col__content--data'],
          )}>
            {isMultipleSelect ? (
              <Checkbox  />
            ) : (
              <Radio />
            )}
          </div>
        </div>
      </DynamicComponent>
    );
  }, [conf.selectionColumn, features.enableSelectionColumn]);

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
        {SelectionColumn}
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