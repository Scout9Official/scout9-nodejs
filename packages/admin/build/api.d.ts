import type { Configuration } from './configuration';
import type { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
import type { RequestArgs } from './base';
import { BaseAPI } from './base';
import { ICustomer } from './schemas';
export type ICustomerCreateRequest = ICustomer;
export interface ICustomerCreateResponse {
    success: boolean;
}
export type ICustomerUpdateRequest = Partial<ICustomer>;
export interface ICustomerUpdateResponse {
    success: boolean;
}
export interface ICustomerRemoveRequest {
    customer: string;
}
export interface ICustomerRemoveResponse {
    success: boolean;
}
export interface ICustomerCreateBulkRequest {
    customers: ICustomer[];
}
export interface ICustomerCreateBulkResponse {
    success: boolean;
}
export interface ICustomerRemoveBulkRequest {
    customers: string[];
}
export interface ICustomerRemoveBulkResponse {
    success: boolean;
}
export interface ICustomerUpdateBulkRequest {
    customers: Partial<ICustomer>[];
}
export interface ICustomerUpdateBulkResponse {
    success: boolean;
}
export declare const Scout9ApiAxiosParamCreator: (configuration?: Configuration) => {
    /**
     *
     * @summary Creates a model response for the given chat conversation.
     * @param {ICustomerCreateRequest} createCustomerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createCustomer: (createCustomerRequest: ICustomerCreateRequest, options?: AxiosRequestConfig) => Promise<RequestArgs>;
};
/**
 * Scout9Api - functional programming interface
 * @export
 */
export declare const Scout9ApiFp: (configuration?: Configuration) => {
    /**
     *
     * @summary Creates a model response for the given chat conversation.
     * @param {ICustomerCreateRequest} createCustomerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createCustomer(createCustomerRequest: ICustomerCreateRequest, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ICustomerCreateResponse>>;
};
/**
 * Scout9Api - object-oriented interface
 * @export
 * @class Scout9Api
 * @extends {BaseAPI}
 */
export declare class Scout9Api extends BaseAPI {
    /**
     *
     * @summary Creates a model response for the given chat conversation.
     * @param {ICustomerCreateRequest} createCustomerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof Scout9Api
     */
    createCustomer(createCustomerRequest: ICustomerCreateRequest, options?: AxiosRequestConfig): Promise<import("axios").AxiosResponse<ICustomerCreateResponse, any>>;
}
