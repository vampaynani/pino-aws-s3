import build from "pino-abstract-transport";
import {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

async function pinoAWSCloudWatch(
  options = { region, accessKeyId, secretAccessKey }
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
        const task = uploadDataToCW(options, line);
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

export const uploadDataToCW = (options, lines) => {
  const client = new CloudWatchLogsClient({
    region: options.region,
    credentials: {
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
    },
    maxAttempts: 3,
  });
  const logGroupName = "/aws/lambda/vercel-log-drain"; // Change to your log group
  const logStreamName = `${new Date()
    .toISOString()
    .replace(/:/g, "-")}-platform-log`;
  const createLogGroup = async () => {
    try {
      await client.send(new CreateLogGroupCommand({ logGroupName }));
    } catch (err) {
      if (err.name !== "ResourceAlreadyExistsException") {
        console.error("Error creating log group:", err);
      }
    }
  };

  const createLogStream = async () => {
    try {
      await client.send(
        new CreateLogStreamCommand({ logGroupName, logStreamName })
      );
    } catch (err) {
      if (err.name !== "ResourceAlreadyExistsException") {
        console.error("Error creating log stream:", err);
      }
    }
  };

  const logEvent = async (message) => {
    await createLogGroup();
    await createLogStream();

    const params = {
      logGroupName,
      logStreamName,
      logEvents: [
        {
          message,
          timestamp: Date.now(),
        },
      ],
    };

    try {
      await client.send(new PutLogEventsCommand(params));
    } catch (err) {
      console.error("Error sending log:", err);
    }
  };

  return logEvent(lines);
};

export default pinoAWSCloudWatch;
