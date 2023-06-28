import { DownOutlined } from '@ant-design/icons';
import { IDynamicComponentProps, useEventCenter } from '@lowcode-engine/core';
import { Button, Dropdown, MenuProps } from 'antd';
import { IButtonGroupComponentConfiguration } from '../../../models';
import React, { memo } from 'react';
import { ButtonEventType } from '../../../enums';

const menuTrigger = ['click'];

const ButtonGroup: React.FC<IDynamicComponentProps<IButtonGroupComponentConfiguration>> = memo(props => {
  const conf = props.configuration;
  const children = conf.children || [];
  const { dispatch } = useEventCenter(props.configuration);
  const handleMenuClick = (id: string) => {
    const buttonConf = children.find(c => c.id === id);
    const event = buttonConf.event;
    if (!event) { return; }
    dispatch(buttonConf, event[ButtonEventType.click]);
  };

  const menuProps: MenuProps = {
    items: children.map(c => ({
      key: c.id,
      label: c.title,
    })),
    onClick: e => handleMenuClick(e.key),
  };

  return (
    <div>
      <Dropdown menu={menuProps} trigger={menuTrigger as any}>
        <Button>
          {conf.title}
          <DownOutlined />
        </Button>
      </Dropdown>
    </div>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;