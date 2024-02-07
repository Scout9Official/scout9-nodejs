
// export type Scout9Response =
// export type RequestHandler<
//   RequestBody = unknown,
//   ResponseBody = Record<string | number, any> | Record<string | number, any>[],
//   Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
//   RouteId extends string | null = string | null,
//   SearchParams extends Partial<Record<string, string | string[]>> = Partial<Record<string, string>>
// > = (event: EventRequest<RequestBody, Params, RouteId, SearchParams>) => MaybePromise<EventResponse<ResponseBody>>;
//
// /**
//  * For QUERY entity api calls, this is used for getting multiple entities
//  */
// export type QueryRequestHandler<
//   ResponseBody = Record<string | number, any>,
//   Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
//   RouteId extends string | null = string | null,
// > = RequestHandler<unknown, ResponseBody[], Params, RouteId, {q?: string, page?: string, limit?: string, orderBy?: string, endAt?: string, startAt?: string}>;
//
// /**
//  * For GET entity api calls, this is used for getting one entity
//  */
// export type GetRequestHandler<
//   ResponseBody = Record<string | number, any>,
//   Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
//   RouteId extends string | null = string | null,
// > = RequestHandler<unknown, ResponseBody, Params, RouteId>;
//
// /**
//  * For POST entity api calls, this is used for creating an entity
//  */
// export type PostRequestHandler<
//   RequestBody = Record<string | number, any>,
//   Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
//   RouteId extends string | null = string | null
// > = RequestHandler<RequestBody, {success: boolean, id: string, error?: string | object, [key: string]: any}, Params, RouteId>;
//
// export type CreatedRequestHandler<
//   RequestBody = Record<string | number, any>,
//   Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
//   RouteId extends string | null = string | null
// > = PostRequestHandler<RequestBody, Params, RouteId>;
//
//
// /**
//  * For PUT entity api calls, this is used for creating an entity
//  */
// export type PutRequestHandler<
//   RequestBody = Record<string | number, any>,
//   Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
//   RouteId extends string | null = string | null
// > = RequestHandler<Partial<RequestBody>, {success: boolean, error?: string | object, [key: string]: any}, Params, RouteId>;
//
//
// /**
//  * For PUT entity api calls, this is used for creating an entity
//  */
// export type PatchRequestHandler<
//   RequestBody = Record<string | number, any>,
//   Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
//   RouteId extends string | null = string | null
// > = PutRequestHandler<RequestBody, Params, RouteId>;
//
// /**
//  * For PUT entity api calls, this is used for creating an entity
//  */
// export type UpdateRequestHandler<
//   RequestBody = Record<string | number, any>,
//   Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
//   RouteId extends string | null = string | null
// > = PutRequestHandler<RequestBody, Params, RouteId>;
//
// /**
//  * For PUT entity api calls, this is used for creating an entity
//  */
// export type DeleteRequestHandler<
//   Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
//   RouteId extends string | null = string | null
// > = RequestHandler<unknown, {success: boolean, error?: string | object, [key: string]: any}, Params, RouteId>;
//
//
// export interface EventRequest<
//   Body = unknown,
//   Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
//   RouteId extends string | null = string | null,
//   SearchParams extends Partial<Record<string, string | string[]>> = Partial<Record<string, string>>,
// > {
//
//   /**
//    * `fetch` is equivalent to the [native `fetch` web API](https://developer.mozilla.org/en-US/docs/Web/API/fetch), with a few additional features:
//    *
//    * - It can be used to make credentialed requests on the server, as it inherits the `cookie` and `authorization` headers for the page request.
//    * - It can make relative requests on the server (ordinarily, `fetch` requires a URL with an origin when used in a server context).
//    * - Internal requests (e.g. for `+server.js` routes) go directly to the handler function when running on the server, without the overhead of an HTTP call.
//    * - During server-side rendering, the response will be captured and inlined into the rendered HTML by hooking into the `text` and `json` methods of the `Response` object. Note that headers will _not_ be serialized, unless explicitly included
//    * - During hydration, the response will be read from the HTML, guaranteeing consistency and preventing an additional network request.
//    *
//    */
//   fetch: typeof fetch;
//
//   /**
//    * The parameters of the current route - e.g. for a route like `/blog/[slug]`, a `{ slug: string }` object
//    */
//   params: Params;
//
//   /**
//    * The requested URL.
//    */
//   url: URL;
//
//   /**
//    * The anticipated searchParams inside `const { searchParams } = new URL(req.url)`
//    */
//   searchParams: SearchParams;
//
//   /**
//    * The anticipated parsed body inside `request.body`
//    */
//   body: Body;
//
//   /**
//    * The original request object
//    */
//   request: Request;
//
//   /**
//    * If you need to set headers for the response, you can do so using the this method. This is useful if you want the page to be cached, for example:
//    *
//    *	```js
//    *	/// file: src/routes/blog/+page.js
//    *	export async function load({ fetch, setHeaders }) {
//    *		const url = `https://cms.example.com/articles.json`;
//    *		const response = await fetch(url);
//    *
//    *		setHeaders({
//    *			age: response.headers.get('age'),
//    *			'cache-control': response.headers.get('cache-control')
//    *		});
//    *
//    *		return response.json();
//    *	}
//    *	```
//    *
//    * Setting the same header multiple times (even in separate `load` functions) is an error — you can only set a given header once.
//    *
//    * You cannot add a `set-cookie` header with `setHeaders` API instead.
//    */
//   setHeaders(headers: Record<string, string>): void;
//
//   /**
//    * Info about the current route
//    */
//   route: {
//     /**
//      * The ID of the current route - e.g. for `src/routes/blog/[slug]`, it would be `/blog/[slug]`
//      */
//     id: RouteId;
//   };
// }

/**
 * Utility runtime class used to guide event output
 */
export class EventResponse {

  static json(body, options) {
    return new EventResponse(body, options);
  }

  constructor(body, init) {
    this.body = body;
    this.init = init;
    if (typeof this.body !== 'object') {
      throw new Error(`EventResponse body in not a valid object:\n"${JSON.stringify(body, null, 2)}"`);
    }
  }

  get response() {
    return Response.json(this.body, this.init);
  }

  get data() {
    return this.body;
  }

}


