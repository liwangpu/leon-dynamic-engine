import React from 'react';
import { IExpressionMonitorRegister, IRendererContext } from '../models';

export const RendererContext = React.createContext<IRendererContext>(null);

export const ExpressionMonitorRegisterContext = React.createContext<Array<IExpressionMonitorRegister>>(null);