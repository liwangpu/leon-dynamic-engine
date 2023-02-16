import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { ComponentSetterPanelContext } from '@lowcode-engine/editor';
import * as _ from 'lodash';

export const ComponentContextSelector: React.FC<{ parent: string | Array<string>, slotProperty?: string, children?: React.ReactElement }> = observer(props => {
  if (!props.parent) { return null; }
  const ctx = useContext(ComponentSetterPanelContext);
  let parentMatched = false;

  if (_.isArray(parent)) {
    parentMatched = (props.parent as Array<string>).some(t => t === ctx.parentType);
  } else {
    parentMatched = props.parent === ctx.parentType;
  }

  let slotMatched = true;
  if (props.slotProperty) {
    slotMatched = ctx.slot=== props.slotProperty;
  }
  return (
    <>
      {(parentMatched && slotMatched) && props.children}
    </>
  );
});

ComponentContextSelector.displayName = 'ComponentContextSelector';
