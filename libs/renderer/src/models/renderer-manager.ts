import { RendererStoreModel } from '../store';
import { ExpressionMonitorManager, IExpressionMonitorManager } from './expression-monitor';
import { createStore } from '../store';
export interface IRendererContext {
  expressionMonitor: IExpressionMonitorManager;
  store: RendererStoreModel;
}

export class RendererManager implements IRendererContext {

  public readonly expressionMonitor: IExpressionMonitorManager = new ExpressionMonitorManager(this);
  public readonly store: RendererStoreModel = createStore();;

}