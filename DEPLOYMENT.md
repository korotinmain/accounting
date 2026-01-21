# Production Deployment Checklist

## ✅ Перед деплоєм

### Код

- [x] Використовуються environment variables (.env)
- [x] Додано ErrorBoundary
- [x] Валідація всіх user inputs
- [x] Санітизація даних перед збереженням
- [x] Обробка всіх помилок (try/catch)
- [x] Оптимізація (useCallback, useMemo)
- [x] ARIA labels для доступності
- [x] Loading states

### Firebase

- [ ] Firestore Database створено
- [ ] Security rules налаштовано
- [ ] Indexes створено (якщо потрібно)
- [ ] Firebase Hosting налаштовано
- [ ] Environment variables додано в hosting

### Безпека

- [x] .env додано в .gitignore
- [x] API keys в environment variables
- [ ] Firestore rules для production
- [ ] HTTPS увімкнено (автоматично в Firebase)

### Тестування

- [ ] Локальне тестування (npm start)
- [ ] Build успішний (npm run build)
- [ ] Тестування на різних браузерах
- [ ] Мобільна версія працює
- [ ] Тестування помилок (невірні дані, проблеми з мережею)

## 🚀 Deployment Steps

1. **Оновити environment variables**

   ```bash
   # Переконайтесь що .env містить правильні дані
   ```

2. **Build**

   ```bash
   npm run build
   ```

3. **Deploy Firestore Rules**

   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Deploy Hosting**

   ```bash
   firebase deploy --only hosting
   ```

5. **Або все одразу**
   ```bash
   firebase deploy
   ```

## 📝 Post-Deployment

- [ ] Перевірити live URL
- [ ] Протестувати всі функції на production
- [ ] Перевірити консоль на помилки
- [ ] Перевірити Firebase Console (usage, errors)
- [ ] Налаштувати моніторинг (опціонально)

## 🔧 Firebase Security Rules (Production)

Оновіть `firestore.rules` для production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Для додавання authentication:
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Або якщо потрібен публічний доступ (обережно!):
    // match /{document=**} {
    //   allow read: if true;
    //   allow write: if true;
    // }
  }
}
```

## 🎯 Performance Checklist

- [x] React components оптимізовано
- [x] Firestore queries ефективні
- [x] Images оптимізовано (якщо є)
- [x] Lazy loading (можна додати code splitting)
- [ ] Аналіз bundle size
- [ ] Lighthouse audit > 90

## 📊 Monitoring

Розгляньте додавання:

- Google Analytics
- Firebase Analytics
- Error tracking (Sentry)
- Performance monitoring

## 🐛 Common Issues

### Build fails

- Перевірте node_modules
- Запустіть `npm install` знову
- Перевірте версії пакетів

### Firebase deploy fails

- `firebase login` знову
- Перевірте права доступу до проекту
- Перевірте firebase.json конфігурацію

### App не працює на production

- Перевірте консоль браузера
- Перевірте Network tab
- Перевірте Firebase Console > Firestore rules
- Перевірте environment variables
