import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  correo: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private loginService: LoginService, private router: Router) { }

  login(): void {
    this.loginService.login(this.correo, this.password).subscribe(
      () => {
        // Redirigir al dashboard o a la ruta que desees después de un login exitoso
        this.router.navigate(['/']).then(() => {
          window.location.reload();
        });
      },
      (error) => {
        // Manejar error de login
        this.errorMessage = 'Correo o contraseña incorrectos';
        console.error('Error al iniciar sesión', error);
      }
    );
  }
}
