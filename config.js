// 全局变量
let deviceConfigs = [];
let db;

// 打开 IndexedDB 数据库
function openDatabase() {
    const request = indexedDB.open('DeviceImagesDB', 1);

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        const objectStore = db.createObjectStore('DeviceImages', { keyPath: 'deviceName' });
    };

    request.onsuccess = function (event) {
        db = event.target.result;
    };

    request.onerror = function (event) {
        console.error('IndexedDB 打开失败:', event.target.error);
    };
}

// 存储设备图片到 IndexedDB
function saveDeviceImage(deviceName, imageData) {
    const transaction = db.transaction(['DeviceImages'], 'readwrite');
    const objectStore = transaction.objectStore('DeviceImages');
    const request = objectStore.put({ deviceName, imageData });

    request.onsuccess = function () {
        console.log('设备图片存储成功');
    };

    request.onerror = function (event) {
        console.error('设备图片存储失败:', event.target.error);
    };
}

// 从 IndexedDB 获取设备图片
function getDeviceImage(deviceName, callback) {
    const transaction = db.transaction(['DeviceImages']);
    const objectStore = transaction.objectStore('DeviceImages');
    const request = objectStore.get(deviceName);

    request.onsuccess = function () {
        const result = request.result;
        if (result) {
            callback(result.imageData);
        } else {
            callback(null);
        }
    };

    request.onerror = function (event) {
        console.error('设备图片获取失败:', event.target.error);
        callback(null);
    };
}

// 加载设备列表
function loadDeviceList() {
    const deviceConfigS = localStorage.getItem('DeviceConfigS');
    if (deviceConfigS) {
        deviceConfigs = JSON.parse(deviceConfigS);
        const deviceList = document.getElementById('deviceList');
        deviceList.innerHTML = '';
        const currentDeviceConfig = JSON.parse(localStorage.getItem('DeviceConfig'));
        deviceConfigs.forEach((device, index) => {
            const listItem = document.createElement('li');
            const selectMarker = document.createElement('span');
            selectMarker.classList.add('select-marker');
            // 创建图片元素
            const deviceImage = document.createElement('img');
            // 设置固定的宽度和高度
            deviceImage.style.width = '100px';
            deviceImage.style.height = '100px';
            deviceImage.style.objectFit = 'cover';
            deviceImage.style.marginRight = '10px';
            // 添加垂直居中样式
            deviceImage.style.verticalAlign = 'middle';

            getDeviceImage(device.device_name, (imageData) => {
                if (imageData) {
                    deviceImage.src = imageData;
                }
            });

            const deviceName = document.createElement('span');
            deviceName.textContent = device.device_name;
            // 添加垂直居中样式
            deviceName.style.verticalAlign = 'middle';
            const editBtn = document.createElement('button');
            editBtn.textContent = '修改';
            editBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                openEditDeviceModal(index);
            });
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '删除';
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteDevice(index);
            });

            listItem.appendChild(selectMarker);
            if (device.device_image) {
                listItem.appendChild(deviceImage);
            }
            listItem.appendChild(deviceName);
            listItem.appendChild(editBtn);
            listItem.appendChild(deleteBtn);

            listItem.addEventListener('click', (event) => {
                event.preventDefault();
                // 移除所有设备的选择效果
                const allSelectMarkers = document.querySelectorAll('.select-marker');
                allSelectMarkers.forEach(marker => {
                    marker.classList.remove('selected');
                });
                // 添加当前点击设备的选择效果
                selectMarker.classList.add('selected');
                localStorage.setItem('DeviceConfig', JSON.stringify(device));
                // 跳转到 index 页面
                window.location.href = 'index.html';
            });

            if (currentDeviceConfig && currentDeviceConfig.device_name === device.device_name) {
                selectMarker.classList.add('selected');
            }

            deviceList.appendChild(listItem);
        });
    }
}

// 打开添加设备弹窗
function openAddDeviceModal() {
    const addDeviceModal = document.getElementById('addDeviceModal');
    addDeviceModal.style.display = 'block';
    // 清空输入框内容
    clearAddDeviceInputs();
}

