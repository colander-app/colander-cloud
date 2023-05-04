# Colander Cloud

This project contains all back-end service code and serverless framework configuration (including dynamo tables). The service uses Websockets provided via AWS API Gateway as the external entrypoint for the client web application. The other main entrypoint into this project is through dynamo stream handlers. This project is built using a serverless event based design, where data entry / modification happens at the websocket API level, then the majority of business logic is handled afterwards by reacting to changes in the database records.

## Services

### src/anonymous

The anonymous service provides authentication via an unauthenticated websocket endpoint. This allows the client app to negotiate authentication into the other services before requiring a connection level authentication token.

### src/event

The event service provides managing events and subscriptions to events. Subscriptions are built around subscribing to a date range and list of resources which will be used as filter when events change in dynamo to determine what to send over the websocket channel for a given client.

### src/organization

The organization service handles a few more models than just the organizations. It also manages projects, resoureces, resourceLayouts and users. There is also a subscription manager in this service to listen for changes to any resource that is connected to a given organization. This design was chosen as an initial design because the amount of each of the given models in the Org database connected to a given organization is relatively static and usually not that large for most small businesses. This makes subscribing to an entire orgs resources (excluding events) not a major technical resource burden. Changes to this design can be made if this ever seems to present a performance or cost hit deemed unreasonable.

### src/websocket

The websocket service creates the authenticated websocket in API gateway and the authorization handler function that the other stacks will utilize to authenticate clients. This is very incomplete and the logic is very simple for policy generation, mostly to bootstrap this project to have a working MVP. This will ultimately customize the policy document based on the authorized user and provide better protection mechanisms when validating JWT's.
