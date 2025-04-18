/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { createSubscription } from '../fn/subscription/create-subscription';
import { CreateSubscription$Params } from '../fn/subscription/create-subscription';
import { getCurrentSubscription } from '../fn/subscription/get-current-subscription';
import { GetCurrentSubscription$Params } from '../fn/subscription/get-current-subscription';
import { SubscriptionResponse } from '../models/subscription-response';

@Injectable({ providedIn: 'root' })
export class SubscriptionService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `createSubscription()` */
  static readonly CreateSubscriptionPath = '/subscription/{sub-plan-id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `createSubscription()` instead.
   *
   * This method doesn't expect any request body.
   */
  createSubscription$Response(params: CreateSubscription$Params, context?: HttpContext): Observable<StrictHttpResponse<{
}>> {
    return createSubscription(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `createSubscription$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  createSubscription(params: CreateSubscription$Params, context?: HttpContext): Observable<{
}> {
    return this.createSubscription$Response(params, context).pipe(
      map((r: StrictHttpResponse<{
}>): {
} => r.body)
    );
  }

  /** Path part for operation `getCurrentSubscription()` */
  static readonly GetCurrentSubscriptionPath = '/subscription/current/{user-id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getCurrentSubscription()` instead.
   *
   * This method doesn't expect any request body.
   */
  getCurrentSubscription$Response(params: GetCurrentSubscription$Params, context?: HttpContext): Observable<StrictHttpResponse<SubscriptionResponse>> {
    return getCurrentSubscription(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getCurrentSubscription$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getCurrentSubscription(params: GetCurrentSubscription$Params, context?: HttpContext): Observable<SubscriptionResponse> {
    return this.getCurrentSubscription$Response(params, context).pipe(
      map((r: StrictHttpResponse<SubscriptionResponse>): SubscriptionResponse => r.body)
    );
  }

}
