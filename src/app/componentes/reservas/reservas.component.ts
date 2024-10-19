import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ReservaService } from 'src/app/services/reserva.service';
import { AppComponent } from 'src/app/app.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.css']
})
export class ReservasComponent implements OnInit {
  activeForm: string = 'account';
  user: any;
  originalUserData: any;
  isModified: boolean = false;
  isLoggedIn = false;
  cartItemCount = 0;
  

  password = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  carrito: any[] = []; // Esto debería ser cargado desde un servicio o desde el backend
  reservas: any[] = [];

  constructor(private authService: AuthService, 
    private userService: UsuarioService, 
    private router: Router, 
    private reservaService: ReservaService, 
    private appcomponent: AppComponent,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loadUserData();
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.loadCarrito();
      this.loadReservas();

      this.reservaService.cartUpdated.subscribe(() => {
        this.loadCarrito();
        this.loadReservas();
      });
    }

  }

  loadUserData() {
    this.user = { ...this.authService.getCurrentUser().usuario };
    this.originalUserData = { ...this.user };
  }

  setActiveForm(form: string) {
    this.activeForm = form;
  }

  loadCarrito() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.reservaService.getReservasPendientes(currentUser.usuario._id).subscribe(
        (data: any[]) => {
          this.cartItemCount = data.length;
        },
        error => {
          this.toastr.error('Error al cargar las reservas pendientes', 'Error')
        }
      );
    }
  }

  loadReservas() {
    // Lógica para cargar las reservas del usuario
    this.reservaService.getReservas(this.user._id).subscribe(
      (data: any[]) => {
        this.reservas = data.map(reserva => {
          return {
            ...reserva,
            idhabitacion: {
              ...reserva.idhabitacion,
              foto: this.arrayBufferToBase64(reserva.idhabitacion.foto.data)
            }
          };
        });
      },
      error => {
        this.toastr.error('Error al cargar las reservas', 'Error')
      }
    );
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  goToRooms() {
    this.router.navigate(['/habitaciones']);
  }

  openCartModal() {
    this.appcomponent.openCartModal();
  }

  onInputChange() {
    this.isModified = JSON.stringify(this.user) !== JSON.stringify(this.originalUserData);
  }

  onPasswordInputChange() {
    this.isModified = !!this.password.oldPassword || !!this.password.newPassword || !!this.password.confirmPassword;
  }

  isPasswordValid(): boolean {
    return this.password.newPassword === this.password.confirmPassword && !!this.password.oldPassword && !!this.password.newPassword;
  }

  saveChanges() {
    this.userService.updateUsuario(this.user._id, this.user).subscribe(
      response => {
        this.toastr.success('Usuario actualizado con exito', 'Ëxito')
        this.updateLocalUserData();
        this.isModified = false;
      },
      error => {
        this.toastr.error('No se pudo realizar la actualización', 'Error')
      }
    );
  }

  savePasswordChanges() {
    if (this.isPasswordValid()) {
      this.userService.changePassword(this.user._id, this.password).subscribe(
        response => {
          this.toastr.success('Contraseña actualizada con exito', 'Ëxito')
          this.resetPasswordFields();
        },
        error => {
          this.toastr.error('Error al actualizar la contraseña', 'Error')
        }
      );
    }
  }

  cancelChanges() {
    this.user = { ...this.originalUserData };
    this.isModified = false;
  }

  updateLocalUserData() {
    this.authService.updateCurrentUser(this.user);
    this.loadUserData(); // Recargar los datos desde el servicio de autenticación
  }

  resetPasswordFields() {
    this.password = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.isModified = false;
  }

  logout() {
    this.authService.logout();
  }
}
