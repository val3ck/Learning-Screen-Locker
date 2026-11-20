// Менеджер локального сховища та повного збереження стану v3
// Зберігає: всі позиції карток, тести, стрік, XP, кастомні слова, обраний чоловічий голос та історію

class StorageManager {
  constructor() {
    this.STORAGE_KEY = 'linguo_app_state_v3';
    this.state = this.loadState();
    // Daily streak is awarded by the lesson engine on completion.
    // Remove obsolete browser-stored credentials; enter a fresh key on the server.
    /* Kept until the explicit browser-key migration succeeds. */
  }

  getDefaultState() {
    return {
      xp: 0,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      voiceGender: 'male', // Мужський голос за замовчуванням
      learnedWords: {}, // { [wordId]: { learnedAt: string, mastery: number } }
      customWords: [],
      currentIndices: {
        flashcard: 0,
        situation: 0,
        sentenceBuilder: 0,
        letterScramble: 0,
        grammarQuiz: 0,
        errorHunter: 0
      },
      activeNav: {
        tab: 'daily',
        grammarSubtab: 'matrix',
        vocabSubtab: 'study',
        practiceMode: 'sentences'
      },
      completedPractices: {
        sentences: [],
        letters: [],
        quizzes: [],
        errors: [],
        situations: []
      },
      aiEvaluations: {
        sentencesCount: 0,
        speakingCount: 0,
        totalSentenceScore: 0,
        totalSpeakingScore: 0
      },
      completedSpeakingTopics: {}, // { [topicId]: { completed: boolean, completedAt: string, bestScore: number } }
      completedMilestones: {}, // { [milestoneId]: { completed: boolean, completedAt: string, xpEarned: number } }
      lessonReminder: {
        enabled: true,
        time: '19:00',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        goalMinutes: 55,
        soundAlert: true,
        lastNotifiedDate: null
      }
    };
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const def = this.getDefaultState();
        return {
          ...def,
          ...parsed,
          currentIndices: { ...def.currentIndices, ...(parsed.currentIndices || {}) },
          activeNav: { ...def.activeNav, ...(parsed.activeNav || {}) },
          completedPractices: { ...def.completedPractices, ...(parsed.completedPractices || {}) },
          aiEvaluations: { ...def.aiEvaluations, ...(parsed.aiEvaluations || {}) },
          completedSpeakingTopics: { ...(parsed.completedSpeakingTopics || {}) },
          completedMilestones: { ...(parsed.completedMilestones || {}) },
          lessonReminder: { ...def.lessonReminder, ...(parsed.lessonReminder || {}) }
        };
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
    return this.getDefaultState();
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
      this.triggerSaveIndicator();
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }

  triggerSaveIndicator() {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('stat-saved-display');
    if (el) {
      el.style.opacity = '1';
      setTimeout(() => {
        if (el) el.style.opacity = '0.7';
      }, 1200);
    }
  }

  // --- ЗБЕРЕЖЕННЯ ІНДЕКСІВ (ПОТОЧНОЇ КАРТКИ, ПИТАННЯ ТОЩО) ---
  getIndex(key, defaultVal = 0) {
    if (this.state.currentIndices && this.state.currentIndices[key] !== undefined) {
      return this.state.currentIndices[key];
    }
    return defaultVal;
  }

  setIndex(key, value) {
    if (!this.state.currentIndices) this.state.currentIndices = {};
    this.state.currentIndices[key] = value;
    this.save();
  }

  // --- ЗБЕРЕЖЕННЯ АКТИВНОЇ ВКЛАДКИ ---
  getActiveNav(key, defaultVal = '') {
    return this.state.activeNav?.[key] || defaultVal;
  }

  setActiveNav(key, value) {
    if (!this.state.activeNav) this.state.activeNav = {};
    this.state.activeNav[key] = value;
    this.save();
  }

