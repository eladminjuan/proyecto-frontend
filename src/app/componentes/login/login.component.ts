import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, 
    private usuarioService: UsuarioService, 
    private router: Router, 
    private renderer: Renderer2,
    private el: ElementRef,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      nombreR: ['', Validators.required],
      correoR: ['', [Validators.required, Validators.email]],
      passwordR: ['', Validators.required]
    });

    const btnSignIn = this.el.nativeElement.querySelector("#signin");
    const btnSignUp = this.el.nativeElement.querySelector("#signup");
    const formRegister = this.el.nativeElement.querySelector(".register");
    const formLogin = this.el.nativeElement.querySelector(".login");

    if (btnSignIn && btnSignUp && formRegister && formLogin) {
      this.renderer.listen(btnSignIn, 'click', () => {
        this.renderer.addClass(formRegister, 'hide');
        this.renderer.removeClass(formLogin, 'hide');
      });

      this.renderer.listen(btnSignUp, 'click', () => {
        this.renderer.addClass(formLogin, 'hide');
        this.renderer.removeClass(formRegister, 'hide');
      });
    }
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.toastr.error('Por favor, complete todos los campos correctamente.', 'Formulario Inválido');
      return;
    }

    const { correo, password } = this.loginForm.value;

    this.authService.login(correo, password).subscribe(
      () => {
        const redirectUrl = localStorage.getItem('redirectUrl') || '/';
        this.toastr.success('Iniciaste sesión correctamente', 'Sesión Iniciada');
        localStorage.removeItem('redirectUrl');
        this.router.navigate([redirectUrl]).then(() => {
          window.location.reload();
        });
      },
      (error) => {
        this.toastr.error('Correo o Contraseña Incorrecta', 'Ocurrió un Error');
      }
    );
  }

  createUsuario(): void {
    if (this.registerForm.invalid) {
      this.toastr.error('Por favor, complete todos los campos correctamente.', 'Formulario Inválido');
      return;
    }

    const { nombreR, correoR, passwordR } = this.registerForm.value;
    const fechaFormateada = format(new Date(), 'dd/MM/yyyy');
    const formData = new FormData();
    formData.append('nombre', nombreR);
    formData.append('correo', correoR);
    formData.append('password', passwordR);
    formData.append('telefono', 'No Definido');
    formData.append('tipdocu', 'No Definido');
    formData.append('numdocu', 'No Definido');
    formData.append('estado', 'Activo');
    formData.append('fecha', fechaFormateada);

    const formRegister = this.el.nativeElement.querySelector(".register");
    const formLogin = this.el.nativeElement.querySelector(".login");

    this.usuarioService.createUsuario(formData).subscribe(
      response => {
        console.log('Usuario creado con éxito', response);
        this.toastr.success('Registro exitoso. Por favor, inicia sesión.');
        this.renderer.addClass(formRegister, 'hide');
        this.renderer.removeClass(formLogin, 'hide');
      },
      error => {
        console.error('Error al crear el usuario', error);
        this.toastr.error('Error en el registro', 'Ocurrió un Error');
      }
    );
  }
}
