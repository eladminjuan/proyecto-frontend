import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './componentes/home/home.component';
import { HabitacionesComponent } from './componentes/habitaciones/habitaciones.component';
import { ServiciosComponent } from './componentes/servicios/servicios.component';
import { ReservasComponent } from './componentes/reservas/reservas.component';
import { BlogComponent } from './componentes/blog/blog.component';
import { ContactoComponent } from './componentes/contacto/contacto.component';
import { LoginComponent } from './componentes/login/login.component';
import { CarritoComponent } from './componentes/carrito/carrito.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {path:'',pathMatch:'full', redirectTo:'home'},
  {path:'home', component:HomeComponent},
  {path:'habitaciones', component:HabitacionesComponent},
  {path:'servicios', component:ServiciosComponent},
  {path:'reservas', component:ReservasComponent, canActivate: [AuthGuard] },
  {path:'blog', component:BlogComponent},
  {path:'contacto', component:ContactoComponent},
  {path:'login', component:LoginComponent},
  {path:'carrito', component:CarritoComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
