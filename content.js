(function() {
    'use strict';

    // =========================================================
    // 第一阶段：极速模式 (防止闪白)
    // 这部分代码会在页面刚开始加载，甚至 body 还没出现时运行
    // =========================================================

    const savedTheme = localStorage.getItem('oj-theme-pref') || 'dark';

    // 判断是否需要开启暗色
    function shouldEnableDark(theme) {
        if (theme === 'dark') return true;
        if (theme === 'light') return false;
        // system 模式
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // 定义加载 CSS 的函数
    function enableDarkCSS() {
        // 1. 插入主样式 dark.css
        if (!document.getElementById('oj-dark-css')) {
            const link = document.createElement('link');
            link.id = 'oj-dark-css';
            link.rel = 'stylesheet';
            link.href = chrome.runtime.getURL('dark.css');
            // 注意：这时候 head 可能还没出来，所以插到 documentElement (<html>标签) 里
            (document.head || document.documentElement).appendChild(link);
        }

        // 2. 关键：插入“防闪烁”内联样式
        // 即使 dark.css 加载需要 10ms，这行代码能确保这 10ms 也是黑的
        if (!document.getElementById('oj-anti-flash')) {
            const style = document.createElement('style');
            style.id = 'oj-anti-flash';
            style.textContent = 'html, body { background-color: #1e1e1e !important; }';
            (document.head || document.documentElement).appendChild(style);
        }
    }

    function disableDarkCSS() {
        const link = document.getElementById('oj-dark-css');
        if (link) link.remove();

        const antiFlash = document.getElementById('oj-anti-flash');
        if (antiFlash) antiFlash.remove();
    }

    // 立即执行判断！
    if (shouldEnableDark(savedTheme)) {
        enableDarkCSS();
    }


    // =========================================================
    // 第二阶段：UI 渲染 (等待页面加载)
    // 因为这时候页面还没加载完，找不到搜索框，所以要等 DOMContentLoaded
    // =========================================================

    function initUI() {
        // 防止重复初始化
        if (document.getElementById('oj-mode-switch')) return;

        // 创建容器
        const switchContainer = document.createElement('div');
        switchContainer.id = 'oj-mode-switch';

        // 创建下拉框
        const select = document.createElement('select');
        select.id = 'oj-mode-select';
        select.innerHTML = `
            <option value="light">亮色</option>
            <option value="system">系统</option>
            <option value="dark">暗色</option>
        `;
        select.value = savedTheme;
        switchContainer.appendChild(select);

        // 插入到页面
        const searchBox = document.querySelector('.practice-search');
        if (searchBox) {
            searchBox.parentNode.insertBefore(switchContainer, searchBox);
        }

        // 监听切换事件
        select.addEventListener('change', (e) => {
            const newTheme = e.target.value;
            localStorage.setItem('oj-theme-pref', newTheme);

            if (shouldEnableDark(newTheme)) {
                enableDarkCSS();
            } else {
                disableDarkCSS();
            }
        });
    }

    // 监听 DOM 加载完成事件
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUI);
    } else {
        initUI();
    }

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('oj-theme-pref') === 'system') {
            e.matches ? enableDarkCSS() : disableDarkCSS();
        }
    });

})();