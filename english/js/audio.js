// Аудіо-движок v3: Підтримка чоловічого голосу (Male Voice), Web Speech API
// та Speech-to-Text (STT) для тренування спікінгу через мікрофон

class SoundEngine {
  constructor() {
    this.muted = localStorage.getItem('linguo_muted') === 'true';
    this.gender = localStorage.getItem('linguo_voice_gender') || 'male'; // За замовчуванням ЧОЛОВІЧИЙ ГОЛОС!
    this.audioCtx = null;
    this.synth = window.speechSynthesis || null;
    this.maleVoice = null;
    this.femaleVoice = null;

    // STT (Розпізнавання голосу для спікінгу)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
    this.isRecording = false;

    // Dual-Mode Audio Capture (для Zen Browser / Firefox через MediaRecorder)
    this.mediaRecorder = null;
    this.mediaStream = null;
    this.recordedChunks = [];
    this.isMediaRecording = false;

    if (this.synth) {
      this.initVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }

    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    // Шукаємо ЧОЛОВІЧІ голоси (David, Guy, Mark, UK Male, Daniel, Alex)
    const maleNames = [
      'Microsoft Guy Online (Natural)',
      'Microsoft David Desktop',
      'Microsoft David',
      'Microsoft Mark',
      'Google UK English Male',
      'Daniel',
      'Alex',
      'Oliver',
      'George',
      'Fred'
    ];

    for (const name of maleNames) {
      const found = voices.find(v => (v.name.includes(name) || v.name === name) && v.lang.startsWith('en'));
      if (found) {
        this.maleVoice = found;
        break;
      }
    }

    if (!this.maleVoice) {
      this.maleVoice = voices.find(v => v.lang.startsWith('en') && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david'))) ||
                       voices.find(v => v.lang.startsWith('en')) || null;
    }

    // Жіночий альтернативний голос
    this.femaleVoice = voices.find(v => (v.name.includes('Jenny') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google US English')) && v.lang.startsWith('en')) ||
                       voices.find(v => v.lang.startsWith('en')) || null;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('linguo_muted', this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  setGender(gender) {
    this.gender = gender === 'female' ? 'female' : 'male';
    localStorage.setItem('linguo_voice_gender', this.gender);
    return this.gender;
  }

  getGender() {
    return this.gender;
  }

  toggleGender() {
    return this.setGender(this.gender === 'male' ? 'female' : 'male');
  }

  // Озвучення тексту ЧОЛОВІЧИМ голосом
  speak(text) {
    if (this.muted || !text || !this.synth) return;
    const cleanText = text.trim();

    try {
      this.synth.cancel(); // зупинити попереднє озвучення
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';

      if (this.gender === 'male') {
        if (this.maleVoice) {
          utterance.voice = this.maleVoice;
        }
        // Більш низький, глибокий та впевнений чоловічий тембр
        utterance.pitch = 0.86;
        utterance.rate = 0.90;
      } else {
        if (this.femaleVoice) {
          utterance.voice = this.femaleVoice;
        }
        utterance.pitch = 1.05;
        utterance.rate = 0.92;
      }

      this.synth.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }

  // ===== SPEECH RECOGNITION (Спікінг через мікрофон) =====
  async startListening(callbacks = {}) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SpeechRecognition) {
      if (callbacks.onError) callbacks.onError("not_supported");
      return;
    }

    if (this.isRecording) {
      this.stopListening();
      return;
    }

    // 1. Запитуємо явний дозвіл на мікрофон у браузера через getUserMedia
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Одразу зупиняємо тестовий стрім, дозвіл зафіксовано в браузері
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (permErr) {
      console.warn("Мікрофон недоступний або заблокований:", permErr);
      if (callbacks.onError) callbacks.onError("not-allowed");
      return;
    }

    // 2. Створюємо СВІЖИЙ екземпляр SpeechRecognition для поточної сесії
    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
    } catch (initErr) {
      console.warn("Помилка ініціалізації розпізнавання:", initErr);
      if (callbacks.onError) callbacks.onError("init_failed");
      return;
    }

    this.isRecording = true;
    this.accumulatedText = this.accumulatedText || '';
    let currentSessionFinal = '';

    this.recognition.onstart = () => {
      if (callbacks.onStart) callbacks.onStart();
    };

    this.recognition.onresult = (event) => {
      let finalChunk = '';
      let interimChunk = '';

      for (let i = 0; i < event.results.length; ++i) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += text + ' ';
        } else {
          interimChunk += text;
        }
      }

      currentSessionFinal = finalChunk;
      const combined = (this.accumulatedText + ' ' + finalChunk + ' ' + interimChunk).replace(/\s+/g, ' ').trim();

      if (callbacks.onResult) {
        callbacks.onResult({
          full: combined,
          interim: interimChunk,
          final: (this.accumulatedText + ' ' + finalChunk).trim()
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === 'no-speech') {
        // Користувач просто взяв паузу для роздумів — НЕ вимикаємо запис!
        return;
      }
      if (event.error === 'not-allowed') {
        this.isRecording = false;
        if (callbacks.onError) callbacks.onError("not-allowed");
        return;
      }
      if (event.error === 'network') {
        this.isRecording = false;
        if (callbacks.onError) callbacks.onError("network");
        return;
      }
    };

    this.recognition.onend = () => {
      // Якщо сесія завершилася сама (через паузу), але користувач НЕ натискав Стоп:
      if (this.isRecording) {
        if (currentSessionFinal) {
          this.accumulatedText = (this.accumulatedText + ' ' + currentSessionFinal).trim();
          currentSessionFinal = '';
        }
        try {
          this.recognition.start();
          return;
        } catch (e) {
          // Якщо не вдалося перезапустити
        }
      }

      this.isRecording = false;
      const finalText = (this.accumulatedText + ' ' + currentSessionFinal).trim();
      if (callbacks.onEnd) callbacks.onEnd(finalText);
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition start failed:", e);
      this.isRecording = false;
      if (callbacks.onError) callbacks.onError(e.message || "start_failed");
    }
  }

  stopListening() {
    this.isRecording = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }

  resetListeningBuffer() {
    this.accumulatedText = '';
  }

  // ===== DUAL-MODE AUDIO RECORDING (ZEN BROWSER / FIREFOX SUPPORT) =====
  hasSpeechRecognition() {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  hasMediaRecorder() {
    return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  }

  isRecordingActive() {
    return Boolean(this.isRecording || this.isMediaRecording);
  }

  async startMediaRecording(callbacks = {}) {
    if (!this.hasMediaRecorder()) {
      if (callbacks.onError) callbacks.onError("not_supported");
      return;
    }

    if (this.isMediaRecording) {
      this.stopMediaRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaStream = stream;

      let mimeType = '';
      if (window.MediaRecorder.isTypeSupported && window.MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (window.MediaRecorder.isTypeSupported && window.MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      } else if (window.MediaRecorder.isTypeSupported && window.MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (window.MediaRecorder.isTypeSupported && window.MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      this.mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      this.recordedChunks = [];
      this.isMediaRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstart = () => {
        if (callbacks.onStart) callbacks.onStart();
      };

      this.mediaRecorder.onerror = (err) => {
        console.warn("MediaRecorder error:", err);
        this.isMediaRecording = false;
        this.cleanupMediaStream();
        if (callbacks.onError) callbacks.onError(err);
      };

      this.mediaRecorder.onstop = async () => {
        this.isMediaRecording = false;
        this.cleanupMediaStream();

        const actualType = this.mediaRecorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(this.recordedChunks, { type: actualType });
        this.recordedChunks = [];

        try {
          const base64Data = await this.blobToBase64(audioBlob);
          if (callbacks.onComplete) {
            callbacks.onComplete({
              blob: audioBlob,
              base64: base64Data,
              mimeType: actualType
            });
          }
        } catch (convErr) {
          if (callbacks.onError) callbacks.onError(convErr);
        }
      };

      this.mediaRecorder.start(250);
    } catch (err) {
      console.warn("Помилка захоплення мікрофона через getUserMedia:", err);
      this.isMediaRecording = false;
      this.cleanupMediaStream();
      if (callbacks.onError) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          callbacks.onError('not-allowed');
        } else {
          callbacks.onError(err.name || 'stream_failed');
        }
      }
    }
  }

  stopMediaRecording() {
    this.isMediaRecording = false;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        console.warn("stopMediaRecording error:", e);
      }
    }
  }

  cleanupMediaStream() {
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach(track => track.stop());
      } catch (e) {}
      this.mediaStream = null;
    }
  }

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        if (typeof dataUrl === 'string') {
          const commaIdx = dataUrl.indexOf(',');
          resolve(commaIdx !== -1 ? dataUrl.substring(commaIdx + 1) : dataUrl);
        } else {
          reject(new Error("Не вдалося конвертувати аудіо в base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // ===== ЗВУКОВІ ЕФЕКТИ =====
  playCorrect() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.07);
      gain.gain.setValueAtTime(0.001, now + index * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.07 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.07 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + index * 0.07);
      osc.stop(now + index * 0.07 + 0.32);
    });
  }

  playWrong() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [220, 180].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.12, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.2);
    });
  }

  playClick() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playFanfare() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [440, 554.37, 659.25, 880, 1108.73];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.09);
      gain.gain.setValueAtTime(0.2, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.48);
    });
  }
}

window.sound = new SoundEngine();
