import { Button as AntdButton } from 'antd';
import React, { memo } from 'react';
import { IDynamicComponentProps } from '@lowcode-engine/core';

const Button: React.FC<IDynamicComponentProps> = memo(props => {
  const conf = props.configuration;
  return (
    <AntdButton type="primary" size='small'>{conf?.title}</AntdButton>
  );
});

Button.displayName = 'Button';

export default Button;
