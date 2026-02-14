export interface OpeningHour {
  day: 
    | 'LUNDI'
    | 'MARDI'
    | 'MERCREDI'
    | 'JEUDI'
    | 'VENDREDI'
    | 'SAMEDI'
    | 'DIMANCHE';

  heure_debut: string;  
  heure_fin: string;    
}
