import {
  setup,
  defaultClient,
  TelemetryClient,
  DistributedTracingModes,
} from 'applicationinsights';
import {
  SeverityLevel,
  EventTelemetry,
  ExceptionTelemetry,
} from 'applicationinsights/out/Declarations/Contracts';
import Transport from 'winston-transport';

import {
  ApplicationInsightsTransportOptions,
  LogInfo,
  EventInfo,
  TraceInfo,
  ExceptionInfo,
  DependencyInfo,
  RequestInfo,
  PageViewInfo,
} from './interfaces';
import { LOG_LEVELS, APP_INSIGHTS_LOG_LEVELS } from './enums';
import { dropAADLogsTelemetryProcessor } from './dropAADLogsTelemetryProcessor';

class ApplicationInsightsTransport extends Transport {
  client: TelemetryClient;

  logLevelsMap = {
    [LOG_LEVELS.AUDIT]: APP_INSIGHTS_LOG_LEVELS.TRACE,
    [LOG_LEVELS.CRITICAL]: APP_INSIGHTS_LOG_LEVELS.TRACE,
    [LOG_LEVELS.DEBUG]: APP_INSIGHTS_LOG_LEVELS.TRACE,
    [LOG_LEVELS.ERROR]: APP_INSIGHTS_LOG_LEVELS.EXCEPTION,
    [LOG_LEVELS.EVENT]: APP_INSIGHTS_LOG_LEVELS.EVENT,
    [LOG_LEVELS.INFO]: APP_INSIGHTS_LOG_LEVELS.TRACE,
    [LOG_LEVELS.SECURITY]: APP_INSIGHTS_LOG_LEVELS.TRACE,
    [LOG_LEVELS.WARNING]: APP_INSIGHTS_LOG_LEVELS.TRACE,
    [LOG_LEVELS.DEPENDENCY]: APP_INSIGHTS_LOG_LEVELS.DEPENDENCY,
    [LOG_LEVELS.REQUEST]: APP_INSIGHTS_LOG_LEVELS.REQUEST,
    [LOG_LEVELS.PAGE_VIEW]: APP_INSIGHTS_LOG_LEVELS.PAGE_VIEW,
  };

  severityLevelMap = {
    [LOG_LEVELS.AUDIT]: SeverityLevel.Verbose,
    [LOG_LEVELS.CRITICAL]: SeverityLevel.Critical,
    [LOG_LEVELS.DEBUG]: SeverityLevel.Verbose,
    [LOG_LEVELS.ERROR]: SeverityLevel.Error,
    [LOG_LEVELS.EVENT]: SeverityLevel.Information,
    [LOG_LEVELS.INFO]: SeverityLevel.Information,
    [LOG_LEVELS.SECURITY]: SeverityLevel.Information,
    [LOG_LEVELS.WARNING]: SeverityLevel.Warning,
    [LOG_LEVELS.DEPENDENCY]: SeverityLevel.Information,
    [LOG_LEVELS.REQUEST]: SeverityLevel.Information,
    [LOG_LEVELS.PAGE_VIEW]: SeverityLevel.Information,
  };

  constructor(options: ApplicationInsightsTransportOptions) {
    super();
    const applicationInsightsConnectionString = options.authenticationString
      ? `${options.connectionString};${options.authenticationString}`
      : options.connectionString;

    setup(applicationInsightsConnectionString)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(false)
      .setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C)
      .start();

