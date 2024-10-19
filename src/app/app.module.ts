import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './componentes/home/home.component';
import { HabitacionesComponent } from './componentes/habitaciones/habitaciones.component';
import { ServiciosComponent } from './componentes/servicios/servicios.component';
import { ReservasComponent } from './componentes/reservas/reservas.component';
import { BlogComponent } from './componentes/blog/blog.component';
import { ContactoComponent } from './componentes/contacto/contacto.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './componentes/login/login.component';
import { CarritoComponent } from './componentes/carrito/carrito.component';
import { ExchangeRateService } from './services/exchange-rate.service';
import { ToastrModule } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HabitacionesComponent,
    ServiciosComponent,
    ReservasComponent,
    BlogComponent,
    ContactoComponent,
    LoginComponent,
    CarritoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    MatDialogModule,
    ToastrModule.forRoot(),
    ReactiveFormsModule,
  ],
  providers: [ExchangeRateService],
  bootstrap: [AppComponent]
})
export class AppModule { }
