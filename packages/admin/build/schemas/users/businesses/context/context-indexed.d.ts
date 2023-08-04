import { IAlgoliaIndexedObject } from '../../../common';
import { IContext } from './context';
/**
 * scout9-businesses/{businessId}/context-indexed/{context}
 * An auto generated context, when a context category is created it will be indexed in a collection, resolving all stripe and
 * algolia references.
 */
export interface IContextIndexed extends IContext, IAlgoliaIndexedObject {
}
