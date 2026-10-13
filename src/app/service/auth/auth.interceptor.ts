import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_URL } from '../../api.config';
import { AuthService } from './auth.service';

/**
 * Ajoute automatiquement le token à chaque appel vers la gateway.
 * Remplace les HttpHeaders recopiés dans chaque composant.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    const isApiCall = req.url.startsWith(API_URL);

    const authReq = token && isApiCall
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        // Token expiré ou invalide : on déconnecte proprement
        if (err.status === 401 && token && isApiCall) {
          this.auth.logout();
        }
        return throwError(() => err);
      })
    );
  }
}
