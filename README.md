# Meteo Comparator

Meteo Comparator to aplikacja do porównywania prognoz pogody z publicznych API. Użytkownik wybiera lokalizację, aplikacja pobiera prognozy z kilku źródeł, normalizuje dane do wspólnego formatu i pokazuje zarówno wartości z poszczególnych dostawców, jak i uśrednioną prognozę.

## Perspektywa biznesowa

### Problem

Prognozy pogody z różnych serwisów potrafią się zauważalnie różnić, szczególnie dla opadów, temperatur minimalnych i wiatru. Osoba planująca podróż, wydarzenie outdoorowe, pracę terenową albo logistykę często musi ręcznie sprawdzać kilka stron i samodzielnie wyciągać wnioski.

### Rozwiązanie

Aplikacja agreguje prognozy z kilku publicznych źródeł i prezentuje:

- zbiorczą prognozę dzienną dla wybranej lokalizacji,
- średnią z dostępnych źródeł,
- tabelę różnic pomiędzy dostawcami,
- szybkie metryki na dziś: temperatura maksymalna, temperatura minimalna, opad i wiatr.

### Wartość

- krótszy czas porównywania prognoz,
- większa odporność na odchylenia pojedynczego modelu pogodowego,
- przejrzyste dane dla osób nietechnicznych,
- prosta baza pod alerty, rekomendacje i kolejne źródła API.

### Obecne źródła danych

- Open-Meteo: geokodowanie i dzienna prognoza pogody,
- MET Norway: godzinowa prognoza normalizowana do danych dziennych.

## Perspektywa techniczna

### Architektura

Projekt jest podzielony na dwie warstwy:

- `src/` - frontend React + TypeScript uruchamiany przez Vite,
- `server/` - lekki backend Node.js + TypeScript, który ukrywa integracje z API i normalizuje dane.

Najważniejsze moduły:

- `server/weather/geocoding.ts` - wyszukiwanie lokalizacji,
- `server/weather/providers.ts` - integracje i normalizacja dostawców pogody,
- `server/weather/aggregation.ts` - liczenie średnich prognoz,
- `server/weather/service.ts` - orkiestracja źródeł i obsługa częściowych awarii,
- `server/weather/types.ts` - kontrakty danych pogodowych po stronie backendu,
- `src/services/weatherApi.ts` - klient API dla frontendu,
- `src/types/weather.ts` - kontrakty danych używane przez UI,
- `src/components/` - komponenty React UI,
- `src/utils/` - formatowanie i rysowanie wykresu.

### Wymagania

- Node.js 18 lub nowszy,
- npm.

### Instalacja

```bash
npm install
```

### Uruchomienie lokalne

W jednym terminalu uruchom API:

```bash
npm run dev:api
```

W drugim terminalu uruchom frontend:

```bash
npm run dev
```

Frontend działa domyślnie pod adresem `http://localhost:5173`, a zapytania `/api` są proxy do `http://localhost:3000`.

### Build produkcyjny

```bash
npm run build
npm start
```

Po buildzie frontend trafia do `dist`, a backend TypeScript jest kompilowany do `dist-server`. Komenda `npm start` uruchamia skompilowany serwer.

## Jakość

### Testy

```bash
npm test
```

Testy są uruchamiane przez Vitest z coverage. Minimalne wymagane pokrycie to 90% dla linii, instrukcji, funkcji i gałęzi.

### Linter

```bash
npm run lint
```

### Typecheck

```bash
npm run typecheck
```

Komenda sprawdza typy frontendu oraz backendu.

### Formatowanie

```bash
npm run format
npm run format:check
```

### Pre-commit

Projekt używa Husky i lint-staged. Przed commitem uruchamiane są:

- Prettier dla plików `js`, `jsx`, `json`, `css`, `md`, `yml`, `yaml`,
- ESLint z autofixem dla plików `js` i `jsx`.

Hook jest instalowany przez skrypt:

```bash
npm run prepare
```

## CI/CD

Pipeline GitHub Actions jest w `.github/workflows/pr-checks.yml`. Przy każdym pull requeście do `main` lub `master` wykonywane są:

- instalacja zależności przez `npm ci`,
- sprawdzenie formatowania,
- linter,
- typecheck TypeScript,
- build aplikacji,
- testy z minimalnym coverage 90%.

## Rozszerzanie źródeł pogody

Nowego dostawcę najlepiej dodać jako funkcję w `server/weather/providers.ts`, która zwraca dane zgodne z typem `WeatherSource`:

```js
{
  id: "provider-id",
  name: "Provider name",
  updatedAt: "2026-05-11T10:00:00Z",
  days: [
    {
      date: "2026-05-11",
      temperatureMax: 20.1,
      temperatureMin: 10.2,
      precipitation: 1.4,
      windMax: 18.6
    }
  ]
}
```

Następnie trzeba dopiąć funkcję w `server/weather/service.ts`. Agregacja zadziała automatycznie, o ile pola dzienne pozostaną zgodne z tym kontraktem.
