# Sol Mail

[Polski](./README.pl.md) | [English](./README.md)

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

## Dla programistów

### Stos technologiczny

- **Backend**: TypeScript, Bun, `@wxn0brp/falcon-frame` (framework webowy), `@wxn0brp/db` (baza danych), `jose` (JWT)
- **Frontend**: TypeScript, SCSS, esbuild, `@wxn0brp/flanker-ui` (komponenty UI)

### Współtworzenie

Zapraszamy do współtworzenia projektu.

### Licencja

Projekt jest udostępniany na licencji [MIT](LICENSE).