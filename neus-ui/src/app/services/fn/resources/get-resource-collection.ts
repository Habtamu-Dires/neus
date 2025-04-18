/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ResourceCollectionDto } from '../../models/resource-collection-dto';

export interface GetResourceCollection$Params {
  'resource-id': string;
}

export function getResourceCollection(http: HttpClient, rootUrl: string, params: GetResourceCollection$Params, context?: HttpContext): Observable<StrictHttpResponse<ResourceCollectionDto>> {
  const rb = new RequestBuilder(rootUrl, getResourceCollection.PATH, 'get');
  if (params) {
    rb.path('resource-id', params['resource-id'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ResourceCollectionDto>;
    })
  );
}

getResourceCollection.PATH = '/resources/collection/{resource-id}';
