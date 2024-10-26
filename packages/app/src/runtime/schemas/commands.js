import { z } from 'zod';
import { zId } from './utils.js';

export const CommandSchema = z.object({
    path: z.string(),
    entity: zId('Command ID', z.string())
});

export const CommandsSchema = z.array(CommandSchema);

