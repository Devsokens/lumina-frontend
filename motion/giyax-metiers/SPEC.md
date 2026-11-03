# SPEC — « Trois métiers, une plateforme »

GOAL:    dès la 1re seconde, le spectateur lit ce que fait GiyaX (vendre des billets, prendre des
         commandes, louer des logements, encaisser en Mobile Money) et retient le logo GiyaX.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps, muet, lu en boucle (hero + panneau de connexion).
TIME:    30 s = 900 frames.
CROP:    tout texte et toute carte tiennent dans la bande centrale x ∈ [530, 1390] (860 px) :
         panneau vertical de /login (cover) et carré mobile du hero (bande de 1080 px).

LOOK:    medium = séquences filmées réelles (Pexels, licence libre) plein cadre + interface GiyaX
         rebâtie depuis le code (scan-result, order-card KDS, stay-calendar, stays/confirmation).
         voile : dégradé noir 55 % → 25 % → 60 % (haut → milieu → bas) sur chaque séquence.
         ink : #FFFFFF sur vidéo ; #0B1F1A sur cartes blanches.
         accent or #F4B942 : un mot par titre, la pastille du métier, rien d'autre.
         vert GiyaX #0A4F3C : boutons de l'app, nuits réservées, aplat final.
         vert succès #10B981 : verdict « Billet valide » (couleur réelle du scanner).
         type : Montserrat 800, titres 88 px (tracking -2 %), pastille 34 px 600,
         interface ≥ 32 px. Mono JetBrains pour numéros (CMD-0427, compteur).
MOTION:  titre : mots flou 8 px → 0 en 0.18 s, 0.08 s d'écart ; rangement en haut : 0.6 s
         power3.inOut, échelle 1 → 0.6. Cartes : expo.out 0.7 s, flou 10 → 0, ≤ 40 px.
         Caméra sur la vidéo : 1.0 → 1.08 sur l'acte, power1.inOut.
         Transitions : whip (acte 1 → 2), poussée-flou (2 → 3), coupe nette sur le rythme (3 → 4),
         marée verte (montage → logo).
SHOTS:
  A1  0.0–8.4    Concert. 0.0 pastille « Organisateurs d'événements » ; 0.15 « Vendez vos /
                 billets en ligne » ; 2.4 le titre se range en haut ; 2.7 téléphone + billet
                 (QR réel) ; 3.9 ligne de scan ; 4.6 verdict vert « Billet valide » ;
                 5.1 compteur « Entrées 248 / 400 ». 7.95 whip.
  A2  7.95–16.1  Restaurant. pastille « Restaurateurs » ; « Prenez les / commandes à table » ;
                 rangement ; commande Table 04 (3 lignes + total) ; elle devient le bon cuisine
                 CMD-0427 « En préparation » → « Prêt ». 15.6 poussée-flou.
  A3  15.85–23.6 Appartement. pastille « Loueurs de meublés » ; « Remplissez / votre
                 calendrier » ; rangement ; calendrier de novembre : les nuits se colorent en
                 vert, réservation après réservation ; « Séjour réservé ! » 3 nuits.
  A4  23.4–30.0  Montage (concert, restaurant, appartement : 0.86 s chacun) sous « Une seule /
                 plateforme » ; 26.0 « Encaissez en Mobile Money » + logos Airtel Money,
                 Moov Money ; 27.3 marée verte ; 27.7 logo GiyaX ; 28.2 « La digitalisation qui
                 éclaire » ; tenu jusqu'à 30.0.
BANNED:  ouverture d'ambiance sans message ; fond noir vide ; lueurs, particules ; dégradés
         violets ; cartes en verre ; trois cartes côte à côte ; titres qui bougent une fois
         posés ; logo dans un coin ; interface inventée ; carte bancaire présentée comme
         Mobile Money.
QA:      frames 0, 30, 60, 120, 150, 260, 330, 400, 470, 560, 620, 700, 740, 800, 850, 890.
