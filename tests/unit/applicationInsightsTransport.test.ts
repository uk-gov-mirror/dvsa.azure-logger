import { setup } from 'applicationinsights';
import {
  TraceTelemetry,
  SeverityLevel,
  EventTelemetry,
  ExceptionTelemetry,
  DependencyTelemetry,
  RequestTelemetry,
} from 'applicationinsights/out/Declarations/Contracts';
import ApplicationInsightsTransport from '../../src/applicationInsightsTransport';
import {
  ExceptionInfo,
  EventInfo,
  TraceInfo,
  DependencyInfo,
  RequestInfo,
} from '../../src/interfaces';
import { LOG_LEVELS } from '../../src/enums';

jest.mock('applicationinsights', () => ({
  setup: jest.fn().mockReturnValue({
    start: () => { },
    setAutoDependencyCorrelation: jest.fn().mockReturnThis(),
    setAutoCollectRequests: jest.fn().mockReturnThis(),
    setAutoCollectPerformance: jest.fn().mockReturnThis(),
    setAutoCollectExceptions: jest.fn().mockReturnThis(),
    setAutoCollectDependencies: jest.fn().mockReturnThis(),
    setAutoCollectConsole: jest.fn().mockReturnThis(),
    setUseDiskRetryCaching: jest.fn().mockReturnThis(),
    setSendLiveMetrics: jest.fn().mockReturnThis(),
    setDistributedTracingMode: jest.fn().mockReturnThis(),
  }),
  defaultClient: {
    context: {
      keys: {
        cloudRole: 'cloudRole',
        operationId: 'ai.operation.id',
        operationParentId: 'ai.operationParent.id',
      },
      tags: {
        cloudRole: '',
        operationId: '',
        operationParentId: '',
      },
    },
    trackTrace: jest.fn(),
    trackException: jest.fn(),
    trackEvent: jest.fn(),
    trackRequest: jest.fn(),
    trackDependency: jest.fn(),
    addTelemetryProcessor: jest.fn(),
  },
  DistributedTracingModes: {
    AI_AND_W3C: 1,
  },
}));

