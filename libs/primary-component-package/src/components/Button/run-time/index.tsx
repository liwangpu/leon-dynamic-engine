import { Button as AntdButton } from 'antd';
import React, { memo, useEffect } from 'react';
import { IComponentMetadata, IDynamicComponentProps, useEventCenter } from '@lowcode-engine/core';
import { ButtonUIType, IButtonComponentConfiguration } from '../../../models';
import { ButtonEventType } from '../../../enums';

const Button: React.FC<IDynamicComponentProps<IButtonComponentConfiguration>> = memo(props => {
  const { uiType, title, event } = props.configuration;
  // const eventDispatch = useEventDispatch(config.id);

  const { dispatch, disconnect } = useEventCenter(props.configuration);
  const buttonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(event[ButtonEventType.click]);
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <AntdButton type={uiType || ButtonUIType.defaultType} onClick={buttonClick}>{title}</AntdButton>
  );
});


Button.displayName = 'Button';

export default Button;
