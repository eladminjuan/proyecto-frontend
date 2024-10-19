import { Component, OnInit } from '@angular/core';
import { HabitacionService, Habitacion } from 'src/app/services/habitacion.service';
import { AuthService } from 'src/app/services/auth.service';
import { ReservaService } from 'src/app/services/reserva.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-habitaciones',
  templateUrl: './habitaciones.component.html',
  styleUrls: ['./habitaciones.component.css']
})
export class HabitacionesComponent implements OnInit {
  habitaciones: Habitacion[] = [];
  currentIndex: number = 0;
  currentHabitacion: Habitacion | null = null;
  fechaEntrada: string = '';
  fechaSalida: string = '';
  precioOriginal: number = 0;
  precioCalculado: number = 0;
  errorMessage: string = '';
  isButtonDisabled: boolean = true;
  reservasPendientes: any[] = [];

  constructor(
    private reservaService: ReservaService,
    private habitacionService: HabitacionService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadHabitaciones();
    this.loadReservasPendientes();
  }

  loadHabitaciones(): void {
    this.habitacionService.getHabitaciones().subscribe(
      (data: Habitacion[]) => {
        this.habitaciones = data;
        if (this.habitaciones.length > 0) {
          this.currentHabitacion = this.habitaciones[0];
          this.precioOriginal = this.currentHabitacion.precio;
          this.precioCalculado = this.precioOriginal;
        }
      },
      error => {
        console.error('Error al cargar las habitaciones', error);
      }
    );
  }

  loadReservasPendientes(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.reservaService.getReservasPendientes(currentUser.usuario._id).subscribe(
        (data: any[]) => {
          this.reservasPendientes = data;
        },
        error => {
          console.error('Error al cargar las reservas pendientes', error);
        }
      );
    }
  }

  selectHabitacion(habitacion: Habitacion): void {
    this.currentHabitacion = habitacion;
    this.precioOriginal = habitacion.precio;
    this.precioCalculado = habitacion.precio;
    this.fechaEntrada = '';
    this.fechaSalida = '';
    this.errorMessage = '';
    this.isButtonDisabled = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextHabitacion(): void {
    if (this.habitaciones.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.habitaciones.length;
      this.currentHabitacion = this.habitaciones[this.currentIndex];
      this.precioOriginal = this.currentHabitacion.precio;
      this.precioCalculado = this.precioOriginal;
      this.fechaEntrada = '';
      this.fechaSalida = '';
      this.errorMessage = '';
      this.isButtonDisabled = true;
    }
  }

  calcularPrecio(): void {
    if (this.fechaEntrada && this.fechaSalida && this.currentHabitacion) {
      const fechaEntrada = new Date(this.fechaEntrada);
      const fechaSalida = new Date(this.fechaSalida);
      const diffTime = Math.abs(fechaSalida.getTime() - fechaEntrada.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.precioCalculado = this.precioOriginal * diffDays;
    }
  }

  limpiarCampos(): void {
    this.fechaEntrada = '';
    this.fechaSalida = '';
    this.errorMessage = '';
    this.isButtonDisabled = true;
    if (this.currentHabitacion) {
      this.precioCalculado = this.precioOriginal;
    }
  }

  toggleContent(section: string): void {
    const content = document.querySelector(`.text-${section}`) as HTMLElement;
    if (content) {
      content.classList.toggle('hidden');
    }
  }

  addToCart(): void {
    if (this.authService.isLoggedIn()) {
      const currentUser = this.authService.getCurrentUser();
      const fechaIngresoConHora = this.establecerHora(new Date(this.fechaEntrada), 14, 0);
      const fechaSalidaConHora = this.establecerHora(new Date(this.fechaSalida), 11, 0);

      const reservaData = {
        idusuario: currentUser.usuario._id,
        idhabitacion: this.currentHabitacion?._id,
        fechaIngreso: fechaIngresoConHora,
        fechaSalida: fechaSalidaConHora,
        valorTotal: this.precioCalculado,
        estado: 'Pendiente',
        numTransaccion: '',
        facturacion: '',
        metodoPago: ''
      };

      this.reservaService.verificarDisponibilidad({
        idhabitacion: this.currentHabitacion?._id,
        fechaIngreso: fechaIngresoConHora,
        fechaSalida: fechaSalidaConHora
      }).subscribe(
        res => {
          if (res.disponible) {
            this.reservaService.createReserva(reservaData).subscribe(
              response => {
                this.toastr.success('Añadido al carrito con éxito')
                this.loadReservasPendientes();
                this.limpiarCampos();
              },
              error => {
                this.toastr.error('No se pudo realizar la reserva', 'Error')
              }
            );
          } else {
            this.toastr.error('La habitación no está disponible en las fechas seleccionadas.')
          }
        },
        error => {
          console.error('Error al verificar la disponibilidad', error);
        }
      );
    } else {
      this.router.navigate(['/login']);
    }
  }

  establecerHora(fecha: Date, horas: number, minutos: number): Date {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setHours(horas);
    nuevaFecha.setMinutes(minutos);
    return nuevaFecha;
  }

  validateDates(): void {
    if (this.authService.isLoggedIn()){

      const now = new Date();
      const fechaEntrada = new Date(this.fechaEntrada);
      const fechaSalida = new Date(this.fechaSalida);
      const currentUser = this.authService.getCurrentUser();
  
      if (!this.fechaEntrada) {
        this.errorMessage = 'La fecha de entrada es obligatoria.';
        this.isButtonDisabled = true;
        return;
      }
  
      if (!this.fechaSalida) {
        this.errorMessage = 'La fecha de salida es obligatoria.';
        this.isButtonDisabled = true;
        return;
      }
  
      if (fechaEntrada < now) {
        this.errorMessage = 'La fecha de entrada no puede ser anterior a la fecha actual.';
        this.isButtonDisabled = true;
        return;
      }
  
      if (fechaSalida <= fechaEntrada) {
        this.errorMessage = 'La fecha de salida debe ser posterior a la fecha de entrada.';
        this.isButtonDisabled = true;
        return;
      }
  
      this.errorMessage ='';
  
      this.reservaService.verificarReservaExistente({
        idusuario: currentUser.usuario._id,
        idhabitacion: this.currentHabitacion?._id,
        fechaIngreso: fechaEntrada,
        fechaSalida: fechaSalida
      }).subscribe(
        res => {
          if (res.existeReserva) {
            this.errorMessage = 'Ya añadiste esta habitacion al carrito.';
            this.toastr.error('Ya añadiste esta habitacion al carrito.')
            this.isButtonDisabled = true;
            this.limpiarCampos();
          } else {
            this.errorMessage = '';
            this.isButtonDisabled = false;
            this.calcularPrecio();
          }
        },
        error => {
          console.error('Error al verificar la existencia de la reserva', error);
        }
      );
    }else{
      this.isButtonDisabled = false;
    }
  }
}
