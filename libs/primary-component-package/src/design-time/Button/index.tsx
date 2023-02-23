import { Button as AntdButton } from 'antd';
import React, { memo } from 'react';
import { IDynamicComponentProps } from '@lowcode-engine/core';
import { ButtonUIType, IButtonComponentConfiguration } from '../../models';

const Button: React.FC<IDynamicComponentProps<IButtonComponentConfiguration>> = memo(props => {
  const { uiType, title } = props.configuration;

  return (
    <AntdButton type={uiType || ButtonUIType.defaultType} size='small'>{title}</AntdButton>
  );
});

Button.displayName = 'Button';

export default Button;
