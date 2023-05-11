import { IProjectSchema } from '@lowcode-engine/core';
import { ComponentTypes } from '@lowcode-engine/primary-component-package';
import { PageLayoutType } from '../enums';
import { useComponentConfigGenerator } from './component-config-generator';

export function usePageSchemaGenerator() {

  const confGenerator = useComponentConfigGenerator();

  return async (pageType: string, businessModel: string, pageLayout: string = PageLayoutType.blank) => {
    // 先生成基础的页面schema
    const schema: IProjectSchema = pageType === ComponentTypes.detailPage ? await confGenerator.generateDetailPage(businessModel) : await confGenerator.generateListPage(businessModel);

    switch (pageLayout) {
      case PageLayoutType.list:
        const table = await confGenerator.generateTable(businessModel);
        schema.children = [
          table,
        ];
        break;
      case PageLayoutType.form:
        const form = await confGenerator.generateForm(businessModel);
        schema.children = [
          form,
        ];
        break;
      default:

        break;
    }

    return schema;
  };
}