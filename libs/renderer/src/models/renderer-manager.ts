import { ExpressionMonitorManager, IExpressionMonitorManager } from './expression-monitor';

export interface IRendererContext {
  expressionMonitor: IExpressionMonitorManager;
}

export class RendererManager implements IRendererContext {

  public readonly expressionMonitor: IExpressionMonitorManager = new ExpressionMonitorManager(this);

}