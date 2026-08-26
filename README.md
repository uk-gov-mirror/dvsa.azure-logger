# Azure Logger

Winston Logger with a custom Azure Application Insights Transport

### Logging levels
* critical
* error
* warning
* event
* request
* dependency
* security
* audit
* info
* debug

## Installation

If using npm:
```
npm install @dvsa/azure-logger
```
or if using Yarn
```
yarn add @dvsa/azure-logger
```

Specify the environment variables in a .env file, for example
```
LOG_LEVEL=event

NODE_ENV=development

APPLICATIONINSIGHTS_CONNECTION_STRING={APPLICATION_INSIGHTS_CONNECTION_STRING}

APPLICATIONINSIGHTS_AUTHENTICATION_STRING={APPLICATION_INSIGHTS_AUTHENTICATION_STRING}
```
## Example Use:

1) Create a file logger.ts and export the azure logger from it, instantiating it with the project and component names.
```typescript
import { Logger } from '@dvsa/azure-logger';

export default new Logger('ftts', 'ftts-location-api');
```

2) For Azure Functions, two wrappers are provided to enable auto correlation of all logs and telemetry including external requests and dependencies.
For HTTP triggers use the `httpTriggerContextWrapper` with req passed in. Use `nonHttpTriggerContextWrapper` for all other trigger types.
For example, wrap a time trigger function in your function index file like so:
```typescript
import { nonHttpTriggerContextWrapper } from '@dvsa/azure-logger';
import { AzureFunction, Context } from '@azure/functions';

const myTimeTrigger: AzureFunction = async (): Promise<void> => {
    // do something
};

export default async (context: Context): Promise<void> => nonHttpTriggerContextWrapper(myTimeTrigger, context);
```

Request and dependency log methods are still provided for manual tracing if it is needed e.g. for service bus correlation.
These require context to be passed in to fetch the correct trace ids.

3) Whenever you want to log an item import the logger.ts file.
```typescript
import logger from './logger';

function getData(): void {
    try {
        // Do calculations
    } catch(error) {
        logger.error(error);
    }
}
```

## APPLICATIONINSIGHTS_CONNECTION_STRING

When using an Azure function app, set this environment variable to the connection string for the Application Insights instance you wish to use.
  
APPLICATIONINSIGHTS_CONNECTION_STRING

## APPLICATIONINSIGHTS_AUTHENTICATION_STRING

Set this to `Authorization=AAD` to enable Microsoft Entra (managed identity) authentication for Application Insights. You can also include `ClientId=<user-assigned-managed-identity-client-id>`. Unsupported values are rejected.

APPLICATIONINSIGHTS_AUTHENTICATION_STRING
