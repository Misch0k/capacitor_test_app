# Capacitor Test App

Тестовое приложение на [Capacitor](https://capacitorjs.com/), демонстрирующее работу стандартных плагинов (Toast, Network, Geolocation, Browser, Camera и др.).

---

## Требования

Перед началом убедитесь, что у вас установлено:

* [Node.js](https://nodejs.org/) (рекомендуется LTS, 18+)
* [npm](https://www.npmjs.com/)
* [Capacitor CLI](https://capacitorjs.com/docs/getting-started/environment-setup)
* [Android Studio](https://developer.android.com/studio) (для Android)
* [Xcode](https://developer.apple.com/xcode/) (для iOS — только macOS)

---

## Быстрая установка

```bash
git clone https://github.com/Misch0k/capacitor_test_app.git
cd capacitor_test_app
npm install
```

---

## Сборка веб-части

Capacitor использует статические файлы из папки `dist`. Подготовьте их командой:

```bash
npm run build
```

Затем синхронизируйте веб-часть с нативными платформами:

```bash
npx cap sync
```

---

## Установка платформ (если ещё не добавлены)

```bash
npx cap add android
npx cap add ios
```

---

## Запуск на Android

1. Откройте проект в Android Studio:

   ```bash
   npx cap open android
   ```
2. Соберите и запустите приложение на эмуляторе или физическом устройстве.

---

## Запуск на iOS

1. Откройте проект в Xcode:

   ```bash
   npx cap open ios
   ```
2. В Xcode выберите целевой симулятор или подключённое устройство.
3. Нажмите **Run** (или `⌘R`) для сборки и запуска.

---

## Настройка разрешений

Поскольку `Info.plist` (iOS) и `AndroidManifest.xml` (Android) создаются локально при добавлении платформ, для настройки разрешений в директории проекта выполните следующие команды:

```bash
cp native-config/Info.plist ios/App/App/Info.plist
cp native-config/AndroidManifest.xml android/app/src/main/AndroidManifest.xml
```

---

## Полезные команды

* Сборка веба:

  ```bash
  npm run build
  ```
* Синхронизация с платформами:

  ```bash
  npx cap sync
  ```
* Добавить платформу:

  ```bash
  npx cap add ios
  npx cap add android
  ```
* Открыть Android Studio:

  ```bash
  npx cap open android
  ```
* Открыть Xcode:

  ```bash
  npx cap open ios
  ```