import { memo, useContext, useMemo } from 'react';
import { Form, Input } from 'antd';
import { IGroupSetter } from '../../../models';
import { useSetterName } from '../../../hooks';
import { FormNamePathContext, SettterRendererContext } from '../../../contexts';
import * as _ from 'lodash';

const Setter: React.FC<IGroupSetter> = memo(props => {

  const { label, children } = props;
  const name = useSetterName();
  const namePath = _.isArray(name) ? name : [name];
  const setterRendererCtx = useContext(SettterRendererContext);
  const SetterRenderer = setterRendererCtx.getFactory();

  const ChildrenSetters = useMemo(() => {
    if (!children) { return null; }
    return children!.filter(c => c && c.setter).map(c => {
      return (
        <SetterRenderer config={c as any} key={c.key} />
      );
    });
  }, [children]);

  return (
    <FormNamePathContext.Provider value={namePath}>
      <div className='group-setter'>
        {label && (
          <p className='primary-heading-setter__title'>{label}</p>
        )}
        {ChildrenSetters}
      </div>
    </FormNamePathContext.Provider>
  );
});

Setter.displayName = 'GroupSetter';

export default Setter;

