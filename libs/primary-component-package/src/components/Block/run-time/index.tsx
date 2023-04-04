import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import { CommonSlot } from '../../../enums';
import React, { memo, useMemo } from 'react';
import { GRID_SYSTEM_SECTION_TOTAL } from '../../../consts';
import { IBlockComponentConfiguration } from '../../../models';
import styles from './index.module.less';

const Block: React.FC<IDynamicComponentProps<IBlockComponentConfiguration>> = memo(props => {

  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponentContainer = dynamicEngine.getDynamicComponentContainerRenderFactory();

  const gridLayoutStyle = useMemo(() => ({
    gridTemplateColumns: `repeat(${GRID_SYSTEM_SECTION_TOTAL},1fr)`,
    gridAutoRows: `minmax(min-content, max-content)`,
    gridRowGap: '10px',
    gridColumnGap: '20px'
  }), []);

  return (
    <div className={styles['block']}>
      <div className={styles['block__header']}>
        <p className={styles['block__title']}>{conf.title}</p>
      </div>
      <DynamicComponentContainer
        className={styles['block__content']}
        configuration={conf}
        slot={CommonSlot.children}
        direction='horizontal'
        style={gridLayoutStyle}
      />
    </div>
  );
});

Block.displayName = 'Block';

export default Block;