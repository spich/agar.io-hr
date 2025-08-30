# Agar.io HR - React Client

Ova je početna točka za buduću React migraciju postojećeg Agar.io klijenta. 

## Opis

React klijent skeleton sadrži osnovne komponente koje odgovaraju postojećoj funkcionalnosti:

- **Menu** - Početni meni za unos imena i pokretanje igre
- **Game** - Glavna igra s placeholder canvasom
- **Leaderboard** - Ljestvica najboljih igrača
- **Chat** - Chat sustav za komunikaciju između igrača

## Tehnologije

- **React 18** - UI framework
- **Vite** - Build alat (brži od Webpack-a)
- **Vanilla CSS** - Stiliziranje (zadržava stil originalnog klijenta)

## Pokretanje

### Instaliranje ovisnosti
```bash
cd react-client
npm install
```

### Pokretanje u development modu
```bash
npm run dev
```

Aplikacija će se pokrenuti na http://localhost:3000

### Buildanje za produkciju
```bash
npm run build
```

### Preview produkcijske verzije
```bash
npm run preview
```

## Struktura

```
react-client/
├── public/             # Statične datoteke
├── src/
│   ├── components/     # React komponente
│   │   ├── Menu.jsx    # Početni meni
│   │   ├── Game.jsx    # Glavna igra
│   │   ├── Leaderboard.jsx # Ljestvica
│   │   └── Chat.jsx    # Chat
│   ├── App.jsx         # Glavna aplikacija
│   ├── main.jsx        # Entry point
│   └── index.css       # Globalni stilovi
├── index.html          # HTML template
├── vite.config.js      # Vite konfiguracija
└── package.json        # Ovisnosti i skriptovi
```

## Sljedeći koraci

1. **WebSocket integracija** - Povezivanje s postojećim serverom
2. **Migracija game logike** - Prebacivanje postojeće JavaScript logike
3. **State management** - Dodavanje Redux/Zustand za kompleksniji state
4. **TypeScript** - Dodavanje tipova za bolju maintainability
5. **Testing** - Unit i integration testovi
6. **Performance optimizacija** - Canvas optimizacija za smooth gameplay

## Napomene

- Ovo je samo skeleton - ne sadrži realnu game logiku
- Placeholder komponente simuliraju osnovnu funkcionalnost
- Canvas u Game komponenti prikazuje samo grid i placeholder ćeliju
- Chat i Leaderboard imaju fake podatke za demonstration
- Zadržan je vizualni stil originalnog klijenta