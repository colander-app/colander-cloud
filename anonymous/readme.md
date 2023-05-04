# Authentication Service

### Magic Link Grant

- Client connects to anonymous websocket
- User enters in email address
- Client sends an authorization request: `{ action: 'initMagicLogin', data: { email: 'email@company.com' } }`
- Lambda creates authorization code in DDB
- Stream handler sends an email to user with the code
- User enters in authorization code
- Client sends an authorization complete request: `{ action: 'completeMagicLogin', data: { code: '1234' } }`
- Lambda verifies authorization code (additional measures to be defined)
- Lambda creates an authorization token record
- Stream handler packages auth token record data into JWT and sends it to websocket
- Client receives A/R tokens, stores R token in local storage, sets up Auth websocket with new access token