// 关闭添加设备弹窗
function closeAddDeviceModal() {
    const addDeviceModal = document.getElementById('addDeviceModal');
    addDeviceModal.style.display = 'none';
    // 清空输入框内容
    clearAddDeviceInputs();
    const addDeviceImagePreview = document.getElementById('addDeviceImagePreview');
    addDeviceImagePreview.src = '';
    addDeviceImagePreview.style.display = 'none';
}

// 清空添加设备输入框内容
function clearAddDeviceInputs() {
    document.getElementById('deviceName').value = '';
    document.getElementById('deviceId').value = '';
    document.getElementById('deviceKey').value = '';
    document.getElementById('lockSignalValue').value = '';
    document.getElementById('voltageDataInterface').value = '';
    document.getElementById('temperatureDataInterface').value = '';
    document.getElementById('humidityDataInterface').value = '';
    document.getElementById('lockDataInterface').value = '';
    document.getElementById('startDataInterface').value = '';
    document.getElementById('windowDataInterface').value = '';
    document.getElementById('deviceImage').value = '';
}

// 确定添加设备
function addDevice() {
    const deviceName = document.getElementById('deviceName').value;
    const deviceId = document.getElementById('deviceId').value;
    const deviceKey = document.getElementById('deviceKey').value;
    // 验证设备名称、设备ID和设备Key是否为空
    if (deviceName === '' || deviceId === '' || deviceKey === '') {
        alert('设备名称、设备ID和设备Key为必填项！');
        return;
    }
    const deviceImageInput = document.getElementById('deviceImage');
    let deviceImage = '';
    if (deviceImageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (e) {
            deviceImage = e.target.result;
            saveDeviceImage(deviceName, deviceImage);
            const lockSignalValue = document.getElementById('lockSignalValue').value;
            const voltageDataInterface = document.getElementById('voltageDataInterface').value;
            const temperatureDataInterface = document.getElementById('temperatureDataInterface').value;
            const humidityDataInterface = document.getElementById('humidityDataInterface').value;
            const lockDataInterface = document.getElementById('lockDataInterface').value;
            const startDataInterface = document.getElementById('startDataInterface').value;
            const windowDataInterface = document.getElementById('windowDataInterface').value;

            const newDevice = {
                device_image: null,
                device_name: deviceName,
                device_id: deviceId,
                device_key: deviceKey,
                device_LockSignalValue: lockSignalValue,
                device_VoltageDataInterface: voltageDataInterface,
                device_TemperatureDataInterface: temperatureDataInterface,
                device_HumidityDataInterface: humidityDataInterface,
                device_LockDataInterface: lockDataInterface,
                device_StartDataInterface: startDataInterface,
                device_WindowDataInterface: windowDataInterface
            };

            deviceConfigs.push(newDevice);
            localStorage.setItem('DeviceConfigS', JSON.stringify(deviceConfigs));
            closeAddDeviceModal();
            loadDeviceList();
        };
        reader.readAsDataURL(deviceImageInput.files[0]);
        return;
    }

    const lockSignalValue = document.getElementById('lockSignalValue').value;
    const voltageDataInterface = document.getElementById('voltageDataInterface').value;
    const temperatureDataInterface = document.getElementById('temperatureDataInterface').value;
    const humidityDataInterface = document.getElementById('humidityDataInterface').value;
    const lockDataInterface = document.getElementById('lockDataInterface').value;
    const startDataInterface = document.getElementById('startDataInterface').value;
    const windowDataInterface = document.getElementById('windowDataInterface').value;

    const newDevice = {
        device_image: null,
        device_name: deviceName,
        device_id: deviceId,
        device_key: deviceKey,
        device_LockSignalValue: lockSignalValue,
        device_VoltageDataInterface: voltageDataInterface,
        device_TemperatureDataInterface: temperatureDataInterface,
        device_HumidityDataInterface: humidityDataInterface,
        device_LockDataInterface: lockDataInterface,
        device_StartDataInterface: startDataInterface,
        device_WindowDataInterface: windowDataInterface
    };

    deviceConfigs.push(newDevice);
    localStorage.setItem('DeviceConfigS', JSON.stringify(deviceConfigs));
    closeAddDeviceModal();
    loadDeviceList();
}

