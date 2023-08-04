import { Timestamp } from '../../common';
export interface INotification {
    time: Timestamp;
    read?: Timestamp;
    content: string;
    href: string;
}
