# Структура роутінгу

## Огляд

Додаток використовує **React Router v6** для навігації між сторінками з захистом маршрутів (route guards).

## Маршрути

### `/` - Головна сторінка

- **Компонент**: `MainPage`
- **Захист**: `ProtectedRoute` - потребує авторизованого лікаря
- **Функціонал**:
  - Перемикання між вкладками "Персонал" і "Операційна"
  - Відображення балансів
  - Управління фінансовими записами
  - Доступ до налаштувань

### `/doctor-selection` - Вибір лікаря

- **Компонент**: `DoctorSelectionPage`
- **Захист**: `DoctorGuard` - перенаправляє на `/` якщо лікар вже обраний
- **Функціонал**:
  - Вибір лікаря з доступного списку
  - Автоматичне збереження вибору в localStorage
  - Редирект на головну після вибору

### `/settings` - Налаштування

- **Компонент**: `SettingsPage`
- **Захист**: `ProtectedRoute` - потребує авторизованого лікаря
- **Функціонал**:
  - Встановлення початкових балансів
  - Автоматичне оновлення даних після збереження
  - Кнопка повернення на головну сторінку

### `/*` - Невідомі маршрути

- **Поведінка**: Редирект на `/`

## Route Guards

### `ProtectedRoute`

Захищає маршрути, які потребують вибору лікаря:

- Перевіряє наявність `selectedDoctor`
- Якщо лікар не обраний → перенаправляє на `/doctor-selection`
- Якщо лікар обраний → дозволяє доступ до сторінки

### `DoctorGuard`

Запобігає доступу до сторінки вибору лікаря, якщо він вже обраний:

- Перевіряє наявність `selectedDoctor`
- Якщо лікар обраний → перенаправляє на `/`
- Якщо лікар не обраний → дозволяє доступ до сторінки вибору

## Структура файлів

```
src/
├── App.js                          # Головний компонент з роутами
├── pages/
│   ├── MainPage.jsx               # Головна сторінка з фінансами
│   ├── SettingsPage.jsx           # Сторінка налаштувань
│   └── DoctorSelectionPage.jsx    # Сторінка вибору лікаря
├── routes/
│   ├── ProtectedRoute.jsx         # Guard для захищених маршрутів
│   └── DoctorGuard.jsx            # Guard для сторінки вибору лікаря
└── components/
    ├── Header.jsx                 # Хедер з навігацією
    ├── Settings.jsx               # Компонент налаштувань
    └── DoctorSelection.jsx        # Компонент вибору лікаря
```

## Навігація

### Програмна навігація

Використовуйте хук `useNavigate` з react-router-dom:

```javascript
import { useNavigate } from "react-router-dom";

function MyComponent() {
  const navigate = useNavigate();

  const goToSettings = () => {
    navigate("/settings");
  };

  const goBack = () => {
    navigate("/");
  };
}
```

### Декларативна навігація

Використовуйте компонент `Link`:

```javascript
import { Link } from "react-router-dom";

<Link to="/settings">Налаштування</Link>;
```

## Потік авторизації

1. **Початковий стан**: Лікар не обраний
   - Будь-який запит до `/` або `/settings` → редирект на `/doctor-selection`

2. **Вибір лікаря**: Користувач на `/doctor-selection`
   - Вибирає лікаря
   - Дані зберігаються в `localStorage`
   - Автоматичний редирект на `/`

3. **Авторизований стан**: Лікар обраний
   - Доступ до `/` і `/settings`
   - Спроба зайти на `/doctor-selection` → редирект на `/`

4. **Вихід**: Користувач натискає "Вийти"
   - Дані видаляються з `localStorage`
   - `selectedDoctor` стає `null`
   - Наступний запит до захищених маршрутів → редирект на `/doctor-selection`

## Збереження стану

- **localStorage**: `selectedDoctor` зберігається між сесіями
- **React State**: Управління поточним станом під час сесії
- **Автоматичне відновлення**: При перезавантаженні сторінки лікар відновлюється з localStorage

## Приклади використання

### Захист нового маршруту

```javascript
<Route
  path="/my-new-page"
  element={
    <ProtectedRoute selectedDoctor={selectedDoctor}>
      <MyNewPage />
    </ProtectedRoute>
  }
/>
```

### Додавання публічного маршруту

```javascript
<Route path="/public-page" element={<PublicPage />} />
```

### Навігація з Header

```javascript
// У компоненті Header
const navigate = useNavigate();

<button onClick={() => navigate("/settings")}>Налаштування</button>;
```
