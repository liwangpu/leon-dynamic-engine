import { EditorPluginRegister } from '@lowcode-engine/editor'
import { ComponentTypes } from '@lowcode-engine/primary-component-package';
import { buttonGroupTypes, ComponentIndexTitleIncludeGroupTypes, FormInputGroupTypes, selfSlotGroupTypes } from '../../../consts';

/**
 * 组件插槽相关注册插件
 * @returns 注册插件
 */
export function ComponentSlotMapPluginRegister(): EditorPluginRegister {

  return ({ slot }) => {
    return {
      init() {
        slot.registerMap({
          [ComponentTypes.detailPage]: {
            children: {
              rejects: [...buttonGroupTypes, ...FormInputGroupTypes, ...selfSlotGroupTypes]
            },
            operators: {
              accepts: [...buttonGroupTypes]
            }
          },
          [ComponentTypes.listPage]: {
            children: {
              rejects: [...buttonGroupTypes, ...FormInputGroupTypes, ...selfSlotGroupTypes]
            },
            operators: {
              accepts: [...buttonGroupTypes]
            }
          },
          [ComponentTypes.block]: {
            children: {
              rejects: [...buttonGroupTypes, ...selfSlotGroupTypes]
            }
          },
          [ComponentTypes.buttonGroup]: {
            children: {
              accepts: [ComponentTypes.button]
            }
          },
          [ComponentTypes.tabs]: {
            children: {
              accepts: [ComponentTypes.tab]
            }
          },
          [ComponentTypes.tab]: {
            children: {
              rejects: [...buttonGroupTypes, ...selfSlotGroupTypes]
            }
          },
          [ComponentTypes.table]: {
            operators: {
              accepts: [...buttonGroupTypes]
            },
            columns: {
              accepts: [...FormInputGroupTypes],
              rejects: [...buttonGroupTypes]
            },
            operatorColumn: {
              singleton: true
            },
            pagination: {
              singleton: true
            },
            serialNumberColumn: {
              singleton: true
            },
            selectionColumn: {
              singleton: true
            }
          },
          [ComponentTypes.tableOperatorColumn]: {
            children: {
              accepts: [ComponentTypes.button]
            }
          }
        });
      }
    };
  };
}