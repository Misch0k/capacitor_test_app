const { Capacitor } = window;
const { Toast } = Capacitor.Plugins;
const { Network } = Capacitor.Plugins;
const { Geolocation } = Capacitor.Plugins;
const { Browser } = Capacitor.Plugins;
const { Camera } = Capacitor.Plugins;

const CameraResultType = {
    Uri: 'uri',
    Base64: 'base64',
    DataUrl: 'dataUrl'
};

const CameraSource = {
    Prompt: 'PROMPT',
    Camera: 'CAMERA',
    Photos: 'PHOTOS'
};

class CapacitorTestApp {
    constructor() {
        this.init();
    }

    async init() {
        await this.showSplashScreen();

        this.displayPlatformInfo();
        this.setupNetworkListener();
        await this.checkNetworkStatus();

        setTimeout(() => {
            this.hideSplashScreen();
        }, 2000);
    }

    displayPlatformInfo() {
        const platformInfo = document.getElementById('platform-info');
        
        if(typeof Capacitor !== 'undefined') {
            platformInfo.innerHTML = `
                <strong>Платформа:</strong> ${Capacitor.getPlatform()}<br>
            `;
        } else {
            platformInfo.innerHTML = '<strong>Capacitor не загружен</strong> (запущено в браузере)';
        }
    }

    async checkNetworkStatus() {
        const networkStatus = document.getElementById('network-status');
        
        if(typeof Network !== 'undefined') {
            try {
                const status = await Network.getStatus();
                networkStatus.innerHTML = `
                    <strong>Сеть:</strong> ${status.connected ? '✅ Подключено' : '❌ Отключено'}<br>
                    <strong>Тип:</strong> ${status.connectionType}
                `;
            } catch (error) {
                networkStatus.innerHTML = '<strong>Сеть:</strong> ❌ Ошибка проверки';
            }
        } else {
            networkStatus.innerHTML = '<strong>Сеть:</strong> Network API недоступно';
        }
    }

    setupNetworkListener() {
        if(typeof Network !== 'undefined') {
            Network.addListener('networkStatusChange', (status) => {
                // this.addResult(`Сеть изменилась: ${status.connected ? 'Подключено' : 'Отключено'}`);
                this.checkNetworkStatus();
            });
        }
    }

