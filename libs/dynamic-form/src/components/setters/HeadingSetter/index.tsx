import { SettterRendererContext } from '../../../contexts';
import { memo, useContext, useMemo } from 'react';
import { IPrimaryHeadingSetter,ISecondaryHeadingSetter } from '../../../models';

export const PrimaryHeadingSetter: React.FC<IPrimaryHeadingSetter> = memo(props => {

  const { label, children } = props;
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
    <div className='primary-heading-setter'>
      <p className='primary-heading-setter__title'>{label}</p>
      <div className='primary-heading-setter__content'>
        {ChildrenSetters}
      </div>
    </div>
  );
});

PrimaryHeadingSetter.displayName = 'PrimaryHeadingSetter';


export const SecondaryHeadingSetter: React.FC<ISecondaryHeadingSetter> = memo(props => {

  const { label, children } = props;
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
    <div className='secondary-heading-setter'>
      <p className='secondary-heading-setter__title'>{label}</p>
      <div className='secondary-heading-setter__content'>
        {ChildrenSetters}
      </div>
    </div>
  );
});

SecondaryHeadingSetter.displayName = 'SecondaryHeadingSetter';
