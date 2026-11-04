# SPEC — « Studio produit » (v3, 2026-11-04)

Choisie par l'équipe parmi : Studio produit / Le chiffre qui monte / Portraits d'entrepreneurs.
Remplace « Trois métiers, une plateforme » (motion/giyax-metiers), jugée pas assez professionnelle.

GOAL:    un film de produit haut de gamme (façon Stripe / Apple) : chaque séquence s'ouvre sur
         une grande question qui pose le problème du client, puis le vrai logiciel GiyaX, dans de
         vrais appareils, y répond. Fin sur la promesse « Digitaliser son activité n'a jamais été
         aussi simple. », puis le logo.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps, muet (autoplay web), 40 s.
CROP:    titres et écrans de téléphone dans la bande centrale x ∈ [530, 1390] ; l'ordinateur
         dépasse un peu, les plans serrés (push-in) ramènent l'information au centre.

LOOK:    plateau studio vert GiyaX : fond radial #10614B → #052A20, lumière chaude dorée en haut
         à droite (rgba(244,185,66,.10)), ombre de contact elliptique sous chaque appareil.
         Appareils : téléphone (380 x 800, bord noir, îlot) et ordinateur portable (écran
         1132 x 700) dessinés en CSS, vus de face — jamais d'interface inclinée en 3D.
         Écrans : reconstruits depuis les composants de l'app (StatCard, OrderCard + ageColor,
         stay-calendar, ticket-purchase, pay/simulate, scan-result), polices du site Space
         Grotesk (titres, chiffres) et Inter (texte), tokens de globals.css.
         Questions : plein cadre, trois lignes courtes, Space Grotesk 700, 92 px, blanc, « ? »
         en or ; au-dessus, le métier en capitales or (Inter 600, 24 px) entre deux filets.
         Pendant une question sur l'ordinateur, celui-ci passe dans le flou (blur 18 px,
         luminosité 0.5, opacité 0.4).
         Réponses : Space Grotesk 700, 64 px, deux lignes à 96 px du haut : constat en blanc,
         bénéfice en or #F4B942 ; échangées par flou (jamais de glissement après la pose).
         Téléphones à 262 px (échelle 0.92), ordinateur à 268 px, sous les titres.
         Toute ligne de texte tient dans 860 px de large (bande x ∈ [530, 1390]) : la carte du
         hero mobile est carrée et le panneau de connexion est vertical.
MOTION:  appareils : arrivée expo.out 1.0 s ; caméra (push-in sur un détail) power2.inOut
         0.8 s, échelle ≤ 1.5 ; navigation dans l'app : glissement horizontal 0.45 s
         power3.inOut ; appuis : 0.97 puis 1 en 0.22 s ; chiffres qui défilent sur 1.6 s.
SHOTS:
  A  0.0–12.8   Question « Faux billets, files d'attente à l'entrée ? » (Événements).
                Téléphones. « Vendez en ligne. Encaissez tout de suite. » — achat de 2 billets →
                « Payer 20 000 FCFA » (Airtel Money) → « Paiement reçu », billet QR.
                « Zéro faux billet. Une seconde par entrée. » — second téléphone (scanner) :
                QR dans le viseur → « Billet valide », 247 → 248.
  B  12.4–34.7  Question « Des commandes qui se perdent en cuisine ? » (Restauration).
                Ordinateur. « Chaque commande, direct en cuisine. » — écran cuisine, CMD-0427
                arrive, « En préparation » → « Prêt ».
                Question « Des nuits vides et un planning sur un cahier ? » (Hébergement).
                « Réservé en ligne, payé d'avance. » — le calendrier se remplit, « Séjour réservé ! ».
                Question « Combien avez-vous vraiment gagné aujourd'hui ? » (Votre argent).
                « Chaque franc encaissé, sous vos yeux. » — tableau de bord : « Ventes du jour »
                0 → 1 248 500 FCFA, graphique et moyens de paiement.
  C  34.0–40.0  Marée verte, « Digitaliser son activité n'a jamais été aussi simple. », puis logo
                officiel, « La digitalisation qui éclaire », pastille « Gratuit pour démarrer ».
BANNED:  cartes blanches posées sur des vidéos de banque d'images ; interface inclinée en 3D ;
         lueurs, particules ; titres qui bougent une fois posés ; logo dans un coin ;
         interface inventée (tout libellé vient du code de l'app) ; noms de vraies entreprises.
