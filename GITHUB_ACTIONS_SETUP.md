# GitHub Actions Deployment Setup

## Налаштування секретів у GitHub

Для роботи автоматичного deployment потрібно додати наступні секрети в GitHub repository:

### 1. Перейдіть до Settings → Secrets and variables → Actions

### 2. Додайте наступні секрети:

#### Firebase Environment Variables:

- `REACT_APP_FIREBASE_API_KEY` - з вашого .env файлу
- `REACT_APP_FIREBASE_AUTH_DOMAIN` - з вашого .env файлу
- `REACT_APP_FIREBASE_PROJECT_ID` - з вашого .env файлу
- `REACT_APP_FIREBASE_STORAGE_BUCKET` - з вашого .env файлу
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` - з вашого .env файлу
- `REACT_APP_FIREBASE_APP_ID` - з вашого .env файлу

#### Firebase Deployment:

- `FIREBASE_PROJECT_ID` - ID вашого Firebase проекту (наприклад, accounting-a2ac6)
- `FIREBASE_SERVICE_ACCOUNT` - Service Account JSON для Firebase

### 3. Отримання Firebase Service Account:

```bash
# 1. Увійдіть в Firebase Console
# 2. Project Settings → Service Accounts
# 3. Натисніть "Generate new private key"
# 4. Скопіюйте весь JSON і додайте як FIREBASE_SERVICE_ACCOUNT секрет
```

### 4. Альтернатива - використання Firebase Token:

Якщо не хочете використовувати Service Account, можете згенерувати token:

```bash
firebase login:ci
```

Скопіюйте згенерований token і додайте як `FIREBASE_TOKEN` секрет, потім оновіть workflow:

```yaml
- name: Deploy to Firebase Hosting
  run: |
    npm install -g firebase-tools
    firebase deploy --token "${{ secrets.FIREBASE_TOKEN }}" --only hosting
```

## Як працює workflow:

1. **Тригер**: Спрацьовує при push в main/master або вручну
2. **Build**:
   - Встановлює Node.js 18
   - Встановлює залежності
   - Створює .env з секретів
   - Білдить React застосунок
3. **Deploy**: Деплоїть на Firebase Hosting

## Перевірка:

Після налаштування секретів:

1. Зробіть commit і push в main
2. Перевірте вкладку Actions в GitHub repository
3. Workflow автоматично запуститься і задеплоїть застосунок

## Ручний запуск:

Actions → Build and Deploy to Firebase → Run workflow
