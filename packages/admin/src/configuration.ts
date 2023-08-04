const packageJson = require("../package.json");

export interface ConfigurationParameters {
  apiKey?: string | Promise<string> | ((name: string) => string) | ((name: string) => Promise<string>);
  organization?: string;
  username?: string;
  password?: string;
  accessToken?: string | Promise<string> | ((name?: string, scopes?: string[]) => string) | ((name?: string, scopes?: string[]) => Promise<string>);
  basePath?: string;
  baseOptions?: any;
  formDataCtor?: new () => any;
}

export class Configuration {
  /**
   * parameter for apiKey security
   * @param name security name
   * @memberof Configuration
   */
  apiKey?: string | Promise<string> | ((name: string) => string) | ((name: string) => Promise<string>);

  /**
   * Scout9 organization id
   *
   * @type {string}
   * @memberof Configuration
   */
  organization?: string;

  /**
   * parameter for basic security
   *
   * @type {string}
   * @memberof Configuration
   */
  username?: string;

  /**
   * parameter for basic security
   *
   * @type {string}
   * @memberof Configuration
   */
  password?: string;

  /**
   * parameter for oauth2 security
   * @param name security name
   * @param scopes oauth2 scope
   * @memberof Configuration
   */
  accessToken?: string | Promise<string> | ((name?: string, scopes?: string[]) => string) | ((name?: string, scopes?: string[]) => Promise<string>);

  /**
   * override base path
   *
   * @type {string}
   * @memberof Configuration
   */
  basePath?: string;
  /**
   * base options for axios calls
   *
   * @type {any}
   * @memberof Configuration
   */
  baseOptions?: any;

  /**
   * The FormData constructor that will be used to create multipart form data
   * requests. You can inject this here so that execution environments that
   * do not support the FormData class can still run the generated client.
   *
   * @type {new () => FormData}
   */
  formDataCtor?: new () => any;

  /**
   * The version of the Scout9 API that this client library version is
   */
  apiVersion?: string;

  constructor(param: ConfigurationParameters = {}) {
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
    }
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
  public isJsonMime(mime: string): boolean {
    const jsonMime: RegExp = new RegExp('^(application\/json|[^;/ \t]+\/[^;/ \t]+[+]json)[ \t]*(;.*)?$', 'i');
    return mime !== null && (jsonMime.test(mime) || mime.toLowerCase() === 'application/json-patch+json');
  }
}
