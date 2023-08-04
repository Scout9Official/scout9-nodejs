import { Timestamp } from '../../../common';

/**
 * When a context field receives uploaded bulk data (csv/excel/json)
 * scout9-businesses/{businessId}/context/{context}/saves/{save_time}
 */
export interface IContextSaves {

  /**
   * Where the file was saved
   */
  ref: string;
  time: Timestamp
}
