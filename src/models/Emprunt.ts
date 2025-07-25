export interface Emprunt {
  id: string;
  utilisateurId: string;
  livreId: string;
  dateEmprunt: Date;
  dateRetourPrevu: Date;
  dateRetourEffectif?: Date;
  statut: 'EN_COURS' | 'RETOURNE' | 'EN_RETARD';
}

export interface CreateEmpruntRequest {
  utilisateurId: string;
  livreId: string;
  dureeEmprunt?: number; // en jours, par défaut 14
}

export interface EmpruntAvecDetails extends Emprunt {
  utilisateur: {
    nom: string;
    prenom: string;
    email: string;
  };
  livre: {
    titre: string;
    auteur: string;
    isbn: string;
  };
}
