import { ThreadLanguage } from '../thread';

/**
 * Used to build NLP models to detect context invocation
 */
export interface IContextDetectionParams {

  /**
   * Key word entities to detect in a contacts message
   */
  entities: {
    /**
     * @deprecated
     */
    utteranceId?: string;
    option: string;
    languages: ThreadLanguage[];
    text: string[];
  }[];

  /**
   * Documents or phrases to train the model
   */
  documents: {
    language: ThreadLanguage;
    text: string;
    id: string;
  }[];
}

/**
 * scout9-businesses/{businessId}/context/{$id}
 *
 * Context field to be used for conversation context and workflows
 */
export interface IContext {

  /**
   * Context $id - this is used to store the context data under the given collection
   * scout9-businesses/{businessId}/{$id}/{row}
   */
  $id: string;

  /**
   * Name of the context
   */
  name: string;

  modifiable: boolean;

  /**
   * Description of the context
   */
  description?: string;

  /**
   * If provided, this can be used to detect if a given message is invoking this context
   */
  detection?: IContextDetectionParams;

  /**
   * The column that represents the id of a given context row
   */
  idColumn: string;

  /**
   * Column fields that could exist in the context
   */
  columns: string[];

  /**
   * If provided this will enforce that the given columns are required
   * NOTE: idColumn by default is required
   */
  requiredColumns?: string[];
}
