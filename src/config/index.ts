if (!process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  throw new Error('Required application insights connection string is missing');
}

export default {

  logs: {
    level: process.env.LOG_LEVEL,
  },
  applicationInsights: {
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    authenticationString: process.env.APPLICATIONINSIGHTS_AUTHENTICATION_STRING,
  },

  /**
   * Development mode
   */
  developmentMode: process.env.NODE_ENV === 'development',
};
