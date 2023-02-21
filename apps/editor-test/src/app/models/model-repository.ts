import { IBusinessModel } from '@lowcode-engine/primary-plugin';
import * as _ from 'lodash';

// 这里只写扁平第一层级的就行
const AllModels: { [model: string]: IBusinessModel } = {
  'rfx': {
    id: 'rfx',
    code: 'rfx',
    name: '询价单',
    fieldType: 'reference',
    fields: [
      { id: 'a_1', code: 'rfxTitle', name: '询价单标题', fieldType: 'string' },
      { id: 'a_2', code: 'rfxNum', name: '询价单编号', fieldType: 'string' },
      { id: 'a_3', code: 'price', name: '价格', fieldType: 'number' },
      { id: 'a_4', code: 'count', name: '数量', fieldType: 'number' },
      { id: 'a_5', code: 'remark', name: '备注', fieldType: 'string' },
    ],
    relations: [
      {
        id: 'rfx_announcement',
        code: 'rfx_announcement',
        name: '寻源公告',
      },
      {
        id: 'rfx_qualification',
        code: 'rfx_qualification',
        name: '资格审核',
      }
    ]
  },
  'rfx_announcement': {
    id: 'rfx_announcement',
    code: 'rfx_announcement',
    name: '寻源公告',
    fieldType: 'reference',
    fields: [
      { id: 'b_1', code: 'name', name: '名称', fieldType: 'string' },
      { id: 'b_3', code: 'remark', name: '备注', fieldType: 'string' },
    ]
  },
  'rfx_qualification': {
    id: 'rfx_announcement',
    code: 'rfx_announcement',
    name: '资格审核',
    fieldType: 'reference',
    fields: [
      { id: 'b_1', code: 'name', name: '名称', fieldType: 'string' },
      { id: 'b_3', code: 'remark', name: '备注', fieldType: 'string' },
    ]
  },
  'supplier': {
    id: 'supplier',
    code: 'supplier',
    name: '供应商',
    fieldType: 'reference',
    fields: [
      { id: 'b_1', code: 'name', name: '名称', fieldType: 'string' },
      { id: 'b_2', code: 'address', name: '地址', fieldType: 'string' },
      { id: 'b_3', code: 'remark', name: '备注', fieldType: 'string' },
      { id: 'addressBook', code: 'addressBook', name: '通讯录', fieldType: 'reference' },
    ]
  },
  'addressBook': {
    id: 'addressBook',
    code: 'addressBook',
    name: '通讯录',
    fieldType: 'reference',
    fields: [
      { id: 'c_1', code: 'concact', name: '联系人', fieldType: 'string' },
      { id: 'c_2', code: 'phone', name: '电话', fieldType: 'string' },
      { id: 'c_3', code: 'address', name: '地址', fieldType: 'string' },
      { id: 'c_4', code: 'remark', name: '备注', fieldType: 'string' },
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

  async query(): Promise<Array<IBusinessModel>> {
    const businessModels = Object.keys(AllModels);
    const result = businessModels.map(b => AllModels[b]);
    return _.cloneDeep(result);
  }

  async get(id: string): Promise<IBusinessModel> {
    const model = _.cloneDeep(AllModels[id]);
    // 递归生成子引用的字段信息
    // const generateReferenceFields = (m: IBusinessModel) => {
    //   if (m.type !== 'reference') { return; }
    //   m.fields = _.cloneDeep(AllModels[m.id]).fields;
    //   m.fields.filter(f => f.type === 'reference').forEach(f => generateReferenceFields(f));
    // };
    // generateReferenceFields(model);
    return model;
  }

}

