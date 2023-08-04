import { Timestamp } from '../../../common';
import { ConversationEnvironment } from '../../../conversations';

export interface IAgentReAuth {
  time: Timestamp;
  platform: ConversationEnvironment;
  sent?: Timestamp;
}
