import { memo, useMemo } from 'react';
import { DynamicForm, ISetterGroup } from '../../../models';

export const PrimaryHeadingSetter: React.FC<ISetterGroup> = memo(props => {

  const { title, children } = props;

  const ChildrenSetters = useMemo(() => {
    if (!children) { return null; }
    return children!.filter(c => c && c.setter).map(c => {
      const Setter = DynamicForm.instance.getSetter(c.setter);
      if (!Setter) { return null; }

      return (
        <Setter {...c} />
      );
    });
  }, [children]);

  return (
    <div className='primary-heading-setter'>
      <p className='primary-heading-setter__title'>{title}</p>
      <div className='primary-heading-setter__content'>
        {ChildrenSetters}
      </div>
    </div>
  );
});

PrimaryHeadingSetter.displayName = 'PrimaryHeadingSetter';


export const SecondaryHeadingSetter: React.FC<ISetterGroup> = memo(props => {

  const { title, children } = props;

  const ChildrenSetters = useMemo(() => {
    if (!children) { return null; }
    return children!.filter(c => c && c.setter).map(c => {
      const Setter = DynamicForm.instance.getSetter(c.setter);
      if (!Setter) { return null; }

      return (
        <Setter {...c} />
      );
    });
  }, [children]);

  return (
    <div className='secondary-heading-setter'>
      <p className='secondary-heading-setter__title'>{title}</p>
      <div className='secondary-heading-setter__content'>
        {ChildrenSetters}
      </div>
    </div>
  );
});

SecondaryHeadingSetter.displayName = 'SecondaryHeadingSetter';
