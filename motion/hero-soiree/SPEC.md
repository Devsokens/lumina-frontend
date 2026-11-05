# SPEC — « Une soirée, trois lumières »

GOAL:    à la fin, le spectateur a compris qu'une seule plateforme fait tourner la soirée d'une ville
         (entrer à un concert, dîner, dormir), et retient « GiyaX — La digitalisation qui éclaire ».
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps, muet (autoplay web), lu en boucle.
TIME:    30 s x 30 fps = 900 frames. Pas de musique.
USAGE:   hero de la landing (cadre 16:9 complet) ET panneau gauche de /login (object-fit: cover dans
         un panneau vertical) → tout ce qui doit être lu ou reconnu tient dans la bande centrale
         x ∈ [530, 1390] (860 px). Les photos remplissent tout le cadre.

LOOK:    medium = photographie réelle de soirée (Unsplash, licence libre) + interface GiyaX
         rebâtie depuis le code de l'app.
         ground : la photo elle-même, jamais un fond noir vide ; voile vert GiyaX #035E4B à 0 → 35 %
         uniquement derrière les cartes, en dégradé vertical.
         ink : #FFFFFF sur photo, #0B1F1A sur cartes blanches.
         accent : or #E8B23A (le X du logo) — uniquement le faisceau, le mot clé d'une ligne, et
         l'état « validé / reçu ».
         vert d'état : #16A34A pour « Billet valide » (couleur réelle du scanner).
         type : Montserrat (embarquée). Titres 700, 64 px, tracking -2 %. Cartes : 600 / 28–34 px,
         jamais sous 26 px.
         cartes : blanc #FFFFFF, rayon 28 px, ombre 0 24 px 60 px rgba(0,0,0,.35), largeur 640–760 px.
         grain : 0. vignette : 0 (les photos sont déjà sombres sur les bords).
OBJECTS: billet sur téléphone avec QR ; verdict du scanner (aplat vert + coche + compteur d'entrées) ;
         commande d'une table (lignes de plats, total en F CFA) ; bon cuisine KDS ; notification
         hôte (réservation + acompte 30 %) ; clé dans une porte ; logo GiyaX blanc officiel
         (public/brand), jamais redessiné.
MOTION:  arrivée : expo.out 0.7 s ; caméra (Ken Burns) : power2.inOut sur toute la durée du plan,
         échelle 1.04 → 1.12, jamais au-delà ; sortie : power3.in 0.35 s ; cartes : arrivée par
         flou 10 px → 0 + opacité, translation ≤ 24 px ; décalage entre éléments 0.08 s.
         Le faisceau : un coin d'or (wedge) de 2 → 900 px de long, power3.inOut 0.6 s.
SHOTS:
  1  0.0–4.0   (0–120)    Crépuscule : boulevard de bord de mer, poussée 1.04 → 1.10. 0.6 s : le
                          faisceau d'or traverse de gauche à droite. 1.2 s : « Ce soir, la ville
                          s'allume » (mot accent : « s'allume »), tenu jusqu'à 3.6 s.
                          → le faisceau accélère vers la droite : whip.
  2  4.0–11.0  (120–330)  Concert : foule dans la lumière dorée. 4.6 s : billet sur téléphone
                          (nom d'événement illustratif, QR). 6.4 s : ligne de scan → la carte devient
                          le verdict vert « Billet valide » + compteur d'entrées qui monte.
                          → l'aplat vert grandit jusqu'à remplir le cadre (objet → monde).
  3  11.0–18.0 (330–540)  Restaurant : salle chaleureuse. 11.6 s : commande « Table 04 » (3 lignes,
                          total). 13.6 s : la carte se replie en bon cuisine « Nouvelle commande ».
                          15.6 s : pastille « Payé · Airtel Money ». → poussée vers la porte : coupe
                          sur le mouvement.
  4  18.0–25.0 (540–750)  Logement : clé dans la serrure (punch-in), iris depuis la clé vers le
                          salon du soir. 20.4 s : notification hôte « Réservation confirmée —
                          3 nuits — Acompte 30 % reçu ». → la caméra recule et monte.
  5  25.0–30.0 (750–900)  Ville de nuit dorée, recul 1.12 → 1.0. 25.6 s : trois points d'or
                          s'allument. 26.8 s : fond vert GiyaX monte (colour flood), logo blanc
                          posé au centre (25 % de la largeur), signature « La digitalisation qui
                          éclaire » mot à mot. Tenu 27.8 → 30.0.
BANNED:  fond noir vide ; lueurs, particules, orbes, lens flares (le faisceau du logo est le seul
         élément lumineux, tel que le logo le dessine) ; dégradés violets/bleus ; cartes en verre ;
         trois cartes côte à côte ; tout qui glisse vers le haut en fondu ; titres qui bougent une
         fois posés ; logo dans un coin ; maquette d'URL de navigateur ; interface inventée.
QA:      frames 15, 100, 200, 300, 380, 470, 600, 690, 800, 880 : texte lisible dans la bande
         centrale, une seule action par plan, aucune carte coupée par le recadrage vertical.
