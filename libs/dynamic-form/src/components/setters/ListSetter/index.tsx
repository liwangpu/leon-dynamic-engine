import { memo, useContext, useEffect, useMemo, useRef } from 'react';
import { Form } from 'antd';
import { IListSetter } from '../../../models';
import { FormListContext, FormListItemContext, FormNamePathContext, IFormListContext, IFormListItemContext, SettterRendererContext } from '../../../contexts';
import React from 'react';
import Sortable from 'sortablejs';
import * as _ from 'lodash';
import { useSetterName } from '../../../hooks';

const PlainText: React.FC<{ value?: any; onChange?: (val: any) => void }> = memo(props => {

  return (
    <div >
      {props.value}
    </div>
  );
});

PlainText.displayName = 'PlainText';

const ListSetter: React.FC<IListSetter> = memo(props => {

  const { listItem, listFooter, sortable, dragHandle } = props;
  const setterRendererCtx = useContext(SettterRendererContext);
  const SetterRenderer = setterRendererCtx.getFactory();
  const contentConf = useMemo(() => {
    if (!listItem) { return null; }

    return {
      itemConf: {
        setter: listItem
      },
      footerConf: {
        setter: listFooter
      }
    };
  }, [listItem, listFooter]);
  const contentRef = useRef<HTMLDivElement>();
  const listOperationRef = useRef<{ move: (from: number, to: number) => void }>();
  const name = useSetterName();
  const itemNamePathPref = _.isArray(name) ? name : [name];

  useEffect(() => {
    if (!sortable) { return; }
    const instance = Sortable.create(contentRef.current, {
      dragoverBubble: false,
      ghostClass: "dy-form-list",
      scroll: true,
      bubbleScroll: true,
      handle: dragHandle,
      animation: 150,
      onEnd: (evt: Sortable.SortableEvent) => {
        const from = evt.oldIndex;
        const to = evt.newIndex;
        const cancelRemove = () => {
          // 注意,这里的children是拖动后的元素顺序了
          const children = (evt.from as HTMLDivElement).children;
          const originItemEl = children[to];
          // 小序号往大序号拖动,取拖动前下一个元素,before把元素还原回原来位置
          if (from < to) {
            const nextDom = children[from];
            nextDom.before(originItemEl);
          } else {
            // 大序号往小序号拖动,取拖动前的上一个元素,after把元素还原回原来位置
            const previousDom = children[from];
            previousDom.after(originItemEl);
          }
        };
        cancelRemove();
        listOperationRef.current.move(from, to);
      }
    });
    return () => {
      instance.destroy();
    };
  }, [sortable, dragHandle]);

  return (
    <div className='list-setter'>
      <Form.List name={name} >
        {
          (fields, operation, metas) => {
            const listCtx: IFormListContext = { fields, operation };
            listOperationRef.current = { move: operation.move };
            return (
              <FormListContext.Provider value={listCtx}>
                <div className='list-setter__content' ref={contentRef}>
                  {fields.map((data) => {
                    const itemCtx: IFormListItemContext = { ...data, operation: { delete: () => operation.remove(data.name) } };
                    return (
                      <React.Fragment key={data.key}>
                        <FormNamePathContext.Provider value={[...itemNamePathPref, data.name]}>
                          <FormListItemContext.Provider value={itemCtx} >
                            {listItem && <SetterRenderer config={contentConf.itemConf as any} />}
                          </FormListItemContext.Provider>
                        </FormNamePathContext.Provider>
                      </React.Fragment>
                    );
                  })}
                </div>
                {listFooter && (
                  <div className='list-setter__footer'>
                    {listFooter && <SetterRenderer config={contentConf.footerConf as any} />}
                  </div>
                )}
              </FormListContext.Provider>
            );
          }
        }
      </Form.List >
    </div>
  );
});

ListSetter.displayName = 'ListSetter';

export default ListSetter;