    defaultClient.addTelemetryProcessor(dropAADLogsTelemetryProcessor);
    this.client = defaultClient;
    this.client.context.tags[this.client.context.keys.cloudRole] = options.componentName;
    this.client.context.tags['X-Azure-Ref'] = '';
    this.client.context.tags['INCAP-REQ-ID'] = '';
    this.client.context.tags['Incap-Ses'] = '';
  }

  log(info: LogInfo, callback: Function): void {
    switch (this.logLevelsMap[info.level]) {
      case APP_INSIGHTS_LOG_LEVELS.EVENT:
        this.createEvent(info as EventInfo);
        break;
      case APP_INSIGHTS_LOG_LEVELS.EXCEPTION:
        this.createException(info as ExceptionInfo);
        break;
      case APP_INSIGHTS_LOG_LEVELS.DEPENDENCY:
        this.createDependency(info as DependencyInfo);
        break;
      case APP_INSIGHTS_LOG_LEVELS.REQUEST:
        this.createRequest(info as RequestInfo);
        break;
      case APP_INSIGHTS_LOG_LEVELS.PAGE_VIEW:
        this.createPageView(info as PageViewInfo);
        break;
      case APP_INSIGHTS_LOG_LEVELS.TRACE:
      default:
        this.createTrace(info as TraceInfo);
        break;
    }
    callback();
  }

  private createTrace(info: TraceInfo): void {
    const {
      message, meta, operationId, ...otherProperties
    } = info;

    this.client.trackTrace({
      severity: this.severityLevelMap[info.level],
      message: info.message,
      tagOverrides: {
        [this.client.context.keys.operationId]:
          info.sbOperationId || info.operationId,
        [this.client.context.keys.sessionId]: info.sessionId,
        [this.client.context.keys.userId]: info.userId,
        [this.client.context.keys.userAuthUserId]: info.userAuthUserId,
        [this.client.context.keys.userAccountId]: info.userAccountId,
      },
      properties: {
        ...otherProperties,
      },
    });
  }

  private createException(info: ExceptionInfo): void {
    const {
      error, message, level, meta, operationId, ...otherProperties
    } = info;

    const exception: ExceptionTelemetry = {
      severity: SeverityLevel.Error,
      exception: error,
      tagOverrides: {
        [this.client.context.keys.operationId]:
          info.sbOperationId || info.operationId,
        [this.client.context.keys.sessionId]: info.sessionId,
        [this.client.context.keys.userId]: info.userId,
        [this.client.context.keys.userAuthUserId]: info.userAuthUserId,
        [this.client.context.keys.userAccountId]: info.userAccountId,
      },
      properties: {
        ...otherProperties,
      },
    };

    if (exception.properties && message.trim().length > 0) {
      exception.properties.message = message;
    }

    this.client.trackException(exception);
  }

  private createEvent(info: EventInfo): void {
    const {
      name, message, meta, level, operationId, ...otherProperties
    } = info;

    const event: EventTelemetry = {
      name,
      tagOverrides: {
        [this.client.context.keys.operationId]:
          info.sbOperationId || info.operationId,
        [this.client.context.keys.sessionId]: info.sessionId,
        [this.client.context.keys.userId]: info.userId,
        [this.client.context.keys.userAuthUserId]: info.userAuthUserId,
        [this.client.context.keys.userAccountId]: info.userAccountId,
      },
      properties: {
        ...otherProperties,
      },
    };

    if (event.properties && message.trim().length > 0) {
      event.properties.message = message;
    }

    this.client.trackEvent(event);
  }

  private createDependency(info: DependencyInfo): void {
    const dependency = {
      ...info,
      tagOverrides: {
        [this.client.context.keys.operationId]:
          info.sbOperationId || info.operationId,
        [this.client.context.keys.sessionId]: info.sessionId,
        [this.client.context.keys.userId]: info.userId,
        [this.client.context.keys.userAuthUserId]: info.userAuthUserId,
        [this.client.context.keys.userAccountId]: info.userAccountId,
      },
    };

    this.client.trackDependency(dependency);
  }

  private createRequest(info: RequestInfo): void {
    const request = {
      ...info,
      tagOverrides: {
        [this.client.context.keys.operationId]:
          info.sbOperationId || info.operationId,
        [this.client.context.keys.sessionId]: info.sessionId,
        [this.client.context.keys.userId]: info.userId,
        [this.client.context.keys.userAuthUserId]: info.userAuthUserId,
        [this.client.context.keys.userAccountId]: info.userAccountId,
      },
    };

    this.client.trackRequest(request);
  }

  private createPageView(info: PageViewInfo): void {
    const pageView = {
      ...info,
      tagOverrides: {
        [this.client.context.keys.operationId]:
          info.sbOperationId || info.operationId,
        [this.client.context.keys.sessionId]: info.sessionId,
        [this.client.context.keys.userId]: info.userId,
        [this.client.context.keys.userAuthUserId]: info.userAuthUserId,
        [this.client.context.keys.userAccountId]: info.userAccountId,
      },
    };

    this.client.trackPageView(pageView);
  }
}

export default ApplicationInsightsTransport;
