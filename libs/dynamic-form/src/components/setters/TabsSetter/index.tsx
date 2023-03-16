import { memo, useContext, useMemo } from 'react';
import { Tabs } from 'antd';
import { ITabsSetter } from '../../../models';
import { SettterRendererContext } from '../../../contexts';

const Setter: React.FC<ITabsSetter> = memo(props => {

  const setterRendererCtx = useContext(SettterRendererContext);
  const SetterRenderer = setterRendererCtx.getFactory();
  const Items = useMemo<Array<any>>(() => {
    if (!props.children) { return []; }
    return props.children.map(t => ({
      key: t.key,
      label: t.label,
      children: (
        <>
          {t.children && (
            t.children.map(it => (
              <SetterRenderer config={it as any} key={it.key} />
            ))
          )}
        </>
      )
    }));
  }, [props.children]);

  return (
    <Tabs
      className='tabs-setter'
      items={Items}
    />
  );
});

Setter.displayName = 'TabsSetter';

export default Setter;

