import { EventActionType, IEventAction, IEventCenterEngineContext } from '@lowcode-engine/core';
import { useEffect, useMemo, useRef } from 'react';
import { ActionHandlerConstructor, IActionHandlerContext, ActionQueue, IActionHandler, IActionHandlerRequest } from './action-handler';
import { DefaultActionHandler } from './concrete-handlers/default-handler';
import { FlowActionHandler } from './concrete-handlers/flow-handler';
import { OpenUrlActionHandler } from './concrete-handlers/open-url-handler';
import { SpecialActionHandler } from './concrete-handlers/speccial-handler';

function getActionHandler(type: EventActionType | string): ActionHandlerConstructor {
  switch (type) {
    case EventActionType.openUrl:
      return OpenUrlActionHandler;
    case 'flow':
      return FlowActionHandler;
    case 'special':
      return SpecialActionHandler;
    default:
      return DefaultActionHandler;
  }
}

const mockActions: Array<IEventAction> = [
  {
    id: 'a1',
    title: '打开京东',
    type: EventActionType.openUrl,
    params: {
      url: 'https://www.jd.com',
      target: '_blank',
    }
  },
  {
    id: 'a2',
    title: '打开百度',
    type: EventActionType.openUrl,
    params: {
      url: 'https://www.baidu.com',
      target: '_blank',
    }
  },
  {
    id: 'z1',
    title: '一个特殊的动作',
    type: 'special',
    params: {}
  },
  {
    id: 'a3',
    title: '执行流1',
    type: 'flow',
    params: {}
  },
  {
    id: 'a4',
    title: '执行流1',
    type: 'flow',
    params: {}
  },
  {
    id: 'k1',
    title: '打开美团',
    type: EventActionType.openUrl,
    params: {
      url: 'https://www.meituan.com',
      target: '_blank',
    }
  },
  {
    id: 'a5',
    title: '执行流1',
    type: 'flow',
    params: {}
  },
  {
    id: 'a6',
    title: '某某某事件',
    type: 'flow',
    params: {}
  },
];

export function useEventCenterProvider(): IEventCenterEngineContext {

  // const context = useMemo<IActionHandlerContext>(() => {
  //   return null;
  // }, []);
  const contextRef = useRef<IActionHandlerContext>();
  // const context

  useEffect(() => {

  }, []);

  const eventCenter = useMemo<IEventCenterEngineContext>(() => {
    return {
      async dispatch(component, event, data) {
        // const actionQueue = new ActionQueue(event.execute?.actions);
        console.log(`-----------------------------------------------------------`,);

        // 初始化动作队列
        const actionQueue = new ActionQueue(mockActions);
        // 动作处理上下文
        const context: IActionHandlerContext = null;

        // 动作处理请求参数
        const actionRequest: IActionHandlerRequest = { actionQueue, };
        // 取消动作处理回调
        // const cancelNext = () => {
        //   actionQueue.clear();
        //   context.actionExecuteSuccess = false;
        // };
        // 执行动作队列
        while (actionQueue.size > 0) {
          const action = actionQueue.dequeue();
          let handler: IActionHandler;
          const Handler = getActionHandler(action.type);
          handler = new Handler(context);

          const result = await handler.handle(actionRequest, action, data);
          if (!result || !result.done) {
            actionQueue.clear();
          }
        }
        console.log(`动作执行完毕!`,);
        return null;
      },
      registerAction(component, action, executor) {
        // console.log(`re:`, component);
      },
      deRegisterAction(component) {
        //
      },
    };
  }, []);

  return eventCenter;
}