import type { Configuration } from './configuration';
import type { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from './common';
import type { RequestArgs } from './base';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, BaseAPI, RequiredError, API_VERSION } from './base';
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

export const Scout9ApiAxiosParamCreator = function (configuration?: Configuration) {
  return {

    /**
     *
     * @summary Creates a model response for the given chat conversation.
     * @param {ICustomerCreateRequest} createCustomerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createCustomer: async (createCustomerRequest: ICustomerCreateRequest, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'createChatCompletionRequest' is not null or undefined
      assertParamExists('createCustomer', 'createCustomerRequest', createCustomerRequest);
      const localVarPath = `${configuration?.apiVersion || ''}-customers-customer-create`;
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {method: 'POST', ...baseOptions, ...options};
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      localVarHeaderParameter['Content-Type'] = 'application/json';

      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
      localVarRequestOptions.data = serializeDataIfNeeded(createCustomerRequest, localVarRequestOptions, configuration);

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },


  };
};

/**
 * Scout9Api - functional programming interface
 * @export
 */
export const Scout9ApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = Scout9ApiAxiosParamCreator(configuration);
  return {
    /**
     *
     * @summary Creates a model response for the given chat conversation.
     * @param {ICustomerCreateRequest} createCustomerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createCustomer(createCustomerRequest: ICustomerCreateRequest, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ICustomerCreateResponse>> {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createCustomer(createCustomerRequest, options);
      return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
    },
  };
};

/**
 * Scout9Api - object-oriented interface
 * @export
 * @class Scout9Api
 * @extends {BaseAPI}
 */
export class Scout9Api extends BaseAPI {

  /**
   *
   * @summary Creates a model response for the given chat conversation.
   * @param {ICustomerCreateRequest} createCustomerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof Scout9Api
   */
  public createCustomer(createCustomerRequest: ICustomerCreateRequest, options?: AxiosRequestConfig) {
    return Scout9ApiFp(this.configuration)
      .createCustomer(createCustomerRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

}
