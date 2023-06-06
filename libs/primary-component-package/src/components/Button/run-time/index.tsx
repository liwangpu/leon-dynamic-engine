import { Button as AntdButton } from 'antd';
import React, { memo } from 'react';
import { IDynamicComponentProps, useEventCenter } from '@lowcode-engine/core';
import { ButtonUIType, IButtonComponentConfiguration } from '../../../models';
import { ButtonEventType } from '../../../enums';

const Button: React.FC<IDynamicComponentProps<IButtonComponentConfiguration>> = memo(props => {
  const { uiType, title, event } = props.configuration;

  const { dispatch } = useEventCenter(props.configuration);
  const buttonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(props.configuration, event[ButtonEventType.click]);
  };

  return (
    <AntdButton type={uiType || ButtonUIType.defaultType} onClick={buttonClick}>{title}</AntdButton>
  );
});


Button.displayName = 'Button';

export default Button;
