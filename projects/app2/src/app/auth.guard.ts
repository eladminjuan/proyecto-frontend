import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from './services/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private loginService: LoginService, private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const rolesPermitidos = ['Auxiliar', 'Administrador'];
    const rolesUsuario = this.loginService.getUserRoles();

    if (rolesUsuario.includes('Administrador')) {
      return true; // Permite acceso completo si es Administrador
    } else if (rolesUsuario.includes('Auxiliar')) {
      // Aquí puedes agregar lógica específica para restringir acceso a ciertas rutas o funcionalidades
      if (next.data['roles'] && next.data['roles'].includes('Administrador')) {
        this.router.navigate(['/']); // Redirige a página principal si intenta acceder a ruta restringida
        return false;
      }
      return true;
    }

    // Si el usuario no tiene roles permitidos
    this.router.navigate(['/login']); // Redirige a página principal u otra ruta de acceso denegado
    return false;
  }
}
