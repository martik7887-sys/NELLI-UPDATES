// ==UserScript==
// @name         Nelli Studio
// @namespace    https://nelli.studio/
// @version      0.4.6
// @updateURL    https://cdn.jsdelivr.net/gh/martik7887-sys/NELLI-UPDATES@main/Nelli-Studio.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/martik7887-sys/NELLI-UPDATES@main/Nelli-Studio.user.js
// @description  Независимая студия видео и музыки для работы рядом с Шедеврумом
// @match        https://shedevrum.ai/*
// @grant        GM_xmlhttpRequest
// @connect      cdn.jsdelivr.net
// @connect      unpkg.com
// @run-at       document-idle
// @noframes
// ==/UserScript==

(() => {
  'use strict';
  if (document.getElementById('nelli-studio')) return;

  const root = document.createElement('div');
  root.id = 'nelli-studio';
  const shadow = root.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <button id="ns-launch" disabled>⏳ ПОДГОТОВКА NELLI STUDIO</button>
    <section id="ns-app" hidden>
      <header><div class="brand"><b>✦ NELLI STUDIO</b><small>VIDEO · AUDIO WORKSPACE</small></div>
        <div class="head-right"><span>● LOCAL WORKSPACE</span><button id="ns-close">×</button></div></header>
      <div class="layout">
        <nav>
          <button class="tab active" data-tab="video">▣ <span>Video Lab</span></button>
          <button class="tab" data-tab="music">♫ <span>Music Lab</span></button>
          <button class="tab" data-tab="sound">≋ <span>Sound Studio</span></button>
          <button class="tab" data-tab="extend">✧ <span>Clip Extend</span></button>
          <button class="tab" data-tab="projects">▤ <span>Projects</span></button>
          <button class="tab" data-tab="export">⇩ <span>Export Studio</span></button>
          <small>VERSION 0.4.6</small>
        </nav>
        <main>
          <section class="page" data-page="video">
            <div class="pagehead"><div><label>МОНТАЖ И ПОДГОТОВКА</label><h1>Video Lab</h1><p>Импорт, проверка, предпросмотр и выбор фрагмента.</p></div><button class="primary" id="pick-video">＋ Добавить видео</button><input id="video-file" type="file" accept="video/*" hidden></div>
            <div class="grid">
              <article><div class="caption"><b>ПРЕДПРОСМОТР</b><span id="video-status">ФАЙЛ НЕ ВЫБРАН</span></div>
                <div class="preview" id="preview"><div class="empty"><strong>▣</strong><b>Здесь появится видео</b><small>Выбери видеофайл для начала работы</small></div><video id="video" controls playsinline hidden></video></div>
                <div class="times"><span id="now">00:00.00</span><span id="duration">00:00.00</span></div>
              </article>
              <article><div class="caption"><b>СВОЙСТВА ФАЙЛА</b><span>●</span></div><p class="filename" id="filename">Файл не выбран</p>
                <div class="meta"><div><small>РАЗРЕШЕНИЕ</small><b id="resolution">—</b></div><div><small>ДЛИТЕЛЬНОСТЬ</small><b id="meta-duration">—</b></div><div><small>ТИП ФАЙЛА</small><b id="mime">—</b></div><div><small>РАЗМЕР</small><b id="size">—</b></div></div>
                <p class="note">FPS и кодек пока не считываются. Браузер проверяет возможность открыть файл.</p><button class="danger" id="remove-video" disabled>Удалить видео из проекта</button>
              </article>
            </div>
            <article class="timeline"><div class="caption"><b>ВЫБОР ФРАГМЕНТА</b><span id="range-label">00:00.00 — 00:00.00</span></div>
              <div class="sliders"><label>НАЧАЛО <input id="in" type="range" min="0" max="0" step=".01" value="0" disabled></label><label>КОНЕЦ <input id="out" type="range" min="0" max="0" step=".01" value="0" disabled></label></div>
              <div class="numbers"><label>Начало, сек. <input id="in-num" type="number" min="0" step=".01" value="0" disabled></label><label>Конец, сек. <input id="out-num" type="number" min="0" step=".01" value="0" disabled></label><button id="reset" class="textbtn" disabled>Сбросить границы</button></div>
              <p class="note">Здесь задаётся диапазон основного видео. Дополнительные клипы можно добавить ниже и расположить в нужном порядке.</p>
            </article>
            <article class="timeline clips-card">
              <div class="caption"><b>ДОПОЛНИТЕЛЬНЫЕ КЛИПЫ</b><button class="outline" id="pick-clips">＋ Добавить клипы</button><input id="clip-files" type="file" accept="video/*" multiple hidden></div>
              <div id="clip-list" class="clip-list"><div class="emptylist">Дополнительных клипов пока нет.</div></div>
              <div class="clip-actions"><button class="outline" id="capture-frame">Сохранить текущий кадр</button><button class="danger" id="remove-frame" disabled>Удалить кадр</button><button class="danger" id="clear-temp">Очистить временные файлы</button><button class="danger" id="discard-missing-clips" hidden>Исключить отсутствующие клипы</button><label class="muted-status">Длительность заставки, сек. <input id="intro-duration" type="number" min="0.5" max="15" step="0.5" value="2" style="width:65px"></label><span id="cache-status" class="muted-status">Временный кэш пуст</span></div>
            </article>
            <div class="bottom"><div><b>Следующий шаг</b><small>Подготовка обработанного ролика для Шедеврума</small></div><button class="outline" id="open-shedevrum">Открыть Шедеврум ↗</button></div>
          </section>
          <section class="page" data-page="music" hidden>
            <div class="pagehead"><div><label>МУЗЫКАЛЬНАЯ БИБЛИОТЕКА</label><h1>Music Lab</h1><p>Добавление и прослушивание аудиофайлов.</p></div><button class="primary" id="pick-audio">＋ Добавить аудио</button><input id="audio-files" type="file" accept="audio/*" multiple hidden></div>
            <article class="music"><div class="disc">♫</div><div class="trackinfo"><b id="track-title">Композиция не выбрана</b><small id="track-subtitle">Добавь аудиофайл</small><audio id="audio" controls></audio></div></article>
            <div class="caption library-caption"><b>МОЯ БИБЛИОТЕКА</b><span id="track-count">0 композиций</span></div>
            <div id="library-status" class="library-status" role="status">Подключение локальной библиотеки…</div>
            <div id="tracks" class="tracks"><div class="emptylist">Здесь пока нет композиций.</div></div>
            <p class="note">Аудиофайлы хранятся локально в IndexedDB этого браузера. Они не отправляются на сервер. Очистка данных сайта или браузера может удалить библиотеку.</p>
          </section>
          <section class="page" data-page="sound" hidden>
            <div class="pagehead"><div><label>СВЕДЕНИЕ ДОРОЖЕК</label><h1>Sound Studio</h1><p>Предпрослушивание микса оригинального звука и музыки.</p></div></div>
            <article class="mix-card">
              <div class="caption"><b>ИСТОЧНИКИ ЗВУКА</b><span id="mix-status">МИКШЕР НЕ ЗАПУЩЕН</span></div>
              <div class="mix-track">
                <div class="mix-track-head"><b>Оригинальный звук видео</b><span id="video-audio-state">ВИДЕО НЕ ЗАГРУЖЕНО</span></div>
                <label class="mix-volume">Громкость <output id="video-gain-value">100%</output><input id="video-gain" type="range" min="0" max="150" value="100" step="1"></label>
                <label class="mix-check"><input id="video-mute" type="checkbox"> Выключить оригинальный звук</label>
              </div>
              <div class="mix-track">
                <div class="mix-track-head"><b>Музыкальная дорожка</b><span id="music-audio-state">ТРЕК НЕ ВЫБРАН</span></div>
                <select id="mix-track-select"><option value="">Выбери композицию из библиотеки</option></select>
                <label class="mix-volume">Громкость <output id="music-gain-value">70%</output><input id="music-gain" type="range" min="0" max="150" value="70" step="1"></label>
                <label class="mix-check"><input id="music-mute" type="checkbox"> Выключить музыку</label>
              </div>
              <div class="mix-fades">
                <label>Плавное появление, сек.<input id="fade-in" type="number" min="0" max="30" step=".5" value="1"></label>
                <label>Плавное затухание, сек.<input id="fade-out" type="number" min="0" max="30" step=".5" value="2"></label>
              </div>
              <div class="eq-panel"><b>ЭКВАЛАЙЗЕР МУЗЫКИ</b>
                <label>Низкие <output id="eq-low-value">0 dB</output><input id="eq-low" type="range" min="-12" max="12" step="1" value="0"></label>
                <label>Средние <output id="eq-mid-value">0 dB</output><input id="eq-mid" type="range" min="-12" max="12" step="1" value="0"></label>
                <label>Высокие <output id="eq-high-value">0 dB</output><input id="eq-high" type="range" min="-12" max="12" step="1" value="0"></label>
              </div>
              <div class="mix-actions"><button class="primary" id="mix-play">▶ Прослушать микс</button><button class="outline" id="mix-stop">■ Остановить</button></div>
              <p class="note">Это предпрослушивание сведённого звука. В Export Studio тот же баланс, эквалайзер и затухания применяются к финальному MP4.</p>
              <div id="mix-message" class="library-status" role="status">Загрузи видео в Video Lab и выбери музыку из библиотеки.</div>
            </article>
          </section>
          <section class="page" data-page="extend" hidden><div class="pagehead"><div><label>ГЕНЕРАЦИЯ ПРОДОЛЖЕНИЯ</label><h1>Clip Extend</h1><p>Подготовка монтажного продолжения.</p></div></div><div class="placeholder"><strong>✧</strong><h2>Генерация новых сцен не подключена</h2><p>Этот модуль может подготовить монтаж, но не генерирует новые кадры. Для генерации понадобится отдельная видеомодель или сервис.</p></div></section>
          <section class="page" data-page="projects" hidden>
            <div class="pagehead"><div><label>ЛОКАЛЬНЫЕ ПРОЕКТЫ</label><h1>Projects</h1><p>Сохранение и восстановление монтажа в этом браузере.</p></div><div class="project-head-actions"><button class="outline" id="new-project">＋ Новый проект</button><button class="primary" id="save-project">Сохранить проект</button></div></div>
            <div id="project-status" class="library-status" role="status">Загрузка проектов…</div>
            <div id="project-list" class="project-list"><div class="emptylist">Сохранённых проектов пока нет.</div></div>
          </section>
          <section class="page" data-page="export" hidden>
            <div class="pagehead"><div><label>ФИНАЛЬНЫЙ РЕНДЕР</label><h1>Export Studio</h1><p>Сборка MP4 из основного видео, клипов и музыкальной дорожки.</p></div></div>
            <article class="export-card">
              <div class="export-grid">
                <label>Разрешение<select id="export-size"><option value="720">720p</option><option value="1080" selected>1080p</option><option value="540">540p</option></select></label>
                <label>Ориентация<select id="export-orientation"><option value="vertical" selected>Вертикальная 9:16</option><option value="horizontal">Горизонтальная 16:9</option></select></label>
                <label>Кадрирование<select id="export-fit"><option value="contain" selected>Вписать целиком</option><option value="cover">Заполнить кадр</option></select></label>
                <label>Переходы<select id="export-transition"><option value="cut">Обычная склейка</option><option value="fade" selected>Плавное растворение</option><option value="wipeleft">Стирание слева</option><option value="slideleft">Сдвиг влево</option><option value="dissolve">Растворение</option></select></label>
                <label>Частота кадров<select id="export-fps"><option>24</option><option selected>30</option><option>60</option></select></label>
                <label>Качество<select id="export-quality"><option value="23">Высокое</option><option value="28" selected>Стандартное</option><option value="32">Компактное</option></select></label>
                <label>Музыка<select id="export-music"><option value="">Без музыки</option></select></label>
              </div>
              <div class="export-grid export-gains">
                <label>Эквалайзер НЧ, dB<input id="export-eq-low" type="number" min="-12" max="12" value="0"></label>
                <label>Эквалайзер СЧ, dB<input id="export-eq-mid" type="number" min="-12" max="12" value="0"></label>
                <label>Эквалайзер ВЧ, dB<input id="export-eq-high" type="number" min="-12" max="12" value="0"></label>
                <label>Оригинальный звук, %<input id="export-video-gain" type="number" min="0" max="150" value="100"></label>
                <label>Музыка, %<input id="export-music-gain" type="number" min="0" max="150" value="70"></label>
                <label>Fade in, сек.<input id="export-fade-in" type="number" min="0" max="30" step=".5" value="1"></label>
                <label>Fade out, сек.<input id="export-fade-out" type="number" min="0" max="30" step=".5" value="2"></label>
              </div>
              <div class="export-actions"><button class="primary" id="render-video">Собрать MP4</button><button class="outline" id="cancel-render" disabled>Отменить</button></div>
              <progress id="render-progress" max="100" value="0"></progress>
              <div id="render-status" class="library-status" role="status">Экспорт ещё не запускался.</div>
              <div id="render-result" class="render-result"></div>
              <p class="note">При первом экспорте FFmpeg.wasm загружается из CDN. Интернет нужен для движка; видео и музыка обрабатываются локально в браузере и не отправляются на сервер. Большие проекты требуют свободной памяти.</p>
            </article>
          </section>
        </main>
      </div>
      <footer><span>● NELLI STUDIO</span><span>НЕЗАВИСИМЫЙ ИНСТРУМЕНТ · НЕ ЧАСТЬ ШЕДЕВРУМА</span></footer>
    </section>`;
  document.body.appendChild(root);

  const css = document.createElement('style');
  css.textContent = `
  :host{font:13px Arial,sans-serif;color:#e5f6f3;color-scheme:dark} :host *{box-sizing:border-box}
  #ns-app *{scrollbar-width:thin;scrollbar-color:#38d8c8 #101719}
  #ns-app *::-webkit-scrollbar{width:9px;height:9px}
  #ns-app *::-webkit-scrollbar-track{background:#101719}
  #ns-app *::-webkit-scrollbar-thumb{background:#35cdbf;border:2px solid #101719;border-radius:9px}
  #ns-app *::-webkit-scrollbar-thumb:hover{background:#68f0e2}
  .library-status{margin:8px 0;padding:8px 10px;border:1px solid #284541;border-radius:7px;background:#101a1c;color:#80aaa3;font-size:10px}
  .library-status.error{border-color:#75494b;color:#e0a5a5}
  .mix-card{background:#152124;border:1px solid #284541;border-radius:10px;padding:14px}
  .mix-track{margin-top:13px;padding:13px;background:#101a1c;border:1px solid #294642;border-radius:8px}
  .mix-track-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px}
  .mix-track-head b{font-size:12px;color:#d6ece7}.mix-track-head span{font-size:8px;letter-spacing:1px;color:#62cfc2}
  .mix-volume{display:grid;grid-template-columns:1fr auto;gap:7px;color:#8eaaa4;font-size:10px}
  .mix-volume output{color:#67e5d5;font-variant-numeric:tabular-nums}
  .mix-volume input{grid-column:1/-1;width:100%;accent-color:#43e1cf}
  .mix-check{display:flex;align-items:center;gap:7px;margin-top:9px;color:#89a7a1;font-size:10px}
  .mix-check input{accent-color:#43e1cf}
  #mix-track-select{width:100%;margin:0 0 12px;padding:9px;background:#0c1719;border:1px solid #31524e;border-radius:6px;color:#dff4ef}
  .mix-fades{display:flex;gap:12px;flex-wrap:wrap;margin-top:13px}
  .mix-fades label{color:#8eaaa4;font-size:10px}
  .mix-fades input{display:block;width:110px;margin-top:5px;padding:7px;background:#0c1719;border:1px solid #31524e;border-radius:5px;color:#e3f5f0}
  .mix-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}
  .eq-panel{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px;padding:12px;background:#101a1c;border:1px solid #294642;border-radius:8px}
  .eq-panel>b{grid-column:1/-1;color:#7eb6ad;font-size:9px;letter-spacing:1px}
  .eq-panel label{display:grid;grid-template-columns:1fr auto;gap:6px;color:#8eaaa4;font-size:10px}
  .eq-panel output{color:#67e5d5;font-variant-numeric:tabular-nums}
  .eq-panel input{grid-column:1/-1;width:100%;accent-color:#43e1cf}
  .mix-actions button:disabled{opacity:.4;cursor:not-allowed}
  .clip-list,.project-list{display:flex;flex-direction:column;gap:7px;margin-top:12px}
  .project-head-actions{display:flex;gap:8px;flex-wrap:wrap}
  .clip-row,.project-row{display:flex;align-items:center;gap:9px;padding:10px;background:#101a1c;border:1px solid #294642;border-radius:7px}
  .clip-row b,.project-row b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}
  .clip-row small,.project-row small{color:#779892;font-size:9px}
  .clip-row button,.project-row button{background:#173c38;border:1px solid #32756c;color:#8beadd;border-radius:5px;padding:6px 9px;font-size:10px;cursor:pointer}
  .clip-row button.danger-mini,.project-row button.danger-mini{background:#321f21;border-color:#75494b;color:#e1a4a5}
  .clip-actions,.export-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:12px}
  .muted-status{color:#72928c;font-size:10px}
  .export-card{padding:15px;background:#152124;border:1px solid #284541;border-radius:10px}
  .export-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:13px}
  .export-grid label{display:flex;flex-direction:column;gap:6px;color:#8eaaa4;font-size:10px}
  .export-grid input,.export-grid select{width:100%;min-width:0;padding:8px;background:#0c1719;border:1px solid #31524e;border-radius:5px;color:#e3f5f0}
  #render-progress{width:100%;height:12px;margin-top:14px;accent-color:#43e1cf}
  .render-result video{width:100%;max-height:260px;margin-top:10px;background:#050809}
  .render-result a{display:inline-block;margin-top:10px;color:#75eadc}
  #render-video:disabled{opacity:.4;cursor:not-allowed}
  @media(max-width:800px){.export-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}

  .trackrow .track-meta{min-width:0;flex:1}
  .trackrow .track-meta b{display:block}
  .trackrow .track-meta small{display:block;color:#7d9c97;font-size:9px;margin-top:4px}
  #ns-launch{position:fixed;right:22px;bottom:26px;z-index:2147483000;border:1px solid #39dfce;border-radius:28px;padding:13px 19px;background:#102a2b;color:#79f5e6;font-weight:bold;letter-spacing:1px;cursor:pointer;box-shadow:0 0 20px #21d8c455}
  #ns-launch:disabled{opacity:.65;cursor:wait}
  #ns-app{position:fixed;z-index:2147482999;right:18px;bottom:80px;width:min(1080px,calc(100vw - 36px));height:min(760px,calc(100vh - 100px));min-height:470px;background:#101719;border:1px solid #28615e;border-radius:15px;box-shadow:0 18px 65px #000c,0 0 24px #21d8c422;overflow:hidden}
  #ns-app[hidden],:host [hidden]{display:none!important}
  #ns-app header{height:62px;background:#111e20;border-bottom:1px solid #25423f;display:flex;align-items:center;justify-content:space-between;padding:0 19px}
  .brand b{display:block;letter-spacing:2px}.brand small{display:block;color:#719794;font-size:9px;letter-spacing:1.5px;margin-top:4px}.head-right{display:flex;align-items:center;gap:15px;color:#76a09a;font-size:9px}.head-right button{background:#172829;border:1px solid #315552;color:#bce8e1;border-radius:6px;width:28px;height:27px;font-size:18px;cursor:pointer}
  .layout{height:calc(100% - 91px);display:flex}.layout nav{width:175px;flex:0 0 175px;background:#111d1f;border-right:1px solid #25423f;padding:16px 10px;display:flex;flex-direction:column;gap:7px}.tab{height:42px;text-align:left;padding:0 12px;border:1px solid transparent;border-radius:7px;background:none;color:#91aaa6;cursor:pointer}.tab span{margin-left:9px;font-size:12px}.tab.active{color:#69efdf;background:#183332;border-color:#2b6e67;box-shadow:inset 3px 0 #3de1cf}.layout nav>small{margin:auto 8px 5px;color:#547672;font-size:9px}
  .layout main{padding:22px 24px;overflow:auto;flex:1;min-width:0;background:radial-gradient(ellipse at 90% 0%,#18312f55,transparent 40%),#101719}.pagehead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px}.pagehead label{font-size:9px;letter-spacing:2px;color:#4bd2c3}.pagehead h1{font-size:25px;margin:6px 0}.pagehead p{margin:0;color:#87a39f;font-size:11px}.primary,.outline{border:1px solid #36cabb;border-radius:7px;padding:10px 13px;background:#174d49;color:#8bf4e8;font-weight:bold;font-size:11px;cursor:pointer}.outline{background:#142628}
  .grid{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(205px,.8fr);gap:13px}.grid article,.timeline,.bottom,.music,.placeholder{background:#152124;border:1px solid #284541;border-radius:10px;padding:13px}.caption{display:flex;justify-content:space-between;align-items:center;color:#a9c9c3;font-size:9px;letter-spacing:1.2px}.caption span{color:#55c9bb;font-size:9px}.preview{height:270px;background:#080d0e;border:1px solid #29403d;border-radius:7px;margin-top:11px;display:flex;align-items:center;justify-content:center;overflow:hidden}.preview video{width:100%;height:100%;object-fit:contain;background:#050809}.empty{text-align:center;display:flex;align-items:center;flex-direction:column;gap:8px;color:#789894}.empty strong{font-size:34px;color:#45dcca}.empty b{font-size:12px;color:#c3dfda}.empty small{font-size:10px}.times{display:flex;justify-content:space-between;color:#8ca9a3;font-size:10px;margin-top:8px;font-variant-numeric:tabular-nums}.filename{margin:18px 0 14px;color:#d5ece8;overflow-wrap:anywhere;font-size:12px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:16px 8px}.meta small{display:block;color:#688b85;font-size:8px;letter-spacing:1px;margin-bottom:5px}.meta b{font-size:11px}.note{font-size:10px;line-height:1.55;color:#77938f;margin:14px 0 0}.danger{margin-top:13px;background:transparent;border:1px solid #75494b;color:#d89b9d;border-radius:6px;padding:7px 9px;font-size:10px;cursor:pointer}.danger:disabled{opacity:.35}
  .timeline{margin-top:13px}.sliders{display:flex;gap:20px;margin:19px 0 12px}.sliders label{flex:1;color:#7d9e99;font-size:9px}.sliders input{display:block;width:100%;accent-color:#43e1cf;margin-top:8px}.numbers{display:flex;align-items:end;gap:15px;flex-wrap:wrap}.numbers label{font-size:9px;color:#7e9e99}.numbers input{display:block;width:100px;margin-top:5px;padding:7px;background:#0c1719;border:1px solid #31524e;border-radius:5px;color:#e3f5f0}.textbtn{background:none;border:0;color:#61dccc;font-size:10px;cursor:pointer}.bottom{margin-top:13px;display:flex;align-items:center;justify-content:space-between}.bottom b{font-size:11px}.bottom small{display:block;margin-top:5px;color:#789994;font-size:9px}
  .music{display:flex;align-items:center;gap:14px}.disc{width:55px;height:55px;border-radius:9px;background:linear-gradient(140deg,#205b55,#102b2b);display:grid;place-items:center;color:#5ce9d8;font-size:28px}.trackinfo{flex:1;min-width:0}.trackinfo b,.trackinfo small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.trackinfo small{color:#7d9c97;font-size:10px;margin-top:4px}.trackinfo audio{display:block;width:100%;height:31px;margin-top:7px}.library-caption{margin:20px 0 9px}.tracks{display:flex;flex-direction:column;gap:7px}.trackrow{display:flex;align-items:center;gap:9px;padding:10px;background:#152124;border:1px solid #284541;border-radius:7px}.trackrow b{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}.trackrow button{background:#173c38;border:1px solid #32756c;color:#8beadd;border-radius:5px;padding:6px 9px;font-size:10px;cursor:pointer}.emptylist{text-align:center;padding:25px;border:1px dashed #31514e;border-radius:8px;color:#78938f;font-size:11px}
  .placeholder{min-height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px}.placeholder strong{font-size:38px;color:#4be1d0;text-shadow:0 0 15px #39d7c8}.placeholder h2{font-size:15px;margin:13px 0 7px}.placeholder p{max-width:480px;color:#85a29d;font-size:11px;line-height:1.7;margin:0}
  #ns-app footer{height:29px;background:#0d1517;border-top:1px solid #203936;display:flex;justify-content:space-between;align-items:center;padding:0 14px;color:#55736e;font-size:8px;letter-spacing:1px}
  @media(max-width:680px){#ns-app{right:6px;bottom:70px;width:calc(100vw - 12px);height:calc(100vh - 82px)}.layout nav{width:53px;flex-basis:53px;padding:10px 5px}.tab{text-align:center;padding:0;font-size:16px}.tab span{display:none}.layout main{padding:13px 10px}.grid{grid-template-columns:1fr}.preview{height:215px}.pagehead h1{font-size:21px}.head-right>span{display:none}.bottom{align-items:flex-start;flex-direction:column}}
  `;
  shadow.appendChild(css);

  const $ = s => shadow.querySelector(s);
  const launch = $('#ns-launch'), app = $('#ns-app');
  launch.onclick = () => app.hidden = !app.hidden;
  $('#ns-close').onclick = () => app.hidden = true;
  shadow.querySelectorAll('.tab').forEach(b => b.onclick = () => {
    shadow.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === b));
    shadow.querySelectorAll('.page').forEach(p => p.hidden = p.dataset.page !== b.dataset.tab);
  });

  const video = $('#video'); let videoURL = null; let videoMetadataReady = false; let projectMetadataHandler = null;
  const time = n => { if (!Number.isFinite(n)) return '00:00.00'; return String(Math.floor(n/60)).padStart(2,'0')+':'+(n%60).toFixed(2).padStart(5,'0'); };
  const sizeText = n => n < 1048576 ? (n/1024).toFixed(1)+' KB' : (n/1048576).toFixed(2)+' MB';
  const a = $('#in'), b = $('#out'), an = $('#in-num'), bn = $('#out-num');
  function range(x,y){
    const d = Number.isFinite(video.duration) ? video.duration : 0;
    x = Number.isFinite(Number(x)) ? Number(x) : 0;
    y = Number.isFinite(Number(y)) ? Number(y) : d;
    x = Math.max(0, Math.min(x, d));
    y = Math.max(x, Math.min(y, d));
    a.value = an.value = String(x);
    b.value = bn.value = String(y);
    $('#range-label').textContent = time(x) + ' — ' + time(y);
  }
  function clearVideo(){
    stopMix();mainVideoBlob=null;videoMetadataReady=false;
    if(projectMetadataHandler){video.removeEventListener('loadedmetadata',projectMetadataHandler);projectMetadataHandler=null;}
    video.pause();video.onloadedmetadata=null;video.onerror=null;video.removeAttribute('src');video.load();if(videoURL)URL.revokeObjectURL(videoURL);videoURL=null;
    video.hidden=true;$('#preview .empty').hidden=false;$('#video-status').textContent='ФАЙЛ НЕ ВЫБРАН';$('#filename').textContent='Файл не выбран';
    ['resolution','meta-duration','mime','size'].forEach(id=>$('#'+id).textContent='—');$('#duration').textContent='00:00.00';$('#now').textContent='00:00.00';
    [a,b,an,bn,$('#reset')].forEach(x=>x.disabled=true);$('#remove-video').disabled=true;$('#range-label').textContent='00:00.00 — 00:00.00';$('#video-audio-state').textContent='ВИДЕО НЕ ЗАГРУЖЕНО';
  }
  function loadVideo(file){
    if(!file||!file.type.startsWith('video/')){alert('Выбери видеофайл.');return;}clearVideo();videoURL=URL.createObjectURL(file);video.src=videoURL;video.hidden=false;$('#preview .empty').hidden=true;
    $('#filename').textContent=file.name;$('#mime').textContent=file.type||'не определён';$('#size').textContent=sizeText(file.size);$('#video-status').textContent='ЧТЕНИЕ ФАЙЛА…';
    video.onloadedmetadata=()=>{
      const d = video.duration;
      if (!Number.isFinite(d) || d <= 0 || !video.videoWidth || !video.videoHeight) {
        $('#video-status').textContent = 'НЕКОРРЕКТНЫЕ МЕТАДАННЫЕ';
        $('#remove-video').disabled = false;
        return;
      }
      videoMetadataReady=true;
      $('#resolution').textContent = video.videoWidth + ' × ' + video.videoHeight;
      $('#meta-duration').textContent = time(d);
      $('#duration').textContent = time(d);
      $('#video-status').textContent = 'ФАЙЛ ПРОЧИТАН';
      [a,b,an,bn,$('#reset')].forEach(x=>x.disabled=false);
      [a,b,an,bn].forEach(x=>x.max=d);
      range(0,d);
      $('#remove-video').disabled=false;
    };
    video.onerror=()=>{
      videoMetadataReady=false;
      $('#video-status').textContent='ОШИБКА ЧТЕНИЯ';
      $('#remove-video').disabled = false;
      alert('Браузер не смог открыть файл. Проверь контейнер и кодек.');
    };
  }
  $('#pick-video').onclick=()=>$('#video-file').click();$('#video-file').onchange=e=>{const file=e.target.files&&e.target.files[0];e.target.value='';if(file)loadVideo(file);};$('#remove-video').onclick=async()=>{const btn=$('#remove-video');const previous=mainVideoBlob;btn.disabled=true;clearVideo();sessionMissingMain=null;markProjectDirty();try{await deleteTemp('active-video');setCacheStatus('Основное видео удалено из редактора и временного кэша.');}catch(e){if(previous)loadVideo(previous,{persist:false});btn.disabled=false;markProjectDirty();setCacheStatus('Удаление не подтверждено базой. Видео восстановлено в редакторе: '+e.message,true);}};
  a.oninput=()=>{let x=+a.value,y=+b.value;if(x>y){y=x;b.value=y;}range(x,y);markProjectDirty();};b.oninput=()=>{let x=+a.value,y=+b.value;if(y<x){x=y;a.value=x;}range(x,y);markProjectDirty();};
  an.onchange=()=>{let x=+an.value,y=+bn.value;if(x>y)y=x;range(x,y);markProjectDirty();};bn.onchange=()=>{let x=+an.value,y=+bn.value;if(y<x)x=y;range(x,y);markProjectDirty();};
  $('#reset').onclick=()=>{range(0,video.duration||0);markProjectDirty();};video.ontimeupdate=()=>$('#now').textContent=time(video.currentTime);
  $('#open-shedevrum').onclick=()=>window.open('https://shedevrum.ai/','_blank','noopener');


  // Persistent music library (IndexedDB)
  const DB_NAME = 'NelliStudioDB';
  const DB_VERSION = 2;
  const STORE = 'music';
  const TEMP_STORE = 'tempCache';
  const PROJECT_STORE = 'projects';
  const CACHE_TTL = 24 * 60 * 60 * 1000;
  const CACHE_LIMIT = 750 * 1024 * 1024;
  const MAX_EXTRA_CLIPS = 8;
  let clips = [];
  let firstFrameBlob = null;
  let firstFrameStamp = null;
  let frameCaptureEpoch = 0;
  let sessionSaveTimer = null;
  let sessionMissingMain = null;
  let sessionMissingFrame = null;
  let sessionMissingClipIds = [];
  let clipOrderBusy = false;
  let projectLoading = false;
  let activeProjectId = null;
  let activeProjectName = null;
  let projectRevision = 0;
  let activeProjectSavedRevision = null;
  let sessionProjectConflict = false;
  let renderEngine = null;
  let mainVideoBlob = null;
  let editorEpoch = 0;
  let tempEpoch = 0;
  const tempQueues = new Map();
  let tempMutationQueue = Promise.resolve();
  const tempKeyRevisions = new Map();
  const projectQueues = new Map();
  let tempClearing = false;
  let currentLibraryTrackId = null;
  let audioTrackId = null;
  let renderCancelled = false;
  let renderAbortController = null;
  let ffmpegLogBuffer = [];
  let ffmpegLogTotal = 0;
  const logSince = mark => { const n = Math.max(0, ffmpegLogTotal - mark); return n ? ffmpegLogBuffer.slice(-n) : []; };
  let renderedBlob = null;
  let renderedFromRevision = null;
  let renderedForProjectId = null;
  let renderedURL = null;

  let db = null;
  let tracks = [];
  let audioURL = null;
  const audio = $('#audio');
  const libraryStatus = $('#library-status');

  // Web Audio mixer: preview-only routing for the video and selected music track.
  let mixContext = null;
  let videoSourceNode = null;
  let musicSourceNode = null;
  let videoGainNode = null;
  let musicGainNode = null;
  let eqLowNode = null, eqMidNode = null, eqHighNode = null;
  let mixReady = false;
  let selectedMixTrackId = '';
  let mixStartedAt = 0;

  function setMixMessage(message, isError = false) {
    const el = $('#mix-message');
    if (!el) return;
    el.textContent = message;
    el.classList.toggle('error', isError);
  }

  function setMixStatus(message) {
    const el = $('#mix-status');
    if (el) el.textContent = message;
  }

  function ensureMixGraph() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error('Web Audio API не поддерживается этим браузером.');
    if (!mixContext) mixContext = new AudioCtx();
    if (!videoSourceNode) {
      videoSourceNode = mixContext.createMediaElementSource(video);
      videoGainNode = mixContext.createGain();
      videoSourceNode.connect(videoGainNode).connect(mixContext.destination);
    }
    if (!musicSourceNode) {
      musicSourceNode = mixContext.createMediaElementSource(audio);
      eqLowNode=mixContext.createBiquadFilter();eqLowNode.type='lowshelf';eqLowNode.frequency.value=160;
      eqMidNode=mixContext.createBiquadFilter();eqMidNode.type='peaking';eqMidNode.frequency.value=1000;eqMidNode.Q.value=0.8;
      eqHighNode=mixContext.createBiquadFilter();eqHighNode.type='highshelf';eqHighNode.frequency.value=6000;
      musicGainNode = mixContext.createGain();
      musicSourceNode.connect(eqLowNode).connect(eqMidNode).connect(eqHighNode).connect(musicGainNode).connect(mixContext.destination);
    }
    mixReady = true;
    applyMixGains();
    return mixContext;
  }

  function applyMusicEQ() {
    const values={low:Number($('#eq-low').value)||0,mid:Number($('#eq-mid').value)||0,high:Number($('#eq-high').value)||0};
    $('#eq-low-value').textContent=`${values.low} dB`;$('#eq-mid-value').textContent=`${values.mid} dB`;$('#eq-high-value').textContent=`${values.high} dB`;
    if(mixReady&&mixContext){eqLowNode.gain.setTargetAtTime(values.low,mixContext.currentTime,.02);eqMidNode.gain.setTargetAtTime(values.mid,mixContext.currentTime,.02);eqHighNode.gain.setTargetAtTime(values.high,mixContext.currentTime,.02);}
  }
  function applyMixGains() {
    const vg = $('#video-mute').checked ? 0 : Number($('#video-gain').value) / 100;
    const mg = $('#music-mute').checked ? 0 : Number($('#music-gain').value) / 100;
    $('#video-gain-value').textContent = `${$('#video-gain').value}%`;
    $('#music-gain-value').textContent = `${$('#music-gain').value}%`;
    applyMusicEQ();
    if (!mixReady || !mixContext) return;
    videoGainNode.gain.setTargetAtTime(vg, mixContext.currentTime, 0.015);
    musicGainNode.gain.setTargetAtTime(mg, mixContext.currentTime, 0.015);
  }

  function updateFadeEnvelope() {
    if (!mixReady || !mixContext || video.paused || !audio.src) return;
    const start = Math.max(0, Number(a.value) || 0);
    const end = Math.max(start, Number(b.value) || 0);
    const current = video.currentTime;
    const fadeIn = Math.max(0, Math.min(30, Number($('#fade-in').value) || 0));
    const fadeOut = Math.max(0, Math.min(30, Number($('#fade-out').value) || 0));
    const fadeInFactor = fadeIn > 0 ? Math.min(1, Math.max(0, (current - start) / fadeIn)) : 1;
    const remaining = end - current;
    const fadeOutFactor = fadeOut > 0 ? Math.min(1, Math.max(0, remaining / fadeOut)) : 1;
    const base = $('#music-mute').checked ? 0 : Number($('#music-gain').value) / 100;
    musicGainNode.gain.setTargetAtTime(base * Math.min(fadeInFactor, fadeOutFactor), mixContext.currentTime, 0.04);
  }

  function refreshMixTrackOptions() {
    const select = $('#mix-track-select');
    if (!select) return;
    const previous = selectedMixTrackId;
    select.replaceChildren();
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = tracks.length ? 'Выбери композицию из библиотеки' : 'Сначала добавь музыку в Music Lab';
    select.append(empty);
    tracks.forEach(track => {
      const option = document.createElement('option');
      option.value = track.id;
      option.textContent = track.name;
      select.append(option);
    });
    if (tracks.some(t => t.id === previous)) select.value = previous;
    else {
      selectedMixTrackId = '';
      if(previous && audioTrackId===previous){audio.pause();audio.removeAttribute('src');audio.load();audioTrackId=null;currentLibraryTrackId=null;if(audioURL){URL.revokeObjectURL(audioURL);audioURL=null;}}
    }
  }

  function chooseMixTrack(id) {
    if($('#mix-play').disabled)stopMix();
    const previous=selectedMixTrackId;
    const track = tracks.find(item => item.id === id);
    selectedMixTrackId = track ? id : '';
    // Keep the export selection aligned with the Sound Studio selection unless
    // the user has independently chosen another export track.
    const exportSelect=$('#export-music');
    if(exportSelect && (!exportSelect.value || exportSelect.value===previous)) exportSelect.value=track?track.id:'';
    if (!track) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioTrackId=null;currentLibraryTrackId=null;
      $('#mix-track-select').value='';
      if(audioURL){URL.revokeObjectURL(audioURL);audioURL=null;}
      $('#music-audio-state').textContent = 'ТРЕК НЕ ВЫБРАН';
      setMixMessage('Выбери композицию из локальной библиотеки.', false);
      return;
    }
    if (audioURL) URL.revokeObjectURL(audioURL);
    audioURL = URL.createObjectURL(track.blob);
    audio.src = audioURL;
    audio.currentTime = 0;
    audioTrackId=track.id;
    $('#track-title').textContent = track.name;
    $('#track-subtitle').textContent = `Локальный файл · ${formatBytes(track.size)}`;
    $('#music-audio-state').textContent = 'ТРЕК ГОТОВ';
    setMixMessage(`Выбрана композиция: ${track.name}`);
  }

  async function playMix() {
    try {
      if (!video.src || !videoMetadataReady || !Number.isFinite(video.duration)) {
        setMixMessage('Сначала загрузи и дождись чтения видео в Video Lab.', true);
        return;
      }
      if (!selectedMixTrackId) {
        setMixMessage('Сначала выбери музыкальную композицию.', true);
        return;
      }
      if(audioTrackId!==selectedMixTrackId)chooseMixTrack(selectedMixTrackId);
      if(!audio.src)throw new Error('Не удалось подготовить выбранную музыкальную дорожку.');
      const context = ensureMixGraph();
      await context.resume();
      const start = Math.max(0, Number(a.value) || 0);
      const end = Math.max(start, Number(b.value) || video.duration);
      if (end - start < 0.05) {
        setMixMessage('Диапазон видео слишком короткий. Увеличь фрагмент.', true);
        return;
      }
      video.pause();
      audio.pause();
      video.currentTime = start;
      audio.currentTime = 0;
      applyMixGains();
      await Promise.all([video.play(), audio.play()]);
      mixStartedAt = performance.now();
      setMixStatus('ВОСПРОИЗВЕДЕНИЕ МИКСА');
      $('#video-audio-state').textContent = 'ВИДЕО ПОДКЛЮЧЕНО';
      $('#mix-play').disabled = true;
      setMixMessage('Микс воспроизводится. Громкость дорожек можно менять во время прослушивания.');
      updateFadeEnvelope();
      video.ontimeupdate = () => {
        $('#now').textContent = time(video.currentTime);
        updateFadeEnvelope();
        if (video.currentTime >= end) stopMix();
      };
      video.onended = stopMix;
    } catch (error) {
      stopMix();
      setMixMessage(error.message || 'Не удалось запустить микширование.', true);
    }
  }

  function stopMix() {
    video.pause();
    audio.pause();
    video.ontimeupdate = () => { $('#now').textContent = time(video.currentTime); };
    video.onended = null;
    $('#mix-play').disabled = false;
    setMixStatus('МИКШЕР ГОТОВ');
    if (mixReady) applyMixGains();
  }


  function setLibraryStatus(message, isError = false) {
    libraryStatus.textContent = message;
    libraryStatus.classList.toggle('error', isError);
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('Этот браузер не поддерживает локальную базу IndexedDB.'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE)) {
          const store = database.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!database.objectStoreNames.contains(TEMP_STORE)) {
          const cache = database.createObjectStore(TEMP_STORE, { keyPath: 'key' });
          cache.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
        if (!database.objectStoreNames.contains(PROJECT_STORE)) {
          const projects = database.createObjectStore(PROJECT_STORE, { keyPath: 'id' });
          projects.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
      request.onsuccess = () => {
        const opened = request.result;
        opened.onversionchange = () => { opened.close(); if(db===opened){db=null;setLibraryStatus('База обновляется в другой вкладке. Перезагрузи страницу после завершения. ',true);} };
        resolve(opened);
      };
      request.onerror = () => reject(request.error || new Error('Не удалось открыть локальную библиотеку.'));
      request.onblocked = () => setLibraryStatus('База занята другой вкладкой. Закрой другие вкладки Шедеврума и повтори.', true);
    });
  }

  function transactionDone(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Ошибка записи в локальную библиотеку.'));
      tx.onabort = () => reject(tx.error || new Error('Операция с библиотекой отменена.'));
    });
  }

  async function readAllTracks() {
    const tx = db.transaction(STORE, 'readonly');
    const done = transactionDone(tx);
    const request = tx.objectStore(STORE).getAll();
    const result = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error || new Error('Не удалось прочитать библиотеку.'));
    });
    await done;
    return result.sort((x, y) => (y.createdAt || 0) - (x.createdAt || 0));
  }

  async function addTrack(file) {
    const record = {
      id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: file.name || 'Аудиофайл',
      type: file.type || 'application/octet-stream',
      size: file.size || 0,
      createdAt: Date.now(),
      blob: file
    };
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).add(record);
    await transactionDone(tx);
  }

  async function deleteTrack(id) {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    await transactionDone(tx);
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) return '';
    return bytes < 1048576 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
  }

  function playTrack(track) {
    if (!track || !track.blob) return;
    if($('#mix-play').disabled)stopMix();
    currentLibraryTrackId=track.id;audioTrackId=track.id;
    selectedMixTrackId=track.id;
    if($('#mix-track-select'))$('#mix-track-select').value=track.id;
    if($('#export-music'))$('#export-music').value=track.id;
    if (audioURL) URL.revokeObjectURL(audioURL);
    audioURL = URL.createObjectURL(track.blob);
    audio.src = audioURL;
    $('#track-title').textContent = track.name;
    $('#track-subtitle').textContent = `Локальный файл · ${formatBytes(track.size)}`;
    if(mixContext&&mixContext.state==='suspended')mixContext.resume().catch(()=>{});
    audio.play().catch(() => {
      setLibraryStatus('Файл выбран. Нажми Play в аудиоплеере, если браузер заблокировал автозапуск.');
    });
  }

  function renderTracks() {
    $('#track-count').textContent = `${tracks.length} композиций`;
    const list = $('#tracks');
    list.replaceChildren();
    refreshMixTrackOptions();
    refreshExportMusicOptions();
    if (!tracks.length) {
      const empty = document.createElement('div');
      empty.className = 'emptylist';
      empty.textContent = 'Здесь пока нет композиций.';
      list.append(empty);
      return;
    }
    tracks.forEach(track => {
      const row = document.createElement('div');
      row.className = 'trackrow';

      const meta = document.createElement('div');
      meta.className = 'track-meta';
      const name = document.createElement('b');
      name.textContent = track.name;
      const detail = document.createElement('small');
      detail.textContent = formatBytes(track.size);
      meta.append(name, detail);

      const play = document.createElement('button');
      play.type = 'button';
      play.textContent = '▶ Слушать';
      play.addEventListener('click', () => playTrack(track));

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Удалить';
      remove.addEventListener('click', async () => {
        remove.disabled = true;
        try {
          if (currentLibraryTrackId === track.id || selectedMixTrackId === track.id) {
            if(selectedMixTrackId===track.id)stopMix();
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
            if (audioURL) URL.revokeObjectURL(audioURL);
            audioURL = null;currentLibraryTrackId=null;audioTrackId=null;
            $('#track-title').textContent = 'Композиция не выбрана';
            $('#track-subtitle').textContent = 'Добавь аудиофайл';
          }
          const affectsProject=selectedMixTrackId===track.id || $('#export-music').value===track.id;
          await deleteTrack(track.id);
          if (selectedMixTrackId === track.id) chooseMixTrack('');
          if(affectsProject)markProjectDirty();
          tracks=tracks.filter(item=>item.id!==track.id);renderTracks();
          try{tracks=await readAllTracks();renderTracks();setLibraryStatus('Композиция удалена из локальной библиотеки.');}
          catch(e){setLibraryStatus('Композиция удалена, но список не удалось обновить. Перезагрузи страницу: '+e.message,true);}
        } catch (error) {
          remove.disabled = false;
          setLibraryStatus(error.message || 'Не удалось удалить композицию.', true);
        }
      });

      row.append(meta, play, remove);
      list.append(row);
    });
  }

  $('#pick-audio').onclick = () => {
    if (!db) {
      setLibraryStatus('Локальная библиотека ещё не готова. Подожди завершения загрузки.', true);
      return;
    }
    $('#audio-files').click();
  };

  $('#audio-files').onchange = async event => {
    const selectedFiles=[...(event.target.files||[])];
    event.target.value='';
    if(!selectedFiles.length)return;
    const files=selectedFiles.filter(file=>file.type.startsWith('audio/'));
    if (!files.length) {
      setLibraryStatus('Не найдено аудиофайлов поддерживаемого типа.', true);
      return;
    }
    const button = $('#pick-audio');
    button.disabled = true;
    setLibraryStatus(`Сохранение ${files.length} файлов…`);
    let saved=0;
    try {
      for (const file of files) { await addTrack(file); saved++; }
      tracks = await readAllTracks();
      renderTracks();
      setLibraryStatus(`Сохранено файлов: ${saved}. Библиотека останется после перезагрузки страницы.`);
    } catch (error) {
      try{tracks=await readAllTracks();renderTracks();}catch(_){}
      setLibraryStatus(`Сохранено ${saved} из ${files.length}. ${error.message || 'Не удалось сохранить аудиофайлы.'}`, true);
    } finally {
      button.disabled = false;
    }
  };

  // Sound Studio controls
  $('#video-gain').addEventListener('input', () => { applyMixGains(); markProjectDirty(); });
  $('#music-gain').addEventListener('input', () => { applyMixGains(); updateFadeEnvelope(); markProjectDirty(); });
  $('#video-mute').addEventListener('change', () => { applyMixGains(); markProjectDirty(); });
  $('#music-mute').addEventListener('change', () => { applyMixGains(); updateFadeEnvelope(); markProjectDirty(); });
  $('#mix-track-select').addEventListener('change', event => { chooseMixTrack(event.target.value); markProjectDirty(); });
  $('#mix-play').addEventListener('click', playMix);
  $('#mix-stop').addEventListener('click', stopMix);
  ['fade-in','fade-out'].forEach(id=>$('#'+id).addEventListener('change',markProjectDirty));
  ['eq-low','eq-mid','eq-high'].forEach(id=>$('#'+id).addEventListener('input',()=>{applyMusicEQ();markProjectDirty();}));
  video.addEventListener('loadedmetadata', () => {
    $('#video-audio-state').textContent = 'ВИДЕО ПОДКЛЮЧЕНО';
    setMixMessage('Видео доступно как источник оригинального звука.');
  });


  // Project and temporary-media persistence.
  function setCacheStatus(message, isError = false) {
    const el = $('#cache-status'); if (!el) return;
    el.textContent = message; el.classList.toggle('error', isError);
  }
  function setProjectStatus(message, isError = false) {
    const el = $('#project-status'); if (!el) return;
    el.textContent = message; el.classList.toggle('error', isError);
  }
  function markProjectDirty() {
    projectRevision++;
    if(!renderingNow && renderedURL){URL.revokeObjectURL(renderedURL);renderedURL=null;renderedBlob=null;renderedFromRevision=null;renderedForProjectId=null;$('#render-result').replaceChildren();$('#render-status').textContent='Проект изменён. Предыдущий экспорт больше не соответствует текущему монтажу.';}
    persistSessionStateSoon();
  }
  let renderingNow=false;
  function queueProject(id,operation){
    const previous=projectQueues.get(id)||Promise.resolve();
    const current=previous.catch(()=>{}).then(operation);
    projectQueues.set(id,current);
    return current.finally(()=>{if(projectQueues.get(id)===current)projectQueues.delete(id);});
  }
  function idbRequest(storeName, mode, operation) {
    return new Promise((resolve, reject) => {
      if (!db) return reject(new Error('Локальная база ещё не готова.'));
      let tx;
      try { tx = db.transaction(storeName, mode); } catch (e) { reject(e); return; }
      const done = transactionDone(tx);
      let req;
      try { req = operation(tx.objectStore(storeName)); } catch (e) { reject(e); return; }
      let result;
      if (req && 'onsuccess' in req) {
        req.onsuccess = () => { result = req.result; };
        req.onerror = () => reject(req.error || new Error('Ошибка запроса к базе.'));
      }
      done.then(() => resolve(result)).catch(reject);
    });
  }
  async function getAllFrom(storeName) { return (await idbRequest(storeName, 'readonly', store => store.getAll())) || []; }
  function enqueueTemp(key, operation) {
    const current=tempMutationQueue.catch(()=>{}).then(operation);
    tempMutationQueue=current;
    tempQueues.set(key,current);
    return current.finally(()=>{if(tempQueues.get(key)===current)tempQueues.delete(key);});
  }
  async function persistTemp(key, blob, meta = {}) {
    if(tempClearing)throw new Error('Очистка временного кэша уже выполняется.');
    if (!blob) throw new Error('Нет данных для временного сохранения.');
    const revision=(tempKeyRevisions.get(key)||0)+1;tempKeyRevisions.set(key,revision);
    const epoch=tempEpoch;
    return enqueueTemp(key, async()=>{
      if(epoch!==tempEpoch || revision!==tempKeyRevisions.get(key))return;
      const entry = { key, blob, size: blob.size || 0, updatedAt: Date.now(), expiresAt: Date.now() + CACHE_TTL, ...meta };
      await idbRequest(TEMP_STORE, 'readwrite', store => store.put(entry));
      const removed=await pruneTempCache();
      if(removed.length)setCacheStatus(`Кэш ограничен: удалены старые временные элементы (${removed.length}). Сохранённые проекты не затронуты.`,true);
      else if(key!=='session-state')setCacheStatus('Временные файлы сохранены.');
    });
  }
  async function deleteTemp(key) {
    if(tempClearing)throw new Error('Очистка временного кэша уже выполняется.');
    const revision=(tempKeyRevisions.get(key)||0)+1;tempKeyRevisions.set(key,revision);
    const epoch=tempEpoch;
    return enqueueTemp(key,async()=>{
      if(epoch!==tempEpoch || revision!==tempKeyRevisions.get(key))return;
      await idbRequest(TEMP_STORE, 'readwrite', store => store.delete(key));
    });
  }
  async function pruneTempCache() {
    const all = await getAllFrom(TEMP_STORE);
    const now = Date.now();
    const remove = new Set(all.filter(x => x.expiresAt && x.expiresAt <= now).map(x=>x.key));
    const main=all.find(x=>x.key==='active-video'&&!remove.has(x.key));
    const frame=all.find(x=>x.key==='first-frame'&&!remove.has(x.key));
    let total=(main?.size||0)+(frame?.size||0);
    const clipEntries=all.filter(x=>x.key.startsWith('clip:')&&!remove.has(x.key)).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
    let kept=0;
    for(const item of clipEntries){
      if(kept>=MAX_EXTRA_CLIPS || total+(item.size||0)>CACHE_LIMIT){remove.add(item.key);continue;}
      total+=item.size||0;kept++;
    }
    for(const item of all){if(item.key!=='active-video'&&item.key!=='first-frame'&&item.key!=='session-state'&&!item.key.startsWith('clip:'))remove.add(item.key);}
    if (remove.size) {
      const tx = db.transaction(TEMP_STORE, 'readwrite'); const done = transactionDone(tx);
      const store = tx.objectStore(TEMP_STORE); remove.forEach(key => store.delete(key)); await done;
      return [...remove];
    }
    return [];
  }
  function currentMixState() {
    return {videoGain:$('#video-gain').value,musicGain:$('#music-gain').value,videoMute:$('#video-mute').checked,musicMute:$('#music-mute').checked,fadeIn:$('#fade-in').value,fadeOut:$('#fade-out').value,eqLow:$('#eq-low').value,eqMid:$('#eq-mid').value,eqHigh:$('#eq-high').value};
  }
  function currentExportState() {
    return {size:$('#export-size').value,orientation:$('#export-orientation').value,fit:$('#export-fit').value,transition:$('#export-transition').value,fps:$('#export-fps').value,quality:$('#export-quality').value,musicId:$('#export-music').value,videoGain:$('#export-video-gain').value,musicGain:$('#export-music-gain').value,fadeIn:$('#export-fade-in').value,fadeOut:$('#export-fade-out').value,introDuration:$('#intro-duration').value,eqLow:$('#export-eq-low').value,eqMid:$('#export-eq-mid').value,eqHigh:$('#export-eq-high').value};
  }
  function currentSessionState() {
    return {
      activeProjectId,activeProjectName,revision:projectRevision,savedRevision:activeProjectSavedRevision,projectConflict:sessionProjectConflict,
      mainVideoPresent:!!mainVideoBlob||!!sessionMissingMain,mainVideoName:mainVideoBlob?.name||sessionMissingMain?.name||$('#filename').textContent,mainVideoSize:mainVideoBlob?.size||sessionMissingMain?.size||0,mainLastModified:mainVideoBlob?.lastModified||sessionMissingMain?.lastModified||0,
      clipIds:[...clips.map(x=>x.id),...sessionMissingClipIds],firstFramePresent:!!firstFrameBlob||!!sessionMissingFrame,firstFrameStamp:firstFrameStamp||sessionMissingFrame||null,
      trimStart:Number(a.value)||0,trimEnd:Number(b.value)||0,
      selectedMixTrackId,mix:currentMixState(),export:currentExportState()
    };
  }
  async function persistSessionStateNow() {
    if(!db||tempClearing)return;
    const state=currentSessionState();
    await persistTemp('session-state',new Blob([]),{kind:'session-state',state,size:0,expiresAt:0});
  }
  function persistSessionStateSoon() {
    if(!db||tempClearing)return;
    if(sessionSaveTimer)clearTimeout(sessionSaveTimer);
    sessionSaveTimer=setTimeout(()=>{sessionSaveTimer=null;persistSessionStateNow().catch(e=>setCacheStatus('Не удалось сохранить состояние редактора: '+e.message,true));},300);
  }
  function applySessionState(state, project=null) {
    if(!state)return;
    activeProjectId=state.activeProjectId&&project?state.activeProjectId:null;activeProjectName=activeProjectId?(project?.name||state.activeProjectName||null):null;
    projectRevision=Number.isFinite(state.revision)?state.revision:(project?.revision||0);activeProjectSavedRevision=activeProjectId?(project?.revision??state.savedRevision??null):null;sessionProjectConflict=!!(state.projectConflict||(project&&Number.isFinite(state.revision)&&state.revision<project.revision));
    const mix=state.mix||{};
    $('#video-gain').value=mix.videoGain??100;$('#music-gain').value=mix.musicGain??70;$('#video-mute').checked=!!mix.videoMute;$('#music-mute').checked=!!mix.musicMute;$('#fade-in').value=mix.fadeIn??1;$('#fade-out').value=mix.fadeOut??2;$('#eq-low').value=mix.eqLow??0;$('#eq-mid').value=mix.eqMid??0;$('#eq-high').value=mix.eqHigh??0;applyMixGains();
    selectedMixTrackId=state.selectedMixTrackId||'';refreshMixTrackOptions();$('#mix-track-select').value=selectedMixTrackId;chooseMixTrack(selectedMixTrackId);
    const ex=state.export||{};$('#export-size').value=ex.size||'1080';$('#export-orientation').value=ex.orientation||'vertical';$('#export-fit').value=ex.fit||'contain';$('#export-transition').value=ex.transition||'fade';$('#export-fps').value=ex.fps||'30';$('#export-quality').value=ex.quality||'28';$('#export-music').value=ex.musicId||'';$('#export-video-gain').value=ex.videoGain??100;$('#export-music-gain').value=ex.musicGain??70;$('#export-fade-in').value=ex.fadeIn??1;$('#export-fade-out').value=ex.fadeOut??2;$('#intro-duration').value=ex.introDuration??2;$('#export-eq-low').value=ex.eqLow??0;$('#export-eq-mid').value=ex.eqMid??0;$('#export-eq-high').value=ex.eqHigh??0;
    const applyRange=()=>{if(videoMetadataReady){range(Math.min(state.trimStart||0,video.duration),Math.min(Number.isFinite(state.trimEnd)?state.trimEnd:video.duration,video.duration));persistSessionStateSoon();if(projectMetadataHandler){video.removeEventListener('loadedmetadata',projectMetadataHandler);projectMetadataHandler=null;}}};
    if(videoMetadataReady)applyRange();else if(mainVideoBlob){if(projectMetadataHandler)video.removeEventListener('loadedmetadata',projectMetadataHandler);projectMetadataHandler=applyRange;video.addEventListener('loadedmetadata',applyRange);}
  }
  async function syncTempCacheFromEditor(epoch=editorEpoch) {
    const mainSnapshot=mainVideoBlob,clipSnapshot=clips.map(x=>({...x})),frameSnapshot=firstFrameBlob,frameStamp=firstFrameStamp;
    const all=await getAllFrom(TEMP_STORE);if(epoch!==editorEpoch)return;
    const wanted=new Set(clipSnapshot.map(x=>`clip:${x.id}`));
    for(const entry of all){if(epoch!==editorEpoch)return;if(entry.key.startsWith('clip:')&&!wanted.has(entry.key))await deleteTemp(entry.key);}
    if(epoch!==editorEpoch)return;
    if(mainSnapshot)await persistTemp('active-video',mainSnapshot,{name:mainSnapshot.name||'video',type:mainSnapshot.type||'video/mp4',lastModified:mainSnapshot.lastModified||0,kind:'video'});
    else await deleteTemp('active-video');
    if(epoch!==editorEpoch)return;
    for(let i=0;i<clipSnapshot.length;i++){if(epoch!==editorEpoch)return;const clip=clipSnapshot[i];await persistTemp(`clip:${clip.id}`,clip.blob,{name:clip.name,type:clip.type,order:i,kind:'clip'});}
    if(epoch!==editorEpoch)return;
    if(frameSnapshot)await persistTemp('first-frame',frameSnapshot,{name:'first-frame.png',type:'image/png',stamp:frameStamp||0,kind:'frame'});
    else await deleteTemp('first-frame');
  }
  async function restoreTempSession() {
    await pruneTempCache();
    const all=await getAllFrom(TEMP_STORE);
    const state=(all.find(x=>x.key==='session-state')||{}).state||null;
    const projects=state?.activeProjectId?await getAllFrom(PROJECT_STORE):[];
    const project=projects.find(x=>x.id===state?.activeProjectId)||null;
    const cachedMain=all.find(x=>x.key==='active-video');
    let mainBlob=null,mainName='',mainType='video/mp4',mainLastModified=0;
    if(state){
      if(state.mainVideoPresent){
        const cacheMatches=cachedMain?.blob&&cachedMain.name===state.mainVideoName&&(cachedMain.size||cachedMain.blob.size||0)===state.mainVideoSize&&(cachedMain.lastModified||0)===(state.mainLastModified||0);
        if(cacheMatches){mainBlob=cachedMain.blob;mainName=cachedMain.name||state.mainVideoName;mainType=cachedMain.type||cachedMain.blob.type||'video/mp4';mainLastModified=cachedMain.lastModified||state.mainLastModified||0;}
        else if(project?.mainVideo&&project.mainName===state.mainVideoName&&project.mainVideo.size===state.mainVideoSize&&(project.mainLastModified||0)===(state.mainLastModified||0)){mainBlob=project.mainVideo;mainName=project.mainName;mainType=project.mainType||project.mainVideo.type||'video/mp4';mainLastModified=project.mainLastModified||0;}
      }
    }else if(cachedMain?.blob){mainBlob=cachedMain.blob;mainName=cachedMain.name||'restored-video.mp4';mainType=cachedMain.type||cachedMain.blob.type||'video/mp4';mainLastModified=cachedMain.lastModified||0;}
    if(mainBlob){const file=new File([mainBlob],mainName||'restored-video.mp4',{type:mainType,lastModified:mainLastModified});loadVideo(file,{persist:false});}
    else if(state?.mainVideoPresent===false)clearVideo();

    const cachedClips=all.filter(x=>x.key.startsWith('clip:')&&x.blob);
    const cacheMap=new Map(cachedClips.map(x=>[x.key.slice(5),{id:x.key.slice(5),name:x.name,blob:x.blob,size:x.size||x.blob.size||0,type:x.type||x.blob.type||'video/mp4'}]));
    const projectClips=new Map((project?.clips||[]).map(x=>[x.id,x]));
    const ids=Array.isArray(state?.clipIds)?state.clipIds:cachedClips.sort((a,b)=>(a.order||0)-(b.order||0)).map(x=>x.key.slice(5));
    let missingClips=0;
    const restoredClipIds=new Set();
    clips=ids.map(id=>{const found=cacheMap.get(id)||projectClips.get(id);if(found)restoredClipIds.add(id);return found;}).filter(x=>{if(!x){missingClips++;return false;}return true;}).map(x=>({...x}));
    sessionMissingClipIds=ids.filter(id=>!restoredClipIds.has(id));
    $('#discard-missing-clips').hidden=!sessionMissingClipIds.length;
    const cachedFrame=all.find(x=>x.key==='first-frame');
    if(state?.firstFramePresent===false)firstFrameBlob=null;
    else if(cachedFrame?.blob&&(!state?.firstFrameStamp||cachedFrame.stamp===state.firstFrameStamp)){firstFrameBlob=cachedFrame.blob;firstFrameStamp=state?.firstFrameStamp||cachedFrame.stamp||null;}
    else if(state?.firstFramePresent&&project?.firstFrameBlob&&state.firstFrameStamp&&project.firstFrameStamp===state.firstFrameStamp){firstFrameBlob=project.firstFrameBlob;firstFrameStamp=project.firstFrameStamp;}
    else if(!state){firstFrameBlob=cachedFrame?.blob||null;firstFrameStamp=cachedFrame?.stamp||null;}
    else {firstFrameBlob=null;firstFrameStamp=null;}
    const missingMain=!!(state?.mainVideoPresent&&!mainBlob);
    const missingFrame=!!(state?.firstFramePresent&&!firstFrameBlob);
    sessionMissingMain=missingMain?{name:state.mainVideoName,size:state.mainVideoSize,lastModified:state.mainLastModified}:null;
    sessionMissingFrame=missingFrame?(state.firstFrameStamp||true):null;
    $('#remove-frame').disabled=!firstFrameBlob&&!sessionMissingFrame;$('#remove-frame').textContent=sessionMissingFrame?'Исключить отсутствующий кадр':'Удалить первый кадр';
    renderClips();
    if(state)applySessionState(state,project);
    const missingProject=!!(state?.activeProjectId&&!project);
    const missingMusic=!!(state?.selectedMixTrackId&&!tracks.some(t=>t.id===state.selectedMixTrackId))||!!(state?.export?.musicId&&!tracks.some(t=>t.id===state.export.musicId));
    if(missingClips||missingMain||missingFrame||missingProject||missingMusic||sessionProjectConflict){
      const problems=[];if(sessionProjectConflict)problems.push('проект изменён в другой вкладке');if(missingMain)problems.push('основное видео');if(missingClips)problems.push(`${missingClips} клип(а)`);if(missingFrame)problems.push('первый кадр');if(missingProject)problems.push('сохранённый проект');if(missingMusic)problems.push('музыкальная дорожка');
      setCacheStatus('Не удалось полностью восстановить: '+problems.join(', ')+'. Проверь сохранённые проекты и библиотеку.',true);
      if(missingProject||missingMusic){projectRevision++;persistSessionStateSoon();}
    }else if(mainBlob||clips.length||firstFrameBlob)setCacheStatus(`Сеанс восстановлен: видео ${mainBlob?'есть':'нет'}, клипов ${clips.length}, первый кадр ${firstFrameBlob?'есть':'нет'}.`);
    else setCacheStatus('Временный кэш пуст.');
    if(project&&!missingClips&&!missingMain&&!missingFrame&&!missingMusic&&state?.revision===project.revision&&project.exportedBlob&&project.exportedFromRevision===project.revision){showRenderedBlob(project.exportedBlob,`${project.name||'NelliStudio'}_export.mp4`);renderedFromRevision=project.exportedFromRevision;renderedForProjectId=project.id;$('#render-status').textContent='Восстановлен MP4, сохранённый в активном проекте.';}
  }
  async function addClipFiles(files) {
    const valid = [...files].filter(f=>f.type.startsWith('video/'));
    if (!valid.length) { setCacheStatus('Выбери видеофайлы.', true); return; }
    if(clipOrderBusy||projectLoading){setCacheStatus('Подожди завершения текущей операции с проектом или клипами.',true);return;}
    if (clips.length + sessionMissingClipIds.length + valid.length > MAX_EXTRA_CLIPS) { setCacheStatus(`Лимит дополнительных клипов — ${MAX_EXTRA_CLIPS}.`, true); return; }
    for (const file of valid) {
      const id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
      const item = {id,name:file.name,blob:file,size:file.size,type:file.type};
      clips.push(item);markProjectDirty();
      try { await persistTemp(`clip:${id}`, file, {name:file.name,type:file.type,order:clips.length-1,kind:'clip'}); }
      catch (e) { clips = clips.filter(x=>x.id!==id);markProjectDirty(); setCacheStatus(`Не удалось добавить ${file.name}: ${e.message}`, true); }
    }
    renderClips(); markProjectDirty();
  }
  function renderClips() {
    const list = $('#clip-list'); if (!list) return;
    list.replaceChildren();
    if (!clips.length) { const empty=document.createElement('div');empty.className='emptylist';empty.textContent='Дополнительных клипов пока нет.';list.append(empty);return; }
    clips.forEach((clip,index)=>{
      const row=document.createElement('div');row.className='clip-row';
      const title=document.createElement('b');title.textContent=`${index+1}. ${clip.name}`;
      const size=document.createElement('small');size.textContent=formatBytes(clip.size);
      const up=document.createElement('button');up.textContent='↑';up.title='Переместить выше';up.disabled=index===0||clipOrderBusy||projectLoading;
      up.onclick=()=>moveClip(index,-1);
      const down=document.createElement('button');down.textContent='↓';down.title='Переместить ниже';down.disabled=index===clips.length-1||clipOrderBusy||projectLoading;
      down.onclick=()=>moveClip(index,1);
      const remove=document.createElement('button');remove.className='danger-mini';remove.textContent='Удалить';remove.disabled=clipOrderBusy||projectLoading;
      remove.onclick=async()=>{remove.disabled=true;const index=clips.findIndex(x=>x.id===clip.id);clips=clips.filter(x=>x.id!==clip.id);renderClips();markProjectDirty();try{await deleteTemp(`clip:${clip.id}`);setCacheStatus('Клип удалён из временного кэша.');}catch(e){clips.splice(Math.max(0,index),0,clip);renderClips();markProjectDirty();setCacheStatus('Не удалось удалить клип. Он восстановлен в редакторе: '+e.message,true);}};
      row.append(title,size,up,down,remove);list.append(row);
    });
  }
  async function moveClip(index,delta) {
    const target=index+delta;if(target<0||target>=clips.length||tempClearing||clipOrderBusy||projectLoading)return;
    clipOrderBusy=true;const previous=clips.slice();[clips[index],clips[target]]=[clips[target],clips[index]];markProjectDirty();renderClips();
    const orderSnapshot=clips.slice(),epoch=tempEpoch;
    try{
      await enqueueTemp('__clip-order__',async()=>{
        if(epoch!==tempEpoch||tempClearing)throw new Error('Очистка временного кэша уже началась.');
        const existing=new Set((await getAllFrom(TEMP_STORE)).map(x=>x.key));
        const tx=db.transaction(TEMP_STORE,'readwrite');const done=transactionDone(tx);const store=tx.objectStore(TEMP_STORE);
        orderSnapshot.forEach((clip,order)=>{const key=`clip:${clip.id}`;if(existing.has(key))store.put({key,blob:clip.blob,size:clip.size,updatedAt:Date.now(),expiresAt:Date.now()+CACHE_TTL,name:clip.name,type:clip.type,order,kind:'clip'});});
        await done;
      });markProjectDirty();setCacheStatus('Порядок клипов сохранён.');
    }catch(e){clips=previous;markProjectDirty();setCacheStatus('Не удалось сохранить порядок клипов: '+e.message,true);}
    finally{clipOrderBusy=false;renderClips();}
  }
  $('#pick-clips').onclick=()=>$('#clip-files').click();
  $('#clip-files').onchange=async e=>{const files=[...(e.target.files||[])];e.target.value='';if(files.length)await addClipFiles(files);};
  async function clearTempCache() {
    if(renderingNow)throw new Error('Сначала останови текущий экспорт.');
    if(tempClearing)throw new Error('Очистка временного кэша уже выполняется.');
    if(clipOrderBusy||projectLoading)throw new Error('Дождись завершения текущей операции с проектом или клипами.');
    if(sessionSaveTimer){clearTimeout(sessionSaveTimer);sessionSaveTimer=null;}
    tempClearing=true;
    try{
      tempEpoch++;for(const key of tempKeyRevisions.keys())tempKeyRevisions.set(key,tempKeyRevisions.get(key)+1);
      await Promise.all([...tempQueues.values()].map(p=>p.catch(()=>{})));
      const tx=db.transaction(TEMP_STORE,'readwrite');const done=transactionDone(tx);tx.objectStore(TEMP_STORE).clear();await done;
      clips=[];firstFrameBlob=null;firstFrameStamp=null;sessionMissingMain=null;sessionMissingFrame=null;sessionMissingClipIds=[];$('#remove-frame').textContent='Удалить первый кадр';$('#discard-missing-clips').hidden=true;activeProjectId=null;activeProjectName=null;activeProjectSavedRevision=null;sessionProjectConflict=false;projectRevision=0;editorEpoch++;clearVideo();$('#remove-frame').disabled=true;renderClips();
      if(renderedURL){URL.revokeObjectURL(renderedURL);renderedURL=null;}renderedBlob=null;renderedFromRevision=null;renderedForProjectId=null;$('#render-result').replaceChildren();$('#render-status').textContent='Экспорт отсутствует.';
      setCacheStatus('Временный кэш очищен. Проекты и музыка сохранены.');setProjectStatus('Редактор очищен. Сохранённые проекты остались в списке.');markProjectDirty();
    } finally {tempClearing=false;}
    try{await persistSessionStateNow();}catch(e){setCacheStatus('Временные медиа очищены, но состояние редактора не удалось записать: '+e.message,true);}
  }
  $('#clear-temp').onclick=async()=>{
    if(!confirm('Удалить все временные видео, клипы и кадры? Сохранённые проекты и музыкальная библиотека останутся.'))return;
    try{await clearTempCache();}catch(e){setCacheStatus('Не удалось очистить временный кэш: '+e.message,true);}
  };
  $('#discard-missing-clips').onclick=()=>{if(!sessionMissingClipIds.length)return;sessionMissingClipIds=[];$('#discard-missing-clips').hidden=true;markProjectDirty();setCacheStatus('Отсутствующие клипы исключены из текущего сеанса. Сохранённый проект изменится только после сохранения.',true);};

  function hasUnsavedChanges(){if(activeProjectId)return sessionProjectConflict||projectRevision!==activeProjectSavedRevision||!!sessionMissingMain||!!sessionMissingFrame||sessionMissingClipIds.length>0;return projectRevision>0||!!mainVideoBlob||clips.length>0||!!firstFrameBlob||!!sessionMissingMain||!!sessionMissingFrame||sessionMissingClipIds.length>0;}
  function captureProject() {
    const revision=projectRevision;
    return {
      id:activeProjectId || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
      name: activeProjectId ? (activeProjectName || 'Проект') : ((video.src && $('#filename').textContent !== 'Файл не выбран') ? $('#filename').textContent.replace(/\.[^.]+$/,'') : (activeProjectName||'Новый проект')),
      updatedAt:Date.now(),createdAt:Date.now(),revision,
      mainVideo: video.src ? (mainVideoBlob || null) : null,
      mainName:$('#filename').textContent,
      mainLastModified:mainVideoBlob?.lastModified||0,
      mainType:video.src ? (mainVideoBlob?.type || '') : '',
      trimStart:Number(a.value)||0,trimEnd:Number(b.value)||0,
      clips:clips.map(x=>({id:x.id,name:x.name,blob:x.blob,size:x.size,type:x.type})),
      firstFrameBlob,firstFrameStamp,
      selectedMixTrackId,
      mix:{videoGain:$('#video-gain').value,musicGain:$('#music-gain').value,videoMute:$('#video-mute').checked,musicMute:$('#music-mute').checked,fadeIn:$('#fade-in').value,fadeOut:$('#fade-out').value,eqLow:$('#eq-low').value,eqMid:$('#eq-mid').value,eqHigh:$('#eq-high').value},
      export:{size:$('#export-size').value,orientation:$('#export-orientation').value,fit:$('#export-fit').value,transition:$('#export-transition').value,fps:$('#export-fps').value,quality:$('#export-quality').value,musicId:$('#export-music').value,videoGain:$('#export-video-gain').value,musicGain:$('#export-music-gain').value,fadeIn:$('#export-fade-in').value,fadeOut:$('#export-fade-out').value,introDuration:$('#intro-duration').value,eqLow:$('#export-eq-low').value,eqMid:$('#export-eq-mid').value,eqHigh:$('#export-eq-high').value}
    };
  }
  async function saveProject() {
    if(clipOrderBusy||projectLoading)throw new Error('Дождись завершения текущей операции с проектом или клипами перед сохранением.');
    if(!db)throw new Error('База ещё не готова.');
    const snapshot=captureProject();
    const reusableExport=!!(renderedBlob&&renderedFromRevision===snapshot.revision&&((renderedForProjectId===activeProjectId)||(renderedForProjectId===null&&activeProjectId===null)));
    if(reusableExport){snapshot.exportedBlob=renderedBlob;snapshot.exportedFromRevision=snapshot.revision;snapshot.exportedAt=Date.now();}
    const saveEpoch=editorEpoch;
    if(sessionProjectConflict)throw new Error('Этот проект изменён в другой вкладке. Открой его заново, чтобы загрузить актуальную версию, прежде чем сохранять.');
    if(sessionMissingMain||sessionMissingFrame||sessionMissingClipIds.length)throw new Error('В сеансе есть отсутствующие исходники. Повторно добавь видео, пересоздай или удали отсутствующий кадр и исключи отсутствующие клипы перед сохранением.');
    if(video.src && !videoMetadataReady) throw new Error('Видео ещё не прочитано или повреждено. Дождись проверки файла перед сохранением проекта.');
    if(video.src && !snapshot.mainVideo) throw new Error('Не удалось получить исходное видео. Повтори импорт.');
    return queueProject(snapshot.id,async()=>{
      const tx=db.transaction(PROJECT_STORE,'readwrite');const done=transactionDone(tx);const store=tx.objectStore(PROJECT_STORE);
      const get=store.get(snapshot.id);let conflictMessage='';
      get.onsuccess=()=>{const old=get.result;if(activeProjectId===snapshot.id&&(!old||old.revision!==activeProjectSavedRevision)){conflictMessage='Этот проект изменён или удалён в другой вкладке. Открой его заново, чтобы не затереть чужие изменения.';tx.abort();return;}snapshot.createdAt=old?.createdAt||snapshot.updatedAt;if(old&&old.revision===snapshot.revision&&!reusableExport){snapshot.exportedBlob=old.exportedBlob;snapshot.exportedAt=old.exportedAt;snapshot.exportedFromRevision=old.exportedFromRevision;}store.put(snapshot);};
      try{await done;}catch(e){if(conflictMessage){sessionProjectConflict=true;throw new Error(conflictMessage);}throw e;}
      if(saveEpoch===editorEpoch){activeProjectId=snapshot.id;activeProjectName=snapshot.name;activeProjectSavedRevision=snapshot.revision;sessionProjectConflict=false;if(reusableExport)renderedForProjectId=snapshot.id;}
      if(saveEpoch!==editorEpoch)setProjectStatus(`Сохранён снимок проекта «${snapshot.name}». Активный проект не изменён.`);
      else if(projectRevision===snapshot.revision)setProjectStatus(`Проект «${snapshot.name}» сохранён.`);
      else setProjectStatus('Снимок сохранён, но после него были изменения — сохрани ещё раз.');
      try{await refreshProjects();}catch(e){setProjectStatus('Проект сохранён, но список проектов не удалось обновить: '+e.message,true);}persistSessionStateSoon();return snapshot.id;
    });
  }
  async function refreshProjects() {
    if(!db)return;
    const items=(await getAllFrom(PROJECT_STORE)).sort((x,y)=>(y.updatedAt||0)-(x.updatedAt||0));
    const list=$('#project-list');if(!list)return;list.replaceChildren();
    if(!items.length){const empty=document.createElement('div');empty.className='emptylist';empty.textContent='Сохранённых проектов пока нет.';list.append(empty);return;}
    items.forEach(project=>{
      const row=document.createElement('div');row.className='project-row';
      const name=document.createElement('b');name.textContent=project.name||'Проект';
      const date=document.createElement('small');date.textContent=new Date(project.updatedAt||Date.now()).toLocaleString();
      const open=document.createElement('button');open.textContent='Открыть';open.onclick=()=>openProject(project.id).catch(e=>setProjectStatus('Не удалось открыть проект: '+e.message,true));
      const del=document.createElement('button');del.className='danger-mini';del.textContent='Удалить';del.onclick=()=>deleteProject(project.id);
      row.append(name,date,open,del);list.append(row);
    });
  }
  async function openProject(id) {
    if(projectLoading||clipOrderBusy)throw new Error('Сначала дождись завершения текущей операции.');
    if(hasUnsavedChanges()&&!confirm('В редакторе есть несохранённые изменения. Открыть другой проект и заменить текущий монтаж?'))return;
    projectLoading=true;const app=$('#ns-app');const previousPointerEvents=app.style.pointerEvents;app.style.pointerEvents='none';const openEpoch=++editorEpoch;
    try{return await queueProject(id,async()=>{
    if(openEpoch!==editorEpoch)return;
    const project=(await getAllFrom(PROJECT_STORE)).find(x=>x.id===id);if(openEpoch!==editorEpoch)return;if(!project){setProjectStatus('Проект не найден.',true);return;}
    if(project.mainVideo){const file=new File([project.mainVideo],project.mainName||'project-video.mp4',{type:project.mainType||project.mainVideo.type||'video/mp4',lastModified:project.mainLastModified||0});loadVideo(file,{persist:false});}
    else clearVideo();
    clips=(project.clips||[]).map(x=>({...x}));firstFrameBlob=project.firstFrameBlob||null;firstFrameStamp=project.firstFrameStamp||null;$('#remove-frame').textContent='Удалить первый кадр';$('#remove-frame').disabled=!firstFrameBlob;sessionMissingMain=null;sessionMissingFrame=null;sessionMissingClipIds=[];$('#discard-missing-clips').hidden=true;
    renderClips();
    const m=project.mix||{};
    $('#video-gain').value=m.videoGain??100;$('#music-gain').value=m.musicGain??70;$('#video-mute').checked=!!m.videoMute;$('#music-mute').checked=!!m.musicMute;$('#fade-in').value=m.fadeIn??1;$('#fade-out').value=m.fadeOut??2;$('#eq-low').value=m.eqLow??0;$('#eq-mid').value=m.eqMid??0;$('#eq-high').value=m.eqHigh??0;applyMusicEQ();
    selectedMixTrackId=project.selectedMixTrackId||'';refreshMixTrackOptions();$('#mix-track-select').value=selectedMixTrackId;chooseMixTrack(selectedMixTrackId);
    const ex=project.export||{};$('#export-size').value=ex.size||'1080';$('#export-fps').value=ex.fps||'30';$('#export-quality').value=ex.quality||'28';$('#export-music').value=ex.musicId||'';$('#export-video-gain').value=ex.videoGain??100;$('#export-music-gain').value=ex.musicGain??70;$('#export-fade-in').value=ex.fadeIn??1;$('#export-fade-out').value=ex.fadeOut??2;$('#intro-duration').value=ex.introDuration??2;$('#export-orientation').value=ex.orientation||'vertical';$('#export-fit').value=ex.fit||'contain';$('#export-transition').value=ex.transition||'fade';$('#export-eq-low').value=ex.eqLow??0;$('#export-eq-mid').value=ex.eqMid??0;$('#export-eq-high').value=ex.eqHigh??0;
    const missingMusic=(project.selectedMixTrackId&&!tracks.some(t=>t.id===project.selectedMixTrackId))||(ex.musicId&&!tracks.some(t=>t.id===ex.musicId));
    activeProjectId=project.id;activeProjectName=project.name||'Проект';projectRevision=project.revision||0;activeProjectSavedRevision=project.revision||0;sessionProjectConflict=false;
    if(missingMusic)markProjectDirty();
    setProjectStatus(missingMusic?`Открыт проект «${project.name}». Одна из музыкальных дорожек отсутствует в библиотеке.`:`Открыт проект «${project.name}».`,missingMusic);
    try{await syncTempCacheFromEditor(openEpoch);if(openEpoch!==editorEpoch)return;persistSessionStateSoon();}catch(e){if(openEpoch!==editorEpoch)return;setProjectStatus(`Проект открыт, но временный сеанс не удалось обновить: ${e.message}`,true);}
    if(!missingMusic&&project.exportedBlob && project.exportedFromRevision===project.revision){showRenderedBlob(project.exportedBlob,`${project.name||'NelliStudio'}_export.mp4`);renderedFromRevision=project.exportedFromRevision;renderedForProjectId=project.id;$('#render-status').textContent='Восстановлен MP4, сохранённый в этом проекте.';}
    else {if(renderedURL){URL.revokeObjectURL(renderedURL);renderedURL=null;}renderedBlob=null;renderedFromRevision=null;renderedForProjectId=null;$('#render-result').replaceChildren();$('#render-status').textContent='Для этого состояния проекта готового MP4 нет.';}
    shadow.querySelector('.tab[data-tab="video"]').click();
    if(project.mainVideo){const expected=project.trimStart||0;const apply=()=>{if(videoMetadataReady){range(expected,Math.min(Number.isFinite(project.trimEnd)?project.trimEnd:video.duration,video.duration));video.removeEventListener('loadedmetadata',apply);if(projectMetadataHandler===apply)projectMetadataHandler=null;persistSessionStateSoon();}};if(videoMetadataReady)apply();else{projectMetadataHandler=apply;video.addEventListener('loadedmetadata',apply);}}
    });}finally{app.style.pointerEvents=previousPointerEvents;projectLoading=false;renderClips();}
  }
  async function deleteProject(id) {
    try{
      await queueProject(id,async()=>{const tx=db.transaction(PROJECT_STORE,'readwrite');const done=transactionDone(tx);tx.objectStore(PROJECT_STORE).delete(id);await done;});
      if(activeProjectId===id){activeProjectId=null;activeProjectName=null;activeProjectSavedRevision=null;sessionProjectConflict=false;editorEpoch++;markProjectDirty();}
      try{await refreshProjects();setProjectStatus('Проект удалён. Текущий монтаж и временные файлы не затронуты.');}
      catch(e){setProjectStatus('Проект удалён, но список не удалось обновить: '+e.message,true);}
    }catch(e){setProjectStatus('Не удалось удалить проект: '+e.message,true);}
  }
  $('#save-project').onclick=async()=>{const btn=$('#save-project');btn.disabled=true;try{await saveProject();}catch(e){setProjectStatus(e.message||'Ошибка сохранения проекта.',true);}finally{btn.disabled=false;}};
  $('#new-project').onclick=async()=>{
    if(!confirm('Начать новый проект? Несохранённые временные материалы будут очищены. Сохранённые проекты и музыка останутся.'))return;
    const btn=$('#new-project');btn.disabled=true;
    try{
      await clearTempCache();editorEpoch++;activeProjectId=null;activeProjectName='Новый проект';activeProjectSavedRevision=null;sessionProjectConflict=false;projectRevision=0;
      selectedMixTrackId='';chooseMixTrack('');
      $('#video-gain').value=100;$('#music-gain').value=70;$('#video-mute').checked=false;$('#music-mute').checked=false;$('#fade-in').value=1;$('#fade-out').value=2;
      $('#eq-low').value=0;$('#eq-mid').value=0;$('#eq-high').value=0;applyMusicEQ();applyMixGains();
      $('#export-size').value='1080';$('#export-orientation').value='vertical';$('#export-fit').value='contain';$('#export-transition').value='fade';$('#export-fps').value='30';$('#export-quality').value='28';$('#export-music').value='';$('#export-video-gain').value=100;$('#export-music-gain').value=70;$('#export-fade-in').value=1;$('#export-fade-out').value=2;$('#export-eq-low').value=0;$('#export-eq-mid').value=0;$('#export-eq-high').value=0;$('#intro-duration').value=2;
      if(renderedURL){URL.revokeObjectURL(renderedURL);renderedURL=null;}renderedBlob=null;renderedFromRevision=null;renderedForProjectId=null;$('#render-result').replaceChildren();$('#render-status').textContent='Новый проект готов.';
      markProjectDirty();setProjectStatus('Новый проект. Он ещё не сохранён.');shadow.querySelector('.tab[data-tab="video"]').click();
    }catch(e){setProjectStatus('Не удалось начать новый проект: '+e.message,true);}finally{btn.disabled=false;}
  };

  function refreshExportMusicOptions(){const select=$('#export-music');if(!select)return;const old=select.value;select.replaceChildren();const none=document.createElement('option');none.value='';none.textContent='Без музыки';select.append(none);tracks.forEach(t=>{const o=document.createElement('option');o.value=t.id;o.textContent=t.name;select.append(o);});if(tracks.some(t=>t.id===old))select.value=old;}

  // FFmpeg.wasm export. Network requests use ScriptCat GM_xmlhttpRequest so page CSP/CORS do not block CDN access.
  function gmRequest(url, responseType='text', timeout=60000, signal=null) {
    return new Promise((resolve,reject)=>{
      if(typeof GM_xmlhttpRequest!=='function'){
        reject(new Error('GM_xmlhttpRequest недоступен. Проверь, что скрипт установлен в ScriptCat и разрешение API включено.'));
        return;
      }
      let settled=false, request=null;
      const finish=(fn,value)=>{
        if(settled)return;settled=true;
        if(signal)signal.removeEventListener('abort',abort);
        fn(value);
      };
      const abort=()=>{try{request&&request.abort();}catch(_){}finish(reject,new Error('Загрузка отменена.'));};
      if(signal){if(signal.aborted){abort();return;}signal.addEventListener('abort',abort,{once:true});}
      try{
        request=GM_xmlhttpRequest({
          method:'GET',url,responseType,timeout,anonymous:true,
          onload:response=>{
            if(response.status<200||response.status>=300){finish(reject,new Error(`HTTP ${response.status} ${response.statusText||''}`.trim()));return;}
            finish(resolve,response.responseType==='text'||responseType==='text'?(response.responseText??response.response):response.response);
          },
          onerror:error=>finish(reject,new Error(typeof error==='string'?error:(error&&error.error)||'ошибка сетевого запроса')),
          ontimeout:()=>finish(reject,new Error(`тайм-аут ${Math.round(timeout/1000)} секунд`)),
          onabort:()=>finish(reject,new Error('запрос отменён'))
        });
      }catch(error){finish(reject,error);}
    });
  }
  let ffmpegLibrary = null;
  const loadScriptOnce = (() => {
    let promise = null;
    return urls => {
      if (ffmpegLibrary && typeof ffmpegLibrary.FFmpeg === 'function') return Promise.resolve('');
      if (promise) return promise;
      const candidates = Array.isArray(urls) ? urls : [urls];
      promise = (async () => {
        const failures = [];
        for (const url of candidates) {
          try {
            const source=await gmRequest(url,'text',45000,renderAbortController&&renderAbortController.signal);
            // UMD can export through CommonJS instead of creating a global in an isolated userscript realm.
            // Direct eval deliberately sees these local module/exports bindings.
            const module = { exports: {} };
            const exports = module.exports;
            eval(`${source}\n//# sourceURL=${url}`);
            if (module.exports && typeof module.exports.FFmpeg === 'function') {
              ffmpegLibrary = module.exports;
              return url;
            }
            // Compatibility fallback for builds that attach the UMD namespace globally.
            if (globalThis.FFmpegWASM && typeof globalThis.FFmpegWASM.FFmpeg === 'function') {
              ffmpegLibrary = globalThis.FFmpegWASM;
              return url;
            }
            throw new Error('файл получен, но UMD не экспортировал класс FFmpeg (module.exports.FFmpeg отсутствует)');
          } catch (error) {
            failures.push(`${new URL(url).host}: ${error.message}`);
          }
        }
        throw new Error(`Не удалось загрузить библиотеку FFmpeg. ${failures.join('; ')}`);
      })();
      promise.catch(() => { promise = null; });
      return promise;
    };
  })();
  async function fetchBlobURL(url,mime) {
    const parentSignal=renderAbortController&&renderAbortController.signal;
    try{
      const buffer=await gmRequest(url,'arraybuffer',90000,parentSignal);
      if(!(buffer instanceof ArrayBuffer) || buffer.byteLength===0)throw new Error('CDN вернул пустой файл компонента FFmpeg.');
      return URL.createObjectURL(new Blob([buffer],{type:mime}));
    }catch(e){if(renderCancelled)throw new Error('Экспорт отменён.');throw e;}
  }
  async function fetchTextBlobURL(url,mime='text/javascript') {
    const parentSignal=renderAbortController&&renderAbortController.signal;
    try{
      const source=await gmRequest(url,'text',90000,parentSignal);
      if(typeof source!=='string'||!source.trim()||/^\s*<!doctype html|^\s*<html/i.test(source))throw new Error('CDN вернул не JavaScript-файл worker.');
      return URL.createObjectURL(new Blob([source],{type:mime}));
    }catch(e){if(renderCancelled)throw new Error('Экспорт отменён.');throw e;}
  }
  async function ensureFFmpeg() {
    if(renderEngine)return renderEngine;
    await loadScriptOnce([
      'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js',
      'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js'
    ]);
    if(renderCancelled)throw new Error('Экспорт отменён.');
    const FFmpegClass=ffmpegLibrary && ffmpegLibrary.FFmpeg;
    if(!FFmpegClass)throw new Error('Библиотека FFmpeg загрузилась некорректно.');

    // The UMD bundle is evaluated inside the userscript, where document.currentScript
    // may still point at Shedevrum's own bundle. Its default worker URL then resolves
    // to /js/v1/814.ffmpeg.js on shedevrum.ai. Download that worker explicitly and
    // expose it as a blob URL so Worker is created from the same origin context.
    const workerCandidates=[
      'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/814.ffmpeg.js',
      'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/814.ffmpeg.js'
    ];
    let classWorkerURL=null,lastWorkerError=null;
    for(const workerURL of workerCandidates){
      try{classWorkerURL=await fetchTextBlobURL(workerURL);break;}
      catch(error){lastWorkerError=error;}
    }
    if(!classWorkerURL)throw new Error(`Не удалось подготовить локальный Worker FFmpeg: ${lastWorkerError?lastWorkerError.message:'файл worker недоступен'}`);

    let engine=new FFmpegClass();renderEngine=engine;
    const bindEngineEvents=(instance)=>{
      instance.on('log',({message})=>{if(message){ffmpegLogBuffer.push(message);ffmpegLogTotal++;if(ffmpegLogBuffer.length>120)ffmpegLogBuffer.shift();$('#render-status').textContent=message.slice(-220);}});
      instance.on('progress',({progress})=>{$('#render-progress').value=Math.max(0,Math.min(100,Math.round((progress||0)*100)));});
    };
    bindEngineEvents(engine);
    // The class worker is created as a module worker. Its worker.ts first tries
    // importScripts() (which is unavailable in module workers), then falls back
    // to dynamic import(). Therefore the core must be the ESM build, not UMD:
    // UMD does not provide the default module factory expected by that branch.
    const coreBases = [
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm',
      'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm'
    ];
    let coreURL=null,wasmURL=null,lastCoreError=null,loaded=false;
    try {
      for (const coreBase of coreBases) {
        coreURL=null;wasmURL=null;
        try {
          coreURL=await fetchBlobURL(`${coreBase}/ffmpeg-core.js`,'text/javascript');
          wasmURL=await fetchBlobURL(`${coreBase}/ffmpeg-core.wasm`,'application/wasm');
          let loadTimer;
          try {
            await Promise.race([
              engine.load({coreURL,wasmURL,classWorkerURL}),
              new Promise((_,reject)=>{loadTimer=setTimeout(()=>reject(new Error('Тайм-аут инициализации FFmpeg. Перезагрузи страницу и повтори.')),90000);})
            ]);
          } finally { clearTimeout(loadTimer); }
          loaded=true;break;
        } catch (error) {
          lastCoreError=error;
          if(coreURL)URL.revokeObjectURL(coreURL);
          if(wasmURL)URL.revokeObjectURL(wasmURL);
          coreURL=null;wasmURL=null;
          try { engine.terminate(); } catch (_) {}
          if (coreBase === coreBases[coreBases.length-1]) throw error;
          engine=new FFmpegClass();renderEngine=engine;bindEngineEvents(engine);
        }
      }
      if(!loaded)throw lastCoreError||new Error('Не удалось инициализировать FFmpeg.');
    } catch(e) {
      try{engine.terminate();}catch(_){}
      renderEngine=null;
      throw new Error(`Ошибка загрузки ядра FFmpeg: ${e&&e.message?e.message:String(e)}. Используется ESM-ядро для module Worker; проверь доступность ffmpeg-core.js и ffmpeg-core.wasm, а также разрешение blob: Worker.`);
    } finally {
      if(coreURL)URL.revokeObjectURL(coreURL);
      if(wasmURL)URL.revokeObjectURL(wasmURL);
      if(classWorkerURL)URL.revokeObjectURL(classWorkerURL);
    }
    return engine;
  }
  const ffWrite = async (engine,name,data)=>engine.writeFile(name,new Uint8Array(await data.arrayBuffer()));
  async function runFF(engine,args){if(renderCancelled)throw new Error('Экспорт отменён.');const code=await engine.exec(['-y',...args]);if(code!==0)throw new Error(`FFmpeg завершился с кодом ${code}. ${ffmpegLogBuffer.slice(-5).join(' ').slice(-420)}`);}
  function showRenderedBlob(blob,filename='NelliStudio_export.mp4') {
    if(renderedURL)URL.revokeObjectURL(renderedURL);
    renderedBlob=blob;renderedURL=URL.createObjectURL(blob);
    const preview=document.createElement('video');preview.controls=true;preview.src=renderedURL;
    const link=document.createElement('a');link.href=renderedURL;link.download=filename;link.textContent='Скачать готовый MP4';
    $('#render-result').replaceChildren(preview,link);
  }
  async function renderMP4() {
    const button=$('#render-video');button.disabled=true;$('#cancel-render').disabled=false;$('#render-status').classList.remove('error');$('#render-progress').value=0;$('#render-result').replaceChildren();if(renderedURL){URL.revokeObjectURL(renderedURL);renderedURL=null;}renderedBlob=null;renderedFromRevision=null;renderedForProjectId=null;renderCancelled=false;renderAbortController=new AbortController();
    const filesToClean=[];let engine=null;let exportSucceeded=false;ffmpegLogBuffer=[];ffmpegLogTotal=0;
    const exportProjectId=activeProjectId, exportRevision=projectRevision;
    const clipSnapshot=clips.map(x=>({...x}));
    const exportMusicId=$('#export-music').value || selectedMixTrackId || '';
    const exportSettings={size:$('#export-size').value,orientation:$('#export-orientation').value,fit:$('#export-fit').value,transition:$('#export-transition').value,fps:$('#export-fps').value,quality:$('#export-quality').value,musicId:exportMusicId,videoGain:$('#export-video-gain').value,musicGain:$('#export-music-gain').value,fadeIn:$('#export-fade-in').value,fadeOut:$('#export-fade-out').value,introDuration:$('#intro-duration').value,eqLow:$('#export-eq-low').value,eqMid:$('#export-eq-mid').value,eqHigh:$('#export-eq-high').value};
    const sourceBlob=mainVideoBlob, stillBlob=firstFrameBlob;
    const musicSnapshot=exportSettings.musicId ? tracks.find(t=>t.id===exportSettings.musicId)||null : null;
    renderingNow=true;$('#render-status').classList.remove('error');
    try{
      if(clipOrderBusy||projectLoading)throw new Error('Дождись завершения текущей операции с проектом или клипами перед экспортом.');
      if(sessionProjectConflict)throw new Error('Этот проект изменён в другой вкладке. Открой его заново, чтобы загрузить актуальную версию, прежде чем сохранять.');
    if(sessionMissingMain||sessionMissingFrame||sessionMissingClipIds.length)throw new Error('Экспорт остановлен: в сеансе есть отсутствующие исходники. Восстанови их или исключи отсутствующие элементы.');
      if(!video.src||!videoMetadataReady||!video.duration||!Number.isFinite(video.duration))throw new Error('Сначала загрузи видео и дождись успешного чтения метаданных.');
      if(exportSettings.musicId && !musicSnapshot) throw new Error('Выбранная музыка не найдена в библиотеке. Открой Music Lab, проверь дорожку и выбери её заново в Export Studio.');
      if(musicSnapshot && (!(musicSnapshot.blob instanceof Blob) || musicSnapshot.blob.size===0)) throw new Error('Выбранная музыкальная дорожка пуста или недоступна. Импортируй её в Music Lab заново.');
      const start=Math.max(0,Number(a.value)||0),end=Math.min(video.duration,Number(b.value)||video.duration);
      if(end-start<0.05)throw new Error('Выбран слишком короткий фрагмент основного видео.');
      const mainBlob=sourceBlob;if(!mainBlob)throw new Error('Исходный файл не найден во временном хранилище. Повтори импорт.');
      const segments=[];
      if(stillBlob)segments.push({name:'intro-frame',blob:stillBlob,start:0,duration:Math.max(.5,Math.min(15,Number(exportSettings.introDuration)||2)),image:true});
      segments.push({name:'main',blob:mainBlob,start,duration:end-start});
      clipSnapshot.forEach((clip,i)=>segments.push({name:`clip${i}`,blob:clip.blob,start:0,duration:null}));
      engine=await ensureFFmpeg();
      const size=Number(exportSettings.size)||1080;let w=size===1080?1080:size===720?720:540,h=size===1080?1920:size===720?1280:960;if(exportSettings.orientation==='horizontal')[w,h]=[h,w];const scaleFilter=exportSettings.fit==='cover'?`scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`:`scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2`;
      const fps=Number(exportSettings.fps)||30,crf=Number(exportSettings.quality)||28;
      const videoFiles=[],audioFiles=[];let total=0;
      for(let i=0;i<segments.length;i++){
        const seg=segments[i],ext=seg.image?'png':(seg.blob.type.includes('webm')?'webm':seg.blob.type.includes('quicktime')?'mov':seg.blob.type.includes('ogg')?'ogv':'mp4');
        const input=`input_${i}.${ext}`;filesToClean.push(input);await ffWrite(engine,input,seg.blob);
        const probeOut=`segment_${i}.mp4`;const audioOut=`audio_${i}.wav`;filesToClean.push(probeOut,audioOut);
        let duration=seg.duration;
        if(duration==null){
          const tmp=document.createElement('video');const url=URL.createObjectURL(seg.blob);
          try{duration=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`Тайм-аут чтения клипа ${seg.name}.`)),20000);tmp.onloadedmetadata=()=>{clearTimeout(timer);resolve(tmp.duration);};tmp.onerror=()=>{clearTimeout(timer);reject(new Error(`Не удалось прочитать длительность клипа ${seg.name}.`));};tmp.src=url;});}finally{URL.revokeObjectURL(url);}
        }
        if(!Number.isFinite(duration)||duration<=0)throw new Error(`Некорректная длительность сегмента ${seg.name}.`);
        seg.duration=duration;total+=duration;
        const videoArgs=seg.image?['-loop','1','-framerate',String(fps),'-t',String(duration),'-i',input]:seg.name==='main'?['-ss',String(start),'-i',input,'-t',String(duration)]:['-i',input,'-t',String(duration)];
        await runFF(engine,[...videoArgs,'-vf',`${scaleFilter},setsar=1,fps=${fps},format=yuv420p`,'-an','-c:v','libx264','-preset','ultrafast','-crf',String(crf),probeOut]);
        videoFiles.push(probeOut);
        const audioArgs=seg.image?['-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-t',String(duration),'-c:a','pcm_s16le',audioOut]:seg.name==='main'?['-ss',String(start),'-i',input,'-t',String(duration),'-map','0:a:0','-vn','-ac','2','-ar','48000','-af','apad','-c:a','pcm_s16le',audioOut]:['-i',input,'-t',String(duration),'-map','0:a:0','-vn','-ac','2','-ar','48000','-af','apad','-c:a','pcm_s16le',audioOut];
        let needsSilence=!!seg.image;
        if(!seg.image){
          const logStart=ffmpegLogTotal;let audioCode;
          try{audioCode=await engine.exec(['-y',...audioArgs]);}catch(e){const log=logSince(logStart).join(' ');if(/matches no streams|does not contain any stream|matches no streams/i.test(log))needsSilence=true;else throw new Error(`Не удалось извлечь оригинальный звук из ${seg.name}: ${(log||e.message).slice(-420)}`);}
          if(audioCode!==undefined&&audioCode!==0){const log=logSince(logStart).join(' ');if(/matches no streams|does not contain any stream/i.test(log))needsSilence=true;else throw new Error(`Ошибка извлечения звука из ${seg.name}: ${(log||`код ${audioCode}`).slice(-420)}`);}
        }
        if(needsSilence)await runFF(engine,['-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-t',String(duration),'-c:a','pcm_s16le',audioOut]);
        audioFiles.push(audioOut);$('#render-progress').value=Math.round(5+((i+1)/segments.length)*70);
      }
      let outputDuration=total;
      filesToClean.push('joined_video.mp4','joined_audio.wav');
      const transition=exportSettings.transition||'cut';
      const candidateTransition=segments.length>1&&transition!=='cut'?Math.min(.5,...segments.map(x=>x.duration/2)):0;
      const transitionDuration=candidateTransition>=1/fps?candidateTransition:0;
      if(transitionDuration>0){
        const vArgs=[];videoFiles.forEach(f=>vArgs.push('-i',f));
        let graph='',previous='0:v';let elapsed=segments[0].duration;
        for(let i=1;i<segments.length;i++){
          const next=`v${i}`;const offset=Math.max(0,elapsed-transitionDuration*(i));
          graph+=`${i===1?'':' ;'}[${previous}][${i}:v]xfade=transition=${transition}:duration=${transitionDuration}:offset=${offset}[${next}]`;
          previous=next;elapsed+=segments[i].duration;
        }
        await runFF(engine,[...vArgs,'-filter_complex',graph,'-map',`[${previous}]`,'-an','-c:v','libx264','-preset','ultrafast','-crf',String(crf),'joined_video.mp4']);
        const aArgs=[];audioFiles.forEach(f=>aArgs.push('-i',f));
        let agraph='',aprev='0:a';
        for(let i=1;i<audioFiles.length;i++){
          const next=`a${i}`;agraph+=`${i===1?'':' ;'}[${aprev}][${i}:a]acrossfade=d=${transitionDuration}:c1=tri:c2=tri[${next}]`;aprev=next;
        }
        await runFF(engine,[...aArgs,'-filter_complex',agraph,'-map',`[${aprev}]`,'-c:a','pcm_s16le','joined_audio.wav']);
        outputDuration=Math.max(.05,total-transitionDuration*(segments.length-1));
      }else{
        const vlist='videos.txt',alist='audios.txt';filesToClean.push(vlist,alist);
        await engine.writeFile(vlist,new TextEncoder().encode(videoFiles.map(x=>`file '${x}'`).join('\n')));await engine.writeFile(alist,new TextEncoder().encode(audioFiles.map(x=>`file '${x}'`).join('\n')));
        await runFF(engine,['-f','concat','-safe','0','-i',vlist,'-c','copy','joined_video.mp4']);
        await runFF(engine,['-f','concat','-safe','0','-i',alist,'-c','copy','joined_audio.wav']);
      }
      $('#render-progress').value=82;$('#render-status').textContent='Сборка видеоряда и звука…';
      const musicTrack=musicSnapshot;
      const vg=Math.max(0,Math.min(150,Number(exportSettings.videoGain)||0))/100;
      const mg=Math.max(0,Math.min(150,Number(exportSettings.musicGain)||0))/100;
      let finalArgs=['-i','joined_video.mp4','-i','joined_audio.wav'];
      let filter=`[1:a]apad,atrim=duration=${outputDuration},volume=${vg}[orig]`;
      if(musicTrack){
        const mime=String(musicTrack.blob.type||'').toLowerCase();
        const musicExt=mime.includes('wav')?'wav':mime.includes('ogg')?'ogg':mime.includes('flac')?'flac':mime.includes('mp4')||mime.includes('m4a')?'m4a':mime.includes('aac')?'aac':mime.includes('webm')?'webm':'mp3';
        const musicInput=`music_track.${musicExt}`;filesToClean.push(musicInput);await ffWrite(engine,musicInput,musicTrack.blob);
        const fi=Math.max(0,Math.min(30,Number(exportSettings.fadeIn)||0));const fo=Math.max(0,Math.min(30,Number(exportSettings.fadeOut)||0));
        let mfilter=`[2:a]aresample=48000,atrim=duration=${outputDuration},asetpts=PTS-STARTPTS,volume=${mg},equalizer=f=160:width_type=q:width=0.8:g=${Math.max(-12,Math.min(12,Number(exportSettings.eqLow)||0))},equalizer=f=1000:width_type=q:width=0.8:g=${Math.max(-12,Math.min(12,Number(exportSettings.eqMid)||0))},equalizer=f=6000:width_type=q:width=0.8:g=${Math.max(-12,Math.min(12,Number(exportSettings.eqHigh)||0))}`;
        if(fi>0)mfilter+=`,afade=t=in:st=0:d=${Math.min(fi,outputDuration)}`;
        if(fo>0){const fadeOutDuration=Math.min(fo,outputDuration);mfilter+=`,afade=t=out:st=${Math.max(0,outputDuration-fadeOutDuration)}:d=${fadeOutDuration}`;}
        mfilter+='[music]';filter+=';'+mfilter+';[orig][music]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[mix]';
        finalArgs.push('-stream_loop','-1','-i',musicInput,'-filter_complex',filter,'-map','0:v:0','-map','[mix]');
      } else {filter=filter.replace('[orig]','[audio]');finalArgs.push('-filter_complex',filter,'-map','0:v:0','-map','[audio]');}
      finalArgs.push('-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart','output.mp4');
      filesToClean.push('output.mp4');
      await runFF(engine,finalArgs);
      const data=await engine.readFile('output.mp4');
      if(!data || data.length===0) throw new Error('FFmpeg создал пустой MP4-файл.');
      // Verify that the exported MP4 actually contains an audio stream before
      // presenting the render as complete.
      const verifyLogStart=ffmpegLogTotal;
      try {
        const verifyCode=await engine.exec(['-i','output.mp4','-map','0:a:0','-f','null','-']);
        if(verifyCode!==0)throw new Error(`FFmpeg завершил проверку с кодом ${verifyCode}`);
      } catch(e) { const log=logSince(verifyLogStart).join(' '); throw new Error(`Проверка готового MP4 не нашла рабочую аудиодорожку: ${(log||e.message).slice(-360)}`); }
      showRenderedBlob(new Blob([data],{type:'video/mp4'}));
      exportSucceeded=true;
      $('#render-progress').value=100;$('#render-status').classList.remove('error');$('#render-status').textContent=`Готово: ${(renderedBlob.size/1048576).toFixed(1)} MB · ${outputDuration.toFixed(2)} сек.`+(!exportProjectId?' MP4 пока не прикреплён к проекту — сохрани проект, чтобы прикрепить готовый файл.':(activeProjectId!==exportProjectId||projectRevision!==exportRevision?' Экспорт собран из предыдущего снимка; новые изменения в него не вошли.':''));
      if(exportProjectId && activeProjectId===exportProjectId && projectRevision===exportRevision){try{const tx=db.transaction(PROJECT_STORE,'readwrite');const done=transactionDone(tx);const store=tx.objectStore(PROJECT_STORE);const req=store.get(exportProjectId);let attached=false;req.onsuccess=()=>{const p=req.result;if(p&&p.revision===exportRevision){p.exportedBlob=renderedBlob;p.exportedAt=Date.now();p.exportedFromRevision=exportRevision;p.updatedAt=Date.now();store.put(p);attached=true;}};await done;if(attached){try{await refreshProjects();}catch(e){setProjectStatus('MP4 сохранён в проекте, но список не удалось обновить: '+e.message,true);}}else $('#render-status').textContent+=' MP4 готов, но не прикреплён: сначала сохрани текущие изменения проекта.';}catch(e){$('#render-status').textContent+=' MP4 готов, но не удалось прикрепить его к проекту: '+e.message;}}
    }catch(error){$('#render-status').textContent=renderCancelled?'Экспорт отменён.':(error.message||'Ошибка экспорта.');$('#render-status').classList.toggle('error',!renderCancelled);}
    finally{renderingNow=false;renderAbortController=null;if(engine){if(!exportSucceeded||renderCancelled){try{engine.terminate();}catch(_){}if(renderEngine===engine)renderEngine=null;}else{for(const name of filesToClean){try{await engine.deleteFile(name);}catch(_){}}}}button.disabled=false;$('#cancel-render').disabled=true;}
  }
  $('#render-video').onclick=renderMP4;
  $('#cancel-render').onclick=()=>{renderCancelled=true;if(renderAbortController)renderAbortController.abort();if(renderEngine){try{renderEngine.terminate();}catch(_){}renderEngine=null;}$('#render-status').textContent='Отмена экспорта…';};
  $('#export-music').addEventListener('change',()=>markProjectDirty());
  ['export-size','export-orientation','export-fit','export-transition','intro-duration','export-fps','export-quality','export-video-gain','export-music-gain','export-fade-in','export-fade-out','export-eq-low','export-eq-mid','export-eq-high'].forEach(id=>$('#'+id).addEventListener('change',markProjectDirty));

  // Capture a still frame from the currently displayed local video.
  $('#capture-frame').onclick=async()=>{
    try{
      if(!video.src||video.readyState<2)throw new Error('Сначала загрузи видео и дождись его готовности.');
      const canvas=document.createElement('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas недоступен.');ctx.drawImage(video,0,0,canvas.width,canvas.height);
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(x=>x?resolve(x):reject(new Error('Не удалось сохранить кадр.')),'image/png'));
      firstFrameBlob=blob;firstFrameStamp=Date.now();sessionMissingFrame=null;$('#remove-frame').disabled=false;$('#remove-frame').textContent='Удалить первый кадр';markProjectDirty();await persistTemp('first-frame',blob,{name:'first-frame.png',type:'image/png',stamp:firstFrameStamp,kind:'frame'});setCacheStatus('Кадр сохранён. Он будет добавлен перед основным видео при экспорте.');
    }catch(e){setCacheStatus(e.message||'Не удалось сохранить кадр.',true);}
  };
  $('#remove-frame').onclick=async()=>{frameCaptureEpoch++;const previousBlob=firstFrameBlob,previousStamp=firstFrameStamp,previousMissing=sessionMissingFrame;firstFrameBlob=null;firstFrameStamp=null;sessionMissingFrame=null;$('#remove-frame').disabled=true;$('#remove-frame').textContent='Удалить первый кадр';markProjectDirty();try{await deleteTemp('first-frame');setCacheStatus('Первый кадр удалён из временного кэша.');}catch(e){firstFrameBlob=previousBlob;firstFrameStamp=previousStamp;sessionMissingFrame=previousMissing;$('#remove-frame').disabled=!firstFrameBlob&&!sessionMissingFrame;markProjectDirty();setCacheStatus('Не удалось удалить кадр. Он восстановлен в редакторе: '+e.message,true);}};

  // Keep the source Blob available for project snapshots and export.
  const originalLoadVideo=loadVideo;
  loadVideo=function(file,options={}){
    if(!file||!file.type||!file.type.startsWith('video/')){originalLoadVideo(file);return;}
    originalLoadVideo(file);
    mainVideoBlob=file;sessionMissingMain=null;$('#remove-video').disabled=false;
    if(options.persist!==false){markProjectDirty();if(db)persistTemp('active-video',file,{name:file.name,type:file.type,lastModified:file.lastModified||0,kind:'video'}).catch(e=>setCacheStatus('Ошибка временного сохранения: '+e.message,true));}
  };

  (async () => {
    try {
      db = await openDatabase();
      tracks = await readAllTracks();
      renderTracks();
      refreshMixTrackOptions();
      refreshExportMusicOptions();
      if(mainVideoBlob)try{await persistTemp('active-video',mainVideoBlob,{name:mainVideoBlob.name||'video',type:mainVideoBlob.type||'video/mp4',lastModified:mainVideoBlob.lastModified||0,kind:'video'});}catch(e){setCacheStatus('Основное видео осталось в памяти, но не попало во временный кэш: '+e.message,true);}
      if(firstFrameBlob)try{await persistTemp('first-frame',firstFrameBlob,{name:'first-frame.png',type:'image/png',stamp:firstFrameStamp||0,kind:'frame'});}catch(e){setCacheStatus('Первый кадр остался в памяти, но не попал во временный кэш: '+e.message,true);}
      try{await restoreTempSession();}catch(e){setCacheStatus('Не удалось восстановить временный сеанс: '+e.message,true);}
      await refreshProjects();
      persistSessionStateSoon();
      setLibraryStatus(`Локальная библиотека готова. Найдено композиций: ${tracks.length}.`);$('#ns-launch').disabled=false;$('#ns-launch').textContent='✦ NELLI STUDIO';
    } catch (error) {
      setLibraryStatus(error.message || 'Локальная библиотека недоступна.', true);
      $('#pick-audio').disabled = true;$('#ns-launch').disabled=false;$('#ns-launch').textContent='NELLI STUDIO · ОШИБКА';
    }
  })();

  window.addEventListener('pagehide', event => {
    if(event.persisted)return;
    renderCancelled = true;
    let sessionFlush=null;
    if(sessionSaveTimer){clearTimeout(sessionSaveTimer);sessionSaveTimer=null;sessionFlush=persistSessionStateNow().catch(()=>{});}
    if (renderEngine) { try { renderEngine.terminate(); } catch (_) {} renderEngine = null; }
    if (renderedURL) URL.revokeObjectURL(renderedURL);
    if (audioURL) URL.revokeObjectURL(audioURL);
    if (videoURL) URL.revokeObjectURL(videoURL);
    if (db) { const closingDb=db; if(sessionFlush)sessionFlush.finally(()=>closingDb.close()); else closingDb.close(); }
    if (mixContext && mixContext.state !== 'closed') mixContext.close().catch(() => {});
  });

})();
