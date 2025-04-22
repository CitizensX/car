//index.js
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
const carImage = document.getElementById('car-image');
const deviceNameDisplay = document.getElementById('device-name'); // 新增获取设备名称显示元素
const debugOutput = document.createElement('div');
debugOutput.classList.add('debug-output');
carImage.parentNode.insertBefore(debugOutput, carImage.nextSibling);
let isDebugVisible = false;

let lastDataTime = Date.now();
let isConnected = false;
let ws;

// 调试输出函数
function debugLog(message) {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logEntry = document.createElement('p');
    logEntry.textContent = `${time}: ${message}`;
    debugOutput.appendChild(logEntry);
    debugOutput.scrollTop = debugOutput.scrollHeight;
}

// 检查配置文件并读取内容
function checkConfigFiles() {
    const deviceConfigS = localStorage.getItem('DeviceConfigS');
    debugLog(`DeviceConfigS: ${deviceConfigS}`);
    const deviceConfig = localStorage.getItem('DeviceConfig');
    debugLog(`DeviceConfig: ${deviceConfig}`);
    const userConfig = localStorage.getItem('UserConfig');
    debugLog(`UserConfig: ${userConfig}`);

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

    // 设置设备名称
    if (deviceNameDisplay) {
        deviceNameDisplay.textContent = device_name;
    }

    // 设置汽车图片
    setCarImage();

    // 连接 WebSocket
    connectWebSocket();
}

// 设置汽车图片
function setCarImage() {
    if (device_image) {
        let imageUrl = device_image;
        // 检查是否为Base64编码的图片URL
        if (!device_image.startsWith('data:')) {
            // 添加时间戳避免缓存问题
            const timestamp = new Date().getTime();
            imageUrl = `${device_image}?t=${timestamp}`;
        }
        carImage.src = imageUrl;
        carImage.onerror = function () {
            // 图片加载失败时重试
            setTimeout(() => {
                setCarImage();
            }, 3000);
        };
    } else {
        carImage.style.display = 'none';
    }
    // 根据图片大小设置调试框大小
    setTimeout(() => {
        debugOutput.style.width = carImage.offsetWidth + 'px';
        debugOutput.style.height = carImage.offsetHeight + 'px';
    }, 0);
}

// WebSocket 连接
function connectWebSocket() {
    ws = new WebSocket('wss://www.bigiot.net:8484');
    ws.onopen = () => {
        debugLog('WebSocket 连接成功');
    };
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        debugLog(`服务器数据: ${JSON.stringify(data)}`);
        if (data.M === 'WELCOME TO BIGIOT') {
            login();
        } else if (data.M === 'loginok') {
            // 每 3 秒发送沟通指令数据
            setInterval(() => SendSayData("00"), 3000);
            // 每 10 秒检查设备连接状态
            setInterval(checkDeviceConnection, 10000);
        } else if (data.M === 'say' && data.SIGN === 'S') {
            parseDeviceResponse(data.C);
        }
    };
    ws.onclose = () => {
        debugLog('WebSocket 连接关闭');
        isConnected = false;
        disableButtons();
    };
    ws.onerror = (error) => {
        debugLog(`WebSocket 连接错误: ${error}`);
        isConnected = false;
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
    debugLog(`login: ${loginData}`);
    ws.send(loginData);
}

// 发送沟通指令数据
function SendSayData(data) {
    const SendData = JSON.stringify({
        M: 'say',
        ID: `D${device_id}`,
        C: data
    });
    if (ws.readyState === WebSocket.OPEN) {
        debugLog(`SendData: ${SendData}`);
        ws.send(SendData);
    }
}

// 解析设备返回数据
function parseDeviceResponse(response) {
    isConnected = true;
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
    SendSayData(lockButton.textContent === '解锁' ? '001' : '011');
});

startButton.addEventListener('click', () => {
    if (!isConnected) return;
    SendSayData(startButton.textContent === '启动' ? '002' : '012');
});

trunkButton.addEventListener('click', () => {
    if (!isConnected) return;
    SendSayData(trunkButton.textContent === '打开尾箱' ? '003' : '013');
});

findCarButton.addEventListener('click', () => {
    if (!isConnected) return;
    SendSayData(findCarButton.textContent === '打开寻车' ? '004' : '014');
});

windowButton.addEventListener('click', () => {
    if (!isConnected) return;
    SendSayData(windowButton.textContent === '开窗' ? '005' : '015');
});

// 5 秒内点击 5 次设备名称跳转配置页面
if (deviceNameDisplay) {
    let clickCount = 0;
    let lastClickTime = 0;
    deviceNameDisplay.addEventListener('click', () => {
        const currentTime = Date.now();
        if (currentTime - lastClickTime < 5000) {
            clickCount++;
            if (clickCount === 5) {
                window.location.href = 'config.html';
            }
        } else {
            clickCount = 1;
        }
        lastClickTime = currentTime;
    });
}

// 单击图片显示或隐藏调试信息
carImage.addEventListener('click', () => {
    isDebugVisible = !isDebugVisible;
    if (isDebugVisible) {
        debugOutput.style.display = 'block';
    } else {
        debugOutput.style.display = 'none';
    }
});

// 页面加载
window.onload = function () {
    checkConfigFiles();
    isConnected = false;
    disableButtons();
    debugOutput.style.display = 'none';
};    