"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scout9Api = exports.Scout9ApiFp = exports.Scout9ApiAxiosParamCreator = void 0;
const axios_1 = __importDefault(require("axios"));
// Some imports not used depending on template conditions
// @ts-ignore
const common_1 = require("./common");
// @ts-ignore
const base_1 = require("./base");
const Scout9ApiAxiosParamCreator = function (configuration) {
    return {
        /**
         *
         * @summary Creates a model response for the given chat conversation.
         * @param {ICustomerCreateRequest} createCustomerRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createCustomer: async (createCustomerRequest, options = {}) => {
            // verify required parameter 'createChatCompletionRequest' is not null or undefined
            (0, common_1.assertParamExists)('createCustomer', 'createCustomerRequest', createCustomerRequest);
            const localVarPath = `${configuration?.apiVersion || ''}-customers-customer-create`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            localVarRequestOptions.data = (0, common_1.serializeDataIfNeeded)(createCustomerRequest, localVarRequestOptions, configuration);
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    };
};
exports.Scout9ApiAxiosParamCreator = Scout9ApiAxiosParamCreator;
/**
 * Scout9Api - functional programming interface
 * @export
 */
const Scout9ApiFp = function (configuration) {
    const localVarAxiosParamCreator = (0, exports.Scout9ApiAxiosParamCreator)(configuration);
    return {
        /**
         *
         * @summary Creates a model response for the given chat conversation.
         * @param {ICustomerCreateRequest} createCustomerRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createCustomer(createCustomerRequest, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createCustomer(createCustomerRequest, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
    };
};
exports.Scout9ApiFp = Scout9ApiFp;
/**
 * Scout9Api - object-oriented interface
 * @export
 * @class Scout9Api
 * @extends {BaseAPI}
 */
class Scout9Api extends base_1.BaseAPI {
    /**
     *
     * @summary Creates a model response for the given chat conversation.
     * @param {ICustomerCreateRequest} createCustomerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof Scout9Api
     */
    createCustomer(createCustomerRequest, options) {
        return (0, exports.Scout9ApiFp)(this.configuration)
            .createCustomer(createCustomerRequest, options)
            .then((request) => request(this.axios, this.basePath));
    }
}
exports.Scout9Api = Scout9Api;
