import { GenerateComponentId, GenerateNestedComponentId } from '@lowcode-engine/core';
import { ComponentTypes, GridSystemSection, IBlockComponentConfiguration, IPageComponentConfiguration, ITableComponentConfiguration, TableFeature, TableSelectionMode } from '@lowcode-engine/primary-component-package';
import { IBusinessModel } from '@lowcode-engine/primary-plugin';
import { useMemo } from 'react';
import { ModelRepository } from '../models';

export function useComponentConfigGenerator() {

  const modelMaps = useMemo<Map<string, IBusinessModel>>(() => new Map<string, IBusinessModel>(), []);

  const getBusinessModel = async (businessModelKey: string) => {
    if (!businessModelKey) { return null; }
    if (!modelMaps.has(businessModelKey)) {
      const model = await ModelRepository.getInstance().get(businessModelKey);
      modelMaps.set(businessModelKey, model)
    }
    return modelMaps.get(businessModelKey);
  };

  return {
    async generateListPage(businessModelKey?: string): Promise<IPageComponentConfiguration> {
      return {
        id: GenerateComponentId(ComponentTypes.listPage),
        type: ComponentTypes.listPage,
        title: '列表页面',
        width: '100%',
        height: '100%',
        businessModel: businessModelKey,
      };
    },
    async generateDetailPage(businessModelKey?: string): Promise<IPageComponentConfiguration> {
      return {
        id: GenerateComponentId(ComponentTypes.detailPage),
        type: ComponentTypes.detailPage,
        title: '详情页面',
        width: '100%',
        height: '100%',
        businessModel: businessModelKey,
      };
    },
    async generateTable(businessModelKey?: string): Promise<ITableComponentConfiguration> {
      const tableId = GenerateComponentId(ComponentTypes.table);

      const model: IBusinessModel = await getBusinessModel(businessModelKey);

      return {
        id: tableId,
        type: ComponentTypes.table,
        title: '列表',
        features: [
          TableFeature.selectionColumn,
          TableFeature.operationColumn,
          TableFeature.pagination,
        ],
        columns: model ? model.fields.map(f => ({
          id: GenerateComponentId(ComponentTypes.text),
          type: ComponentTypes.text,
          title: f.name
        })) : [],
        selectionColumn: {
          id: GenerateNestedComponentId(tableId, ComponentTypes.tableSelectionColumn),
          type: ComponentTypes.tableSelectionColumn,
          selectionMode: TableSelectionMode.multiple,
        },
        operatorColumn: {
          id: GenerateNestedComponentId(tableId, ComponentTypes.tableOperatorColumn),
          type: ComponentTypes.tableOperatorColumn,
          visible: true,
          tileButtonCount: 3,
          title: '操作列',
        },
        pagination: {
          id: GenerateNestedComponentId(tableId, ComponentTypes.pagination),
          type: ComponentTypes.pagination,
          title: '分页器',
          pageSize: 20,
        },
      }
    },
    async generateForm(businessModelKey?: string): Promise<IBlockComponentConfiguration> {
      const block: IBlockComponentConfiguration = {
        id: GenerateComponentId(ComponentTypes.block),
        type: ComponentTypes.block,
      };

      const model: IBusinessModel = await getBusinessModel(businessModelKey);
      if (model) {
        block.children = model.fields.map(f => ({
          id: GenerateComponentId(ComponentTypes.text),
          type: ComponentTypes.text,
          title: f.name,
          gridColumnSpan: GridSystemSection['1/2'],
        }))
      }

      return block;
    }
  };
}
