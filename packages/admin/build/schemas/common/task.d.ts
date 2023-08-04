import { Timestamp } from '../common';
export interface ITask {
    /**
     * Unique token for processing
     */
    token?: string;
    /**
     * Time when the task was created
     */
    time: Timestamp;
    /**
     * When was the task completed
     */
    completed?: Timestamp;
    retries?: number;
}
export interface IQueueTask {
    token: string;
    taskPath: string;
}
