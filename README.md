# PokéTeam — Front

Application Angular 19 (NgModule) + Bootstrap 5, reprise du front du monolithe Pocket'APP.
Toutes les requêtes passent par la gateway (`src/app/api.config.ts`, `http://localhost:3000`).

Écrans : comptes, création d'équipe (Pokémon capturés uniquement, analyse en direct), liste des
équipes, Versus animé, Boss de la semaine, mode Capture, Pokédex du dresseur.

## Lancer

Le backend doit tourner (dépôt [`poketeam`](https://github.com/poketeam-luco7/poketeam), `docker compose up -d`).

```bash
npm install
npx ng serve                 # http://localhost:4200
```

## Build

```bash
npx ng build
```

## Fait partie de PokéTeam

Ce dépôt est un des composants de l'organisation [poketeam-luco7](https://github.com/poketeam-luco7).
Pour lancer l'application complète (gateway, 3 services, 2 bases), voir le dépôt
d'orchestration [`poketeam`](https://github.com/poketeam-luco7/poketeam) : `docker-compose.yml`,
architecture (C4) et décisions d'architecture (ADR).