// 打开用户配置弹窗
function openUserConfigModal() {
    const userConfigModal = document.getElementById('userConfigModal');
    userConfigModal.style.display = 'block';
    // 加载保存的用户配置内容
    const userConfigData = JSON.parse(localStorage.getItem('UserConfig'));
    if (userConfigData) {
        document.getElementById('clientId').value = userConfigData.client_id;
        document.getElementById('clientSecret').value = userConfigData.client_secret;
        document.getElementById('userName').value = userConfigData.user_name;
        document.getElementById('userPassword').value = userConfigData.user_password;
    }
}

// 关闭用户配置弹窗
function closeUserConfigModal() {
    const userConfigModal = document.getElementById('userConfigModal');
    userConfigModal.style.display = 'none';
    // 清空输入框内容
    clearUserConfigInputs();
}

// 清空用户配置输入框内容
function clearUserConfigInputs() {
    document.getElementById('clientId').value = '';
    document.getElementById('clientSecret').value = '';
    document.getElementById('userName').value = '';
    document.getElementById('userPassword').value = '';
}

// 确定用户配置
function userConfig() {
    const clientId = document.getElementById('clientId').value;
    const clientSecret = document.getElementById('clientSecret').value;
    const userName = document.getElementById('userName').value;
    const userPassword = document.getElementById('userPassword').value;

    const userConfigData = {
        client_id: clientId,
        client_secret: clientSecret,
        user_name: userName,
        user_password: userPassword
    };

    localStorage.setItem('UserConfig', JSON.stringify(userConfigData));
    closeUserConfigModal();
}

// 打开修改设备弹窗
function openEditDeviceModal(index) {
    const editDeviceModal = document.getElementById('editDeviceModal');
    const device = deviceConfigs[index];
    // 这里不处理图片的回显，因为图片选择后是临时URL，保存后再加载显示
    document.getElementById('editDeviceName').value = device.device_name;
    document.getElementById('editDeviceId').value = device.device_id;
    document.getElementById('editDeviceKey').value = device.device_key;
    document.getElementById('editLockSignalValue').value = device.device_LockSignalValue;
    document.getElementById('editVoltageDataInterface').value = device.device_VoltageDataInterface;
    document.getElementById('editTemperatureDataInterface').value = device.device_TemperatureDataInterface;
    document.getElementById('editHumidityDataInterface').value = device.device_HumidityDataInterface;
    document.getElementById('editLockDataInterface').value = device.device_LockDataInterface;
    document.getElementById('editStartDataInterface').value = device.device_StartDataInterface;
    document.getElementById('editWindowDataInterface').value = device.device_WindowDataInterface;

    const editDeviceImagePreview = document.getElementById('editDeviceImagePreview');
    getDeviceImage(device.device_name, (imageData) => {
        if (imageData) {
            editDeviceImagePreview.src = imageData;
            editDeviceImagePreview.style.display = 'block';
        } else {
            editDeviceImagePreview.src = '';
            editDeviceImagePreview.style.display = 'none';
        }
    });

    // 存储当前编辑设备的索引
    editDeviceModal.dataset.index = index;

    editDeviceModal.style.display = 'block';
}

// 关闭修改设备弹窗
function closeEditDeviceModal() {
    const editDeviceModal = document.getElementById('editDeviceModal');
    editDeviceModal.style.display = 'none';
    // 清空输入框内容
    clearEditDeviceInputs();
    const editDeviceImagePreview = document.getElementById('editDeviceImagePreview');
    editDeviceImagePreview.src = '';
    editDeviceImagePreview.style.display = 'none';
}

