import * as _ from 'lodash';

export interface IModelField {
  id: string;
  key: string;
  type: string;
  title: string;
  fields?: IModelField[];
}

export type IBusinessIModel = IModelField;

// 这里只写扁平第一层级的就行
const AllModels: { [model: string]: IBusinessIModel } = {
  'rfx': {
    id: 'rfx',
    key: 'rfx',
    title: '询价单',
    type: 'reference',
    fields: [
      { id: 'a_1', key: 'rfxTitle', title: '询价单标题', type: 'string' },
      { id: 'a_2', key: 'rfxNum', title: '询价单编号', type: 'string' },
      { id: 'a_3', key: 'price', title: '价格', type: 'number' },
      { id: 'a_4', key: 'count', title: '数量', type: 'number' },
      { id: 'a_5', key: 'remark', title: '备注', type: 'string' },
      { id: 'supplier', key: 'supplier', title: '供应商', type: 'reference' },
    ]
  },
  'supplier': {
    id: 'supplier',
    key: 'supplier',
    title: '供应商',
    type: 'reference',
    fields: [
      { id: 'b_1', key: 'name', title: '名称', type: 'string' },
      { id: 'b_2', key: 'address', title: '地址', type: 'string' },
      { id: 'b_3', key: 'remark', title: '备注', type: 'string' },
      { id: 'addressBook', key: 'addressBook', title: '通讯录', type: 'reference' },
    ]
  },  
  'addressBook': {
    id: 'addressBook',
    key: 'addressBook',
    title: '通讯录',
    type: 'reference',
    fields: [
      { id: 'c_1', key: 'concact', title: '联系人', type: 'string' },
      { id: 'c_2', key: 'phone', title: '电话', type: 'string' },
      { id: 'c_3', key: 'address', title: '地址', type: 'string' },
      { id: 'c_4', key: 'remark', title: '备注', type: 'string' },
    ]
  }
};

export class ModelRepository {

  private static instance: ModelRepository;
  private constructor() { }

  static getInstance(): ModelRepository {
    if (!this.instance) {
      this.instance = new ModelRepository();
    }
    return this.instance;
  }

  async query(): Promise<Array<IBusinessIModel>> {
    const businessModels = Object.keys(AllModels);
    const result = businessModels.map(b => AllModels[b]);
    return _.cloneDeep(result);
  }

  async get(modelKey: string): Promise<IBusinessIModel> {
    const model = _.cloneDeep(AllModels[modelKey]);
    // 递归生成子引用的字段信息
    const generateReferenceFields = (m: IBusinessIModel) => {
      if (m.type !== 'reference') { return; }
      m.fields = _.cloneDeep(AllModels[m.id]).fields;
      m.fields.filter(f => f.type === 'reference').forEach(f => generateReferenceFields(f));
    };
    generateReferenceFields(model);
    return model;
  }

}

