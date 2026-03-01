import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessengerService } from '../../../core/services/messenger/messenger.service';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { OrderByDateAscPipe } from './order-by-date-asc.pipe';
interface Message {
  id: string;
  content: string;
  sender: 'customer' | 'shop';
  timestamp: string;
}

interface Conversation {
  id: string;
  customer: {
    name: string;
    avatar?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: Message[];
}

@Component({
  selector: 'app-messagerie',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderByDateAscPipe],
  templateUrl: './messagerie.component.html',
  styleUrl: './messagerie.component.css'
})
export class MessagerieComponent {
  recherche :string = "";
  lastMessages:any;
  selectedMesssage : any;
  private authService = inject(AuthService);
  user = this.authService.currentUser;
  constructor(private messengerService : MessengerService, private cdr : ChangeDetectorRef){}
  ngOnInit(): void {
    forkJoin({
      message : this.messengerService.getMessagesByUserConnecter()
    }).subscribe(({message})=>{
      this.lastMessages = message;
      console.log(message);
      this.cdr.detectChanges();
    })
  }
  get FilterLastMessage(){
    let lastMessagesFiltered = this.lastMessages;
    if(this.recherche !==''){
      lastMessagesFiltered = lastMessagesFiltered.filter((r:any) => r.name.toLowerCase().includes(this.recherche.toLowerCase()));
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
      selectedMessage: this.messengerService.getConversation(conv?._id),
      markAsRead: this.messengerService.markConversationAsRead(conv?._id)
    }).subscribe(({selectedMessage})=>{
      this.selectedMesssage = {conv : conv,selectedMessage:selectedMessage};
      this.cdr.detectChanges();
    })
  }
  newMessage = '';
  sendMessage2(): void {
    if (!this.newMessage.trim() || !this.selectedMesssage) return;
    const currentUser = this.user(); 

    if (!currentUser) return;
    const conv = this.selectedMesssage!;
    const messagePayload = {
      sender: currentUser.id,
      recipient: this.selectedMesssage.conv._id,
      message: this.newMessage,
      created_date : new Date()
    };
    this.messengerService.createMessage(messagePayload).subscribe((response) => {
      console.log(response);
      this.selectedMesssage = {
        ...this.selectedMesssage,
        selectedMessage: [
          response
          ,...this.selectedMesssage.selectedMessage
          
        ]
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
  selectedConversation = signal<Conversation | null>(null);

  conversations = signal<Conversation[]>([
    {
      id: '1',
      customer: { name: 'Marie Dupont' },
      lastMessage: 'Bonjour, je voulais savoir si la robe est disponible en taille M ?',
      lastMessageTime: '14:30',
      unread: 2,
      messages: [
        { id: '1', content: 'Bonjour ! Je suis intéressée par la robe été fleurie.', sender: 'customer', timestamp: '14:20' },
        { id: '2', content: 'Bonjour, je voulais savoir si la robe est disponible en taille M ?', sender: 'customer', timestamp: '14:30' }
      ]
    },
    {
      id: '2',
      customer: { name: 'Jean Martin' },
      lastMessage: 'Merci pour votre réponse rapide !',
      lastMessageTime: '12:15',
      unread: 0,
      messages: [
        { id: '1', content: 'Bonjour, ma commande CMD-2026-002 est-elle expédiée ?', sender: 'customer', timestamp: '11:45' },
        { id: '2', content: 'Bonjour Jean ! Oui, votre commande a été expédiée ce matin. Vous devriez la recevoir demain.', sender: 'shop', timestamp: '12:00' },
        { id: '3', content: 'Merci pour votre réponse rapide !', sender: 'customer', timestamp: '12:15' }
      ]
    },
    {
      id: '3',
      customer: { name: 'Sophie Bernard' },
      lastMessage: 'D\'accord, je vais passer commander.',
      lastMessageTime: 'Hier',
      unread: 0,
      messages: [
        { id: '1', content: 'Bonjour, avez-vous la veste en cuir en marron ?', sender: 'customer', timestamp: 'Hier 16:00' },
        { id: '2', content: 'Bonjour Sophie ! Malheureusement, ce modèle n\'est disponible qu\'en noir. Mais nous avons une veste similaire en marron.', sender: 'shop', timestamp: 'Hier 16:30' },
        { id: '3', content: 'D\'accord, je vais passer commander.', sender: 'customer', timestamp: 'Hier 17:00' }
      ]
    }
  ]);

  
  selectConversation(conv: Conversation): void {
    this.selectedConversation.set(conv);
    // Mark as read
    this.conversations.update(convs => 
      convs.map(c => c.id === conv.id ? { ...c, unread: 0 } : c)
    );
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation()) return;

    const conv = this.selectedConversation()!;
    const newMsg: Message = {
      id: Date.now().toString(),
      content: this.newMessage,
      sender: 'shop',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    this.conversations.update(convs =>
      convs.map(c => c.id === conv.id 
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.content, lastMessageTime: newMsg.timestamp }
        : c
      )
    );

    // Update selected conversation
    this.selectedConversation.set({
      ...conv,
      messages: [...conv.messages, newMsg],
      lastMessage: newMsg.content,
      lastMessageTime: newMsg.timestamp
    });

    this.newMessage = '';
  }

  totalUnread(): number {
    return this.conversations().reduce((sum, c) => sum + c.unread, 0);
  }
}
