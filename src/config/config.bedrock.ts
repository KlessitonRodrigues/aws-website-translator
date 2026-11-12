import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

import dotenv from '../constants/constants.environment';

const bedrockClient = new BedrockRuntimeClient({
  region: dotenv.AWS_REGION,
});

export const bedrockModelId = dotenv.BEDROCK_MODEL_ID;

export default bedrockClient;
