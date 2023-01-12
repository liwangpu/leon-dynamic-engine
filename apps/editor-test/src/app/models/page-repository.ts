import { IComponentConfiguration } from '@tiangong/core';
import Dexie from 'dexie';

export class PageRepository {

  private static instance: PageRepository;
  private readonly db: Dexie;
  private constructor() {
    this.db = new Dexie('PageStore');
    this.db.version(1).stores({
      pages: '++id,title,type,businessModel',
    });
  }

  static getInstance(): PageRepository {
    if (!this.instance) {
      this.instance = new PageRepository();
    }
    return this.instance;
  }

  async query(businessModel: string): Promise<IComponentConfiguration[]> {
    let metadatas = await this.db.table('pages').filter(p => p.businessModel === businessModel).toArray();
    metadatas = metadatas || [];
    return metadatas.map(m => ({ ...m, id: m.id.toString() }))
  }

  async get(id: string): Promise<IComponentConfiguration> {
    const metadata = await this.db.table('pages').get(Number.parseInt(id as any));
    if (!metadata) { return null; }
    return { ...metadata, id: metadata.id.toString() }
  }

  async create(definition: IComponentConfiguration): Promise<string> {
    const id = await this.db.table('pages').add(definition);
    return id.toString();
  }

  async update(id: string, definition: IComponentConfiguration): Promise<void> {
    const nid = Number.parseInt(id as any);
    const initial = await this.get(id);
    await this.db.table('pages').put(definition ? { ...definition, id: nid } : { id: nid, title: initial.title, type: initial.type, body: [] }, nid);
  }

  async delete(id: string): Promise<void> {
    await this.db.table('pages').delete(Number.parseInt(id));
  }
}

