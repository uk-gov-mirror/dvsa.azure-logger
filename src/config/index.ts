const developmentMode =
  process.env.NODE_ENV === 'development';

const applicationInsightsConnectionString =
  process.env.APPLICATIONINSIGHTS_CONNECTION_STRING?.trim();

const applicationInsightsAuthenticationString =
  process.env.APPLICATIONINSIGHTS_AUTHENTICATION_STRING?.trim();

if (
  !developmentMode
  && !applicationInsightsConnectionString
) {
  throw new Error(
    'APPLICATIONINSIGHTS_CONNECTION_STRING is required when not running in development mode',
  );
}

export default {
  logs: {
    level: process.env.LOG_LEVEL,
  },

  applicationInsights: {
    connectionString:
    applicationInsightsConnectionString,
    authenticationString:
    applicationInsightsAuthenticationString,
  },

  /**
   * Development mode
   */
  developmentMode,
};
