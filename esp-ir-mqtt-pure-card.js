class EspIrMqttPureCard extends HTMLElement {
  static TRANSLATIONS = {
    zh: {
      title: "红外遥控中继",
      learnedCode: "捕获的红外信号",
      startLearn: "进入学习模式",
      learning: "正在监听信号...",
      send: "立即发射",
      clear: "清空输入",
      copied: "已复制到剪贴板",
      sendSuccess: "信号已发射",
      noCode: "待捕捉...",
      placeholder: "在此粘贴 Pronto 格式红外码...",
      hint: "纯 MQTT 通讯模式已激活",
      topic_info: "MQTT 发射主题",
      newSignal: "收到新信号！",
      topicCopied: "MQTT主题已复制",
      statusOnline: "在线",
      statusLearning: "学习中",
      editorTitle: "卡片标题",
      editorTopic: "MQTT Topic 前缀",
      editorLang: "界面语言",
      langAuto: "自动",
      langZh: "中文",
      langEn: "英语",
      langRu: "俄语",
    },


    en: {
      title: "IR Remote Pro",
      learnedCode: "Captured Signal",
      startLearn: "Start Learning",
      learning: "Listening...",
      send: "Dispatch",
      clear: "Clear",
      copied: "Copied to clipboard",
      sendSuccess: "Signal Sent",
      noCode: "Waiting for signal...",
      placeholder: "Paste Pronto hex code here...",
      hint: "Pure MQTT Mode Active",
      topic_info: "MQTT Transmit Topic",
      newSignal: "New signal received!",
      topicCopied: "MQTT topic copied",
      statusOnline: "ONLINE",
      statusLearning: "LEARNING",
      editorTitle: "Card Title",
      editorTopic: "MQTT Topic Prefix",
      editorLang: "Interface Language",
      langAuto: "Auto",
      langZh: "Chinese",
      langEn: "English",
      langRu: "Russian",
    },

    ru: {
      title: "ИК Пульт Про",
      learnedCode: "Полученный сигнал",
      startLearn: "Начать обучение",
      learning: "Ожидание сигнала...",
      send: "Отправить",
      clear: "Очистить",
      copied: "Скопировано в буфер обмена",
      sendSuccess: "Сигнал отправлен",
      noCode: "Ожидание сигнала...",
      placeholder: "Вставьте код Pronto здесь...",
      hint: "Активен режим чистого MQTT",
      topic_info: "MQTT тема передачи",
      newSignal: "Получен новый сигнал!",
      topicCopied: "Тема MQTT скопирована",
      statusOnline: "ОНЛАЙН",
      statusLearning: "ОБУЧЕНИЕ",
      editorTitle: "Заголовок карточки",
      editorTopic: "Префикс темы MQTT",
      editorLang: "Язык интерфейса",
      langAuto: "Авто",
      langZh: "Китайский",
      langEn: "Английский",
      langRu: "Русский",
    },
  };




  static getConfigElement() {
    return document.createElement("esp-ir-mqtt-pure-card-editor");
  }

  static getStubConfig() {
    return {
      title: "红外遥控器",
      topic_prefix: "newchuangan1/ir",
      language: "zh",
    };
  }


  setConfig(config) {
    const language = this._resolveLanguage(config.language);
    this._config = {
      ...config,
      topic_prefix: config.topic_prefix || "newchuangan1/ir",
      title: config.title || EspIrMqttPureCard.TRANSLATIONS[language].title,
      language,
    };
    this._learnedCode = "";
    this._isLearning = false;
    this._mqttSubscribed = false;
    this._render();
  }


  set hass(hass) {
    this._hass = hass;
    if (!this._mqttSubscribed && this._config) {
      this._subscribeMQTT();
    }
  }

  _resolveLanguage(lang) {
    if (lang === "zh" || lang === "en" || lang === "ru") return lang;
    const hassLang = (this._hass?.language || "zh").toLowerCase();
    if (hassLang.startsWith("zh")) return "zh";
    if (hassLang.startsWith("ru")) return "ru";
    return "en";
  }


  _t(key) {
    const lang = this._config.language;
    return EspIrMqttPureCard.TRANSLATIONS[lang][key] || key;
  }

  async _subscribeMQTT() {
    if (this._mqttSubscribed || !this._hass) return;
    try {
      const topic = `${this._config.topic_prefix}/stored/last`;
      this._unsubscribe = await this._hass.connection.subscribeMessage(
        (msg) => this._handleMqttMessage(msg),
        { type: "mqtt/subscribe", topic }
      );
      this._mqttSubscribed = true;
    } catch (err) {
      console.error("MQTT Subscription Error:", err);
    }
  }

  _handleMqttMessage(message) {
    const payload = message.payload;
    if (payload && payload.length > 10) {
      this._learnedCode = payload.trim();
      this._isLearning = false;
      this._render();
      this._toast(this._t("newSignal"));
    }
  }


  _publish(topic, payload) {
    return this._hass.callService("mqtt", "publish", {
      topic,
      payload,
      qos: 0,
      retain: false,
    });
  }

  _startLearning() {
    this._isLearning = true;
    this._render();
    this._publish(`${this._config.topic_prefix}/learn`, "1");
    
    setTimeout(() => {
      if (this._isLearning) {
        this._isLearning = false;
        this._render();
      }
    }, 15000);
  }

  _sendCode() {
    const input = this.shadowRoot.getElementById("ir-code-input");
    const code = input?.value.trim();
    if (!code) return;
    
    this._publish(`${this._config.topic_prefix}/send/pronto`, code)
      .then(() => this._toast(this._t("sendSuccess")));
  }

  _toast(message) {
    const event = new CustomEvent("hass-notification", {
      bubbles: true,
      composed: true,
      detail: { message },
    });
    this.dispatchEvent(event);
  }

  // 核心修复：兼容性复制函数
  async _copyToClipboard(text, successMsg) {
    if (!text) return;

    try {
      // 尝试使用现代 API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        this._toast(successMsg);
      } else {
        // 备用方案：创建隐藏 textarea 复制
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          this._toast(successMsg);
        } catch (err) {
          console.error('备用复制方案失败', err);
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('复制失败', err);
    }
  }

  _render() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });

    const isDark = this._hass?.themes?.darkMode;
    const themeColor = "var(--primary-color, #03a9f4)";

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --card-padding: 20px;
          --accent-color: ${themeColor};
          --bg-code: ${isDark ? "rgba(255,255,255,0.05)" : "#f5f5f5"};
          --text-main: var(--primary-text-color);
          --text-sub: var(--secondary-text-color);
          --divider: var(--divider-color, rgba(0,0,0,0.1));
        }

        ha-card {
          overflow: hidden;
          padding: var(--card-padding);
          border-radius: 16px;
          background: var(--ha-card-background, var(--card-background-color, white));
        }

        .header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px;
        }

        .header-title {
          display: flex; align-items: center; gap: 12px;
          font-size: 1.25rem; font-weight: 600; color: var(--text-main);
        }

        .status-badge {
          display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: bold;
          padding: 4px 10px; background: rgba(0,0,0,0.05); border-radius: 20px; color: var(--text-sub);
        }

        .dot { width: 8px; height: 8px; background: #4caf50; border-radius: 50%; }
        .dot.learning { background: #f44336; animation: blink 1s infinite; box-shadow: 0 0 8px #f44336; }
        @keyframes blink { 50% { opacity: 0.2; } }

        .section-label {
          font-size: 0.85rem; color: var(--accent-color); margin-bottom: 8px;
          font-weight: 600; display: flex; justify-content: space-between; align-items: center;
        }

        .code-window {
          background: var(--bg-code); border-radius: 12px; padding: 14px;
          margin-bottom: 20px; border: 1px solid var(--divider);
        }

        .code-content {
          font-family: 'SFMono-Regular', Consolas, monospace; font-size: 12px;
          line-height: 1.5; word-break: break-all; max-height: 70px;
          overflow-y: auto; color: var(--text-main); cursor: pointer;
        }

        .code-content.empty { color: var(--text-sub); font-style: italic; opacity: 0.7; }

        textarea {
          width: 100%; box-sizing: border-box; background: transparent;
          border: 2px solid var(--divider); border-radius: 12px; padding: 14px;
          color: var(--text-main); font-family: monospace; font-size: 0.95rem;
          resize: none; margin-bottom: 20px; transition: all 0.3s;
        }

        textarea:focus { outline: none; border-color: var(--accent-color); }

        .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        button {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px; border: none; border-radius: 10px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; background: var(--accent-color); color: white;
        }

        button.secondary { background: rgba(var(--rgb-primary-text-color), 0.08); color: var(--text-main); }
        button:hover { filter: brightness(1.1); transform: translateY(-2px); }
        button:disabled { opacity: 0.5; cursor: not-allowed; }

        .footer-info {
          margin-top: 24px; padding: 16px; border-radius: 12px;
          background: rgba(var(--rgb-primary-text-color), 0.03); border: 1px dashed var(--divider);
        }

        .footer-header { margin-bottom: 8px; }
        .topic-title { font-size: 0.75rem; font-weight: bold; color: var(--text-sub); text-transform: uppercase; }

        .topic-path-container {
          display: flex; align-items: center; gap: 10px;
          background: var(--bg-code); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--divider);
        }

        .topic-path {
          font-family: monospace; font-size: 0.85rem; color: var(--accent-color);
          flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        .icon-btn { cursor: pointer; color: var(--text-sub); transition: all 0.2s; }
        .icon-btn:hover { color: var(--accent-color); transform: scale(1.1); }
      </style>

      <ha-card>
        <div class="header">
          <div class="header-title">
            <ha-icon icon="mdi:remote-transmission"></ha-icon>
            <span>${this._config.title}</span>
          </div>
          <div class="status-badge">
            <div class="dot ${this._isLearning ? 'learning' : ''}"></div>
            <span>${this._isLearning ? this._t("statusLearning") : this._t("statusOnline")}</span>
          </div>

        </div>

        <div class="section-label">
          <span>${this._t("learnedCode")}</span>
          <ha-icon class="icon-btn" id="copy-learned" icon="mdi:content-copy" style="--mdc-icon-size: 20px;"></ha-icon>
        </div>
        <div class="code-window">
          <div class="code-content ${this._learnedCode ? '' : 'empty'}" id="learned-display">
            ${this._learnedCode || this._t("noCode")}
          </div>
        </div>

        <textarea id="ir-code-input" rows="3" placeholder="${this._t("placeholder")}"></textarea>

        <div class="action-grid">
          <button id="learn-btn" class="${this._isLearning ? 'secondary' : ''}" ${this._isLearning ? 'disabled' : ''}>
            <ha-icon icon="mdi:microphone"></ha-icon>
            ${this._isLearning ? this._t("learning") : this._t("startLearn")}
          </button>
          <button id="send-btn">
            <ha-icon icon="mdi:rocket-launch"></ha-icon>
            ${this._t("send")}
          </button>
        </div>

        <div class="footer-info">
          <div class="footer-header">
            <div class="topic-title">${this._t("topic_info")}</div>
          </div>
          <div class="topic-path-container" id="copy-topic-area" style="cursor: pointer;">
            <div class="topic-path" id="topic-text">${this._config.topic_prefix}/send/pronto</div>
            <ha-icon class="icon-btn" icon="mdi:content-copy" style="--mdc-icon-size: 20px;"></ha-icon>
          </div>
        </div>
      </ha-card>
    `;

    this._setupEventListeners();
  }

  _setupEventListeners() {
    const root = this.shadowRoot;
    
    // 学习与发射
    root.getElementById("learn-btn").onclick = () => this._startLearning();
    root.getElementById("send-btn").onclick = () => this._sendCode();
    
    // 修正后的复制捕获码事件
    root.getElementById("copy-learned").onclick = (e) => {
      e.stopPropagation();
      this._copyToClipboard(this._learnedCode, this._t("copied"));
    };

    // 修正后的复制 Topic 事件
    root.getElementById("copy-topic-area").onclick = () => {
      const topic = `${this._config.topic_prefix}/send/pronto`;
      this._copyToClipboard(topic, this._t("topicCopied"));
    };


    // 点击显示区填充到输入框
    root.getElementById("learned-display").onclick = () => {
      if (this._learnedCode) {
        root.getElementById("ir-code-input").value = this._learnedCode;
      }
    };
  }

  getCardSize() { return 3; }
}

// 编辑器 (Editor)
class EspIrMqttPureCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  _lang() {
    const configured = this._config?.language;
    if (configured === "zh" || configured === "en" || configured === "ru") return configured;
    const hassLang = (this._hass?.language || "zh").toLowerCase();
    if (hassLang.startsWith("zh")) return "zh";
    if (hassLang.startsWith("ru")) return "ru";
    return "en";
  }

  _t(key) {
    const lang = this._lang();
    return EspIrMqttPureCard.TRANSLATIONS[lang][key] || key;
  }

  _render() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const lang = this._config.language || "";
    this.shadowRoot.innerHTML = `
      <style>
        .c-row { padding: 12px 0; display: flex; flex-direction: column; gap: 8px; }
        label { font-weight: bold; font-size: 0.9rem; color: var(--secondary-text-color); }
        input, select {
          padding: 12px; border: 1px solid var(--divider-color); border-radius: 8px; 
          background: var(--card-background-color); color: var(--primary-text-color); outline: none;
        }
      </style>
      <div class="c-row">
        <label>${this._t("editorTitle")}</label>
        <input id="title" value="${this._config.title || ""}">
      </div>
      <div class="c-row">
        <label>${this._t("editorTopic")}</label>
        <input id="topic_prefix" value="${this._config.topic_prefix || ""}">
      </div>
      <div class="c-row">
        <label>${this._t("editorLang")}</label>
        <select id="language">
          <option value="" ${lang === "" ? "selected" : ""}>${this._t("langAuto")}</option>
          <option value="zh" ${lang === "zh" ? "selected" : ""}>${this._t("langZh")}</option>
          <option value="en" ${lang === "en" ? "selected" : ""}>${this._t("langEn")}</option>
          <option value="ru" ${lang === "ru" ? "selected" : ""}>${this._t("langRu")}</option>
        </select>
      </div>
    `;

    const fireChange = () => {
      const event = new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true });
      this.dispatchEvent(event);
    };

    this.shadowRoot.querySelectorAll("input").forEach(input => {
      input.onchange = (e) => {
        this._config = { ...this._config, [e.target.id]: e.target.value };
        fireChange();
      };
    });

    const langSelect = this.shadowRoot.getElementById("language");
    langSelect.onchange = (e) => {
      this._config = { ...this._config, language: e.target.value };
      this._render();
      fireChange();
    };
  }
}


customElements.define("esp-ir-mqtt-pure-card", EspIrMqttPureCard);
customElements.define("esp-ir-mqtt-pure-card-editor", EspIrMqttPureCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "esp-ir-mqtt-pure-card",
  name: "IR Remote Pro (MQTT)",
  preview: true,
  description: "全兼容复制功能的红外遥控卡片"
});
