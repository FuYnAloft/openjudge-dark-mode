(function() {
    'use strict';

    let currentTheme = localStorage.getItem('oj-theme-pref') || 'system';
    
    // 创建容器
    const switchContainer = document.createElement('div');
    switchContainer.id = 'oj-mode-switch';
    
    // 创建选择框
    const select = document.createElement('select');
    select.id = 'oj-mode-select';
    select.innerHTML = `
        <option value="light">亮色</option>
        <option value="system">系统</option>
        <option value="dark">暗色</option>
    `;
    select.value = currentTheme;
    
    switchContainer.appendChild(select);

    // 插入位置：在搜索框 (.practice-search) 之前
    const searchBox = document.querySelector('.practice-search');
    if (searchBox) {
        searchBox.parentNode.insertBefore(switchContainer, searchBox);
    }

    // CSS加载逻辑 (保持不变)
    let darkLinkElement = null;

    function enableDark() {
        if (!document.getElementById('oj-dark-css')) {
            darkLinkElement = document.createElement('link');
            darkLinkElement.id = 'oj-dark-css';
            darkLinkElement.rel = 'stylesheet';
            darkLinkElement.href = chrome.runtime.getURL('dark.css');
            document.head.appendChild(darkLinkElement);
        }
    }

    function disableDark() {
        const existingLink = document.getElementById('oj-dark-css');
        if (existingLink) {
            existingLink.remove();
        }
    }

    function applyTheme(theme) {
        if (theme === 'dark') {
            enableDark();
        } else if (theme === 'light') {
            disableDark();
        } else if (theme === 'system') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                enableDark();
            } else {
                disableDark();
            }
        }
    }

    applyTheme(currentTheme);

    select.addEventListener('change', (e) => {
        const newTheme = e.target.value;
        localStorage.setItem('oj-theme-pref', newTheme);
        applyTheme(newTheme);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('oj-theme-pref') === 'system') {
            e.matches ? enableDark() : disableDark();
        }
    });

})();