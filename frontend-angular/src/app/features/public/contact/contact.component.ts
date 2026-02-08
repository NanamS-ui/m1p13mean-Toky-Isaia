import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  contactForm: FormGroup;
  submitted = signal<boolean>(false);
  submitSuccess = signal<boolean>(false);

  contactInfo = {
    phone: '+261 20 22 123 45',
    email: 'contact@korus.mg',
    address: 'Ankorondrano, Antananarivo 101, Madagascar',
    hours: 'Lun-Sam: 09h-21h | Dim: 10h-20h'
  };

  faqs = signal<FAQ[]>([
    {
      id: '1',
      question: 'Quels sont les horaires d\'ouverture du centre ?',
      answer: 'Le KORUS Center est ouvert du lundi au samedi de 9h à 21h, et le dimanche de 10h à 20h. Les horaires peuvent varier pendant les jours fériés.',
      expanded: false
    },
    {
      id: '2',
      question: 'Y a-t-il un parking disponible ?',
      answer: 'Oui, nous disposons de 2000 places de parking. Les 2 premières heures sont gratuites pour tous les visiteurs.',
      expanded: false
    },
    {
      id: '3',
      question: 'Comment puis-je louer un espace commercial ?',
      answer: 'Pour toute demande de location d\'espace commercial, veuillez nous contacter par email à contact@korus.mg ou par téléphone au +261 20 22 123 45. Notre équipe commerciale vous fournira toutes les informations nécessaires.',
      expanded: false
    },
    {
      id: '4',
      question: 'Le centre est-il accessible aux personnes à mobilité réduite ?',
      answer: 'Absolument. Le KORUS Center est entièrement accessible aux personnes à mobilité réduite avec des ascenseurs, des rampes d\'accès et des places de parking réservées. Des fauteuils roulants sont également disponibles à l\'accueil.',
      expanded: false
    },
    {
      id: '5',
      question: 'Organisez-vous des événements ?',
      answer: 'Oui, nous organisons régulièrement des événements, animations et promotions. Consultez notre page d\'accueil ou suivez-nous sur les réseaux sociaux pour être informé des prochains événements.',
      expanded: false
    },
    {
      id: '6',
      question: 'Y a-t-il un service de navettes ?',
      answer: 'Oui, nous proposons un service de navettes gratuites depuis le centre-ville. Les horaires et itinéraires sont disponibles à l\'accueil du centre.',
      expanded: false
    }
  ]);

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.submitted.set(true);
    
    // Simulate form submission
    setTimeout(() => {
      console.log('Form submitted:', this.contactForm.getRawValue());
      this.submitSuccess.set(true);
      this.contactForm.reset();
      this.submitted.set(false);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        this.submitSuccess.set(false);
      }, 5000);
    }, 1000);
  }

  toggleFAQ(id: string): void {
    this.faqs.update(faqs => 
      faqs.map(faq => 
        faq.id === id 
          ? { ...faq, expanded: !faq.expanded }
          : { ...faq, expanded: false }
      )
    );
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.hasError('required') && field?.touched) {
      return 'Ce champ est requis';
    }
    if (field?.hasError('email') && field?.touched) {
      return 'Email invalide';
    }
    if (field?.hasError('minlength') && field?.touched) {
      const requiredLength = field.errors?.['minlength']?.requiredLength;
      return `Minimum ${requiredLength} caractères requis`;
    }
    return '';
  }
}
