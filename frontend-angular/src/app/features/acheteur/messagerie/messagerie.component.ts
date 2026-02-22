import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MessengerService } from '../../../core/services/messenger/messenger.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-acheteur-messagerie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messagerie.component.html',
  styleUrl: './messagerie.component.css'
})
export class MessagerieComponent {
  recherche = '';
  lastMessages: any[] = [];
  selectedMesssage: any;

  private authService = inject(AuthService);
  user = this.authService.currentUser;

  newMessage = '';

  constructor(
    private messengerService: MessengerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      message: this.messengerService.getMessagesByUserConnecter()
    }).subscribe(({ message }) => {
      this.lastMessages = Array.isArray(message) ? message : [];
      this.cdr.detectChanges();
    });
  }

  get FilterLastMessage(): any[] {
    let lastMessagesFiltered = this.lastMessages;
    if (this.recherche !== '') {
      lastMessagesFiltered = lastMessagesFiltered.filter((r: any) =>
        (r?.name ?? '').toLowerCase().includes(this.recherche.toLowerCase())
      );
    }

    return lastMessagesFiltered;
  }

  formatDate(date?: string | Date): string {
    if (!date) return '-';

    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';

    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  }

  selectConversation2(conv: any): void {
    forkJoin({
      selectedMessage: this.messengerService.getConversation(conv?._id)
    }).subscribe(({ selectedMessage }) => {
      this.selectedMesssage = { conv, selectedMessage };
      this.cdr.detectChanges();
    });
  }

  sendMessage2(): void {
    if (!this.newMessage.trim() || !this.selectedMesssage) return;

    const currentUser = this.user();
    if (!currentUser) return;

    const messagePayload = {
      sender: currentUser.id,
      recipient: this.selectedMesssage.conv._id,
      message: this.newMessage,
      created_date: new Date()
    };

    this.messengerService.createMessage(messagePayload).subscribe((response) => {
      this.selectedMesssage = {
        ...this.selectedMesssage,
        selectedMessage: [response, ...this.selectedMesssage.selectedMessage]
      };

      const updatedConv = this.lastMessages.find(
        (c: any) => c._id === this.selectedMesssage.conv._id
      );

      if (!updatedConv) return;

      const updated = {
        ...updatedConv,
        lastMessage: [
          {
            ...updatedConv.lastMessage?.[0],
            message: this.newMessage,
            created_date: new Date()
          }
        ]
      };

      this.lastMessages = this.lastMessages.filter(
        (c: any) => c._id !== updatedConv._id
      );

      this.lastMessages.unshift(updated);
      this.newMessage = '';
      this.cdr.detectChanges();
    });
  }
}
