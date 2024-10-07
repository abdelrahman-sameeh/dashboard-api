const { SESClient } = require("@aws-sdk/client-ses");

const awsConfig = {
  region: process.env.AWS_REGION,
  ses: new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Access key from environment variable
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Secret key from environment variable
    },
  }),
};

module.exports = awsConfig;