// 清空修改设备输入框内容
function clearEditDeviceInputs() {
    document.getElementById('editDeviceName').value = '';
    document.getElementById('editDeviceId').value = '';
    document.getElementById('editDeviceKey').value = '';
    document.getElementById('editLockSignalValue').value = '';
    document.getElementById('editVoltageDataInterface').value = '';
    document.getElementById('editTemperatureDataInterface').value = '';
    document.getElementById('editHumidityDataInterface').value = '';
    document.getElementById('editLockDataInterface').value = '';
    document.getElementById('editStartDataInterface').value = '';
    document.getElementById('editWindowDataInterface').value = '';
    document.getElementById('editDeviceImage').value = '';
}

// 确定修改设备
function editDevice() {
    const editDeviceModal = document.getElementById('editDeviceModal');
    const index = parseInt(editDeviceModal.dataset.index);
    const deviceName = document.getElementById('editDeviceName').value;
    const deviceId = document.getElementById('editDeviceId').value;
    const deviceKey = document.getElementById('editDeviceKey').value;
    // 验证设备名称、设备ID和设备Key是否为空
    if (deviceName === '' || deviceId === '' || deviceKey === '') {
        alert('设备名称、设备ID和设备Key为必填项！');
        return;
    }
    const deviceImageInput = document.getElementById('editDeviceImage');
    let deviceImage = '';
    if (deviceImageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (e) {
            deviceImage = e.target.result;
            saveDeviceImage(deviceName, deviceImage);
            const lockSignalValue = document.getElementById('editLockSignalValue').value;
            const voltageDataInterface = document.getElementById('editVoltageDataInterface').value;
            const temperatureDataInterface = document.getElementById('editTemperatureDataInterface').value;
            const humidityDataInterface = document.getElementById('editHumidityDataInterface').value;
            const lockDataInterface = document.getElementById('editLockDataInterface').value;
            const startDataInterface = document.getElementById('editStartDataInterface').value;
            const windowDataInterface = document.getElementById('editWindowDataInterface').value;

            const editedDevice = {
                device_image: null,
                device_name: deviceName,
                device_id: deviceId,
                device_key: deviceKey,
                device_LockSignalValue: lockSignalValue,
                device_VoltageDataInterface: voltageDataInterface,
                device_TemperatureDataInterface: temperatureDataInterface,
                device_HumidityDataInterface: humidityDataInterface,
                device_LockDataInterface: lockDataInterface,
                device_StartDataInterface: startDataInterface,
                device_WindowDataInterface: windowDataInterface
            };

            deviceConfigs[index] = editedDevice;
            localStorage.setItem('DeviceConfigS', JSON.stringify(deviceConfigs));
            // 检查修改的是否是当前选中的设备
            const currentDeviceConfig = JSON.parse(localStorage.getItem('DeviceConfig'));
            if (currentDeviceConfig && currentDeviceConfig.device_id === deviceId) {
                localStorage.setItem('DeviceConfig', JSON.stringify(editedDevice));
            }
            closeEditDeviceModal();
            loadDeviceList();
        };
        reader.readAsDataURL(deviceImageInput.files[0]);
        return;
    }

    const lockSignalValue = document.getElementById('editLockSignalValue').value;
    const voltageDataInterface = document.getElementById('editVoltageDataInterface').value;
    const temperatureDataInterface = document.getElementById('editTemperatureDataInterface').value;
    const humidityDataInterface = document.getElementById('editHumidityDataInterface').value;
    const lockDataInterface = document.getElementById('editLockDataInterface').value;
    const startDataInterface = document.getElementById('editStartDataInterface').value;
    const windowDataInterface = document.getElementById('editWindowDataInterface').value;

    const editedDevice = {
        device_image: null,
        device_name: deviceName,
        device_id: deviceId,
        device_key: deviceKey,
        device_LockSignalValue: lockSignalValue,
        device_VoltageDataInterface: voltageDataInterface,
        device_TemperatureDataInterface: temperatureDataInterface,
        device_HumidityDataInterface: humidityDataInterface,
        device_LockDataInterface: lockDataInterface,
        device_StartDataInterface: startDataInterface,
        device_WindowDataInterface: windowDataInterface
    };

    deviceConfigs[index] = editedDevice;
    localStorage.setItem('DeviceConfigS', JSON.stringify(deviceConfigs));
    // 检查修改的是否是当前选中的设备
    const currentDeviceConfig = JSON.parse(localStorage.getItem('DeviceConfig'));
    if (currentDeviceConfig && currentDeviceConfig.device_id === deviceId) {
        localStorage.setItem('DeviceConfig', JSON.stringify(editedDevice));
    }
    closeEditDeviceModal();
    loadDeviceList();
}

