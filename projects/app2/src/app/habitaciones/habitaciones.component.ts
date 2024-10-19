import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { HabitacionService } from '../services/habitacion.service';
import { format } from 'date-fns';
import { AppComponent } from '../app.component';
import { debounceTime } from 'rxjs/operators';


interface Habitacion {
  _id?: string;
  estilo: string;
  numero: number;
  capacidad: number;
  slug: string;
  foto?: File;
  video: string;
  descripcion: string;
  precio: number;
  estado: string;
  fecha: string;
}

declare var Swal: any;

@Component({
  selector: 'app-habitaciones',
  templateUrl: './habitaciones.component.html',
  styleUrls: ['./habitaciones.component.css']
})
export class HabitacionesComponent implements OnInit {
  habitacion: Habitacion = {
    estilo: '',
    numero: 0,
    capacidad: 0,
    slug: '',
    video: '',
    descripcion: '',
    precio: 0,
    estado: 'Disponible',
    fecha: ''
  };

  habitaciones: Habitacion[] = [];
  filteredHabitaciones: Habitacion[] = [];
  isEditMode = false;
  isModalOpen = false;

  public page!: number;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private habitacionService: HabitacionService,
    private appComponent: AppComponent
  ) {
    this.appComponent.searchTerm$.pipe(
      debounceTime(300)
    ).subscribe(term => {
      this.filterHabitaciones(term);
    });
  }

  ngOnInit(): void {
    this.loadHabitaciones();
  }

  onFileChange(event: any) {
    this.habitacion.foto = event.target.files[0];
  }

  createHabitacion(): void {
    const fechaFormateada = format(new Date(), 'dd/MM/yyyy');
    const formData = new FormData();
    formData.append('estilo', this.habitacion.estilo);
    formData.append('numero', this.habitacion.numero.toString());
    formData.append('capacidad', this.habitacion.capacidad.toString());
    formData.append('slug', this.habitacion.slug);
    if (this.habitacion.foto && this.habitacion.foto instanceof File) {
      formData.append('foto', this.habitacion.foto);
    }
    formData.append('video', this.habitacion.video);
    formData.append('descripcion', this.habitacion.descripcion);
    formData.append('precio', this.habitacion.precio.toString());
    formData.append('estado', this.habitacion.estado);
    formData.append('fecha', fechaFormateada);

    this.habitacionService.createHabitacion(formData).subscribe(
      response => {
        console.log('Habitación creada con éxito', response);
        this.loadHabitaciones();  // Refrescar la lista de habitaciones
        this.closeModal();
        Swal.fire({
          title: "Habitación Creada",
          text: "La habitación se creó correctamente",
          icon: "success"
        });
      },
      error => {
        console.error('Error al crear la habitación', error);
      }
    );
  }

  loadHabitaciones(): void {
    this.habitacionService.getHabitaciones().subscribe(
      (data: Habitacion[]) => {
        this.habitaciones = data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        this.filteredHabitaciones = [...this.habitaciones];
      },
      error => {
        console.error('Error al cargar las habitaciones', error);
      }
    );
  }

  filterHabitaciones(term: string) {
    this.filteredHabitaciones = this.habitaciones.filter(habitacion =>
      habitacion.estilo.toLowerCase().includes(term.toLowerCase()) ||
      habitacion.numero.toString().includes(term) ||
      habitacion.capacidad.toString().includes(term) ||
      habitacion.estado.toLowerCase().includes(term.toLowerCase()) ||
      habitacion.precio.toString().includes(term)
    );
  }

  deleteHabitacion(id: string): void {
    this.habitacionService.deleteHabitacion(id).subscribe(
      response => {
        console.log('Habitación eliminada con éxito', response);
        this.loadHabitaciones();  // Refrescar la lista de habitaciones
        Swal.fire({
          title: "Habitación Eliminada",
          text: "La habitación se eliminó correctamente",
          icon: "success"
        });
      },
      error => {
        console.error('Error al eliminar la habitación', error);
      }
    );
  }

  editHabitacion(habitacion: Habitacion): void {
    this.habitacion = { ...habitacion };
    this.isEditMode = true;
    this.openModal();
  }

  updateHabitacion(): void {
    const fechaFormateada = format(new Date(), 'dd/MM/yyyy');
    const formData = new FormData();
    formData.append('estilo', this.habitacion.estilo);
    formData.append('numero', this.habitacion.numero.toString());
    formData.append('capacidad', this.habitacion.capacidad.toString());
    formData.append('slug', this.habitacion.slug);
    if (this.habitacion.foto && this.habitacion.foto instanceof File) {
      formData.append('foto', this.habitacion.foto);
    }
    formData.append('video', this.habitacion.video);
    formData.append('descripcion', this.habitacion.descripcion);
    formData.append('precio', this.habitacion.precio.toString());
    formData.append('estado', this.habitacion.estado);
    formData.append('fecha', fechaFormateada);

    this.habitacionService.updateHabitacion(this.habitacion._id!, formData).subscribe(
      response => {
        console.log('Habitación actualizada con éxito', response);
        this.loadHabitaciones();  // Refrescar la lista de habitaciones
        this.closeModal();
        Swal.fire({
          title: "Habitación Actualizada",
          text: "La habitación se actualizó correctamente",
          icon: "success"
        });
      },
      error => {
        console.error('Error al actualizar la habitación', error);
      }
    );
  }

  submitForm(): void {
    if (this.isEditMode) {
      this.updateHabitacion();
    } else {
      this.createHabitacion();
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
    this.habitacion = {
      estilo: '',
      numero: 0,
      capacidad: 0,
      slug: '',
      video: '',
      descripcion: '',
      precio: 0,
      estado: 'Disponible',
      fecha: ''
    };
  }
}
