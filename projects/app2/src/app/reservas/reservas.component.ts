import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservaService } from '../services/reserva.service';
import { UsuarioService } from '../services/usuario.service';
import { HabitacionService } from '../services/habitacion.service';
import { format, parseISO } from 'date-fns';
import { AppComponent } from '../app.component';
import { debounceTime } from 'rxjs/operators';

interface Reserva {
  _id?: string;
  idusuario: {
    _id: string;
    nombre: string;
    numdocu: string;
  };
  idhabitacion: {
    _id: string;
    estilo: string;
    precio: number;
  };
  fechaIngreso: string;
  fechaSalida: string;
  descripcion: string;
  valorTotal: number;
  numTransaccion: string;
  facturacion: string;
  metodoPago: string;
  estado: string;
  fecha: string;
}

interface Usuario {
  _id: string;
  nombre: string;
}

interface Habitacion {
  _id: string;
  estilo: string;
  foto: string;
  precio: number;
}

declare var Swal: any;

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.css']
})
export class ReservasComponent implements OnInit {
  reserva: Reserva = {
    idusuario: { _id: '', nombre: '', numdocu: '' },
    idhabitacion: { _id: '', estilo: '', precio: 0 },
    fechaIngreso: '',
    fechaSalida: '',
    descripcion: '',
    valorTotal: 0,
    numTransaccion: 'No aplica',
    facturacion: 'No aplica',
    metodoPago: 'Efectivo',
    estado: 'Reservado',
    fecha: ''
  };

