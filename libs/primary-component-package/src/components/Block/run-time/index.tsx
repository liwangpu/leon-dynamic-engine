import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import { CommonSlot } from '../../../enums';
import React, { memo, useMemo, useState, MouseEvent, useLayoutEffect } from 'react';
import { GRID_SYSTEM_SECTION_TOTAL } from '../../../consts';
import { IBlockComponentConfiguration } from '../../../models';
import styles from './index.module.less';
import { UpOutlined } from '@ant-design/icons';
import classnames from 'classnames';

const Block: React.FC<IDynamicComponentProps<IBlockComponentConfiguration>> = memo(props => {

  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponentContainer = dynamicEngine.getDynamicComponentContainerRenderFactory();
  const [collapsed, setCollapsed] = useState<boolean>();
  // console.log(`block conf:`, conf);
  const handleCollapse = (e: MouseEvent) => {
    e.stopPropagation();
    setCollapsed(!collapsed);
  };

  const gridLayoutStyle = useMemo(() => ({
    gridTemplateColumns: `repeat(${GRID_SYSTEM_SECTION_TOTAL},1fr)`,
    gridAutoRows: `minmax(min-content, max-content)`,
    gridRowGap: '10px',
    gridColumnGap: '20px'
  }), []);

  useLayoutEffect(() => {

    return () => { 

    };
  }, []);

  const renderToggler = () => {
    if (!conf.enableCollapse) { return; }
    return (
      <div className={styles['block-toggler']} onClick={handleCollapse}>
        <p className={styles['block-toggler__title']}>
          {collapsed ? '展开' : '收起'}
        </p>
        <div className={classnames(
          styles['block-toggler__icon'],
          {
            [styles['block-toggler__icon--collapsed']]: collapsed,
          }
        )}>
          <UpOutlined />
        </div>
      </div>
    );
  };

  return (
    <div className={classnames(
      styles['block'],
      {
        [styles['block--collapsed']]: collapsed,
      }
    )}>
      <div className={styles['block__header']}>
        <p className={styles['block__title']}>{conf.title}</p>
        {renderToggler()}
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