    addResult(message, error_flag=false) {
        const results = document.getElementById('results');
        const resultItem = document.createElement('div');
        resultItem.style.cssText = `
            padding: 10px;
            margin: 8px 0;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        `;
        if (error_flag) {
            resultItem.style.borderLeft = '4px solid #ff0000';
        } else {
            resultItem.style.borderLeft = '4px solid #2200ff';
        }
        resultItem.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        results.appendChild(resultItem);

        resultItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ================== SPLASH SCREEN ================== //

    async showSplashScreen() {
        if (typeof Capacitor !== 'undefined' && Capacitor.isPluginAvailable('SplashScreen')) {
            try {
                await Capacitor.Plugins.SplashScreen.show({
                    autoHide: true,
                    fadeInDuration: 300,
                    fadeOutDuration: 300
                });
                this.addResult('Нативный splash screen показан');
            } catch (error) {
                this.addResult('❌ Ошибка нативного splash screen: ' + error.message, error_flag=true);
            }
        } else {
            this.addResult('SplashScreen API недоступно', error_flag=true);
        }
    }

    // ================== НАТИВНОЕ МЕНЮ ================== //

    async showNativeMenu() {
        if (typeof Capacitor !== 'undefined' && Capacitor.isPluginAvailable('ActionSheet')) {
            try {
                const result = await Capacitor.Plugins.ActionSheet.showActions({
                    title: 'Выберите действие',
                    message: 'Доступные опции',
                    options: [
                        { title: '📸 Сделать фото', style: 'default' },
                        { title: '📍 Геолокация', style: 'default' },
                        { title: '🌐 Проверить сеть', style: 'default' },
                        { title: '❌ Отмена', style: 'cancel' }
                    ]
                });

                this.handleMenuSelection(result.index);

            } catch (error) {
                this.addResult('❌ Ошибка меню: ' + error.message, error_flag=true);
            }
        } else {
            this.addResult('ActionSheet API недоступно', error_flag=true);
        }
    }

    handleMenuSelection(selectedIndex) {
        const actions = [
            () => takePicture(),
            () => getGeolocation(),
            () => getNetworkStatus(),
            () => this.addResult('🚫 Действие отменено')
        ];

        if (actions[selectedIndex]) {
            actions[selectedIndex].call(this);
        }
    }

    // ================== НАТИВНЫЕ УВЕДОМЛЕНИЯ ================== //

    async showNativeNotification(title, message) {
        if (typeof Capacitor !== 'undefined' && Capacitor.isPluginAvailable('LocalNotifications')) {
            try {
                await Capacitor.Plugins.LocalNotifications.schedule({
                    notifications: [
                        {
                            title: title,
                            body: message,
                            id: Math.floor(Math.random() * 10000) + 1,
                            schedule: { at: new Date(Date.now() + 1000) },
                            sound: 'default',
                            channelId: 'default_channel', // Важно для Android!
                        }
                    ]
                });
                this.addResult('Нативное уведомление показано');
            } catch (error) {
                this.addResult('❌ Ошибка уведомления: ' + error.message, error_flag=true);
            }
        } else {
            this.addResult('LocalNotifications API недоступно', error_flag=true);
        }
    }

    // ================== НАТИВНЫЙ SHARE ================== //

    async shareContent(text, url) {
        if (typeof Capacitor !== 'undefined' && Capacitor.isPluginAvailable('Share')) {
            try {
                await Capacitor.Plugins.Share.share({
                    title: 'Поделиться из приложения',
                    text: text,
                    url: url,
                    dialogTitle: 'Поделиться с'
                });
                this.addResult('Нативный share выполнен');
            } catch (error) {
                if (error.message == 'Share canceled') {
                    app.addResult('🚫 Действие отменено');
                } else {
                    this.addResult('❌ Ошибка share: ' + error.message, error_flag=true);
                }
            }
        } else {
            this.addResult('Share API недоступно', error_flag=true);
        }
    }

    // ================== DEEP LINKS ================== //

    handleDeepLink(url) {
        this.addResult(`📨 Получено: ${url}`);

        const cleanUrl = url.replace('myapp://', '');
        const [path, query] = cleanUrl.split('?');
        const params = {};
        
        if (query) {
            query.split('&').forEach(pair => {
                const [key, value] = pair.split('=');
                params[key] = value ? decodeURIComponent(value) : '';
            });
        }

        switch (path) {
            case 'home':
                this.handleHome(params);
                break;
                
            case 'product':
                this.handleProduct(params);
                break;
                
            case 'profile':
                this.handleProfile(params);
                break;
                
            case 'settings':
                this.handleSettings(params);
                break;
                
            default:
                this.handleUnknown(path, params);
        }
    }

    handleHome(params) {
        this.addResult('🏠 Открыта Главная страница');
        if (params.section) {
            this.addResult(`📂 Раздел: ${params.section}`);
        }
    }

    handleProduct(params) {
        if (params.id) {
            this.addResult(`📦 Открыт Товар #${params.id}`);
            if (params.name) {
                this.addResult(`📛 Название: ${params.name}`);
            }
        } else {
            this.addResult('❌ ID товара не указан', error_flag=true);
        }
    }

    handleProfile(params) {
        const userId = params.id || 'текущий';
        this.addResult(`👤 Открыт Профиль пользователя: ${userId}`);
        if (params.tab) {
            this.addResult(`📑 Вкладка: ${params.tab}`);
        }
    }

    handleSettings(params) {
        this.addResult('⚙️ Открыты Настройки');
        if (params.theme) {
            this.addResult(`🎨 Тема: ${params.theme}`);
        }
        if (params.lang) {
            this.addResult(`🌐 Язык: ${params.lang}`);
        }
    }

    handleUnknown(path, params) {
        this.addResult(`❓ Неизвестный путь: ${path}`);
        this.addResult(`🔍 Параметры: ${JSON.stringify(params)}`);
    }
}

async function showToast() {
    if(typeof Toast !== 'undefined') {
        await Toast.show({
            text: 'Hello! 🎉',
            duration: 'long'
        });
        app.addResult('Toast показан');
    } else {
        app.addResult('Toast API недоступно', error_flag=true);
    }
}

async function getNetworkStatus() {
    await app.checkNetworkStatus();
    app.addResult('Проверка сети выполнена');
}

async function getGeolocation() {
    if(typeof Geolocation !== 'undefined') {
        try {
            const position = await Geolocation.getCurrentPosition();
            app.addResult(`Геолокация: ${position.coords.latitude}, ${position.coords.longitude}`);
        } catch (error) {
            app.addResult('Ошибка геолокации: ' + error.message, error_flag=true);
        }
    } else {
        app.addResult('Geolocation API недоступно', error_flag=true);
    }
}

async function openBrowser() {
    if(typeof Browser !== 'undefined') {
        await Browser.open({ url: 'https://google.com' });
        app.addResult('Браузер открыт');
    } else {
        app.addResult('Browser API недоступно', error_flag=true);
    }
}

async function takePicture() {
    if(typeof Camera !== 'undefined') {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.Uri
            });
            app.addResult('Фото сделано: ' + image.webPath);
        } catch (error) {
            if (error.message == 'User cancelled photos app') {
                app.addResult('🚫 Действие отменено');
            } else {
                app.addResult('❌ Ошибка камеры: ' + error.message);
            }
        }
    } else {
        app.addResult('Camera API недоступно', error_flag=true);
    }
}

