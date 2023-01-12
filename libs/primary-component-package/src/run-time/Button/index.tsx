import styles from './index.module.less';
import { Button as AntdButton } from 'antd';
import React, { memo } from 'react';
import { IComponentMetadata, IDynamicComponentProps } from '@tiangong/core';
import { observer } from 'mobx-react-lite';

const Button: React.FC<IDynamicComponentProps> = memo(observer(props => {
  const config = props.configuration;
  // const eventDispatch = useEventDispatch(config.id);
  const buttonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // eventDispatch('onClick');
  };

  return (
    <div className={styles['button']} data-dynamic-component={config.id}>
      <AntdButton className={styles['button']} type="primary" onClick={buttonClick}>{config?.title}</AntdButton>
    </div>
  );
}));

const componentMetadata: IComponentMetadata = {
  events: [
    { key: 'onClick', name: '点击' }
  ]
};

// Button.prototype.componentMetadata = componentMetadata;

Button.displayName = 'Button';

export default Button;
