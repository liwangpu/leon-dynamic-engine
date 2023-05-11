import { IDynamicComponentContainerRendererRef, IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import { CommonSlot } from '../../../enums';
import React, { memo, useMemo, useState, MouseEvent, useLayoutEffect, useRef } from 'react';
import { GRID_SYSTEM_SECTION_TOTAL } from '../../../consts';
import { IBlockComponentConfiguration } from '../../../models';
import styles from './index.module.less';
import { UpOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import * as _ from 'lodash';

const UNIT_ROW_HEIGHT = 58;// 单位像素

const Block: React.FC<IDynamicComponentProps<IBlockComponentConfiguration>> = memo(props => {

  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponentContainer = dynamicEngine.getDynamicComponentContainerFactory();
  const [collapsed, setCollapsed] = useState<boolean>();
  const [rowCollapsed, setRowCollapsed] = useState<boolean>(false);
  const blockContentRef = useRef<HTMLDivElement>();

  const handleCollapse = (e: MouseEvent) => {
    if (!conf.enableCollapse) { return; }
    setCollapsed(!collapsed);
  };

  const handleRowCollapse = (e: MouseEvent) => {
    e.stopPropagation();
    setRowCollapsed(!rowCollapsed);
  };

  const gridLayoutStyle = useMemo(() => ({
    gridTemplateColumns: `repeat(${GRID_SYSTEM_SECTION_TOTAL},1fr)`,
    gridAutoRows: `minmax(min-content, max-content)`,
    gridRowGap: '10px',
    gridColumnGap: '20px'
  }), []);

  const blockContentStyle = useMemo(() => {
    const _style = {};
    if (_.isNumber(conf.collapsedRow) && rowCollapsed) {
      _style['maxHeight'] = `${conf.collapsedRow * UNIT_ROW_HEIGHT + (conf.collapsedRow) * 10 + 28}px`;
    }

    return _style;
  }, [conf.collapsedRow, rowCollapsed]);

  // useLayoutEffect(() => {
  //   // if (!_.isNumber(conf.collapsedRow)) { return; }
  //   // console.log(`1:`,);
  //   // const blockContentNode = blockContentRef.current;
  //   // console.log(`blockContentNode:`, blockContentNode);

  //   return () => {

  //   };
  // }, [conf.collapsedRow]);

  const renderHeader = () => {
    if (!conf.title && !conf.enableCollapse) {
      return;
    }
    return (
      <div className={classnames(
        styles['block__header'],
        {
          [styles['block__header--collapsed-enable']]: conf.enableCollapse,
        }
      )} onClick={handleCollapse}>
        <p className={styles['block__title']}>{conf.title}</p>
        {renderToggler()}
      </div>
    );
  };

  const renderToggler = () => {
    if (!conf.enableCollapse) { return; }
    return (
      <div className={styles['collapse-toggler']}>
        {/* <p className={styles['collapse-toggler__title']}>
          {collapsed ? '展开' : '收起'}
        </p> */}
        <div className={classnames(
          styles['collapse-toggler__icon'],
          {
            [styles['collapse-toggler__icon--collapsed']]: collapsed,
          }
        )}>
          <UpOutlined />
        </div>
      </div>
    );
  };

  const renderRowToggler = () => {
    if (!_.isNumber(conf.collapsedRow)) { return; }

    return (
      <div className={styles['row-toggler']}>
        <div className={styles['collapse-toggler']} onClick={handleRowCollapse}>
          <p className={styles['collapse-toggler__title']}>
            {rowCollapsed ? '展开' : '收起'}
          </p>
          <div className={classnames(
            styles['collapse-toggler__icon'],
            {
              [styles['collapse-toggler__icon--collapsed']]: rowCollapsed,
            }
          )}>
            <UpOutlined />
          </div>
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
      {renderHeader()}
      <div className={classnames(
        styles['block__content'],
        {
          [styles['block__content--collapsed']]: rowCollapsed,
        }
      )}
        style={blockContentStyle}
        ref={blockContentRef}
      >
        <DynamicComponentContainer
          className={styles['grid-layout-container']}
          configuration={conf}
          slot={CommonSlot.children}
          direction='horizontal'
          style={gridLayoutStyle}
        />
        {/* {renderRowToggler()} */}
      </div>
    </div>
  );
});

Block.displayName = 'Block';

export default Block;