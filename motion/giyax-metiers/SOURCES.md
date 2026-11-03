# Sources des séquences filmées

Clips Pexels (licence Pexels : usage commercial libre, sans attribution obligatoire).
Ils ne sont pas versionnés (`motion/*/assets/video/` est dans `.gitignore`) : les retélécharger
avant de prévisualiser ou de rendre le film.

| Fichier | Pexels | Sujet |
| --- | --- | --- |
| `assets/video/concert.mp4` | 12695727 | Foule qui danse pendant un concert |
| `assets/video/restaurant.mp4` | 5101342 | Repas au restaurant, plats et vin |
| `assets/video/appartement.mp4` | 10135156 | Appartement moderne, travelling |

```bash
cd motion/giyax-metiers/assets/video
curl -L -o concert.mp4     https://videos.pexels.com/video-files/12695727/12695727-hd_1920_1080_24fps.mp4
curl -L -o restaurant.mp4  https://videos.pexels.com/video-files/5101342/5101342-hd_1920_1080_25fps.mp4
curl -L -o appartement.mp4 https://videos.pexels.com/video-files/10135156/10135156-hd_1920_1080_30fps.mp4
```

Logos : Airtel (Wikimedia Commons), Moov Money (Wikimedia Commons), GiyaX (fichiers officiels
`public/logos__GiyaX`). QR code : généré avec `qrcode.react`.
