import styles from './index.module.less';
import { Button as AntdButton } from 'antd';
import React, { memo } from 'react';
import { IDynamicComponentProps } from '@tiangong/core';
import { observer } from 'mobx-react-lite';

const Button: React.FC<IDynamicComponentProps> = memo(observer(props => {
  const conf = props.configuration;
  return (
    <div className={styles['button']} data-dynamic-component={conf.id}>
      <AntdButton className={styles['button']} type="primary" size='small'>{conf?.title}</AntdButton>
    </div>
  );
}));

Button.displayName = 'Button';

export default Button;
