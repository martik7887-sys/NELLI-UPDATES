// ==UserScript==
// @name         NELLI STUDIO — Music Player
// @namespace    https://nelli.studio/
// @version      0.1.3
// @description  Собственный локальный музыкальный плеер NELLI STUDIO: плейлист, волна, перемотка, громкость и скорость
// @match        *://*/*
// @run-at       document-idle
// @grant        none
// @license      MIT
// @updateURL    https://cdn.jsdelivr.net/gh/martik7887-sys/NELLI-UPDATES@main/Nelli-Music-Player.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/martik7887-sys/NELLI-UPDATES@main/Nelli-Music-Player.user.js
// @supportURL   https://github.com/martik7887-sys/NELLI-UPDATES/issues
// ==/UserScript==

(() => {
  'use strict';

  if (window.__NELLI_STUDIO_MUSIC_PLAYER__) return;
  window.__NELLI_STUDIO_MUSIC_PLAYER__ = true;

  const HOST_ID = 'nelli-studio-music-player-host';
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.cssText = 'all:initial;position:fixed;z-index:2147483647;right:18px;bottom:18px;';
  document.documentElement.appendChild(host);

  const root = host.attachShadow({ mode: 'open' });

  root.innerHTML = `
    <style>
      :host{all:initial;color-scheme:dark;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif}
      *{box-sizing:border-box}
      button,input{font:inherit}
      button{cursor:pointer}
      .launcher{width:58px;height:58px;border:1px solid #9c83d8;border-radius:50%;
        color:#fff;background:linear-gradient(145deg,#9274d0,#51417d);
        box-shadow:0 8px 28px #0008;font-size:23px}
      .panel{position:fixed;right:18px;bottom:88px;width:min(390px,calc(100vw - 28px));
        max-height:min(78vh,690px);overflow:auto;padding:16px;border-radius:20px;
        border:1px solid #4b4260;background:#171722;color:#f4f1fa;
        box-shadow:0 18px 60px #000b;display:none}
      .panel.open{display:block}
      .top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
      .brand{font-size:15px;font-weight:800;letter-spacing:.12em}
      .sub{font-size:11px;color:#aaa4bb;margin-top:3px}
      .close{border:0;background:#302b3c;color:#ddd5ef;border-radius:9px;padding:7px 10px}
      .drop{border:1px dashed #75658e;border-radius:13px;padding:13px;text-align:center;
        color:#c8bedb;background:#211e2c;font-size:12px}
      .drop strong{display:block;color:#fff;font-size:13px;margin-bottom:4px}
      .actions{display:flex;gap:7px;margin-top:10px}
      .btn{border:1px solid #514765;background:#2a2636;color:#f5f0ff;border-radius:10px;padding:8px 11px;font-size:12px}
      .btn.primary{background:#a78bdd;color:#171322;border-color:#a78bdd;font-weight:750}
      .btn:disabled{opacity:.4;cursor:not-allowed}
      .track{margin:14px 0 8px}
      .title{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .meta{font-size:11px;color:#aaa4b8;margin-top:3px}
      canvas{display:block;width:100%;height:88px;margin:10px 0 4px;border-radius:9px;
        background:#11111a;cursor:pointer}
      .times{display:flex;justify-content:space-between;font-size:10px;color:#aaa4b8;font-variant-numeric:tabular-nums}
      .transport{display:flex;align-items:center;justify-content:center;gap:10px;margin:13px 0}
      .transport button{border:0;color:#f8f4ff;background:#302b3e;border-radius:50%;width:38px;height:38px;font-size:15px}
      .transport .play{width:48px;height:48px;background:#a78bdd;color:#171322;font-size:19px}
      .sliders{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}
      .control label{display:flex;justify-content:space-between;font-size:10px;color:#bcb4cc;margin-bottom:5px}
      input[type=range]{width:100%;accent-color:#b69be8}
      .queue-head{display:flex;justify-content:space-between;align-items:center;margin:14px 0 7px}
      .queue-head strong{font-size:11px;letter-spacing:.08em;color:#cfc6df}
      .queue{display:flex;flex-direction:column;gap:5px;max-height:150px;overflow:auto}
      .item{display:flex;align-items:center;gap:8px;border:1px solid transparent;border-radius:9px;
        padding:7px 8px;background:#211f2c;min-width:0}
      .item.active{border-color:#9077c4;background:#30283e}
      .item button{border:0;background:transparent;color:#eee8f8;text-align:left;min-width:0;flex:1;
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}
      .item small{color:#9f96af;font-size:10px}
      .empty{font-size:11px;color:#8f879e;padding:9px 3px}
      .foot{font-size:10px;color:#827b90;margin-top:12px;line-height:1.4}
      @media(max-width:480px){.panel{right:10px;bottom:82px;width:calc(100vw - 20px);padding:13px}}
    </style>
    <button class="launcher" id="launcher" title="Открыть NELLI STUDIO Player" aria-label="Открыть плеер">♫</button>
    <section class="panel" id="panel" aria-label="NELLI STUDIO Music Player">
      <div class="top">
        <div><div class="brand">NELLI STUDIO 🔱</div><div class="sub">MUSIC PLAYER · LOCAL AUDIO</div></div>
        <button class="close" id="close">Закрыть</button>
      </div>
      <div class="drop" id="drop">
        <strong>Добавить музыку</strong>
        Перетащите аудиофайлы сюда или выберите их на устройстве
        <div class="actions" style="justify-content:center">
          <button class="btn primary" id="choose">Выбрать файлы</button>
          <button class="btn" id="clear">Очистить список</button>
        </div>
        <input id="files" type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac" multiple hidden>
      </div>
      <div class="track">
        <div class="title" id="trackTitle">Музыка ещё не добавлена</div>
        <div class="meta" id="trackMeta">Выберите один или несколько аудиофайлов</div>
        <canvas id="wave" width="720" height="176" aria-label="Звуковая волна; нажмите для перемотки"></canvas>
        <div class="times"><span id="current">0:00</span><span id="duration">0:00</span></div>
      </div>
      <div class="transport">
        <button id="prev" title="Предыдущий трек" aria-label="Предыдущий">|◀</button>
        <button class="play" id="play" title="Воспроизвести" aria-label="Воспроизвести">▶</button>
        <button id="next" title="Следующий трек" aria-label="Следующий">▶|</button>
      </div>
      <div class="sliders">
        <div class="control"><label><span>Громкость</span><span id="volText">80%</span></label><input id="volume" type="range" min="0" max="1" step="0.01" value="0.8"></div>
        <div class="control"><label><span>Скорость</span><span id="speedText">1.0×</span></label><input id="speed" type="range" min="0.5" max="2" step="0.1" value="1"></div>
      </div>
      <div class="queue-head"><strong>ПЛЕЙЛИСТ</strong><span class="meta" id="count">0 треков</span></div>
      <div class="queue" id="queue"><div class="empty">Здесь появятся выбранные композиции</div></div>
      <div class="foot">Файлы воспроизводятся локально в браузере. Они не загружаются на сервер. Закрытие вкладки завершает текущую сессию плеера.</div>
    </section>
    <audio id="audio" preload="metadata"></audio>
  `;

  const $ = (selector) => root.querySelector(selector);
  const audio = $('#audio');
  const canvas = $('#wave');
  const ctx = canvas.getContext('2d');
  const state = { files: [], urls: [], index: -1, peaks: [], raf: 0, drag: false };
  const colors = { base: '#554b69', played: '#c4a3f5', cursor: '#fff0c9' };

  function formatTime(value) {
    if (!Number.isFinite(value) || value < 0) return '0:00';
    const seconds = Math.floor(value);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function currentFile() {
    return state.files[state.index] || null;
  }

  function drawWave(progress = 0) {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#11111a';
    ctx.fillRect(0, 0, w, h);

    if (!state.peaks.length) {
      ctx.strokeStyle = '#554b69';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      return;
    }

    const count = state.peaks.length;
    const step = w / count;
    const barW = Math.max(1.5, step * 0.62);
    for (let i = 0; i < count; i++) {
      const x = i * step + (step - barW) / 2;
      const amp = Math.max(2, state.peaks[i] * (h * 0.43));
      ctx.fillStyle = (i / count) <= progress ? colors.played : colors.base;
      const y = (h - amp) / 2;
      const radius = Math.min(barW / 2, 4);
      ctx.beginPath();
      ctx.roundRect(x, y, barW, amp, radius);
      ctx.fill();
    }

    const cursorX = Math.max(0, Math.min(w, progress * w));
    ctx.strokeStyle = colors.cursor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cursorX, 8);
    ctx.lineTo(cursorX, h - 8);
    ctx.stroke();
  }

  function renderProgress() {
    if (!audio.duration) return;
    const p = audio.currentTime / audio.duration;
    drawWave(p);
    $('#current').textContent = formatTime(audio.currentTime);
    $('#duration').textContent = formatTime(audio.duration);
  }

  function tick() {
    renderProgress();
    if (!audio.paused && !audio.ended) state.raf = requestAnimationFrame(tick);
  }

  async function makePeaks(file) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return [];
    let audioContext;
    try {
      audioContext = new AudioContextClass();
      const buffer = await file.arrayBuffer();
      const decoded = await audioContext.decodeAudioData(buffer);
      const channel = decoded.getChannelData(0);
      const bins = 180;
      const block = Math.max(1, Math.floor(channel.length / bins));
      const peaks = [];
      for (let i = 0; i < bins; i++) {
        const start = i * block;
        const end = Math.min(channel.length, start + block);
        let max = 0;
        for (let j = start; j < end; j++) {
          const value = Math.abs(channel[j]);
          if (value > max) max = value;
        }
        peaks.push(max);
      }
      return peaks;
    } catch (error) {
      console.warn('[NELLI PLAYER] Не удалось построить волну:', error);
      return [];
    } finally {
      if (audioContext && audioContext.close) audioContext.close().catch(() => {});
    }
  }

  function updateQueue() {
    const queue = $('#queue');
    queue.innerHTML = '';
    $('#count').textContent = `${state.files.length} трек(ов)`;
    if (!state.files.length) {
      queue.innerHTML = '<div class="empty">Здесь появятся выбранные композиции</div>';
      return;
    }
    state.files.forEach((file, index) => {
      const row = document.createElement('div');
      row.className = `item${index === state.index ? ' active' : ''}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = file.name;
      button.title = file.name;
      button.addEventListener('click', () => loadTrack(index, true));
      const size = document.createElement('small');
      size.textContent = `${Math.max(1, Math.round(file.size / 1024))} KB`;
      row.append(button, size);
      queue.appendChild(row);
    });
  }

  async function loadTrack(index, autoplay = false) {
    if (index < 0 || index >= state.files.length) return;
    audio.pause();
    cancelAnimationFrame(state.raf);
    state.index = index;
    const file = currentFile();
    audio.src = state.urls[index];
    audio.load();
    $('#trackTitle').textContent = file.name;
    $('#trackMeta').textContent = `${file.type || 'Аудиофайл'} · ${Math.max(1, (file.size / 1048576)).toFixed(1)} MB`;
    $('#current').textContent = '0:00';
    $('#duration').textContent = '0:00';
    state.peaks = [];
    drawWave(0);
    updateQueue();
    state.peaks = await makePeaks(file);
    if (state.index !== index) return;
    drawWave(0);
    if (autoplay) {
      try {
        await audio.play();
        $('#play').textContent = 'Ⅱ';
        state.raf = requestAnimationFrame(tick);
      } catch (error) {
        $('#trackMeta').textContent = 'Браузер не разрешил автозапуск. Нажмите ▶.';
      }
    }
  }

  function addFiles(fileList) {
    const incoming = Array.from(fileList || []).filter(file => file && (file.type.startsWith('audio/') || /\.(mp3|wav|m4a|aac|ogg|flac|opus)$/i.test(file.name)));
    for (const file of incoming) {
      state.files.push(file);
      state.urls.push(URL.createObjectURL(file));
    }
    updateQueue();
    if (state.index === -1 && state.files.length) loadTrack(0, false);
  }

  function clearPlaylist() {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    cancelAnimationFrame(state.raf);
    state.urls.forEach(url => URL.revokeObjectURL(url));
    state.files = [];
    state.urls = [];
    state.peaks = [];
    state.index = -1;
    $('#trackTitle').textContent = 'Музыка ещё не добавлена';
    $('#trackMeta').textContent = 'Выберите один или несколько аудиофайлов';
    $('#current').textContent = '0:00';
    $('#duration').textContent = '0:00';
    $('#play').textContent = '▶';
    updateQueue();
    drawWave(0);
  }

  function seekFromPointer(event) {
    if (!audio.duration) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const position = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    audio.currentTime = position * audio.duration;
    renderProgress();
  }

  $('#launcher').addEventListener('click', () => $('#panel').classList.toggle('open'));
  $('#close').addEventListener('click', () => $('#panel').classList.remove('open'));
  $('#choose').addEventListener('click', () => $('#files').click());
  $('#files').addEventListener('change', event => {
    addFiles(event.target.files);
    event.target.value = '';
  });
  $('#clear').addEventListener('click', clearPlaylist);

  $('#play').addEventListener('click', async () => {
    if (!currentFile()) {
      $('#files').click();
      return;
    }
    if (audio.paused) {
      try {
        await audio.play();
        $('#play').textContent = 'Ⅱ';
        cancelAnimationFrame(state.raf);
        state.raf = requestAnimationFrame(tick);
      } catch (error) {
        $('#trackMeta').textContent = 'Не удалось запустить этот аудиофайл.';
      }
    } else {
      audio.pause();
      $('#play').textContent = '▶';
      cancelAnimationFrame(state.raf);
      renderProgress();
    }
  });

  $('#prev').addEventListener('click', () => {
    if (state.files.length) loadTrack((state.index - 1 + state.files.length) % state.files.length, true);
  });
  $('#next').addEventListener('click', () => {
    if (state.files.length) loadTrack((state.index + 1) % state.files.length, true);
  });
  $('#volume').addEventListener('input', event => {
    audio.volume = Number(event.target.value);
    $('#volText').textContent = `${Math.round(audio.volume * 100)}%`;
  });
  $('#speed').addEventListener('input', event => {
    audio.playbackRate = Number(event.target.value);
    $('#speedText').textContent = `${audio.playbackRate.toFixed(1)}×`;
  });

  canvas.addEventListener('click', seekFromPointer);
  canvas.addEventListener('pointerdown', event => {
    state.drag = true;
    canvas.setPointerCapture(event.pointerId);
    seekFromPointer(event);
  });
  canvas.addEventListener('pointermove', event => {
    if (state.drag) seekFromPointer(event);
  });
  canvas.addEventListener('pointerup', () => { state.drag = false; });
  canvas.addEventListener('pointercancel', () => { state.drag = false; });

  audio.addEventListener('loadedmetadata', () => {
    $('#duration').textContent = formatTime(audio.duration);
  });
  audio.addEventListener('timeupdate', renderProgress);
  audio.addEventListener('play', () => {
    $('#play').textContent = 'Ⅱ';
    cancelAnimationFrame(state.raf);
    state.raf = requestAnimationFrame(tick);
  });
  audio.addEventListener('pause', () => {
    $('#play').textContent = '▶';
    cancelAnimationFrame(state.raf);
  });
  audio.addEventListener('ended', () => {
    if (state.index < state.files.length - 1) loadTrack(state.index + 1, true);
    else {
      $('#play').textContent = '▶';
      renderProgress();
    }
  });

  const drop = $('#drop');
  ['dragenter', 'dragover'].forEach(type => drop.addEventListener(type, event => {
    event.preventDefault();
    drop.style.borderColor = '#c4a3f5';
  }));
  ['dragleave', 'drop'].forEach(type => drop.addEventListener(type, event => {
    event.preventDefault();
    drop.style.borderColor = '#75658e';
  }));
  drop.addEventListener('drop', event => addFiles(event.dataTransfer.files));

  audio.volume = 0.8;
  drawWave(0);
  updateQueue();
})();
