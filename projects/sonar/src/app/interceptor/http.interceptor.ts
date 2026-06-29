// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { HttpInterceptorFn, HttpParameterCodec, HttpParams } from '@angular/common/http';

class CustomEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
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
    params,
  });

  return next(authReq);
};
