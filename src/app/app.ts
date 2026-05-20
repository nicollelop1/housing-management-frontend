import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './shared/components/footer/footer';
import { Header } from './shared/components/header/header';
import { OverlayService } from './core/services/overlay.service';
import { ToastComponent } from './shared/components/toast/toast';
import { AuthService } from './core/services/auth.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, Header, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected overlay = inject(OverlayService);
  private auth = inject(AuthService);

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.auth.loadProfile();
    }
  }
}