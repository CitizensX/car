// 全局变量
let client_id, client_secret, user_name, user_password;
let device_name, device_id, device_key, device_LockSignalValue, device_VoltageDataInterface, device_TemperatureDataInterface, device_HumidityDataInterface, device_LockDataInterface, device_StartDataInterface, device_WindowDataInterface, device_image;

// 获取页面元素
const lockButton = document.getElementById('lock-button');
const startButton = document.getElementById('start-button');
const trunkButton = document.getElementById('trunk-button');
const findCarButton = document.getElementById('find-car-button');
const windowButton = document.getElementById('window-button');
const voltageDisplay = document.getElementById('voltage');
const temperatureDisplay = document.getElementById('temperature');
const humidityDisplay = document.getElementById('humidity');
const offlineOverlay = document.getElementById('offline-overlay');

let lastDataTime = Date.now();
let isConnected = false;
let ws;

// 检查配置文件并读取内容
function checkConfigFiles() {
    const deviceConfigS = localStorage.getItem('DeviceConfigS');
    console.log('DeviceConfigS:', deviceConfigS);
    const deviceConfig = localStorage.getItem('DeviceConfig');
    console.log('DeviceConfig:', deviceConfig);
    const userConfig = localStorage.getItem('UserConfig');
    console.log('UserConfig:', userConfig);

    if (!deviceConfig || !userConfig) {
        window.location.href = 'config.html';
        return;
    }

    try {
        const userData = JSON.parse(userConfig);
        client_id = userData.client_id;
        client_secret = userData.client_secret;
        user_name = userData.user_name;
        user_password = userData.user_password;

        if (!client_id || !client_secret || !user_password || !user_password) {
            window.location.href = 'config.html';
            return;
        }
    } catch (error) {
        window.location.href = 'config.html';
        return;
    }

    try {
        const deviceData = JSON.parse(deviceConfig);
        device_name = deviceData.device_name;
        device_id = deviceData.device_id;
        device_key = deviceData.device_key;
        device_LockSignalValue = deviceData.device_LockSignalValue;
        device_VoltageDataInterface = deviceData.device_VoltageDataInterface;
        device_TemperatureDataInterface = deviceData.device_TemperatureDataInterface;
        device_HumidityDataInterface = deviceData.device_HumidityDataInterface;
        device_LockDataInterface = deviceData.device_LockDataInterface;
        device_StartDataInterface = deviceData.device_StartDataInterface;
        device_WindowDataInterface = deviceData.device_WindowDataInterface;
        device_image = deviceData.device_image;

        if (!device_name || !device_id || !device_key) {
            window.location.href = 'config.html';
            return;
        }
    } catch (error) {
        window.location.href = 'config.html';
        return;
    }

    // 设置汽车图片
    const carImage = document.getElementById('car-image');
    carImage.src = device_image;

    // 连接 WebSocket
    connectWebSocket();
}

// WebSocket 连接
function connectWebSocket() {
    ws = new WebSocket('wss://www.bigiot.net:8484');
    ws.onopen = () => {
        console.log('WebSocket 连接成功');
        login();
    };
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.M === 'loginok') {
            // 每 3 秒发送沟通指令数据
            setInterval(sendCommunicationCommand, 3000);
            // 每 10 秒检查设备连接状态
            setInterval(checkDeviceConnection, 10000);
        } else if (data.M === 'say' && data.SIGN === 'S') {
            parseDeviceResponse(data.C);
        }
    };
    ws.onclose = () => {
        console.log('WebSocket 连接关闭');
        isConnected = false;
        offlineOverlay.style.display = 'flex';
        disableButtons();
    };
    ws.onerror = (error) => {
        console.error('WebSocket 连接错误', error);
        isConnected = false;
        offlineOverlay.style.display = 'flex';
        disableButtons();
    };
}

// 用户登录
function login() {
    const loginData = JSON.stringify({
        M: 'login',
        ID: user_name,
        K: user_password
    });
    ws.send(loginData);
}

