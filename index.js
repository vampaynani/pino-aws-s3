import build from "pino-abstract-transport";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

async function pinoAWSS3(
  options = { region, accessKeyId, secretAccessKey, bucket, folderName }
) {
  /**
   * @type {Array<Promise>} Send tasks.
   */
  const tasks = [];

  return build(
    async (source) => {
      if (!options.pinoWillSendConfig) {
        return source;
      }
      // We use an async iterator to read log lines.
      for await (let line of source) {
        const task = uploadDataToS3(options, line);
        tasks.push(task);
      }
      return source;
    },
    {
      parse: "lines",
      async close() {
        // Wait for all send tasks to complete.
        await Promise.all(tasks);
      },
    }
  );
}

export const uploadDataToS3 = (options, lines) => {
  const s3 = new S3Client({
    region: options.region,
    credentials: {
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
    },
    maxAttempts: 3,
  });
  const key = `${new Date().toISOString()}.log`;
  const params = {
    Bucket: options.bucket,
    Key: key,
    Body: lines,
  };
  const command = new PutObjectCommand(params);
  return s3.send(command);
};

export default pinoAWSS3;
