import { Component, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { ReservaService } from 'src/app/services/reserva.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
declare const paypal: any;

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit, AfterViewInit {
  reservas: any[] = [];
  totalPrecio: number = 0;

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.loadReservas();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.loadPayPalButton(), 0);
  }

  loadReservas(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.usuario && user.usuario._id) {
      this.reservaService.getReservasPendientes(user.usuario._id).subscribe(
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
          this.calculateTotal();
        },
        error => {
          console.error('Error al cargar las reservas', error);
        }
      );
    }
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

  calculateTotal(): void {
    this.totalPrecio = this.reservas.reduce((acc, reserva) => acc + reserva.valorTotal, 0);
  }

  eliminarReserva(reservaId: string): void {
    this.reservaService.deleteReserva(reservaId).subscribe(
      () => {
        this.reservas = this.reservas.filter(reserva => reserva._id !== reservaId);
        this.calculateTotal();
      },
      error => {
        console.error('Error al eliminar la reserva', error);
      }
    );
  }

  calcularNoches(fechaIngreso: string, fechaSalida: string): number {
    const ingreso = new Date(fechaIngreso);
    const salida = new Date(fechaSalida);
    const diffTime = Math.abs(salida.getTime() - ingreso.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  loadPayPalButton(): void {
    const currentUser = this.authService.getCurrentUser();
    const self = this; // Reference to use inside PayPal button callbacks

    paypal.Buttons({
      createOrder(data: any, actions: any) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: (self.totalPrecio / 1000).toFixed(2) // Convert to USD for PayPal (assuming CLP to USD conversion rate)
            }
          }]
        });
      },
      onApprove(data: any, actions: any) {
        return actions.order.capture().then(function (details: any) {
          alert('Pago completado con éxito por ' + details.payer.name.given_name);

          const facturacion = {
            nombre: details.payer.name.given_name + ' ' + details.payer.name.surname,
            email: details.payer.email_address,
            direccion: details.payer.address.address_line_1,
            ciudad: details.payer.address.admin_area_2,
            estado: details.payer.address.admin_area_1,
            codigoPostal: details.payer.address.postal_code,
            pais: details.payer.address.country_code
          };

          const pagoData = {
            userId: currentUser.usuario._id,
            numTransaccion: details.id,
            facturacion: facturacion,
            metodoPago: 'PayPal'
          };

          self.reservaService.updateReservas(pagoData).subscribe(
            response => {
              console.log('Reservas actualizadas:', response);
              self.loadReservas();
            },
            error => {
              console.error('Error al actualizar las reservas', error);
            }
          );
        });
      },
      onError(err: any) {
        console.error('Error durante el pago con PayPal:', err);
      }
    }).render('#paypal-button-container'); // ID del contenedor donde se renderizará el botón
  }

}
