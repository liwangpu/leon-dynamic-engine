import { Button as AntdButton } from 'antd';
import React, { memo } from 'react';
import { IComponentMetadata, IDynamicComponentProps } from '@lowcode-engine/core';
import { ButtonUIType } from '../../../models';

const Button: React.FC<IDynamicComponentProps> = memo(props => {
  const { uiType, title } = props.configuration;
  // const eventDispatch = useEventDispatch(config.id);
  const buttonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // eventDispatch('onClick');
  };

  return (
    <AntdButton type={uiType || ButtonUIType.defaultType} onClick={buttonClick}>{title}</AntdButton>
  );
});

const componentMetadata: IComponentMetadata = {
  events: [
    { key: 'onClick', name: '点击' }
  ]
};

// Button.prototype.componentMetadata = componentMetadata;

Button.displayName = 'Button';

export default Button;
