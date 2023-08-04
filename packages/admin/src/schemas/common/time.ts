import moment from 'moment';
import { ISOString, Timestamp } from '../common';

export interface ITimeRange {
  from: ISOString;
  to: ISOString;
}
export interface ITimeRangeTimestamp {
  from: Timestamp;
  to: Timestamp;
}
export interface ITimeRangeMoment {
  from: moment.Moment;
  to: moment.Moment;
}
