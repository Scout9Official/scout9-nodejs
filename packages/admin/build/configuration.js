"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
const packageJson = require("../package.json");
class Configuration {
    /**
     * parameter for apiKey security
     * @param name security name
     * @memberof Configuration
     */
    apiKey;
    /**
     * Scout9 organization id
     *
     * @type {string}
     * @memberof Configuration
     */
    organization;
    /**
     * parameter for basic security
     *
     * @type {string}
     * @memberof Configuration
     */
    username;
    /**
     * parameter for basic security
     *
     * @type {string}
     * @memberof Configuration
     */
    password;
    /**
     * parameter for oauth2 security
     * @param name security name
     * @param scopes oauth2 scope
     * @memberof Configuration
     */
    accessToken;
    /**
     * override base path
     *
     * @type {string}
     * @memberof Configuration
     */
    basePath;
    /**
     * base options for axios calls
     *
     * @type {any}
     * @memberof Configuration
     */
    baseOptions;
    /**
     * The FormData constructor that will be used to create multipart form data
     * requests. You can inject this here so that execution environments that
     * do not support the FormData class can still run the generated client.
     *
     * @type {new () => FormData}
     */
    formDataCtor;
    /**
     * The version of the Scout9 API that this client library version is
     */
    apiVersion;
    constructor(param = {}) {
        this.apiKey = param.apiKey;
        this.organization = param.organization;
        this.username = param.username;
        this.password = param.password;
        this.accessToken = param.accessToken;
        this.basePath = param.basePath;
        this.baseOptions = param.baseOptions;
        this.formDataCtor = param.formDataCtor;
        this.apiVersion = 'v' + packageJson.version.split(".")[0];
        if (!this.baseOptions) {
            this.baseOptions = {};
        }
        this.baseOptions.headers = {
            'User-Agent': `Scout9/NodeJS/${packageJson.version}`,
            'Authorization': `Bearer ${this.apiKey}`,
            ...this.baseOptions.headers,
        };
        if (this.organization) {
            this.baseOptions.headers['Scout9-Organization'] = this.organization;
        }
        if (!this.formDataCtor) {
            this.formDataCtor = require("form-data");
        }
    }
    /**
     * Check if the given MIME is a JSON MIME.
     * JSON MIME examples:
     *   application/json
     *   application/json; charset=UTF8
     *   APPLICATION/JSON
     *   application/vnd.company+json
     * @param mime - MIME (Multipurpose Internet Mail Extensions)
     * @return True if the given MIME is JSON, false otherwise.
     */
    isJsonMime(mime) {
        const jsonMime = new RegExp('^(application\/json|[^;/ \t]+\/[^;/ \t]+[+]json)[ \t]*(;.*)?$', 'i');
        return mime !== null && (jsonMime.test(mime) || mime.toLowerCase() === 'application/json-patch+json');
    }
}
exports.Configuration = Configuration;
