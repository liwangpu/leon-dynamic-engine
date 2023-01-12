import { IDynamicComponentProps, useDynamicComponentEngine } from '@tiangong/core';
import { observer } from 'mobx-react-lite';
import React, { memo, useMemo } from 'react';
import { IBlockComponentConfiguration } from '../../models';
import styles from './index.module.less';


const Block: React.FC<IDynamicComponentProps<IBlockComponentConfiguration>> = memo(observer(props => {

  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();
  const columns = conf.columns || 1;

  const blokStyle = useMemo(() => ({
    height: conf.height
  }), [conf.height]);

  const gridLayoutStyle = useMemo(() => ({
    gridTemplateColumns: `repeat(${columns},1fr)`,
    gridAutoRows: `minmax(min-content, max-content)`,
    gridRowGap: '10px',
    gridColumnGap: '20px'
  }), [conf.columns]);

  const ChildrenComponents = useMemo(() => {
    return conf.children?.map(c => (<DynamicComponent key={c.id} configuration={c} />))
  }, [conf.children]);

  return (
    <div className={styles['block']} style={blokStyle} data-dynamic-component={conf.id}>
      <div className={styles['block__header']}>
        <p className={styles['block__title']}>{conf.title}</p>
      </div>
      <div className={styles['block__content']} style={gridLayoutStyle} data-dynamic-component-container='children' data-dynamic-container-owner={conf.id}>
        {ChildrenComponents}
      </div>
    </div>
  );
}));

Block.displayName = 'Block';

export default Block;