# Tests du jeu

Démarrer le serveur à la racine du projet :

```bash
python3 -m http.server 8000
```

Les tests utilisent Playwright et un Chrome local. Installer Playwright dans un dossier temporaire pour conserver le jeu sans dépendances :

```bash
npm install --prefix /tmp/freelway-browser-test playwright
NODE_PATH=/tmp/freelway-browser-test/node_modules node tests/browser.cjs
NODE_PATH=/tmp/freelway-browser-test/node_modules node tests/edge-cases.cjs
NODE_PATH=/tmp/freelway-browser-test/node_modules node tests/collisions.cjs
```

`browser.cjs` valide les 15 exercices par leurs contrôles HTML, les erreurs et nouvelles tentatives, les commandes clavier et tactiles, la pause, la sauvegarde, la victoire, le rechargement hors ligne et la remise à zéro. Le joueur est positionné devant chaque personnage par le test pour éviter de longues marches ; les déplacements sont vérifiés séparément. Le mobile est simulé dans Chrome (390 × 844, densité 3).

`edge-cases.cjs` vérifie les sauvegardes anciennes ou corrompues, l’annulation d’un exercice, l’annulation d’une nouvelle partie et la vitesse de déplacement.

Les captures de contrôle sont écrites dans `/tmp/freelway-browser-test`.

`collisions.cjs` vérifie les collisions avec l’eau, les arbres, les maisons et les panneaux, le glissement le long des murs, les déplacements rapides, les ponts et l’accessibilité des 15 points d’arrivée par propagation sur la carte avec l’empreinte réelle du joueur.
