# Sol Mail

[![English](https://img.shields.io/badge/lang-English-blue)](README.md)
[![Polski](https://img.shields.io/badge/lang-Polski-red)](#)

Sol-Mail to samodzielnie hostowany portal do przesyłania plików i wiadomości. Zapewnia prosty i bezpieczny sposób, w jaki użytkownicy mogą wysyłać pliki i wiadomości do centralnego administratora, co czyni go idealnym rozwiązaniem w sytuacjach takich jak zbieranie zadań, otrzymywanie plików projektowych czy inne przypadki, w których wymagane jest bezpieczne przesyłanie danych w jedną stronę.

## Główne funkcje

- **Samodzielne hostowanie**: Twoje dane, Twój serwer. Pełna kontrola nad informacjami.
- **Prosty interfejs przesyłania**: Czysty i intuicyjny interfejs użytkownika do przesyłania plików i wiadomości.
- **Centralne odbieranie**: Wszystkie przesłane dane trafiają do jednego konta administratora, co ułatwia zarządzanie.
- **Bezpieczeństwo**: Wykorzystuje nowoczesne, oparte na tokenach uwierzytelnianie dostępu użytkowników.
- **Lekkość**: Zbudowane z wykorzystaniem Bun, co zapewnia wysoką wydajność i minimalne zużycie zasobów.

## Klient

- [Klient Sol Mail](https://github.com/wxn0brP/sol-mail-client)
- [Zrzuty ekranu](https://github.com/wxn0brP/sol-mail-client/blob/master/screenshots.md)

## 🚀 Pierwsze kroki

Wykonaj poniższe kroki, aby uruchomić własną instancję Sol-Mail w kilka minut.

### Wymagania wstępne

- Musisz mieć zainstalowanego **[Bun](https://bun.sh/docs/installation)** w swoim systemie.

### 1. Sklonuj repozytorium

Najpierw pobierz kod źródłowy na swój komputer.

```bash
git clone https://github.com/wxn0brP/sol-mail.git
cd sol-mail
```

### 2. Skonfiguruj zmienne środowiskowe

Skopiuj przykładowy plik zmiennych środowiskowych. Plik ten może zawierać domyślne ustawienia lub zastępcze wartości wymaganych zmiennych.

```bash
cp .env.example .env
```

### 3. Uruchom zautomatyzowaną konfigurację

Przygotowaliśmy jedno polecenie, które obsługuje wszystkie niezbędne kroki konfiguracyjne — od instalacji zależności po zbudowanie frontendu.

```bash
bun run setup
```

To polecenie wykonuje za Ciebie następujące czynności:
- Instaluje wymagane zależności backendu.
- Instaluje wymagane zależności frontendu.
- Buduje aplikację frontendową i umieszcza ją w odpowiednim katalogu, z którego będzie serwowana.

### 4. Uruchom serwer

Teraz możesz uruchomić serwer aplikacji.

```bash
bun start
```

Spowoduje to uruchomienie serwera backendowego, który obsługuje API oraz serwuje interfejs webowy. Domyślnie aplikacja powinna być dostępna pod adresem `http://localhost:19851`.

### 5. Utwórz pierwszego użytkownika

Aby się zalogować, musisz najpierw utworzyć konto użytkownika.

```bash
bun run script:add_user
```

### 6. Dodaj użytkownika administratora

```bash
bun run script:add_admin
```

## Importowanie E-maili

Możesz importować e-maile z lokalnego katalogu za pomocą dostarczonego skryptu. Jest to przydatne do migrowania istniejących e-maili lub dodawania ich hurtowo.

### 1. Przygotuj katalog do importu

Utwórz katalog o nazwie `import` w katalogu głównym projektu. Wewnątrz tego katalogu utwórz podkatalog dla każdego e-maila, który chcesz zaimportować. Nazwa podkatalogu zostanie użyta jako nazwa e-maila. Wszystkie pliki dla danego e-maila umieść w jego podkatalogu.

Na przykład:
```
./import/
├───moj-pierwszy-email/
│   ├───załącznik1.txt
│   └───obrazek.jpg
└───inny-email/
    └───dokument.pdf
```

### 2. Uruchom skrypt importujący

Wykonaj następujące polecenie, aby rozpocząć proces importowania:

```bash
bun run script:import_mails
```

Skrypt:
- Zsanityzuje nazwy e-maili (nazwy podkatalogów) i nazwy plików.
- Skopiuje pliki do odpowiedniego katalogu danych.
- Utworzy wpis w bazie danych dla każdego e-maila, przypisując go do użytkownika `public`.

## Dla programistów

### Stos technologiczny

- **Backend**: TypeScript, Bun, `@wxn0brp/falcon-frame` (framework webowy), `@wxn0brp/db` (baza danych), `jose` (JWT)
- **Frontend**: TypeScript, SCSS, esbuild, `@wxn0brp/flanker-ui` (komponenty UI)

### Dokumentacja

[Dokumentacja](./docs/base.md)

### Współtworzenie

Zapraszamy do współtworzenia projektu.

### Licencja

Projekt jest udostępniany na licencji [MIT](LICENSE).