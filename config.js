// 全局变量
let deviceConfigs = [];

// 加载设备列表
function loadDeviceList() {
    const deviceConfigS = localStorage.getItem('DeviceConfigS');
    if (deviceConfigS) {
        deviceConfigs = JSON.parse(deviceConfigS);
        const deviceList = document.getElementById('deviceList');
        deviceList.innerHTML = '';
        deviceConfigs.forEach((device, index) => {
            const listItem = document.createElement('li');
            const selectMarker = document.createElement('span');
            selectMarker.classList.add('select-marker');
            const deviceName = document.createElement('span');
            deviceName.textContent = device.device_name;
            const editBtn = document.createElement('button');
            editBtn.textContent = '修改';
            editBtn.addEventListener('click', () => openEditDeviceModal(index));
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '删除';
            deleteBtn.addEventListener('click', () => deleteDevice(index));

            listItem.appendChild(selectMarker);
            listItem.appendChild(deviceName);
            if (device.device_image) {
                const img = document.createElement('img');
                img.src = device.device_image;
                img.classList.add('device-image-icon');
                listItem.appendChild(img);
            }
            listItem.appendChild(editBtn);
            listItem.appendChild(deleteBtn);

            listItem.addEventListener('click', () => {
                selectSingleDevice(index);
                localStorage.setItem('DeviceConfig', JSON.stringify(device));
            });

            deviceList.appendChild(listItem);
        });
        // 打开 config 页面时判断 device_name 与 deviceConfigS 中的哪一个设备匹配并将该设备显示为选择效果
        const currentDeviceConfig = localStorage.getItem('DeviceConfig');
        if (currentDeviceConfig) {
            const currentDevice = JSON.parse(currentDeviceConfig);
            const currentIndex = deviceConfigs.findIndex(device => device.device_name === currentDevice.device_name);
            if (currentIndex!== -1) {
                selectSingleDevice(currentIndex);
            }
        }
    }
}

// 选择单个设备
function selectSingleDevice(index) {
    const listItems = document.querySelectorAll('#deviceList li');
    listItems.forEach((item, i) => {
        const selectMarker = item.querySelector('.select-marker');
        if (i === index) {
            selectMarker.classList.add('selected');
        } else {
            selectMarker.classList.remove('selected');
        }
    });
}

// 打开添加设备弹窗
function openAddDeviceModal() {
    const addDeviceModal = document.getElementById('addDeviceModal');
    addDeviceModal.style.display = 'block';
    // 清空输入框内容
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
    document.getElementById('addDeviceImagePreview').src = '';
}

// 关闭添加设备弹窗
function closeAddDeviceModal() {
    const addDeviceModal = document.getElementById('addDeviceModal');
    addDeviceModal.style.display = 'none';
    // 点击取消时放弃本次输入的内容
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
    document.getElementById('addDeviceImagePreview').src = '';
}

// 确定添加设备
function addDevice() {
    const deviceImage = document.getElementById('deviceImage').files[0]? URL.createObjectURL(document.getElementById('deviceImage').files[0]) : '';
    const deviceName = document.getElementById('deviceName').value;
    const deviceId = document.getElementById('deviceId').value;
    const deviceKey = document.getElementById('deviceKey').value;
    const lockSignalValue = document.getElementById('lockSignalValue').value;
    const voltageDataInterface = document.getElementById('voltageDataInterface').value;
    const temperatureDataInterface = document.getElementById('temperatureDataInterface').value;
    const humidityDataInterface = document.getElementById('humidityDataInterface').value;
    const lockDataInterface = document.getElementById('lockDataInterface').value;
    const startDataInterface = document.getElementById('startDataInterface').value;
    const windowDataInterface = document.getElementById('windowDataInterface').value;

    const newDevice = {
        device_image: deviceImage,
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
}

// 关闭用户配置弹窗
function closeUserConfigModal() {
    const userConfigModal = document.getElementById('userConfigModal');
    userConfigModal.style.display = 'none';
    // 点击取消时放弃本次输入的内容
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
    if (device.device_image) {
        editDeviceImagePreview.src = device.device_image;
    } else {
        editDeviceImagePreview.src = '';
    }
    editDeviceModal.style.display = 'block';
}

// 关闭修改设备弹窗
function closeEditDeviceModal() {
    const editDeviceModal = document.getElementById('editDeviceModal');
    editDeviceModal.style.display = 'none';
    // 点击取消时放弃本次输入的内容
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
    document.getElementById('editDeviceImagePreview').src = '';
}

// 确定修改设备
function editDevice(index) {
    const deviceImage = document.getElementById('editDeviceImage').files[0]? URL.createObjectURL(document.getElementById('editDeviceImage').files[0]) : deviceConfigs[index].device_image;
    const deviceName = document.getElementById('editDeviceName').value;
    const deviceId = document.getElementById('editDeviceId').value;
    const deviceKey = document.getElementById('editDeviceKey').value;
    const lockSignalValue = document.getElementById('editLockSignalValue').value;
    const voltageDataInterface = document.getElementById('editVoltageDataInterface').value;
    const temperatureDataInterface = document.getElementById('editTemperatureDataInterface').value;
    const humidityDataInterface = document.getElementById('editHumidityDataInterface').value;
    const lockDataInterface = document.getElementById('editLockDataInterface').value;
    const startDataInterface = document.getElementById('editStartDataInterface').value;
    const windowDataInterface = document.getElementById('editWindowDataInterface').value;

    const editedDevice = {
        device_image: deviceImage,
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
    closeEditDeviceModal();
    loadDeviceList(); // 修改设备后重新加载设备列表，更新设备名称显示
}

// 删除设备
function deleteDevice(index) {
    deviceConfigs.splice(index, 1);
    localStorage.setItem('DeviceConfigS', JSON.stringify(deviceConfigs));
    loadDeviceList();
}

// 图片预览
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.src = '';
    }
}

// 初始化事件绑定
function init() {
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
    editDeviceConfirmBtn.addEventListener('click', () => {
        const index = Array.from(document.querySelectorAll('#deviceList li')).findIndex(item => item.classList.contains('selected'));
        if (index!== -1) {
            editDevice(index);
        }
    });
    editDeviceCancelBtn.addEventListener('click', closeEditDeviceModal);
    closeEditDeviceModalBtn.addEventListener('click', closeEditDeviceModal);

    loadDeviceList();
}

window.onload = init;
    