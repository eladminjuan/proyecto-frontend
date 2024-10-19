import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { format } from 'date-fns';
import { AppComponent } from '../app.component';
import { debounceTime } from 'rxjs/operators';

interface Usuario {
  _id?: string;
  nombre: string;
  correo: string;
  password: string;
  roles: string[];
  foto?: File;
  telefono: string;
  tipdocu: string;
  numdocu: string;
  pais: string;
  estado: string;
  fecha: string;
}

declare var Swal: any;

@Component({
  selector: 'app-acceso',
  templateUrl: './acceso.component.html',
  styleUrls: ['./acceso.component.css']
})
export class AccesoComponent implements OnInit {
  usuario: Usuario = {
    nombre: '',
    correo: '',
    password: '',
    roles: [],
    telefono: '',
    tipdocu: '',
    numdocu: '',
    pais: '',
    estado: 'Activo',
    fecha: ''
  };

  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  isEditMode = false;
  isModalOpen = false;

  public page!: number;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private UsuarioService: UsuarioService,
    private appComponent: AppComponent
  ) {
    this.appComponent.searchTerm$.pipe(
      debounceTime(300)
    ).subscribe(term => {
      this.filterUsuarios(term);
    });
  }

  ngOnInit(): void {
    this.loadUsuarios();
  }

  onFileChange(event: any) {
    this.usuario.foto = event.target.files[0];
  }

  onRoleChange(event: any, role: string) {
    const checked = event.target.checked;
    if (checked) {
      this.usuario.roles.push(role);
    } else {
      const index = this.usuario.roles.indexOf(role);
      if (index !== -1) {
        this.usuario.roles.splice(index, 1);
      }
    }
  }

  hasRole(role: string): boolean {
    return this.usuario.roles.includes(role);
  }


  createUsuario(): void {
    const fechaFormateada = format(new Date(), 'dd/MM/yyyy');
    const formData = new FormData();
    formData.append('nombre', this.usuario.nombre);
    formData.append('correo', this.usuario.correo);
    formData.append('password', this.usuario.password);
    this.usuario.roles.forEach((role, index) => {
      formData.append(`roles[${index}]`, role);
    });
    if (this.usuario.foto && this.usuario.foto instanceof File) {
      formData.append('foto', this.usuario.foto);
    }
    formData.append('telefono', this.usuario.telefono);
    formData.append('tipdocu', this.usuario.tipdocu);
    formData.append('numdocu', this.usuario.numdocu);
    formData.append('pais', this.usuario.pais);
    formData.append('estado', this.usuario.estado);
    formData.append('fecha', fechaFormateada);

    this.UsuarioService.createUsuario(formData).subscribe(
      response => {
        console.log('Usuario creado con éxito', response);
        this.loadUsuarios();
        this.closeModal();
        Swal.fire({
          title: "Usuario Creado",
          text: "El usuario se creó correctamente",
          icon: "success"
        });
      },
      error => {
        console.error('Error al crear el usuario', error);
      }
    );
  }

  loadUsuarios(): void {
    this.UsuarioService.getUsuarios().subscribe(
      (data: Usuario[]) => {
        this.usuarios = data.map(usuario => ({
          ...usuario,
          roles: Array.isArray(usuario.roles) ? usuario.roles : JSON.parse(usuario.roles)
        })).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        this.filteredUsuarios = [...this.usuarios];
      },
      error => {
        console.error('Error al cargar los usuarios', error);
      }
    );
  }

  filterUsuarios(term: string) {
    this.filteredUsuarios = this.usuarios.filter(usuario =>
      usuario.nombre.toString().includes(term.toLowerCase()) ||
      usuario.correo.toString().includes(term) ||
      usuario.pais.toString().includes(term) ||
      usuario.telefono.toString().includes(term) ||
      usuario.tipdocu.toString().includes(term) ||
      usuario.numdocu.toString().includes(term) ||
      usuario.roles.toString().includes(term.toLowerCase()) ||
      usuario.estado.toLowerCase().includes(term.toLowerCase())
    );
  }

  deleteUsuario(id: string): void {
    this.UsuarioService.deleteUsuario(id).subscribe(
      response => {
        console.log('Usuario eliminado con éxito', response);
        this.loadUsuarios();
        Swal.fire({
          title: "Usuario Eliminado",
          text: "El usuario se eliminó correctamente",
          icon: "success"
        });
      },
      error => {
        console.error('Error al eliminar el usuario', error);
      }
    );
  }

  editUsuario(usuario: Usuario): void {
    this.usuario = { ...usuario };
    this.isEditMode = true;
    this.openModal();
  }

  updateUsuario(): void {
    const fechaFormateada = format(new Date(), 'dd/MM/yyyy');
    const formData = new FormData();
    formData.append('nombre', this.usuario.nombre);
    formData.append('correo', this.usuario.correo);
    formData.append('password', this.usuario.password);
    this.usuario.roles.forEach((role, index) => {
      formData.append(`roles[${index}]`, role);
    });
    if (this.usuario.foto && this.usuario.foto instanceof File) {
      formData.append('foto', this.usuario.foto);
    }
    formData.append('telefono', this.usuario.telefono);
    formData.append('tipdocu', this.usuario.tipdocu);
    formData.append('numdocu', this.usuario.numdocu);
    formData.append('pais', this.usuario.pais);
    formData.append('estado', this.usuario.estado);
    formData.append('fecha', fechaFormateada);

    this.UsuarioService.updateUsuario(this.usuario._id!, formData).subscribe(
      response => {
        console.log('Usuario actualizado con éxito', response);
        this.loadUsuarios();
        this.closeModal();
        Swal.fire({
          title: "Usuario Actualizado",
          text: "El usuario se actualizó correctamente",
          icon: "success"
        });
      },
      error => {
        console.error('Error al actualizar el usuario', error);
      }
    );
  }

  submitForm(): void {
    if (this.isEditMode) {
      this.updateUsuario();
    } else {
      this.createUsuario();
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
    this.usuario = {
      nombre: '',
      correo: '',
      password: '',
      roles: [],
      telefono: '',
      tipdocu: '',
      numdocu: '',
      pais: '',
      estado: 'Activo',
      fecha: ''
    };
  }
}