  // --- ПЕРЕВІРКА СТРІКУ ДНІВ ---
  checkStreak() {
    const today = new Date().toISOString().split('T')[0];
    const last = this.state.lastActiveDate;

    if (!last) {
      this.state.lastActiveDate = today;
      this.state.streak = 1;
      this.save();
      return;
    }

    if (last === today) {
      return;
    }

    const lastDate = new Date(last);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      this.state.streak += 1;
    } else if (diffDays > 1) {
      this.state.streak = 1;
    }
    this.state.lastActiveDate = today;
    this.save();
  }

  // --- СЛОВА ---
  isWordLearned(wordId) {
    return !!this.state.learnedWords[wordId];
  }

  markWordLearned(wordId) {
    if (!this.state.learnedWords[wordId]) {
      this.state.learnedWords[wordId] = {
        learnedAt: new Date().toLocaleDateString('uk-UA'),
        mastery: 1
      };
      this.save();
      return true;
    } else {
      this.state.learnedWords[wordId].mastery = Math.min(5, this.state.learnedWords[wordId].mastery + 1);
      this.save();
      return false;
    }
  }

  unlearnWord(wordId) {
    if (this.state.learnedWords[wordId]) {
      delete this.state.learnedWords[wordId];
      this.save();
    }
  }

  getLearnedWordsMap() {
    return this.state.learnedWords;
  }

  getLearnedCount() {
    return Object.keys(this.state.learnedWords).length;
  }

  // Додати власне слово
  addCustomWord(wordData) {
    const newWord = {
      id: 'custom-' + Date.now(),
      word: wordData.word.trim(),
      transcription: wordData.transcription ? wordData.transcription.trim() : '',
      ukr: wordData.ukr.trim(),
      category: 'custom',
      level: 'Custom B1/B2',
      whereToUse: wordData.whereToUse || 'Власний контекст',
      example: wordData.example ? wordData.example.trim() : '',
      exampleUkr: wordData.exampleUkr ? wordData.exampleUkr.trim() : '',
      tip: 'Власне додане слово'
    };
    this.state.customWords.push(newWord);
    this.markWordLearned(newWord.id);
    this.save();
    return newWord;
  }

  deleteCustomWord(wordId) {
    this.state.customWords = this.state.customWords.filter(w => w.id !== wordId);
    this.unlearnWord(wordId);
    this.save();
  }

  getAllVocabulary() {
    return [...VOCABULARY_DATA, ...this.state.customWords];
  }

  // --- XP ТА ЗВАННЯ ---
  addXP(amount) {
    if (amount <= 0) return;
    this.state.xp += amount;
    this.save();
  }

  getXP() {
    return this.state.xp;
  }

  getLevel() {
    const xp = this.state.xp;
    if (xp < 300) {
      return { level: 1, title: "Street Tourist 🎒", min: 0, max: 300, desc: "Вуличний турист (London is the capital of Great Britain)" };
    }
    if (xp < 800) {
      return { level: 2, title: "Coffee Shop Survivor ☕", min: 300, max: 800, desc: "Можеш замовити каву з вівсяним молоком без паніки" };
    }
    if (xp < 1500) {
      return { level: 3, title: "Tech Standup Warrior 💻", min: 800, max: 1500, desc: "Вже не пітнієш, коли на дейлі питають: What did you do yesterday?" };
    }
    if (xp < 2500) {
      return { level: 4, title: "Sarcastic Fluent 🍸", min: 1500, max: 2500, desc: "Розумієш британський сарказм та маніпулятивні офісні фрази" };
    }
    return { level: 5, title: "English Overlord 👑", min: 2500, max: 5000, desc: "Говориш краще за прем'єра Британії. Повний контроль над мовою!" };
  }

  getStreak() {
    return this.state.streak;
  }

  // Запис проходження практик
  recordPracticeCompletion(type, taskId, xpEarned = 20) {
    if (!this.state.completedPractices[type]) {
      this.state.completedPractices[type] = [];
    }
    const isNew = !this.state.completedPractices[type].includes(taskId);
    if (isNew) {
      this.state.completedPractices[type].push(taskId);
      this.addXP(xpEarned);
    } else {
      this.addXP(Math.round(xpEarned * 0.3));
    }
    this.save();
    return isNew;
  }

  recordAISentenceScore(score, xp) {
    this.state.aiEvaluations.sentencesCount += 1;
    this.state.aiEvaluations.totalSentenceScore += score;
    this.addXP(xp);
    this.save();
  }

  recordAISpeakingScore(score, xp) {
    this.state.aiEvaluations.speakingCount += 1;
    this.state.aiEvaluations.totalSpeakingScore += score;
    this.addXP(xp);
    this.save();
  }

  // --- КАТАЛОГ РОЗМОВНИХ ТЕМ (SPEAKING TOPICS PROGRESS & CHECKMARKS) ---
  toggleSpeakingTopicCompleted(topicId, score = null) {
    if (!this.state.completedSpeakingTopics) {
      this.state.completedSpeakingTopics = {};
    }

    const current = this.state.completedSpeakingTopics[topicId];
    if (current && current.completed) {
      // Якщо вже викреслена — повертаємо назад в активні
      delete this.state.completedSpeakingTopics[topicId];
      this.save();
      return false; // Тепер не пройдена
    } else {
      // Викреслюємо (позначаємо як пройдену)
      this.state.completedSpeakingTopics[topicId] = {
        completed: true,
        completedAt: new Date().toLocaleDateString('uk-UA'),
        bestScore: score || (current?.bestScore || 100)
      };
      this.addXP(20);
      this.save();
      return true; // Тепер пройдена
    }
  }

  markSpeakingTopicCompleted(topicId, score = 100) {
    if (!this.state.completedSpeakingTopics) {
      this.state.completedSpeakingTopics = {};
    }
    const current = this.state.completedSpeakingTopics[topicId];
    const prevBest = current?.bestScore || 0;
    this.state.completedSpeakingTopics[topicId] = {
      completed: true,
      completedAt: new Date().toLocaleDateString('uk-UA'),
      bestScore: Math.max(prevBest, score)
    };
    this.save();
  }

  isSpeakingTopicCompleted(topicId) {
    return Boolean(this.state.completedSpeakingTopics?.[topicId]?.completed);
  }

  getSpeakingTopicProgress(topicId) {
    return this.state.completedSpeakingTopics?.[topicId] || null;
  }

  getCompletedSpeakingTopicsCount() {
    if (!this.state.completedSpeakingTopics) return 0;
    return Object.values(this.state.completedSpeakingTopics).filter(t => t && t.completed).length;
  }

  getRadarSkills() {
    const vocabLearned = this.getLearnedCount();
    const vocabScore = Math.min(100, vocabLearned * 6);

    const sentencesDone = (this.state.completedPractices.sentences || []).length;
    const syntaxScore = Math.min(100, sentencesDone * 10);

    const situationsDone = (this.state.completedPractices.situations || []).length;
    const contextScore = Math.min(100, situationsDone * 15);

    const quizzesDone = (this.state.completedPractices.quizzes || []).length;
    const grammarScore = Math.min(100, quizzesDone * 12);

    const spkCount = this.state.aiEvaluations.speakingCount;
    const spkAvg = spkCount > 0 ? (this.state.aiEvaluations.totalSpeakingScore / spkCount) : 0;

    const sentCount = this.state.aiEvaluations.sentencesCount;
    const sentAvg = sentCount > 0 ? (this.state.aiEvaluations.totalSentenceScore / sentCount) : 0;

    const streakVal = Math.min(100, this.state.streak * 20);

    return {
      vocabulary: Math.max(15, Math.round(vocabScore)),
      syntax: Math.max(15, Math.round(syntaxScore)),
      context: Math.max(15, Math.round(contextScore)),
      grammar: Math.max(15, Math.round(grammarScore)),
      speaking: Math.max(15, Math.round(spkAvg || (spkCount * 25))),
      accuracy: Math.max(15, Math.round(sentAvg || 30)),
      streak: Math.max(15, Math.round(streakVal))
    };
  }

  isVaultUnlocked(xpReq) {
    return this.state.xp >= xpReq;
  }

  // ===== ROADMAP PROGRESS MANAGEMENT =====
  isMilestoneCompleted(milestoneId) {
    return !!(this.state.completedMilestones && this.state.completedMilestones[milestoneId]);
  }

  toggleMilestoneCompleted(milestoneId, xp = 50) {
    if (!this.state.completedMilestones) this.state.completedMilestones = {};
    if (this.state.completedMilestones[milestoneId]) {
      delete this.state.completedMilestones[milestoneId];
      this.save();
      return false;
    } else {
      this.state.completedMilestones[milestoneId] = {
        completed: true,
        completedAt: new Date().toLocaleDateString('uk-UA'),
        xpEarned: xp
      };
      this.addXP(xp);
      this.save();
      return true;
    }
  }

  setMilestoneCompleted(milestoneId, isCompleted = true, xp = 50) {
    if (!this.state.completedMilestones) this.state.completedMilestones = {};
    if (isCompleted) {
      if (!this.state.completedMilestones[milestoneId]) {
        this.state.completedMilestones[milestoneId] = {
          completed: true,
          completedAt: new Date().toLocaleDateString('uk-UA'),
          xpEarned: xp
        };
        this.addXP(xp);
      }
    } else {
      delete this.state.completedMilestones[milestoneId];
    }
    this.save();
  }

  getCompletedMilestonesCount() {
    if (!this.state.completedMilestones) return 0;
    return Object.keys(this.state.completedMilestones).length;
  }

  getCompletedMilestonesMap() {
    return this.state.completedMilestones || {};
  }

  // --- LESSON REMINDER SETTINGS ---
  getReminderSettings() {
    return this.state.lessonReminder || {
      enabled: true,
      time: '19:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      goalMinutes: 55,
      soundAlert: true,
      lastNotifiedDate: null
    };
  }

  saveReminderSettings(settings) {
    this.state.lessonReminder = { ...this.getReminderSettings(), ...settings };
    this.save();
    return this.state.lessonReminder;
  }

  markReminderNotifiedToday() {
    const today = new Date().toISOString().split('T')[0];
    if (!this.state.lessonReminder) this.state.lessonReminder = this.getReminderSettings();
    this.state.lessonReminder.lastNotifiedDate = today;
    this.save();
  }

  resetAllProgress() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.state = this.getDefaultState();
    this.save();
  }
}

window.appStorage = new StorageManager();
