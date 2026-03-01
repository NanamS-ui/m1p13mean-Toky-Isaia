import { Component, signal, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, inject, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/events/event.service';
import { EventEntity } from '../../../core/models/events/event.model';
import { ShopCategoryService } from '../../../core/services/shop/shop-category.service';
import { ShopService } from '../../../core/services/shop/shop.service';
import { ServiceCenterService } from '../../../core/services/config/service-center.service';
import type { ServiceCenterConfig } from '../../../core/models/config/service-center.model';
import { InfoCenterService } from '../../../core/services/config/info-center.service';
import type { InfoCenter } from '../../../core/models/config/info-center.model';
import { forkJoin } from 'rxjs';
import * as THREE from 'three';

interface FeaturedBoutique {
  id: string;
  name: string;
  category: string;
  logo?: string;
  description: string;
  ratingAvg: number;
  ratingCount: number;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  categoryValue: string;
  image?: string;
  description: string;
}

interface Category {
  icon: string;
  label: string;
  count: number;
}

interface ServiceCard {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent implements OnInit, AfterViewInit, OnDestroy {
  private eventService = inject(EventService);
  private shopCategoryService = inject(ShopCategoryService);
  private shopService = inject(ShopService);
  private serviceCenter = inject(ServiceCenterService);
  private infoCenterService = inject(InfoCenterService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  @ViewChild('heroCanvas', { static: false }) heroCanvasRef!: ElementRef<HTMLCanvasElement>;

  // Three.js
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animationId = 0;
  private mouse = new THREE.Vector2(0, 0);
  private clock = new THREE.Clock();
  private floatingObjects: THREE.Group[] = [];
  private particleSystem!: THREE.Points;
  private glowRings: THREE.Mesh[] = [];
  private boundMouseMove: ((e: MouseEvent) => void) | null = null;
  private boundResize: (() => void) | null = null;

  /** Mapping icône par nom de catégorie (insensible à la casse) */
  private readonly categoryIcons: Record<string, string> = {
    'mode': 'checkroom',
    'tech & électronique': 'devices',
    'beauté & bien-être': 'spa',
    'sport': 'sports_soccer',
    'restaurants': 'restaurant',
    'restaurant/food': 'restaurant',
    'bijouterie': 'diamond',
    'maison & décoration': 'chair',
    'enfants': 'child_care',
    'alimentation': 'local_grocery_store',
    'santé': 'local_pharmacy',
    'services': 'miscellaneous_services',
    'loisirs': 'attractions',
    'culture': 'menu_book',
    'animalerie': 'pets',
    'auto': 'directions_car',
  };

  /** Mapping icône par nom de service (insensible à la casse) */
  private readonly serviceIcons: Record<string, string> = {
    'parking': 'local_parking',
    'parking gratuit': 'local_parking',
    'wifi': 'wifi',
    'wi-fi': 'wifi',
    'espace enfants': 'child_care',
    'accessibilite': 'accessible',
    'accessibilite pmr': 'accessible',
    'distributeur': 'local_atm',
    'distributeurs': 'local_atm',
    'dab': 'local_atm',
    'navette': 'local_taxi',
    'navettes': 'local_taxi',
    'conciergerie': 'support_agent',
    'information': 'info',
    'accueil': 'info',
    'securite': 'verified_user',
    'restauration': 'restaurant'
  };

  categories: Category[] = [];

  infoCenter = signal<InfoCenter | null>(null);

  private readonly fallbackInfo = {
    addressFull: 'Ankorondrano, Antananarivo 101, Madagascar',
    hoursSummary: 'Lun-Sam: 09h-21h | Dim: 10h-20h',
    phone: '+261 20 22 123 45'
  };

  featuredBoutiques = signal<FeaturedBoutique[]>([
    { id: '1', name: 'Mode & Style', category: 'Mode', description: 'Prêt-à-porter tendance pour toute la famille', ratingAvg: 0, ratingCount: 0 },
    { id: '2', name: 'TechZone', category: 'High-Tech', description: 'Électronique et gadgets dernière génération', ratingAvg: 0, ratingCount: 0 },
    { id: '3', name: 'Beauty Corner', category: 'Beauté', description: 'Cosmétiques et soins de qualité', ratingAvg: 0, ratingCount: 0 },
    { id: '4', name: 'Sport Plus', category: 'Sport', description: 'Équipements sportifs pour tous les niveaux', ratingAvg: 0, ratingCount: 0 },
    { id: '5', name: 'Gourmet House', category: 'Restaurant', description: 'Cuisine gastronomique et ambiance raffinée', ratingAvg: 0, ratingCount: 0 },
    { id: '6', name: 'Kids Paradise', category: 'Enfants', description: 'Jouets et vêtements pour enfants', ratingAvg: 0, ratingCount: 0 }
  ]);

  upcomingEvents = signal<Event[]>([]);

  ngOnInit(): void {
    this.loadCategories();
    this.loadTopBoutiques();
    this.loadEvents();
    this.loadServices();
    this.loadInfoCenter();
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => this.initThreeScene());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    if (this.boundMouseMove) window.removeEventListener('mousemove', this.boundMouseMove);
    if (this.boundResize) window.removeEventListener('resize', this.boundResize);
    this.renderer?.dispose();
  }

  /* ─── Three.js Scene — Centre Commercial ─── */

  private initThreeScene(): void {
    const canvas = this.heroCanvasRef?.nativeElement;
    if (!canvas) return;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.8;

    // Scene — lighter feel
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0f1e3a, 0.008);

    // Camera — plus proche pour zoomer
    this.camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    this.camera.position.set(0, 0, 15);

    // Lights — bright & warm shopping ambiance
    const ambient = new THREE.AmbientLight(0xfff8f0, 0.9);
    this.scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xfff5e6, 0x1a2744, 0.6);
    this.scene.add(hemi);

    const spotMain = new THREE.SpotLight(0xf59e0b, 5, 70, Math.PI / 3.5, 0.4, 0.8);
    spotMain.position.set(5, 12, 18);
    this.scene.add(spotMain);

    const pointBlue = new THREE.PointLight(0x60a5fa, 3, 55);
    pointBlue.position.set(-10, -3, 12);
    this.scene.add(pointBlue);

    const pointPink = new THREE.PointLight(0xf472b6, 2.5, 50);
    pointPink.position.set(10, -5, 10);
    this.scene.add(pointPink);

    const pointTop = new THREE.PointLight(0xa78bfa, 2, 45);
    pointTop.position.set(0, 10, 8);
    this.scene.add(pointTop);

    const pointFront = new THREE.PointLight(0xfff5e6, 1.5, 40);
    pointFront.position.set(0, 0, 20);
    this.scene.add(pointFront);

    // Create themed objects
    this.createShoppingBags();
    this.createGiftBoxes();
    this.createStars();
    this.createPriceTags();
    this.createSparkleParticles();
    this.createGlowRings();

    // Events
    this.boundMouseMove = (e: MouseEvent) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    this.boundResize = () => this.onResize();
    window.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('resize', this.boundResize);

    this.animate();
  }

  /** Sacs shopping 3D */
  private createShoppingBags(): void {
    const bagColors = [0xf59e0b, 0xef4444, 0x3b82f6, 0x10b981, 0xec4899, 0x8b5cf6];

    for (let i = 0; i < 8; i++) {
      const group = new THREE.Group();
      const color = bagColors[i % bagColors.length];

      // Corps du sac (box arrondie)
      const bodyGeo = new THREE.BoxGeometry(1.8, 2.1, 1.0, 2, 2, 2);
      const bodyMat = new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.05,
        roughness: 0.35,
        transparent: true,
        opacity: 0.92,
        emissive: color,
        emissiveIntensity: 0.25,
        clearcoat: 0.4,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      // Anse du sac (torus demi-cercle)
      const handleGeo = new THREE.TorusGeometry(0.55, 0.06, 8, 20, Math.PI);
      const handleMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.6,
        roughness: 0.2,
      });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.position.y = 1.05;
      handle.rotation.x = Math.PI;
      group.add(handle);

      // Logo "K" au centre (petit plan)
      const logoGeo = new THREE.PlaneGeometry(0.6, 0.6);
      const logoMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const logo = new THREE.Mesh(logoGeo, logoMat);
      logo.position.z = 0.52;
      group.add(logo);

      this.placeFloatingObject(group, 22, i);
      this.scene.add(group);
      this.floatingObjects.push(group);
    }
  }

  /** Boîtes cadeaux 3D */
  private createGiftBoxes(): void {
    const giftColors = [0xef4444, 0xf59e0b, 0x8b5cf6, 0x06b6d4, 0xec4899];

    for (let i = 0; i < 6; i++) {
      const group = new THREE.Group();
      const color = giftColors[i % giftColors.length];

      // Boîte
      const boxGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const boxMat = new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.1,
        roughness: 0.25,
        transparent: true,
        opacity: 0.9,
        emissive: color,
        emissiveIntensity: 0.25,
        clearcoat: 0.5,
      });
      const box = new THREE.Mesh(boxGeo, boxMat);
      group.add(box);

      // Ruban horizontal
      const ribbonH = new THREE.Mesh(
        new THREE.BoxGeometry(1.55, 0.15, 1.55),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.7, roughness: 0.15 })
      );
      group.add(ribbonH);

      // Ruban vertical
      const ribbonV = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 1.55, 1.55),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.7, roughness: 0.15 })
      );
      group.add(ribbonV);

      // Noeud
      const bowGeo = new THREE.SphereGeometry(0.22, 8, 8);
      const bowMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.5, roughness: 0.2 });
      const bow = new THREE.Mesh(bowGeo, bowMat);
      bow.position.y = 0.82;
      group.add(bow);

      const scale = 0.7 + Math.random() * 0.5;
      group.scale.setScalar(scale);

      this.placeFloatingObject(group, 24, i + 8);
      this.scene.add(group);
      this.floatingObjects.push(group);
    }
  }

  /** Étoiles dorees */
  private createStars(): void {
    for (let i = 0; i < 10; i++) {
      const group = new THREE.Group();

      // Étoile = 2 tétraèdres superposés
      const starMat = new THREE.MeshPhysicalMaterial({
        color: 0xffd700,
        metalness: 0.6,
        roughness: 0.1,
        emissive: 0xffc107,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.95,
      });

      const t1 = new THREE.Mesh(new THREE.TetrahedronGeometry(0.55, 0), starMat);
      const t2 = new THREE.Mesh(new THREE.TetrahedronGeometry(0.55, 0), starMat);
      t2.rotation.y = Math.PI / 4;
      t2.rotation.x = Math.PI;
      group.add(t1, t2);

      const scale = 0.7 + Math.random() * 1.0;
      group.scale.setScalar(scale);

      this.placeFloatingObject(group, 26, i + 14);
      this.scene.add(group);
      this.floatingObjects.push(group);
    }
  }

  /** Étiquettes de prix */
  private createPriceTags(): void {
    for (let i = 0; i < 5; i++) {
      const group = new THREE.Group();

      // Étiquette (rectangle arrondi)
      const tagGeo = new THREE.BoxGeometry(1.2, 0.75, 0.06, 2, 2, 1);
      const tagMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.0,
        roughness: 0.6,
        transparent: true,
        opacity: 0.75,
        emissive: 0xfff8e1,
        emissiveIntensity: 0.1,
      });
      const tag = new THREE.Mesh(tagGeo, tagMat);
      group.add(tag);

      // Trou pour ficelle
      const holeGeo = new THREE.RingGeometry(0.04, 0.07, 12);
      const holeMat = new THREE.MeshBasicMaterial({ color: 0xd4d4d4, side: THREE.DoubleSide });
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.position.set(0.3, 0.18, 0.03);
      group.add(hole);

      // Barre "prix" (petit rectangle coloré)
      const priceGeo = new THREE.BoxGeometry(0.65, 0.18, 0.07);
      const priceMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
      const price = new THREE.Mesh(priceGeo, priceMat);
      price.position.set(-0.05, -0.05, 0.03);
      group.add(price);

      const scale = 1.0 + Math.random() * 0.6;
      group.scale.setScalar(scale);

      this.placeFloatingObject(group, 20, i + 24);
      this.scene.add(group);
      this.floatingObjects.push(group);
    }
  }

  /** Place un objet flottant aléatoirement dans l'espace */
  private placeFloatingObject(group: THREE.Group, spread: number, seed: number): void {
    // Distribution dispersée dans tout le champ de vision
    const angle = (seed / 30) * Math.PI * 2 + Math.random() * 1.2;
    const radiusXZ = 3 + Math.random() * (spread * 0.55);
    group.position.set(
      Math.cos(angle) * radiusXZ * (0.5 + Math.random() * 0.7),
      (Math.random() - 0.5) * spread * 0.6,
      1 + Math.random() * -10
    );
    group.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 0.5
    );

    group.userData['rotSpeed'] = 0.003 + Math.random() * 0.008;
    group.userData['floatOffset'] = Math.random() * Math.PI * 2;
    group.userData['floatAmplitude'] = 0.4 + Math.random() * 0.6;
    group.userData['floatSpeed'] = 0.3 + Math.random() * 0.4;
    group.userData['baseY'] = group.position.y;
    group.userData['baseX'] = group.position.x;
    group.userData['driftX'] = (Math.random() - 0.5) * 0.15;
  }

  /** Particules scintillantes dorées et blanches */
  private createSparkleParticles(): void {
    const count = 800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color(0xffd700), // or
      new THREE.Color(0xf59e0b), // ambre
      new THREE.Color(0xffffff), // blanc
      new THREE.Color(0xfbbf24), // jaune
      new THREE.Color(0x60a5fa), // bleu clair
    ];

    for (let i = 0; i < count; i++) {
      // Distribution sphérique
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 5 + Math.random() * 20;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = r * Math.cos(phi) * 0.5 - 3;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.particleSystem = new THREE.Points(geo, mat);
    this.scene.add(this.particleSystem);
  }

  /** Anneaux lumineux de centre commercial */
  private createGlowRings(): void {
    const ringConfigs = [
      { radius: 6, color: 0xf59e0b, opacity: 0.28, tube: 0.04 },
      { radius: 9, color: 0x60a5fa, opacity: 0.2, tube: 0.035 },
      { radius: 12, color: 0xf472b6, opacity: 0.15, tube: 0.03 },
      { radius: 4, color: 0xffd700, opacity: 0.35, tube: 0.045 },
    ];

    ringConfigs.forEach((cfg, i) => {
      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 120);
      const mat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: cfg.opacity,
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.position.z = -5 - i * 3;
      ring.rotation.x = Math.PI * 0.3 + i * 0.15;
      ring.userData['direction'] = i % 2 === 0 ? 1 : -1;
      ring.userData['axis'] = i;
      this.scene.add(ring);
      this.glowRings.push(ring);
    });
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();

    // Animate shopping objects
    for (const obj of this.floatingObjects) {
      // Rotation lente
      obj.rotation.y += obj.userData['rotSpeed'];
      obj.rotation.x += obj.userData['rotSpeed'] * 0.3;

      // Flottement doux
      obj.position.y =
        obj.userData['baseY'] +
        Math.sin(elapsed * obj.userData['floatSpeed'] + obj.userData['floatOffset']) * obj.userData['floatAmplitude'];

      // Légère dérive horizontale
      obj.position.x =
        obj.userData['baseX'] +
        Math.sin(elapsed * 0.15 + obj.userData['floatOffset']) * obj.userData['driftX'] * 5;

      // Influence souris (parallax)
      const depth = Math.abs(obj.position.z) * 0.02;
      obj.position.x += this.mouse.x * depth * 0.08;
      obj.position.y += this.mouse.y * depth * 0.05;
    }

    // Particules scintillantes
    if (this.particleSystem) {
      this.particleSystem.rotation.y = elapsed * 0.015;

      const positions = this.particleSystem.geometry.attributes['position'].array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(elapsed * 0.8 + i * 0.5) * 0.002;
      }
      this.particleSystem.geometry.attributes['position'].needsUpdate = true;
    }

    // Anneaux
    for (const ring of this.glowRings) {
      const dir = ring.userData['direction'];
      ring.rotation.z += 0.001 * dir;
      ring.rotation.y += 0.0005 * dir;
    }

    // Camera réactive à la souris
    this.camera.position.x += (this.mouse.x * 2.0 - this.camera.position.x) * 0.025;
    this.camera.position.y += (this.mouse.y * 1.2 - this.camera.position.y) * 0.025;
    this.camera.lookAt(0, 0, -3);

    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    const canvas = this.heroCanvasRef?.nativeElement;
    if (!canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private loadTopBoutiques(): void {
    this.shopService.getTopShops(10).subscribe({
      next: (shops) => {
        const mapped = (shops || []).map((s) => ({
          id: s._id,
          name: s.name,
          category: s.shop_category?.value || '',
          logo: s.logo || undefined,
          description: s.description || '',
          ratingAvg: Number((s as any).avgRating ?? 0),
          ratingCount: Number((s as any).ratingCount ?? 0)
        }));
        if (mapped.length > 0) {
          this.featuredBoutiques.set(mapped);
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Erreur chargement top boutiques:', err);
      }
    });
  }

  private loadCategories(): void {
    forkJoin({
      categories: this.shopCategoryService.getShopCategories(),
      shops: this.shopService.getActiveShops()
    }).subscribe({
      next: ({ categories, shops }) => {
        // Compter les boutiques par catégorie
        const countMap = new Map<string, number>();
        for (const shop of shops || []) {
          const catValue = shop.shop_category?.value || shop.shop_category?._id || '';
          if (catValue) {
            countMap.set(catValue, (countMap.get(catValue) || 0) + 1);
          }
        }

        this.categories = (categories || []).map(cat => ({
          label: cat.value,
          icon: this.getCategoryIconByName(cat.value),
          count: countMap.get(cat.value) || countMap.get(cat._id) || 0
        }));

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement catégories/boutiques:', err);
      }
    });
  }

  private loadEvents(): void {
    this.eventService.getEvents({ published: true }).subscribe({
      next: (entities) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const mapped = (entities || [])
          .filter((e) => e?.published)
          .filter((e) => {
            const startDate = new Date(e.started_date);
            startDate.setHours(0, 0, 0, 0);
            return startDate >= today;
          })
          .sort((a, b) => new Date(a.started_date).getTime() - new Date(b.started_date).getTime())
          .slice(0, 3)
          .map((e) => this.mapEntityToHomeEvent(e));

        this.upcomingEvents.set(mapped);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement événements accueil:', err);
        this.upcomingEvents.set([]);
      }
    });
  }

  services: ServiceCard[] = [];

  private loadServices(): void {
    this.serviceCenter.getAll().subscribe({
      next: (items: ServiceCenterConfig[]) => {
        const mapped = (items || []).map((item) => ({
          title: item.value,
          description: item.description || 'Service disponible dans le centre',
          icon: this.getServiceIconByName(item.value)
        }));

        this.services = mapped.length > 0 ? mapped : this.getDefaultServices();
        this.cdr.detectChanges();
      },
      error: () => {
        this.services = this.getDefaultServices();
        this.cdr.detectChanges();
      }
    });
  }

  private loadInfoCenter(): void {
    this.infoCenterService.getAll().subscribe({
      next: (items: InfoCenter[]) => {
        this.infoCenter.set(items?.[0] || null);
        this.cdr.detectChanges();
      },
      error: () => {
        this.infoCenter.set(null);
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  getCategoryIcon(categoryValue?: string | null): string {
    const value = (categoryValue || '').toLowerCase();
    if (value === 'promo' || value === 'promotion' || value === 'promotions') return 'local_offer';
    if (value === 'atelier' || value === 'ateliers') return 'workshop';
    return 'celebration';
  }

  private getCategoryIconByName(name: string): string {
    const key = (name || '').toLowerCase().trim();
    return this.categoryIcons[key] || 'category';
  }

  private getServiceIconByName(name: string): string {
    const key = (name || '').toLowerCase().trim();
    return this.serviceIcons[key] || 'star';
  }

  private getDefaultServices(): ServiceCard[] {
    return [
      { icon: 'local_parking', title: 'Parking gratuit', description: '2000 places avec 2h gratuites' },
      { icon: 'wifi', title: 'WiFi gratuit', description: 'Connexion haut debit dans tout le centre' },
      { icon: 'child_care', title: 'Espace enfants', description: 'Aire de jeux surveillee' },
      { icon: 'accessible', title: 'Accessibilite', description: 'Acces PMR et fauteuils disponibles' },
      { icon: 'local_atm', title: 'Distributeurs', description: 'Plusieurs DAB dans le centre' },
      { icon: 'local_taxi', title: 'Navettes', description: 'Service de navettes gratuites' }
    ];
  }

  getInfoAddress(): string {
    return this.infoCenter()?.address?.full || this.fallbackInfo.addressFull;
  }

  getInfoHoursSummary(): string {
    return this.infoCenter()?.hoursSummary || this.fallbackInfo.hoursSummary;
  }

  getInfoPhone(): string {
    return this.infoCenter()?.contact?.phone || this.fallbackInfo.phone;
  }

  getMapsLink(): string {
    const address = this.getInfoAddress();
    return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  }

  private mapEntityToHomeEvent(entity: EventEntity): Event {
    const categoryValue = (entity.category?.value || 'event').toString();
    const time = entity.all_day ? 'Journée entière' : ((entity.start_time || '').toString());

    return {
      id: entity._id,
      title: entity.title,
      description: (entity.description || '').toString(),
      date: entity.started_date,
      time,
      categoryValue,
      image: entity.image_url || undefined
    };
  }
}