// 发送沟通指令数据
function sendCommunicationCommand() {
    const commandData = JSON.stringify({
        M: 'say',
        ID: device_id,
        C: '00'
    });
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(commandData);
    }
}

// 解析设备返回数据
function parseDeviceResponse(response) {
    isConnected = true;
    offlineOverlay.style.display = 'none';
    enableButtons();

    const [
        lockState,
        engineState,
        trunkState,
        findCarState,
        windowState,
        voltage,
        temperature,
        humidity
    ] = response.split(',');

    updateButtonState(lockButton, lockState, '解锁', '锁定', '#202020', '#4CAF50');
    updateButtonState(startButton, engineState, '启动引擎', '关闭引擎', '#202020', '#4CAF50', '#007BFF');
    updateButtonState(trunkButton, trunkState, '打开尾箱', '关闭尾箱', '#202020', '#4CAF50');
    updateButtonState(findCarButton, findCarState, '寻车', '关闭寻车', '#202020', '#4CAF50');
    updateButtonState(windowButton, windowState, '开窗', '关窗', '#202020', '#4CAF50');

    voltageDisplay.textContent = parseFloat(voltage).toFixed(2);
    temperatureDisplay.textContent = parseFloat(temperature).toFixed(2);
    humidityDisplay.textContent = parseFloat(humidity).toFixed(2);

    lastDataTime = Date.now();
}

// 更新按钮状态
function updateButtonState(button, state, text1, text2, color1, color2, specialColor) {
    if (state === '0') {
        button.textContent = text1;
        button.style.backgroundColor = color1;
    } else if (state === '2' && specialColor) {
        button.textContent = text2;
        button.style.backgroundColor = specialColor;
    } else {
        button.textContent = text2;
        button.style.backgroundColor = color2;
    }
}

// 检查设备连接状态
function checkDeviceConnection() {
    if (Date.now() - lastDataTime > 10000) {
        isConnected = false;
        offlineOverlay.style.display = 'flex';
        disableButtons();
    }
}

// 启用按钮
function enableButtons() {
    lockButton.disabled = false;
    startButton.disabled = false;
    trunkButton.disabled = false;
    findCarButton.disabled = false;
    windowButton.disabled = false;
}

// 禁用按钮
function disableButtons() {
    lockButton.disabled = true;
    startButton.disabled = true;
    trunkButton.disabled = true;
    findCarButton.disabled = true;
    windowButton.disabled = true;
}

// 按钮点击事件
lockButton.addEventListener('click', () => {
    if (!isConnected) return;
    const commandData = JSON.stringify({
        M: 'say',
        ID: device_id,
        C: lockButton.textContent === '解锁' ? '001' : '011'
    });
    ws.send(commandData);
});

startButton.addEventListener('click', () => {
    if (!isConnected) return;
    const commandData = JSON.stringify({
        M: 'say',
        ID: device_id,
        C: startButton.textContent === '启动' ? '002' : '012'
    });
    ws.send(commandData);
});

trunkButton.addEventListener('click', () => {
    if (!isConnected) return;
    const commandData = JSON.stringify({
        M: 'say',
        ID: device_id,
        C: trunkButton.textContent === '打开尾箱' ? '003' : '013'
    });
    ws.send(commandData);
});

findCarButton.addEventListener('click', () => {
    if (!isConnected) return;
    const commandData = JSON.stringify({
        M: 'say',
        ID: device_id,
        C: findCarButton.textContent === '打开寻车' ? '004' : '014'
    });
    ws.send(commandData);
});

windowButton.addEventListener('click', () => {
    if (!isConnected) return;
    const commandData = JSON.stringify({
        M: 'say',
        ID: device_id,
        C: windowButton.textContent === '开窗' ? '005' : '015'
    });
    ws.send(commandData);
});

// 页面加载
window.onload = function () {
    checkConfigFiles();
    isConnected = false;
    offlineOverlay.style.display = 'flex';
    disableButtons();
};