const originalNodeEnv = process.env.NODE_ENV;
const originalConnectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
const originalAuthenticationString = process.env.APPLICATIONINSIGHTS_AUTHENTICATION_STRING;

const loadConfig = () => {
  jest.resetModules();
  return require('../../src/config').default;
};

describe('config', () => {
  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = originalConnectionString;
    process.env.APPLICATIONINSIGHTS_AUTHENTICATION_STRING = originalAuthenticationString;
  });

  test('allows an authentication string without a connection string', () => {
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    process.env.APPLICATIONINSIGHTS_AUTHENTICATION_STRING = 'Authorization=AAD';
    process.env.NODE_ENV = 'production';

    const config = loadConfig();

    expect(config.applicationInsights.authenticationString).toBe('Authorization=AAD');
  });

  test('allows missing Application Insights configuration in development mode', () => {
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    delete process.env.APPLICATIONINSIGHTS_AUTHENTICATION_STRING;
    process.env.NODE_ENV = 'development';

    const config = loadConfig();

    expect(config.developmentMode).toBe(true);
  });

  test('throws when both Application Insights settings are missing outside development mode', () => {
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    delete process.env.APPLICATIONINSIGHTS_AUTHENTICATION_STRING;
    process.env.NODE_ENV = 'production';

    expect(loadConfig).toThrow('Required application insights connection string is missing');
  });
});