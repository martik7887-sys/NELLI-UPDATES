// ==UserScript==
// @name         Prompt Softener + Style Library
// @namespace    nelly
// @version      2.0
// @description  Кнопки смягчителя и библиотеки стилей
// @match        https://shedevrum.ai/*
// @grant        none
// @updateURL    https://cdn.jsdelivr.net/gh/martik7887-sys/NELLI-UPDATES@main/Prompt-Softener-Style-Library.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/martik7887-sys/NELLI-UPDATES@main/Prompt-Softener-Style-Library.user.js
// ==/UserScript==

(function () {
    'use strict';

    function addButton(id, text, url, bottom) {
        if (document.getElementById(id)) return;

        const button = document.createElement('button');
        button.id = id;
        button.textContent = text;

        Object.assign(button.style, {
            position: 'fixed',
            right: '20px',
            bottom: bottom,
            zIndex: '999999',
            padding: '12px 18px',
            border: 'none',
            borderRadius: '24px',
            background: '#a78bfa',
            color: '#171322',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 16px #0005'
        });

        button.addEventListener('click', function () {
            window.open(url, '_blank');
        });

        document.body.appendChild(button);
    }

    function init() {
        addButton(
            'softener-button',
            '✨ Смягчитель промптов',
            'https://my-stile.neocities.org/1',
            '90px'
        );

        addButton(
            'style-library-button',
            '🎨 Библиотека стилей',
            'https://my-stile.neocities.org/',
            '30px'
        );
    }

    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
