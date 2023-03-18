import { SettterRendererContext } from '../../../contexts';
import { memo, useContext, useMemo } from 'react';
import { IGridLayoutSetter, IPrimaryHeadingSetter, ISecondaryHeadingSetter } from '../../../models';
import { GRID_SYSTEM_SECTION_TOTAL } from '../../../consts';

const Setter: React.FC<IGridLayoutSetter> = memo(props => {

  const { children } = props;
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

  // const ChildrenSetters = useMemo(() => {
  //   if (!children) { return null; }
  //   return children!.filter(c => c && c.setter).map(c => {
  //     const style: { [key: string]: any } = {};
  //     let sec = GRID_SYSTEM_SECTION_TOTAL;
  //     if (c.gridColumnSpan) {
  //       try {
  //         const fn = new Function(`return ${c.gridColumnSpan}`);
  //         sec = fn() * GRID_SYSTEM_SECTION_TOTAL;
  //       } catch (err) {
  //         console.error(`gridColumnStart转化失败,数值信息为${c.gridColumnSpan}`);
  //       }
  //     }
  //     style['gridColumnStart'] = `span ${sec}`;

  //     return (
  //       <div className='grid-layout-setter-item' key={c.key} style={style}>
  //         <SetterRenderer config={c as any} />
  //       </div>
  //     );
  //   });
  // }, [children]);

  return (
    <div className='grid-layout-setter'>
      {ChildrenSetters}
    </div>
  );
});

Setter.displayName = 'StringSetter';

export default Setter;

