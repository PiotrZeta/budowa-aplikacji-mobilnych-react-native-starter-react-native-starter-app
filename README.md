# NoteSnap (React Native + Expo)

Aplikacja mobilna w **React Native (Expo)**, która pokazuje:
- **3–4 widoki**: lista notatek, szczegóły notatki, dodaj/edytuj, o aplikacji
- **Natywne funkcje**: **GPS** (expo-location) + **aparat/galeria** (expo-image-picker)
- **API**: komunikacja z publicznym endpointem (JSONPlaceholder) – **GET** (pobranie listy startowej) oraz **POST/PATCH** (symulacja zapisu)
- **Stan**: prosty store (Context + useReducer) – bez wymaganego trwałego storage
- **Dostępność**: podstawowe etykiety (accessibilityLabel) i cele dotyku ~44–48px

---

## Widoki

1. **Lista notatek** (`app/index.tsx`)
   - pobranie startowych notatek z API
   - wyszukiwarka lokalna
   - wejście w szczegóły
   - przycisk „Dodaj notatkę”

2. **Szczegóły notatki** (`app/note/[id].tsx`)
   - tytuł, data, opis
   - podgląd zdjęcia (jeśli dodane)
   - dane GPS (jeśli pobrane)
   - akcje: edytuj / usuń

3. **Dodaj/Edytuj** (`app/note/form.tsx`)
   - formularz: tytuł, opis
   - natywne akcje:
     - pobierz lokalizację GPS
     - zrób zdjęcie / wybierz z galerii
   - zapis do store + próba wysłania do API (POST/PATCH)

4. **O aplikacji** (`app/about.tsx`)
   - wersja, platforma, opis użytych funkcji

---

## API (wymóg: min. 1 endpoint)

Użyte publiczne API: **JSONPlaceholder**
- `GET /posts` – pobranie listy startowej
- `POST /posts` – symulacja zapisu nowej notatki
- `PATCH /posts/:id` – symulacja edycji notatki

Kod: `app/api/notesApi.ts`

---

## Natywna funkcja (wymóg: min. 1)

Wybrane funkcje i uzasadnienie:
- **GPS (expo-location)** – notatka może zawierać współrzędne (np. „gdzie to było?”).
- **Aparat/Galeria (expo-image-picker)** – notatka może mieć zdjęcie (np. paragon, tabliczka, miejsce).

---

## Uruchomienie lokalne

1) Instalacja zależności:
```bash
npm install
```

2) Start:
```bash
npx expo start
```

3) Testy lokalne (DoD):
- **Pobranie z API**: po starcie aplikacji lista uzupełni się notatkami.
- **Dodanie notatki**: „Dodaj notatkę” → wpisz tytuł/opis → (opcjonalnie) GPS / zdjęcie → „Zapisz”.
- **Natywna funkcja**:
  - GPS: przycisk „Pobierz GPS” (na emulatorze może nie działać)
  - Zdjęcie: „Zrób zdjęcie” lub „Wybierz z galerii”
- **Szczegóły**: kliknij notatkę na liście → zobacz opis / GPS / foto.
- **Komunikacja z API**: zapis próbuje wykonać POST/PATCH (jeśli brak internetu, notatka ma status OFFLINE).

---

## Edge cases (weryfikacja błędów)

- **Brak zgody na GPS / aparat / galerię** → aplikacja pokazuje komunikat i nie crashuje.
- **Brak internetu** → pobranie notatek może się nie udać, a zapis działa lokalnie (status **OFFLINE**).
- **Emulator** → GPS bywa niedostępny (najpewniej testować na telefonie).

---

## Minimalne commity (propozycja)

1. `feat: init NoteSnap with notes list + store`
2. `feat: add note form with GPS and photo`
3. `feat: note details + API sync + about screen`

---

## Struktura

- `app/index.tsx` – lista
- `app/note/[id].tsx` – szczegóły
- `app/note/form.tsx` – dodaj/edytuj
- `app/about.tsx` – o aplikacji
- `app/state/notesStore.tsx` – store
- `app/api/notesApi.ts` – API
- `app/components/*` – UI
