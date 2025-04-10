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

import { createQuestions } from '../fn/questions/create-questions';
import { CreateQuestions$Params } from '../fn/questions/create-questions';

@Injectable({ providedIn: 'root' })
export class QuestionsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `createQuestions()` */
  static readonly CreateQuestionsPath = '/questions';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `createQuestions()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createQuestions$Response(params: CreateQuestions$Params, context?: HttpContext): Observable<StrictHttpResponse<{
}>> {
    return createQuestions(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `createQuestions$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createQuestions(params: CreateQuestions$Params, context?: HttpContext): Observable<{
}> {
    return this.createQuestions$Response(params, context).pipe(
      map((r: StrictHttpResponse<{
}>): {
} => r.body)
    );
  }

}
