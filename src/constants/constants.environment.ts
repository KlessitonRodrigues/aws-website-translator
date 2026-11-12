import '../config/config.dotenv';

// sort-imports-ignore

const dotenv = {
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID || 'nvidia.nemotron-nano-3-30b',
};

export default dotenv;