  reservas: Reserva[] = [];
  filteredReservas: Reserva[] = [];
  usuarios: Usuario[] = [];
  habitaciones: Habitacion[] = [];
  isEditMode = false;
  isModalOpen = false;
  isViewMode = false;
  page: number = 1;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private reservaService: ReservaService,
    private usuarioService: UsuarioService,
    private habitacionService: HabitacionService,
    private appComponent: AppComponent,
    private fb: FormBuilder
  ) {
    this.appComponent.searchTerm$.pipe(debounceTime(300)).subscribe(term => {
      this.filterReservas(term);
    });
  }

  ngOnInit(): void {
    this.loadReservas();
    this.loadUsuarios();
    this.loadHabitaciones();
  }

  formatDateForInput(dateStr: string): string {
    const date = parseISO(dateStr);
    return format(date, 'yyyy-MM-dd');
  }

  loadReservas(): void {
    this.reservaService.getReservas().subscribe(
      (data: Reserva[]) => {
        this.reservas = data;
        this.filteredReservas = [...this.reservas];
      },
      error => console.error('Error al cargar las reservas', error)
    );
  }

  loadUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe(
      (data: Usuario[]) => this.usuarios = data,
      error => console.error('Error al cargar los usuarios', error)
    );
  }

  loadHabitaciones(): void {
    this.habitacionService.getHabitaciones().subscribe(
      (data: Habitacion[]) => this.habitaciones = data,
      error => console.error('Error al cargar las habitaciones', error)
    );
  }

  filterReservas(term: string): void {
    this.filteredReservas = this.reservas.filter(reserva =>
      reserva.idusuario.nombre.toLowerCase().includes(term.toLowerCase()) ||
      reserva.idusuario.numdocu.toLowerCase().includes(term.toLowerCase()) ||
      reserva.idhabitacion.estilo.toLowerCase().includes(term.toLowerCase()) ||
      reserva.estado.toLowerCase().includes(term.toLowerCase()) ||
      reserva.metodoPago.toLowerCase().includes(term.toLowerCase()) ||
      reserva.numTransaccion.toLowerCase().includes(term.toLowerCase()) ||
      reserva.valorTotal.toString().includes(term.toLowerCase())
    );
  }

  onFechaChange(): void {
    const fechaIngreso = new Date(this.reserva.fechaIngreso);
    const fechaSalida = new Date(this.reserva.fechaSalida);
    const habitacionId = this.reserva.idhabitacion._id;

    if (fechaIngreso && fechaSalida && habitacionId) {
      const habitacion = this.habitaciones.find(h => h._id === habitacionId);
      if (habitacion) {
        const dias = (fechaSalida.getTime() - fechaIngreso.getTime()) / (1000 * 3600 * 24);
        this.reserva.valorTotal = dias * habitacion.precio;
      }
    }
  }

  establecerHora(fecha: Date, horas: number, minutos: number): Date {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setHours(horas);
    nuevaFecha.setMinutes(minutos);
    return nuevaFecha;
  }

  createReserva(): void {
    if (!this.validarFechas()) {
      return;
    }

    const fechaIngresoConHora = this.establecerHora(new Date(this.reserva.fechaIngreso), 14, 0).toISOString();
    const fechaSalidaConHora = this.establecerHora(new Date(this.reserva.fechaSalida), 11, 0).toISOString();

    this.reservaService.checkAvailability(this.reserva.idhabitacion._id, fechaIngresoConHora, fechaSalidaConHora).subscribe(
      (isAvailable: boolean) => {
        if (!isAvailable) {
          Swal.fire({
            title: "Habitación No Disponible",
            text: "La habitación no está disponible entre las fechas seleccionadas.",
            icon: "error"
          });
          return;
        }

        const formData = new FormData();
        formData.append('idusuario', this.reserva.idusuario._id);
        formData.append('idhabitacion', this.reserva.idhabitacion._id);
        formData.append('fechaIngreso', fechaIngresoConHora);
        formData.append('fechaSalida', fechaSalidaConHora);
        formData.append('valorTotal', this.reserva.valorTotal.toString());
        formData.append('numTransaccion', this.reserva.numTransaccion);
        formData.append('facturacion', this.reserva.facturacion);
        formData.append('metodoPago', this.reserva.metodoPago);
        formData.append('estado', this.reserva.estado);
        formData.append('fecha', this.reserva.fecha);

        this.reservaService.createReserva(formData).subscribe(
          response => {
            console.log('Reserva creada con éxito', response);
            this.loadReservas();
            this.closeModal();
            Swal.fire({
              title: "Reserva Creada",
              text: "La reserva se creó correctamente",
              icon: "success"
            });
          },
          error => console.error('Error al crear la reserva', error)
        );
      },
      error => console.error('Error al verificar la disponibilidad', error)
    );
  }

  updateReserva(): void {
    if (!this.validarFechas()) {
      return;
    }

    const fechaIngresoConHora = this.establecerHora(new Date(this.reserva.fechaIngreso), 14, 0);
    const fechaSalidaConHora = this.establecerHora(new Date(this.reserva.fechaSalida), 11, 0);

    const formData = new FormData();
    formData.append('idusuario', this.reserva.idusuario._id);
    formData.append('idhabitacion', this.reserva.idhabitacion._id);
    formData.append('fechaIngreso', fechaIngresoConHora.toISOString());
    formData.append('fechaSalida', fechaSalidaConHora.toISOString());
    formData.append('valorTotal', this.reserva.valorTotal.toString());
    formData.append('numTransaccion', this.reserva.numTransaccion);
    formData.append('facturacion', this.reserva.facturacion);
    formData.append('metodoPago', this.reserva.metodoPago);
    formData.append('estado', this.reserva.estado);
    formData.append('fecha', this.reserva.fecha);

    this.reservaService.updateReserva(this.reserva._id!, formData).subscribe(
      response => {
        console.log('Reserva actualizada con éxito', response);
        this.loadReservas();
        this.closeModal();
        Swal.fire({
          title: "Reserva Actualizada",
          text: "La reserva se actualizó correctamente",
          icon: "success"
        });
      },
      error => console.error('Error al actualizar la reserva', error)
    );
  }

  deleteReserva(id: string): void {
    this.reservaService.deleteReserva(id).subscribe(
      response => {
        console.log('Reserva eliminada con éxito', response);
        this.loadReservas();
        Swal.fire({
          title: "Reserva Eliminada",
          text: "La reserva se eliminó correctamente",
          icon: "success"
        });
      },
      error => console.error('Error al eliminar la reserva', error)
    );
  }

  validarFechas(): boolean {
    const fechaIngreso = new Date(this.reserva.fechaIngreso);
    const fechaSalida = new Date(this.reserva.fechaSalida);
    const fechaActual = new Date();

    if (fechaIngreso < fechaActual) {
      Swal.fire({
        title: "Fecha Inválida",
        text: "La fecha de ingreso no puede ser anterior a la fecha actual.",
        icon: "error"
      });
      return false;
    }

    if (fechaSalida <= fechaIngreso) {
      Swal.fire({
        title: "Fecha Inválida",
        text: "La fecha de salida debe ser posterior a la fecha de ingreso.",
        icon: "error"
      });
      return false;
    }

    return true;
  }

  editReserva(reserva: Reserva): void {
    this.reserva = {
      ...reserva,
      fechaIngreso: this.formatDateForInput(reserva.fechaIngreso),
      fechaSalida: this.formatDateForInput(reserva.fechaSalida)
    };
    this.isEditMode = true;
    this.isViewMode = false;
    this.openModal();
  }

  viewReserva(reserva: Reserva): void {
    this.reserva = { ...reserva };
    this.reserva.fechaIngreso = this.formatDate(reserva.fechaIngreso);
    this.reserva.fechaSalida = this.formatDate(reserva.fechaSalida);
    this.isEditMode = false;
    this.isViewMode = true;
    this.openModal();
  }

  private formatDate(date: string): string {
    const dateObj = new Date(date);
    return dateObj.toISOString().substring(0, 10);
  }

  submitForm(): void {
    if (this.isEditMode) {
      this.updateReserva();
    } else {
      this.createReserva();
    }
  }

  openCreateModal(): void {
    this.resetForm();
    this.isEditMode = false;
    this.openModal();
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  resetForm(): void {
    this.reserva = {
      idusuario: { _id: '', nombre: '', numdocu: '' },
      idhabitacion: { _id: '', estilo: '', precio: 0 },
      fechaIngreso: '',
      fechaSalida: '',
      descripcion: '',
      valorTotal: 0,
      numTransaccion: 'No aplica',
      facturacion: 'No aplica',
      metodoPago: 'Efectivo',
      estado: 'Reservado',
      fecha: ''
    };
    this.isEditMode = false;
    this.isViewMode = false;
  }
}
