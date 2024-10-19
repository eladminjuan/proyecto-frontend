import { Component, OnInit } from '@angular/core';
import { HabitacionService } from '../services/habitacion.service';
import { UsuarioService } from '../services/usuario.service';
import { ReservaService } from '../services/reserva.service';
import { AppComponent } from '../app.component';
import { debounceTime } from 'rxjs/operators';
import { format, parseISO } from 'date-fns';

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
    foto: any;
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

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  habitacionesCount: number = 0;
  usuariosSinRolesCount: number = 0;

  reservas: Reserva[] = [];
  filteredReservas: Reserva[] = [];
  reservasDelMes: Reserva[] = [];
  totalRecaudo: number = 0;
  page: number = 1;

  constructor(
    private reservaService: ReservaService,
    private usuarioService: UsuarioService,
    private habitacionService: HabitacionService,
    private appComponent: AppComponent
  ) {
    this.appComponent.searchTerm$.pipe(debounceTime(300)).subscribe(term => {
      this.filterReservas(term);
    });
  }

  ngOnInit(): void {
    this.loadCounts();
    this.loadReservas();
  }

  loadReservas(): void {
    this.reservaService.getReservass().subscribe(
      (data: Reserva[]) => {
        this.reservas = data.map(reserva => ({
          ...reserva,
          idhabitacion: {
            ...reserva.idhabitacion,
            foto: this.arrayBufferToBase64(reserva.idhabitacion.foto.data)
          }
        }));
        this.filteredReservas = [...this.reservas];
        this.updateReservasDelMes();
        this.calculateTotalRecaudo();
      },
      error => console.error('Error al cargar las reservas', error)
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

  loadCounts(): void {
    this.habitacionService.getHabitacionesCount().subscribe(
      (count: number) => {
        this.habitacionesCount = count;
      },
      error => console.error('Error al obtener la cantidad de habitaciones', error)
    );

    this.usuarioService.getUsuariosSinRolesCount().subscribe(
      (count: number) => {
        this.usuariosSinRolesCount = count;
      },
      error => console.error('Error al obtener la cantidad de usuarios sin roles', error)
    );
  }

  updateReservasDelMes(): void {
    const currentMonth = new Date().getMonth() + 1; // Obtener el mes actual (0-11) + 1
    const currentYear = new Date().getFullYear();

    this.reservasDelMes = this.reservas.filter(reserva => {
      const reservaDate = parseISO(reserva.fechaIngreso);
      return reserva.estado === 'Reservado' && reservaDate.getMonth() + 1 === currentMonth && reservaDate.getFullYear() === currentYear;
    });
  }

  calculateTotalRecaudo(): void {
    this.totalRecaudo = this.reservas
      .filter(reserva => reserva.estado === 'Reservado')
      .reduce((total, reserva) => total + reserva.valorTotal, 0);
  }

  calculateNights(reserva: Reserva): number {
    const fechaIngreso = parseISO(reserva.fechaIngreso);
    const fechaSalida = parseISO(reserva.fechaSalida);
    const diffInMs = fechaSalida.getTime() - fechaIngreso.getTime();
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24)); // Convertir de milisegundos a días y redondear hacia arriba
  }
}
