// Головний контролер застосунку v4:
// Повна синхронізація з LocalStorage (всі індекси, позиції, вкладки зберігаються назавжди),
// Чоловічий голос за замовчуванням (👨 Male Voice), виправлений 3D-тренажер карток.

class LinguoApp {
  constructor() {
    // Відновлення збереженого стану з LocalStorage
    this.currentTab = window.appStorage.getActiveNav('tab', 'roadmap');
    this.currentGrammarSubtab = window.appStorage.getActiveNav('grammarSubtab', 'matrix');
    this.currentVocabSubtab = window.appStorage.getActiveNav('vocabSubtab', 'study');
    this.currentPracticeMode = window.appStorage.getActiveNav('practiceMode', 'sentences');

    // Guided Mastery Roadmap State
    this.roadmapStageFilter = 'all';
    this.currentActiveModalMilestoneId = null;

    // Topic Vocabulary & Active Recall State
    this.currentTopicId = window.appStorage.getActiveNav('vocabTopicId', 'topic_1');
    this.studyWordIndex = window.appStorage.getIndex('studyWordIndex', 0);
    this.challengeInputMode = 'type'; // 'type' | 'choice'
    this.challengeIndex = 0;
    this.challengeScore = { correct: 0, total: 0 };
    this.activeTopicChallenges = [];
    this.activeChallengeAnswered = false;

    // Legacy compatibility positions
    this.flashcardIndex = window.appStorage.getIndex('flashcard', 0);
    this.isCardFlipped = false;
    this.activeFlashcardWord = null;

    this.sitIndex = window.appStorage.getIndex('situation', 0);
    this.sitAnswered = false;

    this.sbIndex = window.appStorage.getIndex('sentenceBuilder', 0);
    this.sbTokensInSlot = [];
    this.sbTokensInBank = [];

    this.lsIndex = window.appStorage.getIndex('letterScramble', 0);
    this.lsCurrentLetters = [];
    this.lsBankLetters = [];

    this.gqIndex = window.appStorage.getIndex('grammarQuiz', 0);
    this.gqAnswered = false;

    this.ehIndex = window.appStorage.getIndex('errorHunter', 0);
    this.ehAnswered = false;

    // AI state & Speaking Topics Catalogue
    this.currentTargetWord = null;
    this.isSpeakingRecording = false;
    this.currentSpokenTranscript = '';
    this.speakingTopics = (window.SPEAKING_TOPICS && window.SPEAKING_TOPICS.length)
      ? window.SPEAKING_TOPICS
      : [
        {
          id: "top_001",
          category: "tech_ai",
          categoryName: "🤖 Штучний інтелект & Технології",
          topic: "The Tyranny of Comfort: Can algorithms and AI ever replace human intuition and creative mistakes?",
          ukr: "Тиранія комфорту: чи зможуть алгоритми та ШІ замінити людську інтуїцію та творчі помилки?",
          hint: "PREP: Згадай про цінність помилок у науці.",
          keywords: ["algorithm", "algorithms", "ai", "artificial intelligence", "mistake", "error"]
        }
      ];
    this.currentTopicIndex = 0;
    this.activeTopic = this.speakingTopics[0];

    // IT & Code Review Studio State
    this.speakingMode = 'general'; // 'general' | 'it_code'
    this.itCodeScenarios = (window.IT_CODE_SCENARIOS && window.IT_CODE_SCENARIOS.length)
      ? window.IT_CODE_SCENARIOS
      : [];
    this.currentItScenarioIndex = 0;
    this.activeItScenario = this.itCodeScenarios[0] || null;

    // Topic Catalogue Filter State
    this.topicFilterStatus = 'all'; // 'all' | 'active' | 'completed'
    this.topicFilterCategory = 'all';
    this.topicSearchQuery = '';

    this.init();
  }

  init() {
    this.initTheme();
    this.initSoundToggle();
    this.initVoiceGenderToggle();
    this.initNavigation();
    this.initGrammarSubtabs();
    this.initGrammarSearch();
    this.initVocabSubtabs();
    this.initPracticeModes();
    this.initCustomWordModal();
    this.initApiKeyModal();
    this.initTenseModal();
    this.initKeyboardShortcuts();

    this.updateStatsBar();
    this.render12TensesMatrix();
    this.renderGrammarCards('all');
    this.renderLearnedWords();
    this.initRoadmap();
    this.initHashRouting();

    // Відновлення вкладок та підвкладок
    this.switchTab(this.currentTab, false);
    this.switchGrammarSubtab(this.currentGrammarSubtab, false);
    this.switchVocabSubtab(this.currentVocabSubtab, false);
    this.switchPracticeMode(this.currentPracticeMode, false);

    // Initialize Topic Vocabulary & Practice
    this.initTopicVocabulary();
    this.loadSentenceBuilderTask();
    this.loadLetterScrambleTask();
    this.loadGrammarQuizTask();
    this.loadErrorHunterTask();

    // AI & Speaking init
    this.randomizeAISentenceTarget();
    this.updateSpeakingTopicBanner();
    this.updateSpeakingTopicsBadge();
    this.renderTopicCategoryPills();
    this.renderTopicCatalogue();
    this.renderDevPhrases();
    this.renderItCodeScenario();
    this.updateAIMentorStatusLabel();

    const transcriptInput = document.getElementById('speaking-transcript-display');
    if (transcriptInput) {
      transcriptInput.addEventListener('input', () => this.updateSpeakingStats());
    }
  }

