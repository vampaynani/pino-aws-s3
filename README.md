# pino-aws-s3

This module provides a "transport" for pino that simply forwards messages to AWS S3.

### Usage as Pino Transport

You can use this module as a pino transport like so:

```javascript
const pino = require("pino");
const transport = pino.transport({
  target: "@vampaynani/pino-aws-s3",
  options: {},
});
pino(transport);
```
