# pino-aws

This module provides a "transport" for pino that simply forwards messages to AWS S3 or Cloudwatch.

### Usage as Pino Transport

You can use this module as a pino transport like so:

#### Cloudwatch

```javascript
const pino = require("pino");
const transport = pino.transport({
  target: "@vampaynani/pino-aws/lib/cloudwatch",
  options: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESKEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESKEY,
  },
});
pino(transport);
```

#### S3

```javascript
const pino = require("pino");
const transport = pino.transport({
  target: "@vampaynani/pino-aws/lib/s3",
  options: {
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET,
    accessKeyId: process.env.AWS_ACCESKEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESKEY,
  },
});
pino(transport);
```