async function openInWebView() {
    const url = 'https://google.com';
    
    const options = {
        location: 'yes',
        hidden: 'no',
        toolbar: 'yes',
        zoom: 'yes',
        clearcache: 'no',
        clearsessioncache: 'no',
        closebuttoncaption: 'Закрыть',
        disallowoverscroll: 'no',
        enableViewportScale: 'no',
        presentationstyle: 'pagesheet'
    };

    if (typeof window !== 'undefined' && window.cordova && window.cordova.InAppBrowser) {
        try {
            const optionsString = Object.entries(options)
                .map(([key, value]) => `${key}=${value}`)
                .join(',');
            
            const browserRef = window.cordova.InAppBrowser.open(url, '_blank', optionsString);
            
            browserRef.addEventListener('loadstart', (event) => {
                console.log('WebView loadstart:', event.url);
                app.addResult(`↗️ Загрузка: ${event.url}`);
            });
            
            browserRef.addEventListener('loadstop', (event) => {
                console.log('WebView loadstop:', event.url);
                app.addResult(`✅ Загружено: ${event.url}`);
                
                browserRef.executeScript({
                    code: `
                        document.body.style.backgroundColor = '#f0f8ff';
                        console.log('JavaScript injected from Capacitor app');
                    `
                });
            });
            
            browserRef.addEventListener('loaderror', (event) => {
                console.error('WebView error:', event.message);
                app.addResult(`❌ Ошибка загрузки: ${event.message}`, error_flag=true);
            });
            
            browserRef.addEventListener('exit', () => {
                app.addResult('🔙 WebView закрыт пользователем');
            });
            
        } catch (error) {
            console.error('InAppBrowser error:', error);
        }
    } else {
        app.addResult('InAppBrowser API недоступно', error_flag=true);
    }
}

async function openNativeWebView() {
    if (typeof Capacitor !== 'undefined' && Capacitor.Plugins.WebView) {
        try {
            await Capacitor.Plugins.WebView.open({
                url: 'https://google.com',
                headers: {
                    'X-Custom-Header': 'Value'
                },
                toolbarColor: '#667eea',
                showTitle: true
            });
            app.addResult('Открыто в нативном WebView');
        } catch (error) {
            app.addResult('Ошибка нативного WebView: ' + error.message, error_flag=true);
        }
    } else {
        app.addResult('WebView API недоступно', error_flag=true);
    }
}

function clearResults() {
    const output = document.getElementById('results');
    output.innerHTML = '';
    app.addDeepLinkResult('Результаты очищены');
}

function openNativeMenu() {
    app.showNativeMenu();
}

function shareTest() {
    app.shareContent('Посмотрите это тестовое приложение!', 'https://example.com');
}

function showNotification() {
    app.showNativeNotification('Тест', 'Это нативное уведомление!');
}

async function showDeepLinkMenu() {
    if (typeof Capacitor !== 'undefined' && Capacitor.isPluginAvailable('ActionSheet')) {
        showNativeDeepLinkMenu();
    } else {
        app.addResult('Ошибка нативного меню Deep Links: ' + error.message, error_flag=true);
    }
}

async function showNativeDeepLinkMenu() {
    try {
        const result = await Capacitor.Plugins.ActionSheet.showActions({
            title: 'Выберите Deep Link для теста',
            message: 'Какую ссылку хотите протестировать?',
            options: [
                { title: '🏠 Главная страница', style: 'default' },
                { title: '📦 Товар', style: 'default' },
                { title: '👤 Профиль пользователя', style: 'default' },
                { title: '⚙️ Настройки', style: 'default' },
                { title: '❓ Неизвестный путь', style: 'default' },
                { title: '❌ Отмена', style: 'cancel' }
            ]
        });

        handleMenuSelection(result.index);
        
    } catch (error) {
        console.error('Ошибка нативного меню:', error);
        app.addResult('Ошибка нативного меню Deep Links: ' + error.message, error_flag=true);
    }
}

function handleMenuSelection(selectedIndex) {
    const actions = [
        () => testDeepLink('myapp://home'),
        () => testDeepLink('myapp://product?id=100&name=iPhone15'),
        () => testDeepLink('myapp://profile?id=456&username=user'),
        () => testDeepLink('myapp://settings?theme=dark&lang=ru'),
        () => testDeepLink('myapp://unknown/path?param=test'),
        () => app.addResult('🚫 Действие отменено')
    ];

    if (actions[selectedIndex]) {
        actions[selectedIndex]();
    }
}

function testDeepLink(url) {
    if (app && app.handleDeepLink) {
        app.handleDeepLink(url);
    } else {
        alert('Приложение еще не загружено');
    }
}

// Инициализация при загрузке
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CapacitorTestApp();
});