// 删除设备
function deleteDevice(index) {
    const device = deviceConfigs[index];
    const transaction = db.transaction(['DeviceImages'], 'readwrite');
    const objectStore = transaction.objectStore('DeviceImages');
    const request = objectStore.delete(device.device_name);

    request.onsuccess = function () {
        console.log('设备图片删除成功');
        deviceConfigs.splice(index, 1);
        localStorage.setItem('DeviceConfigS', JSON.stringify(deviceConfigs));
        loadDeviceList();
    };

    request.onerror = function (event) {
        console.error('设备图片删除失败:', event.target.error);
    };
}

// 初始化事件绑定
function init() {
    openDatabase();
    const addDeviceBtn = document.getElementById('addDeviceBtn');
    const userConfigBtn = document.getElementById('userConfigBtn');
    const addDeviceConfirmBtn = document.getElementById('addDeviceConfirmBtn');
    const addDeviceCancelBtn = document.getElementById('addDeviceCancelBtn');
    const userConfigConfirmBtn = document.getElementById('userConfigConfirmBtn');
    const userConfigCancelBtn = document.getElementById('userConfigCancelBtn');
    const closeAddDeviceModalBtn = document.getElementById('closeAddDeviceModal');
    const closeUserConfigModalBtn = document.getElementById('closeUserConfigModal');
    const editDeviceConfirmBtn = document.getElementById('editDeviceConfirmBtn');
    const editDeviceCancelBtn = document.getElementById('editDeviceCancelBtn');
    const closeEditDeviceModalBtn = document.getElementById('closeEditDeviceModal');

    addDeviceBtn.addEventListener('click', openAddDeviceModal);
    userConfigBtn.addEventListener('click', openUserConfigModal);
    addDeviceConfirmBtn.addEventListener('click', addDevice);
    addDeviceCancelBtn.addEventListener('click', closeAddDeviceModal);
    userConfigConfirmBtn.addEventListener('click', userConfig);
    userConfigCancelBtn.addEventListener('click', closeUserConfigModal);
    closeAddDeviceModalBtn.addEventListener('click', closeAddDeviceModal);
    closeUserConfigModalBtn.addEventListener('click', closeUserConfigModal);
    editDeviceConfirmBtn.addEventListener('click', editDevice);
    editDeviceCancelBtn.addEventListener('click', closeEditDeviceModal);
    closeEditDeviceModalBtn.addEventListener('click', closeEditDeviceModal);

    loadDeviceList();

    // 添加设备图片选择事件
    const deviceImageInput = document.getElementById('deviceImage');
    const addDeviceImageButton = document.getElementById('addDeviceImageButton');
    addDeviceImageButton.addEventListener('click', function () {
        deviceImageInput.click();
    });
    deviceImageInput.addEventListener('change', function () {
        const addDeviceImagePreview = document.getElementById('addDeviceImagePreview');
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                addDeviceImagePreview.src = e.target.result;
                addDeviceImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            addDeviceImagePreview.src = '';
            addDeviceImagePreview.style.display = 'none';
        }
    });

    // 修改设备图片选择事件
    const editDeviceImageInput = document.getElementById('editDeviceImage');
    const editDeviceImageButton = document.getElementById('editDeviceImageButton');
    editDeviceImageButton.addEventListener('click', function () {
        editDeviceImageInput.click();
    });
    editDeviceImageInput.addEventListener('change', function () {
        const editDeviceImagePreview = document.getElementById('editDeviceImagePreview');
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                editDeviceImagePreview.src = e.target.result;
                editDeviceImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            editDeviceImagePreview.src = '';
            editDeviceImagePreview.style.display = 'none';
        }
    });
}

window.onload = init;
    