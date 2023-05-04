# Colander Cloud

This project contains all back-end service code and serverless framework configuration (including dynamo tables). The service uses Websockets provided via AWS API Gateway as the external entrypoint for the client web application. The other main entrypoint into this project is through dynamo stream handlers. This project is built using a serverless event based design, where data entry / modification happens at the websocket API level, then the majority of business logic is handled afterwards by reacting to changes in the database records.
