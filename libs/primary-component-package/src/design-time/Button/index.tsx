import { Button as AntdButton } from 'antd';
import React from 'react';
import { IDynamicComponentProps } from '@lowcode-engine/core';
import { observer } from 'mobx-react-lite';

const Button: React.FC<IDynamicComponentProps> = observer(props => {
  const conf = props.configuration;
  return (
    <AntdButton type="primary" size='small'>{conf?.title}</AntdButton>
  );
});

Button.displayName = 'Button';

export default Button;
