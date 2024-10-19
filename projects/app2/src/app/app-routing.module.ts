import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { ReservasComponent } from './reservas/reservas.component';
import { ClientesComponent } from './clientes/clientes.component';
import { HabitacionesComponent } from './habitaciones/habitaciones.component';
import { AccesoComponent } from './acceso/acceso.component';
import { ServiciosComponent } from './servicios/servicios.component';
import { BlogComponent } from './blog/blog.component';
import { SettingComponent } from './setting/setting.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';


const routes: Routes = [
  {path:'inicio', component:InicioComponent, canActivate: [AuthGuard]},
  {path:'reservas', component:ReservasComponent, canActivate: [AuthGuard]},
  {path:'clientes', component:ClientesComponent, canActivate: [AuthGuard]},
  {path:'habitaciones', component:HabitacionesComponent, canActivate: [AuthGuard], data: { roles: ['Administrador'] }},
  {path:'acceso', component:AccesoComponent, canActivate: [AuthGuard], data: { roles: ['Administrador'] }},
  {path:'servicios', component:ServiciosComponent, canActivate: [AuthGuard], data: { roles: ['Administrador'] }},
  {path:'blog', component:BlogComponent, canActivate: [AuthGuard], data: { roles: ['Administrador'] }},
  {path:'setting', component:SettingComponent, canActivate: [AuthGuard], data: { roles: ['Administrador'] }},
  { path: 'login', component: LoginComponent },
  { path: '', component: InicioComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
