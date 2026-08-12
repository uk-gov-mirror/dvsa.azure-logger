/* eslint-disable @typescript-eslint/no-explicit-any */
import { InvocationContext } from '@azure/functions';
import winston from 'winston';
import Logger from '../../src/logger';
import ApplicationInsightsTransport from '../../src/applicationInsightsTransport';
import { LOG_LEVELS } from '../../src/enums';

jest.mock('../../src/applicationInsightsTransport');
jest.mock('../../src/config', () => ({
  logs: {
    level: 'DEBUG',
  },
  applicationInsights: {
    connectionString: '123-456-789',
    authenticationString: 'Authorization=AAD',
  },
}));

describe('Logger', () => {
  let loggerInstance: Logger;
  let mockCreateLogger;
  const mockLogger: Logger = {
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    request: jest.fn(),
    dependency: jest.fn(),
  } as unknown as Logger;
  const mockContext: InvocationContext = {
    traceContext: {
      traceParent: '763230142f4317478bf6bdcee3886ef0',
    },
  } as unknown as InvocationContext;
  const logMessage = 'test log message';
  const logProps = { componentName: 'azure-logger', projectName: 'DVSA' };

  beforeAll(() => {
    mockCreateLogger = jest.spyOn(winston, 'createLogger');
    mockCreateLogger.mockImplementation(() => mockLogger);
  });

  beforeEach(() => {
    loggerInstance = new Logger('DVSA', 'azure-logger');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    test('should correctly configure application insights', () => {
      // assert
      expect(ApplicationInsightsTransport).toHaveBeenCalledWith({
        level: 'DEBUG',
        connectionString: '123-456-789',
        authenticationString: 'Authorization=AAD',
        componentName: 'azure-logger',
      });
    });
  });

  describe('critical', () => {
    test('should create a critical log', () => {
      // act
      loggerInstance.critical(logMessage);
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.CRITICAL,
        logMessage,
        logProps,
      );
    });

    test('should create a critical log with optional properties', () => {
      // act
      loggerInstance.critical(logMessage, { isTest: 'true' });
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.CRITICAL,
        logMessage,
        { ...logProps, isTest: 'true' },
      );
    });
  });

  describe('debug', () => {
    test('should create a debug log', () => {
      // act
      loggerInstance.debug(logMessage);
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.DEBUG,
        logMessage,
        logProps,
      );
    });

    test('should create a debug log with optional properties', () => {
      // act
      loggerInstance.debug(logMessage, { isTest: 'true' });
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.DEBUG,
        logMessage,
        { ...logProps, isTest: 'true' },
      );
    });
  });

  describe('audit', () => {
    test('should create a audit log', () => {
      // act
      loggerInstance.audit(logMessage);
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.AUDIT,
        logMessage,
        logProps,
      );
    });

    test('should create a audit log with optional properties', () => {
      // act
      loggerInstance.audit(logMessage, { isTest: 'true' });
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.AUDIT,
        logMessage,
        { ...logProps, isTest: 'true' },
      );
    });
  });

  describe('security', () => {
    test('should create a security log', () => {
      // act
      loggerInstance.security(logMessage);
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.SECURITY,
        logMessage,
        logProps,
      );
    });

    test('should create a security log with optional properties', () => {
      // act
      loggerInstance.security(logMessage, { isTest: 'true' });
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.SECURITY,
        logMessage,
        { ...logProps, isTest: 'true' },
      );
    });
  });

  describe('error', () => {
    const mockError = new Error('Mock Error');

    test('should create a error log', () => {
      // act
      loggerInstance.error(mockError);
      // assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        '',
        { ...logProps, error: mockError },
      );
    });

    test('should create a error log with an optional error message', () => {
      // act
      loggerInstance.error(mockError, logMessage);
      // assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        logMessage,
        { ...logProps, error: mockError },
      );
    });

    test('should create a error log with optional properties', () => {
      // act
      loggerInstance.error(mockError, undefined, { isTest: 'true' });
      // assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        '',
        { ...logProps, error: mockError, isTest: 'true' },
      );
    });

    test('should create a error log with an optional message and properties', () => {
      // act
      loggerInstance.error(mockError, logMessage, { isTest: 'true' });
      // assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        logMessage,
        { ...logProps, error: mockError, isTest: 'true' },
      );
    });
  });

  describe('info', () => {
    test('should create a info log', () => {
      // act
      loggerInstance.info(logMessage);
      // assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        logMessage,
        logProps,
      );
    });

    test('should create a info log with optional properties', () => {
      // act
      loggerInstance.info(logMessage, { isTest: 'true' });
      // assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        logMessage,
        { ...logProps, isTest: 'true' },
      );
    });
  });

  describe('log', () => {
    test('should create a log', () => {
      // act
      loggerInstance.log(logMessage);
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.INFO,
        logMessage,
        logProps,
      );
    });

    test('should create a log with additional properties', () => {
      // act
      loggerInstance.log(logMessage, { isTest: 'true' });
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.INFO,
        logMessage,
        { ...logProps, isTest: 'true' },
      );
    });
  });

  describe('warn', () => {
    test('should create a warn log', () => {
      // act
      loggerInstance.warn(logMessage);
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.WARNING,
        logMessage,
        logProps,
      );
    });

    test('should create a warn log with optional properties', () => {
      // act
      loggerInstance.warn(logMessage, { isTest: 'true' });
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.WARNING,
        logMessage,
        { ...logProps, isTest: 'true' },
      );
    });
  });

  describe('event', () => {
    const mockEventName = 'mock-event';
    const mockEventMessage = 'mock-event-message';

    test('should create a event log', () => {
      // act
      loggerInstance.event(mockEventName);
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.EVENT,
        '',
        { ...logProps, name: mockEventName },
      );
    });

    test('should create a event with an optional message', () => {
      // act
      loggerInstance.event(mockEventName, mockEventMessage);
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.EVENT,
        mockEventMessage,
        { ...logProps, name: mockEventName },
      );
    });

    test('should create a event with optional properties', () => {
      // act
      loggerInstance.event(mockEventName, undefined, { isTest: 'true' });
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.EVENT,
        '',
        { ...logProps, name: mockEventName, isTest: 'true' },
      );
    });

    test('should create a event with an optional message and properties', () => {
      // act
      loggerInstance.event(mockEventName, mockEventMessage, { isTest: 'true' });
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.EVENT,
        mockEventMessage,
        { ...logProps, name: mockEventName, isTest: 'true' },
      );
    });
  });

  describe('dependency', () => {
    const mockDependencyName = 'mock-dependency';

    test('should create a dependency log', () => {
      // act
      loggerInstance.dependency(mockDependencyName, 'data', { context: mockContext });
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.DEPENDENCY,
        mockDependencyName,
        expect.objectContaining({ ...logProps, operationId: '763230142f4317478bf6bdcee3886ef0' }),
      );
    });
  });

  describe('request', () => {
    const mockRequestName = 'mock-request';

    test('should create a request log', () => {
      // act
      loggerInstance.request(mockRequestName, { context: mockContext });
      // assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        LOG_LEVELS.REQUEST,
        mockRequestName,
        expect.objectContaining({ ...logProps, operationId: '763230142f4317478bf6bdcee3886ef0' }),
      );
    });
  });
});
