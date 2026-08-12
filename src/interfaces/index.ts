/* eslint-disable @typescript-eslint/no-explicit-any */
import Transport from 'winston-transport';
import { LOG_LEVELS } from '../enums';

export interface ApplicationInsightsTransportOptions extends Transport.TransportStreamOptions {
  connectionString?: string;
  authenticationString?: string;
  componentName: string;
}

export type LogInfo = ExceptionInfo | EventInfo | TraceInfo | RequestInfo | DependencyInfo | PageViewInfo;

export interface ExceptionInfo {
  error: Error;
  level: LOG_LEVELS;
  message: string;
  projectName: string;
  componentName: string;
  operationId: string;
  meta: any;
  [key: string]: any;
}

export interface EventInfo {
  name: string;
  level: LOG_LEVELS;
  projectName: string;
  componentName: string;
  message: string;
  operationId: string;
  meta: any;
  [key: string]: any;
}

export interface TraceInfo {
  level: LOG_LEVELS;
  message: string;
  projectName: string;
  componentName: string;
  operationId: string;
  meta: any;
  [key: string]: any;
}

export interface DependencyInfo {
  level: LOG_LEVELS;
  dependencyTypeName: string;
  name: string;
  data: string;
  duration: number;
  resultCode: string | number;
  success: boolean;
  componentName: string;
  operationId: string;
  [key: string]: any;
}

export interface RequestInfo {
  level: LOG_LEVELS;
  name: string;
  url: string;
  source?: string;
  duration: number;
  resultCode: string;
  success: boolean;
  componentName: string;
  operationId: string;
  [key: string]: any;
}

export interface PageViewInfo {
  name: string;
  level: LOG_LEVELS;
  projectName: string;
  componentName: string;
  message: string;
  operationId: string;
  meta: any;
  [key: string]: any;
}

export type CustomAxiosError = {
  isAxiosError?: boolean;
  response?: {
    data?: any;
    status?: number;
  };
};
