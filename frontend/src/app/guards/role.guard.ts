import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
        const allowedRoles = route.data['roles'] as string[];
        const userRole = this.auth.currentUser?.role;

        if (!userRole) {
            return this.router.parseUrl('/login');
        }

        if (allowedRoles && allowedRoles.includes(userRole)) {
            return true;
        }

        // Redirect to dashboard if user doesn't have access
        return this.router.parseUrl('/app/dashboard');
    }
}
