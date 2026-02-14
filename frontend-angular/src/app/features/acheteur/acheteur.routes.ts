import { Routes } from '@angular/router';

export const acheteurRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layout/acheteur-layout/acheteur-layout.component').then(m => m.AcheteurLayoutComponent),
    children: [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      { 
        path: 'accueil', 
        loadComponent: () => import('./accueil/acheteur-accueil.component').then(m => m.AcheteurAccueilComponent)
      },
      { 
        path: 'profil', 
        loadComponent: () => import('./profil/acheteur-profil.component').then(m => m.AcheteurProfilComponent)
      },
      { 
        path: 'profil', 
        loadComponent: () => import('./profil/acheteur-profil.component').then(m => m.AcheteurProfilComponent)
      },
      { 
        path: 'boutiques', 
        loadComponent: () => import('./boutiques/boutiques-discovery.component').then(m => m.BoutiquesDiscoveryComponent)
      },
      { 
        path: 'boutiques/:id', 
        loadComponent: () => import('./boutiques/boutique-detail.component').then(m => m.BoutiqueDetailComponent)
      },
      { 
        path: 'produits', 
        loadComponent: () => import('./produits/produits-catalog.component').then(m => m.ProduitsCatalogComponent)
      },
      { 
        path: 'produits/:id', 
        loadComponent: () => import('./produits/produit-detail.component').then(m => m.ProduitDetailComponent)
      },
      { 
        path: 'panier', 
        loadComponent: () => import('./panier/panier.component').then(m => m.PanierComponent)
      },
      { 
        path: 'checkout', 
        loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent)
      },
      { 
        path: 'commandes', 
        loadComponent: () => import('./commandes/mes-commandes.component').then(m => m.MesCommandesComponent)
      },
      { 
        path: 'commandes/:id', 
        loadComponent: () => import('./commandes/commande-suivi.component').then(m => m.CommandeSuiviComponent)
      },
      { 
        path: 'avis', 
        loadComponent: () => import('./avis/mes-avis.component').then(m => m.MesAvisComponent)
      },
      { 
        path: 'carte', 
        loadComponent: () => import('./carte/carte-interactive.component').then(m => m.CarteInteractiveComponent)
      },
      { 
        path: 'notifications', 
        loadComponent: () => import('./notifications/notifications.component').then(m => m.NotificationsComponent)
      }
    ]
  }
];
