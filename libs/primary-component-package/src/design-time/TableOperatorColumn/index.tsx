import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import React, { memo, useMemo } from 'react';
import { ITableOperatorColumnComponentConfiguration } from '../../models';
import styles from './index.module.less';

const TableOperatorColumn: React.FC<IDynamicComponentProps<ITableOperatorColumnComponentConfiguration>> = memo(props => {
  
  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();
  const ChildrenComponents = useMemo(() => {
    return conf.children?.map(c => (<DynamicComponent key={c.id} configuration={c} />))
  }, [conf.children]);

  return (
    <div className={styles['operator-column']}>
      <div className={styles['operator-column__header']}>
        <p className={styles['operator-column__title']}>{conf.title}</p>
      </div>
      <div className={styles['operator-column__content']} data-dynamic-component-container='children' data-dynamic-container-owner={conf.id}>
        {ChildrenComponents}
      </div>
    </div>
  );
});

TableOperatorColumn.displayName = 'TableOperatorColumn';

export default TableOperatorColumn;