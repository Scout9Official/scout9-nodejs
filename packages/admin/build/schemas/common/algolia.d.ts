/**
 * Helper schedule to bridge algolia records with internal db
 */
export interface IAlgoliaIndexedObject {
    /**
     * Where this object is stored in the database
     */
    parent: string;
    /**
     * Algolia objectID required
     */
    objectID: string;
    /**
     * Algolia geolocation for a given object
     */
    _geoloc?: {
        lat: number;
        lng: number;
    };
}