describe('ApplicationInsightsTransport', () => {
  describe('constructor', () => {
    test('should create a new app insights client', () => {
      // Arrange
      const connectionString = 'dummy-string';
      const componentName = 'azure-logger';
      // Act
      const result = new ApplicationInsightsTransport({
        connectionString, componentName,
      });

      // Assert
      expect(setup).toHaveBeenCalledWith(connectionString);
      expect(result.client.context.tags.cloudRole).toEqual(componentName);
    });

    test('should include authentication string in setup connection string when provided', () => {
      // Arrange
      const connectionString = 'dummy-string';
      const authenticationString = 'Authorization=AAD';
      const componentName = 'azure-logger';

      // Act
      new ApplicationInsightsTransport({
        connectionString,
        authenticationString,
        componentName,
      });

      // Assert
      expect(setup).toHaveBeenCalledWith(`${connectionString};${authenticationString}`);
    });

    test('should prioritize authentication string when it already includes connection configuration', () => {
      // Arrange
      const connectionString = 'legacy-connection-string';
      const authenticationString = 'InstrumentationKey=00000000-0000-0000-0000-000000000000;IngestionEndpoint=https://uksouth-0.in.applicationinsights.azure.com/;Authorization=AAD';
      const componentName = 'azure-logger';

      // Act
      new ApplicationInsightsTransport({
        connectionString,
        authenticationString,
        componentName,
      });

      // Assert
      expect(setup).toHaveBeenCalledWith(authenticationString);
    });
  });

  describe('log', () => {
    const connectionString = 'dummy-string';
    const projectName = 'DVSA';
    const componentName = 'azure-logger';
    const message = 'mock-message';
    const eventName = 'mock-event-name';
    const operationId = 'operation-id';

    let applicationinsightsTransport: ApplicationInsightsTransport;

    beforeEach(() => {
      applicationinsightsTransport = new ApplicationInsightsTransport({
        connectionString,
        componentName,
      });
    });

    test('should create a trace log when provided with a audit log', () => {
      // Arrange
      const mockLogInfo: TraceInfo = {
        projectName,
        componentName,
        message,
        operationId,
        level: LOG_LEVELS.AUDIT,
        meta: {},
        optionalProp: 'optional',
      };
      const expectedTraceInput: TraceTelemetry = {
        severity: SeverityLevel.Verbose,
        message,
        tagOverrides: {
          'ai.operation.id': operationId,
        },
        properties: {
          projectName,
          componentName,
          level: LOG_LEVELS.AUDIT,
          optionalProp: 'optional',
        },
      };
      // Act
      applicationinsightsTransport.log(mockLogInfo, () => { });
      // Assert
      expect(applicationinsightsTransport.client.trackTrace).toHaveBeenLastCalledWith(expectedTraceInput);
    });

    test('should create a trace log when provided with a critical log', () => {
      // Arrange
      const mockLogInfo: TraceInfo = {
        projectName,
        componentName,
        message,
        operationId,
        level: LOG_LEVELS.CRITICAL,
        meta: [],
        optionalProp: 'optional',
      };
      const expectedTraceInput: TraceTelemetry = {
        severity: SeverityLevel.Critical,
        message,
        tagOverrides: {
          'ai.operation.id': operationId,
        },
        properties: {
          projectName,
          componentName,
          level: LOG_LEVELS.CRITICAL,
          optionalProp: 'optional',
        },
      };
      // Act
      applicationinsightsTransport.log(mockLogInfo, () => { });
      // Assert
      expect(applicationinsightsTransport.client.trackTrace).toHaveBeenLastCalledWith(expectedTraceInput);
    });

    test('should create a trace log when provided with a debug log', () => {
      // Arrange
      const mockLogInfo: TraceInfo = {
        projectName,
        componentName,
        message,
        operationId,
        level: LOG_LEVELS.DEBUG,
        meta: {},
        optionalProp: 'optional',
      };
      const expectedTraceInput: TraceTelemetry = {
        severity: SeverityLevel.Verbose,
        message,
        tagOverrides: {
          'ai.operation.id': operationId,
        },
        properties: {
          projectName,
          componentName,
          level: LOG_LEVELS.DEBUG,
          optionalProp: 'optional',
        },
      };
      // Act
      applicationinsightsTransport.log(mockLogInfo, () => { });
      // Assert
      expect(applicationinsightsTransport.client.trackTrace).toHaveBeenLastCalledWith(expectedTraceInput);
    });

    test('should create a exception log with a message when provided with a error log with a message', () => {
      // Arrange
      const error: Error = new Error('Test Error');
      const mockLogInfo: ExceptionInfo = {
        error,
        message,
        projectName,
        componentName,
        operationId,
        level: LOG_LEVELS.ERROR,
        meta: {},
        optionalProp: 'optional',
      };
      const expectedErrorInput: ExceptionTelemetry = {
        exception: error,
        severity: SeverityLevel.Error,
        tagOverrides: {
          'ai.operation.id': operationId,
        },
        properties: {
          projectName,
          componentName,
          message,
          optionalProp: 'optional',
        },
      };
      // Act
      applicationinsightsTransport.log(mockLogInfo, () => { });
      // Assert
      expect(applicationinsightsTransport.client.trackException).toHaveBeenLastCalledWith(expectedErrorInput);
    });

    test('should create a exception log with no message when provided with a error log with no messgae', () => {
      // Arrange
      const error: Error = new Error('Test Error');
      const mockLogInfo: ExceptionInfo = {
        error,
        message: '',
        projectName,
        componentName,
        operationId,
        level: LOG_LEVELS.ERROR,
        meta: {},
        optionalProp: 'optional',
      };
      const expectedErrorInput: ExceptionTelemetry = {
        exception: error,
        severity: SeverityLevel.Error,
        tagOverrides: {
          'ai.operation.id': operationId,
        },
        properties: {
          projectName,
          componentName,
          optionalProp: 'optional',
        },
      };
      // Act
      applicationinsightsTransport.log(mockLogInfo, () => { });
      // Assert
      expect(applicationinsightsTransport.client.trackException).toHaveBeenLastCalledWith(expectedErrorInput);
    });

    test('should create a event log with a message when provided with a event log with a message', () => {
      // Arrange
      const mockLogInfo: EventInfo = {
        projectName,
        componentName,
        message,
        operationId,
        level: LOG_LEVELS.EVENT,
        name: eventName,
        meta: [],
        randomData: 'random-data',
      };
      const expectedEventInput: EventTelemetry = {
        name: eventName,
        tagOverrides: {
          'ai.operation.id': operationId,
        },
        properties: {
          projectName,
          componentName,
          message,
          randomData: 'random-data',
        },
      };
      // Act
      applicationinsightsTransport.log(mockLogInfo, () => { });
      // Assert
      expect(applicationinsightsTransport.client.trackEvent).toHaveBeenLastCalledWith(expectedEventInput);
    });

    test('should create a event log without a message when provided with a event log with no message', () => {
      // Arrange
      const mockLogInfo: EventInfo = {
        projectName,
        componentName,
        message: '',
        operationId,
        level: LOG_LEVELS.EVENT,
        name: eventName,
        meta: {},
      };
      const expectedEventInput: EventTelemetry = {
        name: eventName,
        tagOverrides: {
          'ai.operation.id': operationId,
        },
        properties: {
          projectName,
          componentName,
        },
      };
      // Act
      applicationinsightsTransport.log(mockLogInfo, () => { });
      // Assert
      expect(applicationinsightsTransport.client.trackEvent).toHaveBeenLastCalledWith(expectedEventInput);
    });

    test('should create a trace log when provided with a info log', () => {
      // Arrange
      const mockLogInfo: TraceInfo = {
        projectName,
        componentName,
        message,
        operationId,
        level: LOG_LEVELS.INFO,
        meta: {},
        optionalProp: 'optional',
      };
      const expectedTraceInput: TraceTelemetry = {
        severity: SeverityLevel.Information,
        message,
        tagOverrides: {
          'ai.operation.id': operationId,
        },
        properties: {
          projectName,
          componentName,
          level: LOG_LEVELS.INFO,
          optionalProp: 'optional',
        },
      };
      // Act
      applicationinsightsTransport.log(mockLogInfo, () => { });
      // Assert
      expect(applicationinsightsTransport.client.trackTrace).toHaveBeenLastCalledWith(expectedTraceInput);
    });

    test('should create a trace log when provided with a security log', () => {
      // Arrange
      const mockLogInfo: TraceInfo = {
        projectName,
        componentName,
        message,
        operationId,
        level: LOG_LEVELS.SECURITY,
        meta: {},
        optionalProp: 'optional',
      };
      const expectedTraceInput: TraceTelemetry = {
        severity: SeverityLevel.Information,
        message,
        tagOverrides: {
          'ai.operation.id': operationId,
        },
        properties: {
          projectName,
          componentName,
          level: LOG_LEVELS.SECURITY,
          optionalProp: 'optional',
        },
      };
      // Act
      applicationinsightsTransport.log(mockLogInfo, () => { });
      // Assert
      expect(applicationinsightsTransport.client.trackTrace).toHaveBeenLastCalledWith(expectedTraceInput);
    });

    test('should create a trace log when provided with a warning log', () => {
      // Arrange
      const mockLogInfo: TraceInfo = {
        projectName,
        componentName,
        message,
        operationId,
        level: LOG_LEVELS.WARNING,
        meta: {},
        optionalProp: 'optional',
      };
      const expectedTraceInput: TraceTelemetry = {
        severity: SeverityLevel.Warning,
        message,
        tagOverrides: {
          'ai.operation.id': operationId,
        },
        properties: {
          projectName,
          componentName,
          level: LOG_LEVELS.WARNING,
          optionalProp: 'optional',
        },
      };
      // Act
      applicationinsightsTransport.log(mockLogInfo, () => { });
      // Assert
      expect(applicationinsightsTransport.client.trackTrace).toHaveBeenLastCalledWith(expectedTraceInput);
    });

    test('should create a dependency when provided with a dependency log', () => {
      // Arrange
      const mockDependencyInfo: DependencyInfo = {
        projectName,
        componentName,
        operationId,
        level: LOG_LEVELS.DEPENDENCY,
        dependencyTypeName: 'http',
        name: 'dependency',
        data: 'logged dependency',
        duration: 200,
        resultCode: 200,
        success: true,
        optionalProp: 'optional',
      };
      const expectedDependencyInput: DependencyTelemetry = {
        dependencyTypeName: 'http',
        name: 'dependency',
        data: 'logged dependency',
        duration: 200,
        resultCode: 200,
        success: true,
        tagOverrides: {
          'ai.operation.id': operationId,
        },
      };
      // Act
      applicationinsightsTransport.log(mockDependencyInfo, () => { });
      // Assert
      expect(applicationinsightsTransport.client.trackDependency)
        .toHaveBeenLastCalledWith(expect.objectContaining(expectedDependencyInput));
    });

    test('should create a request when provided with a request log', () => {
      // Arrange
      const mockRequestInfo: RequestInfo = {
        projectName,
        componentName,
        operationId,
        level: LOG_LEVELS.REQUEST,
        name: 'request',
        url: 'https://url.test',
        duration: 200,
        resultCode: 200,
        success: true,
        optionalProp: 'optional',
      };
      const expectedRequestInput: RequestTelemetry = {
        name: 'request',
        url: 'https://url.test',
        duration: 200,
        resultCode: 200,
        success: true,
        tagOverrides: {
          'ai.operation.id': operationId,
        },
      };
      // Act
      applicationinsightsTransport.log(mockRequestInfo, () => { });
      // Assert
      expect(applicationinsightsTransport.client.trackRequest)
        .toHaveBeenLastCalledWith(expect.objectContaining(expectedRequestInput));
    });
  });
});
