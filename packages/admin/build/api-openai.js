"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIApi = exports.OpenAIApiFactory = exports.OpenAIApiFp = exports.OpenAIApiAxiosParamCreator = exports.CreateImageRequestResponseFormatEnum = exports.CreateImageRequestSizeEnum = exports.ChatCompletionResponseMessageRoleEnum = exports.ChatCompletionRequestMessageRoleEnum = void 0;
const axios_1 = __importDefault(require("axios"));
// Some imports not used depending on template conditions
// @ts-ignore
const common_1 = require("./common");
// @ts-ignore
const base_1 = require("./base");
exports.ChatCompletionRequestMessageRoleEnum = {
    System: 'system',
    User: 'user',
    Assistant: 'assistant',
    Function: 'function'
};
exports.ChatCompletionResponseMessageRoleEnum = {
    System: 'system',
    User: 'user',
    Assistant: 'assistant',
    Function: 'function'
};
exports.CreateImageRequestSizeEnum = {
    _256x256: '256x256',
    _512x512: '512x512',
    _1024x1024: '1024x1024'
};
exports.CreateImageRequestResponseFormatEnum = {
    Url: 'url',
    B64Json: 'b64_json'
};
/**
 * OpenAIApi - axios parameter creator
 * @export
 */
const OpenAIApiAxiosParamCreator = function (configuration) {
    return {
        /**
         *
         * @summary Immediately cancel a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to cancel
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        cancelFineTune: async (fineTuneId, options = {}) => {
            // verify required parameter 'fineTuneId' is not null or undefined
            (0, common_1.assertParamExists)('cancelFineTune', 'fineTuneId', fineTuneId);
            const localVarPath = `/fine-tunes/{fine_tune_id}/cancel`
                .replace(`{${"fine_tune_id"}}`, encodeURIComponent(String(fineTuneId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
         * @param {CreateAnswerRequest} createAnswerRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createAnswer: async (createAnswerRequest, options = {}) => {
            // verify required parameter 'createAnswerRequest' is not null or undefined
            (0, common_1.assertParamExists)('createAnswer', 'createAnswerRequest', createAnswerRequest);
            const localVarPath = `/answers`;
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
            localVarRequestOptions.data = (0, common_1.serializeDataIfNeeded)(createAnswerRequest, localVarRequestOptions, configuration);
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Creates a model response for the given chat conversation.
         * @param {CreateChatCompletionRequest} createChatCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createChatCompletion: async (createChatCompletionRequest, options = {}) => {
            // verify required parameter 'createChatCompletionRequest' is not null or undefined
            (0, common_1.assertParamExists)('createChatCompletion', 'createChatCompletionRequest', createChatCompletionRequest);
            const localVarPath = `/chat/completions`;
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
            localVarRequestOptions.data = (0, common_1.serializeDataIfNeeded)(createChatCompletionRequest, localVarRequestOptions, configuration);
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
         * @param {CreateClassificationRequest} createClassificationRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createClassification: async (createClassificationRequest, options = {}) => {
            // verify required parameter 'createClassificationRequest' is not null or undefined
            (0, common_1.assertParamExists)('createClassification', 'createClassificationRequest', createClassificationRequest);
            const localVarPath = `/classifications`;
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
            localVarRequestOptions.data = (0, common_1.serializeDataIfNeeded)(createClassificationRequest, localVarRequestOptions, configuration);
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Creates a completion for the provided prompt and parameters.
         * @param {CreateCompletionRequest} createCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createCompletion: async (createCompletionRequest, options = {}) => {
            // verify required parameter 'createCompletionRequest' is not null or undefined
            (0, common_1.assertParamExists)('createCompletion', 'createCompletionRequest', createCompletionRequest);
            const localVarPath = `/completions`;
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
            localVarRequestOptions.data = (0, common_1.serializeDataIfNeeded)(createCompletionRequest, localVarRequestOptions, configuration);
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Creates a new edit for the provided input, instruction, and parameters.
         * @param {CreateEditRequest} createEditRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEdit: async (createEditRequest, options = {}) => {
            // verify required parameter 'createEditRequest' is not null or undefined
            (0, common_1.assertParamExists)('createEdit', 'createEditRequest', createEditRequest);
            const localVarPath = `/edits`;
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
            localVarRequestOptions.data = (0, common_1.serializeDataIfNeeded)(createEditRequest, localVarRequestOptions, configuration);
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Creates an embedding vector representing the input text.
         * @param {CreateEmbeddingRequest} createEmbeddingRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEmbedding: async (createEmbeddingRequest, options = {}) => {
            // verify required parameter 'createEmbeddingRequest' is not null or undefined
            (0, common_1.assertParamExists)('createEmbedding', 'createEmbeddingRequest', createEmbeddingRequest);
            const localVarPath = `/embeddings`;
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
            localVarRequestOptions.data = (0, common_1.serializeDataIfNeeded)(createEmbeddingRequest, localVarRequestOptions, configuration);
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
         * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
         * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFile: async (file, purpose, options = {}) => {
            // verify required parameter 'file' is not null or undefined
            (0, common_1.assertParamExists)('createFile', 'file', file);
            // verify required parameter 'purpose' is not null or undefined
            (0, common_1.assertParamExists)('createFile', 'purpose', purpose);
            const localVarPath = `/files`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (file !== undefined) {
                localVarFormParams.append('file', file);
            }
            if (purpose !== undefined) {
                localVarFormParams.append('purpose', purpose);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...localVarFormParams.getHeaders(), ...headersFromBaseOptions, ...options.headers };
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {CreateFineTuneRequest} createFineTuneRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFineTune: async (createFineTuneRequest, options = {}) => {
            // verify required parameter 'createFineTuneRequest' is not null or undefined
            (0, common_1.assertParamExists)('createFineTune', 'createFineTuneRequest', createFineTuneRequest);
            const localVarPath = `/fine-tunes`;
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
            localVarRequestOptions.data = (0, common_1.serializeDataIfNeeded)(createFineTuneRequest, localVarRequestOptions, configuration);
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Creates an image given a prompt.
         * @param {CreateImageRequest} createImageRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImage: async (createImageRequest, options = {}) => {
            // verify required parameter 'createImageRequest' is not null or undefined
            (0, common_1.assertParamExists)('createImage', 'createImageRequest', createImageRequest);
            const localVarPath = `/images/generations`;
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
            localVarRequestOptions.data = (0, common_1.serializeDataIfNeeded)(createImageRequest, localVarRequestOptions, configuration);
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Creates an edited or extended image given an original image and a prompt.
         * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
         * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
         * @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageEdit: async (image, prompt, mask, n, size, responseFormat, user, options = {}) => {
            // verify required parameter 'image' is not null or undefined
            (0, common_1.assertParamExists)('createImageEdit', 'image', image);
            // verify required parameter 'prompt' is not null or undefined
            (0, common_1.assertParamExists)('createImageEdit', 'prompt', prompt);
            const localVarPath = `/images/edits`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (image !== undefined) {
                localVarFormParams.append('image', image);
            }
            if (mask !== undefined) {
                localVarFormParams.append('mask', mask);
            }
            if (prompt !== undefined) {
                localVarFormParams.append('prompt', prompt);
            }
            if (n !== undefined) {
                localVarFormParams.append('n', n);
            }
            if (size !== undefined) {
                localVarFormParams.append('size', size);
            }
            if (responseFormat !== undefined) {
                localVarFormParams.append('response_format', responseFormat);
            }
            if (user !== undefined) {
                localVarFormParams.append('user', user);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...localVarFormParams.getHeaders(), ...headersFromBaseOptions, ...options.headers };
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Creates a variation of a given image.
         * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageVariation: async (image, n, size, responseFormat, user, options = {}) => {
            // verify required parameter 'image' is not null or undefined
            (0, common_1.assertParamExists)('createImageVariation', 'image', image);
            const localVarPath = `/images/variations`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (image !== undefined) {
                localVarFormParams.append('image', image);
            }
            if (n !== undefined) {
                localVarFormParams.append('n', n);
            }
            if (size !== undefined) {
                localVarFormParams.append('size', size);
            }
            if (responseFormat !== undefined) {
                localVarFormParams.append('response_format', responseFormat);
            }
            if (user !== undefined) {
                localVarFormParams.append('user', user);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...localVarFormParams.getHeaders(), ...headersFromBaseOptions, ...options.headers };
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Classifies if text violates OpenAI\'s Content Policy
         * @param {CreateModerationRequest} createModerationRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createModeration: async (createModerationRequest, options = {}) => {
            // verify required parameter 'createModerationRequest' is not null or undefined
            (0, common_1.assertParamExists)('createModeration', 'createModerationRequest', createModerationRequest);
            const localVarPath = `/moderations`;
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
            localVarRequestOptions.data = (0, common_1.serializeDataIfNeeded)(createModerationRequest, localVarRequestOptions, configuration);
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
         * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
         * @param {CreateSearchRequest} createSearchRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createSearch: async (engineId, createSearchRequest, options = {}) => {
            // verify required parameter 'engineId' is not null or undefined
            (0, common_1.assertParamExists)('createSearch', 'engineId', engineId);
            // verify required parameter 'createSearchRequest' is not null or undefined
            (0, common_1.assertParamExists)('createSearch', 'createSearchRequest', createSearchRequest);
            const localVarPath = `/engines/{engine_id}/search`
                .replace(`{${"engine_id"}}`, encodeURIComponent(String(engineId)));
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
            localVarRequestOptions.data = (0, common_1.serializeDataIfNeeded)(createSearchRequest, localVarRequestOptions, configuration);
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Transcribes audio into the input language.
         * @param {File} file The audio file object (not file name) to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranscription: async (file, model, prompt, responseFormat, temperature, language, options = {}) => {
            // verify required parameter 'file' is not null or undefined
            (0, common_1.assertParamExists)('createTranscription', 'file', file);
            // verify required parameter 'model' is not null or undefined
            (0, common_1.assertParamExists)('createTranscription', 'model', model);
            const localVarPath = `/audio/transcriptions`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (file !== undefined) {
                localVarFormParams.append('file', file);
            }
            if (model !== undefined) {
                localVarFormParams.append('model', model);
            }
            if (prompt !== undefined) {
                localVarFormParams.append('prompt', prompt);
            }
            if (responseFormat !== undefined) {
                localVarFormParams.append('response_format', responseFormat);
            }
            if (temperature !== undefined) {
                localVarFormParams.append('temperature', temperature);
            }
            if (language !== undefined) {
                localVarFormParams.append('language', language);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...localVarFormParams.getHeaders(), ...headersFromBaseOptions, ...options.headers };
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Translates audio into into English.
         * @param {File} file The audio file object (not file name) translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranslation: async (file, model, prompt, responseFormat, temperature, options = {}) => {
            // verify required parameter 'file' is not null or undefined
            (0, common_1.assertParamExists)('createTranslation', 'file', file);
            // verify required parameter 'model' is not null or undefined
            (0, common_1.assertParamExists)('createTranslation', 'model', model);
            const localVarPath = `/audio/translations`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (file !== undefined) {
                localVarFormParams.append('file', file);
            }
            if (model !== undefined) {
                localVarFormParams.append('model', model);
            }
            if (prompt !== undefined) {
                localVarFormParams.append('prompt', prompt);
            }
            if (responseFormat !== undefined) {
                localVarFormParams.append('response_format', responseFormat);
            }
            if (temperature !== undefined) {
                localVarFormParams.append('temperature', temperature);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...localVarFormParams.getHeaders(), ...headersFromBaseOptions, ...options.headers };
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Delete a file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteFile: async (fileId, options = {}) => {
            // verify required parameter 'fileId' is not null or undefined
            (0, common_1.assertParamExists)('deleteFile', 'fileId', fileId);
            const localVarPath = `/files/{file_id}`
                .replace(`{${"file_id"}}`, encodeURIComponent(String(fileId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'DELETE', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
         * @param {string} model The model to delete
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteModel: async (model, options = {}) => {
            // verify required parameter 'model' is not null or undefined
            (0, common_1.assertParamExists)('deleteModel', 'model', model);
            const localVarPath = `/models/{model}`
                .replace(`{${"model"}}`, encodeURIComponent(String(model)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'DELETE', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Returns the contents of the specified file
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        downloadFile: async (fileId, options = {}) => {
            // verify required parameter 'fileId' is not null or undefined
            (0, common_1.assertParamExists)('downloadFile', 'fileId', fileId);
            const localVarPath = `/files/{file_id}/content`
                .replace(`{${"file_id"}}`, encodeURIComponent(String(fileId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        listEngines: async (options = {}) => {
            const localVarPath = `/engines`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Returns a list of files that belong to the user\'s organization.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFiles: async (options = {}) => {
            const localVarPath = `/files`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Get fine-grained status updates for a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to get events for.
         * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTuneEvents: async (fineTuneId, stream, options = {}) => {
            // verify required parameter 'fineTuneId' is not null or undefined
            (0, common_1.assertParamExists)('listFineTuneEvents', 'fineTuneId', fineTuneId);
            const localVarPath = `/fine-tunes/{fine_tune_id}/events`
                .replace(`{${"fine_tune_id"}}`, encodeURIComponent(String(fineTuneId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            if (stream !== undefined) {
                localVarQueryParameter['stream'] = stream;
            }
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary List your organization\'s fine-tuning jobs
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTunes: async (options = {}) => {
            const localVarPath = `/fine-tunes`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listModels: async (options = {}) => {
            const localVarPath = `/models`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
         * @param {string} engineId The ID of the engine to use for this request
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        retrieveEngine: async (engineId, options = {}) => {
            // verify required parameter 'engineId' is not null or undefined
            (0, common_1.assertParamExists)('retrieveEngine', 'engineId', engineId);
            const localVarPath = `/engines/{engine_id}`
                .replace(`{${"engine_id"}}`, encodeURIComponent(String(engineId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Returns information about a specific file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFile: async (fileId, options = {}) => {
            // verify required parameter 'fileId' is not null or undefined
            (0, common_1.assertParamExists)('retrieveFile', 'fileId', fileId);
            const localVarPath = `/files/{file_id}`
                .replace(`{${"file_id"}}`, encodeURIComponent(String(fileId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {string} fineTuneId The ID of the fine-tune job
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFineTune: async (fineTuneId, options = {}) => {
            // verify required parameter 'fineTuneId' is not null or undefined
            (0, common_1.assertParamExists)('retrieveFineTune', 'fineTuneId', fineTuneId);
            const localVarPath = `/fine-tunes/{fine_tune_id}`
                .replace(`{${"fine_tune_id"}}`, encodeURIComponent(String(fineTuneId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
         * @param {string} model The ID of the model to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveModel: async (model, options = {}) => {
            // verify required parameter 'model' is not null or undefined
            (0, common_1.assertParamExists)('retrieveModel', 'model', model);
            const localVarPath = `/models/{model}`
                .replace(`{${"model"}}`, encodeURIComponent(String(model)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options };
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            (0, common_1.setSearchParams)(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            return {
                url: (0, common_1.toPathString)(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    };
};
exports.OpenAIApiAxiosParamCreator = OpenAIApiAxiosParamCreator;
/**
 * OpenAIApi - functional programming interface
 * @export
 */
const OpenAIApiFp = function (configuration) {
    const localVarAxiosParamCreator = (0, exports.OpenAIApiAxiosParamCreator)(configuration);
    return {
        /**
         *
         * @summary Immediately cancel a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to cancel
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async cancelFineTune(fineTuneId, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.cancelFineTune(fineTuneId, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
         * @param {CreateAnswerRequest} createAnswerRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        async createAnswer(createAnswerRequest, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createAnswer(createAnswerRequest, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Creates a model response for the given chat conversation.
         * @param {CreateChatCompletionRequest} createChatCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createChatCompletion(createChatCompletionRequest, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createChatCompletion(createChatCompletionRequest, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
         * @param {CreateClassificationRequest} createClassificationRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        async createClassification(createClassificationRequest, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createClassification(createClassificationRequest, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Creates a completion for the provided prompt and parameters.
         * @param {CreateCompletionRequest} createCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createCompletion(createCompletionRequest, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createCompletion(createCompletionRequest, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Creates a new edit for the provided input, instruction, and parameters.
         * @param {CreateEditRequest} createEditRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createEdit(createEditRequest, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createEdit(createEditRequest, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Creates an embedding vector representing the input text.
         * @param {CreateEmbeddingRequest} createEmbeddingRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createEmbedding(createEmbeddingRequest, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createEmbedding(createEmbeddingRequest, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
         * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
         * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createFile(file, purpose, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createFile(file, purpose, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {CreateFineTuneRequest} createFineTuneRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createFineTune(createFineTuneRequest, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createFineTune(createFineTuneRequest, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Creates an image given a prompt.
         * @param {CreateImageRequest} createImageRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createImage(createImageRequest, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createImage(createImageRequest, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Creates an edited or extended image given an original image and a prompt.
         * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
         * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
         * @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createImageEdit(image, prompt, mask, n, size, responseFormat, user, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createImageEdit(image, prompt, mask, n, size, responseFormat, user, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Creates a variation of a given image.
         * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createImageVariation(image, n, size, responseFormat, user, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createImageVariation(image, n, size, responseFormat, user, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Classifies if text violates OpenAI\'s Content Policy
         * @param {CreateModerationRequest} createModerationRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createModeration(createModerationRequest, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createModeration(createModerationRequest, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
         * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
         * @param {CreateSearchRequest} createSearchRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        async createSearch(engineId, createSearchRequest, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createSearch(engineId, createSearchRequest, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Transcribes audio into the input language.
         * @param {File} file The audio file object (not file name) to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createTranscription(file, model, prompt, responseFormat, temperature, language, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createTranscription(file, model, prompt, responseFormat, temperature, language, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Translates audio into into English.
         * @param {File} file The audio file object (not file name) translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createTranslation(file, model, prompt, responseFormat, temperature, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createTranslation(file, model, prompt, responseFormat, temperature, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Delete a file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async deleteFile(fileId, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.deleteFile(fileId, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
         * @param {string} model The model to delete
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async deleteModel(model, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.deleteModel(model, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Returns the contents of the specified file
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async downloadFile(fileId, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.downloadFile(fileId, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        async listEngines(options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.listEngines(options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Returns a list of files that belong to the user\'s organization.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async listFiles(options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.listFiles(options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Get fine-grained status updates for a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to get events for.
         * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async listFineTuneEvents(fineTuneId, stream, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.listFineTuneEvents(fineTuneId, stream, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary List your organization\'s fine-tuning jobs
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async listFineTunes(options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.listFineTunes(options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async listModels(options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.listModels(options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
         * @param {string} engineId The ID of the engine to use for this request
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        async retrieveEngine(engineId, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveEngine(engineId, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Returns information about a specific file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async retrieveFile(fileId, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveFile(fileId, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {string} fineTuneId The ID of the fine-tune job
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async retrieveFineTune(fineTuneId, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveFineTune(fineTuneId, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
         * @param {string} model The ID of the model to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async retrieveModel(model, options) {
            const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveModel(model, options);
            return (0, common_1.createRequestFunction)(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
        },
    };
};
exports.OpenAIApiFp = OpenAIApiFp;
/**
 * OpenAIApi - factory interface
 * @export
 */
const OpenAIApiFactory = function (configuration, basePath, axios) {
    const localVarFp = (0, exports.OpenAIApiFp)(configuration);
    return {
        /**
         *
         * @summary Immediately cancel a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to cancel
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        cancelFineTune(fineTuneId, options) {
            return localVarFp.cancelFineTune(fineTuneId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
         * @param {CreateAnswerRequest} createAnswerRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createAnswer(createAnswerRequest, options) {
            return localVarFp.createAnswer(createAnswerRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a model response for the given chat conversation.
         * @param {CreateChatCompletionRequest} createChatCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createChatCompletion(createChatCompletionRequest, options) {
            return localVarFp.createChatCompletion(createChatCompletionRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
         * @param {CreateClassificationRequest} createClassificationRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createClassification(createClassificationRequest, options) {
            return localVarFp.createClassification(createClassificationRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a completion for the provided prompt and parameters.
         * @param {CreateCompletionRequest} createCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createCompletion(createCompletionRequest, options) {
            return localVarFp.createCompletion(createCompletionRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a new edit for the provided input, instruction, and parameters.
         * @param {CreateEditRequest} createEditRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEdit(createEditRequest, options) {
            return localVarFp.createEdit(createEditRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates an embedding vector representing the input text.
         * @param {CreateEmbeddingRequest} createEmbeddingRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEmbedding(createEmbeddingRequest, options) {
            return localVarFp.createEmbedding(createEmbeddingRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
         * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
         * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFile(file, purpose, options) {
            return localVarFp.createFile(file, purpose, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {CreateFineTuneRequest} createFineTuneRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFineTune(createFineTuneRequest, options) {
            return localVarFp.createFineTune(createFineTuneRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates an image given a prompt.
         * @param {CreateImageRequest} createImageRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImage(createImageRequest, options) {
            return localVarFp.createImage(createImageRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates an edited or extended image given an original image and a prompt.
         * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
         * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
         * @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageEdit(image, prompt, mask, n, size, responseFormat, user, options) {
            return localVarFp.createImageEdit(image, prompt, mask, n, size, responseFormat, user, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a variation of a given image.
         * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageVariation(image, n, size, responseFormat, user, options) {
            return localVarFp.createImageVariation(image, n, size, responseFormat, user, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Classifies if text violates OpenAI\'s Content Policy
         * @param {CreateModerationRequest} createModerationRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createModeration(createModerationRequest, options) {
            return localVarFp.createModeration(createModerationRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
         * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
         * @param {CreateSearchRequest} createSearchRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createSearch(engineId, createSearchRequest, options) {
            return localVarFp.createSearch(engineId, createSearchRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Transcribes audio into the input language.
         * @param {File} file The audio file object (not file name) to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranscription(file, model, prompt, responseFormat, temperature, language, options) {
            return localVarFp.createTranscription(file, model, prompt, responseFormat, temperature, language, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Translates audio into into English.
         * @param {File} file The audio file object (not file name) translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranslation(file, model, prompt, responseFormat, temperature, options) {
            return localVarFp.createTranslation(file, model, prompt, responseFormat, temperature, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Delete a file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteFile(fileId, options) {
            return localVarFp.deleteFile(fileId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
         * @param {string} model The model to delete
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteModel(model, options) {
            return localVarFp.deleteModel(model, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Returns the contents of the specified file
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        downloadFile(fileId, options) {
            return localVarFp.downloadFile(fileId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        listEngines(options) {
            return localVarFp.listEngines(options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Returns a list of files that belong to the user\'s organization.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFiles(options) {
            return localVarFp.listFiles(options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Get fine-grained status updates for a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to get events for.
         * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTuneEvents(fineTuneId, stream, options) {
            return localVarFp.listFineTuneEvents(fineTuneId, stream, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary List your organization\'s fine-tuning jobs
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTunes(options) {
            return localVarFp.listFineTunes(options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listModels(options) {
            return localVarFp.listModels(options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
         * @param {string} engineId The ID of the engine to use for this request
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        retrieveEngine(engineId, options) {
            return localVarFp.retrieveEngine(engineId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Returns information about a specific file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFile(fileId, options) {
            return localVarFp.retrieveFile(fileId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {string} fineTuneId The ID of the fine-tune job
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFineTune(fineTuneId, options) {
            return localVarFp.retrieveFineTune(fineTuneId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
         * @param {string} model The ID of the model to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveModel(model, options) {
            return localVarFp.retrieveModel(model, options).then((request) => request(axios, basePath));
        },
    };
};
exports.OpenAIApiFactory = OpenAIApiFactory;
/**
 * OpenAIApi - object-oriented interface
 * @export
 * @class OpenAIApi
 * @extends {BaseAPI}
 */
class OpenAIApi extends base_1.BaseAPI {
    /**
     *
     * @summary Immediately cancel a fine-tune job.
     * @param {string} fineTuneId The ID of the fine-tune job to cancel
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    cancelFineTune(fineTuneId, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).cancelFineTune(fineTuneId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
     * @param {CreateAnswerRequest} createAnswerRequest
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createAnswer(createAnswerRequest, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).createAnswer(createAnswerRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a model response for the given chat conversation.
     * @param {CreateChatCompletionRequest} createChatCompletionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createChatCompletion(createChatCompletionRequest, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).createChatCompletion(createChatCompletionRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
     * @param {CreateClassificationRequest} createClassificationRequest
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createClassification(createClassificationRequest, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).createClassification(createClassificationRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a completion for the provided prompt and parameters.
     * @param {CreateCompletionRequest} createCompletionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createCompletion(createCompletionRequest, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).createCompletion(createCompletionRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a new edit for the provided input, instruction, and parameters.
     * @param {CreateEditRequest} createEditRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createEdit(createEditRequest, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).createEdit(createEditRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates an embedding vector representing the input text.
     * @param {CreateEmbeddingRequest} createEmbeddingRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createEmbedding(createEmbeddingRequest, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).createEmbedding(createEmbeddingRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
     * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
     * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createFile(file, purpose, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).createFile(file, purpose, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
     * @param {CreateFineTuneRequest} createFineTuneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createFineTune(createFineTuneRequest, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).createFineTune(createFineTuneRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates an image given a prompt.
     * @param {CreateImageRequest} createImageRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createImage(createImageRequest, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).createImage(createImageRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates an edited or extended image given an original image and a prompt.
     * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
     * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
     * @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
     * @param {number} [n] The number of images to generate. Must be between 1 and 10.
     * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
     * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
     * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createImageEdit(image, prompt, mask, n, size, responseFormat, user, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).createImageEdit(image, prompt, mask, n, size, responseFormat, user, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a variation of a given image.
     * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
     * @param {number} [n] The number of images to generate. Must be between 1 and 10.
     * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
     * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
     * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createImageVariation(image, n, size, responseFormat, user, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).createImageVariation(image, n, size, responseFormat, user, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Classifies if text violates OpenAI\'s Content Policy
     * @param {CreateModerationRequest} createModerationRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createModeration(createModerationRequest, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).createModeration(createModerationRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
     * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
     * @param {CreateSearchRequest} createSearchRequest
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createSearch(engineId, createSearchRequest, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).createSearch(engineId, createSearchRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Transcribes audio into the input language.
     * @param {File} file The audio file object (not file name) to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
     * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
     * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
     * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
     * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
     * @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createTranscription(file, model, prompt, responseFormat, temperature, language, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).createTranscription(file, model, prompt, responseFormat, temperature, language, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Translates audio into into English.
     * @param {File} file The audio file object (not file name) translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
     * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
     * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
     * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
     * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createTranslation(file, model, prompt, responseFormat, temperature, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).createTranslation(file, model, prompt, responseFormat, temperature, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a file.
     * @param {string} fileId The ID of the file to use for this request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    deleteFile(fileId, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).deleteFile(fileId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
     * @param {string} model The model to delete
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    deleteModel(model, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).deleteModel(model, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the contents of the specified file
     * @param {string} fileId The ID of the file to use for this request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    downloadFile(fileId, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).downloadFile(fileId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listEngines(options) {
        return (0, exports.OpenAIApiFp)(this.configuration).listEngines(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns a list of files that belong to the user\'s organization.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listFiles(options) {
        return (0, exports.OpenAIApiFp)(this.configuration).listFiles(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get fine-grained status updates for a fine-tune job.
     * @param {string} fineTuneId The ID of the fine-tune job to get events for.
     * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listFineTuneEvents(fineTuneId, stream, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).listFineTuneEvents(fineTuneId, stream, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary List your organization\'s fine-tuning jobs
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listFineTunes(options) {
        return (0, exports.OpenAIApiFp)(this.configuration).listFineTunes(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listModels(options) {
        return (0, exports.OpenAIApiFp)(this.configuration).listModels(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
     * @param {string} engineId The ID of the engine to use for this request
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    retrieveEngine(engineId, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).retrieveEngine(engineId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns information about a specific file.
     * @param {string} fileId The ID of the file to use for this request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    retrieveFile(fileId, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).retrieveFile(fileId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
     * @param {string} fineTuneId The ID of the fine-tune job
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    retrieveFineTune(fineTuneId, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).retrieveFineTune(fineTuneId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
     * @param {string} model The ID of the model to use for this request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    retrieveModel(model, options) {
        return (0, exports.OpenAIApiFp)(this.configuration).retrieveModel(model, options).then((request) => request(this.axios, this.basePath));
    }
}
exports.OpenAIApi = OpenAIApi;
