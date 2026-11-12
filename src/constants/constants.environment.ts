import '../config/config.dotenv';

const dotenv = {
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID || 'google.gemma-3-12b-it',
};

export default dotenv;
