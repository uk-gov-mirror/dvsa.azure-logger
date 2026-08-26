const originalNodeEnv = process.env.NODE_ENV;
const originalConnectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
const originalAuthenticationString = process.env.APPLICATIONINSIGHTS_AUTHENTICATION_STRING;

const loadConfig = () => {
  jest.resetModules();
  return require('../../src/config').default;
};

const restoreEnvVar = (key: string, value: string | undefined) => {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
};

describe('config', () => {
  afterEach(() => {
    restoreEnvVar('NODE_ENV', originalNodeEnv);
    restoreEnvVar('APPLICATIONINSIGHTS_CONNECTION_STRING', originalConnectionString);
    restoreEnvVar('APPLICATIONINSIGHTS_AUTHENTICATION_STRING', originalAuthenticationString);
  });

  test('requires a connection string outside development mode even when authentication string is set', () => {
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    process.env.APPLICATIONINSIGHTS_AUTHENTICATION_STRING = 'Authorization=AAD';
    process.env.NODE_ENV = 'production';

    expect(loadConfig).toThrow(
      /APPLICATIONINSIGHTS_CONNECTION_STRING is required when not running in development mode/,
    );
  });

  test('allows missing Application Insights configuration in development mode', () => {
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    delete process.env.APPLICATIONINSIGHTS_AUTHENTICATION_STRING;
    process.env.NODE_ENV = 'development';

    const config = loadConfig();

    expect(config.developmentMode).toBe(true);
  });

  test('throws when connection string is missing outside development mode', () => {
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    delete process.env.APPLICATIONINSIGHTS_AUTHENTICATION_STRING;
    process.env.NODE_ENV = 'production';

    expect(loadConfig).toThrow(
      /APPLICATIONINSIGHTS_CONNECTION_STRING is required when not running in development mode/,
    );
  });
});