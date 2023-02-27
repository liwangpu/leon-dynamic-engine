import { memo, useContext } from 'react';
import { Form } from 'antd';
import { IListItemSetter, IListSetter } from '../../../models';
import { FormListContext, FormListItemContext, IFormListItemContext, SettterRendererContext } from '../../../contexts';

export const ListSetter: React.FC<IListSetter> = memo(props => {

  const { name, itemSetter } = props;
  const setterRendererCtx = useContext(SettterRendererContext);
  const SetterRenderer = setterRendererCtx.getFactory();

  return (
    <Form.List name={name}>
      {
        (fields, operators,ccc) => {
          return (
            <FormListContext.Provider value={null}>
              {fields.map((data) => {
                const conf: IListItemSetter = { setter: itemSetter, title: null };
                const itemCtx: IFormListItemContext = { ...data, ...operators };
                return (
                  <FormListItemContext.Provider value={itemCtx} key={data.key}>
                    {itemSetter && (
                      <SetterRenderer config={conf} />
                    )}
                  </FormListItemContext.Provider>
                );
              })}
            </FormListContext.Provider>
          );
        }
      }
    </Form.List>
  );
});

ListSetter.displayName = 'ListSetter';
