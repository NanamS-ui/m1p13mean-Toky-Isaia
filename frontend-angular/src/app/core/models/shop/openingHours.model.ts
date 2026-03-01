export interface OpeningHourShop {
  day: 
    | 'Lundi'
    | 'Mardi'
    | 'Mercredi'
    | 'Jeudi'
    | 'Vendredi'
    | 'Samedi'
    | 'Dimanche';
  isOpen : boolean;
  openTime: string;  
  closeTime: string;    
}
