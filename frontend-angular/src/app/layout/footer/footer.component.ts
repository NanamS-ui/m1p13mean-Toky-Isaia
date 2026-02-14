import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="app-footer">
      <div class="footer-content">
        <p>RABENJA Mandresy Isaia  et RAHAJAMANANA Ralison Toky</p>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background-color: #1a1a2e;
      color: #e0e0e0;
      text-align: center;
      padding: 16px 24px;
      font-size: 14px;
      border-top: 2px solid #16213e;
      width: 100%;
      margin-top: auto;
    }

    .footer-content p {
      margin: 0;
      letter-spacing: 0.5px;
    }
  `]
})
export class FooterComponent {}
