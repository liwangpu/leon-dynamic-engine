import { DownOutlined, LeftOutlined, RightOutlined, VerticalLeftOutlined, VerticalRightOutlined } from '@ant-design/icons';
import { IDynamicComponentProps } from '@lowcode-engine/core';
import React, { memo } from 'react';
import { IPaginationComponentConfiguration } from '../../models';
import styles from './index.module.less';
import classnames from 'classnames';

const Pagination: React.FC<IDynamicComponentProps<IPaginationComponentConfiguration>> = memo(props => {

  const { pageSize } = props.configuration;
  // console.log(`pagination conf:`, props.configuration);
  return (
    <div className={styles['pagination']}>
      <div className={classnames(
        styles['button'],
        styles['page-size']
      )}>
        <span>{pageSize}条/页</span>
        <div className={styles['page-size__select']}>
          <DownOutlined />
        </div>
      </div>
      <div className={styles['button']}>
        <VerticalRightOutlined />
      </div>
      <div className={styles['button']}>
        <LeftOutlined />
      </div>
      <div className={styles['button']}>
        <RightOutlined />
      </div>
      <div className={styles['button']}>
        <VerticalLeftOutlined />
      </div>
    </div>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;