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
    <AntdButton type="primary" onClick={buttonClick}>{config?.title}</AntdButton>
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
