import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  userPhotoUrl!: string;
  title = 'dashboard';
  searchTerm$ = new Subject<string>();
  constructor(private renderer: Renderer2, private el: ElementRef, private router: Router, private loginService: LoginService) { }

  ngOnInit(): void {
    const userPhotoBase64 = this.loginService.getUserPhoto();
    if (userPhotoBase64) {
      this.userPhotoUrl = `data:image/jpeg;base64,${userPhotoBase64}`;
    } else {
      this.userPhotoUrl = '../assets/img/user.png';
    }
    const list: NodeListOf<HTMLLIElement> = this.el.nativeElement.querySelectorAll('.navigation li');
    const toggle = this.el.nativeElement.querySelector('.toggle') as HTMLElement;
    const navigation = this.el.nativeElement.querySelector('.navigation') as HTMLElement;
    const main = this.el.nativeElement.querySelector('.main') as HTMLElement;

    list.forEach((item) => {
      this.renderer.listen(item, 'mouseover', () => this.activeLink(item, list));
    });


    if (toggle && navigation && main) {
      this.renderer.listen(toggle, 'click', () => {
        this.toggleClass(navigation, 'active');
        this.toggleClass(main, 'active');
      });
    }
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm$.next(target.value);
  }

  activeLink(item: HTMLLIElement, list: NodeListOf<HTMLLIElement>): void {
    list.forEach((li) => {
      this.renderer.removeClass(li, 'hovered');
    });
    this.renderer.addClass(item, 'hovered');
  }

  toggleClass(element: HTMLElement, className: string): void {
    if (element.classList.contains(className)) {
      this.renderer.removeClass(element, className);
    } else {
      this.renderer.addClass(element, className);
    }
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']); // Redirigir a la página de login o a otra ruta según tu aplicación
  }

  isLoggedIn(): boolean {
    return this.loginService.isLoggedIn();
  }

  hasAdminRole(): boolean {
    return this.loginService.getUserRoles().includes('Administrador');
  }
}