  // ===== THEME & SOUND & VOICE =====
  initTheme() {
    const savedTheme = localStorage.getItem('linguo_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const btn = document.getElementById('btn-toggle-theme');
    if (btn) {
      btn.textContent = savedTheme === 'dark' ? '☀️' : '🌓';
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('linguo_theme', next);
        btn.textContent = next === 'dark' ? '☀️' : '🌓';
        if (this.currentTab === 'vault') this.drawRadarChart();
      });
    }
  }

  initSoundToggle() {
    const btn = document.getElementById('btn-toggle-sound');
    if (btn) {
      btn.textContent = window.sound.isMuted() ? '🔇' : '🔊';
      btn.addEventListener('click', () => {
        const isMuted = window.sound.toggleMute();
        btn.textContent = isMuted ? '🔇' : '🔊';
      });
    }
  }

  initVoiceGenderToggle() {
    const btn = document.getElementById('btn-toggle-voice');
    if (btn) {
      const current = window.sound.getGender();
      btn.textContent = current === 'male' ? '👨' : '👩';
      btn.title = `Голос вимови: ${current === 'male' ? 'Чоловічий (👨)' : 'Жіночий (👩)'}. Натисни для перемикання`;

      btn.addEventListener('click', () => {
        const newGender = window.sound.toggleGender();
        btn.textContent = newGender === 'male' ? '👨' : '👩';
        btn.title = `Голос вимови: ${newGender === 'male' ? 'Чоловічий (👨)' : 'Жіночий (👩)'}. Натисни для перемикання`;
        window.sound.speak(newGender === 'male' ? "Male voice enabled" : "Female voice enabled");
      });
    }
  }

  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Якщо відкрито поле вводу — ігноруємо
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (this.currentTab === 'vocabulary') {
        if (this.currentVocabSubtab === 'study') {
          if (e.code === 'Space') {
            e.preventDefault();
            this.speakStudyWord();
          } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            this.nextStudyWord();
          } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            this.prevStudyWord();
          }
        }
      }
    });
  }

  // ===== API KEY MODAL =====
  openApiKeyModal() {
    const modal = document.getElementById('api-key-modal');
    const input = document.getElementById('gemini-key-input');
    const modelSelect = document.getElementById('gemini-model-select');
    if (input) input.value = window.aiMentor.getApiKey();
    if (modelSelect) modelSelect.value = window.aiMentor.getModel();
    if (modal) modal.classList.add('active');
  }

  initApiKeyModal() {
    const modal = document.getElementById('api-key-modal');
    const openBtn = document.getElementById('btn-open-api-modal');
    const closeBtn = document.getElementById('btn-close-api-modal');
    const saveBtn = document.getElementById('btn-save-api-key');
    const clearBtn = document.getElementById('btn-clear-api-key');
    const input = document.getElementById('gemini-key-input');
    const modelSelect = document.getElementById('gemini-model-select');

    if (openBtn) {
      openBtn.addEventListener('click', () => this.openApiKeyModal());
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    if (saveBtn && input) {
      saveBtn.addEventListener('click', () => {
        const val = input.value.trim();
        window.aiMentor.setApiKey(val);
        if (modelSelect) window.aiMentor.setModel(modelSelect.value);
        this.updateAIMentorStatusLabel();
        modal.classList.remove('active');
        if (val) {
          alert(`Google Gemini API (${window.aiMentor.getModel()}) успішно активовано! Тепер оцінка проводиться хмарною моделлю.`);
        } else {
          alert("Ключ очищено. Увімкнено суворий автономний офлайн-детектор.");
        }
      });
    }
    if (clearBtn && input) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        window.aiMentor.setApiKey('');
        this.updateAIMentorStatusLabel();
        modal.classList.remove('active');
        alert("Ключ видалено. Повернуто офлайн-детектор помилок!");
      });
    }
  }

  updateAIMentorStatusLabel() {
    const sentenceLabel = document.getElementById('ai-mentor-engine-status');
    const speakingBadge = document.getElementById('speaking-engine-badge');

    const isCloud = window.aiMentor.hasApiKey();
    const model = window.aiMentor.getModel();

    const text = isCloud
      ? `⚡ Движок: <strong>Google ${model} (Cloud AI)</strong>`
      : `🛡️ Движок: <strong>Суворий офлайн-детектор помилок</strong>`;

    if (sentenceLabel) sentenceLabel.innerHTML = text;
    if (speakingBadge) speakingBadge.innerHTML = text;
  }

  // ===== NAVIGATION & SAVING =====
  initNavigation() {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
  }

  switchTab(tabName, persist = true) {
    this.currentTab = tabName;
    if (persist) {
      window.appStorage.setActiveNav('tab', tabName);
    }

    document.querySelectorAll('.nav-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
    });

    document.querySelectorAll('.tab-pane').forEach(p => {
      p.classList.remove('active');
    });

    const targetPane = document.getElementById(`pane-${tabName}`);
    if (targetPane) targetPane.classList.add('active');

    if (tabName === 'roadmap') {
      this.renderRoadmap();
      this.renderActiveMissionCard();
    } else if (tabName === 'vocabulary') {
      this.refreshVocabularyView();
    } else if (tabName === 'vault') {
      this.renderVaultSection();
      this.drawRadarChart();
    }
  }

  updateStatsBar() {
    const streakDisplay = document.getElementById('stat-streak-display');
    const xpDisplay = document.getElementById('stat-xp-display');
    const rankDisplay = document.getElementById('stat-rank-display');

    const level = window.appStorage.getLevel();

    if (streakDisplay) streakDisplay.textContent = `${window.appStorage.getStreak()} дн.`;
    if (xpDisplay) xpDisplay.textContent = `${window.appStorage.getXP()} XP`;
    if (rankDisplay) rankDisplay.textContent = level.title;
  }

  // ===== 12 TENSES MATRIX & SUBTABS =====
  initGrammarSubtabs() {
    document.querySelectorAll('[data-grammar-subtab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sub = btn.getAttribute('data-grammar-subtab');
        this.switchGrammarSubtab(sub);
      });
    });
  }

  switchGrammarSubtab(sub, persist = true) {
    this.currentGrammarSubtab = sub;
    if (persist) {
      window.appStorage.setActiveNav('grammarSubtab', sub);
    }

    document.querySelectorAll('[data-grammar-subtab]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-grammar-subtab') === sub);
    });

    document.getElementById('grammar-view-matrix').style.display = sub === 'matrix' ? 'block' : 'none';
    document.getElementById('grammar-view-marichka').style.display = sub === 'marichka' ? 'block' : 'none';
    document.getElementById('grammar-view-hacks').style.display = sub === 'hacks' ? 'block' : 'none';
  }

  render12TensesMatrix() {
    const tbody = document.getElementById('tenses-matrix-tbody');
    if (!tbody || !TENSES_DATA) return;

    const aspects = [
      { key: "simple", title: "SIMPLE", desc: "Факти, регулярність, точна дія в минулому" },
      { key: "continuous", title: "CONTINUOUS", desc: "Процес у конкретну секунду, незавершеність" },
      { key: "perfect", title: "PERFECT", desc: "Зв’язок із моментом відліку / дія ДО нього" },
      { key: "perfect-continuous", title: "PERF. CONTINUOUS", desc: "Тривалість процесу (for, since)" }
    ];

    tbody.innerHTML = aspects.map(asp => {
      const pastTense = TENSES_DATA.matrix.find(t => t.time === 'past' && t.aspect === asp.key);
      const presTense = TENSES_DATA.matrix.find(t => t.time === 'present' && t.aspect === asp.key);
      const futTense = TENSES_DATA.matrix.find(t => t.time === 'future' && t.aspect === asp.key);

      return `
        <tr>
          <td class="row-aspect-header">
            <div class="aspect-title">${asp.title}</div>
            <div class="aspect-meaning">${asp.desc}</div>
          </td>

          <!-- 1. PAST (ЗЛІВА ВІД PRESENT) -->
          <td class="tense-cell past-cell" onclick="app.openTenseDetail('${pastTense.id}')">
            <div class="tense-head">
              <span class="tense-name">${pastTense.name}</span>
              <span class="badge badge-level">Past</span>
            </div>
            <div class="tense-formula-badge">${pastTense.formula}</div>
            <div class="tense-sense">${pastTense.coreSense}</div>
            <div class="tense-example-box">
              <div class="tense-example-text">
                <div class="en">${pastTense.example}</div>
                <div class="ukr">${pastTense.exampleUkr}</div>
              </div>
              <button class="speak-mini-btn" onclick="event.stopPropagation(); sound.speak('${pastTense.example.replace(/'/g, "\\'")}')" title="Озвучити чоловічим голосом">🔊</button>
            </div>
            <div class="tense-markers-row">
              ${pastTense.markers.slice(0, 3).map(m => `<span class="marker-tag">${m}</span>`).join('')}
            </div>
          </td>

          <!-- 2. PRESENT (ПОСЕРЕДИНІ) -->
          <td class="tense-cell present-cell" onclick="app.openTenseDetail('${presTense.id}')">
            <div class="tense-head">
              <span class="tense-name">${presTense.name}</span>
              <span class="badge badge-tag">Present</span>
            </div>
            <div class="tense-formula-badge">${presTense.formula}</div>
            <div class="tense-sense">${presTense.coreSense}</div>
            <div class="tense-example-box">
              <div class="tense-example-text">
                <div class="en">${presTense.example}</div>
                <div class="ukr">${presTense.exampleUkr}</div>
              </div>
              <button class="speak-mini-btn" onclick="event.stopPropagation(); sound.speak('${presTense.example.replace(/'/g, "\\'")}')" title="Озвучити чоловічим голосом">🔊</button>
            </div>
            <div class="tense-markers-row">
              ${presTense.markers.slice(0, 3).map(m => `<span class="marker-tag">${m}</span>`).join('')}
            </div>
          </td>

          <!-- 3. FUTURE (СПРАВА ВІД PRESENT) -->
          <td class="tense-cell future-cell" onclick="app.openTenseDetail('${futTense.id}')">
            <div class="tense-head">
              <span class="tense-name">${futTense.name}</span>
              <span class="badge" style="background:#d1fae5; color:#065f46;">Future</span>
            </div>
            <div class="tense-formula-badge">${futTense.formula}</div>
            <div class="tense-sense">${futTense.coreSense}</div>
            <div class="tense-example-box">
              <div class="tense-example-text">
                <div class="en">${futTense.example}</div>
                <div class="ukr">${futTense.exampleUkr}</div>
              </div>
              <button class="speak-mini-btn" onclick="event.stopPropagation(); sound.speak('${futTense.example.replace(/'/g, "\\'")}')" title="Озвучити чоловічим голосом">🔊</button>
            </div>
            <div class="tense-markers-row">
              ${futTense.markers.slice(0, 3).map(m => `<span class="marker-tag">${m}</span>`).join('')}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  initTenseModal() {
    const modal = document.getElementById('tense-detail-modal');
    const closeBtn = document.getElementById('btn-close-tense-modal');
    if (modal && closeBtn) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
  }

  openTenseDetail(tenseId) {
    const item = TENSES_DATA.matrix.find(t => t.id === tenseId);
    if (!item) return;

    window.sound.playClick();
    const modal = document.getElementById('tense-detail-modal');

    document.getElementById('td-modal-name').textContent = item.name;
    document.getElementById('td-modal-ukr').textContent = item.ukrName;
    document.getElementById('td-modal-sense').textContent = item.coreSense;

    document.getElementById('td-modal-pos').textContent = item.formula;
    document.getElementById('td-modal-neg').textContent = item.negativeFormula;
    document.getElementById('td-modal-que').textContent = item.questionFormula;

    document.getElementById('td-modal-ex-en').textContent = item.example;
    document.getElementById('td-modal-ex-ukr').textContent = item.exampleUkr;
    document.getElementById('td-modal-trap').textContent = item.trap;

    const speakBtn = document.getElementById('td-modal-speak-btn');
    speakBtn.onclick = () => window.sound.speak(item.example);

    modal.classList.add('active');
  }

  initGrammarSearch() {
    const input = document.getElementById('grammar-search-input');
    if (input) {
      input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        this.renderGrammarCards('all', query);
      });
    }

    const chips = document.querySelectorAll('#grammar-filter-chips .chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.getAttribute('data-filter');
        this.renderGrammarCards(filter);
      });
    });
  }

  renderGrammarCards(category = 'all', query = '') {
    const container = document.getElementById('grammar-cards-container');
    if (!container) return;

    let items = GRAMMAR_HACKS;
    if (category !== 'all') {
      items = items.filter(h => h.category === category);
    }
    if (query) {
      items = items.filter(h =>
        h.title.toLowerCase().includes(query) ||
        h.summary.toLowerCase().includes(query) ||
        h.hackRule.toLowerCase().includes(query) ||
        (h.examples && h.examples.some(ex => ex.en.toLowerCase().includes(query) || ex.ukr.toLowerCase().includes(query)))
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🔍</div>
          <h3>Нічого не знайдено</h3>
          <p>Спробуй інший запит або обери іншу категорію лайфхаків.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(hack => {
      const examplesHtml = hack.examples ? `
        <div class="card-examples">
          ${hack.examples.map(ex => `
            <div class="example-bubble">
              <div class="example-text">
                <div class="en">${ex.en}</div>
                <div class="ukr">${ex.ukr}</div>
              </div>
              <button class="speak-mini-btn" onclick="sound.speak('${ex.en.replace(/'/g, "\\'")}')" title="Озвучити">🔊</button>
            </div>
          `).join('')}
        </div>
      ` : '';

      const mistakesHtml = hack.mistakes ? `
        <div class="traps-box">
          ${hack.mistakes.map(m => `
            <div class="trap-item">
              <div><span class="trap-wrong">❌ ${m.wrong}</span></div>
              <div><span class="trap-right">✅ ${m.right}</span></div>
              <div class="trap-reason">💡 ${m.reason}</div>
            </div>
          `).join('')}
        </div>
      ` : '';

      return `
        <div class="grammar-card">
          <div class="grammar-card-header">
            <div class="card-badges">
              <span class="badge badge-tag">${hack.tag}</span>
              <span class="badge badge-level">${hack.level}</span>
            </div>
          </div>
          <h3>${hack.title}</h3>
          <p class="card-summary">${hack.summary}</p>
          <div class="hack-box">
            <strong>⚡ Золотий лайфхак:</strong>
            ${hack.hackRule}
          </div>
          ${examplesHtml}
          ${mistakesHtml}
        </div>
      `;
    }).join('');
  }

  // ===== TAB 2: VOCABULARY & WHERE-TO-USE =====
  initVocabSubtabs() {
    document.querySelectorAll('.vocab-subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const subtab = btn.getAttribute('data-subtab');
        this.switchVocabSubtab(subtab);
      });
    });

    const catalogSearch = document.getElementById('catalog-search-input');
    if (catalogSearch) {
      catalogSearch.addEventListener('input', (e) => {
        this.renderCatalogWords('all', e.target.value.toLowerCase().trim());
      });
    }

    const learnedSearch = document.getElementById('learned-search-input');
    if (learnedSearch) {
      learnedSearch.addEventListener('input', (e) => {
        this.renderLearnedWords(e.target.value.toLowerCase().trim());
      });
    }

    document.querySelectorAll('#catalog-category-chips .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#catalog-category-chips .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const cat = chip.getAttribute('data-cat');
        this.renderCatalogWords(cat);
      });
    });
  }

    // ===== GUIDED MASTERY ROADMAP ENGINE =====
  initRoadmap() {
    if (!window.ROADMAP_DATA) return;
    this.syncRoadmapAutoProgress();
    this.renderActiveMissionCard();
    this.renderRoadmap();
    this.initReminderEngine();

    // Close modals on outside click
    const studioModal = document.getElementById('lesson-studio-modal');
    if (studioModal) {
      studioModal.addEventListener('click', (e) => {
        if (e.target === studioModal) this.closeLessonStudio();
      });
    }

    const reminderModal = document.getElementById('lesson-reminder-modal');
    if (reminderModal) {
      reminderModal.addEventListener('click', (e) => {
        if (e.target === reminderModal) this.closeReminderModal();
      });
    }
  }

  getActiveMilestone() {
    if (!window.ROADMAP_DATA) return null;
    const all = window.ROADMAP_DATA.getAllMilestones();
    const found = all.find(m => !window.appStorage.isMilestoneCompleted(m.id));
    return found || all[all.length - 1];
  }

  renderActiveMissionCard() {
    const active = this.getActiveMilestone();
    if (!active) return;

    const titleEl = document.getElementById('active-mission-title');
    const descEl = document.getElementById('active-mission-desc');
    const catEl = document.getElementById('active-mission-category');
    const xpEl = document.getElementById('active-mission-xp');
    const timeEl = document.getElementById('active-mission-time');

    if (titleEl) titleEl.textContent = `Milestone ${active.number}: ${active.title}`;
    if (descEl) descEl.textContent = active.tagline || active.whyItMatters || active.learnContent.summary;
    if (catEl) catEl.textContent = `${active.icon} ${active.category}`;
    if (xpEl) xpEl.textContent = `+${active.xp} XP`;
    if (timeEl) timeEl.textContent = `⏱️ ~${active.estimatedTime}`;
  }

  renderRoadmap() {
    const container = document.getElementById('roadmap-tree-container');
    if (!container || !window.ROADMAP_DATA) return;

    const allMilestones = window.ROADMAP_DATA.getAllMilestones();
    const completedCount = window.appStorage.getCompletedMilestonesCount();
    const totalCount = allMilestones.length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const percentEl = document.getElementById('roadmap-progress-percent');
    const countsEl = document.getElementById('roadmap-progress-counts');
    const stageEl = document.getElementById('roadmap-current-stage');

    if (percentEl) percentEl.textContent = `${percent}%`;
    if (countsEl) countsEl.textContent = `(${completedCount}/${totalCount})`;

    const activeM = this.getActiveMilestone();
    if (stageEl && activeM) {
      const activeStage = window.ROADMAP_DATA.stages.find(s => s.id === activeM.stageId);
      stageEl.textContent = activeStage ? `Stage ${activeStage.number}` : 'Stage 1';
    }

    // Filter stages
    let stagesToShow = window.ROADMAP_DATA.stages;
    if (this.roadmapStageFilter !== 'all') {
      stagesToShow = stagesToShow.filter(s => s.id === this.roadmapStageFilter);
    }

    container.innerHTML = stagesToShow.map(stage => {
      const stageMilestones = stage.milestones;
      const stageDoneCount = stageMilestones.filter(m => window.appStorage.isMilestoneCompleted(m.id)).length;
      const isAllStageDone = stageDoneCount === stageMilestones.length;

      return `
        <div class="roadmap-stage-block" id="stage-block-${stage.id}">
          <div class="roadmap-stage-header">
            <div class="stage-title-wrap">
              <div class="stage-meta-row">
                <span class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #38bdf8; font-weight:800;">${stage.level}</span>
                <span class="badge badge-tag">${stage.badge}</span>
              </div>
              <h3 class="stage-h3">${stage.title}</h3>
              <p class="stage-tagline">${stage.description || stage.tagline || ''}</p>
            </div>
            <div class="stage-progress-badge ${isAllStageDone ? 'all-completed' : ''}">
              ${isAllStageDone ? '✅ Stage Mastered' : `${stageDoneCount}/${stageMilestones.length} Completed`}
            </div>
          </div>

          <div class="roadmap-milestones-list">
            ${stageMilestones.map(m => {
              const isDone = window.appStorage.isMilestoneCompleted(m.id);
              const isActiveQuest = activeM && activeM.id === m.id && !isDone;

              let cardStatusClass = 'available';
              if (isDone) cardStatusClass = 'completed';
              else if (isActiveQuest) cardStatusClass = 'active-quest';

              return `
                <div class="roadmap-node-card ${cardStatusClass}" id="node-${m.id}">
                  <div class="node-icon-bubble" title="${m.category}">
                    ${isDone ? '✅' : m.icon}
                  </div>

                  <div class="node-content-body">
                    <div class="node-header-row">
                      <div class="node-meta-pills">
                        <span class="node-number-badge">Milestone ${m.number}</span>
                        <span class="badge badge-tag" style="font-size:0.72rem;">${m.category}</span>
                        <span class="mission-xp" style="font-size:0.75rem;">+${m.xp} XP</span>
                      </div>
                      ${isActiveQuest ? `
                        <span class="badge" style="background:#38bdf8; color:#0f172a; font-weight:800; font-size:0.72rem;">
                          ⚡ ACTIVE MISSION
                        </span>
                      ` : ''}
                    </div>

                    <h4 class="node-title-text">${m.title}</h4>
                    <p class="node-why-text">${m.whyItMatters}</p>

                    <div class="node-checklist-preview">
                      ${m.checklist.map(c => `
                        <div class="checklist-item-preview ${isDone ? 'done' : ''}">
                          <span>${isDone ? '☑️' : '🔘'}</span>
                          <span>${c.text}</span>
                        </div>
                      `).join('')}
                    </div>

                    <div class="node-footer-actions">
                      <div class="node-actions-left">
                        <button class="btn-primary" onclick="app.openLessonStudio('${m.id}')" style="padding:0.45rem 1rem; font-size:0.82rem;">
                          <span>🚀</span> Open Lesson Arena
                        </button>
                        <button class="btn-secondary" onclick="app.openLessonStudio('${m.id}', 'theory')" style="padding:0.45rem 0.8rem; font-size:0.82rem;">
                          <span>📖</span> Theory & Drills
                        </button>
                      </div>

                      <button class="node-toggle-check ${isDone ? 'checked' : ''}" onclick="app.toggleMilestone('${m.id}', event)" title="Toggle milestone completed">
                        <span>${isDone ? '✅ Mastered' : '⭕ Mark Complete'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  filterRoadmapStage(stageId) {
    this.roadmapStageFilter = stageId;
    document.querySelectorAll('#roadmap-stage-filters .chip').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-stage') === stageId);
    });
    this.renderRoadmap();
  }

  openActiveMilestoneStudio() {
    const active = this.getActiveMilestone();
    if (active) this.openLessonStudio(active.id);
  }

  openActiveMilestoneDetails() {
    const active = this.getActiveMilestone();
    if (active) this.openLessonStudio(active.id, 'theory');
  }

  launchActiveMilestone() {
    const active = this.getActiveMilestone();
    if (active) this.openLessonStudio(active.id);
  }

  launchMilestone(milestoneId) {
    this.openLessonStudio(milestoneId);
  }

  openMilestoneDetail(milestoneId) {
    this.openLessonStudio(milestoneId);
  }

  closeRoadmapDetailModal() {
    this.closeLessonStudio();
  }

  toggleCurrentModalMilestone() {
    if (!this.currentStudioMilestoneId) return;
    this.toggleMilestone(this.currentStudioMilestoneId);
    this.openLessonStudio(this.currentStudioMilestoneId);
  }

  launchCurrentModalMilestone() {
    if (!this.currentStudioMilestoneId) return;
    this.openLessonStudio(this.currentStudioMilestoneId);
  }

  toggleMilestone(milestoneId, event) {
    if (event) event.stopPropagation();
    const isNowDone = window.appStorage.toggleMilestoneCompleted(milestoneId);

    if (isNowDone) {
      window.sound.playCorrect();
      this.triggerConfetti();
    } else {
      window.sound.playClick();
    }

    this.renderRoadmap();
    this.renderActiveMissionCard();
    this.updateStatsBar();
  }

  // ===== DEDICATED INTERACTIVE LESSON STUDIO ENGINE =====
  openLessonStudio(milestoneId, initialTab = 'theory', updateHash = true) {
    if (!window.ROADMAP_DATA) return;
    const m = window.ROADMAP_DATA.getMilestoneById(milestoneId);
    if (!m) return;

    this.currentStudioMilestone = m;
    this.currentStudioMilestoneId = milestoneId;
    const isDone = window.appStorage.isMilestoneCompleted(milestoneId);
    const stage = window.ROADMAP_DATA.stages.find(s => s.id === m.stageId);

    if (updateHash) {
      try {
        window.location.hash = `milestone=${milestoneId}`;
      } catch (e) {}
    }

    // Populate Milestone Picker Dropdown
    this.populateStudioMilestonePicker(milestoneId);

    // 1. Header Population
    const iconEl = document.getElementById('studio-icon');
    const stageEl = document.getElementById('studio-stage-badge');
    const levelEl = document.getElementById('studio-level-badge');
    const xpEl = document.getElementById('studio-xp-badge');
    const titleEl = document.getElementById('studio-title');
    const masterBtn = document.getElementById('studio-toggle-mastered-btn');

    if (iconEl) iconEl.textContent = m.icon;
    if (stageEl) stageEl.textContent = stage ? `Stage ${stage.number}` : 'Stage 1';
    if (levelEl) levelEl.textContent = m.level || stage?.level || 'B1';
    if (xpEl) xpEl.textContent = `+${m.xp} XP`;
    if (titleEl) titleEl.textContent = `Milestone ${m.number}: ${m.title}`;
    if (masterBtn) {
      masterBtn.innerHTML = isDone ? `<span>↩️</span> Mark as Incomplete` : `<span>✅</span> Mark as Mastered (+${m.xp} XP)`;
    }

    // Update Prev / Next Milestone buttons
    const all = window.ROADMAP_DATA.getAllMilestones();
    const currIdx = all.findIndex(item => item.id === milestoneId);
    const prevBtn = document.getElementById('studio-prev-milestone-btn');
    const nextBtn = document.getElementById('studio-next-milestone-btn');
    if (prevBtn) prevBtn.disabled = currIdx <= 0;
    if (nextBtn) nextBtn.disabled = currIdx >= all.length - 1;

    // 2. Tab 1: Theory View Population
    const whyEl = document.getElementById('studio-why-text');
    const formulaEl = document.getElementById('studio-formula-pill');
    const summaryEl = document.getElementById('studio-summary-text');
    const rulesList = document.getElementById('studio-rules-list');
    const badEl = document.getElementById('studio-bad-text');
    const goodEl = document.getElementById('studio-good-text');
    const expEl = document.getElementById('studio-comparison-explanation');
    const trapEl = document.getElementById('studio-trap-text');

    if (whyEl) whyEl.textContent = m.whyItMatters;
    if (formulaEl) formulaEl.textContent = m.learnContent.formula || 'Rule Schema';
    if (summaryEl) summaryEl.textContent = m.learnContent.summary;
    if (rulesList) {
      rulesList.innerHTML = (m.learnContent.rules || []).map(r => `<li>${r}</li>`).join('');
    }
    if (badEl) badEl.textContent = `"${m.learnContent.badVsGood?.bad || ''}"`;
    if (goodEl) goodEl.textContent = `"${m.learnContent.badVsGood?.good || ''}"`;
    if (expEl) expEl.textContent = m.learnContent.badVsGood?.explanation || '';
    if (trapEl) trapEl.textContent = m.learnContent.ukrainianTrap || '';

    // 2. Tab 2: Initialize Target Vocabulary Mini-Page
    this.initStudioVocab(m.targetVocabulary);

    // 3. Tab 3: Initialize Sentence Builder
    this.initStudioSentenceBuilder(m.interactivePractice?.sentenceBuilder);

    // 4. Tab 3: Initialize Active Recall Input Drill
    this.initStudioInputDrill(m.interactivePractice?.inputDrill);

    // 5. Tab 4: Initialize Technical Challenge Quiz
    this.initStudioQuiz(m.interactivePractice?.deepQuiz);

    // 6. Tab 5: Initialize Spoken Simulation
    this.initStudioSpeaking(m.interactivePractice?.speakingSimulation);

    // Switch to target tab
    this.switchStudioTab(initialTab);

    // Show modal
    const modal = document.getElementById('lesson-studio-modal');
    if (modal) modal.classList.add('active');
  }

  closeLessonStudio() {
    const modal = document.getElementById('lesson-studio-modal');
    if (modal) modal.classList.remove('active');
    this.currentStudioMilestone = null;
    this.currentStudioMilestoneId = null;

    if (window.location.hash && window.location.hash.includes('milestone=')) {
      history.replaceState(null, null, window.location.pathname + window.location.search);
    }
  }

  populateStudioMilestonePicker(currentId) {
    const picker = document.getElementById('studio-milestone-picker');
    if (!picker || !window.ROADMAP_DATA) return;

    picker.innerHTML = window.ROADMAP_DATA.stages.map(stage => `
      <optgroup label="${stage.title}">
        ${stage.milestones.map(m => {
          const isDone = window.appStorage.isMilestoneCompleted(m.id);
          const isSelected = m.id === currentId ? 'selected' : '';
          return `
            <option value="${m.id}" ${isSelected}>
              ${isDone ? '✅' : '⭕'} ${m.number}: ${m.title}
            </option>
          `;
        }).join('')}
      </optgroup>
    `).join('');
  }

  copyMilestoneDirectLink() {
    if (!this.currentStudioMilestoneId) return;
    const directUrl = `${window.location.origin}${window.location.pathname}#milestone=${this.currentStudioMilestoneId}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(directUrl).then(() => {
        window.sound.playCorrect();
        alert(`🔗 Direct milestone link copied to clipboard:\n\n${directUrl}\n\nYou can bookmark or share this link to open this milestone directly!`);
      }).catch(() => {
        prompt('Copy this direct milestone link:', directUrl);
      });
    } else {
      prompt('Copy this direct milestone link:', directUrl);
    }
  }

  toggleStudioFullscreen() {
    const box = document.querySelector('.lesson-studio-box');
    const modal = document.getElementById('lesson-studio-modal');
    const btn = document.getElementById('btn-toggle-studio-fullscreen');
    if (!box) return;

    const isFull = box.classList.toggle('fullscreen');
    if (modal) modal.classList.toggle('has-fullscreen', isFull);

    if (btn) {
      btn.innerHTML = isFull ? `<span>🗗</span> Standard Window` : `<span>⛶</span> Full Window`;
    }
    window.sound.playClick();
  }

  prevMilestoneInStudio() {
    if (!window.ROADMAP_DATA || !this.currentStudioMilestoneId) return;
    const all = window.ROADMAP_DATA.getAllMilestones();
    const idx = all.findIndex(m => m.id === this.currentStudioMilestoneId);
    if (idx > 0) {
      this.openLessonStudio(all[idx - 1].id, this.currentStudioTab || 'theory');
    }
  }

  nextMilestoneInStudio() {
    if (!window.ROADMAP_DATA || !this.currentStudioMilestoneId) return;
    const all = window.ROADMAP_DATA.getAllMilestones();
    const idx = all.findIndex(m => m.id === this.currentStudioMilestoneId);
    if (idx < all.length - 1) {
      this.openLessonStudio(all[idx + 1].id, this.currentStudioTab || 'theory');
    }
  }

  launchStudioMainArena() {
    if (!this.currentStudioMilestone) return;
    const t = this.currentStudioMilestone.actionTarget;
    this.closeLessonStudio();

    if (t) {
      if (t.tab) this.switchTab(t.tab);
      if (t.grammarSubtab) this.switchGrammarSubtab(t.grammarSubtab);
      if (t.topicId) this.selectTopic(t.topicId);
      if (t.vocabSubtab) this.switchVocabSubtab(t.vocabSubtab);
      if (t.practiceMode) this.switchPracticeMode(t.practiceMode);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  initHashRouting() {
    window.addEventListener('hashchange', () => this.handleHashChange());
    // Initial check on load
    this.handleHashChange();
  }

  handleHashChange() {
    const hash = window.location.hash;
    if (!hash || !window.ROADMAP_DATA) return;

    let targetId = null;
    if (hash.startsWith('#milestone=')) {
      targetId = hash.replace('#milestone=', '').trim();
    } else if (hash.startsWith('#m_')) {
      targetId = hash.replace('#', '').trim();
    }

    if (targetId) {
      const milestone = window.ROADMAP_DATA.getMilestoneById(targetId);
      if (milestone) {
        this.switchTab('roadmap', false);
        this.openLessonStudio(targetId, 'theory', false);
      }
    }
  }

  switchStudioTab(tab) {
    this.currentStudioTab = tab;
    document.querySelectorAll('.studio-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-studio-tab') === tab);
    });

    const views = ['theory', 'vocab', 'builder', 'input', 'quiz', 'speaking'];
    views.forEach(v => {
      const el = document.getElementById(`studio-view-${v}`);
      if (el) el.style.display = (v === tab) ? 'block' : 'none';
    });

    const prevBtn = document.getElementById('studio-prev-tab-btn');
    const nextBtn = document.getElementById('studio-next-tab-btn');
    const currentIndex = views.indexOf(tab);

    if (prevBtn) prevBtn.style.visibility = (currentIndex === 0) ? 'hidden' : 'visible';
    if (nextBtn) {
      nextBtn.innerHTML = (currentIndex === views.length - 1) ? `<span>🏆 Finish & Master</span>` : `<span>Next Step ➔</span>`;
    }
  }

  nextStudioTab() {
    const views = ['theory', 'vocab', 'builder', 'input', 'quiz', 'speaking'];
    const idx = views.indexOf(this.currentStudioTab || 'theory');
    if (idx < views.length - 1) {
      this.switchStudioTab(views[idx + 1]);
    } else {
      this.completeAndMasterStudioMilestone();
    }
  }

  prevStudioTab() {
    const views = ['theory', 'vocab', 'builder', 'input', 'quiz', 'speaking'];
    const idx = views.indexOf(this.currentStudioTab || 'theory');
    if (idx > 0) {
      this.switchStudioTab(views[idx - 1]);
    }
  }


  // --- STUDIO TARGET VOCABULARY MINI-PAGE ---
  initStudioVocab(vocabList) {
    const container = document.getElementById('studio-vocab-cards-list');
    if (!container) return;

    if (!vocabList || !vocabList.length) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted);">
          No dedicated vocabulary items configured for this milestone.
        </div>
      `;
      return;
    }

    const savedWords = (window.appStorage?.state?.customWords || []).map(w => (w.word || '').toLowerCase());

    container.innerHTML = vocabList.map(item => {
      const isSaved = savedWords.includes(item.term.toLowerCase());
      const safeTerm = item.term.replace(/'/g, "\\'");
      const safeExample = (item.example || '').replace(/'/g, "\\'");
      return `
        <div class="studio-vocab-card">
          <div class="studio-vocab-card-header">
            <div>
              <div class="studio-vocab-term">${item.term}</div>
              <span class="studio-vocab-pos">${item.pos || 'Technical Term'}</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <button type="button" class="speak-mini-btn" onclick="window.sound.speak('${safeTerm}')" title="Listen to pronunciation">🔊</button>
              <button type="button" class="studio-vocab-save-btn ${isSaved ? 'saved' : ''}" 
                      id="vocab-card-btn-${encodeURIComponent(item.term)}" 
                      onclick="app.toggleVocabVaultCard('${safeTerm}', this)" 
                      title="${isSaved ? 'Word is saved in your Word Vault' : 'Save to permanent Word Vault'}">
                <span>${isSaved ? '⭐ Saved' : '+ Vault'}</span>
              </button>
            </div>
          </div>
          <p class="studio-vocab-definition">${item.definition}</p>
          <div class="studio-vocab-example-box">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem;">
              <div class="studio-vocab-example"><strong>Example:</strong> "${item.example}"</div>
              <button type="button" class="speak-mini-btn" onclick="window.sound.speak('${safeExample}')" title="Listen to example">🔊</button>
            </div>
          </div>
          ${item.usageTip ? `
            <div class="studio-vocab-tip">
              <span>💡</span> <strong>Senior Tip:</strong> ${item.usageTip}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  toggleVocabVaultCard(term, btnEl) {
    if (!window.appStorage || !this.currentStudioMilestone) return;
    const vocabList = this.currentStudioMilestone.targetVocabulary || [];
    const item = vocabList.find(v => v.term.toLowerCase() === term.toLowerCase());
    if (!item) return;

    const existing = (window.appStorage.state.customWords || []).find(w => (w.word || '').toLowerCase() === term.toLowerCase());

    if (existing) {
      window.appStorage.deleteCustomWord(existing.id);
      if (btnEl) {
        btnEl.classList.remove('saved');
        btnEl.innerHTML = `<span>+ Vault</span>`;
        btnEl.title = 'Save to permanent Word Vault';
      }
      window.sound.playClick();
    } else {
      window.appStorage.addCustomWord({
        word: item.term,
        transcription: item.pos || '',
        ukr: item.definition,
        whereToUse: item.usageTip || 'Milestone Practice',
        example: item.example || '',
        exampleUkr: `[${item.pos || 'Term'}] ${item.usageTip || ''}`
      });
      if (btnEl) {
        btnEl.classList.add('saved');
        btnEl.innerHTML = `<span>⭐ Saved</span>`;
        btnEl.title = 'Word is saved in your Word Vault';
      }
      window.sound.playCorrect();
    }
  }

  saveAllMilestoneVocabToVault() {
    if (!window.appStorage || !this.currentStudioMilestone) return;
    const vocabList = this.currentStudioMilestone.targetVocabulary || [];
    if (!vocabList.length) return;

    let addedCount = 0;
    vocabList.forEach(item => {
      const existing = (window.appStorage.state.customWords || []).find(w => (w.word || '').toLowerCase() === item.term.toLowerCase());
      if (!existing) {
        window.appStorage.addCustomWord({
          word: item.term,
          transcription: item.pos || '',
          ukr: item.definition,
          whereToUse: item.usageTip || 'Milestone Practice',
          example: item.example || '',
          exampleUkr: `[${item.pos || 'Term'}] ${item.usageTip || ''}`
        });
        addedCount++;
      }
    });

    // Re-render vocab cards to reflect saved state
    this.initStudioVocab(vocabList);

    const btn = document.getElementById('studio-save-all-vocab-btn');
    if (btn) {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `<span>✅ All Saved (${vocabList.length})</span>`;
      btn.style.borderColor = '#10b981';
      btn.style.color = '#10b981';
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 2500);
    }

    window.sound.playCorrect();
    this.triggerConfetti();
  }

  insertWordbankChipToInput(term) {
    const inputEl = document.getElementById('studio-drill-input');
    if (inputEl) {
      inputEl.value = term;
      inputEl.focus();
      window.sound.playClick();
    }
  }

  // --- STUDIO SENTENCE BUILDER ---
  initStudioSentenceBuilder(task) {
    if (!task) return;
    this.studioSbTask = task;
    this.studioSbPlaced = [];
    this.studioSbBank = (task.words || []).map(w => ({ text: w, used: false })).sort(() => Math.random() - 0.5);

    const promptEl = document.getElementById('studio-sb-prompt');
    if (promptEl) promptEl.textContent = task.prompt;

    const fb = document.getElementById('studio-sb-feedback');
    if (fb) {
      fb.style.display = 'none';
      fb.textContent = '';
    }

    this.renderStudioSb();
  }

  renderStudioSb() {
    const slots = document.getElementById('studio-sb-slots');
    const bank = document.getElementById('studio-sb-bank');
    if (!slots || !bank) return;

    if (this.studioSbPlaced.length === 0) {
      slots.innerHTML = `<span style="color:var(--text-muted); font-size:0.88rem;" id="studio-sb-empty-hint">Click word chips below in the correct order...</span>`;
    } else {
      slots.innerHTML = this.studioSbPlaced.map((w, idx) => `
        <div class="studio-chip-token" onclick="app.removeStudioSbToken(${idx})">
          ${w} <span style="font-size:0.75rem; opacity:0.8;">✕</span>
        </div>
      `).join('');
    }

    bank.innerHTML = this.studioSbBank.map((w, idx) => `
      <button class="studio-word-option ${w.used ? 'used' : ''}" onclick="app.addStudioSbToken(${idx})">
        ${w.text}
      </button>
    `).join('');
  }

  addStudioSbToken(index) {
    const item = this.studioSbBank[index];
    if (!item || item.used) return;

    item.used = true;
    this.studioSbPlaced.push(item.text);
    window.sound.playClick();
    this.renderStudioSb();
  }

  removeStudioSbToken(index) {
    const word = this.studioSbPlaced.splice(index, 1)[0];
    const match = this.studioSbBank.find(b => b.text === word && b.used);
    if (match) match.used = false;
    window.sound.playClick();
    this.renderStudioSb();
  }

  resetStudioSentenceBuilder() {
    if (!this.studioSbTask) return;
    this.initStudioSentenceBuilder(this.studioSbTask);
    window.sound.playClick();
  }

  checkStudioSentenceBuilder() {
    if (!this.studioSbTask) return;
    const current = this.studioSbPlaced.join(' ').trim().toLowerCase().replace(/[.,!?;]/g, '');
    const target = this.studioSbTask.target.trim().toLowerCase().replace(/[.,!?;]/g, '');

    const fb = document.getElementById('studio-sb-feedback');
    if (!fb) return;

    fb.style.display = 'block';
    if (current === target) {
      fb.style.background = 'rgba(16, 185, 129, 0.15)';
      fb.style.border = '1px solid #10b981';
      fb.style.color = '#10b981';
      fb.innerHTML = `<strong>🎉 Excellent! Exact Order!</strong><br>"${this.studioSbTask.target}"`;
      window.sound.playCorrect();
      this.triggerConfetti();
    } else {
      fb.style.background = 'rgba(239, 68, 68, 0.15)';
      fb.style.border = '1px solid #ef4444';
      fb.style.color = '#ef4444';
      fb.innerHTML = `<strong>⚠️ Check your word order:</strong><br>${this.studioSbTask.hint || 'Review the formula and try again.'}`;
      window.sound.playWrong();
    }
  }

  speakStudioSentenceBuilder() {
    if (this.studioSbTask) {
      window.sound.speak(this.studioSbTask.target);
    }
  }

  // --- STUDIO ACTIVE RECALL INPUT DRILL ---
  initStudioInputDrill(task) {
    if (!task) return;
    this.studioInputTask = task;

    const beforeEl = document.getElementById('studio-drill-before');
    const afterEl = document.getElementById('studio-drill-after');
    const hintEl = document.getElementById('studio-drill-hint-text');
    const inputEl = document.getElementById('studio-drill-input');
    const fb = document.getElementById('studio-drill-feedback');

    if (beforeEl) beforeEl.textContent = task.sentenceBefore;
    if (afterEl) afterEl.textContent = task.sentenceAfter;
    if (hintEl) hintEl.textContent = task.hint;
    if (inputEl) {
      inputEl.value = '';
      inputEl.style.borderColor = 'var(--border)';
    }
    if (fb) {
      fb.style.display = 'none';
      fb.textContent = '';
    }

    const wordbankEl = document.getElementById('studio-drill-wordbank');
    if (wordbankEl) {
      const vocabList = this.currentStudioMilestone?.targetVocabulary || [];
      if (vocabList.length > 0) {
        wordbankEl.innerHTML = vocabList.map(v => {
          const safeTerm = v.term.replace(/'/g, "\\'");
          return `
            <button type="button" class="studio-wordbank-chip" onclick="app.insertWordbankChipToInput('${safeTerm}')" title="Click chip to insert into answer box">
              <span>📌</span> ${v.term}
            </button>
          `;
        }).join('');
      } else {
        wordbankEl.innerHTML = `<span style="font-size:0.85rem; color:var(--text-muted);">Review vocabulary cards before completing the drill.</span>`;
      }
    }
  }

  checkStudioInputDrill() {
    if (!this.studioInputTask) return;
    const inputEl = document.getElementById('studio-drill-input');
    const fb = document.getElementById('studio-drill-feedback');
    if (!inputEl || !fb) return;

    const normalize = str => (str || '').trim().toLowerCase().replace(/[.,!?;'"]/g, '').replace(/\s+/g, ' ');
    const val = normalize(inputEl.value);
    const expected = normalize(this.studioInputTask.missingWord);

    fb.style.display = 'block';
    if (val === expected) {
      inputEl.style.borderColor = '#10b981';
      fb.style.background = 'rgba(16, 185, 129, 0.15)';
      fb.style.border = '1px solid #10b981';
      fb.style.color = '#10b981';
      fb.innerHTML = `<strong>✅ 100% Correct Active Recall!</strong><br>${this.studioInputTask.explanation}`;
      window.sound.playCorrect();
    } else {
      inputEl.style.borderColor = '#ef4444';
      fb.style.background = 'rgba(239, 68, 68, 0.15)';
      fb.style.border = '1px solid #ef4444';
      fb.style.color = '#ef4444';
      fb.innerHTML = `<strong>⚠️ Not quite. Expected:</strong> "<em>${this.studioInputTask.missingWord}</em>"<br>${this.studioInputTask.explanation}`;
      window.sound.playWrong();
    }
  }

  // --- STUDIO TECHNICAL CHALLENGE QUIZ ---
  initStudioQuiz(task) {
    if (!task) return;
    this.studioQuizTask = task;
    this.studioQuizAnswered = false;

    const qEl = document.getElementById('studio-quiz-question');
    const optContainer = document.getElementById('studio-quiz-options');
    const fb = document.getElementById('studio-quiz-feedback');

    if (qEl) qEl.textContent = task.question;
    if (fb) {
      fb.style.display = 'none';
      fb.textContent = '';
    }

    if (optContainer) {
      optContainer.innerHTML = task.options.map((opt, idx) => `
        <div class="studio-quiz-option" id="studio-quiz-opt-${idx}" onclick="app.selectStudioQuizOption(${idx})">
          <span style="font-weight:700; color:var(--text-muted);">${String.fromCharCode(65 + idx)}.</span>
          <span>${opt}</span>
        </div>
      `).join('');
    }
  }

  selectStudioQuizOption(index) {
    if (!this.studioQuizTask || this.studioQuizAnswered) return;
    this.studioQuizAnswered = true;

    const isCorrect = (index === this.studioQuizTask.correctIndex);
    const selectedEl = document.getElementById(`studio-quiz-opt-${index}`);
    const correctEl = document.getElementById(`studio-quiz-opt-${this.studioQuizTask.correctIndex}`);
    const fb = document.getElementById('studio-quiz-feedback');

    if (selectedEl) {
      selectedEl.classList.add(isCorrect ? 'correct' : 'wrong');
    }
    if (!isCorrect && correctEl) {
      correctEl.classList.add('correct');
    }

    if (fb) {
      fb.style.display = 'block';
      if (isCorrect) {
        fb.style.background = 'rgba(16, 185, 129, 0.12)';
        fb.style.border = '1px solid #10b981';
        fb.style.color = '#10b981';
        fb.innerHTML = `<strong>🎯 Spot on! Senior Engineering Precision:</strong><br>${this.studioQuizTask.explanation}`;
        window.sound.playCorrect();
      } else {
        fb.style.background = 'rgba(239, 68, 68, 0.12)';
        fb.style.border = '1px solid #ef4444';
        fb.style.color = '#ef4444';
        fb.innerHTML = `<strong>⚠️ Misconception Detected:</strong><br>${this.studioQuizTask.explanation}`;
        window.sound.playWrong();
      }
    }
  }

  // --- STUDIO SPOKEN SIMULATION ---
  initStudioSpeaking(task) {
    if (!task) return;
    this.studioSpeakingTask = task;

    const promptEl = document.getElementById('studio-speaking-prompt');
    const colocEl = document.getElementById('studio-speaking-collocations');
    const answerEl = document.getElementById('studio-speaking-model-answer');

    if (promptEl) promptEl.textContent = task.prompt;
    if (answerEl) answerEl.textContent = `"${task.sampleNativeAnswer}"`;
    if (colocEl) {
      colocEl.innerHTML = (task.collocations || []).map(c => `
        <span class="badge badge-tag" style="font-size:0.8rem; padding:0.35rem 0.65rem;">${c}</span>
      `).join('');
    }
  }

  speakStudioGoodExample() {
    if (this.currentStudioMilestone?.learnContent?.badVsGood?.good) {
      window.sound.speak(this.currentStudioMilestone.learnContent.badVsGood.good);
    }
  }

  speakStudioModelAnswer() {
    if (this.studioSpeakingTask?.sampleNativeAnswer) {
      window.sound.speak(this.studioSpeakingTask.sampleNativeAnswer);
    }
  }

  toggleStudioMilestoneMastery() {
    if (!this.currentStudioMilestoneId) return;
    this.toggleMilestone(this.currentStudioMilestoneId);
    const isDone = window.appStorage.isMilestoneCompleted(this.currentStudioMilestoneId);
    const masterBtn = document.getElementById('studio-toggle-mastered-btn');
    if (masterBtn) {
      masterBtn.innerHTML = isDone ? `<span>↩️</span> Mark as Incomplete` : `<span>✅</span> Mark as Mastered (+${this.currentStudioMilestone.xp} XP)`;
    }
  }

  completeAndMasterStudioMilestone() {
    if (!this.currentStudioMilestoneId) return;
    window.appStorage.setMilestoneCompleted(this.currentStudioMilestoneId, true, this.currentStudioMilestone?.xp || 60);
    window.sound.playCorrect();
    this.triggerConfetti();

    this.renderRoadmap();
    this.renderActiveMissionCard();
    this.updateStatsBar();

    const masterBtn = document.getElementById('studio-toggle-mastered-btn');
    if (masterBtn) masterBtn.innerHTML = `<span>↩️</span> Mark as Incomplete`;

    // Suggest next milestone
    const all = window.ROADMAP_DATA.getAllMilestones();
    const currIdx = all.findIndex(m => m.id === this.currentStudioMilestoneId);
    if (currIdx >= 0 && currIdx < all.length - 1) {
      const nextM = all[currIdx + 1];
      setTimeout(() => {
        if (confirm(`🎉 Milestone Mastered (+${this.currentStudioMilestone.xp} XP)!\n\nWould you like to advance to Milestone ${nextM.number}: "${nextM.title}" now?`)) {
          this.openLessonStudio(nextM.id);
        }
      }, 500);
    }
  }

  // ===== DAILY ENGLISH LESSON REMINDER SYSTEM =====
  initReminderEngine() {
    this.updateReminderWidgetUI();

    // Check reminder schedule every 30 seconds
    if (this.reminderInterval) clearInterval(this.reminderInterval);
    this.reminderInterval = setInterval(() => this.checkReminderSchedule(), 30000);

    // Initial check on load
    this.checkReminderSchedule();
  }

  updateReminderWidgetUI() {
    const settings = window.appStorage.getReminderSettings();
    const widgetEl = document.getElementById('roadmap-reminder-display');
    if (widgetEl) {
      widgetEl.textContent = settings.enabled ? `${settings.time} (On)` : 'Off';
      widgetEl.style.color = settings.enabled ? '#10b981' : 'var(--text-muted)';
    }
  }

  openReminderModal() {
    const settings = window.appStorage.getReminderSettings();

    const timeInput = document.getElementById('reminder-time-input');
    const enabledToggle = document.getElementById('reminder-enabled-toggle');
    const goalSelect = document.getElementById('reminder-goal-select');

    if (timeInput) timeInput.value = settings.time || '19:00';
    if (enabledToggle) enabledToggle.checked = !!settings.enabled;
    if (goalSelect) goalSelect.value = String(settings.goalMinutes || 20);

    // Days chips
    const activeDays = settings.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    document.querySelectorAll('#reminder-days-container .reminder-day-chip').forEach(chip => {
      const day = chip.getAttribute('data-day');
      chip.classList.toggle('active', activeDays.includes(day));
    });

    const modal = document.getElementById('lesson-reminder-modal');
    if (modal) modal.classList.add('active');
  }

  closeReminderModal() {
    const modal = document.getElementById('lesson-reminder-modal');
    if (modal) modal.classList.remove('active');
  }

  toggleReminderDay(day) {
    const chip = document.querySelector(`#reminder-days-container [data-day="${day}"]`);
    if (chip) chip.classList.toggle('active');
  }

  saveReminderSettingsFromModal() {
    const timeInput = document.getElementById('reminder-time-input');
    const enabledToggle = document.getElementById('reminder-enabled-toggle');
    const goalSelect = document.getElementById('reminder-goal-select');

    const activeDays = [];
    document.querySelectorAll('#reminder-days-container .reminder-day-chip.active').forEach(chip => {
      activeDays.push(chip.getAttribute('data-day'));
    });

    const newSettings = {
      time: timeInput ? timeInput.value : '19:00',
      enabled: enabledToggle ? enabledToggle.checked : true,
      goalMinutes: goalSelect ? parseInt(goalSelect.value, 10) : 20,
      days: activeDays.length ? activeDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      soundAlert: true
    };

    window.appStorage.saveReminderSettings(newSettings);
    this.updateReminderWidgetUI();
    this.closeReminderModal();
    window.sound.playCorrect();

    alert(`⏰ Daily English Lesson Reminder saved for ${newSettings.time} on ${newSettings.days.join(', ')}!`);
  }

  requestDesktopNotifications() {
    if (!('Notification' in window)) {
      alert('Desktop notifications are not supported in your browser.');
      return;
    }

    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        window.sound.playCorrect();
        new Notification('🚀 Antigravity English Trainer', {
          body: 'Desktop reminders enabled! We will notify you for your daily English session.',
          icon: 'favicon.ico'
        });
      } else {
        alert('Notification permission was not granted.');
      }
    });
  }

  testReminderAlertNow() {
    this.triggerReminderAlert(
      '⏰ Time for your daily English training!',
      'Keep your daily streak alive! Solve today\'s active roadmap milestone.'
    );
  }

  checkReminderSchedule() {
    const settings = window.appStorage.getReminderSettings();
    if (!settings.enabled) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (settings.lastNotifiedDate === todayStr) return; // Already reminded today

    // Check day of week
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = daysMap[now.getDay()];
    if (settings.days && !settings.days.includes(currentDay)) return;

    // Check time HH:MM
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMins = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMins}`;

    if (currentTimeStr === settings.time) {
      window.appStorage.markReminderNotifiedToday();
      this.triggerReminderAlert(
        '🚀 Daily English Lesson Reminder!',
        `It is ${settings.time}! Time for your ${settings.goalMinutes}-minute English mastery workout.`
      );
    }
  }

  triggerReminderAlert(title, message) {
    window.sound.playCorrect();

    // Desktop system notification if granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: 'favicon.ico'
        });
      } catch (e) {
        console.warn('Desktop notification error:', e);
      }
    }

    // In-App proactive banner
    const container = document.getElementById('daily-reminder-banner-container');
    if (container) {
      const banner = document.createElement('div');
      banner.className = 'daily-reminder-banner';
      banner.innerHTML = `
        <div style="font-size:2rem;">⏰</div>
        <div>
          <strong style="color:var(--text-main); font-size:1rem; display:block;">${title}</strong>
          <span style="color:var(--text-muted); font-size:0.85rem;">${message}</span>
        </div>
        <div style="display:flex; gap:0.5rem; margin-left:auto;">
          <button class="btn-primary" onclick="app.openActiveMilestoneStudio(); this.closest('.daily-reminder-banner').remove();" style="padding:0.5rem 1rem; font-size:0.85rem; white-space:nowrap;">
            <span>🚀</span> Start Lesson
          </button>
          <button class="icon-btn" onclick="this.closest('.daily-reminder-banner').remove()" style="width:32px; height:32px; font-size:0.9rem;">✕</button>
        </div>
      `;
      container.appendChild(banner);

      // Auto dismiss after 15 seconds
      setTimeout(() => {
        if (banner.parentElement) banner.remove();
      }, 15000);
    }
  }

  syncRoadmapAutoProgress() {
    if (!window.ROADMAP_DATA || !window.appStorage || !window.appStorage.state) return;

    // Check sentence builder completions
    const sbDone = (window.appStorage.state.completedPractices?.sentences || []).length;
    if (sbDone >= 3) window.appStorage.setMilestoneCompleted('m_1_1', true, 50);

    // Check grammar quiz completions
    const gqDone = (window.appStorage.state.completedPractices?.quizzes || []).length;
    if (gqDone >= 2) window.appStorage.setMilestoneCompleted('m_1_2', true, 45);

    // Check error hunter completions
    const ehDone = (window.appStorage.state.completedPractices?.errors || []).length;
    if (ehDone >= 1) window.appStorage.setMilestoneCompleted('m_1_3', true, 60);
    if (ehDone >= 5) window.appStorage.setMilestoneCompleted('m_5_2', true, 65);

    // Check letter scramble completions
    const lsDone = (window.appStorage.state.completedPractices?.letters || []).length;
    if (lsDone >= 5) window.appStorage.setMilestoneCompleted('m_3_3', true, 50);

    // Check AI sentence scores
    const sentScore = window.appStorage.state.aiEvaluations?.totalSentenceScore || 0;
    const sentCount = window.appStorage.state.aiEvaluations?.sentencesCount || 0;
    if (sentCount > 0 && (sentScore / sentCount) >= 70) {
      window.appStorage.setMilestoneCompleted('m_2_3', true, 70);
    }

    // Check Speaking completions
    if (window.appStorage.isSpeakingTopicCompleted && window.appStorage.isSpeakingTopicCompleted('code_001')) {
      window.appStorage.setMilestoneCompleted('m_4_3', true, 90);
    }
    if (window.appStorage.isSpeakingTopicCompleted && window.appStorage.isSpeakingTopicCompleted('code_002')) {
      window.appStorage.setMilestoneCompleted('m_5_3', true, 85);
    }
  }

// ===== TOPIC-BASED VOCABULARY & ACTIVE RECALL ENGINE =====
  initTopicVocabulary() {
    if (!window.TOPIC_VOCABULARY || !window.TOPIC_VOCABULARY.length) return;

    // Validate that currentTopicId exists
    const validTopic = window.TOPIC_VOCABULARY.find(t => t.id === this.currentTopicId);
    if (!validTopic) {
      this.currentTopicId = window.TOPIC_VOCABULARY[0].id;
    }

    this.renderTopicSelector();
    this.prepareTopicChallenges();
    this.renderStudyCard();
    this.loadCurrentChallenge();
    this.refreshVocabularyView();
  }

  getCurrentTopic() {
    if (!window.TOPIC_VOCABULARY || !window.TOPIC_VOCABULARY.length) return null;
    return window.TOPIC_VOCABULARY.find(t => t.id === this.currentTopicId) || window.TOPIC_VOCABULARY[0];
  }

  renderTopicSelector() {
    const container = document.getElementById('topic-selector-bar');
    if (!container || !window.TOPIC_VOCABULARY) return;

    container.innerHTML = window.TOPIC_VOCABULARY.map(t => {
      const isActive = t.id === this.currentTopicId;
      return `
        <button class="topic-tab-pill ${isActive ? 'active' : ''}" onclick="app.selectTopic('${t.id}')">
          <span class="topic-pill-icon">${t.badge || '📚'}</span>
          <span class="topic-pill-title">${t.title}</span>
          <span class="topic-pill-count">${t.words ? t.words.length : 12} words</span>
        </button>
      `;
    }).join('');
  }

  selectTopic(topicId) {
    const found = window.TOPIC_VOCABULARY.find(t => t.id === topicId);
    if (!found) return;

    this.currentTopicId = topicId;
    window.appStorage.setActiveNav('vocabTopicId', topicId);
    this.studyWordIndex = 0;
    window.appStorage.setIndex('studyWordIndex', 0);

    this.renderTopicSelector();
    this.prepareTopicChallenges();
    this.renderStudyCard();
    this.loadCurrentChallenge();
  }

  switchVocabSubtab(subtab, persist = true) {
    this.currentVocabSubtab = subtab;
    if (persist) {
      window.appStorage.setActiveNav('vocabSubtab', subtab);
    }

    document.querySelectorAll('.vocab-subtab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-subtab') === subtab);
    });

    const studyView = document.getElementById('vocab-view-study');
    const practiceView = document.getElementById('vocab-view-practice');
    const allView = document.getElementById('vocab-view-all');
    const learnedView = document.getElementById('vocab-view-learned');

    if (studyView) studyView.style.display = subtab === 'study' ? 'block' : 'none';
    if (practiceView) practiceView.style.display = subtab === 'practice' ? 'block' : 'none';
    if (allView) allView.style.display = subtab === 'all' ? 'block' : 'none';
    if (learnedView) learnedView.style.display = subtab === 'learned' ? 'block' : 'none';

    if (subtab === 'study') {
      this.renderStudyCard();
    } else if (subtab === 'practice') {
      this.loadCurrentChallenge();
    } else if (subtab === 'all') {
      this.renderCatalogWords('all');
    } else if (subtab === 'learned') {
      this.renderLearnedWords();
    }
  }

  refreshVocabularyView() {
    const totalWords = window.appStorage.getAllVocabulary().length;
    const learnedCount = window.appStorage.getLearnedCount();

    const learnedBadge = document.getElementById('vocab-learned-badge');
    const totalBadge = document.getElementById('vocab-total-badge');
    if (learnedBadge) learnedBadge.textContent = learnedCount;
    if (totalBadge) totalBadge.textContent = totalWords;

    this.switchVocabSubtab(this.currentVocabSubtab, false);
  }

  // --- STUDY CARDS (12 WORDS PER TOPIC) ---
  renderStudyCard() {
    const topic = this.getCurrentTopic();
    if (!topic || !topic.words || !topic.words.length) return;

    if (this.studyWordIndex >= topic.words.length) this.studyWordIndex = 0;
    if (this.studyWordIndex < 0) this.studyWordIndex = topic.words.length - 1;
    window.appStorage.setIndex('studyWordIndex', this.studyWordIndex);

    const w = topic.words[this.studyWordIndex];
    this.activeFlashcardWord = w;

    const topicBadge = document.getElementById('study-topic-badge');
    if (topicBadge) topicBadge.textContent = topic.title.split(':')[0] || topic.title;

    const levelBadge = document.getElementById('study-word-level');
    if (levelBadge) levelBadge.textContent = w.level || 'C1';

    const posEl = document.getElementById('study-word-pos');
    if (posEl) posEl.textContent = w.pos || 'noun';

    const wordText = document.getElementById('study-word-text');
    if (wordText) wordText.textContent = w.word;

    const transcriptionEl = document.getElementById('study-word-transcription');
    if (transcriptionEl) transcriptionEl.textContent = w.transcription || '';

    const counterEl = document.getElementById('study-card-counter');
    if (counterEl) counterEl.textContent = `Word ${this.studyWordIndex + 1} of ${topic.words.length}`;

    const defBox = document.getElementById('study-word-definition');
    if (defBox) defBox.textContent = w.definition;

    const collsList = document.getElementById('study-word-collocations');
    if (collsList) {
      collsList.innerHTML = (w.collocations || []).map(col =>
        `<span class="topic-collocation-chip" onclick="sound.speak('${col.replace(/'/g, "\\'")}')" title="Click to pronounce">${col}</span>`
      ).join('');
    }

    const examplesList = document.getElementById('study-word-examples');
    if (examplesList) {
      examplesList.innerHTML = (w.examples || []).map(ex =>
        `<div class="topic-study-example-item">💬 "${ex}"</div>`
      ).join('');
    }

    const dotsContainer = document.getElementById('study-step-indicators');
    if (dotsContainer) {
      dotsContainer.innerHTML = topic.words.map((_, idx) =>
        `<button class="topic-step-dot ${idx === this.studyWordIndex ? 'active' : ''}" onclick="app.goToStudyWord(${idx})" title="Word ${idx + 1}: ${topic.words[idx].word}"></button>`
      ).join('');
    }
  }

  nextStudyWord() {
    window.sound.playClick();
    const topic = this.getCurrentTopic();
    if (!topic || !topic.words.length) return;
    this.studyWordIndex = (this.studyWordIndex + 1) % topic.words.length;
    this.renderStudyCard();
  }

  prevStudyWord() {
    window.sound.playClick();
    const topic = this.getCurrentTopic();
    if (!topic || !topic.words.length) return;
    this.studyWordIndex = (this.studyWordIndex - 1 + topic.words.length) % topic.words.length;
    this.renderStudyCard();
  }

  goToStudyWord(idx) {
    window.sound.playClick();
    this.studyWordIndex = idx;
    this.renderStudyCard();
  }

  speakStudyWord() {
    const topic = this.getCurrentTopic();
    if (!topic || !topic.words[this.studyWordIndex]) return;
    window.sound.speak(topic.words[this.studyWordIndex].word);
  }

  // --- 24-CHALLENGE PRACTICE ARENA (2 TESTS PER WORD, SHUFFLED) ---
  prepareTopicChallenges() {
    const topic = this.getCurrentTopic();
    if (!topic) return;

    const challenges = [];
    topic.words.forEach(w => {
      if (w.challenges && Array.isArray(w.challenges)) {
        w.challenges.forEach(ch => {
          // Shuffle options so correct answer position is never predictable
          const shuffledOptions = [...ch.options].sort(() => Math.random() - 0.5);
          challenges.push({
            ...ch,
            wordId: w.id,
            targetWord: w.word,
            shuffledOptions
          });
        });
      }
    });

    // Thorough Fisher-Yates shuffle across all words in this topic!
    for (let i = challenges.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [challenges[i], challenges[j]] = [challenges[j], challenges[i]];
    }

    this.activeTopicChallenges = challenges;
    this.challengeIndex = 0;
    this.challengeScore = { correct: 0, total: 0 };
    this.activeChallengeAnswered = false;

    const practiceBadge = document.getElementById('vocab-practice-badge');
    if (practiceBadge) practiceBadge.textContent = `0/${challenges.length}`;
  }

  loadCurrentChallenge() {
    const topic = this.getCurrentTopic();
    if (!topic) return;

    if (!this.activeTopicChallenges || !this.activeTopicChallenges.length) {
      this.prepareTopicChallenges();
    }

    const total = this.activeTopicChallenges.length;

    // Completed all challenges in topic!
    if (this.challengeIndex >= total) {
      this.renderTopicArenaCompletion();
      return;
    }

    const ch = this.activeTopicChallenges[this.challengeIndex];
    this.activeChallengeAnswered = false;

    const topicBadge = document.getElementById('ch-topic-badge');
    if (topicBadge) topicBadge.textContent = topic.title.split(':')[0] || topic.title;

    const stepDisplay = document.getElementById('ch-step-display');
    if (stepDisplay) stepDisplay.textContent = `${this.challengeIndex + 1} of ${total}`;

    const scoreDisplay = document.getElementById('ch-score-display');
    if (scoreDisplay) scoreDisplay.textContent = `Score: ${this.challengeScore.correct}/${this.challengeScore.total}`;

    const practiceBadge = document.getElementById('vocab-practice-badge');
    if (practiceBadge) practiceBadge.textContent = `${this.challengeScore.correct}/${total}`;

    // Render sentence with blank highlight
    const sentenceBox = document.getElementById('ch-sentence-text');
    if (sentenceBox) {
      sentenceBox.innerHTML = ch.prompt.replace('_____', `<span class="challenge-blank-highlight" id="ch-active-blank">_____</span>`);
    }

    // Hint text
    const hintText = document.getElementById('ch-hint-text');
    if (hintText) hintText.textContent = `💡 Hint: ${ch.hint}`;

    // Reset Type Mode
    const typeInput = document.getElementById('ch-typing-input');
    if (typeInput) {
      typeInput.value = '';
      typeInput.disabled = false;
      if (this.challengeInputMode === 'type') {
        setTimeout(() => typeInput.focus(), 50);
      }
    }
    const checkBtn = document.getElementById('ch-type-check-btn');
    if (checkBtn) checkBtn.disabled = false;

    // Reset Multiple Choice Mode
    const optionsGrid = document.getElementById('ch-options-grid');
    if (optionsGrid) {
      optionsGrid.innerHTML = ch.shuffledOptions.map((opt, idx) => `
        <button class="challenge-option-btn" onclick="app.selectChallengeOption('${opt.replace(/'/g, "\\'")}', this)">
          <span>${String.fromCharCode(65 + idx)}) ${opt}</span>
          <span class="ch-opt-icon">⚪</span>
        </button>
      `).join('');
    }

    // Hide feedback & Next button
    const fb = document.getElementById('ch-feedback-box');
    if (fb) fb.style.display = 'none';

    const nextBtn = document.getElementById('ch-next-btn');
    if (nextBtn) nextBtn.style.display = 'none';

    // Ensure right mode container is visible
    this.setChallengeInputMode(this.challengeInputMode, false);
  }

  setChallengeInputMode(mode, focus = true) {
    this.challengeInputMode = mode;

    const btnType = document.getElementById('btn-ch-mode-type');
    const btnChoice = document.getElementById('btn-ch-mode-choice');
    if (btnType) btnType.classList.toggle('active', mode === 'type');
    if (btnChoice) btnChoice.classList.toggle('active', mode === 'choice');

    const typeContainer = document.getElementById('ch-typing-container');
    const choiceContainer = document.getElementById('ch-choice-container');
    if (typeContainer) typeContainer.style.display = mode === 'type' ? 'block' : 'none';
    if (choiceContainer) choiceContainer.style.display = mode === 'choice' ? 'block' : 'none';

    if (mode === 'type' && focus && !this.activeChallengeAnswered) {
      const input = document.getElementById('ch-typing-input');
      if (input) input.focus();
    }
  }

  checkChallengeTyping() {
    if (this.activeChallengeAnswered) return;

    const input = document.getElementById('ch-typing-input');
    const userVal = input ? input.value.trim().toLowerCase() : '';
    if (!userVal) {
      if (input) input.focus();
      return;
    }

    this.activeChallengeAnswered = true;
    const ch = this.activeTopicChallenges[this.challengeIndex];
    const isCorrect = userVal === ch.targetWord.toLowerCase();

    this.challengeScore.total++;
    if (isCorrect) this.challengeScore.correct++;

    const checkBtn = document.getElementById('ch-type-check-btn');
    if (checkBtn) checkBtn.disabled = true;
    if (input) input.disabled = true;

    const blank = document.getElementById('ch-active-blank');
    const fb = document.getElementById('ch-feedback-box');
    const nextBtn = document.getElementById('ch-next-btn');

    if (isCorrect) {
      window.sound.playCorrect();
      window.sound.speak(ch.targetWord);
      this.triggerConfetti();

      window.appStorage.markWordLearned(ch.wordId);
      window.appStorage.recordPracticeCompletion('vocabulary', ch.id, 15);
      this.updateStatsBar();

      if (blank) {
        blank.textContent = ch.targetWord;
        blank.className = 'challenge-blank-highlight correct';
      }

      if (fb) {
        fb.className = 'challenge-feedback-card correct';
        fb.style.display = 'flex';
        fb.innerHTML = `
          <div class="feedback-title">🎉 Excellent active recall! "${ch.targetWord}" (+15 XP)</div>
          <div class="feedback-explanation">💡 <strong>Contextual Rule:</strong> ${ch.explanation}</div>
        `;
      }
    } else {
      window.sound.playWrong();
      if (blank) {
        blank.textContent = ch.targetWord;
        blank.className = 'challenge-blank-highlight wrong';
      }

      if (fb) {
        fb.className = 'challenge-feedback-card wrong';
        fb.style.display = 'flex';
        fb.innerHTML = `
          <div class="feedback-title">❌ Not quite! The correct word is: "${ch.targetWord}"</div>
          <div class="feedback-explanation">💡 <strong>Contextual Rule:</strong> ${ch.explanation}</div>
        `;
      }
    }

    const scoreDisplay = document.getElementById('ch-score-display');
    if (scoreDisplay) scoreDisplay.textContent = `Score: ${this.challengeScore.correct}/${this.challengeScore.total}`;

    const practiceBadge = document.getElementById('vocab-practice-badge');
    if (practiceBadge) practiceBadge.textContent = `${this.challengeScore.correct}/${this.activeTopicChallenges.length}`;

    if (nextBtn) nextBtn.style.display = 'inline-flex';
  }

  selectChallengeOption(selectedWord, btnEl) {
    if (this.activeChallengeAnswered) return;
    this.activeChallengeAnswered = true;

    const ch = this.activeTopicChallenges[this.challengeIndex];
    const isCorrect = selectedWord.toLowerCase() === ch.targetWord.toLowerCase();

    this.challengeScore.total++;
    if (isCorrect) this.challengeScore.correct++;

    const buttons = document.querySelectorAll('.challenge-option-btn');
    buttons.forEach(btn => {
      btn.style.pointerEvents = 'none';
      const txt = btn.querySelector('span')?.textContent || '';
      if (txt.includes(ch.targetWord)) {
        btn.classList.add('correct');
        const icon = btn.querySelector('.ch-opt-icon');
        if (icon) icon.textContent = '✅';
      }
    });

    if (!isCorrect && btnEl) {
      btnEl.classList.add('wrong');
      const icon = btnEl.querySelector('.ch-opt-icon');
      if (icon) icon.textContent = '❌';
    }

    const blank = document.getElementById('ch-active-blank');
    const fb = document.getElementById('ch-feedback-box');
    const nextBtn = document.getElementById('ch-next-btn');

    if (isCorrect) {
      window.sound.playCorrect();
      window.sound.speak(ch.targetWord);
      this.triggerConfetti();

      window.appStorage.markWordLearned(ch.wordId);
      window.appStorage.recordPracticeCompletion('vocabulary', ch.id, 15);
      this.updateStatsBar();

      if (blank) {
        blank.textContent = ch.targetWord;
        blank.className = 'challenge-blank-highlight correct';
      }

      if (fb) {
        fb.className = 'challenge-feedback-card correct';
        fb.style.display = 'flex';
        fb.innerHTML = `
          <div class="feedback-title">🎯 Spot on! "${ch.targetWord}" is correct (+15 XP)</div>
          <div class="feedback-explanation">💡 <strong>Contextual Rule:</strong> ${ch.explanation}</div>
        `;
      }
    } else {
      window.sound.playWrong();
      if (blank) {
        blank.textContent = ch.targetWord;
        blank.className = 'challenge-blank-highlight wrong';
      }

      if (fb) {
        fb.className = 'challenge-feedback-card wrong';
        fb.style.display = 'flex';
        fb.innerHTML = `
          <div class="feedback-title">❌ Not quite! The correct word is: "${ch.targetWord}"</div>
          <div class="feedback-explanation">💡 <strong>Contextual Rule:</strong> ${ch.explanation}</div>
        `;
      }
    }

    const scoreDisplay = document.getElementById('ch-score-display');
    if (scoreDisplay) scoreDisplay.textContent = `Score: ${this.challengeScore.correct}/${this.challengeScore.total}`;

    const practiceBadge = document.getElementById('vocab-practice-badge');
    if (practiceBadge) practiceBadge.textContent = `${this.challengeScore.correct}/${this.activeTopicChallenges.length}`;

    if (nextBtn) nextBtn.style.display = 'inline-flex';
  }

  nextChallengeTask() {
    this.challengeIndex++;
    this.loadCurrentChallenge();
  }

  shuffleCurrentPracticeChallenges() {
    window.sound.playClick();
    this.prepareTopicChallenges();
    this.loadCurrentChallenge();
  }

  renderTopicArenaCompletion() {
    const topic = this.getCurrentTopic();
    const arenaCard = document.querySelector('#vocab-view-practice .challenge-arena-card');
    if (!arenaCard) return;

    const percent = Math.round((this.challengeScore.correct / this.challengeScore.total) * 100) || 0;
    const isMastered = percent >= 80;

    arenaCard.innerHTML = `
      <div style="text-align:center; padding:2rem 1rem;">
        <div style="font-size:3rem; margin-bottom:0.75rem;">${isMastered ? '🏆' : '🎯'}</div>
        <h2 style="margin-bottom:0.5rem; color:var(--text-main);">Topic Practice Complete!</h2>
        <p style="color:var(--text-muted); font-size:1rem; margin-bottom:1.5rem;">
          You completed all 24 challenges for <strong>${topic.title}</strong>!
        </p>
        <div style="display:inline-flex; align-items:center; gap:1.5rem; background:var(--card-bg); padding:1rem 2rem; border-radius:12px; border:1px solid var(--border-color); margin-bottom:1.5rem;">
          <div>
            <div style="font-size:2rem; font-weight:800; color:${isMastered ? 'var(--accent-color)' : '#f59e0b'};">${this.challengeScore.correct} / 24</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">Accuracy (${percent}%)</div>
          </div>
          <div style="border-left:1px solid var(--border-color); padding-left:1.5rem;">
            <div style="font-size:2rem; font-weight:800; color:#38bdf8;">+${this.challengeScore.correct * 15} XP</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">Total XP Earned</div>
          </div>
        </div>
        <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
          <button class="btn-primary" onclick="app.shuffleCurrentPracticeChallenges()">
            <span>🎲</span> Reshuffle & Practice Again
          </button>
          <button class="btn-secondary" onclick="app.switchVocabSubtab('study')">
            <span>🃏</span> Return to Study Cards
          </button>
        </div>
      </div>
    `;
  }

  // --- CATALOG OF ALL WORDS (60 WORDS) ---
  renderCatalogWords(category = 'all', query = '') {
    const safeText = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const container = document.getElementById('all-words-container');
    if (!container) return;

    const all = window.appStorage.getAllVocabulary();
    let list = all;

    if (query) {
      list = list.filter(w =>
        w.word.toLowerCase().includes(query) ||
        (w.definition && w.definition.toLowerCase().includes(query)) ||
        (w.collocations && w.collocations.some(c => c.toLowerCase().includes(query))) ||
        (w.examples && w.examples.some(e => e.toLowerCase().includes(query)))
      );
    }

    const totalBadge = document.getElementById('vocab-total-badge');
    if (totalBadge) totalBadge.textContent = all.length;

    container.innerHTML = list.map(item => {
      const isLearned = window.appStorage.isWordLearned(item.id);

      return `
        <div class="word-card ${isLearned ? 'mastered' : ''}">
          <div class="word-card-top">
            <div class="word-title-group">
              <span class="word-head">${safeText(item.word)}</span>
              <span class="word-transcription">${safeText(item.transcription || '')}</span>
            </div>
            <button class="speak-mini-btn" data-speak-word="${safeText(item.word)}" title="Listen to pronunciation">🔊</button>
          </div>

          <div class="word-meaning-box">
            <span class="badge" style="font-size:0.75rem; margin-right:0.35rem;">${safeText(item.pos || 'term')}</span>
            <span>${safeText(item.definition || item.ukr)}</span>
          </div>

          ${(item.collocations && item.collocations.length) ? `
            <div class="where-to-use-box" style="margin: 0.5rem 0;">
              <strong>Collocations:</strong> ${safeText(item.collocations.join(', '))}
            </div>
          ` : ''}

          ${(item.examples && item.examples.length) ? `
            <div class="word-example">
              <strong>Example:</strong> "${safeText(item.examples[0])}"
            </div>
          ` : ''}

          <div class="word-footer">
            <span class="badge badge-tag">${safeText(item.level || 'C1')}</span>
            ${isLearned ? `
              <span class="learned-stamp">Mastered ✅</span>
            ` : `
              <button class="btn-secondary" style="padding:0.35rem 0.75rem; font-size:0.75rem;" data-test-word="${safeText(item.word)}">
                ⚡ Test in Arena
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
    container.querySelectorAll('[data-speak-word]').forEach(button => button.addEventListener('click', () => window.sound.speak(button.dataset.speakWord)));
    container.querySelectorAll('[data-test-word]').forEach(button => button.addEventListener('click', () => this.testWordInTopicPractice(button.dataset.testWord)));
  }

  testWordInTopicPractice(targetWord) {
    if (!window.TOPIC_VOCABULARY) return;
    for (const t of window.TOPIC_VOCABULARY) {
      const found = t.words.find(w => w.word.toLowerCase() === targetWord.toLowerCase());
      if (found) {
        this.selectTopic(t.id);
        this.switchVocabSubtab('practice');
        return;
      }
    }
  }

  renderLearnedWords(query = '') {
    const safeText = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const container = document.getElementById('learned-words-container');
    if (!container) return;

    const all = window.appStorage.getAllVocabulary();
    const learnedMap = window.appStorage.getLearnedWordsMap();
    let learnedList = all.filter(w => learnedMap[w.id]);

    if (query) {
      learnedList = learnedList.filter(w =>
        w.word.toLowerCase().includes(query) ||
        (w.definition && w.definition.toLowerCase().includes(query))
      );
    }

    const badge = document.getElementById('vocab-learned-badge');
    if (badge) badge.textContent = Object.keys(learnedMap).length;

    if (learnedList.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🌱</div>
          <h3>No mastered words yet</h3>
          <p>Practice with 24 challenges in the Arena, type words correctly, or master quizzes to add words to your active vault!</p>
          <button class="btn-primary" onclick="app.switchVocabSubtab('practice')" style="margin: 0 auto;">
            🚀 Start Practice Arena
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = learnedList.map(item => {
      const meta = learnedMap[item.id] || {};
      return `
        <div class="word-card mastered">
          <div class="word-card-top">
            <div class="word-title-group">
              <span class="word-head">${safeText(item.word)}</span>
              <span class="word-transcription">${safeText(item.transcription || '')}</span>
            </div>
            <button class="speak-mini-btn" data-speak-word="${safeText(item.word)}" title="Listen to pronunciation">🔊</button>
          </div>

          <div class="word-meaning-box">
            <span class="badge" style="font-size:0.75rem; margin-right:0.35rem;">${safeText(item.pos || 'term')}</span>
            <span>${safeText(item.definition || item.ukr)}</span>
          </div>

          ${(item.examples && item.examples.length) ? `
            <div class="word-example">
              <strong>Example:</strong> "${safeText(item.examples[0])}"
            </div>
          ` : ''}

          <div class="word-footer">
            <span class="learned-stamp">✅ Mastered (${safeText(meta.learnedAt || 'recently')})</span>
            <button class="icon-btn" style="width:28px; height:28px; font-size:0.75rem;" data-unlearn-word="${safeText(item.id)}" title="Remove from mastered">✕</button>
          </div>
        </div>
      `;
    }).join('');
    container.querySelectorAll('[data-speak-word]').forEach(button => button.addEventListener('click', () => window.sound.speak(button.dataset.speakWord)));
    container.querySelectorAll('[data-unlearn-word]').forEach(button => button.addEventListener('click', () => this.unlearnWord(button.dataset.unlearnWord)));
  }

  // Legacy flashcard & situation compatibility stubs
  showCurrentFlashcard() { this.renderStudyCard(); }
  flipFlashcard() {}
  speakCurrentFlashcard() { this.speakStudyWord(); }
  nextFlashcard() { this.nextStudyWord(); }
  prevFlashcard() { this.prevStudyWord(); }
  markFlashcardLearned() {}
  loadSituationTask() { this.loadCurrentChallenge(); }
  selectSituationOption() {}
  nextSituationTask() { this.nextChallengeTask(); }
  testWordInSituation(id) {
    const word = window.appStorage.getAllVocabulary().find(w => w.id === id);
    if (word) this.testWordInTopicPractice(word.word);
  }

  unlearnWord(id) {
    window.appStorage.unlearnWord(id);
    this.updateStatsBar();
    this.renderLearnedWords();
    this.refreshVocabularyView();
  }

  initCustomWordModal() {
    const modal = document.getElementById('add-word-modal');
    const openBtn = document.getElementById('btn-open-add-word-modal');
    const closeBtn = document.getElementById('btn-close-add-modal');
    const saveBtn = document.getElementById('btn-save-custom-word');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => modal.classList.add('active'));
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const word = document.getElementById('custom-word-input').value.trim();
        const transcription = document.getElementById('custom-transcription-input').value.trim();
        const ukr = document.getElementById('custom-ukr-input').value.trim();
        const whereToUse = document.getElementById('custom-where-input').value.trim();
        const example = document.getElementById('custom-example-input').value.trim();

        if (!word || !ukr) {
          alert('Будь ласка, заповніть як мінімум слово англійською та переклад!');
          return;
        }

        window.appStorage.addCustomWord({ word, transcription, ukr, whereToUse, example });
        window.sound.playFanfare();

        document.getElementById('custom-word-input').value = '';
        document.getElementById('custom-transcription-input').value = '';
        document.getElementById('custom-ukr-input').value = '';
        document.getElementById('custom-where-input').value = '';
        document.getElementById('custom-example-input').value = '';

        modal.classList.remove('active');
        this.updateStatsBar();
        this.refreshVocabularyView();
      });
    }
  }

  // ===== TAB 3: PRACTICE ARENA =====
  initPracticeModes() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        this.switchPracticeMode(mode);
      });
    });
  }

  switchPracticeMode(mode, persist = true) {
    this.currentPracticeMode = mode;
    if (persist) {
      window.appStorage.setActiveNav('practiceMode', mode);
    }

    document.querySelectorAll('.mode-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-mode') === mode);
    });

    document.getElementById('practice-arena-sentences').style.display = mode === 'sentences' ? 'block' : 'none';
    document.getElementById('practice-arena-letters').style.display = mode === 'letters' ? 'block' : 'none';
    document.getElementById('practice-arena-quiz').style.display = mode === 'quiz' ? 'block' : 'none';
    document.getElementById('practice-arena-errors').style.display = mode === 'errors' ? 'block' : 'none';
  }

  loadSentenceBuilderTask() {
    const tasks = PRACTICE_DATA.sentenceBuilder;
    if (!tasks || tasks.length === 0) return;

    if (this.sbIndex >= tasks.length) this.sbIndex = 0;
    window.appStorage.setIndex('sentenceBuilder', this.sbIndex);

    const task = tasks[this.sbIndex];

    const progressEl = document.getElementById('sb-progress-step');
    if (progressEl) progressEl.textContent = `Task ${this.sbIndex + 1} of ${tasks.length}`;

    const promptEl = document.getElementById('sb-ukr-prompt');
    if (promptEl) promptEl.textContent = task.prompt || task.ukr;

    const fb = document.getElementById('sb-feedback-box');
    if (fb) fb.style.display = 'none';

    const checkBtn = document.getElementById('sb-check-btn');
    const nextBtn = document.getElementById('sb-next-btn');
    if (checkBtn) checkBtn.style.display = 'inline-flex';
    if (nextBtn) nextBtn.style.display = 'none';

    const dropZone = document.getElementById('sb-drop-zone');
    if (dropZone) {
      dropZone.className = 'sentence-drop-area';
      dropZone.innerHTML = '';
    }

    this.sbTokensInSlot = [];
    this.sbTokensInBank = [...task.words].sort(() => Math.random() - 0.5);

    this.renderSentenceBuilderTokens();
  }

  renderSentenceBuilderTokens() {
    const dropZone = document.getElementById('sb-drop-zone');
    const bankZone = document.getElementById('sb-bank-zone');
    if (!dropZone || !bankZone) return;

    dropZone.innerHTML = '';
    this.sbTokensInSlot.forEach((token, idx) => {
      const btn = document.createElement('div');
      btn.className = 'word-token in-slot';
      btn.textContent = token;
      btn.onclick = () => this.returnTokenToBank(idx);
      dropZone.appendChild(btn);
    });

    bankZone.innerHTML = '';
    this.sbTokensInBank.forEach((token, idx) => {
      const btn = document.createElement('div');
      btn.className = 'word-token';
      btn.textContent = token;
      btn.onclick = () => this.moveTokenToSlot(idx);
      bankZone.appendChild(btn);
    });
  }

  moveTokenToSlot(bankIndex) {
    window.sound.playClick();
    const token = this.sbTokensInBank.splice(bankIndex, 1)[0];
    this.sbTokensInSlot.push(token);
    this.renderSentenceBuilderTokens();
  }

  returnTokenToBank(slotIndex) {
    window.sound.playClick();
    const token = this.sbTokensInSlot.splice(slotIndex, 1)[0];
    this.sbTokensInBank.push(token);
    this.renderSentenceBuilderTokens();
  }

  resetCurrentSentence() {
    const task = PRACTICE_DATA.sentenceBuilder[this.sbIndex];
    if (!task) return;
    this.sbTokensInSlot = [];
    this.sbTokensInBank = [...task.words].sort(() => Math.random() - 0.5);
    this.renderSentenceBuilderTokens();
    const fb = document.getElementById('sb-feedback-box');
    if (fb) fb.style.display = 'none';
  }

  checkSentenceBuilder() {
    const task = PRACTICE_DATA.sentenceBuilder[this.sbIndex];
    if (!task) return;
    const userSentence = this.sbTokensInSlot.join(' ').trim();
    const correctSentence = task.words.join(' ').trim();

    const fb = document.getElementById('sb-feedback-box');
    const dropZone = document.getElementById('sb-drop-zone');
    const checkBtn = document.getElementById('sb-check-btn');
    const nextBtn = document.getElementById('sb-next-btn');

    if (userSentence.toLowerCase() === correctSentence.toLowerCase()) {
      window.sound.playCorrect();
      window.sound.speak(correctSentence);
      this.triggerConfetti();

      window.appStorage.recordPracticeCompletion('sentences', task.id, 25);
      this.updateStatsBar();

      if (dropZone) dropZone.className = 'sentence-drop-area is-correct';
      if (fb) {
        fb.className = 'practice-feedback-box correct';
        fb.style.display = 'flex';
        fb.innerHTML = `
          <div class="feedback-title">🎉 Excellent! Flawlessly assembled (+25 XP)!</div>
          <div class="feedback-explanation">💡 <strong>Grammar Rule:</strong> ${task.explanation}</div>
        `;
      }

      if (checkBtn) checkBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'inline-flex';
    } else {
      window.sound.playWrong();
      if (dropZone) dropZone.className = 'sentence-drop-area is-wrong';
      if (fb) {
        fb.className = 'practice-feedback-box wrong';
        fb.style.display = 'flex';
        fb.innerHTML = `
          <div class="feedback-title">❌ Not quite right yet. Try reordering!</div>
          <div class="feedback-explanation">💡 Remember the SVOMPT structure (Subject -> Verb -> Object -> Manner -> Place -> Time).</div>
        `;
      }
    }
  }

  nextSentenceBuilder() {
    this.sbIndex++;
    this.loadSentenceBuilderTask();
  }

  speakSentenceBuilderTarget() {
    const task = PRACTICE_DATA.sentenceBuilder[this.sbIndex];
    if (task) window.sound.speak(task.words.join(' '));
  }

  // --- 2. LETTER SCRAMBLE ---
  loadLetterScrambleTask() {
    const tasks = PRACTICE_DATA.letterScramble;
    if (!tasks || tasks.length === 0) return;

    if (this.lsIndex >= tasks.length) this.lsIndex = 0;
    window.appStorage.setIndex('letterScramble', this.lsIndex);

    const task = tasks[this.lsIndex];

    const stepEl = document.getElementById('ls-progress-step');
    if (stepEl) stepEl.textContent = `Word ${this.lsIndex + 1} of ${tasks.length}`;

    const catBadge = document.getElementById('ls-category-badge');
    if (catBadge) catBadge.textContent = task.category || 'Vocabulary';

    const promptEl = document.getElementById('ls-ukr-prompt');
    if (promptEl) promptEl.textContent = task.meaning || task.ukr;

    const hintEl = document.getElementById('ls-hint-text');
    if (hintEl) hintEl.textContent = `💡 Hint: ${task.hint}`;

    const fb = document.getElementById('ls-feedback-box');
    if (fb) fb.style.display = 'none';

    const nextBtn = document.getElementById('ls-next-btn');
    if (nextBtn) nextBtn.style.display = 'none';

    this.lsCurrentLetters = [];
    const lettersArr = task.word.toUpperCase().split('');
    this.lsBankLetters = lettersArr.map((ch, idx) => ({ id: idx, char: ch, used: false }))
      .sort(() => Math.random() - 0.5);

    this.renderLetterScramble();
  }

  renderLetterScramble() {
    const task = PRACTICE_DATA.letterScramble[this.lsIndex];
    if (!task) return;
    const totalSlots = task.word.length;

    const slotsRow = document.getElementById('ls-slots-row');
    if (!slotsRow) return;
    slotsRow.innerHTML = '';

    for (let i = 0; i < totalSlots; i++) {
      const slot = document.createElement('div');
      slot.className = 'letter-slot' + (this.lsCurrentLetters[i] ? ' filled' : '');
      slot.textContent = this.lsCurrentLetters[i] ? this.lsCurrentLetters[i].char : '';
      if (this.lsCurrentLetters[i]) {
        slot.onclick = () => this.removeLetterSlot(i);
      }
      slotsRow.appendChild(slot);
    }

    const bankRow = document.getElementById('ls-bank-row');
    if (!bankRow) return;
    bankRow.innerHTML = '';
    this.lsBankLetters.forEach(item => {
      const chip = document.createElement('div');
      chip.className = 'letter-chip' + (item.used ? ' used' : '');
      chip.textContent = item.char;
      if (!item.used) {
        chip.onclick = () => this.clickBankLetter(item);
      }
      bankRow.appendChild(chip);
    });
  }

  clickBankLetter(item) {
    const task = PRACTICE_DATA.letterScramble[this.lsIndex];
    if (!task || this.lsCurrentLetters.length >= task.word.length) return;

    window.sound.playClick();
    item.used = true;
    this.lsCurrentLetters.push(item);
    this.renderLetterScramble();

    if (this.lsCurrentLetters.length === task.word.length) {
      this.checkLetterScramble();
    }
  }

  removeLetterSlot(index) {
    window.sound.playClick();
    const item = this.lsCurrentLetters.splice(index, 1)[0];
    item.used = false;
    this.renderLetterScramble();
  }

  backspaceLetter() {
    if (this.lsCurrentLetters.length > 0) {
      window.sound.playClick();
      const item = this.lsCurrentLetters.pop();
      item.used = false;
      this.renderLetterScramble();
    }
  }

  checkLetterScramble() {
    const task = PRACTICE_DATA.letterScramble[this.lsIndex];
    if (!task) return;
    const assembled = this.lsCurrentLetters.map(l => l.char).join('');

    const fb = document.getElementById('ls-feedback-box');
    const nextBtn = document.getElementById('ls-next-btn');

    if (assembled === task.word.toUpperCase()) {
      window.sound.playCorrect();
      window.sound.speak(task.word);
      this.triggerConfetti();

      const vocabMatch = window.appStorage.getAllVocabulary().find(w => w.word.toLowerCase() === task.word.toLowerCase());
      if (vocabMatch) {
        window.appStorage.markWordLearned(vocabMatch.id);
      }
      window.appStorage.recordPracticeCompletion('letters', task.id, 25);
      this.updateStatsBar();

      if (fb) {
        fb.className = 'practice-feedback-box correct';
        fb.style.display = 'flex';
        fb.innerHTML = `
          <div class="feedback-title">🎉 Excellent! "${task.word}" spelled correctly (+25 XP)!</div>
          <div class="feedback-explanation">The word has been added to your mastered vocabulary vault.</div>
        `;
      }
      if (nextBtn) nextBtn.style.display = 'inline-flex';
    } else {
      window.sound.playWrong();
      if (fb) {
        fb.className = 'practice-feedback-box wrong';
        fb.style.display = 'flex';
        fb.innerHTML = `
          <div class="feedback-title">❌ Spelling mistake!</div>
          <div class="feedback-explanation">Use backspace or click letter slots to correct the spelling.</div>
        `;
      }
    }
  }

  nextLetterScramble() {
    this.lsIndex++;
    this.loadLetterScrambleTask();
  }

  // --- 3. GRAMMAR QUIZ ---
  loadGrammarQuizTask() {
    const tasks = PRACTICE_DATA.grammarQuiz;
    if (!tasks || tasks.length === 0) return;

    if (this.gqIndex >= tasks.length) this.gqIndex = 0;
    window.appStorage.setIndex('grammarQuiz', this.gqIndex);

    const task = tasks[this.gqIndex];
    this.gqAnswered = false;

    const progressEl = document.getElementById('gq-progress-step');
    if (progressEl) progressEl.textContent = `Question ${this.gqIndex + 1} of ${tasks.length}`;

    const promptEl = document.getElementById('gq-question-prompt');
    if (promptEl) promptEl.textContent = task.question;

    const fb = document.getElementById('gq-feedback-box');
    if (fb) fb.style.display = 'none';

    const nextBtn = document.getElementById('gq-next-btn');
    if (nextBtn) nextBtn.style.display = 'none';

    const optionsContainer = document.getElementById('gq-options-container');
    if (!optionsContainer) return;
    optionsContainer.innerHTML = '';

    task.options.forEach((optText, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerHTML = `
        <span>${String.fromCharCode(65 + optIdx)}) ${optText}</span>
        <span class="quiz-check-icon">⚪</span>
      `;
      btn.onclick = () => this.selectQuizOption(optIdx);
      optionsContainer.appendChild(btn);
    });
  }

  selectQuizOption(selectedIndex) {
    if (this.gqAnswered) return;
    this.gqAnswered = true;

    const task = PRACTICE_DATA.grammarQuiz[this.gqIndex];
    if (!task) return;
    const options = document.querySelectorAll('.quiz-option-btn');
    const fb = document.getElementById('gq-feedback-box');
    const nextBtn = document.getElementById('gq-next-btn');

    options.forEach((btn, idx) => {
      btn.style.pointerEvents = 'none';
      if (idx === task.correctIndex) {
        btn.classList.add('selected-correct');
        const icon = btn.querySelector('.quiz-check-icon');
        if (icon) icon.textContent = '✅';
      } else if (idx === selectedIndex) {
        btn.classList.add('selected-wrong');
        const icon = btn.querySelector('.quiz-check-icon');
        if (icon) icon.textContent = '❌';
      }
    });

    if (selectedIndex === task.correctIndex) {
      window.sound.playCorrect();
      this.triggerConfetti();
      window.appStorage.recordPracticeCompletion('quizzes', task.id, 20);
      this.updateStatsBar();

      if (fb) {
        fb.className = 'practice-feedback-box correct';
        fb.style.display = 'flex';
        fb.innerHTML = `
          <div class="feedback-title">🎯 Spot on! Correct answer (+20 XP)!</div>
          <div class="feedback-explanation">💡 ${task.explanation}</div>
        `;
      }
    } else {
      window.sound.playWrong();
      if (fb) {
        fb.className = 'practice-feedback-box wrong';
        fb.style.display = 'flex';
        fb.innerHTML = `
          <div class="feedback-title">❌ Incorrect choice!</div>
          <div class="feedback-explanation">💡 ${task.explanation}</div>
        `;
      }
    }

    if (nextBtn) nextBtn.style.display = 'inline-flex';
  }

  nextGrammarQuiz() {
    this.gqIndex++;
    this.loadGrammarQuizTask();
  }

  // --- 4. ERROR HUNTER ---
  loadErrorHunterTask() {
    const tasks = PRACTICE_DATA.errorHunter;
    if (!tasks || tasks.length === 0) return;

    if (this.ehIndex >= tasks.length) this.ehIndex = 0;
    window.appStorage.setIndex('errorHunter', this.ehIndex);

    const task = tasks[this.ehIndex];
    this.ehAnswered = false;

    const stepEl = document.getElementById('eh-progress-step');
    if (stepEl) stepEl.textContent = `Sentence ${this.ehIndex + 1} of ${tasks.length}`;

    const fb = document.getElementById('eh-feedback-box');
    if (fb) fb.style.display = 'none';

    const nextBtn = document.getElementById('eh-next-btn');
    if (nextBtn) nextBtn.style.display = 'none';

    const wrapper = document.getElementById('eh-tokens-wrapper');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    task.tokens.forEach(token => {
      const span = document.createElement('span');
      span.className = 'error-token';
      span.textContent = token;
      span.onclick = () => this.selectErrorToken(span, token);
      wrapper.appendChild(span);
    });
  }

  selectErrorToken(element, tokenText) {
    if (this.ehAnswered) return;
    this.ehAnswered = true;

    const task = PRACTICE_DATA.errorHunter[this.ehIndex];
    if (!task) return;
    const fb = document.getElementById('eh-feedback-box');
    const nextBtn = document.getElementById('eh-next-btn');

    document.querySelectorAll('.error-token').forEach(el => el.style.pointerEvents = 'none');

    if (tokenText.toLowerCase() === task.wrongToken.toLowerCase()) {
      element.classList.add('marked-wrong');
      window.sound.playCorrect();
      this.triggerConfetti();

      window.appStorage.recordPracticeCompletion('errors', task.id, 20);
      this.updateStatsBar();

      if (fb) {
        fb.className = 'practice-feedback-box correct';
        fb.style.display = 'flex';
        fb.innerHTML = `
          <div class="feedback-title">🎯 Bravo! You identified the error: "<strong>${task.wrongToken}</strong>" (+20 XP)!</div>
          <div class="feedback-explanation">
            <strong>Correction:</strong> ${task.correction}<br>
            💡 ${task.explanation}
          </div>
        `;
      }
    } else {
      element.classList.add('marked-correct');
      window.sound.playWrong();

      if (fb) {
        fb.className = 'practice-feedback-box wrong';
        fb.style.display = 'flex';
        fb.innerHTML = `
          <div class="feedback-title">❌ That word is grammatically valid here!</div>
          <div class="feedback-explanation">
            The error was in: "<strong>${task.wrongToken}</strong>".<br>
            <strong>Correction:</strong> ${task.correction}<br>
            💡 ${task.explanation}
          </div>
        `;
      }
    }

    if (nextBtn) nextBtn.style.display = 'inline-flex';
  }

  nextErrorHunter() {
    this.ehIndex++;
    this.loadErrorHunterTask();
  }

  // ===== TAB 4: AI SENTENCE JUDGE (0 TO 100) =====
  randomizeAISentenceTarget() {
    const list = window.appStorage.getAllVocabulary();
    if (!list || !list.length) return;
    const random = list[Math.floor(Math.random() * list.length)];
    this.currentTargetWord = random;
    const badge = document.getElementById('ai-sentence-target-word');
    if (badge) {
      const defPart = (random.definition || random.ukr || '').split('.')[0];
      badge.textContent = `${random.word} (${random.pos || 'term'} • ${defPart})`;
    }
  }

  async submitSentenceToAIMentor() {
    const input = document.getElementById('ai-user-sentence-input');
    const text = input ? input.value.trim() : '';
    const resultsContainer = document.getElementById('ai-sentence-results');
    const submitBtn = document.getElementById('btn-submit-ai-sentence');

    if (!text) {
      alert("Please enter a sentence in English first!");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>⏳ 1/3 Scanning syntax & SVOMPT order...</span>`;

    try {
      await new Promise(r => setTimeout(r, 600));
      submitBtn.innerHTML = `<span>⚡ 2/3 Validating tense harmony & vocabulary...</span>`;
      await new Promise(r => setTimeout(r, 600));
      submitBtn.innerHTML = `<span>⚖️ 3/3 Strict AI Judge rendering evaluation...</span>`;

      const evaluation = await window.aiMentor.evaluateSentence(text, this.currentTargetWord?.word || '');
      await new Promise(r => setTimeout(r, 400));

      this.renderAIResultsCard(resultsContainer, evaluation, 'sentence');

      window.appStorage.recordAISentenceScore(evaluation.score, evaluation.xp);
      this.updateStatsBar();

      if (evaluation.score >= 70) {
        window.sound.playFanfare();
        this.triggerConfetti();
      } else {
        window.sound.playWrong();
      }
    } catch (e) {
      alert("Sentence evaluation error: " + e.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>⚖️ Judge Sentence (0-100)</span>`;
    }
  }

  // ===== TAB 5: AI SPEAKING STUDIO =====
  toggleSpeakingTipsAccordion() {
    const content = document.getElementById('speaking-tips-content');
    const icon = document.getElementById('speaking-tips-toggle-icon');
    if (!content) return;
    const isHidden = content.style.display === 'none';
    content.style.display = isHidden ? 'block' : 'none';
    if (icon) icon.textContent = isHidden ? '▼' : '▶';
  }

  switchSpeakingTipTab(tabId) {
    const tabs = ['prep', 'buytime', 'upgrades', 'connectors', 'devtalk'];
    tabs.forEach(t => {
      const pane = document.getElementById(`tip-pane-${t}`);
      const btn = document.querySelector(`.tips-subtab-btn[data-tip-tab="${t}"]`);
      if (pane) pane.style.display = (t === tabId) ? 'block' : 'none';
      if (btn) btn.classList.toggle('active', t === tabId);
    });
  }

  // ===== IT & CODE REVIEW SPEAKING STUDIO =====
  setSpeakingMode(mode) {
    window.sound.playClick();
    this.speakingMode = mode;

    const btnGeneral = document.getElementById('btn-mode-general');
    const btnItCode = document.getElementById('btn-mode-it-code');
    const generalBanner = document.getElementById('general-topic-banner');
    const itContainer = document.getElementById('it-code-review-container');

    if (btnGeneral) btnGeneral.classList.toggle('active', mode === 'general');
    if (btnItCode) btnItCode.classList.toggle('active', mode === 'it_code');

    if (generalBanner) generalBanner.style.display = (mode === 'general') ? 'flex' : 'none';
    if (itContainer) itContainer.style.display = (mode === 'it_code') ? 'block' : 'none';

    if (mode === 'it_code') {
      this.renderItCodeScenario();
    } else {
      this.updateSpeakingTopicBanner();
    }
  }

  renderItCodeScenario() {
    if (!this.itCodeScenarios || this.itCodeScenarios.length === 0) return;
    if (!this.activeItScenario) {
      this.activeItScenario = this.itCodeScenarios[this.currentItScenarioIndex] || this.itCodeScenarios[0];
    }
    const sc = this.activeItScenario;
    if (!sc) return;

    const catBadge = document.getElementById('it-code-category-badge');
    const idBadge = document.getElementById('it-code-scenario-id');
    const titleEl = document.getElementById('it-code-title');
    const contextEl = document.getElementById('it-code-context-text');
    const beforeCodeEl = document.getElementById('it-before-code');
    const afterCodeEl = document.getElementById('it-after-code');
    const keyTermsList = document.getElementById('it-key-terms-list');
    const countBadge = document.getElementById('it-topics-count-badge');

    if (catBadge) catBadge.textContent = sc.categoryName || '💻 Software Engineering';
    if (idBadge) idBadge.textContent = sc.id;
    if (titleEl) titleEl.textContent = sc.title;
    if (contextEl) contextEl.textContent = sc.context;
    if (beforeCodeEl) beforeCodeEl.textContent = sc.beforeCode;
    if (afterCodeEl) afterCodeEl.textContent = sc.afterCode;
    if (countBadge) countBadge.textContent = this.itCodeScenarios.length;

    if (keyTermsList && Array.isArray(sc.keyTerms)) {
      keyTermsList.innerHTML = sc.keyTerms.map(term => `
        <div class="it-term-pill" title="${term.ukr}">
          <span class="it-term-en">${term.en}</span>
          <span class="it-term-ukr">(${term.ukr})</span>
          <button class="it-term-audio-btn" onclick="sound.speak('${term.en.replace(/'/g, "\\'")}')" title="Послухати вимову">🔊</button>
        </div>
      `).join('');
    }

    // Populate Deep Dive accordion
    const mechanicsEl = document.getElementById('it-deep-dive-mechanics');
    const signalsEl = document.getElementById('it-deep-dive-interview-signals');
    const sampleAnswerEl = document.getElementById('it-deep-dive-sample-answer');
    const deepDiveContent = document.getElementById('it-deep-dive-content');
    const deepDiveIcon = document.getElementById('it-deep-dive-icon');

    if (deepDiveContent) deepDiveContent.style.display = 'none';
    if (deepDiveIcon) deepDiveIcon.style.transform = 'rotate(0deg)';

    if (sc.deepDive) {
      if (mechanicsEl) mechanicsEl.textContent = sc.deepDive.mechanics || sc.problemExplanation;
      if (signalsEl) signalsEl.textContent = sc.deepDive.interviewSignals || 'Чітке пояснення першопричини (root cause), архітектурний вибір та вплив на метрики (latency/throughput).';
      if (sampleAnswerEl) sampleAnswerEl.textContent = sc.deepDive.sampleAnswer || '';
    } else {
      if (mechanicsEl) mechanicsEl.textContent = `${sc.problemExplanation} -> ${sc.solutionExplanation}`;
      if (signalsEl) signalsEl.textContent = 'Використання фахової IT-термінології та демонстрація метрик продуктивності.';
      if (sampleAnswerEl) sampleAnswerEl.textContent = sc.prepHint || '';
    }
  }

  toggleItDeepDive() {
    window.sound.playClick();
    const content = document.getElementById('it-deep-dive-content');
    const icon = document.getElementById('it-deep-dive-icon');
    if (!content) return;
    const isHidden = content.style.display === 'none' || !content.style.display;
    content.style.display = isHidden ? 'block' : 'none';
    if (icon) icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
  }

  listenToSampleAnswer() {
    if (!this.activeItScenario) return;
    const text = this.activeItScenario.deepDive?.sampleAnswer || this.activeItScenario.solutionExplanation;
    if (text) {
      window.sound.speak(text);
    }
  }

  randomizeItCodeScenario() {
    window.sound.playClick();
    if (!this.itCodeScenarios || this.itCodeScenarios.length <= 1) return;
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * this.itCodeScenarios.length);
    } while (nextIdx === this.currentItScenarioIndex && this.itCodeScenarios.length > 1);

    this.currentItScenarioIndex = nextIdx;
    this.activeItScenario = this.itCodeScenarios[nextIdx];
    this.renderItCodeScenario();
  }

  copyCodeToClipboard(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    window.sound.playClick();
    navigator.clipboard.writeText(el.textContent).then(() => {
      const colHeader = el.closest('.code-diff-col')?.querySelector('.code-copy-btn');
      if (colHeader) {
        const oldLabel = colHeader.textContent;
        colHeader.textContent = 'Скопійовано! ✅';
        setTimeout(() => { colHeader.textContent = oldLabel; }, 1800);
      }
    }).catch(err => {
      console.warn("Failed to copy code:", err);
    });
  }

  renderDevPhrases() {
    const container = document.getElementById('dev-phrases-container');
    if (!container || !window.IT_PRO_PHRASES) return;

    container.innerHTML = window.IT_PRO_PHRASES.map(cat => `
      <div class="dev-category-card">
        <div class="dev-category-title">
          <span>${cat.icon}</span> ${cat.category}
        </div>
        <div class="dev-phrases-list">
          ${cat.phrases.map(p => `
            <div class="dev-phrase-item">
              <div class="dev-phrase-en">${p.en}</div>
              <div class="dev-phrase-ukr">${p.ukr}</div>
              <button class="dev-phrase-audio-btn" onclick="sound.speak('${p.en.replace(/'/g, "\\'")}')" title="Озвучити фразу">🔊</button>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // ===== TOPIC CATALOGUE (RIGHT-SIDE SLIDE-OVER DRAWER) =====
  openTopicCatalogue(initialCategory = null) {
    window.sound.playClick();
    if (initialCategory) {
      this.topicFilterCategory = initialCategory;
    }
    const drawer = document.getElementById('topic-catalogue-drawer');
    const overlay = document.getElementById('topic-catalogue-drawer-overlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('active');
    this.renderTopicCategoryPills();
    this.renderTopicCatalogue();
  }

  closeTopicCatalogue() {
    window.sound.playClick();
    const drawer = document.getElementById('topic-catalogue-drawer');
    const overlay = document.getElementById('topic-catalogue-drawer-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

  updateSpeakingTopicBanner() {
    if (!this.activeTopic && this.speakingTopics.length) {
      this.activeTopic = this.speakingTopics[this.currentTopicIndex] || this.speakingTopics[0];
    }
    const topic = this.activeTopic;
    if (!topic) return;

    const displayEl = document.getElementById('ai-speaking-topic-display');
    const catBadge = document.getElementById('ai-speaking-topic-category-badge');
    const hintEl = document.getElementById('ai-speaking-topic-ukr-hint');

    if (displayEl) displayEl.textContent = topic.topic;
    if (catBadge) catBadge.textContent = topic.categoryName || 'Розмовна тема';
    if (hintEl) hintEl.textContent = topic.ukr || '';
  }

  updateSpeakingTopicsBadge() {
    const total = this.speakingTopics.length;
    const completedCount = window.appStorage.getCompletedSpeakingTopicsCount();
    const badge = document.getElementById('speaking-topics-progress-badge');
    if (badge) badge.textContent = `${completedCount}/${total}`;

    const drawerCount = document.getElementById('drawer-completed-count');
    if (drawerCount) drawerCount.textContent = completedCount;

    const countAll = document.getElementById('count-filter-all');
    if (countAll) countAll.textContent = total;

    const countActive = document.getElementById('count-filter-active');
    if (countActive) countActive.textContent = Math.max(0, total - completedCount);

    const countCompleted = document.getElementById('count-filter-completed');
    if (countCompleted) countCompleted.textContent = completedCount;
  }

  renderTopicCategoryPills() {
    const container = document.getElementById('drawer-category-pills');
    if (!container) return;

    const categories = window.SPEAKING_CATEGORIES || [
      { id: "all", name: "Всі теми", icon: "🌐" }
    ];

    container.innerHTML = categories.map(cat => {
      const isActive = this.topicFilterCategory === cat.id;
      return `
        <button class="cat-pill ${isActive ? 'active' : ''}" onclick="app.setTopicCategoryFilter('${cat.id}')">
          <span>${cat.icon}</span> ${cat.name}
        </button>
      `;
    }).join('');
  }

  setTopicCategoryFilter(catId) {
    window.sound.playClick();
    this.topicFilterCategory = catId;
    this.renderTopicCategoryPills();
    this.renderTopicCatalogue();
  }

  setTopicStatusFilter(status) {
    window.sound.playClick();
    this.topicFilterStatus = status;

    document.querySelectorAll('.drawer-status-tabs .drawer-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-status-filter') === status);
    });

    this.renderTopicCatalogue();
  }

  filterTopicCatalogue() {
    const input = document.getElementById('topic-search-input');
    const clearBtn = document.getElementById('btn-clear-topic-search');
    this.topicSearchQuery = input ? input.value.trim().toLowerCase() : '';

    if (clearBtn) {
      clearBtn.style.display = this.topicSearchQuery ? 'inline-flex' : 'none';
    }

    this.renderTopicCatalogue();
  }

  clearTopicSearch() {
    window.sound.playClick();
    const input = document.getElementById('topic-search-input');
    const clearBtn = document.getElementById('btn-clear-topic-search');
    if (input) input.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    this.topicSearchQuery = '';
    this.renderTopicCatalogue();
  }

  toggleTopicCompleted(topicId, event) {
    if (event) event.stopPropagation();
    window.sound.playClick();
    const isNowCompleted = window.appStorage.toggleSpeakingTopicCompleted(topicId);
    if (isNowCompleted) {
      window.sound.playCorrect();
    }
    this.updateStatsBar();
    this.updateSpeakingTopicsBadge();
    this.renderTopicCatalogue();
  }

  selectSpeakingTopic(topicId) {
    window.sound.playClick();
    const foundIdx = this.speakingTopics.findIndex(t => t.id === topicId);
    if (foundIdx !== -1) {
      this.currentTopicIndex = foundIdx;
      this.activeTopic = this.speakingTopics[foundIdx];
      this.updateSpeakingTopicBanner();
      this.closeTopicCatalogue();

      // Скролимо до поля вводу
      const transcriptBox = document.getElementById('speaking-transcript-display');
      if (transcriptBox) {
        transcriptBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  randomizeSpeakingTopic() {
    window.sound.playClick();
    if (!this.speakingTopics.length) return;
    this.currentTopicIndex = (this.currentTopicIndex + 1) % this.speakingTopics.length;
    this.activeTopic = this.speakingTopics[this.currentTopicIndex];
    this.updateSpeakingTopicBanner();
  }

  renderTopicCatalogue() {
    this.updateSpeakingTopicsBadge();
    const container = document.getElementById('drawer-topics-list');
    if (!container) return;

    let list = [...this.speakingTopics];

    // 1. Фільтр за категорією
    if (this.topicFilterCategory !== 'all') {
      list = list.filter(t => t.category === this.topicFilterCategory);
    }

    // 2. Фільтр за статусом (Всі / Не пройдені / Пройдені)
    if (this.topicFilterStatus === 'active') {
      list = list.filter(t => !window.appStorage.isSpeakingTopicCompleted(t.id));
    } else if (this.topicFilterStatus === 'completed') {
      list = list.filter(t => window.appStorage.isSpeakingTopicCompleted(t.id));
    }

    // 3. Фільтр за пошуковим запитом
    if (this.topicSearchQuery) {
      const q = this.topicSearchQuery;
      list = list.filter(t =>
        t.topic.toLowerCase().includes(q) ||
        (t.ukr && t.ukr.toLowerCase().includes(q)) ||
        (t.categoryName && t.categoryName.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 2.5rem 1rem; text-align:center;">
          <div style="font-size:2.2rem; margin-bottom:0.5rem;">🔍</div>
          <h4 style="margin-bottom:0.35rem; color:var(--text-main);">Тем за запитом не знайдено</h4>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">
            Спробуй змінити категорію або очистити рядок пошуку.
          </p>
          <button class="btn-secondary" onclick="app.clearTopicSearch(); app.setTopicStatusFilter('all'); app.setTopicCategoryFilter('all');">
            Скинути всі фільтри
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => {
      const isCompleted = window.appStorage.isSpeakingTopicCompleted(item.id);
      const isCurrentSelected = this.activeTopic && this.activeTopic.id === item.id;
      const progress = window.appStorage.getSpeakingTopicProgress(item.id);

      return `
        <div class="topic-card-item ${isCompleted ? 'is-completed' : ''}">
          <div class="topic-top-row">
            <button class="topic-check-btn ${isCompleted ? 'checked' : ''}" onclick="app.toggleTopicCompleted('${item.id}', event)" title="${isCompleted ? 'Зняти позначку (повернути в непройдені)' : 'Позначити як пройдену (викреслити)'}">
              ${isCompleted ? '✓' : ''}
            </button>
            <div class="topic-text-content">
              <div class="topic-en-title">${item.topic}</div>
              <div class="topic-ukr-desc">${item.ukr}</div>
            </div>
          </div>

          <div class="topic-bottom-row">
            <div class="topic-meta-tags">
              <span class="badge badge-tag" style="font-size:0.72rem; padding:0.15rem 0.45rem;">
                ${item.categoryName || 'Тема'}
              </span>
              ${isCompleted ? `
                <span class="topic-completed-tag">
                  ✅ Викреслено ${progress?.bestScore ? `(${progress.bestScore}б)` : ''}
                </span>
              ` : ''}
            </div>

            <button class="btn-select-topic ${isCurrentSelected ? 'current-selected' : ''}" onclick="app.selectSpeakingTopic('${item.id}')">
              ${isCurrentSelected ? '🎯 Обрана зараз' : '🎙️ Обрати тему'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  updateSpeakingStats() {
    const box = document.getElementById('speaking-transcript-display');
    const text = (box ? box.value : this.currentSpokenTranscript || '').trim();

    const words = text ? text.split(/\s+/).filter(Boolean) : [];
    const wordsCount = words.length;

    // Речення рахуємо за розділовими знаками . ! ? або суцільними фрагментами
    const sentences = text ? text.split(/[.!?]+/).filter(s => s.trim().length > 0) : [];
    const sentencesCount = sentences.length;

    const wordsBadge = document.getElementById('counter-words-badge');
    const sentencesBadge = document.getElementById('counter-sentences-badge');
    const fill = document.getElementById('counter-progress-fill');
    const hint = document.getElementById('counter-hint-text');

    const targetWords = 50;
    const targetSentences = 2;
    const isReady = wordsCount >= 45 && sentencesCount >= targetSentences;

    if (wordsBadge) {
      wordsBadge.textContent = `${wordsCount >= 45 ? '✅' : '📝'} ${wordsCount} / ${targetWords} слів`;
      wordsBadge.className = `counter-badge ${wordsCount >= 45 ? 'ready' : 'low'}`;
    }

    if (sentencesBadge) {
      sentencesBadge.textContent = `${sentencesCount >= targetSentences ? '✅' : '📝'} ${sentencesCount} / ${targetSentences} реч.`;
      sentencesBadge.className = `counter-badge ${sentencesCount >= targetSentences ? 'ready' : 'low'}`;
    }

    const pct = Math.min(100, Math.round((wordsCount / targetWords) * 100));
    if (fill) {
      fill.style.width = `${pct}%`;
      fill.style.background = isReady
        ? 'linear-gradient(90deg, #10b981, #059669)'
        : 'linear-gradient(90deg, #ef4444, #f59e0b)';
    }

    if (hint) {
      if (isReady) {
        hint.innerHTML = `<span style="color:#10b981; font-weight:700;">🎉 Відповідь готова до суворої оцінки ШІ! Всі вимоги виконано (${wordsCount} сл., ${sentencesCount} реч.).</span>`;
      } else {
        const wordsLeft = Math.max(0, targetWords - wordsCount);
        const sentencesLeft = Math.max(0, targetSentences - sentencesCount);
        hint.textContent = `🎯 Захист від спаму API: ще потрібно ~${wordsLeft} сл. та ${sentencesLeft} реч. (обов'язково розділи речення крапкою . !)`;
      }
    }
  }

  async toggleSpeakingRecording() {
    const micBtn = document.getElementById('btn-record-mic');
    const statusLabel = document.getElementById('mic-status-label');
    const transcriptBox = document.getElementById('speaking-transcript-display');

    const hasNativeSTT = window.sound.hasSpeechRecognition();
    const hasMediaRec = window.sound.hasMediaRecorder();

    // === РЕЖИМ 1: NATIVE SPEECH RECOGNITION (Edge / Chrome) ===
    if (hasNativeSTT) {
      if (this.isSpeakingRecording) {
        window.sound.stopListening();
        this.isSpeakingRecording = false;
        micBtn.classList.remove('recording');
        statusLabel.textContent = "Запис зупинено. Якщо готова відповідь — тисни 'Оцінити мій спікінг'!";
        this.updateSpeakingStats();
        return;
      }

      this.isSpeakingRecording = true;
      micBtn.classList.add('recording');
      statusLabel.innerHTML = `🎙️ <span style="color:#ef4444; font-weight:700;">Слухаю... Говори англійською!</span> (можеш робити паузи, запис не перерветься)`;

      await window.sound.startListening({
        onStart: () => {
          statusLabel.innerHTML = `🎙️ <span style="color:#10b981; font-weight:700;">Мікрофон активний!</span> Дай змістовну відповідь; для пояснення спробуй 60–120 секунд.`;
        },
        onResult: (res) => {
          this.currentSpokenTranscript = res.full;
          if (transcriptBox) {
            transcriptBox.value = res.full || "";
            this.updateSpeakingStats();
          }
        },
        onError: (err) => {
          this.isSpeakingRecording = false;
          micBtn.classList.remove('recording');
          if (err === 'not-allowed') {
            statusLabel.innerHTML = `🔴 <strong>Доступ до мікрофона заблоковано в браузері!</strong> Натисни на значок 🔒 ліворуч від адресного рядка (localhost:5500) та увімкни 'Мікрофон' у 'Дозволити'.`;
            statusLabel.style.color = '#e11d48';
          } else {
            statusLabel.textContent = `Повідомлення мікрофона (${err}). Можна продовжувати говорити або надрукувати вручну!`;
          }
        },
        onEnd: (finalText) => {
          this.isSpeakingRecording = false;
          micBtn.classList.remove('recording');
          if (finalText) {
            this.currentSpokenTranscript = finalText;
            if (transcriptBox) transcriptBox.value = finalText;
            statusLabel.textContent = "Мовлення зафіксовано! Перевір статистику слів нижче.";
            this.updateSpeakingStats();
          }
        }
      });
      return;
    }

    // === РЕЖИМ 2: DUAL-MODE ЧЕРЕЗ MEDIARECORDER (Zen Browser / Firefox) ===
    if (hasMediaRec) {
      if (this.isSpeakingRecording) {
        // Зупиняємо аудіозапис
        window.sound.stopMediaRecording();
        this.isSpeakingRecording = false;
        micBtn.classList.remove('recording');
        if (this.mediaTimerInterval) {
          clearInterval(this.mediaTimerInterval);
          this.mediaTimerInterval = null;
        }
        statusLabel.innerHTML = `⏳ 🎙️ <span style="color:#3b82f6; font-weight:700;">Розпізнаємо аудіо через локальний AI-сервер...</span>`;
        return;
      }

      // Перевіряємо API ключ для розпізнавання аудіо в Zen Browser
      if (!window.aiMentor.hasApiKey()) {
        statusLabel.innerHTML = `⚠️ <strong>Для транскрипції підключи Groq у налаштуваннях</strong> для розпізнавання аудіо (або запусти <code>start_edge.bat</code> для Edge)!`;
        statusLabel.style.color = '#e11d48';
        this.openApiKeyModal();
        return;
      }

      this.isSpeakingRecording = true;
      micBtn.classList.add('recording');
      this.recordingSeconds = 0;

      statusLabel.innerHTML = `🔴 <span style="color:#ef4444; font-weight:700;">[00:00] Запис аудіо (Zen Browser)...</span> Говори англійською! Натисни мікрофон ще раз для завершення.`;

      this.mediaTimerInterval = setInterval(() => {
        this.recordingSeconds++;
        const mm = String(Math.floor(this.recordingSeconds / 60)).padStart(2, '0');
        const ss = String(this.recordingSeconds % 60).padStart(2, '0');
        statusLabel.innerHTML = `🔴 <span style="color:#ef4444; font-weight:700;">[${mm}:${ss}] Запис аудіо (Zen Browser)...</span> Говори розгорнуто (≈50 сл., 2 реч.). Тисни мікрофон щоб надіслати!`;
      }, 1000);

      await window.sound.startMediaRecording({
        onStart: () => {},
        onError: (err) => {
          this.isSpeakingRecording = false;
          micBtn.classList.remove('recording');
          if (this.mediaTimerInterval) {
            clearInterval(this.mediaTimerInterval);
            this.mediaTimerInterval = null;
          }
          if (err === 'not-allowed') {
            statusLabel.innerHTML = `🔴 <strong>Доступ до мікрофона заблоковано в Zen Browser!</strong> Натисни на замок 🔒 біля URL та дозволь використання мікрофона.`;
            statusLabel.style.color = '#e11d48';
          } else {
            statusLabel.textContent = `Помилка мікрофона (${err}). Спробуй ще раз або введи текст вручну.`;
          }
        },
        onComplete: async ({ blob, base64, mimeType }) => {
          if (this.mediaTimerInterval) {
            clearInterval(this.mediaTimerInterval);
            this.mediaTimerInterval = null;
          }
          try {
            const transcribedText = await window.aiMentor.transcribeAudio(base64, mimeType);
            if (transcriptBox) {
              transcriptBox.value = transcribedText;
              this.currentSpokenTranscript = transcribedText;
              this.updateSpeakingStats();
            }
            window.sound.playClick();
            statusLabel.innerHTML = `✅ <span style="color:#10b981; font-weight:700;">Голос розпізнано!</span> Перевір, чи текст відповідає сказаному.`;
          } catch (transErr) {
            statusLabel.innerHTML = `⚠️ <span style="color:#e11d48;">Помилка транскрипції: ${transErr.message}</span> (можна ввести текст вручну 👇)`;
          }
        }
      });
      return;
    }

    // Якщо браузер не підтримує аудіо
    statusLabel.innerHTML = `⚠️ Браузер не підтримує мікрофон. Запусти <code>start_edge.bat</code> або введи текст вручну.`;
  }

  clearSpeakingTranscript() {
    this.currentSpokenTranscript = '';
    const box = document.getElementById('speaking-transcript-display');
    if (box) box.value = '';
    window.sound.resetListeningBuffer();
    this.updateSpeakingStats();
    const results = document.getElementById('ai-speaking-results');
    if (results) results.style.display = 'none';
  }

  async evaluateSpokenText() {
    const box = document.getElementById('speaking-transcript-display');
    const text = (box ? box.value : this.currentSpokenTranscript || '').trim();
    if (!text) {
      alert("Будь ласка, скажи свою відповідь у мікрофон АБО надрукуй її в поле вводу!");
      if (box) box.focus();
      return;
    }

    const words = text.split(/\s+/).filter(Boolean);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    const btn = document.getElementById('btn-evaluate-speaking');
    const container = document.getElementById('ai-speaking-results');

    let topic = '';
    let isItCodeReview = false;
    let currentTask = null;

    if (this.speakingMode === 'it_code' && this.activeItScenario) {
      isItCodeReview = true;
      currentTask = this.activeItScenario;
      topic = `Code Review Task: "${currentTask.title}". Context: "${currentTask.context}". Problem: "${currentTask.problemExplanation}". Solution: "${currentTask.solutionExplanation}". Key concepts: ${currentTask.keyTerms.map(k => k.en).join(', ')}`;
    } else {
      const topicEl = document.getElementById('ai-speaking-topic-display');
      topic = topicEl ? topicEl.textContent.trim() : '';
      currentTask = this.activeTopic;
    }

    btn.disabled = true;
    btn.innerHTML = `<span>⏳ 1/3 Scanning speech flow & syntactic cohesion...</span>`;

    try {
      await new Promise(r => setTimeout(r, 600));
      btn.innerHTML = `<span>⚡ 2/3 Validating tense agreement, idioms & lexical range...</span>`;
      await new Promise(r => setTimeout(r, 600));
      btn.innerHTML = isItCodeReview 
        ? `<span>💻 3/3 Evaluating technical terminology & architectural logic...</span>`
        : `<span>🧠 3/3 Generating strict assessment & senior native phrasing...</span>`;

      const evaluation = await window.aiMentor.evaluateSpeaking(text, topic, {
        isItCodeReview,
        scenario: this.activeItScenario
      });
      await new Promise(r => setTimeout(r, 400));

      this.renderAIResultsCard(container, evaluation, 'speaking');

      window.appStorage.recordAISpeakingScore(evaluation.score, evaluation.xp);

      if (evaluation.score >= 70 && !evaluation.isOffTopic) {
        if (currentTask && currentTask.id) {
          window.appStorage.markSpeakingTopicCompleted(currentTask.id, evaluation.score);
          this.updateSpeakingTopicsBadge();
          this.renderTopicCatalogue();
        }
      }

      this.updateStatsBar();

      if (evaluation.score >= 70 && !evaluation.isOffTopic) {
        window.sound.playFanfare();
        this.triggerConfetti();
      } else {
        window.sound.playWrong();
      }
    } catch (e) {
      alert("Speaking evaluation error: " + e.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span>Розібрати відповідь</span>`;
    }
  }

  renderAIResultsCard(container, evaluation, type) {
    container.style.display = 'block';

    let scoreClass = 'low';
    let badgeText = '⚠️ Needs Refinement';

    if (evaluation.level === 'Disqualified') {
      scoreClass = 'low';
      badgeText = '🚫 DISQUALIFIED';
    } else if (evaluation.isOffTopic || evaluation.level === 'Off-Topic') {
      scoreClass = 'medium';
      badgeText = '⚠️ OFF-TOPIC RESPONSE';
    } else if (evaluation.score >= 95 || evaluation.isNativePerfection) {
      scoreClass = 'high';
      badgeText = '🌟 100% C2 PERFECTION';
    } else if (evaluation.score >= 75) {
      scoreClass = 'high';
      badgeText = '🔥 Passed Successfully';
    } else if (evaluation.score >= 50) {
      scoreClass = 'medium';
      badgeText = '⚡ Acceptable Fluency';
    }

    container.innerHTML = `
      <div class="ai-results-card">
        <div class="ai-score-row">
          <div class="ai-score-badge">
            <div class="score-number ${scoreClass}">${evaluation.score}</div>
            <div class="score-details-text">
              <h3>Score out of 100 (Level: ${evaluation.level})</h3>
              <p>Experience earned: <strong>+${evaluation.xp} XP</strong></p>
            </div>
          </div>
          <span class="badge ${scoreClass === 'high' ? 'badge-tag' : 'badge-level'}" style="font-size:0.9rem; padding:0.4rem 0.8rem; ${evaluation.level === 'Disqualified' ? 'background:#ef4444; color:white;' : (evaluation.isOffTopic ? 'background:#f59e0b; color:white;' : '')}">
            ${badgeText}
          </span>
        </div>

        ${evaluation.isOffTopic ? `
          <div class="off-topic-warning-banner">
            <div class="off-topic-warning-header">
              <span class="icon">⚠️</span>
              <h4>OFF-TOPIC DIVERGENCE (Task Achievement: 0 / 100)</h4>
            </div>
            <div class="off-topic-warning-body">
              <strong>Your English phrasing and grammar are competent, but the content does not address the prompt!</strong><br>
              In international assessments (IELTS / TOEFL) and professional interviews, answering off-topic receives a 0 for Task Achievement. 
              Please answer the assigned prompt or choose a matching topic from the catalogue!
            </div>
          </div>
        ` : ''}

        <div class="ai-verdict-quote">
          <strong>Strict Mentor Verdict:</strong><br>
          «${evaluation.verdict}»
        </div>

        <div class="ai-issues-list">
          <h4>Detected Observations & Grammatical Pitfalls:</h4>
          <ul>
            ${evaluation.issues.map(iss => `<li>${iss}</li>`).join('')}
          </ul>
        </div>

        ${(evaluation.vocabBoosters && evaluation.vocabBoosters.length > 0 && !evaluation.isNativePerfection && evaluation.score < 98) ? `
          <div class="ai-vocab-boosters-box">
            <h4><span>✨</span> Personalized Vocab-Upgrade & Native Synonyms:</h4>
            <p class="vocab-boosters-intro">Upgrade repetitive or basic vocabulary with these B2/C1 idiomatic alternatives:</p>
            <div class="boosters-grid">
              ${evaluation.vocabBoosters.map(b => `
                <div class="booster-card">
                  <div class="booster-orig-tag">❌ You said: <strong>"${b.original}"</strong></div>
                  <div class="booster-items-list">
                    ${b.alternatives.map(alt => `
                      <div class="booster-item-row">
                        <div>
                          <strong>"${alt.en}"</strong>
                          <span class="ukr">${alt.ukr}</span>
                        </div>
                        <button class="speak-mini-btn" onclick="sound.speak('${alt.en.replace(/'/g, "\\'")}')" title="Listen to pronunciation">🔊</button>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>

            ${(evaluation.prepLinkers && evaluation.prepLinkers.length > 0) ? `
              <div class="prep-linkers-box">
                <div class="prep-linkers-header">
                  <span>🔗</span> <strong>Cohesive Linkers for PREP Framework:</strong>
                </div>
                <div class="prep-linkers-chips">
                  ${evaluation.prepLinkers.map(l => `
                    <div class="prep-linker-chip">
                      <span class="label">${l.label || 'Linker'}:</span>
                      <span>"${l.en}"</span>
                      <button class="speak-mini-btn" onclick="sound.speak('${l.en.replace(/'/g, "\\'")}')" title="Listen">🔊</button>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${(evaluation.isNativePerfection || evaluation.score >= 98) ? `
          <div class="ai-perfect-box">
            <div class="crown-icon">👑</div>
            <div class="ai-perfect-text">
              <strong>🌟 Your response already sounds completely natural and native! (Native Perfection)</strong>
              <p>Zero corrections required. 100% syntactic precision, rich technical vocabulary, and impeccable rhetorical flow!</p>
            </div>
          </div>
        ` : `
          <div class="ai-rewrite-box">
            <strong>How a Senior Native Speaker would phrase this:</strong>
            <div class="ai-rewrite-text">
              <span>"${evaluation.nativeRewrite}"</span>
              <button class="speak-mini-btn" onclick="sound.speak('${evaluation.nativeRewrite.replace(/'/g, "\\'")}')" title="Listen to pronunciation">🔊</button>
            </div>
          </div>
        `}
      </div>
    `;
  }

  // ===== TAB 6: REWARDS VAULT & FLUENCY RADAR =====
  renderVaultSection() {
    const levelInfo = window.appStorage.getLevel();
    const currentXp = window.appStorage.getXP();

    document.getElementById('prog-level-title').textContent = levelInfo.title;
    document.getElementById('prog-level-subtitle').textContent = `${currentXp} / ${levelInfo.max} XP`;
    document.getElementById('prog-level-desc').textContent = levelInfo.desc;
    document.getElementById('prog-current-xp').textContent = `${currentXp} XP`;
    document.getElementById('prog-next-level-xp').textContent = `${levelInfo.max} XP`;

    const progressPct = Math.min(100, Math.max(0, ((currentXp - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100));
    document.getElementById('prog-level-fill').style.width = `${progressPct}%`;

    document.getElementById('vault-streak-val').textContent = `${window.appStorage.getStreak()} дн.`;
    document.getElementById('vault-words-val').textContent = window.appStorage.getLearnedCount();

    const container = document.getElementById('vault-chapters-container');
    if (!container) return;

    container.innerHTML = SECRET_VAULT_CHAPTERS.map(ch => {
      const isUnlocked = window.appStorage.isVaultUnlocked(ch.xpReq);

      if (isUnlocked) {
        return `
          <div class="vault-card unlocked">
            <div class="vault-header">
              <span class="vault-badge">🔓 РОЗБЛОКОВАНО (${ch.xpReq} XP)</span>
              <span style="font-size:1.5rem;">✨</span>
            </div>
            <h3 class="vault-title">${ch.title}</h3>
            <p class="vault-desc">${ch.description}</p>
            <div class="vault-items-list">
              ${ch.items.map(it => `
                <div class="vault-term-item">
                  <div class="vault-term-head">
                    <span class="vault-term-title">${it.term}</span>
                    <button class="speak-mini-btn" onclick="sound.speak('${it.term.replace(/'/g, "\\'")}')" title="Озвучити чоловічим голосом">🔊</button>
                  </div>
                  <div class="vault-term-meaning">${it.meaning}</div>
                  <div class="vault-term-example"><strong>Приклад:</strong> ${it.example}</div>
                  <div class="vault-term-usage">💡 ${it.usage}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        const remaining = ch.xpReq - currentXp;
        return `
          <div class="vault-card locked">
            <div class="vault-header">
              <span class="vault-badge">🔒 ЗАКРИТО (${ch.xpReq} XP)</span>
            </div>
            <h3 class="vault-title">${ch.title}</h3>
            <p class="vault-desc">${ch.description}</p>
            <div class="vault-locked-state">
              <div class="vault-lock-icon">🔐</div>
              <p style="font-weight:700; color:var(--danger); font-size:0.95rem;">
                Потрібно ще ${remaining} XP, щоб зламати цей бункер!
              </p>
              <p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.3rem;">
                Проходь тести B1-B2 та спікінг, щоб накопичити XP.
              </p>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  drawRadarChart() {
    const canvas = document.getElementById('fluency-radar-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 135;

    ctx.clearRect(0, 0, width, height);

    const skillsData = window.appStorage.getRadarSkills();
    const axes = [
      { name: "Словник B1-B2", val: skillsData.vocabulary },
      { name: "Порядок SVOMPT", val: skillsData.syntax },
      { name: "Контекст (Де вжити)", val: skillsData.context },
      { name: "Граматика", val: skillsData.grammar },
      { name: "ШІ-Спікінг", val: skillsData.speaking },
      { name: "ШІ-Точність", val: skillsData.accuracy }
    ];

    const totalAxes = axes.length;
    const angleStep = (Math.PI * 2) / totalAxes;

    ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#334155' : '#e2e8f0';
    ctx.lineWidth = 1;

    for (let r = 0.25; r <= 1.0; r += 0.25) {
      ctx.beginPath();
      for (let i = 0; i < totalAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius * r);
        const y = centerY + Math.sin(angle) * (radius * r);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#94a3b8' : '#475569';
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      const labelX = centerX + Math.cos(angle) * (radius + 26);
      const labelY = centerY + Math.sin(angle) * (radius + 26);
      ctx.fillText(`${axes[i].name} (${axes[i].val}%)`, labelX, labelY);
    }

    ctx.beginPath();
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const pct = Math.max(0.15, Math.min(1.0, axes[i].val / 100));
      const x = centerX + Math.cos(angle) * (radius * pct);
      const y = centerY + Math.sin(angle) * (radius * pct);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.fillStyle = 'rgba(79, 70, 229, 0.35)';
    ctx.fill();
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.stroke();

    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const pct = Math.max(0.15, Math.min(1.0, axes[i].val / 100));
      const x = centerX + Math.cos(angle) * (radius * pct);
      const y = centerY + Math.sin(angle) * (radius * pct);

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // ===== CONFETTI PARTICLES =====
  triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 1.2) * 12,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        rotation: Math.random() * 360
      });
    }

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeCount = 0;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.alpha -= 0.015;

        if (p.alpha > 0) {
          activeCount++;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (activeCount > 0 && frame < 100) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    animate();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new LinguoApp();
});
