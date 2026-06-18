// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { HttpEvent, HttpHandler, HttpInterceptor as BaseInterceptor, HttpParameterCodec, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

class CustomEncoder implements HttpParameterCodec {
  /**
   * Encodes a key name for a URL parameter or query-string.
   * @param key The key name.
   * @returns The encoded key name.
   */
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  /**
   * Encodes the value of a URL parameter or query-string.
   * @param value The value.
   * @returns The encoded value.
   */
  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  /**
   * Decodes an encoded URL parameter or query-string key.
   * @param key The encoded key name.
   * @returns The decoded key name.
   */
  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  /**
   * Decodes an encoded URL parameter or query-string value.
   * @param value The encoded value.
   * @returns The decoded value.
   */
  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}

@Injectable()
export class HttpInterceptor implements BaseInterceptor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // encode URL parameters
    // angular does not do it by default,
    // see: https://github.com/angular/angular/issues/18261 for more details
    const params = new HttpParams({
      encoder: new CustomEncoder(),
      fromString: req.params.toString(),
    });

    const authReq = req.clone({
      // Prevent caching in IE, in particular IE11.
      // See: https://support.microsoft.com/en-us/help/234067/how-to-prevent-caching-in-internet-explorer
      setHeaders: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });
    return next.handle(authReq.clone({ params }));
  }
}
