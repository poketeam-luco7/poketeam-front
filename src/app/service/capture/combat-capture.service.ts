import { Injectable } from '@angular/core';

/** Transmet le résultat d'un combat de capture à l'arène, puis le retour à la page Capture. */
@Injectable({ providedIn: 'root' })
export class CombatCaptureService {
  dernier: any = null;       // réponse de POST /capture/run/fight
  annonces: string[] = [];   // messages à afficher au retour (évolutions débloquées...)
}
