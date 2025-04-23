// ==UserScript==
// @name         Aquila prime
// @namespace    http://tampermonkey.net/
// @version      0.0.3
// @description  [PT/RU/EN]
// @match        https://*.tribalwars.com.br/game.php?village=*&screen=market&mode=exchange
// @match        https://*.tribalwars.us/game.php?village=*&screen=market&mode=exchange
// @match        https://*.tribalwars.com.br/game.php?t=*&village=*&screen=market&mode=exchange
// @match        https://*.divokekmeny.cz/game.php?village=*&screen=market&mode=exchange
// @match        https://*.voynaplemyon.com/game.php?village=*&screen=market&mode=exchange
// @match        https://*.tribalwars.co.uk/game.php?village=*&screen=market&mode=exchange
// @match        https://*.triburile.ro/game.php?village=*&screen=market&mode=exchange
// @match        https://*.fyletikesmaxes.gr/game.php?village=*&screen=market&mode=exchange
// @match        https://*.tribalwars.works/game.php?village=*&screen=market&mode=exchange
// @match        https://*.tribalwars.net/game.php?village=*&screen=market&mode=exchange
// @match        https://*.triburile.ro/game.php?village=*&screen=market&mode=exchange
// @match        https://*.guerrastribales.es/game.php?village=*&screen=market&mode=exchange
// @match        https://*.staemme.ch/game.php?village=*&screen=market&mode=exchange
// @match        https://*.plemiona.pl/game.php?village=*&screen=market&mode=exchange
// @match        https://*.divoke-kmene.sk/game.php?village=*&screen=market&mode=exchange
// @match        https://*.klanlar.org/game.php?village=*&screen=market&mode=exchange
// @match        https://*.guerretribale.fr/game.php?village=*&screen=market&mode=exchange
// @match        https://*.tribals.it/game.php?village=*&screen=market&mode=exchange
// @match        https://*.die-staemme.de/game.php?village=*&screen=market&mode=exchange
// @match        https://*.tribalwars.nl/game.php?village=*&screen=market&mode=exchange
// @match        https://*.tribalwars.com.pt/game.php?village=*&screen=market&mode=exchange
// @match        https://*.klanhaboru.hu/game.php?village=*&screen=market&mode=exchange
// @match        https://*.tribalwars.ae/game.php?village=*&screen=market&mode=exchange
// @icon         https://raw.githubusercontent.com/C7696/ragnarokcompra-e-venda/refs/heads/main/erasebg-transformed.ico
// @downloadURL  https://raw.githubusercontent.com/C7696/ragnarokcompra-e-venda/main/Aquila-Prime.user.js
// @updateURL    https://raw.githubusercontent.com/C7696/ragnarokcompra-e-venda/main/Aquila-Prime.user.js
// @connect      firebaseio.com
// @connect      cloudfunctions.net
// @connect      googleapis.com
// @connect      gstatic.com
// @connect      cdn.jsdelivr.net
// @icon         https://raw.githubusercontent.com/C7696/ragnarokcompra-e-venda/refs/heads/main/erasebg-transformed.ico
// @require      https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js
// @require      https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js
// @require      https://unpkg.com/i18next@23.15.1/dist/umd/i18next.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/js/all.min.js
// @require      https://cdn.jsdelivr.net/npm/luxon@3.3.0/build/global/luxon.min.js
// @require      https://unpkg.com/mobx@6.9.0/dist/mobx.umd.production.min.js
// @require      https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js
// @require      https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM_addElement
// @grant        GM_addStyle
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @connect      ip-api.com
// @run-at       document-idle
// ==/UserScript==


(async function() {
  "use strict";
  const firebaseConfig = {
    apiKey: "AIzaSyAnDVwYDWa_JZj6uApXv6o9_d66JUZwF9o",
    authDomain: "compra-e-venda-ragnarok.firebaseapp.com",
    projectId: "compra-e-venda-ragnarok",
    storageBucket: "compra-e-venda-ragnarok.appspot.com",
    messagingSenderId: "896525993752",
    appId: "1:896525993752:web:1f99c76f66e16669f3c06d",
    measurementId: "G-1B10ECJN01"
  };
  const SCRIPT_NAME = "RAGNAROK_AUTH_SESSION";
  const SESSION_HEARTBEAT_MINUTES = 3;
  const SESSION_VALIDITY_MINUTES = 7;
  const IP_API_URL = "http://ip-api.com/json/?fields=status,message,query,city,country";
  const GM_SESSION_KEY_PREFIX = `${SCRIPT_NAME}_session_`;
  const GM_EXPIRATION_KEY_PREFIX = `${SCRIPT_NAME}_expiration_`;
  let isScriptActive = false;
  let firestoreListenerUnsubscribe = null;
  let sessionHeartbeatTimer = null;
  let currentSessionId = null;
  let currentPlayerNickname = null;
  let cleanupAttempted = false;
  function initializeFirebase() {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      return firebase.firestore();
    } catch (error) {
      alert(`${SCRIPT_NAME}: Falha cr\xEDtica ao inicializar o sistema de verifica\xE7\xE3o. O script n\xE3o pode continuar.`);
      return null;
    }
  }
  function getPlayerNickname() {
    try {
      const nick = TribalWars.getGameData().player.name.toString();
      if (!nick || nick.trim() === "") {
        throw new Error("Nickname do jogador vazio ou inv\xE1lido.");
      }
      return nick;
    } catch (e) {
      return null;
    }
  }
  function generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  async function fetchGeoInfo() {
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: IP_API_URL,
        timeout: 5e3,
        onload: function(response) {
          if (response.status >= 200 && response.status < 300) {
            try {
              const data = JSON.parse(response.responseText);
              if (data.status === "success") {
                resolve({ ip: data.query, city: data.city, country: data.country });
              } else {
                resolve({ ip: "Erro API", city: "Erro API", country: "Erro API" });
              }
            } catch (e) {
              resolve({ ip: "Erro Parse", city: "Erro Parse", country: "Erro Parse" });
            }
          } else {
            resolve({ ip: `Erro HTTP ${response.status}`, city: `Erro HTTP ${response.status}`, country: `Erro HTTP ${response.status}` });
          }
        },
        onerror: function(error) {
          resolve({ ip: "Erro Rede", city: "Erro Rede", country: "Erro Rede" });
        },
        ontimeout: function() {
          resolve({ ip: "Timeout", city: "Timeout", country: "Timeout" });
        }
      });
    });
  }
  async function checkLicenseAndRegisterSession(playerNickname) {
    if (!playerNickname) {
      return { authorized: false, reason: "Nickname inv\xE1lido fornecido." };
    }
    const db = initializeFirebase();
    if (!db) {
      return { authorized: false, reason: "Firestore n\xE3o inicializado." };
    }
    const newSessionId = generateSessionId();
    const playerDocRef = db.collection("jogadores_permitidos").doc(playerNickname);
    const sessionsColRef = playerDocRef.collection("sessoes_ativas");
    let finalResult = { authorized: false, reason: "Falha desconhecida na verifica\xE7\xE3o.", sessionId: null };
    const FirestoreTimestamp = firebase.firestore.Timestamp;
    try {
      let expirationDate = null;
      await db.runTransaction(async (transaction) => {
        const playerDocSnap = await transaction.get(playerDocRef);
        if (!playerDocSnap.exists) {
          throw new Error("Nickname n\xE3o encontrado na lista de permiss\xF5es.");
        }
        const playerData = playerDocSnap.data();
        if (!playerData || !playerData.data_expiracao || typeof playerData.data_expiracao.toDate !== "function") {
          throw new Error("Formato da data de expira\xE7\xE3o inv\xE1lido no banco de dados.");
        }
        expirationDate = playerData.data_expiracao.toDate();
        const currentDate = /* @__PURE__ */ new Date();
        if (currentDate >= expirationDate) {
          throw new Error(`Licen\xE7a expirada em ${expirationDate.toLocaleString()}.`);
        }
        const newSessionRef = sessionsColRef.doc(newSessionId);
        const nowTimestamp = FirestoreTimestamp.now();
        const sessionData = {
          timestamp_criacao: nowTimestamp,
          timestamp_heartbeat: nowTimestamp
        };
        transaction.set(newSessionRef, sessionData);
      });
      try {
        const geoInfo = await fetchGeoInfo();
        const sessionRef = sessionsColRef.doc(newSessionId);
        await sessionRef.update({
          ip_registrado: geoInfo.ip || "N/A",
          cidade_registrada: geoInfo.city || "N/A",
          pais_registrado: geoInfo.country || "N/A",
          info_navegador: navigator.userAgent || "N/A"
        });
      } catch (updateError) {
      }
      finalResult = {
        authorized: true,
        reason: "Licen\xE7a OK, Sess\xE3o Registrada.",
        sessionId: newSessionId,
        expirationDate
      };
    } catch (error) {
      finalResult = {
        authorized: false,
        reason: `Falha na verifica\xE7\xE3o: ${error.message}` || "Erro desconhecido na verifica\xE7\xE3o.",
        sessionId: null
      };
    }
    return finalResult;
  }
  async function sendHeartbeat(playerNickname, sessionId) {
    if (!playerNickname || !sessionId) return false;
    const db = initializeFirebase();
    if (!db) return false;
    const sessionRef = db.collection("jogadores_permitidos").doc(playerNickname).collection("sessoes_ativas").doc(sessionId);
    try {
      await sessionRef.update({
        timestamp_heartbeat: firebase.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      if (error.code === "not-found") {
        return false;
      }
      throw error;
    }
  }
  async function cleanupSessionOnUnload(playerNick, sessId) {
    if (cleanupAttempted || !playerNick || !sessId) return;
    cleanupAttempted = true;
    const storageKey = GM_SESSION_KEY_PREFIX + playerNick;
    try {
      GM_deleteValue(storageKey);
    } catch (e) {
    }
    const db = initializeFirebase();
    if (!db) return;
    const sessionRef = db.collection("jogadores_permitidos").doc(playerNick).collection("sessoes_ativas").doc(sessId);
    try {
      sessionRef.delete();
    } catch (e) {
    }
  }
  function desativarScript(motivo) {
    if (!isScriptActive && firestoreListenerUnsubscribe === null && sessionHeartbeatTimer === null) {
      return;
    }
    const wasActive = isScriptActive;
    isScriptActive = false;
    if (firestoreListenerUnsubscribe) {
      try {
        firestoreListenerUnsubscribe();
      } catch (e) {
      }
      firestoreListenerUnsubscribe = null;
    }
    if (sessionHeartbeatTimer) {
      clearInterval(sessionHeartbeatTimer);
      sessionHeartbeatTimer = null;
    }
    if (wasActive && currentPlayerNickname) {
      const storageKey = GM_SESSION_KEY_PREFIX + currentPlayerNickname;
      try {
        GM_deleteValue(storageKey);
      } catch (e) {
      }
    }
    if (currentPlayerNickname && currentSessionId) {
      const db = initializeFirebase();
      if (db) {
        db.collection("jogadores_permitidos").doc(currentPlayerNickname).collection("sessoes_ativas").doc(currentSessionId).delete().catch((err) => {
        });
      }
    }
    currentSessionId = null;
    alert(`RAGNAROK: O script foi desativado.
Motivo: ${motivo}

Recarregue a p\xE1gina se o problema for resolvido.`);
    try {
      const container = document.querySelector(".market-container");
      if (container) {
        container.querySelectorAll("button, input, select, textarea").forEach((el) => el.disabled = true);
        let overlay = container.querySelector(".ragnarok-disabled-overlay");
        if (!overlay) {
          overlay = document.createElement("div");
          overlay.className = "ragnarok-disabled-overlay";
          overlay.style.position = "absolute";
          overlay.style.top = "0";
          overlay.style.left = "0";
          overlay.style.width = "100%";
          overlay.style.height = "100%";
          overlay.style.background = "rgba(100, 100, 100, 0.7)";
          overlay.style.color = "white";
          overlay.style.zIndex = "1000";
          overlay.style.display = "flex";
          overlay.style.flexDirection = "column";
          overlay.style.justifyContent = "center";
          overlay.style.alignItems = "center";
          overlay.style.fontSize = "18px";
          overlay.style.textAlign = "center";
          overlay.style.backdropFilter = "blur(2px)";
          overlay.style.borderRadius = "15px";
          overlay.innerHTML = `Script RAGNAROK Desativado<br><small style="font-size: 12px;">(${motivo})</small>`;
          container.style.position = "relative";
          container.appendChild(overlay);
        }
      }
    } catch (e) {
    }
  }
  async function iniciarMonitoramentoRealtimeEHeartbeat(playerNickname, sessionId) {
    if (!playerNickname || !sessionId) {
      desativarScript("Erro interno: Falta de dados para iniciar monitoramento.");
      return;
    }
    const db = initializeFirebase();
    if (!db) {
      desativarScript("Erro cr\xEDtico: Firestore indispon\xEDvel.");
      return;
    }
    const playerDocRef = db.collection("jogadores_permitidos").doc(playerNickname);
    firestoreListenerUnsubscribe = playerDocRef.onSnapshot(
      (docSnap) => {
        if (!isScriptActive) return;
        if (!docSnap.exists || !docSnap.data()?.data_expiracao?.toDate()) {
          desativarScript("Licen\xE7a revogada ou inv\xE1lida.");
          return;
        }
        const expirationDate = docSnap.data().data_expiracao.toDate();
        if (/* @__PURE__ */ new Date() >= expirationDate) {
          desativarScript(`Licen\xE7a expirou em ${expirationDate.toLocaleString()}.`);
        }
      },
      (error) => desativarScript(`Erro de conex\xE3o no monitoramento (${error.code}).`)
    );
    sessionHeartbeatTimer = setInterval(async () => {
      try {
        const success = await sendHeartbeat(playerNickname, sessionId);
        if (!success && isScriptActive) {
          const checkResult = await checkLicenseAndRegisterSession(playerNickname);
          if (checkResult.authorized && checkResult.sessionId) {
            currentSessionId = checkResult.sessionId;
          } else {
            desativarScript(checkResult.reason || "Falha ao recriar sess\xE3o.");
          }
        }
      } catch (error) {
        desativarScript(`Erro de comunica\xE7\xE3o com o servidor (${error.code || "desconhecido"}).`);
      }
    }, SESSION_HEARTBEAT_MINUTES * 60 * 1e3);
    window.addEventListener("beforeunload", () => cleanupSessionOnUnload(playerNickname, sessionId));
  }
  function getStoredExpiration(nickname) {
    const key = GM_EXPIRATION_KEY_PREFIX + nickname;
    const storedExpiration = GM_getValue(key);
    if (storedExpiration) {
      const expirationDate = new Date(storedExpiration);
      if (!isNaN(expirationDate.getTime())) {
        return expirationDate;
      }
    }
    return null;
  }
  function storeExpiration(nickname, expirationDate) {
    const key = GM_EXPIRATION_KEY_PREFIX + nickname;
    GM_setValue(key, expirationDate.toISOString());
  }
  async function verificarLicenca() {
    currentPlayerNickname = getPlayerNickname();
    if (!currentPlayerNickname) {
      desativarScript("N\xE3o foi poss\xEDvel identificar o Nickname.");
      return false;
    }
    const storedExpiration = getStoredExpiration(currentPlayerNickname);
    const currentDate = /* @__PURE__ */ new Date();
    if (storedExpiration && currentDate < storedExpiration) {
      currentSessionId = GM_getValue(GM_SESSION_KEY_PREFIX + currentPlayerNickname)?.sessionId || generateSessionId();
      return true;
    }
    const checkResult = await checkLicenseAndRegisterSession(currentPlayerNickname);
    if (checkResult.authorized && checkResult.sessionId && checkResult.expirationDate) {
      storeExpiration(currentPlayerNickname, checkResult.expirationDate);
      currentSessionId = checkResult.sessionId;
      const storageKey = GM_SESSION_KEY_PREFIX + currentPlayerNickname;
      GM_setValue(storageKey, { sessionId: currentSessionId, timestamp: Date.now(), expirationDate: checkResult.expirationDate.toISOString() });
      return true;
    } else {
      desativarScript(checkResult.reason || "Falha na verifica\xE7\xE3o da licen\xE7a.");
      return false;
    }
  }
  if (typeof firebase === "undefined" || typeof firebase.firestore === "undefined") {
    alert(`${SCRIPT_NAME}: Erro cr\xEDtico - Componentes de verifica\xE7\xE3o n\xE3o encontrados.`);
    return;
  }
  const licencaValida = await verificarLicenca();
  if (!licencaValida) {
    return;
  }
  isScriptActive = true;
  iniciarMonitoramentoRealtimeEHeartbeat(currentPlayerNickname, currentSessionId);
  let isSellCooldownActive = false;
  const SELL_COOLDOWN_MS = 6e3;
  const VOLATILITY_WINDOW = 5;
  const TREND_SENSITIVITY = 0.05;
  const _ = window._;
  const DateTime = luxon.DateTime;

  const mobx = window.mobx;
  const GEMINI_API_KEY = "";
  const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  const requestCache = {
    cache: {},
    cacheLimit: 100,
    cacheKeys: [],
    get: function(url) {
      if (this.cache[url]) {
        this.cacheKeys = _.filter(this.cacheKeys, (key) => key !== url);
        this.cacheKeys.push(url);
        return this.cache[url].data;
      }
      return void 0;
    },
    set: function(url, data) {
      if (this.cache[url]) {
        this.cache[url].data = data;
        this.cacheKeys = _.filter(this.cacheKeys, (key) => key !== url);
        this.cacheKeys.push(url);
      } else {
        if (this.cacheKeys.length >= this.cacheLimit) {
          const oldestKey = this.cacheKeys.shift();
          delete this.cache[oldestKey];
        }
        this.cache[url] = { data };
        this.cacheKeys.push(url);
      }
    }
  };





// Função fetchMarketData ATUALIZADA para garantir o servidor correto
async function fetchMarketData(url) {
    // 1. Obtém informações do servidor atual
    let currentServer = '';
    let currentWorld = '';
    try {
        const gameData = TribalWars.getGameData();
        currentServer = window.location.hostname; // Ex: br.tribalwars.com.br
        currentWorld = gameData.world || 'unknown'; // Ex: br123
    } catch (e) {
        console.error("[fetchMarketData] Erro ao obter dados do servidor:", e);
        throw new Error("Não foi possível identificar o servidor atual.");
    }

    // 2. Valida se a URL pertence ao servidor atual
    if (!url.includes(currentServer)) {
        console.warn(`[fetchMarketData] URL (${url}) não corresponde ao servidor atual (${currentServer}).`);
        throw new Error("URL inválida para o servidor atual.");
    }

    // 3. Cria uma chave de cache única incluindo o mundo
    const cacheKey = `${currentWorld}:${url}`;
    const cachedData = requestCache.get(cacheKey);
    if (cachedData) {
        console.log(`[fetchMarketData] Cache HIT para ${cacheKey}`);
        return cachedData;
    }

    console.log(`[fetchMarketData] Buscando dados do servidor ${currentServer}, mundo ${currentWorld}: ${url}`);
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
            timeout: 7000,
            onload: function(response) {
                if (response.status >= 200 && response.status < 300) {
                    try {
                        const responseData = response.responseText;
                        requestCache.set(cacheKey, responseData); // Usa cacheKey com mundo
                        console.log(`[fetchMarketData] Dados recebidos e cacheados para ${cacheKey}`);
                        resolve(responseData);
                    } catch (e) {
                        console.error(`[fetchMarketData] Erro ao processar resposta de ${url}:`, e);
                        reject(new Error("Erro ao processar resposta do servidor"));
                    }
                } else {
                    console.error(`[fetchMarketData] Erro HTTP ${response.status} para ${url}`);
                    reject(new Error(`Erro HTTP ${response.status}`));
                }
            },
            onerror: function(error) {
                console.error(`[fetchMarketData] Erro de rede para ${url}:`, error);
                reject(new Error("Erro de rede ao buscar dados"));
            },
            ontimeout: function() {
                console.error(`[fetchMarketData] Timeout para ${url}`);
                reject(new Error("Timeout ao buscar dados"));
            }
        });
    });
}








// ================================================================
// ===      Objeto translations ATUALIZADO (v1.1 - Add Buy/Sell Keys) ===
// ================================================================
const translations = {
    resources: {
      pt: {
        translation: {
          // --- Textos Gerais da UI ---
          title: "RAGNAROK COMPRA E VENDA DE RECURSOS",
          buyModeToggleOn: "Desativar Compra",
          buyModeToggleOff: "Habilitar Compra",
          sellModeToggleOn: "Desativar Venda",
          sellModeToggleOff: "Habilitar Venda",
          saveConfig: "Salvar",
          resetAll: "Resetar Tudo",
          pause: "Pausar",
          transactions: "Transa\xE7\xF5es",
          aiAssistant: "Assistente IA Ragnarok",
          settings: "Configura\xE7\xF5es",
          saveSuccess: "Configura\xE7\xE3o salva com sucesso!",
          portuguese: "Portugu\xEAs",
          russian: "Russo",
          english: "Ingl\xEAs",
          activated: "Ativado",
          deactivated: "Deativado",
          transactionInProgress: "Processando transa\xE7\xE3o...",
          transactionSuccess: "Transa\xE7\xE3o conclu\xEDda com sucesso!",
          transactionError: "Erro na transa\xE7\xE3o. Tente novamente.",
          domError: "Erro ao acessar elementos do jogo. Atualizando...",
          noTransactions: "Nenhuma transa\xE7\xE3o encontrada.",
          // --- Modal de Transações ---
          transactionsHeader: "Hist\xF3rico de Transa\xE7\xF5es",
          transaction: "Transa\xE7\xE3o",
          date: "Data",
          type: "Tipo",
          change: "Mudan\xE7a",
          world: "Mundo",
          newPremiumPoints: "Novos Pontos Premium",
          close: "Fechar",
          filters: "Filtros",
          dateFrom: "Data Inicial",
          dateTo: "Data Final",
          worldFilter: "Filtro por Mundo",
          sortAsc: "Ordenar Ascendente",
          sortDesc: "Ordenar Descendente",
          page: "P\xE1gina",
          next: "Pr\xF3ximo",
          previous: "Anterior",
          chartTitle: "Mudan\xE7as ao Longo do Tempo",
          expenses: "Despesas",
          sales: "Lucros",
          profit: "Lucro",
          filteredPeriodProfitLabel: "Lucro L\xEDquido (Per\xEDodo)",
          // --- Modal IA ---
          aiPrompt: "Digite sua pergunta para o Assistente IA",
          aiLoading: "Carregando resposta...",
          aiError: "Erro ao obter resposta do AI",
          // --- Tooltips ---
          tooltipMinimize: "Minimizar Janela",
          tooltipSettings: "Abrir Configura\xE7\xF5es",
          tooltipAIAssistant: "Abrir Assistente IA",
          stockDesiredTooltip: "Define a quantidade m\xE1xima de {{resource}}, considerando a soma dos recursos dispon\xEDveis na aldeia e os recursos em tr\xE2nsito.",
          userRateTooltip: "Taxa m\xEDnima (pontos premium por unidade) para comprar {{resource}}. O script s\xF3 compra se o mercado for igual ou maior.",
          buyPerTimeTooltip: "Quantidade m\xE1xima por compra/transação. O script não excede este valor.",
          reserveAmountTooltip: "Quantidade m\xEDnima de {{resource}} a manter. O script n\xE3o vende se o estoque for igual ou menor.",
          reserveRateTooltip: "Taxa m\xE1xima (pontos premium por unidade) para vender {{resource}}. O script s\xF3 vende se o mercado for igual ou menor.",
          sellLimitTooltip: "Quantidade m\xE1xima por venda/transação. O script não excede este valor.",
          tooltipVillageSelect: "Exibe a aldeia ativa e coordenadas.",
          tooltipPauseBuy: "Pausar Compra pelo tempo definido nas Configurações.",
          tooltipPauseSell: "Pausar Venda pelo tempo definido nas Configurações.",
          clickToResumeTooltip: "Clique para retomar",
          tooltipSaveConfig: "Salva as configurações atuais no armazenamento local do navegador.",
          tooltipTransactions: "Abre o histórico de transações de Pontos Premium.",
          tooltipPremiumLimit: "Limite MÁXIMO de PP que o script pode GASTAR em compras.",
          tooltipWorldProfit: "Exibe o saldo LÍQUIDO de Pontos Premium obtido neste mundo (Lucro Total - Custo Total, baseado no histórico).",
          resourceNames: {
            wood: "madeira",
            stone: "argila",
            iron: "ferro"
          },
          // --- Seções e Labels Configurações ---
          settingsSectionAccount: "Informa\xE7\xF5es da Conta",
          settingsSectionLanguage: "Idioma",
          settingsSectionGeneral: "Geral",
          settingsSectionPause: "Configurações de Pausa",
          settingsLabelBuyPauseDuration: "Duração Pausa Compra (min):",
          settingsLabelSellPauseDuration: "Duração Pausa Venda (min):",
          settingsLabelPlayer: "Jogador:",
          settingsLabelLicense: "Licen\xE7a Expira em:",
          settingsLabelVersion: "Vers\xE3o do Script:",
          settingsLabelInterfaceLang: "Idioma da Interface:",
          settingsLabelCloseOnHCaptcha: "Fechar Aba no hCaptcha:",
          hCaptchaDetectedLog: "hCaptcha detectado!",
          attemptingTabCloseLog: "Configura\xE7\xE3o ativa - Tentando fechar a aba...",
          tabCloseErrorLog: "Erro ao tentar fechar a aba (pode ser bloqueado pelo navegador):",
          // --- Tooltips Configurações ---
          tooltipInterfaceLang: "Seleciona o idioma para a interface Aquila Prime.",
          tooltipBuyPauseDuration: "Tempo (em minutos) que o modo de compra ficará pausado ao clicar no botão 'Pausar'. A função será reativada automaticamente após este período.",
          tooltipSellPauseDuration: "Tempo (em minutos) que o modo de venda ficará pausado ao clicar no botão 'Pausar'. A função será reativada automaticamente após este período.",
          tooltipCloseOnHCaptcha: "Se marcado, o script tentar\xE1 fechar automaticamente a aba do navegador se um desafio hCaptcha for detectado nesta p\xE1gina.",
          statusLabel: "Status:",
          premiumExchange: "Troca Premium",
          // --- Textos Dinâmicos e Notificações ---
          pausedUntil: "Pausado até {{time}}",
          pauseDurationSet: "Pausa de {{mode}} definida por {{duration}} minuto(s).",
          pauseExpired: "Pausa de {{mode}} expirou. Funcionalidade reativada.",
          statusResumedManually: "{{mode}} retomado manualmente.",
          setPauseDurationError: "Defina uma duração de pausa (> 0) nas configurações.",
          // === INÍCIO: Chaves Buy/Sell PT ===
          buy: "Compra",
          sell: "Venda",
          // === FIM: Chaves Buy/Sell PT ===
        }
      },
      ru: {
        translation: {
          // ... (outras traduções RU) ...
          title: "\u0420\u0410\u0413\u041D\u0410\u0420\u041E\u041A \u041F\u041E\u041A\u0423\u041F\u041A\u0410 \u0418 \u041F\u0420\u041E\u0414\u0410\u0416\u0410 \u0420\u0415\u0421\u0423\u0420\u0421\u041E\u0412",
          buyModeToggleOn: "\u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u043E\u043A\u0443\u043F\u043A\u0443",
          buyModeToggleOff: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u043E\u043A\u0443\u043F\u043A\u0443",
          sellModeToggleOn: "\u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u0440\u043E\u0434\u0430\u0436\u0443",
          sellModeToggleOff: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u0440\u043E\u0434\u0430\u0436\u0443",
          saveConfig: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C",
          resetAll: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0432\u0441\u0451",
          pause: "\u041F\u0430\u0443\u0437\u0430",
          transactions: "\u0422\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0438",
          aiAssistant: "\u0418\u0418-\u0410\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442 \u0420\u0430\u0433\u043D\u0430\u0440\u043E\u043A",
          settings: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
          saveSuccess: "\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0430!",
          portuguese: "\u041F\u043E\u0440\u0442\u0443\u0433\u0430\u043B\u044C\u0441\u043A\u0438\u0439",
          russian: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
          english: "\u0410\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439",
          activated: "\u0410\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D\u043E",
          deactivated: "\u0414\u0435\u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D\u043E",
          transactionInProgress: "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0438...",
          transactionSuccess: "\u0422\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u044F \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430!",
          transactionError: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0438. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0441\u043D\u043E\u0432\u0430.",
          domError: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043A \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u043C \u0438\u0433\u0440\u044B. \u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435...",
          noTransactions: "\u0422\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0439 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E.",
          transactionsHeader: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0439",
          transaction: "\u0422\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u044F",
          date: "\u0414\u0430\u0442\u0430",
          type: "\u0422\u0438\u043F",
          change: "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435",
          world: "\u041C\u0438\u0440",
          newPremiumPoints: "\u041D\u043E\u0432\u044B\u0435 \u043F\u0440\u0435\u043C\u0438\u0443\u043C-\u043E\u0447\u043A\u0438",
          close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
          filters: "\u0424\u0438\u043B\u044C\u0442\u0440\u044B",
          dateFrom: "\u0414\u0430\u0442\u0430 \u043D\u0430\u0447\u0430\u043B\u0430",
          dateTo: "\u0414\u0430\u0442\u0430 \u043E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u044F",
          worldFilter: "\u0424\u0438\u043B\u044C\u0442\u0440 \u043F\u043E \u043C\u0438\u0440\u0443",
          sortAsc: "\u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u043E \u0432\u043E\u0437\u0440\u0430\u0441\u0442\u0430\u043D\u0438\u044E",
          sortDesc: "\u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u043E \u0443\u0431\u044B\u0432\u0430\u043D\u0438\u044E",
          page: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430",
          next: "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F",
          previous: "\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0430\u044F",
          chartTitle: "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0441 \u0442\u0435\u0447\u0435\u043D\u0438\u0435\u043C \u0432\u0440\u0435\u043C\u0435\u043D\u0438",
          expenses: "\u0420\u0430\u0441\u0445\u043E\u0434\u044B",
          sales: "\u041F\u0440\u0438\u0431\u044B\u043B\u044C",
          profit: "\u0414\u043E\u0445\u043E\u0434",
          filteredPeriodProfitLabel: "\u0427\u0438\u0441\u0442\u0430\u044F \u043F\u0440\u0438\u0431\u044B\u043B\u044C (\u041F\u0435\u0440\u0438\u043E\u0434)",
          aiPrompt: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0432\u0430\u0448 \u0432\u043E\u043F\u0440\u043E\u0441 \u0434\u043B\u044F \u0418\u0418-\u043F\u043E\u043C\u043E\u0449\u043D\u0438\u043A\u0430",
          aiLoading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043E\u0442\u0432\u0435\u0442\u0430...",
          aiError: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u043E\u0442\u0432\u0435\u0442\u0430 \u043E\u0442 \u0418\u0418",
          tooltipMinimize: "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u043E\u043A\u043D\u043E",
          tooltipSettings: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
          tooltipAIAssistant: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0418\u0418-\u0430\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442\u0430",
          stockDesiredTooltip: "\u0423\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u0442 \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E {{resource}}, \u0443\u0447\u0438\u0442\u044B\u0432\u0430\u044F \u0441\u0443\u043C\u043C\u0443 \u0440\u0435\u0441\u0443\u0440\u0441\u043E\u0432 \u0432 \u0434\u0435\u0440\u0435\u0432\u043D\u0435 \u0438 \u043D\u0430\u0445\u043E\u0434\u044F\u0449\u0438\u0445\u0441\u044F \u0432 \u043F\u0443\u0442\u0438.",
          userRateTooltip: "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430 (\u043F\u0440\u0435\u043C\u0438\u0443\u043C-\u043E\u0447\u043A\u0438 \u0437\u0430 \u0435\u0434\u0438\u043D\u0438\u0446\u0443) \u0434\u043B\u044F \u043F\u043E\u043A\u0443\u043F\u043A\u0438 {{resource}}. \u0421\u043A\u0440\u0438\u043F\u0442 \u043F\u043E\u043A\u0443\u043F\u0430\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0435\u0441\u043B\u0438 \u0440\u044B\u043D\u043E\u0447\u043D\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430 \u0440\u0430\u0432\u043D\u0430 \u0438\u043B\u0438 \u0432\u044B\u0448\u0435.",
          buyPerTimeTooltip: "Максимальное количество за покупку/транзакцию. Скрипт не превышает это значение.",
          reserveAmountTooltip: "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E {{resource}} \u0434\u043B\u044F \u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F. \u0421\u043A\u0440\u0438\u043F\u0442 \u043D\u0435 \u043F\u0440\u043E\u0434\u0430\u0435\u0442, \u0435\u0441\u043B\u0438 \u0437\u0430\u043F\u0430\u0441 \u0440\u0430\u0432\u0435\u043D \u0438\u043B\u0438 \u043C\u0435\u043D\u044C\u0448\u0435.",
          reserveRateTooltip: "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430 (\u043F\u0440\u0435\u043C\u0438\u0443\u043C-\u043E\u0447\u043A\u0438 \u0437\u0430 \u0435\u0434\u0438\u043D\u0438\u0446\u0443) \u0434\u043B\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0438 {{resource}}. \u0421\u043A\u0440\u0438\u043F\u0442 \u043F\u0440\u043E\u0434\u0430\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0435\u0441\u043B\u0438 \u0440\u044B\u043D\u043E\u0447\u043D\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430 \u0440\u0430\u0432\u043D\u0430 \u0438\u043B\u0438 \u043D\u0438\u0436\u0435.",
          sellLimitTooltip: "Максимальное количество за продажу/транзакцию. Скрипт не превышает это значение.",
          tooltipVillageSelect: "Отображает активную деревню и координаты.",
          tooltipPauseBuy: "\u041F\u0440\u0438\u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043F\u043E\u043A\u0443\u043F\u043A\u0443 \u043D\u0430 \u0432\u0440\u0435\u043C\u044F, \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u043E\u0435 \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445.",
          tooltipPauseSell: "\u041F\u0440\u0438\u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043F\u0440\u043E\u0434\u0430\u0436\u0443 \u043D\u0430 \u0432\u0440\u0435\u043C\u044F, \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u043E\u0435 \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445.",
          clickToResumeTooltip: "\u041D\u0430\u0436\u043C\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u0432\u043E\u0437\u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C",
          tooltipSaveConfig: "Сохраняет текущие настройки в локальном хранилище браузера.",
          tooltipTransactions: "Открывает историю транзакций Премиум-очков.",
          tooltipPremiumLimit: "МАКСИМАЛЬНЫЙ лимит ПП, который скрипт может ПОТРАТИТЬ на покупки.",
          tooltipWorldProfit: "Отображает ЧИСТУЮ прибыль в Премиум-очках, полученную в этом мире (Общий доход - Общие расходы, на основе истории).",
          resourceNames: { wood: "\u0434\u0435\u0440\u0435\u0432\u043E", stone: "\u0433\u043B\u0438\u043D\u0430", iron: "\u0436\u0435\u043B\u0435\u0437\u043E" },
          settingsSectionAccount: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E\u0431 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0435",
          settingsSectionLanguage: "\u042F\u0437\u044B\u043A",
          settingsSectionGeneral: "\u041E\u0431\u0449\u0438\u0435",
          // REMOVED: settingsSectionSell: "\u041F\u0440\u043E\u0434\u0430\u0436\u0430",
          settingsSectionPause: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u0430\u0443\u0437\u044B",
          settingsLabelBuyPauseDuration: "\u0414\u043B\u0438\u0442. \u043F\u0430\u0443\u0437\u044B \u043F\u043E\u043A\u0443\u043F\u043A\u0438 (\u043C\u0438\u043D):",
          settingsLabelSellPauseDuration: "\u0414\u043B\u0438\u0442. \u043F\u0430\u0443\u0437\u044B \u043F\u0440\u043E\u0434\u0430\u0436\u0438 (\u043C\u0438\u043D):",
          settingsLabelPlayer: "\u0418\u0433\u0440\u043E\u043A:",
          settingsLabelLicense: "\u041B\u0438\u0446\u0435\u043D\u0437\u0438\u044F \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442 \u0434\u043E:",
          settingsLabelVersion: "\u0412\u0435\u0440\u0441\u0438\u044F \u0441\u043A\u0440\u0438\u043F\u0442\u0430:",
          settingsLabelInterfaceLang: "\u042F\u0437\u044B\u043A \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430:",
          settingsLabelCloseOnHCaptcha: "\u0417\u0430\u043A\u0440\u044B\u0432\u0430\u0442\u044C \u0432\u043A\u043B\u0430\u0434\u043A\u0443 \u043F\u0440\u0438 hCaptcha:",
          hCaptchaDetectedLog: "hCaptcha \u043E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D!",
          attemptingTabCloseLog: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u0430 - \u041F\u043E\u043F\u044B\u0442\u043A\u0430 \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u044F \u0432\u043A\u043B\u0430\u0434\u043A\u0438...",
          tabCloseErrorLog: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u043E\u043F\u044B\u0442\u043A\u0435 \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u044F \u0432\u043A\u043B\u0430\u0434\u043A\u0438 (\u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043E\u043C):",
          tooltipInterfaceLang: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u044F\u0437\u044B\u043A \u0434\u043B\u044F \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430 Aquila Prime.",
          tooltipBuyPauseDuration: "\u0412\u0440\u0435\u043C\u044F (\u0432 \u043C\u0438\u043D\u0443\u0442\u0430\u0445), \u043D\u0430 \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0440\u0435\u0436\u0438\u043C \u043F\u043E\u043A\u0443\u043F\u043A\u0438 \u0431\u0443\u0434\u0435\u0442 \u043F\u0440\u0438\u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u043F\u0440\u0438 \u043D\u0430\u0436\u0430\u0442\u0438\u0438 \u043A\u043D\u043E\u043F\u043A\u0438 '\u041F\u0430\u0443\u0437\u0430'. \u0424\u0443\u043D\u043A\u0446\u0438\u044F \u0431\u0443\u0434\u0435\u0442 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0432\u043E\u0437\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0430 \u043F\u043E\u0441\u043B\u0435 \u044D\u0442\u043E\u0433\u043E \u043F\u0435\u0440\u0438\u043E\u0434\u0430.",
          tooltipSellPauseDuration: "\u0412\u0440\u0435\u043C\u044F (\u0432 \u043C\u0438\u043D\u0443\u0442\u0430\u0445), \u043D\u0430 \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0440\u0435\u0436\u0438\u043C \u043F\u0440\u043E\u0434\u0430\u0436\u0438 \u0431\u0443\u0434\u0435\u0442 \u043F\u0440\u0438\u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u043F\u0440\u0438 \u043D\u0430\u0436\u0430\u0442\u0438\u0438 \u043A\u043D\u043E\u043F\u043A\u0438 '\u041F\u0430\u0443\u0437\u0430'. \u0424\u0443\u043D\u043A\u0446\u0438\u044F \u0431\u0443\u0434\u0435\u0442 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0432\u043E\u0437\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0430 \u043F\u043E\u0441\u043B\u0435 \u044D\u0442\u043E\u0433\u043E \u043F\u0435\u0440\u0438\u043E\u0434\u0430.",
          tooltipCloseOnHCaptcha: "\u0415\u0441\u043B\u0438 \u043E\u0442\u043C\u0435\u0447\u0435\u043D\u043E, \u0441\u043A\u0440\u0438\u043F\u0442 \u043F\u043E\u043F\u044B\u0442\u0430\u0435\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0437\u0430\u043A\u0440\u044B\u0442\u044C \u0432\u043A\u043B\u0430\u0434\u043A\u0443 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430, \u0435\u0441\u043B\u0438 \u043D\u0430 \u044D\u0442\u043E\u0439 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435 \u043E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 hCaptcha.",
          statusLabel: "\u0421\u0442\u0430\u0442\u0443\u0441:",
          premiumExchange: "\u041F\u0440\u0435\u043C\u0438\u0443\u043C-\u043E\u0431\u043C\u0435\u043D",
          pausedUntil: "\u041F\u0430\u0443\u0437\u0430 \u0434\u043E {{time}}",
          pauseDurationSet: "\u041F\u0430\u0443\u0437\u0430 (\u0420\u0435\u0436\u0438\u043C: {{mode}}) \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430 \u043D\u0430 {{duration}} \u043C\u0438\u043D.",
          pauseExpired: "\u041F\u0430\u0443\u0437\u0430 (\u0420\u0435\u0436\u0438\u043C: {{mode}}) \u0438\u0441\u0442\u0435\u043A\u043B\u0430. \u0424\u0443\u043D\u043A\u0446\u0438\u044F \u0432\u043E\u0437\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0430.",
          statusResumedManually: "\u0420\u0435\u0436\u0438\u043C {{mode}} \u0432\u043E\u0437\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D \u0432\u0440\u0443\u0447\u043D\u0443\u044E.",
          setPauseDurationError: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043F\u0430\u0443\u0437\u044B (> 0) \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445.",
          // === INÍCIO: Chaves Buy/Sell RU ===
          buy: "\u041F\u043E\u043A\u0443\u043F\u043A\u0430", // Pokupka
          sell: "\u041F\u0440\u043E\u0434\u0430\u0436\u0430", // Prodazha
          // === FIM: Chaves Buy/Sell RU ===
        }
      },
      en: {
        translation: {
          title: "RAGNAROK RESOURCE TRADING",
          buyModeToggleOn: "Turn Off Buying",
          buyModeToggleOff: "Turn On Buying",
          sellModeToggleOn: "Turn Off Selling",
          sellModeToggleOff: "Turn On Selling",
          saveConfig: "Save",
          resetAll: "Reset Everything",
          pause: "Pause",
          transactions: "Transactions",
          aiAssistant: "Ragnarok AI Assistant",
          settings: "Settings",
          saveSuccess: "Settings saved successfully!",
          portuguese: "Portuguese",
          russian: "Russian",
          english: "English",
          activated: "Activated",
          deactivated: "Deactivated",
          transactionInProgress: "Processing transaction...",
          transactionSuccess: "Transaction completed successfully!",
          transactionError: "Transaction failed. Please try again.",
          domError: "Error accessing game elements. Refreshing...",
          noTransactions: "No transactions found.",
          transactionsHeader: "Transaction History",
          transaction: "Transaction",
          date: "Date",
          type: "Type",
          change: "Change",
          world: "World",
          newPremiumPoints: "New Premium Points",
          close: "Close",
          filters: "Filters",
          dateFrom: "Start Date",
          dateTo: "End Date",
          worldFilter: "Filter by World",
          sortAsc: "Sort Ascending",
          sortDesc: "Sort Descending",
          page: "Page",
          next: "Next",
          previous: "Previous",
          chartTitle: "Changes Over Time",
          expenses: "Costs",
          sales: "Revenue",
          profit: "Profit",
          filteredPeriodProfitLabel: "Net Profit (Period)",
          aiPrompt: "Type your question for the AI Assistant",
          aiLoading: "Loading response...",
          aiError: "Error retrieving AI response",
          tooltipMinimize: "Minimize Window",
          tooltipSettings: "Open Settings",
          tooltipAIAssistant: "Open AI Assistant",
          stockDesiredTooltip: "Sets the maximum amount of {{resource}}, taking into account the sum of resources available in the village and those in transit.",
          userRateTooltip: "Minimum rate (premium points per unit) to buy {{resource}}. The script only buys if the market rate is at or above this.",
          buyPerTimeTooltip: "Maximum amount per purchase/transaction. The script won't exceed this value.",
          reserveAmountTooltip: "Minimum amount of {{resource}} to keep. The script won't sell if stock is at or below this.",
          reserveRateTooltip: "Maximum rate (premium points per unit) to sell {{resource}}. The script only sells if the market rate is at or below this.",
          sellLimitTooltip: "Maximum amount per sale/transaction. The script won't exceed this value.",
          tooltipVillageSelect: "Displays the active village and coordinates.",
          tooltipPauseBuy: "Pause Buying for the duration set in Settings.",
          tooltipPauseSell: "Pause Selling for the duration set in Settings.",
          clickToResumeTooltip: "Click to resume",
          tooltipSaveConfig: "Saves the current settings to the browser's local storage.",
          tooltipTransactions: "Opens the Premium Points transaction history.",
          tooltipPremiumLimit: "MAXIMUM PP limit the script can SPEND on purchases.",
          tooltipWorldProfit: "Displays the NET Premium Points balance obtained in this world (Total Income - Total Cost, based on history).",
          resourceNames: {
            wood: "wood",
            stone: "clay",
            iron: "iron"
          },
          settingsSectionAccount: "Account Information",
          settingsSectionLanguage: "Language",
          settingsSectionGeneral: "General",
          // REMOVIDO: settingsSectionSell: "Selling",
          settingsSectionPause: "Pause Settings",
          settingsLabelBuyPauseDuration: "Buy Pause Duration (min):",
          settingsLabelSellPauseDuration: "Sell Pause Duration (min):",
          settingsLabelPlayer: "Player:",
          settingsLabelLicense: "License Expires:",
          settingsLabelVersion: "Script Version:",
          settingsLabelInterfaceLang: "Interface Language:",
          settingsLabelCloseOnHCaptcha: "Close Tab on hCaptcha:",
          hCaptchaDetectedLog: "hCaptcha detected!",
          attemptingTabCloseLog: "Setting enabled - Attempting to close tab...",
          tabCloseErrorLog: "Error attempting to close tab (may be blocked by browser):",
          tooltipInterfaceLang: "Select the language for the Aquila Prime interface.",
          tooltipBuyPauseDuration: "Time (in minutes) the buying mode will be paused when clicking the 'Pause' button. Functionality will automatically resume after this period.",
          tooltipSellPauseDuration: "Time (in minutes) the selling mode will be paused when clicking the 'Pause' button. Functionality will automatically resume after this period.",
          tooltipCloseOnHCaptcha: "If checked, the script will attempt to automatically close the browser tab if an hCaptcha challenge is detected on this page.",
          statusLabel: "Status:",
          premiumExchange: "Premium Exchange",
          pausedUntil: "Paused until {{time}}",
          pauseDurationSet: "{{mode}} Pause set for {{duration}} minute(s).",
          pauseExpired: "{{mode}} Pause expired. Functionality reactivated.",
          statusResumedManually: "{{mode}} manually resumed.",
          setPauseDurationError: "Set a pause duration (> 0) in settings.",
           // === INÍCIO: Chaves Buy/Sell EN ===
           buy: "Buying",
           sell: "Selling",
           // === FIM: Chaves Buy/Sell EN ===
        }
      },
   nl: {
        translation: {
          // --- Textos Gerais da UI ---
          title: "RAGNAROK RESOURCE HANDEL",
          buyModeToggleOn: "Kopen Uitschakelen",
          buyModeToggleOff: "Kopen Inschakelen",
          sellModeToggleOn: "Verkopen Uitschakelen",
          sellModeToggleOff: "Verkopen Inschakelen",
          saveConfig: "Opslaan",
          resetAll: "Alles Resetten",
          pause: "Pauze",
          transactions: "Transacties",
          aiAssistant: "Ragnarok AI Assistent",
          settings: "Instellingen",
          saveSuccess: "Instellingen succesvol opgeslagen!",
          portuguese: "Portugees",
          russian: "Russisch",
          english: "Engels",
          dutch: "Nederlands", // <<< Adicionado nome do idioma
          activated: "Geactiveerd",
          deactivated: "Gedeactiveerd",
          transactionInProgress: "Transactie verwerken...",
          transactionSuccess: "Transactie succesvol voltooid!",
          transactionError: "Transactiefout. Probeer opnieuw.",
          domError: "Fout bij toegang tot spel elementen. Vernieuwen...",
          noTransactions: "Geen transacties gevonden.",
          // --- Modal de Transacties ---
          transactionsHeader: "Transactiegeschiedenis",
          transaction: "Transactie",
          date: "Datum",
          type: "Type",
          change: "Wijziging",
          world: "Wereld",
          newPremiumPoints: "Nieuwe Premium Punten",
          close: "Sluiten",
          filters: "Filters",
          dateFrom: "Startdatum",
          dateTo: "Einddatum",
          worldFilter: "Filter op Wereld",
          sortAsc: "Sorteer Oplopend",
          sortDesc: "Sorteer Aflopend",
          page: "Pagina",
          next: "Volgende",
          previous: "Vorige",
          chartTitle: "Wijzigingen Over Tijd",
          expenses: "Kosten", // Ou Uitgaven
          sales: "Opbrengsten", // Ou Winst/Inkomsten
          profit: "Winst",
          filteredPeriodProfitLabel: "Nettowinst (Periode)",
          // --- Modal IA ---
          aiPrompt: "Typ uw vraag voor de AI Assistent",
          aiLoading: "Antwoord laden...",
          aiError: "Fout bij ophalen van AI antwoord",
          // --- Tooltips ---
          tooltipMinimize: "Venster Minimaliseren",
          tooltipSettings: "Instellingen Openen",
          tooltipAIAssistant: "AI Assistent Openen",
          stockDesiredTooltip: "Stelt de maximale hoeveelheid {{resource}} in, rekening houdend met de som van beschikbare middelen in het dorp en onderweg.",
          userRateTooltip: "Minimumtarief (premium punten per eenheid) om {{resource}} te kopen. Het script koopt alleen als de markt gelijk of hoger is.",
          buyPerTimeTooltip: "Maximale hoeveelheid per aankoop/transactie. Script overschrijdt dit niet.",
          reserveAmountTooltip: "Minimale hoeveelheid {{resource}} om te behouden. Script verkoopt niet als voorraad gelijk of lager is.",
          reserveRateTooltip: "Maximumtarief (premium punten per eenheid) om {{resource}} te verkopen. Script verkoopt alleen als de markt gelijk of lager is.",
          sellLimitTooltip: "Maximale hoeveelheid per verkoop/transactie. Script overschrijdt dit niet.",
          tooltipVillageSelect: "Toont actief dorp en coördinaten.",
          tooltipPauseBuy: "Kopen pauzeren voor duur ingesteld in Instellingen.",
          tooltipPauseSell: "Verkopen pauzeren voor duur ingesteld in Instellingen.",
          clickToResumeTooltip: "Klik om te hervatten",
          tooltipSaveConfig: "Slaat huidige instellingen op in lokale browser opslag.",
          tooltipTransactions: "Opent Premium Punten transactiegeschiedenis.",
          tooltipPremiumLimit: "MAXIMALE PP-limiet die het script kan UITGEVEN aan aankopen.",
          tooltipWorldProfit: "Toont het NETTO Premium Punten saldo behaald in deze wereld (Totale Inkomsten - Totale Kosten, gebaseerd op geschiedenis).",
          resourceNames: {
            wood: "hout",
            stone: "leem",
            iron: "ijzer"
          },
          // --- Configuraties ---
          settingsSectionAccount: "Accountinformatie",
          settingsSectionLanguage: "Taal",
          settingsSectionGeneral: "Algemeen",
          settingsSectionPause: "Pauze Instellingen",
          settingsLabelBuyPauseDuration: "Pauzeduur Kopen (min):",
          settingsLabelSellPauseDuration: "Pauzeduur Verkopen (min):",
          settingsLabelPlayer: "Speler:",
          settingsLabelLicense: "Licentie Vervalt op:",
          settingsLabelVersion: "Script Versie:",
          settingsLabelInterfaceLang: "Interface Taal:",
          settingsLabelCloseOnHCaptcha: "Tabblad Sluiten bij hCaptcha:",
          hCaptchaDetectedLog: "hCaptcha gedetecteerd!",
          attemptingTabCloseLog: "Instelling actief - Poging tabblad te sluiten...",
          tabCloseErrorLog: "Fout bij poging tabblad te sluiten (mogelijk geblokkeerd door browser):",
          tooltipInterfaceLang: "Selecteer de taal voor de Aquila Prime interface.",
          tooltipBuyPauseDuration: "Tijd (in minuten) dat koopmodus gepauzeerd wordt bij klikken op 'Pauze'. Functie wordt automatisch hervat na deze periode.",
          tooltipSellPauseDuration: "Tijd (in minuten) dat verkoopmodus gepauzeerd wordt bij klikken op 'Pauze'. Functie wordt automatisch hervat na deze periode.",
          tooltipCloseOnHCaptcha: "Indien aangevinkt, probeert script tabblad automatisch te sluiten als hCaptcha challenge gedetecteerd wordt op deze pagina.",
          statusLabel: "Status:",
          premiumExchange: "Premium Beurs",
          // --- Dynamische teksten ---
          pausedUntil: "Gepauzeerd tot {{time}}",
          pauseDurationSet: "{{mode}} Pauze ingesteld voor {{duration}} minuut/minuten.",
          pauseExpired: "{{mode}} Pauze verlopen. Functie opnieuw geactiveerd.",
          statusResumedManually: "{{mode}} handmatig hervat.",
          setPauseDurationError: "Stel pauzeduur in (> 0) in instellingen.",
          buy: "Kopen",
          sell: "Verkopen",
          loadingShort: 'Laden...' // <<< ADICIONADO NL
        }
      }
      // ============================================
      // === FIM: Nova Seção Holandês (nl) ======
      // ============================================
    }
};

  const i18n = window.i18next;
  if (!i18n.isInitialized) {
    i18n.init({
      lng: localStorage.getItem("language") || "pt",
      fallbackLng: "en",
      resources: translations.resources,
      debug: false,
      // Mantenha false, a menos que esteja depurando i18next
      interpolation: {
        escapeValue: false
        // Necessário para renderizar HTML (como o ícone de PP)
      }
    }).then(() => {
      ////console.log("i18next inicializado com sucesso.");
    }).catch((err) => {
      console.error("Erro ao inicializar i18next:", err);
    });
  } else {
    ////console.log("i18next j\xE1 inicializado. Recarregando recursos e definindo l\xEDngua.");
    i18n.addResourceBundle("pt", "translation", translations.resources.pt.translation, true, true);
    i18n.addResourceBundle("ru", "translation", translations.resources.ru.translation, true, true);
    i18n.addResourceBundle("en", "translation", translations.resources.en.translation, true, true);
    i18n.addResourceBundle("nl", "translation", translations.resources.nl.translation, true, true); // <<< ADICIONAR
    const currentLang = localStorage.getItem("language") || "pt";
    if (i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang).catch((err) => console.error("Erro ao mudar l\xEDngua no i18next j\xE1 inicializado:", err));
    }
  }
  i18n.init({
   lng: ["pt", "ru", "en", "nl"].includes(localStorage.getItem("language")) ? localStorage.getItem("language") : "pt", // <<< MODIFICAR fallback seguro
   fallbackLng: "en",
   resources: translations.resources,
    // Use the updated resources object
    debug: false
    // Set to true for i18next debugging if needed
  });
  const elementCache = /* @__PURE__ */ new Map();
  let currentResources = { wood: 0, stone: 0, iron: 0 };
  const resourceImgSrc = {
    wood: "wood",
    stone: "clay",
    iron: "iron"
  };
  function getResourceAmount(doc, resourceName) {
    let selector = `#${resourceName}.res`;
    if (resourceName === "stone") {
      selector = "#stone";
    }
    const resourceElement = doc.querySelector(selector);
    if (resourceElement) {
      const textContent = resourceElement.textContent;
      const trimmedText = textContent.trim();
      const parsedValue = _.parseInt(trimmedText.replace(/\D/g, ""), 10);
      return parsedValue || 0;
    } else {
      return 0;
    }
  }
  function getStorageCapacity() {
    if (typeof TribalWars !== "undefined" && TribalWars.getGameData) {
      const villageData = TribalWars.getGameData().village;
      const storageCapacity = villageData.storage_max || 1e3;
      return storageCapacity;
    }
    const storageElement = document.querySelector("#storage");
    if (!storageElement) return 1e3;
    const storageText = storageElement.textContent.trim();
    const parts = storageText.split("/");
    if (parts.length >= 2) {
      const maxStorage = sanitizeNumber(parts[1]);
      return maxStorage;
    }
    return 1e3;
  }
  async function fetchResources() {
    const villageId = TribalWars.getGameData().village.id;
    const overviewUrl = `https://${window.location.host}/game.php?village=${villageId}&screen=overview`;
    const response = await fetchMarketData(overviewUrl);
    if (response) {
      const html = response;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      currentResources.wood = getResourceAmount(doc, "wood");
      currentResources.stone = getResourceAmount(doc, "stone");
      currentResources.iron = getResourceAmount(doc, "iron");
    }
    state.storageCapacity = getStorageCapacity();
  }
  class ResourceHandler {
    constructor(name, config) {
      this.name = name;
      this.config = config;
      this.elementCache = /* @__PURE__ */ new Map();
    }
    getDomElement(selector) {
      if (!this.elementCache.has(selector)) {
        const element = document.querySelector(selector);
        this.elementCache.set(selector, element);
        return element;
      }
      return this.elementCache.get(selector);
    }
    sanitizeNumber(value) {
      return _.parseInt(value, 10) || 0;
    }
    getStock() {
      return this.sanitizeNumber(this.getDomElement(this.config.stockSelector)?.textContent.trim());
    }
    getGameRate() {
      return this.sanitizeNumber(this.getDomElement(this.config.rateSelector)?.textContent.trim().replace(/\D/g, ""));
    }
    getUserRate() {
      return this.sanitizeNumber(this.config.uiRateInput?.value);
    }
    getTotal() {
      return currentResources[this.name];
    }
    getReserved() {
      return this.sanitizeNumber(this.config.uiReserveInput?.value);
    }
    getMarketValue() {
      const marketImg = this.getDomElement(this.config.marketImg);
      if (!marketImg) {
        return 0;
      }
      const valueText = marketImg.parentElement?.textContent.trim();
      if (!valueText) {
        return 0;
      }
      return this.sanitizeNumber(valueText.replace(/[^0-9]/g, "")) || 0;
    }
    getReserveRate() {
      return this.sanitizeNumber(this.config.uiReserveRateInput?.value);
    }
    getBuyInput() {
      return this.getDomElement(this.config.buyInputSelector);
    }
    getSellInput() {
      return this.getDomElement(this.config.sellInputSelector);
    }
  }
  const resourceTemplate = (name, outputDefault) => ({
    stockSelector: `#premium_exchange_stock_${name}`,
    rateSelector: `#premium_exchange_rate_${name} > div:nth-child(1)`,
    buyInputSelector: `input.premium-exchange-input[data-resource="${name}"][data-type="buy"]`,
    sellInputSelector: `input.premium-exchange-input[data-resource="${name}"][data-type="sell"]`,
    totalSelector: `#${name}.res`,
    marketImg: `.premium-exchange-sep ${`img[src*="${name}_18x16"]`}`,
    outputDefault
  });
  const resourceConfigs = {
    wood: resourceTemplate("wood", 39),
    stone: resourceTemplate("stone", 46),
    iron: resourceTemplate("iron", 63)
  };











const state = mobx.observable({
    resources: {
        storageCapacity: 1e3,
        wood: 0,
        stone: 0,
        iron: 0
    },
    incomingResources: {
        wood: 0,
        stone: 0,
        iron: 0
    },
    marketRates: {},
    transactions: [],
    buyModeActive: localStorage.getItem("buyModeActive") === "true",
    sellModeActive: localStorage.getItem("sellModeActive") === "true",

    // >> Propriedades de Estado para Pausa Temporizada <<
    buyPausedUntil: null,
    sellPausedUntil: null,
    buyPauseDurationMinutes: 5,
    sellPauseDurationMinutes: 5,
    // >> FIM Propriedades de Estado <<

    hasExecutedBuy: false,
    hasExecutedSell: false,
    reloadPending: false,
    autoReloadOnError: true, // Mantido o exemplo, ajuste se necessário
    lastKnownPPLimitBeforeBuy: null,
    lastKnownPPBalanceBeforeBuy: null,

    // =======================================
    // === INÍCIO: NOVA PROPRIEDADE hCAPTCHA ===
    // =======================================
    closeTabOnHCaptcha: false, // Inicializa como desativado por padrão
    // =====================================
    // === FIM: NOVA PROPRIEDADE hCAPTCHA ===
    // =====================================

    isDarkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
    currentVillage: null,
    worldProfit: 0,
    language: localStorage.getItem("language") || "pt",
    optimizedRates: mobx.computed(function() {
      // Certifique-se de que this.marketRates existe antes de acessá-lo
      return this.marketRates || {};
    }),
    rateHistory: {
        wood: [],
        stone: [],
        iron: []
    },
    marketTrends: {
        wood: "neutral",
        stone: "neutral",
        iron: "neutral"
    },
    marketVolatility: {
        wood: 0,
        stone: 0,
        iron: 0
    },
    lastUpdate: {
        wood: null,
        stone: null,
        iron: null
    },
    marketConditions: mobx.computed(function() {
        return {
            wood: {
                trend: this.marketTrends.wood,
                volatility: this.marketVolatility.wood,
                lastUpdate: this.lastUpdate.wood
            },
            stone: {
                trend: this.marketTrends.stone,
                volatility: this.marketVolatility.stone,
                lastUpdate: this.lastUpdate.stone
            },
            iron: {
                trend: this.marketTrends.iron,
                volatility: this.marketVolatility.iron,
                lastUpdate: this.lastUpdate.iron
            }
        };
    }),
    allTransactionsFetched: false,
    isUpdating: false,
    isSettingsModalOpen: false,
    isMinimized: false // Adicionado para consistência, se não existia antes
});









// >> NOVAS Variáveis Globais para IDs dos Timeouts da Pausa <<
//    Usadas para poder cancelar um timeout agendado se necessário.
let buyPauseTimeoutId = null;
let sellPauseTimeoutId = null;
// >> FIM NOVAS Variáveis Globais <<

// === FIM DA ATUALIZAÇÃO ===

const ui = {
    elements: /* @__PURE__ */ new Map(),
    buyInputs: /* @__PURE__ */ new Map(),
    sellInputs: /* @__PURE__ */ new Map(),
    gameElements: /* @__PURE__ */ new Map(),
    getElement(key) {
        if (!this.elements.has(key)) {
            // Tenta pegar do cache de elementos primeiro
            const cachedElement = elementCache.get(key);
            if (cachedElement) {
                 this.elements.set(key, cachedElement);
                 return cachedElement;
            }
            // Se não estiver no cache, busca no DOM
            const element = document.querySelector(`#${key}`);
            if (element) {
                this.elements.set(key, element);
                elementCache.set(key, element); // Guarda no cache global também
            }
            return element; // Retorna o elemento encontrado ou null
        }
        return this.elements.get(key);
    }
};

const createElement = (tag, props = {}) => {
    const element = Object.assign(document.createElement(tag), props);
    if (props.id) elementCache.set(props.id, element); // Mantém cache global
    return element;
};

  function isModalOpen() {
    const transactionsModal = document.getElementById("transactionsModal");
    const aiModal = document.getElementById("aiModal");
    const settingsModal = document.getElementById("settingsModal");
    return transactionsModal && transactionsModal.style.display === "flex" || aiModal && aiModal.style.display === "flex" || settingsModal && settingsModal.style.display === "flex";
  }







// Função showTooltip ATUALIZADA (v11 - Lógica de extração de recurso corrigida)
const showTooltip = (event) => {
    const tooltip = ui.elements.get("tooltip");
    if (!tooltip) { console.error("[Tooltip] Elemento tooltip não encontrado!"); return; }
    const container = ui.elements.get("market-container");
    if (!container) { console.error("[Tooltip] Container principal não encontrado!"); return; }

    const targetElement = event.target;
    const tooltipDirectKey = targetElement.dataset.tooltipKey;
    const resourceInputTooltipKey = targetElement.dataset.tooltip;

    let rawTranslation = '';
    let interpolationData = {};

    if (tooltipDirectKey) {
        // --- Caso 1: Chave direta ---
        rawTranslation = i18n.t(tooltipDirectKey, { defaultValue: `Tooltip: ${tooltipDirectKey}` });

    } else if (resourceInputTooltipKey && targetElement.classList.contains('rate-input')) {
        // --- Caso 2: Input de recurso (PRECISA DE EXTRAÇÃO CORRETA) ---
        // 2a. Pega a tradução base
        rawTranslation = i18n.t(resourceInputTooltipKey, { defaultValue: `Tooltip base: ${resourceInputTooltipKey}` });

        // 2b. *** LÓGICA DE EXTRAÇÃO CORRIGIDA ***
        const dataResourceValue = targetElement.dataset.resource || ''; // Pega o valor completo: ex: "reserve-wood-rate"
        let resourceBaseKey = 'resource'; // Fallback inicial

        // Tenta encontrar 'wood', 'stone', ou 'iron' DENTRO do valor do data-attribute
        const resourceMatch = dataResourceValue.match(/(wood|stone|iron)/); // Regex sem o '^' (início da string)
        if (resourceMatch && resourceMatch[1]) {
             // Se encontrou (ex: encontrou 'wood' em 'reserve-wood-rate'), usa o nome encontrado
             resourceBaseKey = resourceMatch[1];
        } else {
             // Se não encontrou 'wood', 'stone' ou 'iron' no nome (ex: 'buy-per-time'),
             // mantém o fallback 'resource'. O tooltip pode não precisar do nome específico.
             //console.warn(`[Tooltip] Não foi possível extrair nome do recurso de data-resource="${dataResourceValue}". Usando fallback '${resourceBaseKey}'.`);
        }
        // *** FIM DA LÓGICA CORRIGIDA ***

        // 2c. Traduz o NOME do recurso encontrado (ou o fallback)
        const translatedResourceName = i18n.t(`resourceNames.${resourceBaseKey}`, { defaultValue: resourceBaseKey });

        // 2d. Prepara os dados para interpolação
        interpolationData = { resource: translatedResourceName };

        ////console.log(`[Tooltip DEBUG Corrigido] Antes de interpolar: raw='${rawTranslation}', data=`, interpolationData);


    } else {
        return;
    }

    // --- ETAPA FINAL: Interpolação e Exibição (como antes) ---
    let finalText = rawTranslation;
    if (Object.keys(interpolationData).length > 0 && rawTranslation.includes('{{')) {
         try {
              finalText = i18n.t(rawTranslation, interpolationData);
         } catch (e) {
              console.error(`[Tooltip] Erro na interpolação manual de '${rawTranslation}' com`, interpolationData, e);
              finalText = rawTranslation;
         }
    }

    if (!finalText || finalText.startsWith('Tooltip:') || finalText.startsWith('Tooltip base:')) {
        //console.warn(`[Tooltip] Tradução final não encontrada ou inválida. Key(s): ${tooltipDirectKey || resourceInputTooltipKey}`);
    }

    ////console.log(`[Tooltip FINAL Corrigido] Key: '${tooltipDirectKey || resourceInputTooltipKey}', Texto Final: '${finalText}'`);

    // --- Lógica de posicionamento (inalterada) ---
    tooltip.innerHTML = finalText;
    tooltip.style.display = 'block';
    const targetRect = targetElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const relativeTargetTop = targetRect.top - containerRect.top;
    const relativeTargetLeft = targetRect.left - containerRect.left;
    let tooltipLeft = relativeTargetLeft + 5;
    let tooltipTop = relativeTargetTop + targetRect.height + 5;
    const containerPadding = 10;

    if (tooltipLeft + tooltipWidth > container.clientWidth - containerPadding) {
        tooltipLeft = container.clientWidth - tooltipWidth - containerPadding;
    }
    if (tooltipLeft < containerPadding) {
        tooltipLeft = containerPadding;
    }
    if (tooltipTop + tooltipHeight > container.clientHeight - containerPadding) {
        tooltipTop = relativeTargetTop - tooltipHeight - 5;
    }
    if (tooltipTop < containerPadding) {
        tooltipTop = containerPadding;
    }
    tooltip.style.left = `${Math.max(0, tooltipLeft)}px`;
    tooltip.style.top = `${Math.max(0, tooltipTop)}px`;
};



// Função updateTooltipPosition ATUALIZADA
const updateTooltipPosition = (event) => {
    const tooltip = ui.elements.get("tooltip"); // <--- PEGA DO CACHE DA UI
    if (!tooltip || !tooltip.style.display || tooltip.style.display === "none") return;

    const container = ui.elements.get("market-container"); // <--- PEGA DO CACHE DA UI
    if (!container) return;

    const targetElement = event.target;
    const targetRect = targetElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    // Lógica de cálculo de posição relativa (igual a showTooltip)
    const relativeTargetTop = targetRect.top - containerRect.top;
    const relativeTargetLeft = targetRect.left - containerRect.left;

    let tooltipLeft = relativeTargetLeft + 5;
    let tooltipTop = relativeTargetTop + targetRect.height + 5;

    const containerPadding = 10;

    if (tooltipLeft + tooltipWidth > container.clientWidth - containerPadding) {
      tooltipLeft = container.clientWidth - tooltipWidth - containerPadding;
    }
    if (tooltipLeft < containerPadding) {
      tooltipLeft = containerPadding;
    }
    if (tooltipTop + tooltipHeight > container.clientHeight - containerPadding) {
        tooltipTop = relativeTargetTop - tooltipHeight - 5;
    }
    if (tooltipTop < containerPadding) {
        tooltipTop = containerPadding;
    }

    tooltip.style.left = `${Math.max(0, tooltipLeft)}px`;
    tooltip.style.top = `${Math.max(0, tooltipTop)}px`;
};

// Função hideTooltip ATUALIZADA
const hideTooltip = () => {
    const tooltip = ui.elements.get("tooltip"); // <--- PEGA DO CACHE DA UI
    if (tooltip) {
         tooltip.style.display = "none";
         // REMOVIDO: Tentativa de anexar ao body
    }
};

















  const sanitizeNumber = (value) => _.parseInt(value, 10) || 0;
  const createResourceCard = (resource, type, iconUrl, placeholders) => {
    const tooltipKeys = {
      "wood-stock": "stockDesiredTooltip",
      "stone-stock": "stockDesiredTooltip",
      "iron-stock": "stockDesiredTooltip",
      "wood": "userRateTooltip",
      "stone": "userRateTooltip",
      "iron": "userRateTooltip",
      "buy-per-time": "buyPerTimeTooltip",
      "storage-limit": "buyPerTimeTooltip",
      "max-spend": "buyPerTimeTooltip",
      "reserve-wood": "reserveAmountTooltip",
      "reserve-stone": "reserveAmountTooltip",
      "reserve-iron": "reserveAmountTooltip",
      "reserve-wood-rate": "reserveRateTooltip",
      "reserve-stone-rate": "reserveRateTooltip",
      "reserve-iron-rate": "reserveRateTooltip",
      "sell-limit": "sellLimitTooltip",
      "sell-limit-stone": "sellLimitTooltip",
      "sell-limit-iron": "sellLimitTooltip"
    };
    const getTooltipKey = (resourceName, placeholderKey) => {
      if (type === "buy") {
        if (placeholderKey === 0) return tooltipKeys[`${resourceName}-stock`];
        if (placeholderKey === 1) return tooltipKeys[resourceName];
        if (placeholderKey === 2 && placeholders[2].key === "buy-per-time") return tooltipKeys["buy-per-time"];
        if (placeholderKey === 2 && placeholders[2].key === "storage-limit") return tooltipKeys["storage-limit"];
        if (placeholderKey === 2 && placeholders[2].key === "max-spend") return tooltipKeys["max-spend"];
      } else if (type === "sell") {
        if (placeholderKey === 0) return tooltipKeys[`reserve-${resourceName}`];
        if (placeholderKey === 1) return tooltipKeys[`reserve-${resourceName}-rate`];
        if (placeholderKey === 2 && placeholders[2].key === "sell-limit") return tooltipKeys["sell-limit"];
        if (placeholderKey === 2 && placeholders[2].key === "sell-limit-stone") return tooltipKeys["sell-limit-stone"];
        if (placeholderKey === 2 && placeholders[2].key === "sell-limit-iron") return tooltipKeys["sell-limit-iron"];
      }
      return void 0;
    };
    return `
    <div class="resource-card base-card" data-resource="${resource}">
        <img src="${iconUrl}" alt="${resource}" />
        <input type="number" class="rate-input"
               data-resource="${type === "buy" ? `${resource}-stock` : `reserve-${resource}`}"
               data-tooltip="${getTooltipKey(resource, 0)}"
               placeholder="${placeholders[0]}">

        <span>${type === "buy" ? "\u2191" : "\u2193"}</span>

        <input type="number" class="rate-input"
               data-resource="${type === "buy" ? resource : `reserve-${resource}-rate`}"
               data-tooltip="${getTooltipKey(resource, 1)}"
               placeholder="${placeholders[1]}">

        <div class="num-input">
            <img src="https://dsus.innogamescdn.com/asset/95eda994/graphic/items/resources.png" alt="Resources" class="resource-icon" />
            <input type="number" class="rate-input"
                   data-resource="${type === "buy" ? placeholders[2].key : `sell-limit${resource === "wood" ? "" : `-${resource}`}`}"
                   data-tooltip="${getTooltipKey(resource, 2)}"
                   placeholder="${placeholders[2].value}">
        </div>
    </div>
  `;
  };
  const createButton = (id, text, classes = "black-btn", attributes = {}) => {
    let attrsString = "";
    for (const key in attributes) {
      if (Object.hasOwnProperty.call(attributes, key)) {
        const escapedValue = String(attributes[key]).replace(/"/g, '"');
        attrsString += ` ${key}="${escapedValue}"`;
      }
    }
    return `<button class="${classes || ""}" id="${id}"${attrsString}>${text}</button>`;
  };





  // Função callGeminiAPI ATUALIZADA para usar GM_xmlhttpRequest
const callGeminiAPI = async (prompt) => {
    // Chave API ainda está vazia, a função não funcionará, mas a estrutura está aqui
    if (!GEMINI_API_KEY) {
         console.warn("[Gemini API] Chave API não configurada. Chamada ignorada.");
         return "Erro: Chave da API Gemini não configurada no script."; // Retorna erro amigável
    }

    const payload = {
        contents: [{
            parts: [{ text: prompt }]
        }]
    };

    // console.log(`[GM_XHR Request] Chamando Gemini API...`); // Log opcional
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "POST",
            url: `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, // Usa a constante da URL e chave
            headers: {
                "Content-Type": "application/json",
            },
            data: JSON.stringify(payload), // Converte o payload para string JSON
            timeout: 15000, // Timeout de 15 segundos
            onload: function(response) {
                if (response.status === 200) {
                    try {
                        const responseData = JSON.parse(response.responseText);
                        const content = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta do Gemini.";
                        // console.log(`[GM_XHR Success] Resposta recebida da Gemini API.`); // Log opcional
                        resolve(content); // Resolve com o texto da resposta
                    } catch (e) {
                        console.error("[GM_XHR Parse Error] Erro ao parsear resposta da Gemini API:", e, response.responseText);
                        reject(new Error("Erro ao processar resposta da API Gemini"));
                    }
                } else {
                     console.error(`[GM_XHR HTTP Error] Status ${response.status} da Gemini API: ${response.statusText}`, response.responseText);
                     reject(new Error(`Erro HTTP ${response.status} da API Gemini`));
                }
            },
            onerror: function(error) {
                console.error(`[GM_XHR Network Error] Erro de rede ao chamar Gemini API:`, error);
                reject(new Error("Erro de rede ao chamar API Gemini"));
            },
            ontimeout: function() {
                console.error(`[GM_XHR Timeout] Timeout ao chamar Gemini API`);
                reject(new Error("Timeout ao chamar API Gemini"));
            }
        });
    });
};









// ================================================================
// ===   FUNÇÃO initializeUI ATUALIZADA (v18 - Add Log Fetch Status) ===
// ================================================================
const initializeUI = () => {
    const container = createElement("div", {
        className: "market-container draggable",
        style: "position: fixed; top: 50px; left: 50px; z-index: 2147483647; overflow: hidden;"
    });
    // Limpa cache antigo do container se existir para garantir nova renderização
    const oldContainer = document.querySelector('.market-container.draggable');
    if (oldContainer) {
        elementCache.delete("market-container");
        oldContainer.remove();
    }
    elementCache.set("market-container", container);
    ui.elements.set("market-container", container);

    // --- HTML da Interface (Com novo div#logFetchStatus) ---
    container.innerHTML = `
        <div class="market-container">
            <div class="header">
                <h2 id="headerTitle">${i18n.t("title")}</h2>
                <div id="logFetchStatus" class="log-fetch-status" style="display: none;"></div> <!-- <<< NOVO ELEMENTO AQUI -->
                <div class="dropdowns">
                    <div class="dropdown" data-tooltip-key="tooltipVillageSelect">
                        <span class="village-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="#ffa500"/>
                            </svg>
                        </span>
                        <select id="villageSelect"><option value="current">Carregando...</option></select>
                    </div>

                    <div class="profit-info" data-tooltip-key="tooltipWorldProfit">
                        <span class="icon header premium"></span> <span id="worldProfit">0</span>
                    </div>
                </div>
                <div class="header-buttons">
                    <div class="btn-group-left">
                        ${createButton("aiAssistantBtn", `<i class="fa-solid fa-robot"></i>`, "icon-btn", { "data-tooltip-key": "tooltipAIAssistant" })}
                    </div>
                    <div class="btn-group-right">
                        ${createButton("minimizeButton", `<i class="fa-solid fa-window-minimize"></i>`, "icon-btn", { "data-tooltip-key": "tooltipMinimize" })}
                        ${createButton("settingsBtn", `<i class="fa-solid fa-gear"></i>`, "icon-btn", { "data-tooltip-key": "tooltipSettings" })}
                    </div>
                </div>
            </div>
            <div class="sections">
                <div class="section buy" id="buySection">

                    <h3 style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                        <span>
                           <span id="buyStatusLabel">${i18n.t("statusLabel")}</span>
                           <span class="status" id="buyStatus">${i18n.t(state.buyModeActive ? "activated" : "deactivated")}</span>
                        </span>
                        <div class="premium-input-wrapper" data-tooltip-key="tooltipPremiumLimit">
                            <span class="icon header premium"></span>
                            <input type="number" id="premiumPointsInput" placeholder="PP">
                        </div>
                    </h3>

                    <div class="sortable-container" id="buySortable">
                        ${createResourceCard("wood", "buy", "https://dsus.innogamescdn.com/asset/95eda994/graphic/premium/features/WoodProduction_large.png", ["200", "2000", { key: "buy-per-time", value: "5000" }])}
                        ${createResourceCard("stone", "buy", "https://dsus.innogamescdn.com/asset/95eda994/graphic/premium/features/StoneProduction_large.png", ["200", "2000", { key: "storage-limit", value: "5000" }])}
                        ${createResourceCard("iron", "buy", "https://dsus.innogamescdn.com/asset/95eda994/graphic/premium/features/IronProduction_large.png", ["200", "2000", { key: "max-spend", value: "5000" }])}
                    </div>

                    <div class="buttons buy-buttons">
                        ${createButton("buyModeToggle", i18n.t(state.buyModeActive ? "buyModeToggleOn" : "buyModeToggleOff"), "black-btn toggle-btn")}
                        ${createButton("buyPause", `<i class="fas fa-pause"></i> ${i18n.t("pause")}`, "black-btn", {"data-tooltip-key": "tooltipPauseBuy"})}
                        <span class="spinner" id="buySpinner" style="display: none;"></span>
                    </div>

                </div>

                <div class="section sell" id="sellSection">

                    <h3><span id="sellStatusLabel">${i18n.t("statusLabel")}</span> <span class="status" id="sellStatus">${i18n.t(state.sellModeActive ? "activated" : "deactivated")}</span></h3>
                    <div class="sortable-container" id="sellSortable">
                        ${createResourceCard("wood", "sell", "https://dsus.innogamescdn.com/asset/95eda994/graphic/premium/features/WoodProduction_large.png", ["1000", "64", { key: "sell-limit", value: "200" }])}
                        ${createResourceCard("stone", "sell", "https://dsus.innogamescdn.com/asset/95eda994/graphic/premium/features/StoneProduction_large.png", ["1000", "64", { key: "sell-limit-stone", value: "200" }])}
                        ${createResourceCard("iron", "sell", "https://dsus.innogamescdn.com/asset/95eda994/graphic/premium/features/IronProduction_large.png", ["1000", "64", { key: "sell-limit-iron", value: "200" }])}
                    </div>
                    <div class="buttons">
                        ${createButton("sellModeToggle", i18n.t(state.sellModeActive ? "sellModeToggleOn" : "sellModeToggleOff"), "black-btn toggle-btn")}
                        ${createButton("sellPause", `<i class="fas fa-pause"></i> ${i18n.t("pause")}`, "black-btn", {"data-tooltip-key": "tooltipPauseSell"})}
                        <span class="spinner" id="sellSpinner" style="display: none;"></span>
                    </div>
                </div>
            </div>
            <div class="footer">
                <div class="footer-buttons-row">
                    ${createButton("resetAll", `\u21BB ${i18n.t("resetAll")}`, "black-btn")}
                    ${createButton("transactionsBtn", i18n.t("transactions"), "black-btn", {"data-tooltip-key": "tooltipTransactions"})}
                    ${createButton("saveConfig", `<i class="fa-solid fa-floppy-disk"></i> ${i18n.t("saveConfig")}`, "black-btn", {"data-tooltip-key": "tooltipSaveConfig"})}
                </div>
            </div>

             <!-- MODAL TRANSAÇÕES (Estrutura principal) -->
            <div class="modal aquila-prime-modal" id="transactionsModal" style="display: none; z-index: 50;">
                <div class="modal-content aquila-prime-panel">
                    <h3 class="aquila-modal-header">
                         <span class="aquila-icon"><img src="https://raw.githubusercontent.com/C7696/ragnarokcompra-e-venda/refs/heads/main/erasebg-transformed.ico" alt="Aquila Icon" style="height: 24px; width: 24px; display: block;"></span>
                         <span data-i18n-key="transactionsHeader">${i18n.t("transactionsHeader")}</span>
                    </h3>
                    <div class="modal-scrollable-body">
                       <div id="filterSection"></div>
                       <div id="filteredProfitSummary" class="filtered-profit-summary" style="display: none;"></div>
                       <div id="transactionsTableContainer"></div>
                       <div class="aquila-chart" id="transactionsChartContainer"><canvas id="transactionsChart"></canvas></div>
                    </div>
                    <div class="modal-footer-controls">
                       <div id="paginationControls"></div>
                       <div>${createButton("closeModal", i18n.t("close"), "aquila-btn")}</div>
                    </div>
                 </div>
            </div>

            <!-- MODAL IA (Estrutura principal) -->
            <div class="modal" id="aiModal" style="display: none; z-index: 50;">
                 <div class="modal-content">
                  <h3 data-i18n-key="aiAssistant">${i18n.t("aiAssistant")}</h3>
                  <div style="padding: 20px; flex-grow: 1; overflow-y: auto;">
                        <textarea id="aiPrompt" data-i18n-key="aiPrompt" placeholder="${i18n.t("aiPrompt")}" rows="4" style="width: 100%; margin-bottom: 10px;"></textarea>
                        <div id="aiResponse" style="margin-bottom: 10px; min-height: 50px; background: rgba(0,0,0,0.1); padding: 10px; border-radius: 4px; border: 1px solid #303848;"></div>
                  </div>
                  <div style="padding: 15px 20px; border-top: 1px solid #303848; text-align: center;">
                        ${createButton("submitAI", "Enviar", "aquila-btn")}
                        ${createButton("closeAIModal", i18n.t("close"), "aquila-btn")}
                  </div>
                </div>
            </div>

             <!-- MODAL CONFIGS (Estrutura principal e preenchimento do body) -->
            <div class="modal aquila-modal" id="settingsModal" style="display: none; z-index: 50;">
                 <div class="modal-content settings-content aquila-panel">
                    <div class="settings-header aquila-header">
                       <span class="aquila-icon"><img src="https://raw.githubusercontent.com/C7696/ragnarokcompra-e-venda/refs/heads/main/erasebg-transformed.ico" alt="Aquila Icon" style="height: 24px; width: 24px; display: block;"></span>
                       <h3 data-i18n-key="settings">Configurações Aquila</h3>
                       <button id="closeSettingsModal" class="close-btn aquila-close-btn">×</button>
                    </div>
                    <div class="settings-body aquila-body">
                       {/* <!-- Conteúdo da modal será preenchido dinamicamente abaixo --> */}
                    </div>
                    <div class="settings-footer aquila-footer">
                         <span class="aquila-motto">Ex Caelo Vis</span>
                    </div>
                 </div>
            </div>

            {/* Elemento Tooltip */}
             <div id="aquilaTooltip" class="tooltip aquila-tooltip" style="display: none; position: absolute; z-index: 100;"></div>
        </div>
    `;
    // --- FIM DO HTML ---

    // Adiciona o container principal ao body
    document.body.appendChild(container);

    // Adiciona elemento de notificação
    const notificationElement = createElement("div", {
        id: "notification", className: "notification", style: "display: none; opacity: 0;"
    });
    document.body.appendChild(notificationElement);
    elementCache.set("notification", notificationElement);
    ui.elements.set("notification", notificationElement);

    // Adiciona caixa minimizada
    const minimizedBox = createElement("div", {
        id: "minimizedMarketBox", className: "minimized-box"
    });
    document.body.appendChild(minimizedBox);
    ui.elements.set("minimizedMarketBox", minimizedBox);

    // Define estado inicial de minimização
    const isMinimized = localStorage.getItem("isMinimized") === "true";
    if (typeof state !== 'undefined') { state.isMinimized = isMinimized; }
    container.style.display = isMinimized ? "none" : "block";
    minimizedBox.style.display = isMinimized ? "flex" : "none";

    // Configura Drag and Drop e Sortable
    if (typeof addDragAndDropListeners === "function") {
        addDragAndDropListeners(container);
    }
    if (typeof initializeSortable === "function") {
        initializeSortable();
    }

    // Restaura posição salva
    try {
        const savedPos = JSON.parse(localStorage.getItem("marketContainerPosition"));
        if (savedPos && savedPos.left && savedPos.top) {
            container.style.left = savedPos.left;
            container.style.top = savedPos.top;
        }
    } catch (e) {
        localStorage.removeItem("marketContainerPosition");
    }

    // Preenche o conteúdo do corpo da modal de configurações
    const settingsBody = container.querySelector('.settings-body');
    if (settingsBody) {
        settingsBody.innerHTML = `
             <div class="settings-section aquila-section user-info-section">
                <h4 data-i18n-key="settingsSectionAccount"><i class="fas fa-user-astronaut"></i> Status Operacional</h4>
                 <div class="info-row aquila-info-item">
                   <span class="info-label aquila-label" data-i18n-key="settingsLabelPlayer"><i class="fas fa-user-circle"></i> Operador:</span>
                   <span class="info-value aquila-value" id="settingsPlayerName">--</span>
                </div>
                <div class="info-row aquila-info-item">
                    <span class="info-label aquila-label" data-i18n-key="settingsLabelLicense"><i class="fas fa-calendar-check"></i> Validade da Licença:</span>
                    <span class="info-value aquila-value" id="settingsLicenseExpiry">--</span>
                </div>
                 <div class="info-row aquila-info-item">
                    <span class="info-label aquila-label" data-i18n-key="settingsLabelVersion"><i class="fas fa-code-branch"></i> Versão do Protocolo:</span>
                    <span class="info-value aquila-value" id="settingsScriptVersion">--</span>
                </div>
             </div>

             <div class="settings-section aquila-section language-settings">
                 <h4 data-i18n-key="settingsSectionLanguage"><i class="fas fa-globe-americas"></i> Interface & Idioma</h4>
                 <div class="setting-item aquila-setting-item">
                      <label for="languageSelect" class="aquila-label" data-i18n-key="settingsLabelInterfaceLang"><i class="fas fa-language"></i> Idioma Tático:</label>
                      <select id="languageSelect" class="aquila-select"></select>
                      <span class="tooltip-icon" data-tooltip-key="tooltipInterfaceLang"><i class="fas fa-info-circle"></i></span>
                 </div>
             </div>

             <div class="settings-section aquila-section general-settings">
                 <h4 data-i18n-key="settingsSectionGeneral"><i class="fas fa-sliders-h"></i> Parâmetros Gerais</h4>
                 <div class="setting-item aquila-setting-item checkbox-item">
                     <input type="checkbox" class="settings-checkbox aquila-checkbox" id="closeOnHCaptchaInput">
                     <label for="closeOnHCaptchaInput" class="aquila-label checkbox-label" data-i18n-key="settingsLabelCloseOnHCaptcha"><i class="fas fa-window-close"></i> Fechar Aba no hCaptcha:</label>
                     <span class="tooltip-icon" data-tooltip-key="tooltipCloseOnHCaptcha"><i class="fas fa-info-circle"></i></span>
                 </div>
             </div>

             <div class="settings-section aquila-section pause-settings">
                 <h4 data-i18n-key="settingsSectionPause"><i class="fas fa-hourglass-half"></i> Configurações de Pausa</h4>
                 <div class="setting-item aquila-setting-item">
                     <label for="buyPauseDurationInput" class="aquila-label" data-i18n-key="settingsLabelBuyPauseDuration">
                         <i class="fas fa-shopping-cart"></i><i class="fas fa-pause-circle" style="margin-left: 4px; opacity: 0.7;"></i> Duração Pausa Compra (min):
                     </label>
                     <input type="number" class="settings-input aquila-input number-input" id="buyPauseDurationInput" min="1" step="1" placeholder="5">
                     <span class="tooltip-icon" data-tooltip-key="tooltipBuyPauseDuration"><i class="fas fa-info-circle"></i></span>
                 </div>
                 <div class="setting-item aquila-setting-item">
                     <label for="sellPauseDurationInput" class="aquila-label" data-i18n-key="settingsLabelSellPauseDuration">
                          <i class="fas fa-dollar-sign"></i><i class="fas fa-pause-circle" style="margin-left: 4px; opacity: 0.7;"></i> Duração Pausa Venda (min):
                      </label>
                     <input type="number" class="settings-input aquila-input number-input" id="sellPauseDurationInput" min="1" step="1" placeholder="5">
                     <span class="tooltip-icon" data-tooltip-key="tooltipSellPauseDuration"><i class="fas fa-info-circle"></i></span>
                 </div>
             </div>
         `;
    }

    // Registra o elemento de tooltip (que estava faltando no final)
    const tooltipElement = container.querySelector("#aquilaTooltip");
    if (tooltipElement) {
        ui.elements.set("tooltip", tooltipElement);
    } else {
         console.warn("[initializeUI] Elemento #aquilaTooltip não encontrado após renderização.");
    }


}; // --- Fim da função initializeUI (v18 Completa) ---






  const addDragAndDropListeners = (element) => {
    let isDragging = false;
    let offsetX, offsetY;
    let animationFrame = null;
    let lastX, lastY;
    let isProcessing = false;
    element.addEventListener("mousedown", (e) => {
      isDragging = true;
      const rect = element.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      element.style.cursor = "grabbing";
    });
    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        element.style.cursor = "move";
        cancelAnimationFrame(animationFrame);
        if (element.style.left && element.style.top) {
          localStorage.setItem(
            "marketContainerPosition",
            JSON.stringify({
              left: element.style.left,
              top: element.style.top
            })
          );
        }
      }
    });
    document.addEventListener("mousemove", (e) => {
      if (!isDragging || isProcessing) return;
      isProcessing = true;
      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;
      const maxX = window.innerWidth - element.offsetWidth - 10;
      const maxY = window.innerHeight - element.offsetHeight - 10;
      lastX = Math.max(0, Math.min(newX, maxX));
      lastY = Math.max(0, Math.min(newY, maxY));
      const moveElement = () => {
        animationFrame = requestAnimationFrame(() => {
          if (isDragging) {
            element.style.left = `${lastX}px`;
            element.style.top = `${lastY}px`;
            moveElement();
          }
        });
      };
      moveElement();
      e.preventDefault();
      setTimeout(() => isProcessing = false, 16);
    });
    element.addEventListener("mouseleave", () => {
      if (isDragging) {
        isDragging = false;
        element.style.cursor = "move";
        cancelAnimationFrame(animationFrame);
      }
    });
  };
  const initializeSortable = () => {
    if (typeof Sortable === "undefined") {
      return;
    }
    const buySortable = document.getElementById("buySortable");
    const sellSortable = document.getElementById("sellSortable");
    new Sortable(buySortable, {
      animation: 150,
      handle: ".resource-card",
      onEnd: (evt) => {
      }
    });
    new Sortable(sellSortable, {
      animation: 150,
      handle: ".resource-card",
      onEnd: (evt) => {
      }
    });
  };
  const getActiveWorld = () => {
    return window.location.hostname.split(".")[0];
  };
  const updateVillageInfo = () => {
    if (typeof TribalWars !== "undefined" && TribalWars.getGameData) {
      const villageData = TribalWars.getGameData().village;
      if (villageData) {
        state.currentVillage = {
          name: villageData.name,
          coordinates: villageData.coord,
          world: getActiveWorld()
        };
        ui.getElement("villageSelect").innerHTML = `<option value="current">${villageData.name} (${villageData.coord})</option>`;
        return;
      }
    }
    state.currentVillage = { name: "Desconhecido", coordinates: "N/A", world: getActiveWorld() };
    ui.getElement("villageSelect").innerHTML = `<option value="current">Carregando...</option>`;
  };
  const initializeElements = () => {
    const elementsToCache = [
      "headerTitle",
      "worldProfit",
      "buyModeToggle",
      "sellModeToggle",
      "saveConfig",
      "resetAll",
      "transactionsBtn",
      "aiAssistantBtn",
      "settingsBtn",
      "languageSelect",
      "villageSelect",
      "buyStatus",
      "sellStatus",
      "buyPause",
      "sellPause",
      "buySpinner",
      "sellSpinner",
      "notification",
      "transactionsModal",
      "transactionsTableContainer",
      "filterSection",
      "paginationControls",
      "transactionsChart",
      "closeModal",
      "aiModal",
      "aiPrompt",
      "aiResponse",
      "submitAI",
      "closeAIModal",
      "minimizeButton",
      "minimizedMarketBox",
      "settingsModal",
      "closeSettingsModal",
      "premiumPointsInput",
      "logFetchStatus" // <<< ADICIONE ESTA LINHA
    ];
    elementsToCache.forEach((id) => {
      const element = document.querySelector(`#${id}`);
      if (element) {
        ui.elements.set(id, element);
        elementCache.set(id, element);
      }
    });
    ui.elements.set("inputs", Array.from(document.querySelectorAll(".rate-input")));
    ui.elements.set("buyPerTimeInput", document.querySelector('.rate-input[data-resource="buy-per-time"]'));
    ui.elements.set("storageLimitInput", document.querySelector('.rate-input[data-resource="storage-limit"]'));
    ui.elements.set("maxSpendInput", document.querySelector('.rate-input[data-resource="max-spend"]'));
    ui.elements.set("sellLimitInput", document.querySelector('.rate-input[data-resource="sell-limit"]'));
    return Array.from(ui.elements.values()).every((el) => el !== null);
  };
  const initializeResources = () => {
    const resources2 = Object.keys(resourceConfigs).reduce((acc, name) => {
      const config = { ...resourceConfigs[name] };
      config.uiRateInput = document.querySelector(`.rate-input[data-resource="${name}"]`);
      config.uiReserveInput = document.querySelector(`.rate-input[data-resource="reserve-${name}"]`);
      config.uiReserveRateInput = document.querySelector(`.rate-input[data-resource="reserve-${name}-rate"]`);
      acc[name] = new ResourceHandler(name, config);
      return acc;
    }, {});
    Object.keys(resources2).forEach((name) => {
      ui.buyInputs.set(name, resources2[name].getBuyInput());
      ui.sellInputs.set(name, resources2[name].getSellInput());
      const buyInput = ui.buyInputs.get(name);
      if (buyInput && !buyInput.dataset.default) {
        buyInput.dataset.default = "1000";
      }
    });
    return resources2;
  };
  const updateGameElements = () => {
    ui.gameElements.set("merchants", document.querySelector("#market_merchant_available_count"));
    ui.gameElements.set("merchants", document.querySelector("#market_merchant_available_count"));
    ui.gameElements.set("calculateButton", document.querySelector("input.btn-premium-exchange-buy"));
    ui.gameElements.set("sellButton", document.querySelector("#premium_exchange_form > input"));
  };













  // Função scheduleReload ATUALIZADA (vHumanize 1.0 - Atraso Aleatório)
const scheduleReload = () => {
    if (!state.reloadPending) {
      state.reloadPending = true;
      const randomExtraDelay = Math.random() * 1500; // Adiciona até 1.5 segundos extras
      const totalDelay = 2000 + randomExtraDelay;
      console.warn(`${SCRIPT_NAME}: Agendando recarregamento da página em ${Math.round(totalDelay / 1000)} segundos devido a uma ação/erro...`); // Log ajustado
      setTimeout(() => {
        window.location.reload();
      }, totalDelay); // Usa o delay total calculado
    } else {
        // console.log(`${SCRIPT_NAME}: Recarregamento já pendente, ignorando.`);
    }
};
// --- Fim scheduleReload (vHumanize 1.0) ---











// --- FIM scheduleReload (v2 - Sempre Ativo) ---
  const notifyUser = (message, type = "success", duration = 3e3) => {
    const notification = ui.getElement("notification");
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = "block";
    notification.style.opacity = "1";
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => notification.style.display = "none", 500);
    }, duration);
  };
  const notifySuccess = (message) => notifyUser(message, "success");
  const notifyError = (message) => notifyUser(message, "error");
  const updateTheme = () => {
    state.isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const container = elementCache.get("market-container");
    container.classList.toggle("dark", state.isDarkMode);
    container.classList.toggle("light", !state.isDarkMode);
  };
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateTheme);
  const toggleMode = (mode) => {
    state[mode] = !state[mode];
    localStorage.setItem(mode, state[mode]);
    state.hasExecutedBuy = mode === "buyModeActive" && !state[mode] ? false : state.hasExecutedBuy;
    state.hasExecutedSell = mode === "sellModeActive" && !state[mode] ? false : state.hasExecutedSell;
    updateUI();
    if (state[mode]) mode === "buyModeActive" ? updateAll() : updateSell();
    else if (mode === "buyModeActive") resetBuyInputs();
  };
  let isFetching = false;
  let cachedTransactions = {};
  const checkForUpdates = async () => {
    try {
      const { transactions: firstPageTransactions } = await fetchPage(1);
      if (firstPageTransactions.length === 0) {
        return false;
      }
      const latestServerDate = firstPageTransactions[0].date;
      const currentPlayerCache = cachedTransactions[currentPlayerNickname];
      if (!currentPlayerCache || currentPlayerCache.length === 0) {
        return true;
      }
      const latestSavedDate = currentPlayerCache[0].date;
      return latestServerDate > latestSavedDate;
    } catch (error) {
      console.error("[checkForUpdates] Erro ao verificar atualiza\xE7\xF5es:", error);
      return true;
    }
  };














// ================================================================
// ===      fetchAllPagesParallel ATUALIZADA (v1.0 - Concorrência) ===
// ================================================================
/**
 * Busca todas as páginas de log de forma paralela para acelerar o processo.
 * @param {number} maxConcurrency - O número máximo de requisições simultâneas.
 * @param {number} maxPagesToFetch - O número máximo de páginas a tentar buscar.
 * @returns {Promise<Array<Object>>} - Uma Promise que resolve com a lista completa e ordenada de transações.
 */
async function fetchAllPagesParallel(maxConcurrency = 15, maxPagesToFetch = 1000) {
    let allTransactions = [];
    let activePromises = new Map(); // Mapeia Promise -> pageNum para rastrear ativas
    let currentPage = 1;
    let fetchMore = true; // Flag para parar de iniciar novas buscas se encontrarmos o fim
    const MAX_LOG_PAGES_TO_FETCH = maxPagesToFetch; // Limite máximo de segurança

    console.log(`[fetchAllPagesParallel v1] Iniciando busca paralela (concorrência: ${maxConcurrency}, limite pág: ${MAX_LOG_PAGES_TO_FETCH}).`);

    // Função interna para buscar e processar uma única página
    const fetchAndProcessPage = async (pageNum) => {
        // Não inicia a busca se já sabemos que não há mais páginas
        if (!fetchMore) return;

        try {
            // console.log(` -> [Parallel Fetch] Iniciando página ${pageNum}...`); // Log mais detalhado (opcional)
            // Chama a função fetchPage que já existe e parseia a página
            const { transactions: pageTransactions, doc } = await fetchPage(pageNum);

            if (pageTransactions && pageTransactions.length > 0) {
                // Adiciona as transações encontradas ao array principal
                // Usar push(...array) é eficiente para adicionar múltiplos itens
                allTransactions.push(...pageTransactions);
                // console.log(` -> [Parallel Fetch] Página ${pageNum} OK (${pageTransactions.length} logs). Total agora: ${allTransactions.length}`);
            } else {
                // Se fetchPage retornou vazio ou inválido, assumimos que é o fim.
                console.log(` -> [Parallel Fetch] Página ${pageNum} vazia ou inválida. Parando de buscar novas páginas.`);
                fetchMore = false; // Sinaliza para não iniciar mais buscas
            }
        } catch (error) {
            console.error(` -> [Parallel Fetch] Erro ao buscar/processar página ${pageNum}:`, error);
            // Considerar parar tudo em caso de erro? Por enquanto, apenas logamos e continuamos
            // fetchMore = false; // Descomente para parar em qualquer erro de página
        }
    };

    // Array para guardar todas as Promises iniciadas, para esperar no final
    const allLaunchedPromises = [];

    // Loop principal para gerenciar a concorrência
    while (currentPage <= MAX_LOG_PAGES_TO_FETCH && fetchMore) {
        // Espera se o limite de concorrência foi atingido
        // Entra no loop while interno APENAS se já temos o número máximo de requisições ativas
        while (activePromises.size >= maxConcurrency) {
             // console.log(` -> [Parallel Fetch] Limite de concorrência (${maxConcurrency}) atingido. Aguardando...`); // Log opcional
             // Promise.race espera pela PRIMEIRA promise ativa a ser resolvida ou rejeitada
            await Promise.race(activePromises.keys());
            // Após uma terminar, o loop 'while (activePromises.size >= maxConcurrency)' reavalia
        }

        // Verifica novamente se devemos parar (outra promise pode ter setado fetchMore = false enquanto esperávamos)
        if (!fetchMore) break;

        // Inicia a busca da próxima página
        const pageToFetch = currentPage++;
        const promise = fetchAndProcessPage(pageToFetch);
        allLaunchedPromises.push(promise); // Adiciona ao array geral
        activePromises.set(promise, pageToFetch); // Adiciona ao mapa de promises ativas

        // Quando a promise terminar (resolver ou rejeitar), remove ela do mapa de ativas
        // Isso libera espaço para a próxima iteração do loop 'while (currentPage...)'
        promise.finally(() => {
            activePromises.delete(promise);
             // console.log(` -> [Parallel Fetch] Página ${pageToFetch} concluída. Ativas: ${activePromises.size}`); // Log opcional
        });

        // Pequena pausa para não sobrecarregar o início das requisições (opcional, mas pode ajudar)
        // await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log("[fetchAllPagesParallel v1] Todas as buscas foram iniciadas. Aguardando conclusão das restantes...");
    // Espera TODAS as promises iniciadas terminarem (sejam bem-sucedidas ou com erro)
    await Promise.allSettled(allLaunchedPromises);
    console.log("[fetchAllPagesParallel v1] Todas as buscas foram concluídas.");

    // Ordena todas as transações coletadas DEPOIS que tudo terminou
    if (allTransactions.length > 0) {
        allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime()); // Mais recente primeiro
        console.log(`[fetchAllPagesParallel v1] Total final de ${allTransactions.length} transações encontradas e ordenadas.`);
    } else {
        console.log("[fetchAllPagesParallel v1] Nenhuma transação encontrada em todas as páginas buscadas.");
    }

    return allTransactions; // Retorna a lista completa e ordenada
}
// === FIM fetchAllPagesParallel ATUALIZADA (v1.0 - Concorrência) ===







// ============================================================================
// === FUNÇÃO performBackgroundSequentialFetch ATUALIZADA (v3 - Update Status) ==
// ============================================================================
/**
 * Executa busca sequencial em background com yielding e ATUALIZA INDICADOR de progresso.
 * Atualiza estado e UI APENAS NO FINAL. GERENCIA A FLAG isFetching NO FINAL.
 */
async function performBackgroundSequentialFetch() {
    console.log("[Background Fetch v3] Iniciando busca sequencial (com yielding e status)...");
    let currentPage = 1;
    const MAX_PAGES_SEQUENTIAL = 500; // Limite de segurança
    const collectedLogs = [];
    let success = false; // Flag para indicar se a busca terminou sem erros fatais
    let errorOccurred = null; // Para guardar possível erro

    // Determina mundo e chave de storage aqui, antes do loop
    const currentWorld = state.currentVillage?.world || getActiveWorld();
    if (!currentPlayerNickname || !currentWorld) {
         console.error("[Background Fetch v3] Erro CRÍTICO: Nickname ou Mundo não definidos.");
         isFetching = false; // Reseta a flag imediatamente se dados essenciais faltam
         console.log(" -> [Background Fetch v3] 'isFetching = false' (Erro Inicial).");
         return; // Aborta a função
    }
    const storageKey = `ragnarokMarketTransactions_${currentPlayerNickname}_${currentWorld}`;

    // Pega o elemento de status
    const statusElement = ui.getElement("logFetchStatus");
    const updateStatus = (page) => {
        if (statusElement) {
             try {
                 // Usa i18n.t para pegar a tradução correta
                statusElement.textContent = i18n.t('loadingHistoryPage', { page: page, defaultValue: `Carregando Histórico: Página ${page}...` });
                 statusElement.style.display = 'inline-block'; // Garante visibilidade
             } catch (e) {
                 // Fallback se i18n falhar
                 statusElement.textContent = `Carregando Página ${page}...`;
                 statusElement.style.display = 'inline-block';
             }
         } else {
              console.warn("[Background Fetch v3] Elemento de status #logFetchStatus não encontrado na UI.");
         }
     };
    updateStatus(currentPage); // Mostra status inicial "Página 1..."

    try { // try...finally GERAL para garantir o reset do isFetching e esconder status
        while (currentPage <= MAX_PAGES_SEQUENTIAL) {
            // Atualiza o status antes de buscar
            updateStatus(currentPage);
             console.log(`  [Background Fetch v3] Preparando para buscar Página ${currentPage}...`);

            // --- Busca da Página ---
            let pageTransactions = null;
            try {
                // fetchPage já retorna { transactions, doc } ou lança erro
                const fetchResult = await fetchPage(currentPage); // Espera o fetch/parse
                pageTransactions = fetchResult?.transactions; // Pega só as transações
                 console.log(`   -> Fetch/Parse Página ${currentPage} concluído.`);
            } catch (fetchError) {
                console.error(` -> Erro DURANTE fetchPage/parse da Página ${currentPage}:`, fetchError);
                errorOccurred = fetchError; // Guarda o erro
                console.warn(" -> Busca sequencial INTERROMPIDA devido a erro no fetch/parse.");
                success = false; // Marca falha
                break; // Para o loop while
            }

            // --- Processamento do Resultado ---
            if (pageTransactions && pageTransactions.length > 0) {
                console.log(`   -> Página ${currentPage} OK: ${pageTransactions.length} logs. Adicionando.`);
                collectedLogs.push(...pageTransactions); // Adiciona ao array principal

                // --- Micro-Pausa (Yielding) ---
                 // console.log("   -> Yielding (pausa 0ms) para liberar UI...");
                await new Promise(resolveYield => setTimeout(resolveYield, 0)); // << Yield!

                currentPage++; // Incrementa para a próxima página

                // --- Pausa MAIOR entre páginas ---
                const delay = 300 + Math.random() * 200; // 300-500ms
                 // console.log(`   -> Aguardando ${Math.round(delay)}ms antes da próxima página...`);
                await new Promise(resolveDelay => setTimeout(resolveDelay, delay));

            } else {
                 console.log(` -> [Background Fetch v3] Página ${currentPage} vazia ou fim. Parando busca.`);
                success = true; // Terminou normalmente sem erros
                break; // Sai do loop
            }
        } // Fim while

        if (currentPage > MAX_PAGES_SEQUENTIAL) {
            console.warn(`[Background Fetch v3] Limite de ${MAX_PAGES_SEQUENTIAL} páginas atingido.`);
            success = true; // Considera sucesso parcial se atingir o limite
        }

    } catch (loopError) { // Pega erros inesperados do próprio loop (difícil acontecer)
        console.error("[Background Fetch v3] ERRO INESPERADO no loop principal:", loopError);
        errorOccurred = loopError; // Guarda o erro
        success = false;
    } finally { // Este finally executa DEPOIS do try/catch do loop while
        const finalMessage = `[Background Fetch v3] Fase de busca CONCLUÍDA. ${success ? 'SUCESSO' : 'FALHA'}. ${errorOccurred ? `Erro: ${errorOccurred.message}` : ''} Logs coletados: ${collectedLogs.length}`;
         console.log(finalMessage);

         // *** Esconde o indicador de status AGORA ***
         if (statusElement) {
             statusElement.style.display = 'none';
             statusElement.textContent = ''; // Limpa o texto
              console.log(" -> Indicador de status escondido.");
         }

         // --- Atualização FINAL do Estado e Cache ---
         // Só atualiza se a busca foi considerada um sucesso (terminou ou atingiu limite sem erro fatal)
         if (success) {
              console.log("[Background Fetch v3] Atualizando estado e salvando cache...");
             // Ordena antes de atualizar/salvar
             if (collectedLogs.length > 0) {
                  collectedLogs.sort((a, b) => b.date.getTime() - a.date.getTime());
             }
             // Atualiza MobX com resultado final
             mobx.runInAction(() => {
                 state.transactions.replace(collectedLogs);
                 state.allTransactionsFetched = true; // Marca como COMPLETO
                 state.worldProfit = calculateWorldProfit(); // Calcula lucro final
                  console.log(` -> [Background Fetch v3] State Final -> Logs: ${state.transactions.length}, Completo: ${state.allTransactionsFetched}, Lucro: ${state.worldProfit}`);
             });
             // Salva Cache final COM a flag allLogsFetched: true
             const finalPPForSave = getAvailablePremiumPoints();
             const logsToSave = collectedLogs.map(t => ({ ...t, date: t.date.toISOString() }));
             const dataToSave = { transactions: logsToSave, lastKnownPP: finalPPForSave, allLogsFetched: true }; // <<<< Salva flag
             try {
                 const compressedData = LZString.compress(JSON.stringify(dataToSave));
                 if (compressedData) localStorage.setItem(storageKey, compressedData);
                 else console.error(" -> [BG Fetch v3] Compressão nula ao salvar.");
                  console.log(` -> [Background Fetch v3] Cache final SALVO.`);
             } catch (saveError) {
                 console.error(" -> [Background Fetch v3] Erro ao salvar cache final:", saveError);
             }
             // Notifica sucesso se quiser (opcional)
             // notifySuccess("Histórico de transações carregado com sucesso em segundo plano.");
          } else { // Se houve erro durante a busca
             console.error("[Background Fetch v3] Finalizando com ERRO. Estado não será atualizado com logs parciais/corrompidos.");
              // Garante que o state reflita a falha de estar completo
              mobx.runInAction(() => {
                 state.allTransactionsFetched = false;
                 // Poderia reverter para um cache antigo se guardássemos, ou deixar como está.
                 // Recalcula o lucro com o que TEM no state (pode ser antigo/vazio)
                 state.worldProfit = calculateWorldProfit();
              });
             notifyError("Erro ao carregar histórico completo. Tente recarregar a página."); // Avisa o usuário
          }

          // Atualiza a UI UMA VEZ NO FINAL (para refletir lucro correto ou estado de erro)
          updateUI();
           console.log("[Background Fetch v3] Chamada final updateUI feita.");

          // ---- SEMPRE redefine isFetching no final ----
          isFetching = false;
           console.log(" -> [Background Fetch v3] Marcado como 'isFetching = false' (finally).");
           console.log(`[DEBUG Background Fetch v3] ===== FIM @ ${new Date().toLocaleTimeString()} =====\n`);
    } // Fim finally
}










// ==================================================================================
// === fetchPremiumLogs ATUALIZADA (v20.1 - Corrige Escopo em finalizeAndUpdate) ===
// ==================================================================================
/**
 * Ponto de entrada para buscar logs. Prioriza cache. Se PP Mismatch, verifica P1 primeiro
 * antes de decidir pela busca completa em background.
 * Corrige o escopo da variável 'storageKey' dentro de 'finalizeAndUpdate'.
*/
const fetchPremiumLogs = (forceFullFetch = false) => {
    // 1. Checa se JÁ está buscando
    if (isFetching) {
        console.log("[fetchPremiumLogs v20.1] Busca já em andamento. Retornando estado atual.");
        return Promise.resolve(mobx.toJS(state.transactions)); // Retorna o que temos
    }

    // 2. Marca como buscando (será resetado no finally da Promise principal OU da P1 check)
    isFetching = true;
    console.log(" -> [fetchPremiumLogs v20.1] Marcado como 'isFetching = true'.");

    // Retorna a Promise que fará o trabalho
    return new Promise(async (resolve, reject) => {
        let needsFullFetch = false;             // Flag final se precisa de busca completa BG
        let fetchCacheReason = "N/A";           // Motivo da decisão
        let localFinalTransactions = [];      // Transações a serem usadas/retornadas
        let cacheAlreadyComplete = false;     // Flag lida do cache
        let cachedPP = null;                    // PP lido do cache

        const statusElement = ui.getElement("logFetchStatus"); // Elemento de status

        // --- Define storageKey AQUI no escopo principal da Promise ---
        let storageKey = ''; // Inicializa - Será definida após validar Nick/Mundo

        // ==============================================================
        // === Helper finalizeAndUpdate - AGORA ACEITA storageKey ========
        // ==============================================================
        const finalizeAndUpdate = (storageKeyToUse, successMessage) => {
             // Verifica se recebeu uma storageKey válida
            if (!storageKeyToUse || typeof storageKeyToUse !== 'string' || storageKeyToUse === '') {
                console.error("[finalizeAndUpdate] Erro: storageKey inválida recebida:", storageKeyToUse);
                // Pode optar por rejeitar ou apenas logar e tentar continuar sem salvar.
                // Por segurança, tentaremos continuar mas sem salvar cache.
                 try {
                     const currentProfit = calculateWorldProfit();
                     mobx.runInAction(() => { state.worldProfit = currentProfit });
                      console.log(` -> Lucro calculado (${fetchCacheReason}): ${currentProfit} (Sem salvar cache devido a erro na chave)`);
                     updateUI();
                     console.log(`[DEBUG fetchPremiumLogs v20.1 Inner] ===== FIM (${successMessage} - ERRO CHAVE CACHE) @ ${new Date().toLocaleTimeString()} =====\n`);
                     resolve(mobx.toJS(state.transactions));
                 } catch (e) {
                     console.error("[finalizeAndUpdate] Erro secundário ao tentar finalizar sem salvar:", e);
                     reject(e); // Rejeita a promise externa se o finalize falhar
                 }
                 return; // Importante sair aqui
             }

             // Prossegue se a chave for válida
            const currentProfit = calculateWorldProfit(); // Recalcula com os dados finais no state
            mobx.runInAction(() => { state.worldProfit = currentProfit });
             console.log(` -> Lucro calculado (${fetchCacheReason}): ${currentProfit}`);
            updateUI(); // Atualiza UI

            // Salva o estado final no cache usando storageKeyToUse
            const finalPPForSave = getAvailablePremiumPoints();
            // Garante que as transações no state sejam as mais recentes para salvar
            const currentLogsInState = mobx.toJS(state.transactions);
            const logsToSave = currentLogsInState.map(t => ({ ...t, date: t.date.toISOString() }));
            // A flag 'allLogsFetched' reflete se a busca completa foi concluída (ou se PP bateu + cache completo)
            const dataToSave = { transactions: logsToSave, lastKnownPP: finalPPForSave, allLogsFetched: state.allTransactionsFetched };
            try {
                const compressedData = LZString.compress(JSON.stringify(dataToSave));
                // *** USA storageKeyToUse ***
                if (compressedData) {
                     localStorage.setItem(storageKeyToUse, compressedData);
                     console.log(` -> Cache salvo (${currentLogsInState.length} logs, PP:${finalPPForSave}, Completo:${state.allTransactionsFetched}) usando a chave: ${storageKeyToUse}`);
                 } else {
                      console.error(" -> Compressão nula ao salvar cache.");
                 }
            } catch (saveError) {
                 console.error(` -> Erro ao salvar cache (Chave: ${storageKeyToUse}):`, saveError);
            }

             console.log(`[DEBUG fetchPremiumLogs v20.1 Inner] ===== FIM (${successMessage}) @ ${new Date().toLocaleTimeString()} =====\n`);
            resolve(mobx.toJS(state.transactions)); // Resolve com o estado final
        };
        // ==============================================================
        // === Fim Helper finalizeAndUpdate =============================
        // ==============================================================


        try { // Try principal para toda a lógica
            // --- Validações Iniciais e Definição de storageKey ---
            if (!currentPlayerNickname) throw new Error("Nickname não identificado.");
            const currentWorld = state.currentVillage?.world || getActiveWorld();
            if (!currentWorld) throw new Error("Mundo não identificado.");
            // *** Define storageKey AGORA que currentWorld é válido ***
            storageKey = `ragnarokMarketTransactions_${currentPlayerNickname}_${currentWorld}`; // AQUI!

            console.log(`\n[DEBUG fetchPremiumLogs v20.1 Inner] ===== INÍCIO @ ${new Date().toLocaleTimeString()} =====`);
            console.log(` -> Jogador: ${currentPlayerNickname}, Mundo: ${currentWorld}, Forçar: ${forceFullFetch}, Chave: ${storageKey}`); // Loga a chave definida

            // --- Carrega Cache ---
             if (!forceFullFetch) {
                const savedDataCompressed = localStorage.getItem(storageKey); // Usa a chave definida
                 if (savedDataCompressed) {
                     console.log(" -> Cache encontrado.");
                      try { // Parse do cache
                         const decompressed = LZString.decompress(savedDataCompressed);
                         if (!decompressed) throw new Error("Descompressão nula");
                         const savedDataObject = JSON.parse(decompressed);
                         if (savedDataObject && Array.isArray(savedDataObject.transactions) && typeof savedDataObject.lastKnownPP === 'number') {
                             cachedPP = savedDataObject.lastKnownPP;
                             localFinalTransactions = savedDataObject.transactions.map(t => ({ ...t, date: new Date(t.date) }));
                             mobx.runInAction(() => { state.transactions.replace(localFinalTransactions); });
                             cacheAlreadyComplete = savedDataObject.allLogsFetched === true;
                              console.log(` -> Cache carregado: ${localFinalTransactions.length} logs. PP: ${cachedPP}. Completo? ${cacheAlreadyComplete}`);
                         } else { throw new Error("Estrutura cache inválida."); }
                      } catch (e) { // Erro no parse
                           console.error(` -> Erro cache: ${e.message}. Removendo.`); localStorage.removeItem(storageKey); // Usa a chave definida
                           localFinalTransactions = []; mobx.runInAction(() => { state.transactions.replace([]); state.allTransactionsFetched = false; });
                           needsFullFetch = true; fetchCacheReason = "Erro Cache"; cacheAlreadyComplete = false;
                       }
                 } else { // Sem cache salvo
                      console.log(" -> Nenhum cache."); needsFullFetch = true; fetchCacheReason = "Sem Cache";
                      mobx.runInAction(() => { state.allTransactionsFetched = false; }); localFinalTransactions = []; cacheAlreadyComplete = false;
                 }
             } else { // Busca completa forçada
                 console.log(" -> Busca Completa forçada."); needsFullFetch = true; fetchCacheReason = "Forçada";
                 mobx.runInAction(() => { state.transactions.replace([]); state.allTransactionsFetched = false; }); localFinalTransactions = []; cacheAlreadyComplete = false;
             }

            // --- Lógica de Decisão (Mesma da v20) ---
            const currentPP = getAvailablePremiumPoints();

            if (!needsFullFetch && cachedPP !== null) { // Se temos cache
                console.log(` -> Verificando PP: Salvo=${cachedPP}, Atual=${currentPP}`);

                if (cachedPP === currentPP) { // ---- PP Bate ----
                    if (cacheAlreadyComplete) { // ---- CENÁRIO 1.1: PP OK & Cache Completo ----
                        console.log(" -> PP OK e Cache Completo."); fetchCacheReason = "PP OK & Cache Completo";
                        mobx.runInAction(() => { state.allTransactionsFetched = true; });
                         // *** Passa a storageKey válida para finalizeAndUpdate ***
                        finalizeAndUpdate(storageKey, "Cache Completo OK"); // <<< Passa a chave AQUI
                         return; // Sai da Promise

                    } else { // ---- CENÁRIO 1.2: PP OK & Cache INCOMPLETO ----
                        console.warn(` -> PP OK, mas cache não completo. Iniciando busca BG.`); needsFullFetch = true;
                        fetchCacheReason = "PP OK, Cache Incompleto";
                        mobx.runInAction(() => { state.allTransactionsFetched = false; });
                    }
                } else { // ---- CENÁRIO 2: PP NÃO Bate -> Checa P1 ----
                     console.warn(` -> PP NÃO BATEU! Checando Página 1...`); fetchCacheReason = "PP Mismatch - Check P1";
                     mobx.runInAction(() => { state.allTransactionsFetched = false; });

                     let firstPageTransactions = null; let fetchP1Error = null;
                     try { // Busca P1
                         console.log("   -> Buscando Página 1...");
                         if (statusElement) { /* ... */ try{statusElement.textContent=i18n.t('loadingHistoryPage', { page: 1 }); statusElement.style.display='inline-block';}catch(e){} }
                          const { transactions: p1 } = await fetchPage(1);
                          if (statusElement) { /* ... */ }
                         firstPageTransactions = p1 || [];
                          console.log(`   -> P1 retornou ${firstPageTransactions.length} logs.`);
                      } catch (error) { /* ... */ fetchP1Error = error; }

                     if (fetchP1Error || !firstPageTransactions) { // Falha P1 -> Busca BG
                         console.error("   -> Falha Página 1. Iniciando busca completa BG."); needsFullFetch = true;
                         fetchCacheReason = "PP Mismatch - P1 Falhou";
                         mobx.runInAction(() => { state.transactions.replace([]); }); localFinalTransactions = [];

                     } else { // P1 OK -> Mescla e re-checa
                         console.log("   -> Mesclando P1 e recalculando PP esperado...");
                         const cachedSignatures = new Set(localFinalTransactions.map(t => `${t.date.toISOString()}_${t.change}_${t.type}_${t.newPremiumPoints}`));
                         const newTransactions = firstPageTransactions.filter(t => !cachedSignatures.has(`${t.date.toISOString()}_${t.change}_${t.type}_${t.newPremiumPoints}`));
                         console.log(`    -> Novas da P1: ${newTransactions.length}`);
                         const netChangeFromNew = newTransactions.reduce((sum, t) => sum + (t.change || 0), 0);
                         const expectedPPAfterMerge = cachedPP + netChangeFromNew;
                         console.log(`    -> Mudança P1: ${netChangeFromNew}. PP Esperado: ${expectedPPAfterMerge}. PP Atual: ${currentPP}`);

                         if (expectedPPAfterMerge === currentPP) { // SUB-CENÁRIO 2.1: P1 CORRIGIU
                             console.log("    -> SUCESSO! P1 corrigiu PP."); fetchCacheReason = "PP Mismatch - P1 Corrigiu";
                             needsFullFetch = false; // NÃO precisa busca BG
                             if (newTransactions.length > 0) {
                                 localFinalTransactions = [...newTransactions, ...localFinalTransactions];
                                 localFinalTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
                                 mobx.runInAction(() => { state.transactions.replace(localFinalTransactions); });
                             }
                             mobx.runInAction(() => { state.allTransactionsFetched = false; });
                              // *** Passa a storageKey válida para finalizeAndUpdate ***
                             finalizeAndUpdate(storageKey, "P1 Corrigiu PP"); // <<< Passa a chave AQUI
                             return; // Sai

                         } else { // SUB-CENÁRIO 2.2: P1 NÃO CORRIGIU -> Busca BG
                              console.warn(`    -> FALHA! Pós-P1 PP(${expectedPPAfterMerge}) != Atual(${currentPP}). Iniciando busca BG.`);
                              needsFullFetch = true; fetchCacheReason = "PP Mismatch - P1 Insuficiente";
                              mobx.runInAction(() => { state.transactions.replace([]); state.allTransactionsFetched = false; }); localFinalTransactions = [];
                          }
                      } // Fim tratamento P1 OK
                 } // Fim PP Mismatch
            } // Fim validação de cache existente

            // --- Dispara Busca em Background (se needsFullFetch for true) ---
            if (needsFullFetch) {
                  console.log(`\n -> [fetchPremiumLogs v20.1] DISPARANDO busca BG (Razão: ${fetchCacheReason}).`);
                  if (statusElement) { /*(Código status)*/ try{statusElement.textContent=i18n.t('loadingHistoryPage', { page: 1 }); statusElement.style.display='inline-block';}catch(e){} }
                  performBackgroundSequentialFetch(); // Chama SEM await
                  console.log(" -> [fetchPremiumLogs v20.1] Função de background iniciada.");
                   console.log(`[DEBUG fetchPremiumLogs v20.1 Inner] ===== FIM (BG Iniciado) @ ${new Date().toLocaleTimeString()} =====\n`);
                  resolve(mobx.toJS(state.transactions)); // Resolve com o que tem
                  return; // Sai
              }

             // Segurança: Fluxo inesperado
             console.warn("[fetchPremiumLogs v20.1] Fluxo inesperado final.");
              // *** Passa a storageKey válida para finalizeAndUpdate ***
              finalizeAndUpdate(storageKey, "Fluxo Inesperado"); // <<< Passa a chave AQUI

        } catch (error) { // Pega erros GERAIS da lógica ANTES de iniciar BG ou finalizar com cache
              console.error(`[fetchPremiumLogs v20.1 Inner] Erro GERAL:`, error);
              mobx.runInAction(() => { state.worldProfit = 0; state.allTransactionsFetched = false; state.transactions.replace([]); });
              updateUI();
              reject(error); // Rejeita a promise externa
          } finally {
              // --- Reset do isFetching ---
              // Será resetado por performBackgroundSequentialFetch ou por finalizeAndUpdate.
              if (isFetching) {
                  if(needsFullFetch){
                       console.log("[fetchPremiumLogs v20.1 - finally] 'isFetching' será resetado pela tarefa de background.");
                  } else {
                       console.warn("[fetchPremiumLogs v20.1 - finally] Resetando 'isFetching' (Não iniciou BG ou falha prévia).");
                      isFetching = false; // Garante o reset aqui se não iniciou BG
                  }
              }
          }
    }); // Fim da Promise principal
};
// === FIM fetchPremiumLogs ATUALIZADA (v20.1 - Corrige Escopo em finalizeAndUpdate) ===



// Função fetchPage ATUALIZADA (v30 - Turkish Keywords)
async function fetchPage(pageNum = 1) {
    const gameData = TribalWars.getGameData ? TribalWars.getGameData() : {};
    const villageId = gameData.village?.id || null;
    if (!villageId) {
      throw new Error("ID da vila não encontrado no gameData");
    }
    const baseUrl = `${window.location.origin}/game.php?village=${villageId}&screen=premium&mode=log`;
    const url = pageNum <= 1 ? baseUrl : `${baseUrl}&page=${pageNum - 1}`;

    console.log(`[fetchPage v30 - TR Keywords] Buscando logs da URL: ${url}`);

    try {
      const response = await fetchMarketData(url);
      if (!response) {
        throw new Error("Falha ao buscar logs premium (resposta vazia)");
      }
      const doc = new DOMParser().parseFromString(response, "text/html");
      const contentValue = doc.querySelector("#content_value");
      if (!contentValue) {
        console.warn(`[fetchPage v30 - TR Keywords] Elemento #content_value não encontrado.`);
        throw new Error("Não foi possível encontrar o elemento #content_value na resposta");
      }

      let transactionTable = null;
      const specificTable = doc.querySelector('#premium_log_list table.vis');
      if (specificTable) {
          console.log(`[fetchPage v30 - TR Keywords] Tabela encontrada por ID específico (#premium_log_list).`);
          transactionTable = specificTable;
      } else {
          const tables = contentValue.querySelectorAll("table.vis");
          console.log(`[fetchPage v30 - TR Keywords] Busca por ID falhou. Encontradas ${tables.length} tabelas com classe 'vis'. Verificando cabeçalhos...`);

          for (let i = 0; i < tables.length; i++) {
            const table = tables[i];
            const thElements = table.querySelectorAll("th");
            if (thElements.length < 4) {
                 console.log(`[fetchPage v30 - TR Keywords] Tabela ${i+1} tem menos de 4 cabeçalhos. Pulando.`);
                 continue;
            }
            const rawHeaders = Array.from(thElements).map(th => th.textContent.trim());
            // Normaliza: minúsculas, remove espaços extras, remove ':' no final
            // ATENÇÃO: toLowerCase() pode não funcionar corretamente com 'İ' turco se o locale não for TR.
            // Vamos tentar manter o 'i̇' pontilhado como veio do log para a comparação.
            const headers = rawHeaders.map(h => h.toLowerCase().replace(/\s+/g, ' ').replace(/:$/, '').trim());
            const columnCount = headers.length;

            console.log(`[fetchPage v30 - TR Keywords] Cabeçalhos Limpos Tabela ${i+1}:`, headers);

            // === INÍCIO: ATUALIZAÇÃO DAS PALAVRAS-CHAVE TURCAS ===
            const essentialKeys = {
                // Adiciona 'tarih'
                date: ["date", "data", "дата", "dátum", "datum", "tarih", "fecha", "التاريخ", "ημερομηνία"],
                // Adiciona 'dünya'
                world: ["world", "mondo", "świat", "mundo", "мир", "svet", "wäut", "dünya", "welt", "svět", "wereld", "monde", "العالم", "عالم", "κόσμος", "világ"],
                // Adiciona 'işlem' e 'i̇şlem' (com i pontilhado)
                transaction: ["transaction", "transacción", "transaktion", "transakcja", "transação", "действие", "işlem", "i̇şlem", "beschreibung", "descrizione", "popis", "transakce", "omschrijving", "description", "opération", "descripción", "المعاملة", "العمليات", "transactie", "περιγραφή", "συναλλαγή", "tranzakció", "leírás"],
                // Adiciona 'değişim'
                change: ["change", "alterar", "mudança", "zmiana", "изменение", "änderig", "änderung", "variazione", "cambio", "cambiamento", "değişim", "zmena", "změna", "wijziging", "modification", "changement", "التغيير", "تغيير", "αλλαγή", "változás", "modifica"],
            };
            // === FIM: ATUALIZAÇÃO DAS PALAVRAS-CHAVE TURCAS ===

            const hasDate = headers.some(h => essentialKeys.date.includes(h)); // Deve achar 'tarih'
            const hasWorld = headers.some(h => essentialKeys.world.includes(h)); // Deve achar 'dünya'
            const hasTransaction = headers.some(h => essentialKeys.transaction.includes(h)); // Deve achar 'i̇şlem' ou 'işlem'
            const hasChange = headers.some(h => essentialKeys.change.includes(h)); // Deve achar 'değişim'

            console.log(`[fetchPage v30 - TR Keywords] Tabela ${i+1} Checks: Tarih=${hasDate}, Dünya=${hasWorld}, İşlem=${hasTransaction}, Değişim=${hasChange}, Colunas=${columnCount}`); // Log atualizado

            // Condição Principal: Tarih, Dünya e İşlem/Transação
            if (columnCount >= 4 && hasDate && hasWorld && hasTransaction) {
                transactionTable = table;
                console.log(`[fetchPage v30 - TR Keywords] Tabela ${i+1} SELECIONADA (Critério Principal: Tarih, Dünya, İşlem OK).`);
                break;
            }
            // Condição Fallback: Tarih, Dünya e Değişim/Change
            else if (columnCount >= 4 && hasDate && hasWorld && hasChange) {
                transactionTable = table;
                 console.log(`[fetchPage v30 - TR Keywords] Tabela ${i+1} SELECIONADA (Critério Fallback: Tarih, Dünya, Değişim OK).`);
                 break;
            }
          }
      }

      let transactions = [];
      if (transactionTable) {
        const rows = Array.from(transactionTable.querySelectorAll("tr:not(:first-child)"));
        const dataRows = rows.filter(row => row.querySelector('td'));
        console.log(`[fetchPage v30 - TR Keywords] Tabela encontrada. ${dataRows.length} linhas de dados (com <td>) encontradas.`);

        if (dataRows.length > 0) {
            console.log(`[fetchPage v30 - TR Keywords] Passando ${dataRows.length} linhas para parseTransactions...`);
            transactions = parseTransactions(dataRows); // Chama parseTransactions (v21 ainda)
            console.log(`[fetchPage v30 - TR Keywords] parseTransactions retornou ${transactions.length} transações.`);
        } else {
             console.log(`[fetchPage v30 - TR Keywords] Nenhuma linha de dados encontrada na tabela para passar para parseTransactions.`);
        }
      } else {
         console.warn("[fetchPage v30 - TR Keywords] Nenhuma tabela de transações adequada foi encontrada nesta página.");
      }

      return { transactions, doc };

    } catch (error) {
       console.error(`[fetchPage v30 - TR Keywords] Erro ao buscar/processar URL ${url}:`, error);
       throw error;
    }
}
// === FIM fetchPage ATUALIZADA (v30 - Turkish Keywords) ===







// FUNÇÃO parseDate ATUALIZADA (v30 - Greek Format and Locale)
const parseDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return new Date(NaN);
    // === INÍCIO ATUALIZAÇÃO GREGO ===
    const locales = ["el-GR", "tr-TR", "de-CH", "de-DE", "sk-SK", "ru-RU", "pt-PT", "pt-BR", "pl-PL", "it-IT", "hu-HU", "en-GB", "en-US", "nl", "ar", "es", "fr", "cs"]; // Adicionado el-GR no início
    // === FIM ATUALIZAÇÃO GREGO ===

    // === INÍCIO ATUALIZAÇÃO FORMATO GREGO ===
    const formatStrings = [
        "MMM dd,yyyy HH:mm",   // Formato Grego Específico (sem espaço após vírgula)
        "dd MMM yyyy HH:mm",   // Outro formato grego comum? (Dia Mês Ano)
        "dd/MM/yyyy HH:mm",    // Formato Grego com barras
        "dd.MMM., HH:mm",      // Formato Suíço Específico
        "dd.MM.yyyy HH:mm",    // DE/CH/SK/CZ/RU/PT/PL/HU etc.
        "d MMMM yyyy HH:mm",   // IT/ES/PT? com nome completo
        "dd/MMM/yyyy (HH:mm)", // PT/BR?
        "MMM dd, yyyy HH:mm",  // IT/RU? com espaço após vírgula
        "yyyy.MM.dd HH:mm",    // HU alt
        "dd/MM/yy HH:mm:ss",   // GR ano curto segs?
        "dd/MM/yyyy HH:mm:ss", // GR ano longo segs?
        "MM/dd/yyyy HH:mm",    // US
        "dd-MM-yyyy HH:mm",    // NL
        "dd/MM, HH:mm",        // AE sem ano
        "yyyy/MM/dd HH:mm",    // AE alt
        "dd.MMMM.yyyy HH:mm",  // AE nome mês
        "MMMM d,yyyy HH:mm",   // FR?
        "dd.MM.yy HH:mm",      // DE/CH/CS/NL/PL/RU/SK? ano curto
        "dd/MM/yy HH:mm",      // ES/FR/IT ano curto
        "d MMM yy HH:mm",      // FR alt? ano curto
        "dd. MM. yyyy HH:mm",  // Com espaço
        "dd.MM. HH:mm",        // DE antigo?
        "LLL dd, HH:mm",       // EN/PT/RU? sem ano
        "d MMM HH:mm",         // NL?/EN sem ano
        "yyyy-MM-dd HH:mm:ss"  // ISO
    ];
    // === FIM ATUALIZAÇÃO FORMATO GREGO ===

    let parsedDate = null;
    let success = false;
    let usedFormat = '';
    let usedLocale = '';

    Loop:
    for (const format of formatStrings) {
        for (const locale of locales) {
            let processedDateStr = dateStr;
            let formatToUse = format;
            // Pré-processamento específico para formato suíço
            if (format === "dd.MMM., HH:mm") {
                processedDateStr = dateStr.replace(/(\d{2}\.\w{3})\.,/, '$1');
                formatToUse = format.replace('.,', '');
            }
            // Pré-processamento para formato grego sem espaço (remove a vírgula antes de parsear)
            // O formato em si já está sem espaço, só precisamos garantir que Luxon entenda MMM dd yyyy
            else if (format === "MMM dd,yyyy HH:mm") {
                 // Remove a vírgula para ajudar Luxon
                 processedDateStr = dateStr.replace(/(\s\d{1,2}),(\d{4})/, '$1 $2'); // Adiciona espaço se não houver
                 formatToUse = "MMM dd, yyyy HH:mm"; // Usa o formato COM espaço para Luxon
                 // console.log(`[parseDate v30 - DEBUG] Preprocessed GR date "${dateStr}" to "${processedDateStr}" for format "${formatToUse}"`);
            }


            parsedDate = DateTime.fromFormat(processedDateStr, formatToUse, { locale });

            if (parsedDate.isValid) {
                 // console.log(`[parseDate v30 - DEBUG] Parsed "${processedDateStr}" (original: "${dateStr}") using locale '${locale}' with format '${formatToUse}'`);
                success = true;
                usedFormat = format; // Guarda o formato original
                usedLocale = locale;
                break Loop;
            }
        }
    }

    if (!success || !parsedDate || !parsedDate.isValid) {
        console.warn(`[parseDate v30 - DEBUG] Failed to parse date string "${dateStr}" with known formats/locales.`);
        return new Date(NaN);
    }

    // Ajuste do Ano (lógica mantida)
    const now = DateTime.now();
    let date = parsedDate;
     if (!usedFormat.includes('y')) { // Se o formato original não tinha ano
        date = date.set({ year: now.year });
        if (date > now) { date = date.set({ year: now.year - 1}); }
    }
    else if (usedFormat.includes('yy') && !usedFormat.includes('yyyy')) { // Se tinha ano curto
        let dateWithCurrentCentury = date.set({ year: Math.floor(now.year / 100) * 100 + date.year % 100 });
        if (dateWithCurrentCentury > now) { date = dateWithCurrentCentury.set({ year: dateWithCurrentCentury.year - 100 }); }
        else { date = dateWithCurrentCentury; }
        if (now.month < date.month && date.year === now.year){ date = date.set({ year: now.year -1}); }
    }

    return date.toJSDate();
}
// === FIM parseDate ATUALIZADA (v30 - Greek Format and Locale) ===
















// FUNÇÃO parseTransactions ATUALIZADA (v28 - Greek Server & Keywords) - COMPLETA
const parseTransactions = (rows) => {
    console.log(`[parseTransactions v28 - GR Server Support] Iniciando parseamento de ${rows.length} linhas.`); // Mantido o log da última versão funcional
    const transactions = [];
    const hostname = window.location.hostname;
    let serverCode = hostname.split('.')[0]; // Padrão: pega o primeiro subdomínio

    // Detecção de serverCode refinada
    if (hostname.includes("tribalwars.com.br")) serverCode = "br";
    else if (hostname.includes("tribalwars.com.pt")) serverCode = "pt";
    else if (hostname.includes("voynaplemyon.com")) serverCode = "ru";
    else if (hostname.includes("divoke-kmene.sk")) serverCode = "sk";
    else if (hostname.includes("divokekmeny.cz")) serverCode = "cs";
    else if (hostname.includes("staemme.ch")) serverCode = "ch";
    else if (hostname.includes("die-staemme.de")) serverCode = "de";
    else if (hostname.includes("klanlar.org")) serverCode = "tr";
    else if (hostname.includes("fyletikesmaxes.gr")) serverCode = "gr"; // Adicionado GR
    else if (hostname.includes("tribalwars.us")) serverCode = "us";
    else if (hostname.includes("tribalwars.co.uk")) serverCode = "uk";
    else if (hostname.includes("tribalwars.nl")) serverCode = "nl";
    else if (hostname.includes("guerretribale.fr")) serverCode = "fr";
    else if (hostname.includes("tribals.it")) serverCode = "it";
    else if (hostname.includes("plemiona.pl")) serverCode = "pl";
    else if (hostname.includes("guerrastribales.es")) serverCode = "es";
    else if (hostname.includes("tribalwars.ae")) serverCode = "ae";
    else if (hostname.includes("klanhaboru.hu")) serverCode = "hu";
    // tribalwars.works e tribalwars.net já são cobertos pelo padrão inicial

    console.log(` -> ServerCode detectado: ${serverCode}`);

    rows.forEach((row, index) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 5) {
        try {
            const dateStr = cells[0]?.textContent?.trim();
            // Chama a função parseDate (que deve ser a v30 ou posterior para incluir GR)
            const date = parseDate(dateStr);

            if (isNaN(date.getTime())) {
                 console.warn(`[parseTransactions v28] Linha ${index}: FALHA DATA: "${dateStr}"`);
                 return; // Pula esta linha se a data for inválida
            }

            // Lógica de Mundo Robusta (Extrai número e junta com serverCode)
            const displayedWorldText = cells[1]?.textContent?.trim() || '';
            let worldIdentifier = 'UnknownWorld'; // Default genérico
            // Define fallback baseado no serverCode para mensagens de erro
            switch(serverCode) {
                case 'gr': worldIdentifier = 'ΆγνωστοςΚόσμος'; break;
                case 'tr': worldIdentifier = 'DünyaBilinmiyor'; break;
                case 'sk': worldIdentifier = 'SvetNeznámy'; break;
                case 'cs': worldIdentifier = 'SvětNeznámý'; break;
                case 'ch':
                case 'de': worldIdentifier = 'WeltUnbekannt'; break;
                case 'ru': worldIdentifier = 'МирНеизвестен'; break;
                case 'pt':
                case 'br': worldIdentifier = 'MundoDesconhecido'; break;
                case 'it': worldIdentifier = 'MondoSconosciuto'; break;
                case 'pl': worldIdentifier = 'ŚwiatNieznany'; break;
                case 'es': worldIdentifier = 'MundoDesconocido'; break;
                case 'fr': worldIdentifier = 'MondeInconnu'; break;
                case 'nl': worldIdentifier = 'WereldOnbekend'; break;
                case 'hu': worldIdentifier = 'VilágIsmeretlen'; break;
                case 'ae': worldIdentifier = 'عالم غير معروف'; break;
            }
            const worldNumberMatch = displayedWorldText.match(/(\d+)/); // Pega a primeira sequência de números
            if (worldNumberMatch && worldNumberMatch[1]) {
                const worldNumber = worldNumberMatch[1];
                worldIdentifier = `${serverCode}${worldNumber}`; // Cria ID padrão (ex: gr100, tr93)
            } else {
                 worldIdentifier = displayedWorldText || `${worldIdentifier} (Sem Número)`; // Usa texto original se não achar número
                 console.warn(`[parseTransactions v28] Linha ${index}: Não extraiu número de "${displayedWorldText}". Usando: "${worldIdentifier}"`);
            }

            // Extrai outros textos
            const typeText = cells[2]?.textContent?.trim() || 'Unknown Type';
            const changeText = cells[3]?.textContent?.trim() || '0';
            const newPointsText = cells[4]?.textContent?.trim() || '0';

            // Parse Numérico Universal (remove . e espaço, troca , por .)
            const parseNumberUniversal = (text) => {
                 if (!text) return 0;
                 const cleanedForParsing = text.replace(/[.\s]/g, '').replace(',', '.');
                 const match = cleanedForParsing.match(/([-+]?\d*\.?\d+)/);
                 const intVal = match ? parseInt(match[1], 10) : NaN;
                 if (!isNaN(intVal)) return intVal;
                 const floatVal = match ? parseFloat(match[1]) : NaN;
                 return isNaN(floatVal) ? 0 : floatVal;
             };
            const changeValue = parseNumberUniversal(changeText);
            const newPremiumPoints = parseNumberUniversal(newPointsText);

            // Definição do Tipo com base no serverCode
            let transactionType = 'Unknown'; // Fallback inglês
            const originalTypeTextLower = typeText.toLowerCase();

            // Listas de Keywords (Incluindo todas adicionadas até agora)
            const profitKeywords = ["κέρδος", "kâr", "zisk", "прибыль", "lucro", "profit", "gewinn", "winst", "bénéfice", "ricavo", "beneficio", "ربح", "nyereség", "zysk", "troca premium", "premium exchange"];
            const expenseKeywords = ["κόστος", "έξοδο", "gider", "maliyet", "náklady", "расход", "despesa", "cost", "kosten", "dépense", "costo", "gasto", "مصروف", "költség", "koszt"];
            const transferKeywords = ['μεταφορά', 'transfer', 'prevod', 'перевод', 'überweisung', 'overdracht', 'transfert', 'trasferimento', 'transferencia', 'نقل', 'átutalás', 'przelew'];
            const redeemKeywords = ['εξαργύρωση', 'kullanıldı', 'uplatnenie', 'обмен', 'redeem', 'redeemed', 'resgatado', 'eingelöst', 'uplatněno', 'ingeleverd', 'ingeruild', 'utilisé', 'riscosso', 'utilizzato', 'canjeado', 'utilizado', 'مستخدم', 'beváltás', 'wykorzystano'];
            const marketKeywords = ["αγορά premium", "premium borsa", "prémiová burza", "премиум обмен", "mercato premium", "premium market", "giełda premium", "troca premium"];
            const featureKeywords = ["κατασκευή", "παραγωγή", "έρευνα", "πακέτο", "inşa", "üretim", "araştırma", "paket", "výstavba", "produkcia", "výskum", "balíček", "постройка", "производство", "исследование", "пакет", "costruzione", "produzione", "ricerca", "construction", "production", "research", "pacchetto", "package", "budowa", "produkcja", "badania", "pakiet", "construção", "produção", "pesquisa", "pacote"];

            // Lógica de Tipo por Idioma
            if (serverCode === 'gr') {
                if (changeValue > 0) { transactionType = 'Κέρδος'; }
                else if (changeValue < 0) { transactionType = 'Έξοδο'; if (marketKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Αγορά Premium'; else if (featureKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Ενεργοποίηση'; }
                else { if (transferKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Μεταφορά (0)'; else if (redeemKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Εξαργύρωση (0)'; else transactionType = typeText.length > 30 ? typeText.substring(0, 27) + '...' : typeText; }
            } else if (serverCode === 'tr') {
                if (changeValue > 0) { transactionType = 'Kâr'; }
                else if (changeValue < 0) { transactionType = 'Gider'; if (marketKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Pazar Alımı'; else if (featureKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Özellik Aktivasyonu'; }
                else { if (transferKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Transfer (0)'; else if (redeemKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Kullanıldı (0)'; else transactionType = typeText.length > 30 ? typeText.substring(0, 27) + '...' : typeText; }
            } else if (serverCode === 'pt' || serverCode === 'br') {
                 if (changeValue > 0) { transactionType = 'Lucro'; }
                 else if (changeValue < 0) { transactionType = 'Despesa'; if (marketKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Compra Mercado'; else if (featureKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Ativação Recurso'; }
                 else { if (transferKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Transferência (0)'; else if (redeemKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Resgate (0)'; else transactionType = typeText.length > 30 ? typeText.substring(0, 27) + '...' : typeText; }
            } else if (serverCode === 'de' || serverCode === 'ch') {
                 if (changeValue > 0) { transactionType = 'Gewinn'; }
                 else if (changeValue < 0) { transactionType = 'Kosten'; if (marketKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Markt Kauf'; else if (featureKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Feature Aktivierung'; }
                 else { if (transferKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Überweisung (0)'; else if (redeemKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Eingelöst (0)'; else transactionType = typeText.length > 30 ? typeText.substring(0, 27) + '...' : typeText; }
            } else if (serverCode === 'ru') {
                 if (changeValue > 0) { transactionType = 'Прибыль'; }
                 else if (changeValue < 0) { transactionType = 'Расход'; if (marketKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Покупка ПО'; else if (featureKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Активация'; }
                 else { if (transferKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Перевод (0)'; else if (redeemKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Обмен (0)'; else transactionType = typeText.length > 30 ? typeText.substring(0, 27) + '...' : typeText; }
            } else if (serverCode === 'sk' || serverCode === 'cs') {
                 if (changeValue > 0) { transactionType = 'Zisk'; }
                 else if (changeValue < 0) { transactionType = 'Náklady'; if (marketKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Nákup Burza'; else if (featureKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Aktivácia Funkcie'; }
                 else { if (transferKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Prevod (0)'; else if (redeemKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Uplatnenie (0)'; else transactionType = typeText.length > 30 ? typeText.substring(0, 27) + '...' : typeText; }
            } else if (serverCode === 'it') {
                 if (changeValue > 0) { transactionType = 'Ricavo'; } // Ou 'Lucro'? Melhor usar 'Ricavo'
                 else if (changeValue < 0) { transactionType = 'Costo'; if (marketKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Acquisto Mercato'; else if (featureKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Attivazione Funzione'; }
                 else { if (transferKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Trasferimento (0)'; else if (redeemKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Utilizzato (0)'; else transactionType = typeText.length > 30 ? typeText.substring(0, 27) + '...' : typeText; }
            } else if (serverCode === 'pl') {
                 if (changeValue > 0) { transactionType = 'Zysk'; }
                 else if (changeValue < 0) { transactionType = 'Koszt'; if (marketKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Zakup Giełda'; else if (featureKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Aktywacja Funkcji'; }
                 else { if (transferKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Przelew (0)'; else if (redeemKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Wykorzystano (0)'; else transactionType = typeText.length > 30 ? typeText.substring(0, 27) + '...' : typeText; }
            }
            // Adicione mais 'else if' para outros idiomas (es, fr, nl, hu, ae) aqui...
            else { // Fallback Inglês para .us, .co.uk, .net, .works e outros não definidos
                if (changeValue > 0 || profitKeywords.some(kw => originalTypeTextLower.includes(kw))) { transactionType = 'Profit'; }
                else if (changeValue < 0 || expenseKeywords.some(kw => originalTypeTextLower.includes(kw))) { transactionType = 'Cost'; if (marketKeywords.some(kw => originalTypeTextLower.includes(kw) && !originalTypeTextLower.includes("sell"))) transactionType = 'Market Purchase'; else if (featureKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Feature Activation'; }
                else { if (transferKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Transfer (0)'; else if (redeemKeywords.some(kw => originalTypeTextLower.includes(kw))) transactionType = 'Redeem (0)'; else transactionType = typeText.length > 30 ? typeText.substring(0, 27) + '...' : typeText; }
             }

            // Adiciona a transação com o worldIdentifier CORRETO e tipo traduzido (ou fallback)
            transactions.push({ date, type: transactionType, change: changeValue, newPremiumPoints, world: worldIdentifier });

        } catch(e) {
             console.error(`[parseTransactions v28] ERRO linha ${index}:`, e);
             try { console.error(`  HTML Linha ${index}: ${row.innerHTML}`); } catch { /* ignore */ }
        }
      } else {
          console.warn(`[parseTransactions v28] Linha ${index} ignorada: Células (${cells.length}) < 5.`);
      }
    });

    console.log(`[parseTransactions v28] Parseamento concluído. ${transactions.length} transações extraídas.`);
    return transactions;
}




























    // ================================================================
// ===      NOVA FUNÇÃO AUXILIAR: calculateNetProfitFromLogs    ===
// ================================================================
/**
 * Calcula o lucro/prejuízo líquido SOMENTE a partir de um array de transações fornecido.
 * Diferente de calculateWorldProfit, não filtra por mundo e usa diretamente os dados passados.
 * @param {Array<Object>} logs - Um array de objetos de transação (com propriedade 'change').
 * @returns {number} - O valor líquido (positivo para lucro, negativo para prejuízo).
 */
const calculateNetProfitFromLogs = (logs) => {
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
        return 0;
    }

    let totalSales = 0;
    let totalExpenses = 0;

    logs.forEach(log => {
        // Garante que 'change' é um número
        const changeValue = typeof log.change === 'number' ? log.change : 0;

        if (changeValue > 0) {
            totalSales += changeValue;
        } else if (changeValue < 0) {
            totalExpenses += Math.abs(changeValue); // Soma o valor absoluto das despesas
        }
        // Ignora transações com change === 0
    });

    // console.log(`[DEBUG calculateNetProfitFromLogs] Calculado: Sales=${totalSales}, Expenses=${totalExpenses}, Net=${totalSales - totalExpenses}`); // Log opcional
    return totalSales - totalExpenses;
};
// === FIM NOVA FUNÇÃO AUXILIAR ===




















  // FUNÇÃO calculateWorldProfit ATUALIZADA (v2 - World Comparison Logging)
const calculateWorldProfit = () => {
    // Log inicial para saber quando a função é chamada
    console.log(`[calculateWorldProfit v2] Iniciando cálculo...`);

    // Verifica se temos as transações e a informação da vila atual
    if (!state.transactions || !Array.isArray(state.transactions) || !state.currentVillage?.world) {
        console.warn(`[calculateWorldProfit v2] Abortando: Transações ou Mundo da Vila Atual não definidos. State Transactions: ${state.transactions?.length ?? 'N/A'}, Current Village World: ${state.currentVillage?.world ?? 'N/A'}`);
        return 0; // Retorna 0 se não houver dados suficientes
    }

    // === LOG: Imprime o mundo da vila atual que será usado para filtrar ===
    const targetWorld = state.currentVillage.world;
    console.log(`[calculateWorldProfit v2] Mundo Alvo para Filtro (state.currentVillage.world): "${targetWorld}" (Tipo: ${typeof targetWorld})`);

    // Filtra as transações pelo mundo alvo
    const worldTransactions = state.transactions.filter((t, index) => {
        // === LOG: Imprime o mundo da transação e o resultado da comparação (para as 5 primeiras) ===
        if (index < 5) { // Loga apenas as primeiras 5 para não poluir muito
             console.log(`  [Filtro Linha ${index}] Comparando t.world: "${t.world}" (Tipo: ${typeof t.world}) === targetWorld: "${targetWorld}" --> Resultado: ${t.world === targetWorld}`);
        }
        return t.world === targetWorld; // A comparação real
    });

    // === LOG: Imprime quantas transações passaram no filtro ===
    console.log(`[calculateWorldProfit v2] ${worldTransactions.length} transações encontradas para o mundo "${targetWorld}".`);

    // Se nenhuma transação foi encontrada para o mundo, retorna 0
    if (worldTransactions.length === 0) {
        console.log(`[calculateWorldProfit v2] Nenhuma transação para o mundo alvo. Retornando lucro 0.`);
        return 0;
    }

    // Calcula despesas e vendas das transações filtradas
    const expenses = worldTransactions
        .filter((t) => t.change < 0) // Simplificado: apenas valores negativos são despesas diretas
        .reduce((sum, t) => sum + Math.abs(t.change || 0), 0);

    const sales = worldTransactions
        .filter((t) => t.change > 0) // Simplificado: apenas valores positivos são vendas/lucro direto
        .reduce((sum, t) => sum + (t.change || 0), 0);

    // Calcula o lucro líquido
    const netProfit = sales - expenses;

    // === LOG: Imprime os valores calculados ===
    console.log(`[calculateWorldProfit v2] Cálculo: Vendas=${sales}, Despesas=${expenses}, Lucro Líquido=${netProfit}`);

    // Retorna o lucro líquido (arredondado para baixo, como antes)
    return Math.floor(netProfit);
};
// === FIM calculateWorldProfit ATUALIZADA (v2 - World Comparison Logging) ===


 // ================================================================
// ===  FUNÇÃO filterTransactions ATUALIZADA (v3 - UTC Date Parts) ===
// ================================================================
 // ================================================================
// ===  FUNÇÃO filterTransactions ATUALIZADA (v4 - Comparação YYYY-MM-DD Local) ===
// ================================================================
const filterTransactions = (transactions, filters) => {
    if (!transactions) return [];
    const { dateFrom, dateTo, worldFilter } = filters; // dateFrom/dateTo são strings no formato "YYYY-MM-DD"

    // console.log(`[DEBUG filterTransactions v4] Filtros recebidos: From='${dateFrom}', To='${dateTo}', World='${worldFilter}'`);

    // Filtra a lista de transações
    return _.filter(transactions, (t) => {
        // 1. Validação básica da data da transação
        if (!(t.date instanceof Date) || isNaN(t.date.getTime())) {
            // console.warn(`[filterTransactions v4] Transação ignorada - data inválida:`, t);
            return false;
        }

        // 2. Formata a data da transação para "YYYY-MM-DD" usando componentes LOCAIS
        //    Isso garante que comparamos com o dia local selecionado no input <input type="date">
        const tYearLocal = t.date.getFullYear();
        const tMonthLocal = t.date.getMonth() + 1; // getMonth é 0-indexado, ajusta para 1-12
        const tDayLocal = t.date.getDate();
        // Cria a string no formato YYYY-MM-DD (ex: "2025-04-20")
        const transactionDateString = `${tYearLocal}-${String(tMonthLocal).padStart(2, '0')}-${String(tDayLocal).padStart(2, '0')}`;
        // console.log(`[DEBUG filterTransactions v4] Data Transação: ${t.date.toISOString()} -> Formatada Local: ${transactionDateString}`); // Log para depuração

        // 3. Comparação de Data usando as strings "YYYY-MM-DD"
        let isDateValid = true; // Assume válido inicialmente

        // Verifica se a data da transação é ANTERIOR à data inicial do filtro
        if (dateFrom && transactionDateString < dateFrom) {
            isDateValid = false;
            // console.log(` -> INVÁLIDO (Antes de dateFrom): ${transactionDateString} < ${dateFrom}`);
        }

        // Verifica se a data da transação é POSTERIOR à data final do filtro (só checa se ainda for válido)
        if (isDateValid && dateTo && transactionDateString > dateTo) {
            isDateValid = false;
            // console.log(` -> INVÁLIDO (Depois de dateTo): ${transactionDateString} > ${dateTo}`);
        }
        // Se isDateValid permaneceu true, significa que transactionDateString está entre dateFrom e dateTo (inclusive).

        // 4. Validação do Mundo (lógica inalterada)
        let isWorldValid = true;
        if (worldFilter && typeof worldFilter === 'string' && worldFilter.trim() !== '') {
            isWorldValid = t.world && typeof t.world === 'string' && t.world.toLowerCase().includes(worldFilter.toLowerCase().trim());
        }

        // Log de depuração (opcional, útil se ainda não funcionar)
        // if (isDateValid && isWorldValid) {
        //     console.log(`[DEBUG filterTransactions v4] INCLUINDO: ${transactionDateString} | World: ${t.world}`);
        // } else if (!isDateValid) {
        //      // Não precisa logar de novo, já logamos acima
        // } else { // Apenas world inválido
        //      console.log(`[DEBUG filterTransactions v4] EXCLUINDO (World Inválido): ${transactionDateString} | World: ${t.world} (Filtro: ${worldFilter})`);
        // }

        // Retorna true apenas se AMBAS as condições (data e mundo) forem válidas
        return isDateValid && isWorldValid;
    });
};
// === FIM filterTransactions ATUALIZADA (v4 - Comparação YYYY-MM-DD Local) ===







  const sortTransactions = (transactions, sortField, sortDirection) => {
    return _.orderBy(transactions, [sortField], [sortDirection]);
  };
  const paginateTransactions = (transactions, page, perPage = 10) => {
    const start = (page - 1) * perPage;
    return _.slice(transactions, start, start + perPage);
  };







// ================================================================
// ===      FUNÇÃO renderLedgerTable ATUALIZADA (v4 - Label Consistente) ===
// ================================================================
const renderLedgerTable = (transactions, sortField = "date", sortDirection = "desc", page = 1, perPage = 10, currentFilters = {}) => {
    console.log(`[renderLedgerTable v4 - Label Consistente] Iniciada. Recebeu ${transactions?.length ?? 0} logs. Ordenação: ${sortField} ${sortDirection}, Página: ${page}`);

    // 1. Calcula totais e lucros (SEM Math.floor intermediário)
    const expensesTransactions = transactions.filter(t => t.change < 0 || t.type === "Despesa");
    const salesTransactions = transactions.filter(t => t.change > 0 || t.type === "Lucro");











    const totalExpenses = expensesTransactions.reduce((sum, t) => sum + Math.abs(t.change || 0), 0);








    const totalSales = salesTransactions.reduce((sum, t) => sum + (t.change || 0), 0);
    const profit = totalSales - totalExpenses;
    console.log(` -> Sumário Calculado (sem floor): Despesas=${totalExpenses}, Vendas=${totalSales}, Lucro=${profit}`);

    // 2. Ordena as transações SEPARADAS por tipo
    const sortedExpenses = sortTransactions(expensesTransactions, sortField, sortDirection);
    const sortedSales = sortTransactions(salesTransactions, sortField, sortDirection);
    console.log(` -> Ordenação concluída: ${sortedExpenses.length} despesas, ${sortedSales.length} vendas.`);

    // 3. Cria a lista combinada com cabeçalhos e sumário
    // *** MUDANÇA AQUI: Define a label do sumário baseado se há filtros ativos ***
    const hasActiveFilters = currentFilters.dateFrom || currentFilters.dateTo || currentFilters.worldFilter;
    const summaryLabelKey = hasActiveFilters ? "filteredPeriodProfitLabel" : "profit";
    const summaryLabelText = i18n.t(summaryLabelKey); // Pega a tradução correta
    // *** FIM DA MUDANÇA ***

    const allMarkedTransactions = [
        { type: "header", label: i18n.t("expenses") },
        ...sortedExpenses.map(t => ({ ...t, rowType: "expense" })),
        { type: "header", label: i18n.t("sales") },
        ...sortedSales.map(t => ({ ...t, rowType: "income" })),
        // *** USA A LABEL DEFINIDA ACIMA ***
        { type: "summary", label: `${summaryLabelText}: <span class="icon header premium"></span> ${profit}` }
    ];
    console.log(` -> Lista combinada criada com ${allMarkedTransactions.length} itens. Label Sumário: "${summaryLabelText}"`);

    // 4. Pagina a lista combinada
    const totalItems = allMarkedTransactions.length;
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / perPage) : 1;
    const paginated = paginateTransactions(allMarkedTransactions, page, perPage);
    console.log(` -> Paginação: Exibindo ${paginated.length} itens na página ${page} de ${totalPages}.`);

    // 5. Renderiza a Tabela HTML
    const tableContainer = ui.getElement("transactionsTableContainer");
    if (!tableContainer) {
      console.error("[renderLedgerTable v4] ERRO: Container da tabela (#transactionsTableContainer) não encontrado.");
      return;
    }
    tableContainer.innerHTML = `
        <table class="ledger-table aquila-table">
            <thead>
                <tr>
                    <th data-sort="date" class="${sortField === 'date' ? `sort-${sortDirection}` : ''}"><i class="fas fa-clock"></i> ${i18n.t("date")}</th>
                    <th data-sort="type" class="${sortField === 'type' ? `sort-${sortDirection}` : ''}"><i class="fas fa-exchange-alt"></i> ${i18n.t("type")}</th>
                    <th data-sort="change" class="${sortField === 'change' ? `sort-${sortDirection}` : ''}"><i class="fas fa-coins"></i> ${i18n.t("change")}</th>
                    <th data-sort="world" class="${sortField === 'world' ? `sort-${sortDirection}` : ''}"><i class="fas fa-globe"></i> ${i18n.t("world")}</th>
                </tr>
            </thead>
            <tbody id="transactionsTableBody">
                ${paginated.map(item => {
                  if (item.type === "header") return `<tr class="section-header-row"><td colspan="4" class="section-header">${item.label}</td></tr>`;
                  // *** USA a `item.label` que já foi definida com a chave correta (profit ou filteredPeriodProfitLabel) ***
                  if (item.type === "summary") return `<tr class="profit-summary-row"><td colspan="4">${item.label}</td></tr>`;
                  if (item.date instanceof Date && !isNaN(item.date.getTime())) {
                    const rowClass = item.rowType === "expense" ? "expense-row" : "income-row";
                    const formattedDate = item.date.toLocaleString(state.language || "pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    const formattedChange = (item.change < 0 ? `(<span class="icon header premium"></span> ${Math.abs(item.change).toLocaleString(state.language || "pt-BR")})` : `<span class="icon header premium"></span> ${item.change.toLocaleString(state.language || "pt-BR")}`);
                    return `
                        <tr class="${rowClass}">
                            <td>${formattedDate}</td>
                            <td>${item.type || "N/A"}</td>
                            <td>${formattedChange}</td>
                            <td>${item.world || "N/A"}</td>
                        </tr>`;
                  }
                  return "";
                }).join("")}
            </tbody>
        </table>
    `;
    console.log("[renderLedgerTable v4] Tabela HTML renderizada.");

    // 6. Renderiza Controles de Paginação
    const paginationControls = ui.getElement("paginationControls");
    if (paginationControls) {
      paginationControls.innerHTML = `
            <button class="aquila-btn" id="prevPage" ${page <= 1 ? "disabled" : ""}><i class="fas fa-chevron-left"></i> ${i18n.t("previous")}</button>
            <span class="page-info">${i18n.t("page")} ${page} / ${totalPages}</span>
            <button class="aquila-btn" id="nextPage" ${page >= totalPages ? "disabled" : ""}><i class="fas fa-chevron-right"></i> ${i18n.t("next")}</button>
        `;
      paginationControls.querySelector("#prevPage")?.addEventListener("click", () => {
        if (page > 1) {
            console.log("[Pagination Click] Indo para página ANTERIOR.");
            renderLedgerTable(transactions, sortField, sortDirection, page - 1, perPage, currentFilters);
        }
      });
      paginationControls.querySelector("#nextPage")?.addEventListener("click", () => {
        if (page < totalPages) {
            console.log("[Pagination Click] Indo para página PRÓXIMA.");
            renderLedgerTable(transactions, sortField, sortDirection, page + 1, perPage, currentFilters);
        }
      });
      console.log("[renderLedgerTable v4] Controles de paginação renderizados.");
    }

    // 7. Renderiza o Gráfico
    const chartElement = ui.getElement("transactionsChart");
    const chartContainer = ui.getElement("transactionsChartContainer");
    const validTransactionsForChart = transactions.filter(t => t.date instanceof Date && !isNaN(t.date.getTime()));
    if (chartElement && chartContainer && validTransactionsForChart.length > 0) {
      console.log("[renderLedgerTable v4] Chamando renderChart...");
      renderChart(validTransactionsForChart.sort((a, b) => a.date - b.date));
      chartContainer.style.display = 'block';
    } else if (chartContainer) {
      console.log("[renderLedgerTable v4] Sem transações válidas para o gráfico. Escondendo.");
      chartContainer.style.display = 'none';
       if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    }

    // 8. Adiciona Listeners de Ordenação aos Cabeçalhos da Tabela
    tableContainer.querySelectorAll("th[data-sort]").forEach(header => {
      header.removeEventListener("click", handleSortClick);
       function handleSortClick() {
            const newSortField = header.dataset.sort;
            const newSortDirection = (sortField === newSortField && sortDirection === "desc") ? "asc" : "desc";
            console.log(`[Sort Click] Mudando ordenação para: ${newSortField} ${newSortDirection}`);
            renderLedgerTable(transactions, newSortField, newSortDirection, 1, perPage, currentFilters);
       }
      header.addEventListener("click", handleSortClick);
    });
    console.log("[renderLedgerTable v4] Listeners de ordenação adicionados/atualizados.");

    console.log("[renderLedgerTable v4 - Label Consistente] FINALIZADA.");
};













// ================================================================
// ===    FUNÇÃO renderChart v10 - Group by Local Date String   ===
// ================================================================
let chartInstance = null; // Variável para manter a instância do gráfico

const renderChart = async (transactions) => {
    //console.log("[DEBUG Aquila renderChart v10] Iniciada.");

    // 1. Garante Chart.js carregado
    try {
        await loadChartJsDynamically();
        if (typeof Chart === 'undefined') {
            throw new Error("Objeto Chart não está definido globalmente após carregamento.");
        }
        //console.log("[renderChart v10] Chart.js confirmado como carregado.");
    } catch (error) {
        console.error("[renderChart v10] Erro crítico ao carregar/confirmar Chart.js:", error);
        notifyError("Falha ao carregar biblioteca do gráfico.");
        const chartContainer = ui.getElement("transactionsChartContainer");
        if (chartContainer) chartContainer.style.display = 'none';
        return;
    }

    // 2. Pega elementos do DOM
    const chartContainer = ui.getElement("transactionsChartContainer");
    if (!chartContainer) {
        console.error("[renderChart v10] ERRO: Container do gráfico #transactionsChartContainer não encontrado!");
        return;
    }
    let canvas = chartContainer.querySelector("canvas#transactionsChart");
    if (!canvas) {
        console.warn("[renderChart v10] Canvas não encontrado, recriando...");
        chartContainer.innerHTML = '<canvas id="transactionsChart"></canvas>';
        canvas = chartContainer.querySelector("canvas#transactionsChart");
        if (!canvas) {
             console.error("[renderChart v10] ERRO: Falha ao recriar o canvas!");
             chartContainer.style.display = 'none';
             return;
        }
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("[renderChart v10] ERRO: Contexto 2D não obtido do canvas.");
        chartContainer.style.display = 'none';
        return;
    }

    // 3. Destroi instância anterior
    if (chartInstance) {
        try {
            chartInstance.destroy();
            //console.log("[renderChart v10] Instância anterior do gráfico destruída.");
        } catch (destroyError) {
            console.warn("[renderChart v10] Erro ao destruir instância anterior:", destroyError);
        } finally {
             chartInstance = null;
        }
    }

    // 4. Verifica dados
    if (!transactions || transactions.length === 0) {
        //console.log("[renderChart v10] Nenhuma transação válida para exibir no gráfico.");
        chartContainer.style.display = "none";
        return;
    } else {
        chartContainer.style.display = "block";
    }

    // 5. Prepara os dados para o gráfico - *** MUDANÇA PRINCIPAL AQUI ***
    //console.log("[renderChart v10] Preparando dados para o gráfico (agrupando por DIA LOCAL)...");
    const dailyData = {};

    // Itera sobre as transações (que já estão filtradas)
    transactions.forEach((t) => {
        if (!(t.date instanceof Date) || isNaN(t.date.getTime())) { return; } // Pula inválidas

        // *** CRIA A CHAVE DE AGRUPAMENTO USANDO A DATA LOCAL ***
        const localYear = t.date.getFullYear();
        const localMonth = t.date.getMonth(); // 0-indexado para o construtor Date
        const localDay = t.date.getDate();
        // Chave no formato "YYYY-MM-DD" local
        const dateKey = `${localYear}-${String(localMonth + 1).padStart(2, '0')}-${String(localDay).padStart(2, '0')}`;

        // Se for a primeira vez que vemos esse dia LOCAL
        if (!dailyData[dateKey]) {
            // Cria um objeto Date que representa o início daquele dia LOCAL (para ordenação)
            const localDayStartDate = new Date(localYear, localMonth, localDay, 0, 0, 0, 0);
            dailyData[dateKey] = {
                dateForSortAndLabel: localDayStartDate, // Usaremos isso para ordenar e gerar a etiqueta
                sales: 0,
                expenses: 0
             };
            //console.log(` -> Novo dia local encontrado: ${dateKey}, Data para label/sort: ${localDayStartDate.toISOString()}`);
        }

        // Acumula vendas ou despesas para aquele dia LOCAL
        if (t.change > 0) {
            dailyData[dateKey].sales += t.change;
        } else {
            dailyData[dateKey].expenses += Math.abs(t.change);
        }
    });

    // Ordena os dados agrupados pela data de início do dia local
    const sortedDailyData = Object.values(dailyData).sort((a, b) => a.dateForSortAndLabel.getTime() - b.dateForSortAndLabel.getTime());
    //console.log(`[renderChart v10] Dados agrupados por dia local e ordenados: ${sortedDailyData.length} dias no total.`);

    // Gera os labels (etiquetas do eixo X) a partir da data local armazenada
    const labels = sortedDailyData.map((d) => {
        // Usa a data que representa o início do dia LOCAL para formatação
        return d.dateForSortAndLabel.toLocaleDateString(state.language || "pt-BR", {
            day: "2-digit", month: "short" // Formato DD/Mês (ex: 19 de abr, 20 de abr)
            // Não precisa especificar fuso horário aqui, pois 'dateForSortAndLabel' já é local
        });
    });

    // Pega os dados de vendas e despesas
    const salesDataset = sortedDailyData.map((d) => d.sales);
    const expensesDataset = sortedDailyData.map((d) => d.expenses);
    //console.log("[renderChart v10] Labels e datasets preparados:", { labels: labels.length, sales: salesDataset.length, expenses: expensesDataset.length });


    // 6. Cria a nova instância do gráfico (opções mantidas)
    try {
        //console.log("[renderChart v10] Criando nova instância do Chart...");
        chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels, // <<< Usa os labels dos dias LOCAIS
                datasets: [
                    { label: i18n.t("sales"), data: salesDataset, backgroundColor: "#81C784", borderColor: "#519657", borderWidth: 1 },
                    { label: i18n.t("expenses"), data: expensesDataset, backgroundColor: "#E57373", borderColor: "#B71C1C", borderWidth: 1 }
                ]
            },
            options: { // Suas opções originais aqui (mantidas)
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "x",
                scales: {
                     x: { stacked: true, title: { display: true, text: i18n.t("date"), color: "#C0C0C0", font: { size: 14, family: "'Poppins', sans-serif" } }, ticks: { color: "#C0C0C0", font: { size: 12 } }, grid: { display: false } },
                     y: { stacked: true, title: { display: true, text: i18n.t("change"), color: "#C0C0C0", font: { size: 14, family: "'Poppins', sans-serif" } }, ticks: { color: "#C0C0C0", font: { size: 12 }, callback: (value) => { if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(1) + " M"; if (Math.abs(value) >= 1e3) return (value / 1e3).toFixed(0) + " K"; return value.toLocaleString(state.language || "pt-BR"); } }, grid: { color: "rgba(205, 127, 50, 0.15)", borderDash: [4, 4] } }
                },
                plugins: {
                     title: { display: true, text: i18n.t("chartTitle"), color: "#CD7F32", font: { size: 16, family: "'Cinzel', serif" }, padding: { bottom: 15 } },
                     legend: { display: true, position: "bottom", labels: { color: "#C0C0C0", font: { size: 13 }, boxWidth: 15, padding: 20 } },
                     tooltip: { backgroundColor: "rgba(10, 13, 20, 0.95)", titleFont: { family: "'Poppins', sans-serif", size: 14 }, bodyFont: { family: "'Poppins', sans-serif", size: 12 }, titleColor: "#CD7F32", bodyColor: "#C0C0C0", borderColor: "#CD7F32", borderWidth: 1, cornerRadius: 5, caretSize: 6, padding: 10, mode: "index", intersect: false, callbacks: { label: function(context) { let label = context.dataset.label || ""; if (label) { label += ": "; } if (context.parsed.y !== null) { label += context.parsed.y.toLocaleString(state.language || "pt-BR"); } return label; } } }
                },
                interaction: { mode: "index", intersect: false }
            } // Fim das opções
        });
        //console.log("[renderChart v10] Nova instância do gráfico criada com sucesso.");
    } catch (error) {
        console.error("[renderChart v10] ERRO ao criar a nova instância do Chart:", error);
        chartContainer.style.display = "none";
        notifyError("Erro ao desenhar o gráfico.");
        chartInstance = null;
    }
}; // --- Fim da função renderChart v10 ---




















 // Função renderTransactionsModal ATUALIZADA (v3 - DEBUG Logs ON)
const renderTransactionsModal = (transactions, currentFilters, currentSortField, currentSortDirection, currentPage, perPage) => {
    console.log(`[renderTransactionsModal v3 - DEBUG] Iniciada. Recebeu ${transactions?.length ?? 0} logs.`);
    console.log(` -> Filtros Atuais:`, currentFilters);
    console.log(` -> Ordenação: ${currentSortField} ${currentSortDirection}, Página: ${currentPage}`);

    const filterSection = ui.getElement("filterSection");
    const tableContainer = ui.getElement("transactionsTableContainer");
    const paginationControls = ui.getElement("paginationControls");
    const chartContainer = ui.getElement("transactionsChartContainer");
    const filteredProfitSummaryEl = document.getElementById("filteredProfitSummary");

    if (!filterSection || !tableContainer || !paginationControls || !chartContainer || !filteredProfitSummaryEl) {
      console.error("[renderTransactionsModal v3 - DEBUG] ERRO: Falha ao encontrar um ou mais elementos de CONTEÚDO interno.");
      return;
    }

    // 1. Renderiza Filtros (Mantido como estava)
    filterSection.innerHTML = `
        <div class="aquila-filter-grid">
            <div class="aquila-filter-item">
                <label for="dateFrom"><i class="fas fa-calendar-alt"></i> ${i18n.t("dateFrom")}</label>
                <input type="date" id="dateFrom" class="aquila-input" value="${currentFilters.dateFrom || ""}">
            </div>
            <div class="aquila-filter-item">
                <label for="dateTo"><i class="fas fa-calendar-alt"></i> ${i18n.t("dateTo")}</label>
                <input type="date" id="dateTo" class="aquila-input" value="${currentFilters.dateTo || ""}">
            </div>
            <div class="aquila-filter-item">
                <label for="worldFilter"><i class="fas fa-globe"></i> ${i18n.t("worldFilter")}</label>
                <input type="text" id="worldFilter" class="aquila-input" value="${currentFilters.worldFilter || ""}" placeholder="${i18n.t("worldFilterPlaceholder", { defaultValue: "Ex: br118" })}">
            </div>
        </div>
    `;
    console.log("[renderTransactionsModal v3 - DEBUG] Seção de filtros atualizada no HTML.");

    // 2. Define a função debounced para aplicar filtros
    const debouncedApplyFilters = _.debounce(() => {
      console.log("[debouncedApplyFilters - DEBUG] Disparado.");
      const filtersNow = {
        dateFrom: filterSection.querySelector("#dateFrom")?.value || "",
        dateTo: filterSection.querySelector("#dateTo")?.value || "",
        worldFilter: filterSection.querySelector("#worldFilter")?.value || ""
      };
      console.log(" -> Aplicando filtros:", filtersNow);

      const filtered = filterTransactions(transactions, filtersNow); // Usa a lista original recebida
      console.log(` -> ${filtered.length} logs após filtrar.`);

      let netFilteredProfit = 0;
      if (filtered.length > 0) {
        try {
          const totalFilteredSales = filtered.filter(t => t.change > 0).reduce((sum, t) => sum + t.change, 0);
          const totalFilteredExpenses = filtered.filter(t => t.change < 0).reduce((sum, t) => sum + Math.abs(t.change), 0);
          netFilteredProfit = Math.floor(totalFilteredSales - totalFilteredExpenses);
          console.log(` -> Lucro Líquido Filtrado: ${netFilteredProfit}`);
        } catch (calcError) {
          console.error("[debouncedApplyFilters - DEBUG] Erro ao calcular lucro líquido filtrado:", calcError);
          netFilteredProfit = "Erro";
        }
        const profitLabel = i18n.t("filteredPeriodProfitLabel", { defaultValue: "Lucro Líquido (Período)" });
        filteredProfitSummaryEl.innerHTML = `${profitLabel}: <span class="icon header premium"></span> ${netFilteredProfit}`;
        filteredProfitSummaryEl.style.display = "block";

        console.log(" -> Renderizando tabela/gráfico com dados filtrados...");
        renderLedgerTable(filtered, currentSortField, currentSortDirection, 1, perPage, filtersNow); // Reinicia na página 1 ao filtrar

      } else {
        console.log(" -> Nenhum resultado após filtrar. Limpando tabela/gráfico.");
        filteredProfitSummaryEl.style.display = "none";
        tableContainer.innerHTML = `<p style="text-align: center; padding: 20px;">${i18n.t("noTransactions")}</p>`;
        if (paginationControls) paginationControls.innerHTML = "";
        if (chartContainer) chartContainer.style.display = "none";
        if (chartInstance) {
          chartInstance.destroy();
          chartInstance = null;
        }
      }
    }, 300);

    // 3. Adiciona listeners aos inputs de filtro
    filterSection.querySelectorAll("input").forEach(input => {
        input.removeEventListener("input", debouncedApplyFilters); // Remove listener antigo
        input.addEventListener("input", debouncedApplyFilters);    // Adiciona novo
    });
    console.log("[renderTransactionsModal v3 - DEBUG] Listeners de filtro adicionados/atualizados.");

    // 4. Chama applyFilters imediatamente para renderizar com os filtros/dados iniciais
    console.log("[renderTransactionsModal v3 - DEBUG] Chamando applyFilters inicial...");
    debouncedApplyFilters();

    console.log("[renderTransactionsModal v3 - DEBUG] FINALIZADA.");
};















// FUNÇÃO showTransactions ATUALIZADA (v11 - Async Loading)
const showTransactions = () => { // Removido 'async' daqui, pois não usamos await direto em fetchPremiumLogs
    // 0. Validação Inicial e Nickname
    if (!currentPlayerNickname) {
        console.error("[showTransactions v11] Erro crítico: currentPlayerNickname não definido!");
        try { notifyError(i18n.t("errorMissingNickname", { defaultValue: "Não foi possível identificar o jogador atual para buscar o histórico." })); } catch (e) {}
        return;
    }
    console.log(`[showTransactions v11 - Async] Iniciada para ${currentPlayerNickname}.`);

    // 1. Obtém Elementos da Modal e Valida
    const modalElement = ui.getElement("transactionsModal");
    const tableContainer = ui.getElement("transactionsTableContainer");
    const filterSection = ui.getElement("filterSection");
    const paginationControls = ui.getElement("paginationControls");
    const chartContainer = ui.getElement("transactionsChartContainer");
    const filteredProfitSummaryEl = document.getElementById("filteredProfitSummary");

    if (!modalElement) {
        console.error("[showTransactions v11] Erro CRÍTICO: Modal #transactionsModal não encontrada.");
        try { notifyError(i18n.t("errorModalNotFound", { defaultValue: "Erro ao encontrar a janela de histórico." })); } catch(e) {}
        return;
    }
     // Avisa se elementos internos faltarem, mas continua
    if (!tableContainer || !filterSection || !paginationControls || !chartContainer || !filteredProfitSummaryEl) {
         console.warn("[showTransactions v11] Aviso: Um ou mais containers internos da modal não foram encontrados.");
    }

    // 2. Mostra Modal e Estado de Carregamento IMEDIATAMENTE
    try {
        modalElement.style.display = "flex"; // Exibe a modal AGORA

        // Define a mensagem de carregamento
        const loadingMessage = `<p style="text-align:center; padding: 20px; font-style:italic; color: #a0aab8;">${i18n.t('loadingHistory', { defaultValue: 'Carregando histórico...' })}</p>`;

        // Limpa e configura o estado inicial dos containers internos
        if (tableContainer) tableContainer.innerHTML = loadingMessage; // Mostra carregando
        if (filterSection) filterSection.innerHTML = '';
        if (paginationControls) paginationControls.innerHTML = '';
        if (chartContainer) {
            if (chartInstance) { try { chartInstance.destroy(); } catch(e) {} chartInstance = null; }
            chartContainer.innerHTML = '<canvas id="transactionsChart"></canvas>';
            chartContainer.style.display = 'none';
        }
        if (filteredProfitSummaryEl) { filteredProfitSummaryEl.innerHTML = ''; filteredProfitSummaryEl.style.display = 'none'; }
        console.log("[showTransactions v11] Modal exibida com placeholder de carregamento.");

    } catch (uiError) {
        console.error("[showTransactions v11] Erro ao configurar UI inicial da modal:", uiError);
        if(modalElement) modalElement.style.display = "none";
        try { notifyError(i18n.t("errorModalSetup", { defaultValue: "Erro ao preparar a janela de histórico." })); } catch(e) {}
        return;
    }

    // 3. Dispara fetchPremiumLogs em SEGUNDO PLANO (SEM await)
    console.log("[showTransactions v11] Disparando fetchPremiumLogs(false) em segundo plano...");
    fetchPremiumLogs(false)
        .then(() => {
            // === SUCESSO: fetchPremiumLogs terminou (dados estão em state.transactions) ===
            console.log("[showTransactions v11] fetchPremiumLogs concluído com sucesso. Renderizando conteúdo...");
            try {
                // Pega os dados finais do state MobX
                const finalLogsToRender = mobx.toJS(state.transactions);

                if (finalLogsToRender && finalLogsToRender.length > 0) {
                    // Renderiza a tabela, filtros, etc., usando os dados atualizados
                    // Começa sem filtros, ordenado por data desc, pág 1
                    renderTransactionsModal(finalLogsToRender, {}, "date", "desc", 1, 10);
                    console.log("[showTransactions v11] Conteúdo real renderizado.");
                } else {
                    // Se fetchPremiumLogs funcionou mas não retornou logs
                    console.log("[showTransactions v11] Nenhum log encontrado para exibir após busca/verificação.");
                    if (tableContainer) {
                        tableContainer.innerHTML = `<p style="text-align: center; padding: 20px;">${i18n.t("noTransactions")}</p>`;
                    }
                    // Limpa outras seções
                    if (filterSection) filterSection.innerHTML = '';
                    if (paginationControls) paginationControls.innerHTML = '';
                    if (chartContainer) chartContainer.style.display = 'none';
                    if (filteredProfitSummaryEl) filteredProfitSummaryEl.style.display = 'none';
                }
            } catch (renderError) {
                // Captura erros DURANTE a renderização
                console.error("[showTransactions v11] Erro DURANTE a renderização da modal:", renderError);
                 if (tableContainer) {
                    tableContainer.innerHTML = `<p style="text-align:center; padding: 20px; color: red;">${i18n.t('errorRenderingModal', { defaultValue: 'Erro ao exibir o histórico.' })}</p>`;
                 }
                 try { notifyError(i18n.t("errorRenderingModal", { defaultValue: "Erro ao exibir o histórico." })); } catch(e) {}
            }
        })
        .catch((fetchError) => {
            // === ERRO: fetchPremiumLogs falhou ===
            console.error("[showTransactions v11] Erro retornado por fetchPremiumLogs:", fetchError);
            if (tableContainer) {
                tableContainer.innerHTML = `<p style="text-align:center; padding: 20px; color: red;">${i18n.t('errorLoadingHistory', { defaultValue: 'Erro ao carregar histórico.' })} (${fetchError.message || 'Erro desconhecido'})</p>`;
            }
            // Limpa outras seções em caso de erro
            if (filterSection) filterSection.innerHTML = '';
            if (paginationControls) paginationControls.innerHTML = '';
            if (chartContainer) chartContainer.style.display = 'none';
            if (filteredProfitSummaryEl) filteredProfitSummaryEl.style.display = 'none';
            if (chartInstance) { try { chartInstance.destroy(); } catch(e) {} chartInstance = null; }
        });

    // 4. Log final da função (será executado antes do .then/.catch acima)
    console.log("[showTransactions v11 - Async] Função principal concluída (fetch em andamento).");

}; // --- Fim da função showTransactions (v11 - Async Loading) ---




















  // Função fetchAndUpdateProfit v3 - Busca inicial limitada
const fetchAndUpdateProfit = async (fetchAll = false) => { // Adiciona parâmetro fetchAll
    if (!currentPlayerNickname) {
        console.error("[fetchAndUpdateProfit v3] Erro: currentPlayerNickname não definido!");
        // Reset state
        mobx.runInAction(() => {
            state.transactions.replace([]);
            state.worldProfit = 0;
            state.allTransactionsFetched = false; // Reseta flag
        });
        updateUI();
        throw new Error("Nickname do jogador não identificado.");
    }

    //console.log(`[DEBUG fetchAndUpdateProfit v3] Iniciando. FetchAll: ${fetchAll}`);

    // Usa cache se já tiver buscado tudo antes e não for forçado a buscar de novo
     if (state.allTransactionsFetched && !fetchAll) {
        //console.log("[DEBUG fetchAndUpdateProfit v3] Usando dados completos já cacheados.");
         // Recalcula o lucro (caso a aldeia ativa tenha mudado)
         const worldProfit = calculateWorldProfit();
         mobx.runInAction(() => { state.worldProfit = worldProfit; });
         updateUI();
         return state.transactions; // Retorna os dados completos cacheados
     }


    try {
        let transactionsToProcess = [];
        let needsServerFetch = true; // Assume que precisa buscar, a menos que o cache exista

        // Tenta carregar do localStorage primeiro
        const storageKey = `ragnarokMarketTransactions_${currentPlayerNickname}`;
        const savedTransactions = localStorage.getItem(storageKey);
         if (savedTransactions && !fetchAll) { // Só usa cache se não forçar busca completa
            try {
                const parsed = JSON.parse(savedTransactions).map(t => ({ ...t, date: new Date(t.date) }));
                cachedTransactions[currentPlayerNickname] = parsed;
                transactionsToProcess = parsed;
               // console.log(`[DEBUG fetchAndUpdateProfit v3] ${parsed.length} logs carregados do localStorage.`);
                // Verifica se o cache está atualizado (comparando com a primeira página)
                const needsUpdateCheck = await checkForUpdates();
                if (!needsUpdateCheck) {
                    //console.log("[DEBUG fetchAndUpdateProfit v3] Cache do localStorage está atualizado (baseado na pág 1).");
                     needsServerFetch = false; // Não precisa buscar se cache está ok
                     // Assume que o cache contém todos os dados se estiver atualizado
                     mobx.runInAction(() => { state.allTransactionsFetched = true; });
                } else {
                    //console.log("[DEBUG fetchAndUpdateProfit v3] Cache do localStorage desatualizado ou precisa buscar tudo.");
                    // Se o cache está desatualizado E estamos forçando fetchAll, limpa o cache
                    if(fetchAll) {
                         transactionsToProcess = [];
                         cachedTransactions[currentPlayerNickname] = [];
                         localStorage.removeItem(storageKey);
                         //console.log("[DEBUG fetchAndUpdateProfit v3] Cache limpo devido a fetchAll=true e cache desatualizado.");
                    }
                    // Se não está forçando fetchAll mas o cache está desatualizado,
                    // apenas marca que precisa buscar, mas mantém os dados cacheados por enquanto
                    mobx.runInAction(() => { state.allTransactionsFetched = false; });
                }
            } catch (e) {
                console.error("[DEBUG fetchAndUpdateProfit v3] Erro ao parsear localStorage, limpando.", e);
                localStorage.removeItem(storageKey);
                transactionsToProcess = [];
                cachedTransactions[currentPlayerNickname] = [];
                mobx.runInAction(() => { state.allTransactionsFetched = false; });
            }
        } else {
             mobx.runInAction(() => { state.allTransactionsFetched = false; });
             //console.log("[DEBUG fetchAndUpdateProfit v3] Sem cache no localStorage ou fetchAll=true.");
        }


        // Busca do servidor se necessário
        if (needsServerFetch) {
            if (fetchAll) {
                //console.log("[DEBUG fetchAndUpdateProfit v3] Buscando TODAS as páginas...");
                 // Mostra um indicador de loading se possível (ex: spinner na modal)
                transactionsToProcess = await fetchAllPages(); // Função que busca todas as páginas
                 mobx.runInAction(() => { state.allTransactionsFetched = true; }); // Marca que buscou tudo
                //console.log(`[DEBUG fetchAndUpdateProfit v3] Busca completa concluída: ${transactionsToProcess.length} logs.`);
            } else {
                //console.log("[DEBUG fetchAndUpdateProfit v3] Buscando APENAS a primeira página...");
                const { transactions: firstPageTransactions } = await fetchPage(1);
                transactionsToProcess = firstPageTransactions || []; // Usa a primeira página
                mobx.runInAction(() => { state.allTransactionsFetched = false; }); // Ainda não buscou tudo
                //console.log(`[DEBUG fetchAndUpdateProfit v3] Primeira página buscada: ${transactionsToProcess.length} logs.`);
                // Atualiza o cache APENAS se a primeira página for mais nova que o cache existente
                // (A lógica de salvar/cachear pode ser refinada aqui se necessário)
                if (!cachedTransactions[currentPlayerNickname] || transactionsToProcess.length > 0 && (!cachedTransactions[currentPlayerNickname][0] || transactionsToProcess[0].date > cachedTransactions[currentPlayerNickname][0].date)) {
                     cachedTransactions[currentPlayerNickname] = transactionsToProcess; // Atualiza cache em memória (mesmo sendo só pág 1)
                     // Não salva no localStorage ainda, pois não temos todos os dados
                     //console.log("[DEBUG fetchAndUpdateProfit v3] Cache em memória atualizado com a primeira página.");
                 }
            }
        }

        // Atualiza o estado MobX com os dados processados (sejam completos ou parciais)
        if (transactionsToProcess && Array.isArray(transactionsToProcess)) {
             mobx.runInAction(() => {
                // Substitui completamente ou mescla, dependendo da estratégia
                // Por simplicidade, vamos substituir aqui
                 state.transactions.replace(transactionsToProcess);
             });
             //console.log(`[DEBUG fetchAndUpdateProfit v3] State.transactions atualizado com ${transactionsToProcess.length} logs.`);
        } else {
            console.warn("[DEBUG fetchAndUpdateProfit v3] Nenhum log para processar.");
             mobx.runInAction(() => {
                state.transactions.replace([]);
                 state.allTransactionsFetched = fetchAll; // Se buscou tudo e não veio nada, marca como buscado
             });
        }

        // Calcula e atualiza o lucro do mundo atual SEMPRE
        const worldProfit = calculateWorldProfit(); // Usa state.transactions atualizado
         mobx.runInAction(() => { state.worldProfit = worldProfit; });
        //console.log(`[DEBUG fetchAndUpdateProfit v3] Lucro do mundo ${state.currentVillage?.world} recalculado: ${worldProfit}`);

        updateUI(); // Atualiza a UI com o novo lucro
        return state.transactions; // Retorna os dados atuais (parciais ou completos)

    } catch (error) {
        console.error(`[DEBUG fetchAndUpdateProfit v3] Erro geral:`, error);
        mobx.runInAction(() => {
            state.transactions.replace([]);
            state.worldProfit = 0;
            state.allTransactionsFetched = false; // Reseta em caso de erro
        });
        cachedTransactions[currentPlayerNickname] = []; // Limpa cache em memória
        localStorage.removeItem(`ragnarokMarketTransactions_${currentPlayerNickname}`); // Limpa storage
        updateUI();
        notifyError(i18n.t("domError"));
        throw error; // Propaga o erro
    }
};















    // Função executeTransaction ATUALIZADA (vHumanize 1.0 - Atrasos Aleatórios)
  const executeTransaction = async (type, resource, amount) => { // Adicionado 'async' aqui
    const transactionId = Date.now();
    //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Iniciando transação (Humanizada) para ${resource.name}, Quantidade: ${amount}`);
    const isBuy = type === "buy";
    const input = isBuy ? ui.buyInputs.get(resource.name) : ui.sellInputs.get(resource.name);
    const actionButton = isBuy ? document.querySelector('input.btn-premium-exchange-buy[type="submit"]') : document.querySelector('#premium_exchange_form input.btn[type="submit"]');
    const transactionSpinner = isBuy ? ui.getElement("buySpinner") : ui.getElement("sellSpinner");

    // Função auxiliar para criar pausa aleatória
    const randomDelay = (min = 150, max = 450) => {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        // console.log(`[Humanize Delay] Aguardando ${delay}ms...`); // Log opcional
        return new Promise(resolve => setTimeout(resolve, delay));
    };

    if (!input || !actionButton) {
      console.error(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Erro Crítico: Input ou Botão de Ação não encontrado. Tentando atualizar e agendando reload.`);
      updateGameElements();
      notifyError(i18n.t("domError"));
      scheduleReload(); // Mantém o reload em caso de erro crítico
      if (isBuy) isProcessingBuy = false;
      else isProcessingSell = false;
      return;
    }

    if (transactionSpinner) {
      transactionSpinner.style.display = "inline-block";
      //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Spinner ativado.`);
    }

    notifyUser(i18n.t("transactionInProgress"), "warning");
    //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Notificação 'Processando' exibida.`);

    const handleActionButtonClick = async () => { // Adicionado 'async' aqui
      //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] handleActionButtonClick iniciado.`);
      if (actionButton.disabled) {
        //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Botão de ação desabilitado, iniciando MutationObserver.`);
        // Lógica do MutationObserver (mantida como estava)
        const observer = new MutationObserver(async (mutations) => { // Adicionado 'async' aqui
          for (const mutation of mutations) { // Usar loop para garantir que só processe uma vez
            if (mutation.attributeName === "disabled" && !actionButton.disabled) {
              observer.disconnect();
              //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Botão de ação habilitado pelo observer. Desconectando observer.`);
              await randomDelay(100, 250); // Pequena pausa antes de clicar após habilitar
              //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Clicando no botão principal.`);
              actionButton.click();
              startConfirmationCheck(); // Continua para checar confirmação
              return; // Sai após processar a mutação
            }
          }
        });
        observer.observe(actionButton, { attributes: true, attributeFilter: ["disabled"] });
      } else {
        //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Botão de ação já habilitado.`);
        await randomDelay(100, 250); // Pequena pausa antes de clicar
        //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Clicando no botão principal.`);
        actionButton.click();
        startConfirmationCheck(); // Continua para checar confirmação
      }
    };








  const startConfirmationCheck = () => {
      //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Iniciando busca pelo pop-up de confirmação.`);
      let attempts = 0;
      const maxAttempts = 50; // Mantido
      let confirmationProcessed = false; // Flag para evitar processamento múltiplo

      const interval = setInterval(async () => { // Adicionado 'async' aqui
        if (confirmationProcessed) {
          clearInterval(interval);
          //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Intervalo de confirmação limpo (já processado).`);
          return;
        }

        //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Tentativa ${attempts + 1}/${maxAttempts} para encontrar pop-up.`);
        const popupSelectors = [ // Mantido
          "div.ui-dialog[aria-describedby='premium_exchange_confirm_buy']",
          "div.ui-dialog[aria-describedby='premium_exchange_confirm_sell']",
          "div.ui-dialog:not([style*='display: none'])",
          "div[role='dialog']:not([style*='display: none'])"
        ];
        let popup = null;
        for (const selector of popupSelectors) {
          popup = document.querySelector(selector);
          if (popup && (!popup.style.display || popup.style.display !== "none")) {
            //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Pop-up encontrado.`);
            break;
          }
        }

        if (popup) {
          const confirmButtonSelectors = [ // Mantido
            "div.confirmation-buttons button.btn.evt-confirm-btn.btn-confirm-yes",
            "button.btn-confirm-yes",
            // Seletores jQuery ':contains' não funcionam em querySelector, use alternativas ou filtre depois se necessário
            // '.ui-dialog-buttonpane button:not(:disabled):first-of-type' // Pode ser muito genérico, manter como último recurso
            // Adicionar seletores mais específicos se possível
            ".ui-dialog-buttonpane button:enabled:not(:disabled):first-of-type" // Tentativa mais segura
          ];
          let confirmButton = null;
          for (const selector of confirmButtonSelectors) {
            confirmButton = popup.querySelector(selector);
            // Adiciona verificação de texto se o seletor for genérico
             if (confirmButton && !confirmButton.disabled) {
                 if (selector.includes(".ui-dialog-buttonpane")) { // Se for o seletor genérico do painel
                     const buttonText = confirmButton.textContent.trim().toLowerCase();
                     if (buttonText === 'sim' || buttonText === 'yes' || buttonText === 'ok') {
                        // console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Botão 'Sim/Yes/OK' HABILITADO encontrado (via seletor genérico).`);
                         break; // Botão correto encontrado
                     } else {
                         confirmButton = null; // Não é o botão que queremos, continua procurando
                     }
                 } else { // Se for um seletor específico (como btn-confirm-yes)
                     // console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Botão 'Sim' HABILITADO encontrado (via seletor específico: ${selector}).`);
                     break; // Botão correto encontrado
                 }
             }
          }


          if (confirmButton) {
            // Ação encontrada! Processa apenas uma vez.
            if (!confirmationProcessed) {
                confirmationProcessed = true; // Marca como processado
                clearInterval(interval); // Para o intervalo imediatamente
                //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Botão 'Sim' confirmado. Processando pré-clique.`);

                // ***** Bloco removido daqui (cálculo premiumCost e atualização input) *****

                // *** ATRASO ANTES DE CLICAR NA CONFIRMAÇÃO ***
                await randomDelay(200, 500); // Pausa para simular leitura
                //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Clicando no botão 'Sim' AGORA.`);
                confirmButton.click();

                // <<< INÍCIO DA ATUALIZAÇÃO: Salvar Timestamp >>>
                const transactionEndTime = Date.now();
                try {
                    localStorage.setItem('aquila_lastTransactionTime', transactionEndTime.toString());
                    // console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Timestamp da transação (${transactionEndTime}) salvo no localStorage.`);
                } catch (e) {
                    console.error(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Erro ao salvar timestamp no localStorage:`, e);
                    // Mesmo com erro, continua para o reload
                }
                // <<< FIM DA ATUALIZAÇÃO: Salvar Timestamp >>>

                // Finalização (DEPOIS de salvar o timestamp)
                if (transactionSpinner) transactionSpinner.style.display = "none";
                notifySuccess(i18n.t("transactionSuccess"));
                //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Transação confirmada. Agendando reload.`);
                scheduleReload(); // Agenda reload (com seu próprio atraso)

                // Resetar flags de processamento é importante aqui
                if (isBuy) isProcessingBuy = false; else isProcessingSell = false;
                return; // Sai da função do intervalo
            }

          } else {
            //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Botão 'Sim' não encontrado ou desabilitado. Aguardando.`);
          }
        } else {
          //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Pop-up não encontrado/visível.`);
        }

        // Lógica de Timeout (mantida como estava)
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          confirmationProcessed = true; // Marca como processado para evitar ações tardias
          console.warn(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] TIMEOUT: Pop-up/botão não encontrado. Assumindo erro.`);
          if (transactionSpinner) transactionSpinner.style.display = "none";
          notifyError(i18n.t("transactionError") + " (Timeout Confirmação)");

          // Limpa o timestamp se der timeout ANTES de confirmar, para não bloquear a próxima ação
          try {
              localStorage.removeItem('aquila_lastTransactionTime');
              // console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Timestamp removido do localStorage devido a timeout.`);
          } catch (e) {
               console.error(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Erro ao remover timestamp do localStorage no timeout:`, e);
          }

          scheduleReload();
          if (isBuy) isProcessingBuy = false;
          else isProcessingSell = false;
        }
      }, 100 + Math.random() * 150); // <<< Intervalo de verificação LEVEMENTE randomizado
    }; // <-- Fim da função startConfirmationCheck (ATUALIZADA)








    // --- Início da execução da transação ---
    const finalAmount = sanitizeNumber(amount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      console.error(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Quantidade inválida (${amount}). Abortada.`);
      if (transactionSpinner) transactionSpinner.style.display = "none";
      if (isBuy) isProcessingBuy = false; else isProcessingSell = false;
      return;
    }

    // *** ATRASO ANTES DE PREENCHER O INPUT ***
    await randomDelay(150, 400); // Pausa para simular encontrar e preencher o campo

    //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Preenchendo input com: ${finalAmount}`);
    input.value = finalAmount;

    //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Disparando eventos input/change/keyup.`);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(new Event("keyup", { bubbles: true }));

    // *** ATRASO ANTES DE CLICAR NO PRIMEIRO BOTÃO (calcular/vender) ***
    // A função handleActionButtonClick já tem um delay interno agora.
    // O tempo aqui é o tempo *antes* de *começar* a tentar clicar.
    const initialClickDelay = 150 + Math.random() * 300;
    //console.log(`${SCRIPT_NAME}: [TX-${transactionId} - ${type}] Agendando handleActionButtonClick em ${Math.round(initialClickDelay)}ms.`);
    setTimeout(handleActionButtonClick, initialClickDelay);

  }; // Fim da função executeTransaction atualizada
















  const calculateMaxBuyAmount = (resource) => {
    const gameRate = resource.getGameRate();
    const userRate = resource.getUserRate();
    const stock = resource.getStock();
    const output = resource.config.outputDefault;
    const buyPerTime = sanitizeNumber(ui.getElement("buyPerTimeInput").value);
    const storageLimit = sanitizeNumber(ui.getElement("storageLimitInput").value) || 1e3;
    const maxSpend = sanitizeNumber(ui.getElement("maxSpendInput").value);
    if (gameRate <= 0 || userRate <= 0 || stock <= 0 || maxSpend <= 0) return 0;
    const adjustedStorageLimit = Math.max(0, storageLimit - output);
    if (gameRate < userRate) return 0;
    let maxBuyAmount = stock < buyPerTime ? stock : Math.min(maxSpend * gameRate, buyPerTime, adjustedStorageLimit, stock);
    return Math.max(0, Math.floor(maxBuyAmount));
  };
  const calculateAvailableCapacityForResource = async (resourceName) => {
    const storageCapacity = state.storageCapacity;
    const currentStock = currentResources[resourceName];
    const incomingResources = await fetchTransportData();
    const totalStock = currentStock + incomingResources[resourceName];
    return Math.max(0, storageCapacity - totalStock);
  };
  let isProcessingBuy = false;











/**
 * Calcula um "spread" ou margem de segurança para compras,
 * baseado na tendência do mercado.
 * Spread maior significa compra mais conservadora (assume custo efetivo maior).
 * @param {string} resourceName - Nome do recurso ('wood', 'stone', 'iron').
 * @param {number} marketRate - A taxa de mercado atual para o recurso (PP/unidade).
 * @param {object} stateRef - Referência ao objeto de estado (para acessar tendências).
 * @returns {number} - O percentual de spread (ex: 0.05 para 5%).
 */
function calculateBuySpread(resourceName, marketRate, stateRef) {
    // Acessa a tendência do estado passado como referência
    const trend = stateRef.marketTrends[resourceName];
    let spreadPercentage = 0.05; // Base spread 5% (similar à taxa de venda)

    // Ajusta baseado na tendência
    if (trend === 'up') {
        // Preços subindo: Comprar é menos favorável. Aumenta o spread (mais conservador).
        spreadPercentage += 0.015; // Ex: 5% -> 6.5%
    } else if (trend === 'down') {
        // Preços caindo: Comprar é mais favorável. Diminui o spread ligeiramente.
        spreadPercentage -= 0.01; // Ex: 5% -> 4%
    }

    // Opcional: Poderíamos adicionar lógica baseada na 'marketRate' aqui se necessário,
    // mas vamos manter simples por enquanto, focando na tendência.

    // Garante que o spread fique dentro de limites razoáveis (ex: 3% a 8%)
    const clampedSpread = Math.min(Math.max(spreadPercentage, 0.03), 0.08);
    // console.log(`[calculateBuySpread - ${resourceName}] Trend: ${trend}, Base: 0.05, Adjusted: ${spreadPercentage.toFixed(4)}, Clamped: ${clampedSpread.toFixed(4)}`); // Log Opcional

    return clampedSpread;
}




















// FUNÇÃO processBuyBasedOnResources ATUALIZADA (vCompraInteligente 6.0 - Lista Ranqueada)
  const processBuyBasedOnResources = async () => {
    // --- COOLDOWN PERSISTENTE CHECK ---
    const COOLDOWN_DURATION = 6000; // 6 segundos
    const lastTxTimeStr = localStorage.getItem('aquila_lastTransactionTime');
    const lastTxTime = lastTxTimeStr ? parseInt(lastTxTimeStr, 10) : null;
    const nowForCooldown = Date.now();
    const timeSinceLastTx = lastTxTime && !isNaN(lastTxTime) ? nowForCooldown - lastTxTime : Infinity;

    if (timeSinceLastTx < COOLDOWN_DURATION) {
        const secondsRemaining = Math.ceil((COOLDOWN_DURATION - timeSinceLastTx) / 1000);
        // console.log(`[Compra vInteligente 6.0 + Cooldown] Cooldown ativo. Aguardando ${secondsRemaining}s.`); // Log Opcional
        return; // Sai cedo se estiver em cooldown
    }
    // --- FIM COOLDOWN PERSISTENTE CHECK ---

    // --- Lógica de atualização PÓS-COMPRA (lendo localStorage) ---
    // (Código Pós-Compra mantido como estava antes)
    const savedBalanceBeforeBuyStr = localStorage.getItem('aquila_ppBalanceBeforeBuy');
    const savedLimitBeforeBuyStr = localStorage.getItem('aquila_ppLimitBeforeBuy');
    if (savedBalanceBeforeBuyStr !== null && savedLimitBeforeBuyStr !== null) {
        console.log("[Compra vInteligente 6.0 - Pós-Reload Check] Verificando PP gasto..."); // Log Opcional
        const balanceBeforeBuy = parseInt(savedBalanceBeforeBuyStr, 10);
        const limitBeforeBuy = parseInt(savedLimitBeforeBuyStr, 10);
        const currentPPBalance = getAvailablePremiumPoints();
        localStorage.removeItem('aquila_ppBalanceBeforeBuy');
        localStorage.removeItem('aquila_ppLimitBeforeBuy');
        console.log("[Compra vInteligente 6.0 - Pós-Reload Check] Chaves temporárias removidas."); // Log Opcional
        if (!isNaN(balanceBeforeBuy) && !isNaN(limitBeforeBuy)) {
            const ppSpent = balanceBeforeBuy - currentPPBalance;
            console.log(`[Compra vInteligente 6.0 - Pós-Reload Check] Saldo Antes: ${balanceBeforeBuy}, Atual: ${currentPPBalance}, Gasto: ${ppSpent}`); // Log Opcional
            if (ppSpent > 0) {
                const newPPLimit = Math.max(0, limitBeforeBuy - ppSpent);
                const premiumInput = ui.getElement("premiumPointsInput");
                if (premiumInput) {
                    premiumInput.value = newPPLimit;
                    console.log(`[Compra vInteligente 6.0 - Pós-Reload Check] Limite PP atualizado: ${newPPLimit}. Salvando...`); // Log Opcional
                    performSaveOperation(); // Salva a configuração atualizada
                }
            } else {
                console.log(`[Compra vInteligente 6.0 - Pós-Reload Check] Nenhum PP gasto.`); // Log Opcional
                 const premiumInput = ui.getElement("premiumPointsInput");
                 if (premiumInput && sanitizeNumber(premiumInput.value) !== limitBeforeBuy) {
                     console.log(`[Compra vInteligente 6.0 - Pós-Reload Check] Restaurando limite pré-compra (${limitBeforeBuy}).`); // Log Opcional
                     premiumInput.value = limitBeforeBuy;
                     performSaveOperation(); // Salva a configuração restaurada
                 }
            }
        } else { console.warn("[Compra vInteligente 6.0 - Pós-Reload Check] Erro ao parsear valores salvos."); } // Log Opcional
    }
    // --- Fim PÓS-COMPRA ---

    // --- Lógica de verificação/início da compra ---
    const initialDelay = Math.random() * 200 + 50;
    await new Promise(resolve => setTimeout(resolve, initialDelay));

    // Verifica hCaptcha e outras condições
    if (checkAndHandleHCaptcha()) { console.log("[Compra vInteligente 6.0] hCaptcha detectado. Abortando."); isProcessingBuy = false; return; }
    const now = Date.now();
    if (!state.buyModeActive || isProcessingBuy || (state.buyPausedUntil && state.buyPausedUntil > now) || isProcessingSell) {
        // console.log(`[Compra vInteligente 6.0] Abortando. Condições: buyModeActive=${state.buyModeActive}, isProcessingBuy=${isProcessingBuy}, buyPausedUntil=${state.buyPausedUntil ? new Date(state.buyPausedUntil) : null}, now=${new Date(now)}, isProcessingSell=${isProcessingSell}`); // Log Opcional
        return;
     }

    console.log("[Compra vInteligente 6.0 - MAIN THREAD] Iniciando verificação..."); // Log Opcional
    isProcessingBuy = true; // Marca como processando AGORA

    // Busca dados pré-worker
    try {
        await fetchIncomingResources();
        state.storageCapacity = getStorageCapacity();
        console.log(`[Compra vInteligente 6.0 - MAIN THREAD] Recursos chegando e capacidade atualizados. Capacidade: ${state.storageCapacity}`); // Log Opcional
    } catch (error) {
        console.error("[Compra vInteligente 6.0 - MAIN THREAD] Erro ao buscar dados pré-worker:", error);
        isProcessingBuy = false; // Reset se falhar aqui
        return;
    }

    // Verifica PP
    const availablePP = getAvailablePremiumPoints();
    const premiumInput = ui.getElement("premiumPointsInput");
    const maxPP = premiumInput ? sanitizeNumber(premiumInput.value) : Infinity;
    const effectivePP = Math.min(availablePP, maxPP);
    if (effectivePP <= 0) {
        console.log("[Compra vInteligente 6.0 - MAIN THREAD] PP efetivo zerado."); // Log Opcional
        isProcessingBuy = false; // Reset se não tiver PP
        return;
    }

    // --- Monta dados para o Worker ---
    // Passa a TAXA DE VENDA para o worker, usada como base dos múltiplos
    const workerResourcesData = Object.keys(resources).map(name => {
        const handler = resources[name];
        if (!handler) return null;
        const desiredStockInput = document.querySelector(`.rate-input[data-resource="${name}-stock"]`);
        const userRateLimitInput = document.querySelector(`.rate-input[data-resource="${name}"]`); // Taxa MÍNIMA de COMPRA do user
        const buyLimitPerTimeInput = document.querySelector('.rate-input[data-resource="buy-per-time"]');
        const desiredStock = sanitizeNumber(desiredStockInput?.value) || 0;
        const userRateLimit = sanitizeNumber(userRateLimitInput?.value) || 0;
        const buyLimitPerTime = sanitizeNumber(buyLimitPerTimeInput?.value) || Infinity;
        const marketSellRate = handler.getMarketValue(); // TAXA DE VENDA (base dos múltiplos)
        return { name, desiredStock, marketRate: marketSellRate, userRateLimit, buyLimitPerTime };
    }).filter(data => data !== null);

    if (typeof currentResources === 'undefined') { console.error("[Compra vInteligente 6.0 - MAIN THREAD] currentResources não definida!"); isProcessingBuy = false; return; }

    const workerData = { action: "calculateBuyAmount", data: {
            resources: workerResourcesData,
            effectivePP: effectivePP,
            storageCapacity: state.storageCapacity,
            incomingResources: mobx.toJS(state.incomingResources),
            currentResources: mobx.toJS(currentResources)
        }};
    // --- Fim Montagem Worker ---

    console.log("[Compra vInteligente 6.0 - MAIN THREAD] Enviando dados para o Worker:", workerData); // Log Opcional
    worker.postMessage(workerData);

    // =======================================================================
    // === INÍCIO: NOVA CALLBACK worker.onmessage (Lida com Lista Ordenada) ===
    // =======================================================================
    worker.onmessage = async (e) => {
        console.log("[Compra vInteligente 6.0 - MAIN THREAD] Mensagem recebida do Worker:", e.data); // Log principal

        // Verifica hCaptcha logo ao receber a mensagem
        if (checkAndHandleHCaptcha()) {
             console.warn("[Compra vInteligente 6.0 - MAIN THREAD] hCaptcha detectado após receber resposta do worker. Abortando.");
             if (isProcessingBuy) isProcessingBuy = false; // Garante reset
             return;
        }

        // Verifica se ocorreu um erro no worker
        if (e.data.error) {
            console.error("[Compra vInteligente 6.0 - MAIN THREAD] Erro retornado pelo Worker:", e.data.error);
            isProcessingBuy = false;
            return;
        }

        // Verifica se a ação é a esperada e se temos a lista
        if (e.data.action === "buyAmountCalculated" && Array.isArray(e.data.result?.rankedBuyOptions)) {
            const rankedBuyOptions = e.data.result.rankedBuyOptions;
            console.log(`[Compra vInteligente 6.0 - MAIN THREAD] Worker retornou ${rankedBuyOptions.length} opções ordenadas.`);

            if (rankedBuyOptions.length === 0) {
                console.log("[Compra vInteligente 6.0 - MAIN THREAD] Nenhuma opção de compra viável retornada pelo worker.");
                isProcessingBuy = false;
                return; // Sai se não houver opções
            }

            // --- ITERAÇÃO PELAS OPÇÕES ---
            let buyExecuted = false; // Flag para saber se já executamos uma compra
            for (const option of rankedBuyOptions) {
                const resourceName = option.name;
                const idealAmountFromWorker = option.idealAmount; // Quantidade já limitada por PP/Físico no worker
                const userRateLimit = option.userRateLimit; // Taxa mínima de COMPRA definida pelo user
                const marketSellRateWorker = option.marketRate; // Taxa de VENDA (base dos múltiplos) que o worker usou

                console.log(`\n[Compra vInteligente 6.0 - MAIN THREAD] === Verificando Opção: ${resourceName.toUpperCase()} ===`);
                console.log(` -> Ideal (Worker): ${idealAmountFromWorker}, Taxa Mín. User (Compra): ${userRateLimit}, Taxa Base Múltiplos (Venda): ${marketSellRateWorker}`);

                // Verifica se já estamos processando uma venda (que pode ter iniciado enquanto iteramos)
                if (isProcessingSell) {
                    console.log(`[Compra vInteligente 6.0 - MAIN THREAD ${resourceName}] VENDA em andamento detectada durante a iteração. Abortando restante das compras.`);
                    isProcessingBuy = false; // Reseta flag de compra
                    return; // Para completamente a verificação de compra
                }

                // Pega o handler do recurso e taxas ATUAIS no main thread
                const handler = resources[resourceName];
                if (!handler) {
                    console.warn(`[Compra vInteligente 6.0 - MAIN THREAD ${resourceName}] Handler não encontrado. Pulando opção.`);
                    continue; // Pula para a próxima opção
                }

                // **OBTÉM A TAXA DE COMPRA REAL DO JOGO AGORA**
                const currentMarketBuyRate = handler.getGameRate(); // Função que busca a taxa de COMPRA atual
                console.log(` -> Taxa de COMPRA ATUAL (Jogo): ${currentMarketBuyRate}`);

                // **VERIFICAÇÃO DA TAXA DE COMPRA MÍNIMA DO USUÁRIO**
                if (currentMarketBuyRate <= 0 || (userRateLimit > 0 && currentMarketBuyRate < userRateLimit)) {
                    console.log(`[Compra vInteligente 6.0 - MAIN THREAD ${resourceName}] Taxa de COMPRA (${currentMarketBuyRate}) inválida ou ABAIXO do limite do usuário (${userRateLimit}). Pulando.`);
                    continue; // Pula para a próxima opção
                } else {
                     console.log(` -> Taxa de COMPRA OK (>= ${userRateLimit})`);
                }

                // Pega a taxa de VENDA atual para recalcular múltiplos (pode ter mudado desde o worker)
                const currentMarketSellRate = handler.getMarketValue(); // Taxa de VENDA ATUAL
                console.log(` -> Taxa de VENDA ATUAL (Múltiplos): ${currentMarketSellRate}`);

                // ================================================================
                // === INÍCIO: LÓGICA DE AJUSTE PRECISO (v1.5 - Adaptada para Loop) ===
                // ================================================================

                // 1. Verifica taxa de venda (base dos múltiplos)
                if (currentMarketSellRate <= 0) {
                    console.warn(`[Compra Inteligente 6.0 ${resourceName}] Taxa de VENDA base ATUAL inválida (${currentMarketSellRate}). Pulando opção.`);
                    continue; // Pula para a próxima opção
                }

                // 2. Busca dados de estoque/capacidade ATUAIS
                const currentStock = currentResources[resourceName] || 0;
                const incomingStock = state.incomingResources[resourceName] || 0;
                const warehouseCapacity = state.storageCapacity || 0;

                // 3. Calcula espaço disponível REAL
                const availableSpace = Math.max(0, warehouseCapacity - currentStock - incomingStock);
                console.log(` -> Espaço Disponível Real: ${availableSpace} (Cap: ${warehouseCapacity} - Atual: ${currentStock} - Chegando: ${incomingStock})`);

                // 4. Define estimativa da taxa do JOGO (taxa de 5% na compra)
                const GAME_BUY_FEE_PERCENTAGE = 0.05; // 5% (Ajustável)

                // 5. Calcula espaço EFETIVO (considerando taxa jogo)
                const effectiveAvailableSpace = Math.floor(availableSpace / (1 + GAME_BUY_FEE_PERCENTAGE));
                console.log(` -> Espaço Efetivo (taxa jogo ${GAME_BUY_FEE_PERCENTAGE*100}%): ${effectiveAvailableSpace}`);

                // 6. Determina quantidade MÁXIMA antes de múltiplos (usa espaço efetivo e o ideal do worker)
                const maxBeforeMultiples = Math.min(idealAmountFromWorker, effectiveAvailableSpace);
                console.log(` -> Máximo antes dos múltiplos: ${maxBeforeMultiples} (min(IdealWorker: ${idealAmountFromWorker}, EspaçoEfetivo: ${effectiveAvailableSpace}))`);

                // 7. Calcula o NÚMERO MÁXIMO de pacotes (baseado na taxa de VENDA atual) que cabem
                const maxNumMultiples = Math.floor(maxBeforeMultiples / currentMarketSellRate);
                console.log(` -> Número Máximo de Pacotes (Taxa Venda ${currentMarketSellRate}) Possíveis: ${maxNumMultiples}`);

                // 8. Verifica se cabe pelo menos um pacote
                if (maxNumMultiples < 1) {
                    console.warn(`[Compra Inteligente 6.0 ${resourceName}] FALHOU: Não cabe nem 1 pacote (Máx Efetivo: ${maxBeforeMultiples} < Taxa Venda: ${currentMarketSellRate}). Pulando.`);
                    continue; // Pula para a próxima opção
                }

                // 9. Calcula a quantidade MÁXIMA que é múltiplo e cabe
                const amountMultipleBased = maxNumMultiples * currentMarketSellRate;
                console.log(` -> Quantidade Máxima Baseada em Múltiplos: ${amountMultipleBased}`);

                // 10. Calcula o spread do SCRIPT (usando a taxa de COMPRA atual)
                const scriptBuySpread = calculateBuySpread(resourceName, currentMarketBuyRate, { marketTrends: mobx.toJS(state.marketTrends) });
                console.log(` -> Spread do Script calculado: ${(scriptBuySpread * 100).toFixed(2)}% (Base Taxa Compra: ${currentMarketBuyRate})`);

                // 11. Reduz a quantidade (amountMultipleBased) pelo spread do SCRIPT
                const amountReducedBySpread = Math.floor(amountMultipleBased / (1 + scriptBuySpread));
                console.log(` -> Quantidade Reduzida pelo Spread Script: ${amountReducedBySpread} ( ${amountMultipleBased} / ${(1 + scriptBuySpread).toFixed(3)} )`);

                // 12. Reajusta para o maior múltiplo da TAXA DE VENDA que seja <= amountReducedBySpread
                               // 12. **NOVO (v6.1):** Usa diretamente a quantidade reduzida pelo spread (sem forçar múltiplo da taxa de VENDA)
                const finalAmountToBuy = amountReducedBySpread; // Atribuição direta
                console.log(` -> Quantidade FINAL para INPUT (Pós-Spread): ${finalAmountToBuy}`); // Log ATUALIZADO

                // 13. Última verificação
                if (finalAmountToBuy <= 0) {
                    console.warn(`[Compra Inteligente 6.0 ${resourceName}] FALHOU: Quantidade final é zero ou negativa após spread/reajuste. Pulando.`);
                    continue; // Pula para a próxima opção
                }

                // ================================================================
                // === FIM: LÓGICA DE AJUSTE PRECISO (v1.5 - Adaptada para Loop) ===
                // ================================================================

                // ***** SUCESSO! Encontramos uma opção viável *****
                console.log(`[Compra Inteligente 6.0 ${resourceName}] SUCESSO! Opção VÁLIDA encontrada. Quantidade: ${finalAmountToBuy}. Iniciando transação...`);

                // Salva estado pré-compra no localStorage (igual a antes)
                const currentPPLimit = sanitizeNumber(ui.getElement("premiumPointsInput")?.value) || 0;
                const currentPPBalance = getAvailablePremiumPoints();
                try {
                    localStorage.setItem('aquila_ppLimitBeforeBuy', String(currentPPLimit));
                    localStorage.setItem('aquila_ppBalanceBeforeBuy', String(currentPPBalance));
                    console.log(` -> Salvo no localStorage - Limite: ${currentPPLimit}, Saldo: ${currentPPBalance}`);
                } catch (storageError) {
                    console.error(`[Compra Inteligente 6.0 ${resourceName}] Erro crítico ao salvar localStorage ANTES da compra:`, storageError);
                    // Considerar abortar aqui? Ou deixar a compra tentar mesmo assim? Por segurança, vamos abortar.
                    isProcessingBuy = false; // Reseta a flag
                    return; // Aborta o onmessage
                }

                // Executa a transação com a quantidade FINAL e VÁLIDA
                try {
                    buyExecuted = true; // Marca que vamos executar
                    await executeTransaction("buy", handler, finalAmountToBuy);
                    // A flag isProcessingBuy será resetada DENTRO de executeTransaction ou em seu callback/timeout
                    // Não precisamos resetar aqui.
                    console.log(`[Compra Inteligente 6.0 ${resourceName}] Chamada para executeTransaction enviada.`);
                    return; // *** IMPORTANTE: Sai do onmessage após iniciar a PRIMEIRA compra bem-sucedida ***
                } catch (txError) {
                    console.error(`[Compra Inteligente 6.0 ${resourceName}] Erro durante executeTransaction:`, txError);
                    // Limpa o storage se a execução falhar
                    localStorage.removeItem('aquila_ppBalanceBeforeBuy');
                    localStorage.removeItem('aquila_ppBalanceBeforeBuy');
                    buyExecuted = false; // Marca que a execução falhou
                    // isProcessingBuy deve ser resetado dentro de executeTransaction mesmo em erro
                    // Continua o loop para tentar a próxima opção, se houver.
                    console.warn(`[Compra Inteligente 6.0 ${resourceName}] Falha ao executar transação. Tentando próxima opção...`);
                    continue; // Tenta a próxima opção do loop
                }
            } // --- FIM DO LOOP pelas opções ---

            // Se o loop terminar e NENHUMA compra foi executada
            if (!buyExecuted) {
                console.log("[Compra vInteligente 6.0 - MAIN THREAD] Nenhuma opção viável encontrada após verificar todas as candidatas.");
                isProcessingBuy = false; // Reseta a flag aqui, pois nenhuma compra foi iniciada
            }

        } else {
            // Se a ação não for 'buyAmountCalculated' ou o resultado não for um array
            console.warn("[Compra vInteligente 6.0 - MAIN THREAD] Resposta inesperada do Worker:", e.data);
            isProcessingBuy = false;
        }
    }; // --- FIM worker.onmessage ---
    // =======================================================================
    // === FIM: NOVA CALLBACK worker.onmessage (Lida com Lista Ordenada) =====
    // =======================================================================

    // Mantém o onerror como estava
    worker.onerror = (error) => {
        console.error("[Compra Inteligente 6.0 - MAIN THREAD] Erro GERAL no Worker:", error);
        isProcessingBuy = false;
    };

  }; // --- Fim da função processBuyBasedOnResources (vCompraInteligente 6.0) ---













  function getAvailablePremiumPoints() {
    const premiumElement = document.querySelector("#premium_points");
    return premiumElement ? sanitizeNumber(premiumElement.textContent.trim()) : 0;
  }
  const resetBuyInputs = () => ui.buyInputs.forEach((input) => input && (input.value = ""));
  const updateMaxSpend = (change) => {
    const currentValue = sanitizeNumber(ui.getElement("maxSpendInput").value);
    const newValue = Math.max(0, currentValue + change);
    ui.getElement("maxSpendInput").value = newValue;
    localStorage.setItem("max-spend", String(newValue));
    ////console.log(`[UpdateMaxSpend] Novo valor de maxSpend: ${newValue}`);
  };
  const fetchTransportData = async () => {
    const gameData = TribalWars.getGameData();
    const villageId = gameData.village.id;
    const world = getActiveWorld();
    const url = `https://${world}.tribalwars.com.br/game.php?village=${villageId}&screen=market&mode=transports`;
    try {
      const response = await fetchMarketData(url);
      if (!response) throw new Error("Falha ao buscar dados de transporte");
      const doc = new DOMParser().parseFromString(response, "text/html");
      const transportRows = doc.querySelectorAll(".transport_row");
      const incomingResources = {
        wood: 0,
        stone: 0,
        iron: 0
      };
      transportRows.forEach((row) => {
        const direction = row.querySelector(".transport_direction").textContent;
        if (direction.includes("Para esta aldeia")) {
          const resourceType = row.querySelector(".transport_resource").dataset.type;
          const amount = sanitizeNumber(row.querySelector(".transport_amount").textContent);
          incomingResources[resourceType] += amount;
        }
      });
      return incomingResources;
    } catch (error) {
      console.error("[Transporte] Falha ao obter dados:", error);
      return { wood: 0, stone: 0, iron: 0 };
    }
  };
  const transportLogger = {
    log: () => {
    },
    // Does nothing
    error: () => {
    },
    // Does nothing
    warn: () => {
    },
    // Does nothing
    debug: () => {
    }
    // Does nothing
  };
  function parseIntSafeTransport(str) {
    if (typeof str !== "string" || !str) return 0;
    const cleanedStr = str.replace(/[.,]/g, "").replace(/[^\d]/g, "");
    const num = parseInt(cleanedStr, 10);
    return isNaN(num) ? 0 : num;
  }
  function extractResourcesFromElement(element) {
    const resources2 = { wood: 0, stone: 0, iron: 0 };
    if (!element) return resources2;
    const woodIcon = element.querySelector(".icon.header.wood");
    const stoneIcon = element.querySelector(".icon.header.stone");
    const ironIcon = element.querySelector(".icon.header.iron");
    const getValueNearIcon = (icon) => {
      if (!icon) return 0;
      let potentialValueElement = icon.nextElementSibling;
      if (potentialValueElement && potentialValueElement.textContent.match(/[\d.,]+/)) {
        if (!potentialValueElement.querySelector(".icon.header")) {
          return parseIntSafeTransport(potentialValueElement.textContent);
        }
      }
      let nextNode = icon.nextSibling;
      while (nextNode && nextNode.nodeType !== Node.TEXT_NODE) {
        if (nextNode.nodeType === Node.ELEMENT_NODE && nextNode.textContent.match(/[\d.,]+/)) {
          if (!nextNode.querySelector(".icon.header")) {
            return parseIntSafeTransport(nextNode.textContent);
          }
        }
        nextNode = nextNode.nextSibling;
      }
      if (nextNode && nextNode.nodeType === Node.TEXT_NODE) {
        const numberMatch = nextNode.textContent.trim().match(/^[\s]*([\d.,]+)/);
        if (numberMatch) {
          return parseIntSafeTransport(numberMatch[1]);
        }
      }
      let parent = icon.parentElement;
      if (parent && parent.textContent) {
        const parentText = parent.textContent.trim();
        const potentialValues = parentText.match(/([\d.,]+)/g);
        if (potentialValues && potentialValues.length >= 1) {
        }
      }
      return 0;
    };
    resources2.wood = getValueNearIcon(woodIcon);
    resources2.stone = getValueNearIcon(stoneIcon);
    resources2.iron = getValueNearIcon(ironIcon);
    if (resources2.wood === 0 && resources2.stone === 0 && resources2.iron === 0 && (woodIcon || stoneIcon || ironIcon)) {
      transportLogger.debug("Icon-based extraction failed, attempting text-based fallback within element:", element.textContent.substring(0, 100));
      const textContent = element.textContent || "";
      const numbers = (textContent.match(/[\d.,]+/g) || []).map((n) => parseIntSafeTransport(n));
      let numIndex = 0;
      if (woodIcon && numIndex < numbers.length) {
        resources2.wood = numbers[numIndex];
        numIndex++;
      }
      if (stoneIcon && numIndex < numbers.length) {
        resources2.stone = numbers[numIndex];
        numIndex++;
      }
      if (ironIcon && numIndex < numbers.length) {
        resources2.iron = numbers[numIndex];
        numIndex++;
      }
      transportLogger.debug(" - Text fallback results:", resources2);
      if (numIndex === 1 && [woodIcon, stoneIcon, ironIcon].filter(Boolean).length > 1) {
        transportLogger.warn("Single number found for multiple icons via text fallback, resetting as likely incorrect.");
        return { wood: 0, stone: 0, iron: 0 };
      }
    }
    return resources2;
  }
  function parseTransportData(html) {
    transportLogger.log("Iniciando parseamento da p\xE1gina de transportes.");
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const incoming = { madeira: 0, argila: 0, ferro: 0 };
    let foundIncomingData = false;
    const allText = doc.body.textContent.toLowerCase();
    if (allText.includes("n\xE3o h\xE1 transportes chegando") || allText.includes("nenhum transporte em chegada") || allText.includes("no incoming transports") || allText.includes("\u043D\u0435\u0442 \u0432\u0445\u043E\u0434\u044F\u0449\u0438\u0445 \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u043E\u0432")) {
      transportLogger.log("P\xE1gina indica explicitamente que n\xE3o h\xE1 transportes de chegada.");
      return incoming;
    }
    let incomingTable = null;
    incomingTable = doc.querySelector("#market_transports_in table.vis, #market_transports_in, #market_status_in table.vis");
    if (!incomingTable) {
      const headers = Array.from(doc.querySelectorAll("h2, h3, h4, .content-header, .box-header, th, .table-header"));
      const incomingKeywords = [
        "transportes em chegada",
        "entrando",
        "incoming transports",
        "chegando",
        "mercadores chegando",
        "arrival",
        "\u043F\u0440\u0438\u0431\u044B\u0432\u0430\u044E\u0449\u0438\u0435 \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u044B",
        "chegada",
        "transporte de entrada",
        "transporte chegando",
        "\u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442 \u043F\u0440\u0438\u0431\u044B\u0442\u0438\u044F"
      ];
      for (const header of headers) {
        const headerText = header.textContent.trim().toLowerCase();
        if (incomingKeywords.some((keyword) => headerText.includes(keyword))) {
          transportLogger.log(`Cabe\xE7alho de chegada encontrado: "${headerText}"`);
          let current = header;
          let searchLimit = 5;
          while (current && searchLimit > 0) {
            if (current.tagName === "TABLE" && current.classList.contains("vis")) {
              incomingTable = current;
              break;
            }
            const tableInside = current.querySelector("table.vis");
            if (tableInside) {
              incomingTable = tableInside;
              break;
            }
            current = current.nextElementSibling;
            searchLimit--;
          }
          if (incomingTable) {
            transportLogger.log(`Tabela de chegada encontrada pr\xF3xima ao cabe\xE7alho "${headerText}"`);
            break;
          }
        }
      }
    }
    if (incomingTable) {
      transportLogger.log("Processando tabela de chegada encontrada...");
      const rows = Array.from(incomingTable.querySelectorAll("tr")).filter(
        (row) => !row.querySelector("th") && row.cells && row.cells.length > 1
      );
      const summaryRow = Array.from(incomingTable.querySelectorAll("tr")).find((row) => {
        const text = row.textContent.toLowerCase();
        return (text.includes("total:") || text.includes("soma:") || text.includes("summe:") || text.includes("\u0438\u0442\u043E\u0433\u043E:") || text.includes("entrada:")) && !row.querySelector("th");
      });
      if (summaryRow) {
        transportLogger.log("Processando linha de sum\xE1rio de chegada...");
        const resources2 = extractResourcesFromElement(summaryRow);
        if (resources2.wood > 0 || resources2.stone > 0 || resources2.iron > 0) {
          incoming.madeira = resources2.wood;
          incoming.argila = resources2.stone;
          incoming.ferro = resources2.iron;
          foundIncomingData = true;
          transportLogger.log("Recursos extra\xEDdos da linha de sum\xE1rio:", incoming);
        }
      } else if (rows.length > 0) {
        transportLogger.log(`Processando ${rows.length} linhas de dados na tabela de chegada...`);
        rows.forEach((row, index) => {
          const resources2 = extractResourcesFromElement(row);
          if (resources2.wood > 0 || resources2.stone > 0 || resources2.iron > 0) {
            incoming.madeira += resources2.wood;
            incoming.argila += resources2.stone;
            incoming.ferro += resources2.iron;
            foundIncomingData = true;
            transportLogger.debug(`Linha ${index}: Recursos adicionados: W=${resources2.wood}, S=${resources2.stone}, I=${resources2.iron}`);
          }
        });
        transportLogger.log("Total de recursos encontrados:", incoming);
      } else {
        transportLogger.warn("Tabela de chegada encontrada, mas sem linhas de dados ou sum\xE1rio reconhec\xEDvel.");
      }
    } else {
      transportLogger.warn("Nenhuma tabela espec\xEDfica de chegada encontrada. Tentando estrat\xE9gia alternativa...");
    }
    if (!foundIncomingData) {
      transportLogger.log("Buscando linhas de transporte gerais e verificando dire\xE7\xE3o...");
      const allPossibleRows = [
        ...doc.querySelectorAll(".transport_row"),
        ...doc.querySelectorAll('tr[id^="market_"]'),
        ...doc.querySelectorAll("tr.row_a, tr.row_b"),
        // Padrão comum de linhas alternadas
        ...doc.querySelectorAll("table.vis tr:not(:first-child)")
        // Todas as linhas não-cabeçalho de qualquer tabela
      ];
      if (allPossibleRows.length > 0) {
        transportLogger.log(`Encontradas ${allPossibleRows.length} poss\xEDveis linhas de transporte para an\xE1lise.`);
        allPossibleRows.forEach((row, index) => {
          let isIncoming = false;
          const rowText = row.textContent.toLowerCase();
          const rowHTML = row.innerHTML.toLowerCase();
          const incomingKeywords = [
            "para esta aldeia",
            "incoming",
            "arrival",
            "chegada",
            "chegando",
            "entrada",
            "para c\xE1",
            "entrando",
            "recebendo"
          ];
          const incomingSymbols = [
            "arrow_right",
            "arrow_in",
            "icon_in",
            "\u2192",
            "\u25B6",
            "\u21E8"
          ];
          if (incomingKeywords.some((keyword) => rowText.includes(keyword)) || incomingSymbols.some((symbol) => rowHTML.includes(symbol))) {
            isIncoming = true;
          }
          const directionElement = row.querySelector(".transport_direction, .direction, .movement-direction");
          if (directionElement) {
            const directionText = directionElement.textContent.trim().toLowerCase();
            const directionHTML = directionElement.innerHTML.toLowerCase();
            if (incomingKeywords.some((keyword) => directionText.includes(keyword)) || incomingSymbols.some((symbol) => directionHTML.includes(symbol))) {
              isIncoming = true;
            }
          }
          if (isIncoming) {
            transportLogger.debug(`Linha ${index} identificada como CHEGANDO`);
            const resourceCell = row.querySelector(".resources_sum, .res") || row;
            const resources2 = extractResourcesFromElement(resourceCell);
            if (resources2.wood > 0 || resources2.stone > 0 || resources2.iron > 0) {
              incoming.madeira += resources2.wood;
              incoming.argila += resources2.stone;
              incoming.ferro += resources2.iron;
              foundIncomingData = true;
              transportLogger.debug(`Recursos adicionados: W=${resources2.wood}, S=${resources2.stone}, I=${resources2.iron}`);
            }
          }
        });
      } else {
        transportLogger.error("Nenhuma linha de transporte encontrada em toda a p\xE1gina.");
      }
    }
    if (!foundIncomingData) {
      transportLogger.log("Tentando encontrar elementos de sum\xE1rio de recursos...");
      const summaryElements = [
        doc.querySelector("#market_status_in"),
        doc.querySelector(".incoming-resources"),
        doc.querySelector(".resources-incoming"),
        ...doc.querySelectorAll(".sum_incoming"),
        ...doc.querySelectorAll(".incoming_total")
      ].filter(Boolean);
      for (const element of summaryElements) {
        const resources2 = extractResourcesFromElement(element);
        if (resources2.wood > 0 || resources2.stone > 0 || resources2.iron > 0) {
          incoming.madeira = resources2.wood;
          incoming.argila = resources2.stone;
          incoming.ferro = resources2.iron;
          foundIncomingData = true;
          transportLogger.log("Recursos encontrados em elemento de sum\xE1rio:", incoming);
          break;
        }
      }
    }
    if (foundIncomingData) {
      transportLogger.log("Parseamento conclu\xEDdo com sucesso. Recursos CHEGANDO:", incoming);
      return { madeira: incoming.madeira, argila: incoming.argila, ferro: incoming.ferro };
    } else {
      transportLogger.error("N\xE3o foi poss\xEDvel encontrar dados de transportes em chegada na p\xE1gina.");
      return { madeira: 0, argila: 0, ferro: 0 };
    }
  }
  async function fetchIncomingResources() {
    return new Promise((resolve, reject) => {
      const gameData = typeof TribalWars !== "undefined" && TribalWars.getGameData ? TribalWars.getGameData() : {};
      const villageId = gameData.village?.id;
      if (!villageId) {
        transportLogger.error("[Fetch] ID da vila n\xE3o encontrado.");
        mobx.runInAction(() => {
          state.incomingResources.wood = 0;
          state.incomingResources.stone = 0;
          state.incomingResources.iron = 0;
        });
        return resolve({ wood: 0, stone: 0, iron: 0 });
      }
      const transportUrl = `https://${window.location.host}/game.php?village=${villageId}&screen=market&mode=transports`;
      transportLogger.log(`[Fetch] Buscando dados de transporte de: ${transportUrl}`);
      GM_xmlhttpRequest({
        method: "GET",
        url: transportUrl,
        timeout: 15e3,
        // Timeout can be adjusted
        onload: (response) => {
          if (response.status >= 200 && response.status < 300) {
            transportLogger.log("[Fetch] Resposta da p\xE1gina de transporte recebida (Status OK).");
            try {
              const incomingData = parseTransportData(response.responseText);
              if (incomingData === null) {
                transportLogger.error("[Fetch] parseTransportData retornou null (falha ao encontrar/parsear dados). Resolvendo com recursos zerados.");
                mobx.runInAction(() => {
                  state.incomingResources.wood = 0;
                  state.incomingResources.stone = 0;
                  state.incomingResources.iron = 0;
                });
                resolve({ wood: 0, stone: 0, iron: 0 });
              } else {
                transportLogger.log("[Fetch] Atualizando state.incomingResources:", incomingData);
                mobx.runInAction(() => {
                  state.incomingResources.wood = incomingData.madeira || 0;
                  state.incomingResources.stone = incomingData.argila || 0;
                  state.incomingResources.iron = incomingData.ferro || 0;
                });
                resolve({
                  wood: state.incomingResources.wood,
                  // Resolve with state values
                  stone: state.incomingResources.stone,
                  iron: state.incomingResources.iron
                });
              }
            } catch (parseError) {
              transportLogger.error(`[Fetch] Erro durante o parseamento: ${parseError.message}`, parseError);
              mobx.runInAction(() => {
                state.incomingResources.wood = 0;
                state.incomingResources.stone = 0;
                state.incomingResources.iron = 0;
              });
              reject(parseError);
            }
          } else {
            transportLogger.error(`[Fetch] Falha ao buscar dados de transporte. Status: ${response.status}`);
            mobx.runInAction(() => {
              state.incomingResources.wood = 0;
              state.incomingResources.stone = 0;
              state.incomingResources.iron = 0;
            });
            reject(new Error(`HTTP error! status: ${response.status}`));
          }
        },
        onerror: (error) => {
          transportLogger.error(`[Fetch] Erro na requisi\xE7\xE3o GM_xmlhttpRequest:`, error);
          mobx.runInAction(() => {
            state.incomingResources.wood = 0;
            state.incomingResources.stone = 0;
            state.incomingResources.iron = 0;
          });
          reject(error);
        },
        ontimeout: () => {
          transportLogger.error("[Fetch] Requisi\xE7\xE3o para transportes expirou (timeout).");
          mobx.runInAction(() => {
            state.incomingResources.wood = 0;
            state.incomingResources.stone = 0;
            state.incomingResources.iron = 0;
          });
          reject(new Error("Transport request timed out"));
        }
      });
    });
  }
  const calculateSellAmount = (resource, merchantsAvailable) => {
    const marketValue = resource.getMarketValue();
    const total = resource.getTotal();
    const reserveAmount = resource.getReserved();
    const available = Math.max(0, total - reserveAmount);
    const minRate = resource.getReserveRate();
    if (marketValue >= minRate) return 0;
    const sellLimitSelector = `[data-resource="sell-limit${resource.name === "wood" ? "" : `-${resource.name}`}"]`;
    const sellLimitInput = document.querySelector(sellLimitSelector);
    const perTransactionLimit = sellLimitInput ? sanitizeNumber(sellLimitInput.value) : Infinity;
    const merchantCapacity = merchantsAvailable * 1e3;
    const grossAmount = Math.min(
      available,
      // Não ultrapassar recursos disponíveis
      merchantCapacity,
      // Limite de carga dos mercadores
      perTransactionLimit
      // Limite por transação do usuário
    );
    const netAmount = Math.floor(grossAmount * 0.9);
    return Math.max(0, netAmount);
  };
  const enforceMerchantLimit = true;
  const unitSize = 100;
  const FIXED_FEE = 100;
  const minProfitThreshold = 1;
  const dataCache = /* @__PURE__ */ new Map();
  let isProcessingSell = false;





    const workerScript = `
self.onmessage = function(e) {
    const { action, data } = e.data;
    switch (action) {
        case 'calculateSellAmount':
            const sellResult = calculateSellAmount(data);
            self.postMessage({ action: 'sellAmountCalculated', result: sellResult });
            break;
        case 'calculateBuyAmount':
            // Chama a NOVA versão de calculateBuyAmount que retorna a lista ranqueada
            const buyResult = calculateBuyAmount(data);
            // Envia a mensagem de volta com a lista
            self.postMessage({ action: 'buyAmountCalculated', result: buyResult });
            break;
        default:
            self.postMessage({ error: 'Ação desconhecida' });
    }
};

// Função calculateSellAmount (MANTIDA COMO ANTES)
function calculateSellAmount(data) {
    const { resources, merchantsAvailable, state, config } = data;

    const resourceData = resources.map(r => {
        const marketRate = r.marketRate;
        const minRate = r.minRate;
        const total = r.total;
        const reserve = r.reserve;
        const available = Math.max(0, total - reserve);
        const sellLimit = r.sellLimit;
        const marketCapacityRaw = r.marketCapacityRaw;
        const dynamicFee = calculateDynamicFee(r, state);
        const maxFromMarket = Math.floor((marketCapacityRaw - config.FIXED_FEE) / (1 + dynamicFee));
        const maxFromStock = Math.floor((available - config.FIXED_FEE) / (1 + dynamicFee));
        const maxFromMerchants = config.enforceMerchantLimit
            ? Math.floor(((merchantsAvailable * 1000) - config.FIXED_FEE) / (1 + dynamicFee))
            : Infinity;
        const effectiveUserLimit = sellLimit === Infinity ? maxFromStock : sellLimit;
        const maxPossible = Math.min(maxFromStock, maxFromMarket, maxFromMerchants, effectiveUserLimit);
        const maxPossibleAdjusted = Math.floor(maxPossible / config.unitSize) * config.unitSize;
        const maxProfit = maxPossibleAdjusted > 0 ? calculateProfit(r, maxPossibleAdjusted) : 0;

        return {
            resource: r,
            marketRate,
            minRate,
            available,
            sellLimit,
            maxPossibleAdjusted,
            maxProfit,
            exchangeRate: r.exchangeRate // Taxa de câmbio mais recente
        };
    }).filter(r => {
        const effectiveRate = r.marketRate * (1 + (state.marketTrends[r.resource.name] === 'up' ? 0.02 : -0.01));
        return effectiveRate <= r.minRate && r.available > 0;
    }).sort((a, b) => {
        const trendWeightA = state.marketTrends[a.resource.name] === 'down' ? 1.2 : 1;
        const volatilityWeightA = 1 + (state.marketVolatility[a.resource.name] || 0);
        const aScore = a.maxProfit * trendWeightA * volatilityWeightA;

        const trendWeightB = state.marketTrends[b.resource.name] === 'down' ? 1.2 : 1;
        const bVolatilityWeightB = 1 + (state.marketVolatility[b.resource.name] || 0);
        const bScore = b.maxProfit * trendWeightB * bVolatilityWeightB;

        return bScore - aScore || a.exchangeRate - b.exchangeRate;
    });

    if (resourceData.length === 0) {
        return { amountToSell: 0, profit: 0, resourceName: null };
    }

    const topResource = resourceData[0];
    const trendAdjustment = state.marketTrends[topResource.resource.name] === 'up' ? 0.95 : 1.05;
    const dynamicFee = calculateDynamicFee(topResource.resource, state);
    let exchangeRate = topResource.resource.exchangeRate; // Usamos o exchangeRate mais recente

    // Calcula limites iniciais
    const adjustedMarketCapacity = topResource.resource.marketCapacityRaw * trendAdjustment;
    const maxFromMarket = Math.floor((adjustedMarketCapacity - config.FIXED_FEE) / (1 + dynamicFee));
    const maxFromStock = Math.floor((topResource.available - config.FIXED_FEE) / (1 + dynamicFee));
    const maxFromMerchants = config.enforceMerchantLimit
        ? Math.floor(((merchantsAvailable * 1000) - config.FIXED_FEE) / (1 + dynamicFee))
        : Infinity;
    const effectiveUserLimit = topResource.sellLimit === Infinity ? maxFromStock : topResource.sellLimit;

    // Determina a quantidade máxima possível
    let amountToSell = Math.min(maxFromStock, maxFromMarket, maxFromMerchants, effectiveUserLimit);
    if (amountToSell <= 0) {
        return { amountToSell: 0, profit: 0, resourceName: topResource.resource.name };
    }

    // Garante o lucro mínimo e ajusta para múltiplo de exchangeRate
    const minAmountForProfit = Math.ceil(config.minProfitThreshold * exchangeRate);
    amountToSell = Math.max(amountToSell, minAmountForProfit);
    amountToSell = Math.floor(amountToSell / config.unitSize) * config.unitSize;

    if (amountToSell < config.unitSize) {
        return { amountToSell: 0, profit: 0, resourceName: topResource.resource.name };
    }

    // Ajuste otimizado para lucro inteiro e estoque disponível
    let profit = calculateProfit(topResource.resource, amountToSell);
    amountToSell = Math.floor(amountToSell / exchangeRate) * exchangeRate; // Múltiplo de exchangeRate
    profit = calculateProfit(topResource.resource, amountToSell);

    if (profit < config.minProfitThreshold) {
        return { amountToSell: 0, profit: 0, resourceName: topResource.resource.name };
    }

    // Verifica e ajusta o lucro para um valor inteiro viável
    const requiredStock = Math.ceil(amountToSell + config.FIXED_FEE + (amountToSell * dynamicFee));
    if (requiredStock > topResource.available) {
        // Tenta ajustar para o maior lucro inteiro possível dentro do estoque
        let targetProfit = Math.floor(profit);
        while (targetProfit >= config.minProfitThreshold) {
            amountToSell = Math.floor(targetProfit * exchangeRate);
            const requiredStockForTarget = Math.ceil(amountToSell + config.FIXED_FEE + (amountToSell * dynamicFee));
            if (requiredStockForTarget <= topResource.available) {
                profit = targetProfit;
                break;
            }
            targetProfit--;
        }
        if (targetProfit < config.minProfitThreshold) {
            return { amountToSell: 0, profit: 0, resourceName: topResource.resource.name };
        }
    } else if (profit > config.minProfitThreshold) {
        // Tenta alcançar o próximo PP inteiro se houver estoque
        const nextProfit = Math.ceil(profit);
        const nextAmount = Math.ceil(nextProfit * exchangeRate);
        const nextRequiredStock = Math.ceil(nextAmount + config.FIXED_FEE + (nextAmount * dynamicFee));
        if (nextRequiredStock <= topResource.available) {
            amountToSell = nextAmount;
            profit = nextProfit;
        }
    }

    // Nova lógica: Reavaliação dinâmica baseada em mudanças recentes do exchangeRate
    const volatility = state.marketVolatility[topResource.resource.name] || 0;
    if (volatility > 0.1) { // Se a volatilidade for alta (>10%), ajusta a venda com cautela
        const adjustmentFactor = state.marketTrends[topResource.resource.name] === 'up' ? 0.9 : 1.1;
        amountToSell = Math.floor(amountToSell * adjustmentFactor / exchangeRate) * exchangeRate;
        profit = calculateProfit(topResource.resource, amountToSell);
        const newRequiredStock = Math.ceil(amountToSell + config.FIXED_FEE + (amountToSell * dynamicFee));
        if (newRequiredStock > topResource.available || profit < config.minProfitThreshold) {
            return { amountToSell: 0, profit: 0, resourceName: topResource.resource.name };
        }
    }

    return { amountToSell, profit, resourceName: topResource.resource.name };
}


// ============================================================
// === INÍCIO: NOVA FUNÇÃO calculateBuyAmount (Retorna Lista) ===
// ============================================================
function calculateBuyAmount(data) {
    // console.log("[Worker - calculateBuyAmount v6.0 - Ranked List] Iniciando cálculo...", data); // Log de depuração
    const { resources, effectivePP, storageCapacity, incomingResources, currentResources } = data;
    let calculatedOptions = [];

    if (effectivePP <= 0) {
        // console.log("[Worker - calculateBuyAmount v6.0] PP efetivo zerado ou negativo."); // Log de depuração
        return { rankedBuyOptions: [] }; // Retorna lista vazia
    }

    const resourcesToConsider = resources.map(r => {
        const marketRate = r.marketRate || 0; // Taxa de VENDA (base dos múltiplos)
        if (marketRate <= 0) {

            return null; // Ignora recurso com taxa inválida
        }

        const desiredStock = r.desiredStock || 0;
        const currentStock = currentResources[r.name] || 0;
        const incomingStock = incomingResources[r.name] || 0;
        const totalEffectiveStock = currentStock + incomingStock;

        const deficit = Math.max(0, desiredStock - totalEffectiveStock);
        const availableCapacity = Math.max(0, storageCapacity - totalEffectiveStock);

        const userRateLimit = r.userRateLimit || 0; // Taxa de COMPRA MÍNIMA do usuário
        // ATENÇÃO: A taxa de COMPRA do jogo (para calcular o custo PP) não está disponível no worker.
        // Vamos assumir uma taxa de COMPRA igual à de VENDA para *estimar* o custo PP.
        // A verificação real se a taxa de COMPRA é >= userRateLimit deve ser feita no main thread.
        // Por enquanto, o worker apenas calcula o *potencial* de compra.
        const estimatedGameBuyRate = marketRate; // ESTIMATIVA - o main thread validará a taxa real

        // Verifica se o recurso é desejado (tem déficit) e há espaço
        if (deficit <= 0 || availableCapacity <= 0) {

            return null;
        }

        // Calcula o máximo que PODE comprar fisicamente (sem considerar PP ainda)
        const buyLimitPerTime = r.buyLimitPerTime || Infinity;
        const maxPhysicallyPossible = Math.min(deficit, availableCapacity, buyLimitPerTime);

        // Estima o custo em PP para essa quantidade física máxima (usando a taxa de COMPRA estimada)
        const estimatedPPCostForMax = maxPhysicallyPossible > 0 ? Math.ceil(maxPhysicallyPossible / estimatedGameBuyRate) : 0;

        // Calcula quanto podemos comprar GASTANDO NO MÁXIMO effectivePP
        let amountLimitedByPP = 0;
        if (estimatedGameBuyRate > 0) {
             // Quanto recurso custaria EXATAMENTE effectivePP
             let affordableAmountBase = Math.floor(effectivePP * estimatedGameBuyRate);
             let costCheck = Math.ceil(affordableAmountBase / estimatedGameBuyRate);

             // Ajusta se o custo exceder o PP disponível devido ao ceil()
             if (costCheck > effectivePP && effectivePP > 0) {
                 affordableAmountBase = Math.floor((effectivePP - 1) * estimatedGameBuyRate);
             } else if (costCheck <= effectivePP) {
                 // Ok
             } else {
                 affordableAmountBase = 0; // Caso effectivePP seja 0
             }
             amountLimitedByPP = affordableAmountBase;
        }

        // A quantidade *ideal* (limitada por PP e física) que o worker pode calcular
        const idealAmount = Math.max(0, Math.floor(Math.min(maxPhysicallyPossible, amountLimitedByPP)));


        // Só adiciona à lista se a quantidade ideal for maior que zero
        if (idealAmount > 0) {
            return {
                name: r.name,
                marketRate: marketRate, // Taxa de VENDA (para múltiplos)
                userRateLimit: userRateLimit, // Taxa MÍNIMA de COMPRA do user
                idealAmount: idealAmount, // Quantidade calculada (limitada por PP/Físico)
            };
        } else {
            return null; // Não adiciona se não puder comprar nada
        }

    }).filter(r => r !== null); // Remove os nulos

    // Ordena os recursos considerados:
    // 1. Maior Taxa de Mercado (VENDA) primeiro (mantendo a lógica original de prioridade)
    // Pode-se ajustar a ordenação aqui se necessário (ex: por déficit)
    resourcesToConsider.sort((a, b) => b.marketRate - a.marketRate);

    // console.log("[Worker - calculateBuyAmount v6.0] Lista final ordenada:", resourcesToConsider); // Log de depuração

    // Retorna a lista completa e ordenada
    return { rankedBuyOptions: resourcesToConsider };
}
// ============================================================
// === FIM: NOVA FUNÇÃO calculateBuyAmount (Retorna Lista) =====
// ============================================================



// Função calculateDynamicFee (MANTIDA COMO ANTES)
function calculateDynamicFee(resource, state) {
    const marketRate = resource.marketRate;
    const trend = state.marketTrends[resource.name];
    let feePercentage = 0.05;

    if (trend === 'up') feePercentage -= 0.01;
    else if (trend === 'down') feePercentage += 0.015;

    if (marketRate >= 140 && marketRate <= 145) feePercentage = 0.0544;
    else if (marketRate < 120) feePercentage = 0.06;
    else if (marketRate > 150) feePercentage = 0.045;

    return Math.min(Math.max(feePercentage, 0.04), 0.07);
}

// Função calculateProfit (MANTIDA COMO ANTES)
function calculateProfit(resource, amountSold) {
    return Math.floor(amountSold / resource.exchangeRate);
}
`;





















  const worker = new Worker(URL.createObjectURL(new Blob([workerScript], { type: "text/javascript" })));
  function getResourceElement(resource, selector) {
    const base = resource.name === "wood" ? `[data-resource="${selector}"]` : `[data-resource="${selector}-${resource.name}"]`;
    return document.querySelector(base);
  }
  function getGameDataCached() {
    const cacheKey = "gameData";
    if (dataCache.has(cacheKey)) {
      return dataCache.get(cacheKey);
    }
    const gameData = getGameDataSafely();
    if (gameData) {
      dataCache.set(cacheKey, gameData);
    }
    return gameData;
  }
  function getGameDataSafely() {
    if (typeof TribalWars !== "undefined" && TribalWars.getGameData) {
      try {
        return TribalWars.getGameData();
      } catch (e) {
      }
    }
    return null;
  }
  function getMarketCapacity(resource) {
    const resourceName = resource.name;
    try {
      const gameData = getGameDataSafely();
      if (gameData && gameData.market && gameData.market.capacities && gameData.market.capacities[resourceName]) {
        const capacityData = gameData.market.capacities[resourceName];
        const totalCapacityAPI = capacityData.total || 0;
        const currentStockAPI = capacityData.current || 0;
        const capacityAPI = Math.max(0, totalCapacityAPI - currentStockAPI);
      } else {
      }
    } catch (e) {
      console.error(`[getMarketCapacity - ${resourceName}] Erro ao acessar API TribalWars:`, e);
    }
    try {
      const capacityEl = document.querySelector(`#premium_exchange_capacity_${resourceName}`);
      const stockEl = document.querySelector(`#premium_exchange_stock_${resourceName}`);
      if (capacityEl && stockEl) {
        const capacityText = capacityEl.textContent.trim();
        const stockText = stockEl.textContent.trim();
        const parseNumber = (text) => parseInt(String(text || "0").replace(/[^\d]/g, ""), 10) || 0;
        const totalCapacityDOM = parseNumber(capacityText);
        const currentStockDOM = parseNumber(stockText);
        const capacityDOM = Math.max(0, totalCapacityDOM - currentStockDOM);
        return capacityDOM;
      } else {
        //console.warn(`[getMarketCapacity - ${resourceName}] Elementos DOM (#premium_exchange_capacity / #premium_exchange_stock) n\xE3o encontrados.`);
        return 0;
      }
    } catch (e) {
      console.error(`[getMarketCapacity - ${resourceName}] Erro ao ler DOM:`, e);
      return 0;
    }
  }
  function calculateMarketTrend(history) {
    if (history.length < 3) return "neutral";
    const changes = history.slice(-3).map(
      (entry, i, arr) => i > 0 ? entry.rate - arr[i - 1].rate : 0
    );
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    if (avgChange > TREND_SENSITIVITY) return "up";
    if (avgChange < -TREND_SENSITIVITY) return "down";
    return "neutral";
  }
  function calculateMarketVolatility(history) {
    if (history.length < 2) return 0;
    const changes = history.slice(-5).map(
      (entry, i, arr) => i > 0 ? Math.abs(entry.rate - arr[i - 1].rate) : 0
    );
    const maxChange = Math.max(...changes);
    const minChange = Math.min(...changes);
    return (maxChange - minChange) / 100;
  }
  function updateMarketAnalysis(resourceName, currentRate) {
    const now = DateTime.now();
    state.rateHistory[resourceName].push({ rate: currentRate, timestamp: now });
    state.rateHistory[resourceName] = state.rateHistory[resourceName].filter(
      (entry) => now.diff(entry.timestamp, "minutes").minutes <= VOLATILITY_WINDOW
    );
    state.marketTrends[resourceName] = calculateMarketTrend(state.rateHistory[resourceName]);
    state.marketVolatility[resourceName] = calculateMarketVolatility(state.rateHistory[resourceName]);
    state.lastUpdate[resourceName] = now.toLocaleString(DateTime.DATETIME_SHORT);
  }
  function getMarketRate(resource) {
    if (!resource || !resource.name) {
      return 100;
    }
    const selector = `#premium_exchange_rate_${resource.name} > div:nth-child(1)`;
    const rateElement = document.querySelector(selector);
    if (rateElement) {
      const rateText = rateElement.textContent.trim();
      const rate = parseFloat(rateText.replace(/[^0-9.]/g, "")) || 100;
      dataCache.set(`rate_${resource.name}`, rate);
      updateMarketAnalysis(resource.name, rate);
      return rate;
    }
    const cacheKey = `rate_${resource.name}`;
    if (dataCache.has(cacheKey)) {
      const cachedRate = dataCache.get(cacheKey);
      updateMarketAnalysis(resource.name, cachedRate);
      return cachedRate;
    }
    const gameData = getGameDataCached();
    if (gameData && gameData.market && gameData.market.rates) {
      const rate2 = gameData.market.rates[resource.name];
      if (rate2 !== void 0) {
        const parsedRate = parseFloat(rate2) || 100;
        dataCache.set(cacheKey, parsedRate);
        updateMarketAnalysis(resource.name, parsedRate);
        return parsedRate;
      }
    }
    updateMarketAnalysis(resource.name, 100);
    return 100;
  }
  const rateElements = {
    wood: document.querySelector("#premium_exchange_rate_wood > div:nth-child(1)"),
    stone: document.querySelector("#premium_exchange_rate_stone > div:nth-child(1)"),
    iron: document.querySelector("#premium_exchange_rate_iron > div:nth-child(1)")
  };
  const rateObservers = {};
  function setupMarketRateObservers() {
    Object.entries(rateElements).forEach(([resource, element]) => {
      if (element) {
        const observer = new MutationObserver(() => {
          const newRate = sanitizeNumber(element.textContent.trim().replace(/[^0-9.]/g, "")) || 100;
          dataCache.set(`rate_${resource}`, newRate);
          updateMarketAnalysis(resource, newRate);
          if (state.sellModeActive && !isProcessingSell) {
            updateSell();
          }
          if (state.buyModeActive && !isProcessingBuy) {
            processBuyBasedOnResources();
          }
        });
        observer.observe(element, { childList: true, subtree: true, characterData: true });
        rateObservers[resource] = observer;
      } else {
        //console.warn(`${SCRIPT_NAME}: Elemento da taxa de mercado para ${resource} n\xE3o encontrado.`);
      }
    });
  }
  function getSellLimit(resource) {
    const cacheKey = `sellLimit_${resource.name}`;
    if (dataCache.has(cacheKey)) {
      return dataCache.get(cacheKey);
    }
    const sellInputEl = getResourceElement(resource, "sell-limit");
    if (!sellInputEl) {
      return Infinity;
    }
    const val = parseInt(sellInputEl.value, 10);
    const result = isNaN(val) || val <= 0 ? Infinity : val;
    dataCache.set(cacheKey, result);
    return result;
  }
  function getDynamicFee(resource) {
    const marketRate = getMarketRate(resource);
    const trend = state.marketTrends[resource.name];
    let feePercentage = 0.05;
    if (trend === "up") {
      feePercentage -= 0.01;
    } else if (trend === "down") {
      feePercentage += 0.015;
    }
    if (marketRate >= 140 && marketRate <= 145) {
      feePercentage = 0.0544;
    } else if (marketRate < 120) {
      feePercentage = 0.06;
    } else if (marketRate > 150) feePercentage = 0.045;
    return Math.min(Math.max(feePercentage, 0.04), 0.07);
  }
  function getExchangeRate(resource) {
    const cacheKey = `exchange_${resource.name}`;
    const selector = `#premium_exchange_rate_${resource.name} .premium-exchange-sep`;
    const rateEl = document.querySelector(selector);
    if (rateEl) {
      const rateText2 = rateEl.textContent.trim();
      const rate2 = parseFloat(rateText2.replace(/[^0-9.]/g, "")) || 1;
      dataCache.set(cacheKey, rate2);
      return rate2;
    }
    if (dataCache.has(cacheKey)) {
      return dataCache.get(cacheKey);
    }
    const gameData = getGameDataCached();
    if (gameData && gameData.market && gameData.market.exchangeRates) {
      const exchangeRate = gameData.market.exchangeRates[resource.name];
      if (exchangeRate !== void 0) {
        const parsedRate = parseFloat(exchangeRate) || 1;
        dataCache.set(cacheKey, parsedRate);
        return parsedRate;
      }
    }
    if (!rateEl) {
      return 1;
    }
    const rateText = rateEl.textContent.trim();
    const rate = parseFloat(rateText.replace(/[^0-9.]/g, "")) || 1;
    dataCache.set(cacheKey, rate);
    return rate;
  }
  function calculateProfit(resource, amountSold) {
    const exchangeRate = getExchangeRate(resource);
    const rate = resource.exchangeRate || getExchangeRate(resource);
    return Math.floor(amountSold / rate);
  }
  function getMerchantsAvailable() {
    const merchantsElement = document.querySelector("#market_merchant_available_count");
    if (merchantsElement) {
      return sanitizeNumber(merchantsElement.textContent);
    }
    return 0;
  }
  function setupMerchantsObserver() {
    const merchantsElement = document.querySelector("#market_merchant_available_count");
    if (merchantsElement) {
      const observer = new MutationObserver(() => {
        const merchantsAvailable = getMerchantsAvailable();
        if (state.sellModeActive && !isProcessingSell) {
          updateSell();
        }
      });
      observer.observe(merchantsElement, { childList: true, subtree: true, characterData: true });
      resourceObservers.merchants = observer;
    } else {
      //console.warn(`${SCRIPT_NAME}: Elemento de contagem de mercadores (#market_merchant_available_count) n\xE3o encontrado.`);
    }
  }
  function setupPremiumObserver() {
    const premiumElement = document.querySelector("#premium_points");
    if (!premiumElement) {
      //console.warn(`${SCRIPT_NAME}: Elemento de Pontos Premium (#premium_points) n\xE3o encontrado para observa\xE7\xE3o.`);
      return;
    }
    const premiumObserver = new MutationObserver(() => {
      if (state.buyModeActive && !isProcessingBuy) {
        processBuyBasedOnResources();
      }
    });
    premiumObserver.observe(premiumElement, {
      childList: true,
      // Observa se o texto dentro muda
      subtree: true,
      // Observa mudanças nos filhos também (caso o número esteja em um <span>)
      characterData: true
      // Importante para detectar mudança no texto do nó
    });
  }
  function setupStorageObserver() {
    const storageElement = document.querySelector("#storage") || document.getElementById("storage");
    if (!storageElement) {
      //console.warn(`${SCRIPT_NAME}: Elemento de Armaz\xE9m (#storage) n\xE3o encontrado para observa\xE7\xE3o.`);
      return;
    }
    const getStorageCapacityFromDOM = () => {
      const capacityElement = document.getElementById("storage");
      if (capacityElement) {
        const text = capacityElement.textContent || "";
        const match = text.match(/(\d[\d.,]*)\s*\/\s*(\d[\d.,]*)/) || text.match(/(\d[\d.,]*)/);
        if (match && match[2]) {
          return sanitizeNumber(match[2].replace(/[.,]/g, ""));
        } else if (match && match[1]) {
          return sanitizeNumber(match[1].replace(/[.,]/g, ""));
        }
      }
      //console.warn(`${SCRIPT_NAME}: N\xE3o foi poss\xEDvel ler a capacidade m\xE1xima do armaz\xE9m do DOM.`);
      return state.storageCapacity || 1e3;
    };
    const storageObserver = new MutationObserver(() => {
      const newCapacity = getStorageCapacityFromDOM();
      if (newCapacity !== state.storageCapacity) {
        state.storageCapacity = newCapacity;
        if (state.buyModeActive && !isProcessingBuy) {
          processBuyBasedOnResources();
        }
      } else {
      }
    });
    storageObserver.observe(storageElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }






  // FUNÇÃO updateSell ATUALIZADA (vMutualExclusion 2.0 + Cooldown Persistente v1.0)
  async function updateSell() {
    // --- COOLDOWN PERSISTENTE CHECK ---
    const COOLDOWN_DURATION = 6000; // 6 segundos
    const lastTxTimeStr = localStorage.getItem('aquila_lastTransactionTime');
    const lastTxTime = lastTxTimeStr ? parseInt(lastTxTimeStr, 10) : null;
    const nowForCooldown = Date.now();
    const timeSinceLastTx = lastTxTime && !isNaN(lastTxTime) ? nowForCooldown - lastTxTime : Infinity;

    if (timeSinceLastTx < COOLDOWN_DURATION) {
        const secondsRemaining = Math.ceil((COOLDOWN_DURATION - timeSinceLastTx) / 1000);
        // console.log(`[Venda v2.1 + Cooldown] Cooldown ativo. Aguardando ${secondsRemaining}s.`);
        return; // Sai cedo se estiver em cooldown
    }
    // --- FIM COOLDOWN PERSISTENTE CHECK ---

    const initialDelay = Math.random() * 200 + 50;
    await new Promise(resolve => setTimeout(resolve, initialDelay));

    // Verifica hCaptcha e outras condições
    if (checkAndHandleHCaptcha()) {
        // console.log("[Venda v2.1] hCaptcha detectado. Abortando.");
        isProcessingSell = false;
        return;
    }

    const now = Date.now(); // Reobtém o 'now'

    // --- VERIFICAÇÕES INICIAIS ---
    // REMOVIDO: if (isSellCooldownActive) { ... }
    if (!state.sellModeActive) { /* console.log("[Venda v2.1] Modo Venda desativado."); */ return; }
    if (isProcessingSell) { /* console.log("[Venda v2.1] Operação de venda já em andamento."); */ return; }
    if (state.sellPausedUntil && state.sellPausedUntil > now) { /* console.log(`[Venda v2.1] PAUSADO TEMPORARIAMENTE.`); */ return; }
    // --- FIM VERIFICAÇÕES INICIAIS ---


    // --- INÍCIO DA LÓGICA DE VENDA ---
    // console.log("[Venda v2.1] Iniciando processo...");
    const merchantsAvailableInitial = getMerchantsAvailable();

    if (enforceMerchantLimit && merchantsAvailableInitial <= 0) {
        // console.log("[Venda v2.1] Nenhum mercador disponível.");
        return; // Sai se não houver mercadores e a verificação estiver ativa
    }

    isProcessingSell = true; // Marca como processando AGORA

    // --- Preparação de Dados para o Web Worker ---
    const resourcesDataForWorker = Object.values(resources)
      .map((resource) => {
          if (!resource || !resource.name) return null;
          const currentTotal = resource.getTotal();
          const currentReserve = resource.getReserved();
          const currentMarketCapacity = getMarketCapacity(resource);
          const currentExchangeRate = getExchangeRate(resource); // Taxa de câmbio atual
          const currentMarketRate = getMarketRate(resource);     // Taxa de mercado atual (PP/unidade)
          const currentMinRate = resource.getReserveRate();       // Taxa mínima definida pelo usuário
          const currentSellLimit = getSellLimit(resource);       // Limite de venda por transação do usuário

          // Log dos dados coletados para o worker
          // console.log(`[Venda v2.1 - Data Prep ${resource.name}] Total: ${currentTotal}, Reserva: ${currentReserve}, CapMercado: ${currentMarketCapacity}, TaxaCambio: ${currentExchangeRate}, TaxaMercado: ${currentMarketRate}, TaxaMinUser: ${currentMinRate}, LimiteVendaUser: ${currentSellLimit}`);

          return {
                name: resource.name,
                marketRate: currentMarketRate,
                minRate: currentMinRate,
                total: currentTotal,
                reserve: currentReserve,
                sellLimit: currentSellLimit,
                marketCapacityRaw: currentMarketCapacity,
                exchangeRate: currentExchangeRate // Inclui a taxa de câmbio
          };
      })
      .filter(data => data !== null);

    const workerData = {
        action: "calculateSellAmount",
        data: {
            resources: resourcesDataForWorker,
            merchantsAvailable: merchantsAvailableInitial,
            state: { marketTrends: mobx.toJS(state.marketTrends), marketVolatility: mobx.toJS(state.marketVolatility) }, // Passa dados do estado
            config: { enforceMerchantLimit, unitSize, FIXED_FEE, minProfitThreshold } // Passa configurações
        }
    };

    // console.log("[Venda v2.1] Enviando dados para Worker:", workerData);

    try {
        worker.postMessage(workerData);
    } catch (error) {
        console.error(`${SCRIPT_NAME}: [Venda v2.1] Erro CRÍTICO ao enviar para Worker:`, error);
        isProcessingSell = false; // RESET
        return;
    }













    // --- Callback para Resposta do Worker ---
    worker.onmessage = async (e) => {
      // console.log("[Venda v2.1] Mensagem recebida do Worker:", e.data);

      if (checkAndHandleHCaptcha()) {
            // console.log("[Venda v2.1 - Worker Callback] hCaptcha detectado. Abortando.");
             if (isProcessingSell) isProcessingSell = false; // Garante reset
            return;
      }

      if (e.data.action === "sellAmountCalculated") {
        const { amountToSell, profit, resourceName } = e.data.result;

        if (amountToSell > 0 && resourceName && resources[resourceName]) {

            // Verifica se COMPRA começou enquanto o worker calculava
            if (isProcessingBuy) {
                console.log("[Venda v2.1 - Worker Result] COMPRA em andamento detectada ANTES de executar. Abortando venda.");
                isProcessingSell = false; // Reseta flag de venda, pois abortamos
                return; // Não chama executeTransaction
            }

            // console.log(`[Venda v2.1 - Worker Result] Decidido vender ${amountToSell} de ${resourceName} por ${profit} PP.`);
            const resource = resources[resourceName];

            // Revalidação final antes de executar
            const latestTotal = resource.getTotal();
            const reserveAmount = resource.getReserved();
            const currentAvailable = Math.max(0, latestTotal - reserveAmount);
            const currentMerchants = getMerchantsAvailable();
            const requiredMerchants = Math.ceil(amountToSell / 1000); // Mercadores necessários

            if (amountToSell <= currentAvailable && (!enforceMerchantLimit || currentMerchants >= requiredMerchants)) {
                // console.log(`[Venda v2.1] Pré-validação final OK (Disponível: ${currentAvailable}, Mercadores: ${currentMerchants} >= ${requiredMerchants}).`);

                // REMOVIDO: isSellCooldownActive = true;
                // REMOVIDO: const cooldownTimeoutId = setTimeout(...)

                try {
                    // executeTransaction já é async e gerencia isProcessingSell
                    await executeTransaction("sell", resource, amountToSell);
                    // Se chegou aqui, executeTransaction chamou scheduleReload e salvou o timestamp
                    notifyUser(`${i18n.t("profit")}: <span class="icon header premium"></span> ${profit}`, "success");
                    // mobx.runInAction(() => { state.hasExecutedSell = true; }); // Opcional
                } catch (txError) {
                     console.error(`[Venda v2.1] Erro executeTransaction ${resourceName}:`, txError);
                     // REMOVIDO: isSellCooldownActive = false;
                     // REMOVIDO: clearTimeout(cooldownTimeoutId);
                     // isProcessingSell é resetado dentro de executeTransaction
                }

            } else {
                let reason = amountToSell > currentAvailable ? `Recursos insuficientes (${currentAvailable} < ${amountToSell})` : `Mercadores insuficientes (${currentMerchants} < ${requiredMerchants})`;
                console.warn(`[Venda v2.1] Transação CANCELADA na pré-validação final: ${reason}`);
                isProcessingSell = false; // RESET se pré-validação falhar
            }
        } else {
          // console.log("[Venda v2.1 - Worker Result] Nenhuma venda recomendada.");
          isProcessingSell = false; // RESET se worker não recomendar venda
        }

      } else if (e.data.error) {
        console.error(`${SCRIPT_NAME}: [Venda v2.1 Worker Callback] Erro recebido:`, e.data.error);
        isProcessingSell = false; // RESET
      } else {
        console.warn("[Venda v2.1 Worker Callback] Ação inesperada:", e.data.action);
        isProcessingSell = false; // RESET
      }
    }; // Fim worker.onmessage

    worker.onerror = (error) => {
      console.error(`${SCRIPT_NAME}: [Venda v2.1 Worker onerror] Erro GERAL:`, error.message, error);
      isProcessingSell = false; // RESET
    };
  } // --- Fim da função updateSell (v2.1 + Cooldown) ---






  // Debounce da função updateSell para evitar chamadas excessivas
  const debouncedUpdateSell = _.debounce(updateSell, 150); // Aumentado ligeiramente o debounce
















 const updateAll = async () => {
    if (checkAndHandleHCaptcha()) return; // <<< ADICIONADO: Para imediatamente se hCaptcha for detectado

    // Verifica COMPRA: Só chama se o modo estiver ativo
    if (state.buyModeActive) {
        //console.log("[UpdateAll] Verificando Compra...");
        await processBuyBasedOnResources();
    }

    // Verifica VENDA: Só chama se o modo estiver ativo
    if (state.sellModeActive) {
         //console.log("[UpdateAll] Verificando Venda (debounced)...");
        debouncedUpdateSell();
    }
};














// ================================================================
// >> FUNÇÃO performSaveOperation (v5 - Remove Refs Configs Removidas) <<
// ================================================================
const performSaveOperation = () => {
    // console.log("[PerformSaveOperation v5] Iniciando...");
    const configData = {};
    // O seletor agora buscará menos elementos, pois alguns foram removidos do HTML
    const elementsToProcess = document.querySelectorAll(
        '.market-container .rate-input,' +       // Inputs da UI principal
        '#premiumPointsInput,' +                 // Limite de PP
        '#settingsModal .settings-input,' +      // Inputs restantes na modal (pausas)
        '#settingsModal .settings-checkbox,' +   // Checkboxes restantes (hCaptcha)
        '#settingsModal .aquila-select'          // Select de idioma
    );
    // console.log(`[PerformSaveOperation v5] ${elementsToProcess.length} elementos encontrados para salvar.`);

    elementsToProcess.forEach((element) => {
        if (!element) return;
        const key = element.id || element.dataset?.resource;
        if (!key) return;

        let valueToSave = null;
        let isValidForSaving = false;
        let isValid = false;

        // --- Processamento ---
        if (element.type === 'checkbox') {
            // Trata TODOS os checkboxes restantes (atualmente só o hCaptcha)
            valueToSave = element.checked;
            isValidForSaving = true;

            // Atualiza state MobX correspondente
            if (key === 'closeOnHCaptchaInput' && typeof state.closeTabOnHCaptcha !== 'undefined') {
                if (state.closeTabOnHCaptcha !== element.checked) {
                     mobx.runInAction(() => { state.closeTabOnHCaptcha = element.checked; });
                 }
            }
            // REMOVIDO: Lógica para autoReloadOnErrorInput

        } else if (element.tagName === 'SELECT') {
            valueToSave = element.value;
            isValidForSaving = true;
            // Atualização MobX State (Exemplo: language)
            if (key === 'languageSelect') {
                 if (state.language !== element.value && ["pt", "ru", "en"].includes(element.value)) {
                     mobx.runInAction(() => { state.language = element.value; });
                 }
             }
        } else { // Inputs numéricos/textuais
            const rawValue = element.value.trim();

            if (key === 'premiumPointsInput') { // Tratamento PP
                if (rawValue === "") {
                    valueToSave = "0";
                    isValidForSaving = true;
                } else {
                    const sanitizedValue = sanitizeNumber(rawValue);
                    isValid = !isNaN(sanitizedValue) && sanitizedValue >= 0;
                    if (isValid) {
                        valueToSave = String(sanitizedValue);
                        isValidForSaving = true;
                    } else {
                        valueToSave = null;
                        isValidForSaving = false;
                    }
                }
            }
            else if (rawValue === "") { // Não salva outros inputs vazios
                 isValidForSaving = false;
            } else { // Outros inputs numéricos (pausas, UI principal)
                const sanitizedValue = sanitizeNumber(rawValue);
                isValid = false;

                if (['buyPauseDurationInput', 'sellPauseDurationInput'].includes(key)) {
                     isValid = !isNaN(sanitizedValue) && sanitizedValue >= 1;
                } else if (element.classList.contains('rate-input')) { // Inputs da UI principal
                     isValid = !isNaN(sanitizedValue) && sanitizedValue >= 0;
                } else { // Fallback (se houver outros)
                     isValid = !isNaN(sanitizedValue);
                }
                // REMOVIDO: Validações para checkIntervalInput, sellCooldownInput, merchantReserveInput

                 if (isValid) {
                    valueToSave = String(sanitizedValue);
                    isValidForSaving = true;
                    // Atualização MobX State para pausas
                    try {
                        mobx.runInAction(() => {
                            if (key === 'buyPauseDurationInput' && state.buyPauseDurationMinutes !== sanitizedValue) state.buyPauseDurationMinutes = sanitizedValue;
                            else if (key === 'sellPauseDurationInput' && state.sellPauseDurationMinutes !== sanitizedValue) state.sellPauseDurationMinutes = sanitizedValue;
                        });
                    } catch (stateError) { /* Silenciar */ }
                } else {
                    valueToSave = null;
                    isValidForSaving = false;
                }
            }
        } // Fim do else (Inputs)

        // Adiciona ao configData SE for válido
        if (isValidForSaving && valueToSave !== null) {
            configData[key] = valueToSave;
        } else if (configData.hasOwnProperty(key)) {
            delete configData[key];
        }
    }); // Fim do loop forEach

    // Garante chave 'language'
     if (configData.languageSelect) { configData.language = configData.languageSelect; delete configData.languageSelect; }
     else if (!configData.language) { configData.language = state.language || 'pt'; }

    // console.log("[PerformSaveOperation v5] configData FINAL:", configData);

    // Salva no localStorage
    try {
        const configJson = JSON.stringify(configData);
        const compressedConfig = LZString.compress(configJson);
        if (compressedConfig) {
            localStorage.setItem("compressedConfig", compressedConfig);
            localStorage.setItem("language", configData.language);
        } else { console.error("[PerformSaveOperation v5] ERRO CRÍTICO: Compressão LZString nula!"); notifyError("Falha grave compressão!"); }
    } catch (error) { console.error("[PerformSaveOperation v5] ERRO ao salvar no localStorage:", error); notifyError("Erro ao salvar configurações."); }
};
// =====================================================================
// >> FIM performSaveOperation (v5 - Remove Refs Configs Removidas) <<
// =====================================================================



































// ================================================================
// ===       FUNÇÃO setupEvents (vPausa Persist + AutoSave)      ===
// ===     Listeners de Pausa, Auto-Save, Toggles, Modais...    ===
// ================================================================
const setupEvents = () => {
    const debounceDelay = 300; // Delay (ms) para inputs da UI principal reagirem
    //console.log("[DEBUG setupEvents vPausaPersist+AutoSave] Iniciando configuração de eventos...");

    // --- 1. Listeners de Input da UI Principal (Debounced) ---
    //console.log("[DEBUG setupEvents vPausaPersist+AutoSave] Configurando listeners 'input' UI Principal...");
    Object.values(resources).forEach((resource) => {
        // Listener: Taxa Compra Mínima (userRateTooltip)
        if (resource.config.uiRateInput) {
            resource.config.uiRateInput.addEventListener("input", _.debounce(() => {
                //console.log(`[Input Change UI] Taxa compra ${resource.name}`);
                if (state.buyModeActive && !isProcessingBuy && (!state.buyPausedUntil || state.buyPausedUntil <= Date.now())) {
                    processBuyBasedOnResources(); // Reavalia compra
                }
            }, debounceDelay));
        }
        // Listener: Estoque Desejado (stockDesiredTooltip)
        const desiredStockInput = document.querySelector(`.rate-input[data-resource="${resource.name}-stock"]`);
        if (desiredStockInput) {
            desiredStockInput.addEventListener("input", _.debounce(() => {
                //console.log(`[Input Change UI] Estoque desejado ${resource.name}`);
                if (state.buyModeActive && !isProcessingBuy && (!state.buyPausedUntil || state.buyPausedUntil <= Date.now())) {
                    processBuyBasedOnResources(); // Reavalia compra
                }
            }, debounceDelay));
        }
        // Listener: Taxa Venda Máxima (reserveRateTooltip)
        if (resource.config.uiReserveRateInput) {
            resource.config.uiReserveRateInput.addEventListener("input", _.debounce(() => {
                //console.log(`[Input Change UI] Taxa reserva (máx. venda) ${resource.name}`);
                if (state.sellModeActive && !isProcessingSell && (!state.sellPausedUntil || state.sellPausedUntil <= Date.now())) {
                    updateSell(); // Reavalia venda
                }
            }, debounceDelay));
        }
        // Listener: Reserva Mínima (reserveAmountTooltip)
        const reserveAmountInput = document.querySelector(`.rate-input[data-resource="reserve-${resource.name}"]`);
        if (reserveAmountInput) {
            reserveAmountInput.addEventListener("input", _.debounce(() => {
                //console.log(`[Input Change UI] Quantidade reserva ${resource.name}`);
                if (state.sellModeActive && !isProcessingSell && (!state.sellPausedUntil || state.sellPausedUntil <= Date.now())) {
                    updateSell(); // Reavalia venda
                }
            }, debounceDelay));
        }
        // Listener: Limite Venda Específico (sellLimitTooltip)
        const specificSellLimitInput = document.querySelector(`.rate-input[data-resource="sell-limit-${resource.name}"]`);
        if (specificSellLimitInput) {
           specificSellLimitInput.addEventListener("input", _.debounce(() => {
                //console.log(`[Input Change UI] Limite venda específico ${resource.name}`);
                if (state.sellModeActive && !isProcessingSell && (!state.sellPausedUntil || state.sellPausedUntil <= Date.now())) {
                    updateSell(); // Reavalia venda
                }
            }, debounceDelay));
        }
        // Listener: Limite Venda Legado ('sell-limit' para wood)
        if (resource.name === 'wood') {
            const legacySellLimitInput = document.querySelector('.rate-input[data-resource="sell-limit"]');
            if (legacySellLimitInput) {
                 legacySellLimitInput.addEventListener("input", _.debounce(() => {
                     //console.log(`[Input Change UI] Limite venda GERAL (legacy wood)`);
                    if (state.sellModeActive && !isProcessingSell && (!state.sellPausedUntil || state.sellPausedUntil <= Date.now())) {
                        updateSell(); // Reavalia venda
                    }
                 }, debounceDelay));
            }
        }
    });

    // Listeners: Inputs Gerais da UI Principal (buyPerTime, storageLimit, maxSpend)
    const buyPerTimeInput = document.querySelector('.rate-input[data-resource="buy-per-time"]');
    if (buyPerTimeInput) { buyPerTimeInput.addEventListener("input", _.debounce(() => { //console.log("[Input Change UI] Limite por compra (buy-per-time)");


                                                                                       if (state.buyModeActive && !isProcessingBuy && (!state.buyPausedUntil || state.buyPausedUntil <= Date.now())) processBuyBasedOnResources(); }, debounceDelay)); }
    const storageLimitInput = document.querySelector('.rate-input[data-resource="storage-limit"]');
    if (storageLimitInput) { storageLimitInput.addEventListener("input", _.debounce(() => { //console.log("[Input Change UI] Limite por armazém (storage-limit)");
                                                                                           if (state.buyModeActive && !isProcessingBuy && (!state.buyPausedUntil || state.buyPausedUntil <= Date.now())) processBuyBasedOnResources(); }, debounceDelay)); }
    const maxSpendInput = document.querySelector('.rate-input[data-resource="max-spend"]');
    if (maxSpendInput) { maxSpendInput.addEventListener("input", _.debounce(() => { //console.log("[Input Change UI] Gasto máx por compra (max-spend)");
                                                                                   if (state.buyModeActive && !isProcessingBuy && (!state.buyPausedUntil || state.buyPausedUntil <= Date.now())) processBuyBasedOnResources(); }, debounceDelay)); }

    // --- 2. Listeners de Botões (Click) ---
    //console.log("[DEBUG setupEvents vPausaPersist+AutoSave] Configurando listeners 'click' botões...");

    const setupClickListener = (elementId, handler) => {
        const element = ui.getElement(elementId);
        if (element) {
            element.removeEventListener('click', handler); // Previne duplicados
            element.addEventListener('click', handler);
        } // else { console.warn(`[setupEvents] Elemento #${elementId} não encontrado.`); }
    };

    // Botões Ativar/Desativar Modo
    setupClickListener("buyModeToggle", () => toggleMode("buyModeActive")); // Usa a função toggleMode atualizada
    setupClickListener("sellModeToggle", () => toggleMode("sellModeActive")); // Usa a função toggleMode atualizada














       // Botões Pausar Compra/Venda (com persistência via localStorage)
    setupClickListener("buyPause", () => {
        const now = Date.now();
        const pauseStateKey = 'buyPausedUntil';
        const storageKey = 'aquila_buyPauseEndTime';
        const durationMinutes = state.buyPauseDurationMinutes;
        const modeString = 'Compra'; // Para logs e notificações

        console.log(`[Pause Click - ${modeString}] Ativo: ${state.buyModeActive}, Pausado até: ${state[pauseStateKey] ? new Date(state[pauseStateKey]).toLocaleString() : 'Não'}`);

        // *** PASSO 1: INÍCIO DA MODIFICAÇÃO ***
        // Verifica PRIMEIRO se JÁ está pausado
        if (state[pauseStateKey] && state[pauseStateKey] > now) {
            // ESTÁ PAUSADO -> LÓGICA DE RETOMAR
            console.log(`[Pause Click - ${modeString}] Ação: RETOMAR manualmente.`);

            // 1. Limpa o timeout agendado
            if (buyPauseTimeoutId) {
                clearTimeout(buyPauseTimeoutId);
                buyPauseTimeoutId = null; // Limpa a referência do ID
                console.log(" -> Timeout existente limpo.");
            } else {
                 console.log(" -> Nenhum timeout encontrado para limpar (pode já ter sido limpo ou nunca definido).");
            }

            // 2. Limpa o estado da pausa no MobX
            mobx.runInAction(() => {
                state[pauseStateKey] = null;
            });
            console.log(" -> State da pausa ('buyPausedUntil') limpo.");

            // 3. Limpa a pausa do localStorage
            localStorage.removeItem(storageKey);
            console.log(` -> localStorage ('${storageKey}') limpo.`);

            // 4. Atualiza a UI imediatamente para refletir a retomada
            updateUI();
            console.log(" -> UI atualizada.");

            // 5. Notifica o usuário
            // Use uma chave de tradução específica ou texto direto
            notifyUser(i18n.t("statusResumedManually", { mode: i18n.t('buy', {defaultValue: modeString}) }) || `${modeString} retomado manualmente.`, "success");
             console.log(" -> Notificação de retomada enviada.");

            // 6. Opcional: Tenta executar a ação de compra imediatamente se o modo ainda estiver ativo
            if (state.buyModeActive && !isProcessingBuy) {
                 console.log(" -> Modo Compra está ativo e não está processando. Tentando executar 'processBuyBasedOnResources()'...");
                processBuyBasedOnResources();
            } else {
                console.log(` -> Não tentando comprar: buyModeActive=${state.buyModeActive}, isProcessingBuy=${isProcessingBuy}`);
            }

            return; // Sai do listener após retomar a pausa
        }
        // *** PASSO 1: FIM DA MODIFICAÇÃO ***

        // --- LÓGICA ORIGINAL DE AGENDAR A PAUSA ---
        // (O código que verifica !state.buyModeActive, durationMinutes, calcula pauseEndTime,
        // agenda o setTimeout, etc., continua aqui ABAIXO da nova lógica de retomar)

        // Verifica se o modo principal está inativo (antes de tentar pausar)
        if (!state.buyModeActive) {
            console.log(` -> Ignorado: Modo Compra está INATIVO. Não é possível pausar.`);
            return;
        }

        // Verifica se a duração é válida
        if (durationMinutes > 0) {
            // LÓGICA ORIGINAL de cálculo de pauseEndTime, set state, localStorage, etc.
            const pauseEndTime = now + durationMinutes * 60 * 1000;
            mobx.runInAction(() => { state[pauseStateKey] = pauseEndTime; });
            localStorage.setItem(storageKey, pauseEndTime);
            console.log(` -> Pausa ${modeString} AGENDADA até: ${new Date(pauseEndTime).toLocaleString()}. State e Storage atualizados.`);
            updateUI(); // Atualiza a UI para mostrar "Pausado até..."
            notifyUser(i18n.t("pauseDurationSet", { mode: i18n.t('buy', { defaultValue: modeString }), duration: durationMinutes }), "warning");

            // Limpa timeout antigo (se houver) e agenda novo
            if (buyPauseTimeoutId) clearTimeout(buyPauseTimeoutId);
            buyPauseTimeoutId = setTimeout(() => {
                console.log(`[Pause Timeout Callback - ${modeString}] Pausa expirou naturalmente.`);
                mobx.runInAction(() => { state[pauseStateKey] = null; });
                localStorage.removeItem(storageKey);
                buyPauseTimeoutId = null;
                updateUI();
                notifyUser(i18n.t("pauseExpired", { mode: i18n.t('buy', { defaultValue: modeString }) }), "success");
                if (state.buyModeActive && !isProcessingBuy) {
                     console.log(" -> Tentando reativar Compra pós-expiração...");
                    processBuyBasedOnResources();
                }
            }, durationMinutes * 60 * 1000); // Usa a duração correta
            console.log(` -> Timeout (${buyPauseTimeoutId}) agendado para a expiração.`);

        } else { // Se duração inválida
            notifyError(i18n.t("setPauseDurationError"));
            console.warn(` -> Duração inválida para pausar: ${durationMinutes}`);
        }
    }); // Fim do listener buyPause









  // DENTRO da função setupEvents:

    setupClickListener("sellPause", () => {
        const now = Date.now();
        const pauseStateKey = 'sellPausedUntil';        // <--- Variável correta para Venda
        const storageKey = 'aquila_sellPauseEndTime';   // <--- Variável correta para Venda
        const durationMinutes = state.sellPauseDurationMinutes; // <--- Variável correta para Venda
        const modeString = 'Venda';                     // <--- Texto correto para logs/notificações

        console.log(`[Pause Click - ${modeString}] Ativo: ${state.sellModeActive}, Pausado até: ${state[pauseStateKey] ? new Date(state[pauseStateKey]).toLocaleString() : 'Não'}`);

        // *** VERIFICAÇÃO INICIAL: JÁ ESTÁ PAUSADO? -> RETOMAR ***
        if (state[pauseStateKey] && state[pauseStateKey] > now) {
            // ESTÁ PAUSADO -> LÓGICA DE RETOMAR (Igual à de Compra, mas com vars de Venda)
            console.log(`[Pause Click - ${modeString}] Ação: RETOMAR manualmente.`);

            // 1. Limpa o timeout agendado (usa sellPauseTimeoutId)
            if (sellPauseTimeoutId) {
                clearTimeout(sellPauseTimeoutId);
                sellPauseTimeoutId = null;
                console.log(" -> Timeout existente limpo.");
            } else {
                 console.log(" -> Nenhum timeout encontrado para limpar.");
            }

            // 2. Limpa o estado da pausa no MobX (usa state.sellPausedUntil)
            mobx.runInAction(() => {
                state[pauseStateKey] = null; // Define sellPausedUntil como null
            });
            console.log(" -> State da pausa ('sellPausedUntil') limpo.");

            // 3. Limpa a pausa do localStorage (usa a storageKey correta)
            localStorage.removeItem(storageKey);
            console.log(` -> localStorage ('${storageKey}') limpo.`);

            // 4. Atualiza a UI
            updateUI();
            console.log(" -> UI atualizada.");

            // 5. Notifica o usuário
           notifyUser(i18n.t("statusResumedManually", { mode: i18n.t('sell', {defaultValue: modeString}) }) || `${modeString} retomado manualmente.`, "success");
            console.log(" -> Notificação de retomada enviada.");

            // 6. Opcional: Tenta executar a ação de VENDA imediatamente (usa state.sellModeActive, !isProcessingSell, updateSell)
            if (state.sellModeActive && !isProcessingSell) {
                 console.log(" -> Modo Venda está ativo e não está processando. Tentando executar 'updateSell()'...");
                updateSell(); // ou debouncedUpdateSell() se preferir
            } else {
                 console.log(` -> Não tentando vender: sellModeActive=${state.sellModeActive}, isProcessingSell=${isProcessingSell}`);
            }

            return; // Sai do listener após retomar a pausa
        }
        // *** FIM DA LÓGICA DE RETOMAR ***


        // --- LÓGICA ORIGINAL DE AGENDAR A PAUSA DE VENDA ---
        // (Só executa se a condição 'if' acima for falsa)

        // Verifica se o modo principal está inativo (usa state.sellModeActive)
        if (!state.sellModeActive) {
            console.log(` -> Ignorado: Modo Venda está INATIVO. Não é possível pausar.`);
            return;
        }

        // Verifica se a duração é válida
        if (durationMinutes > 0) {
            const pauseEndTime = now + durationMinutes * 60 * 1000;
            mobx.runInAction(() => { state[pauseStateKey] = pauseEndTime; }); // Define sellPausedUntil
            localStorage.setItem(storageKey, pauseEndTime);
            console.log(` -> Pausa ${modeString} AGENDADA até: ${new Date(pauseEndTime).toLocaleString()}. State e Storage atualizados.`);
            updateUI();
            notifyUser(i18n.t("pauseDurationSet", { mode: i18n.t('sell', { defaultValue: modeString }), duration: durationMinutes }), "warning");

            // Limpa timeout antigo (usa sellPauseTimeoutId) e agenda novo
            if (sellPauseTimeoutId) clearTimeout(sellPauseTimeoutId);
            sellPauseTimeoutId = setTimeout(() => {
                console.log(`[Pause Timeout Callback - ${modeString}] Pausa expirou naturalmente.`);
                mobx.runInAction(() => { state[pauseStateKey] = null; }); // Limpa sellPausedUntil
                localStorage.removeItem(storageKey);
                sellPauseTimeoutId = null;
                updateUI();
                notifyUser(i18n.t("pauseExpired", { mode: i18n.t('sell', { defaultValue: modeString }) }), "success");
                // Tenta VENDER após expirar (usa state.sellModeActive, !isProcessingSell, updateSell)
                if (state.sellModeActive && !isProcessingSell) {
                     console.log(" -> Tentando reativar Venda pós-expiração...");
                    updateSell();
                }
            }, durationMinutes * 60 * 1000); // Usa a duração correta
            console.log(` -> Timeout (${sellPauseTimeoutId}) agendado para a expiração.`);

        } else { // Se duração inválida
            notifyError(i18n.t("setPauseDurationError"));
            console.warn(` -> Duração inválida para pausar: ${durationMinutes}`);
        }
    }); // Fim do listener sellPause










    // Botão Salvar Config (Manual)
    setupClickListener("saveConfig", () => {
        console.log("[SaveConfig Button Click] Acionado save manual.");
        performSaveOperation(); // Salva estado atual da UI Principal E Modal Configs
        notifySuccess(i18n.t("saveSuccess"));
    });














  // FUNÇÃO resetAll ATUALIZADA (v2 - Clear Current World Cache)
setupClickListener("resetAll", () => {
    console.warn("[ResetAll Button Click v2] INICIANDO RESET...");
    // Limpa inputs UI principal
    document.querySelectorAll('.market-container .rate-input').forEach(input => input.value = "");
    const premiumInput = ui.getElement("premiumPointsInput"); if (premiumInput) premiumInput.value = "";
    // Reset inputs modal UI para defaults/placeholders
    document.querySelectorAll('#settingsModal .settings-input').forEach(input => { input.value = input.placeholder || ""; });
    const closeHCaptchaCheck = document.getElementById('closeOnHCaptchaInput'); if (closeHCaptchaCheck) closeHCaptchaCheck.checked = false; // Reset hCaptcha para false
    const langSelect = document.getElementById('languageSelect'); if (langSelect) langSelect.value = 'pt';
    const buyPauseInputEl = document.getElementById('buyPauseDurationInput'); if (buyPauseInputEl) buyPauseInputEl.value = 5;
    const sellPauseInputEl = document.getElementById('sellPauseDurationInput'); if (sellPauseInputEl) sellPauseInputEl.value = 5;
    console.log("[ResetAll v2] Inputs UI e Modal resetados.");

    // === INÍCIO: LIMPAR CACHE DO MUNDO ATUAL ===
    const currentWorld = state.currentVillage?.world || getActiveWorld();
    if (currentPlayerNickname && currentWorld) {
        const storageKey = `ragnarokMarketTransactions_${currentPlayerNickname}_${currentWorld}`;
        localStorage.removeItem(storageKey);
        console.log(`[ResetAll v2] Cache de logs para o mundo atual (${currentWorld}) removido do localStorage.`);
    } else {
        console.warn("[ResetAll v2] Não foi possível determinar nickname ou mundo atual para limpar cache específico.");
    }
    // === FIM: LIMPAR CACHE DO MUNDO ATUAL ===

    // Remove config geral e idioma
    localStorage.removeItem("compressedConfig");
    localStorage.removeItem("language");
    // Remove pausas persistentes
    localStorage.removeItem('aquila_buyPauseEndTime');
    localStorage.removeItem('aquila_sellPauseEndTime');
    console.log("[ResetAll v2] localStorage (configs, lang, pausas) limpo.");

    // Reseta state MobX
    mobx.runInAction(() => {
        state.buyModeActive = false; state.sellModeActive = false;
        state.hasExecutedBuy = false; state.hasExecutedSell = false;
        state.buyPausedUntil = null; state.sellPausedUntil = null;
        state.buyPauseDurationMinutes = 5; state.sellPauseDurationMinutes = 5;
        state.language = 'pt';
        state.transactions.replace([]); // Limpa transações no state
        state.worldProfit = 0;        // Zera lucro no state
        state.allTransactionsFetched = false; // Reseta flag de busca
        state.closeTabOnHCaptcha = false; // Reseta hCaptcha state
        // Resetar outros states MobX se aplicável
    });
    console.log("[ResetAll v2] State MobX redefinido.");

    // Reseta flags de modo no storage
    localStorage.setItem("buyModeActive", "false");
    localStorage.setItem("sellModeActive", "false");

    // Limpa timeouts de pausa
    if (buyPauseTimeoutId) { clearTimeout(buyPauseTimeoutId); buyPauseTimeoutId = null; console.log(" -> Timeout pausa compra limpo."); }
    if (sellPauseTimeoutId) { clearTimeout(sellPauseTimeoutId); sellPauseTimeoutId = null; console.log(" -> Timeout pausa venda limpo."); }

    updateUI(); // Atualiza UI
    console.log("[ResetAll v2] Concluído.");
    notifySuccess(i18n.t("resetAllSuccess", { defaultValue: "Configurações resetadas com sucesso!" }));
});
// === FIM resetAll ATUALIZADA (v2 - Clear Current World Cache) ===

















    // Botões Abrir Modais
    setupClickListener("transactionsBtn", showTransactions);
    setupClickListener("aiAssistantBtn", () => {
        const aiModal = ui.getElement("aiModal"); if (aiModal) aiModal.style.display = "flex";
        const aiPrompt = ui.getElement("aiPrompt"); if(aiPrompt) aiPrompt.value = "";
        const aiResponse = ui.getElement("aiResponse"); if (aiResponse) aiResponse.innerHTML = "";
    });
    setupClickListener("settingsBtn", () => {
        populateUserInfo(); // Atualiza Nick, Licença, etc.
        // Aplica VALORES ATUAIS DO STATE aos inputs da modal
        const buyPauseInput = document.getElementById('buyPauseDurationInput'); if (buyPauseInput) buyPauseInput.value = state.buyPauseDurationMinutes;
        const sellPauseInput = document.getElementById('sellPauseDurationInput'); if (sellPauseInput) sellPauseInput.value = state.sellPauseDurationMinutes;
        const checkIntInput = document.getElementById('checkIntervalInput'); if (checkIntInput) checkIntInput.value = checkIntInput.placeholder || 30; // TODO: Pegar do state se existir
        const sellCoolInput = document.getElementById('sellCooldownInput'); if (sellCoolInput) sellCoolInput.value = sellCoolInput.placeholder || 6; // TODO: Pegar do state se existir
        const merchResInput = document.getElementById('merchantReserveInput'); if (merchResInput) merchResInput.value = merchResInput.placeholder || 0; // TODO: Pegar do state se existir
        const autoRelCheck = document.getElementById('autoReloadOnErrorInput'); if (autoRelCheck) autoRelCheck.checked = true; // TODO: Pegar do state se existir
        const langSelectModal = document.getElementById('languageSelect'); if (langSelectModal) langSelectModal.value = state.language || 'pt';
        mobx.runInAction(() => { state.isSettingsModalOpen = true; }); // Marca como aberta
        const settingsModal = ui.getElement("settingsModal"); if(settingsModal) settingsModal.style.display = "flex"; // Exibe
        console.log("[DEBUG setupEvents] Modal Configs aberta, inputs populados via state.");
    });

    // Botões DENTRO das Modais
    setupClickListener("submitAI", async () => {
         const promptInput = ui.getElement("aiPrompt"); const prompt = promptInput ? promptInput.value : ""; if (!prompt.trim()) return;
         const responseArea = ui.getElement("aiResponse"); if(responseArea) responseArea.innerHTML = `<p>${i18n.t("aiLoading")}</p>`;
         try { const response = await callGeminiAPI(prompt); if (responseArea) responseArea.innerHTML = `<p>${response.replace(/\n/g, '<br>')}</p>`;
         } catch (error) { if(responseArea) responseArea.innerHTML = `<p class="error">${i18n.t("aiError")}: ${error.message || error}</p>`; }
    });
    setupClickListener("closeModal", () => { // Fecha Modal Transações
        const modal = ui.getElement("transactionsModal"); if (modal) modal.style.display = "none";
        if (chartInstance) { chartInstance.destroy(); chartInstance = null; } // Limpa gráfico
        const chartContainer = document.getElementById("transactionsChartContainer");
        if (chartContainer) { chartContainer.innerHTML = '<canvas id="transactionsChart"></canvas>'; chartContainer.style.display = 'none'; }
    });
    setupClickListener("closeAIModal", () => { const modal = ui.getElement("aiModal"); if (modal) modal.style.display = "none"; });
    setupClickListener("closeSettingsModal", () => { // Fecha Modal Configs
        mobx.runInAction(() => { state.isSettingsModalOpen = false; });
        const modal = ui.getElement("settingsModal"); if (modal) modal.style.display = "none";
    });

    // Botões Minimizar/Restaurar
    setupClickListener("minimizeButton", () => { const c=ui.getElement("market-container"), b=ui.getElement("minimizedMarketBox"); if(c&&b){ mobx.runInAction(() => { state.isMinimized = true; }); c.style.display="none"; b.style.display="flex"; localStorage.setItem("isMinimized", "true"); }});
    setupClickListener("minimizedMarketBox", () => { const c=ui.getElement("market-container"), b=ui.getElement("minimizedMarketBox"); if(c&&b){ mobx.runInAction(() => { state.isMinimized = false; }); c.style.display="block"; b.style.display="none"; localStorage.setItem("isMinimized", "false"); }});

    // --- 3. Listeners de Select (Idioma e Aldeia) ---
    //console.log("[DEBUG setupEvents vPausaPersist+AutoSave] Configurando listeners 'change' selects...");
    const languageSelect = ui.getElement("languageSelect"); if (languageSelect) { languageSelect.removeEventListener("change", handleLanguageChange); languageSelect.addEventListener("change", handleLanguageChange); }
    const villageSelect = ui.getElement("villageSelect"); if (villageSelect) { villageSelect.removeEventListener("change", handleVillageChange); villageSelect.addEventListener("change", handleVillageChange); }

    // --- 4. SEÇÃO AUTO-SAVE para Modal Configs ---
    //console.log("[DEBUG setupEvents vPausaPersist+AutoSave] Configurando auto-save da modal...");
    const modalConfigElementsSelector = '#settingsModal .settings-input, #settingsModal .settings-checkbox, #settingsModal .aquila-select';
    const modalConfigElements = document.querySelectorAll(modalConfigElementsSelector);
    const autoSaveDelay = 1500; // Delay de 1.5s
    const debouncedAutoSave = _.debounce(() => { // Cria função debounced
        //console.log(`[AutoSave Triggered] Mudança na modal detectada. Salvando após ${autoSaveDelay}ms...`);
        performSaveOperation(); // Chama a função que salva TUDO
    }, autoSaveDelay);
    modalConfigElements.forEach(element => { // Adiciona listener a cada controle
        const eventType = (element.type === 'checkbox') ? 'change' : 'input';
        element.removeEventListener(eventType, debouncedAutoSave); // Limpa anterior
        element.addEventListener(eventType, debouncedAutoSave);    // Adiciona novo
    });
    //console.log(`[DEBUG setupEvents AutoSave] Auto-save listeners adicionados (${modalConfigElements.length} elementos).`);
    // --- FIM AUTO-SAVE MODAL ---

    // --- 5. Listeners para Tooltip ---
    //console.log("[DEBUG setupEvents vPausaPersist+AutoSave] Configurando listeners tooltip...");
    const tooltipTriggerSelector = '[data-tooltip], [data-tooltip-key]';
    const tooltipElements = document.querySelectorAll(`.market-container ${tooltipTriggerSelector}, .modal ${tooltipTriggerSelector}`);
    tooltipElements.forEach((element) => {
        element.removeEventListener("mouseenter", showTooltip); element.removeEventListener("mousemove", updateTooltipPosition); element.removeEventListener("mouseleave", hideTooltip);
        element.addEventListener("mouseenter", showTooltip); element.addEventListener("mousemove", updateTooltipPosition); element.addEventListener("mouseleave", hideTooltip);
    });
    //console.log(`[DEBUG setupEvents Tooltip] Listeners adicionados/atualizados (${tooltipElements.length}).`);

    // --- 6. Listener para fechar modais com clique fora ---
    window.removeEventListener('click', handleOutsideModalClick, true);
    window.addEventListener('click', handleOutsideModalClick, true); // Usa handler externo
    //console.log("[DEBUG setupEvents vPausaPersist+AutoSave] Listener 'click fora modal' adicionado.");

    // --- 7. Conclusão ---
    //console.log("[DEBUG setupEvents vPausaPersist+AutoSave] Configuração de TODOS os eventos concluída.");
}; // --- Fim da função setupEvents ---


// ========================================================
// === FUNÇÕES AUXILIARES (Handlers de Eventos Externos) ===
// ========================================================
// (Coloque este bloco DEPOIS do final de 'const setupEvents = () => {', mas ANTES de 'const init = async () => {')

// Handler para mudança de Idioma no Select das Configurações
function handleLanguageChange(event) {
    const newLang = event.target.value; // Pega valor selecionado (ex: 'pt', 'en', 'ru')
    if (["pt", "ru", "en", "nl"].includes(newLang)) { // <<< MODIFICAR AQUI
        // Atualiza o state do MobX SÓ se o idioma realmente mudou
        if (state.language !== newLang) {
            mobx.runInAction(() => { state.language = newLang; }); // Atualiza state reativamente
            console.log(`[Idioma Change] State atualizado para: ${newLang}`);
        }
        // Tenta aplicar a mudança no i18next para tradução
        i18n.changeLanguage(newLang).then(() => {
            localStorage.setItem("language", state.language); // Salva no localStorage APÓS sucesso
            console.log(`[Idioma Change] i18next e localStorage atualizados para ${newLang}. Chamando updateUI...`);
            updateUI(); // Atualiza TODOS os textos da interface principal e modais abertas
        }).catch(error => { // Se i18next falhar
            console.error(`[Idioma Change] Erro ao mudar idioma com i18next para ${newLang}:`, error);
            // O state ainda foi atualizado, mas a UI não refletirá imediatamente
        });
    } else {
        console.warn(`[Idioma Change] Idioma selecionado inválido: ${newLang}`);
    }
}

// Handler para mudança de Aldeia no Select do Cabeçalho
function handleVillageChange(event) {
   //console.log(`[Village Change] Seleção alterada para: ${event.target.value}`);
    // Exemplo: Se tiver múltiplas aldeias, poderia carregar dados da selecionada.
    // Por enquanto, se selecionar "current", apenas atualiza info da aldeia atual.
    if (event.target.value === "current") {
        updateVillageInfo(); // Função que pega nome/coords da aldeia atual do jogo
        // Poderia disparar re-cálculo de lucro aqui: fetchAndUpdateProfit();
    }
    // Adicionar lógica para `else` se houver outras aldeias no select
}

// Handler para cliques na janela (detecta clique fora das modais para fechá-las)
function handleOutsideModalClick(event) {
    // Função interna para verificar e fechar UMA modal específica
    const checkAndClose = (modalId, stateKey = null, cleanupFn = null) => {
        const modalElement = ui.getElement(modalId); // Busca modal pelo ID

        // Condições para fechar:
        // 1. Modal existe no DOM.
        // 2. Modal está visível (display: flex).
        // 3. O alvo do clique (event.target) NÃO está contido dentro do elemento .modal-content da modal.
        if (modalElement && modalElement.style.display === 'flex' && !modalElement.querySelector('.modal-content')?.contains(event.target))
        {
            console.log(`[Click Fora] Detectado clique fora de #${modalId}. Fechando...`);
            modalElement.style.display = 'none'; // Esconde a modal

            // Atualiza o state MobX (se stateKey foi fornecido) para 'false'
            // Ex: state.isSettingsModalOpen = false;
            if (stateKey && typeof state[stateKey] !== 'undefined') {
                 mobx.runInAction(() => { state[stateKey] = false; });
                 //console.log(` -> State '${stateKey}' definido como false.`);
            }
            // Executa função de limpeza (ex: destruir gráfico) se foi fornecida
            if (typeof cleanupFn === 'function') {
                 cleanupFn();
                 //console.log(` -> Função de cleanup executada para #${modalId}.`);
            }
            return true; // Indica que fechou
        }
        return false; // Indica que não fechou
    };

    // Função de limpeza específica para a modal de Transações
    const transactionsCleanup = () => {
        if (chartInstance) { // Se existe uma instância do gráfico
            chartInstance.destroy(); // Destroi para liberar memória
            chartInstance = null;    // Limpa a referência
            //console.log(" -> Instância do gráfico destruída.");
        }
        const chartContainer = document.getElementById("transactionsChartContainer"); // Pega o container
        if (chartContainer) { // Limpa o container e recria o canvas vazio, escondendo-o
            chartContainer.innerHTML = '<canvas id="transactionsChart"></canvas>';
            chartContainer.style.display = 'none';
            //console.log(" -> Container do gráfico limpo.");
        }
    };

    // Chama checkAndClose para cada modal
    checkAndClose("settingsModal", "isSettingsModalOpen");        // Passa chave do state MobX
    checkAndClose("transactionsModal", null, transactionsCleanup); // Passa função de limpeza
    checkAndClose("aiModal");                                       // Sem state ou cleanup específico
}
// --- FIM DAS FUNÇÕES AUXILIARES ---








// ================================================================
// ===        FUNÇÃO updateUI COMPLETA E ATUALIZADA (v14.3 - Remove Title Pausa) ===
// ================================================================
const updateUI = () => {
    // console.log("[DEBUG updateUI v14.3 - Remove Title Pausa] Iniciando...");

    const updateElement = (elementId, textContent = null, innerHTML = null, attribute = null, attributeValue = null, placeholder = null) => {
        const element = ui.getElement(elementId);
        if (element) {
            try {
                if (textContent !== null) element.textContent = textContent;
                if (innerHTML !== null) element.innerHTML = innerHTML;
                if (attribute !== null && attributeValue !== null) {
                     if (attribute.toLowerCase() === 'classname' || attribute.toLowerCase() === 'class') {
                        element.className = attributeValue;
                    } else {
                         element.setAttribute(attribute, attributeValue);
                    }
                }
                 if (placeholder !== null && typeof element.placeholder !== 'undefined') {
                    element.placeholder = placeholder;
                }
            } catch (e) {
                //console.warn(`[DEBUG updateUI] Erro ao atualizar elemento #${elementId}:`, e);
            }
        }
    };

    // --- Atualizações Gerais ---
    updateElement("headerTitle", i18n.t("title"));
    updateElement("saveConfig", null, `<i class="fa-solid fa-floppy-disk"></i> ${i18n.t("saveConfig")}`);
    updateElement("resetAll", `\u21BB ${i18n.t("resetAll")}`);
    updateElement("transactionsBtn", i18n.t("transactions"));
    updateElement("settingsBtn", null, `<i class="fa-solid fa-gear"></i>`); // Title removido
    updateElement("aiAssistantBtn", null, `<i class="fa-solid fa-robot"></i>`); // Title removido
    updateElement("minimizeButton", null, `<i class="fa-solid fa-window-minimize"></i>`); // Title removido
    updateElement("buyStatusLabel", i18n.t("statusLabel"));
    updateElement("sellStatusLabel", i18n.t("statusLabel"));

    // --- Toggles e Status Compra/Venda ---
    const buyToggle = ui.getElement("buyModeToggle");
    if (buyToggle) {
        buyToggle.textContent = i18n.t(state.buyModeActive ? "buyModeToggleOn" : "buyModeToggleOff");
        buyToggle.className = `black-btn toggle-btn ${state.buyModeActive ? "active" : "inactive"}`;
    }
    const buyStatus = ui.getElement("buyStatus");
    if (buyStatus) {
        buyStatus.textContent = i18n.t(state.buyModeActive ? "activated" : "deactivated");
        buyStatus.className = `status ${state.buyModeActive ? "green" : "red"}`;
    }
    const sellToggle = ui.getElement("sellModeToggle");
    if (sellToggle) {
        sellToggle.textContent = i18n.t(state.sellModeActive ? "sellModeToggleOn" : "sellModeToggleOff");
         sellToggle.className = `black-btn toggle-btn ${state.sellModeActive ? "active" : "inactive"}`;
    }
    const sellStatus = ui.getElement("sellStatus");
    if (sellStatus) {
        sellStatus.textContent = i18n.t(state.sellModeActive ? "activated" : "deactivated");
         sellStatus.className = `status ${state.sellModeActive ? "green" : "red"}`;
    }

    // --- ATUALIZAÇÃO BOTÕES PAUSAR (SEM title attribute) ---
    const now = Date.now();
    const buyPauseBtn = ui.getElement("buyPause");
    if (buyPauseBtn) {
        if (state.buyPausedUntil && state.buyPausedUntil > now) {
            const resumeTimestamp = state.buyPausedUntil;
            const resumeTimeFormatted = new Date(resumeTimestamp).toLocaleTimeString(state.language || 'pt-BR', { hour: '2-digit', minute: '2-digit' });
            buyPauseBtn.innerHTML = `<i class="fas fa-hourglass-end"></i> ${i18n.t('pausedUntil', { time: resumeTimeFormatted })}`;
            buyPauseBtn.disabled = false;
            buyPauseBtn.classList.add("paused");
            // buyPauseBtn.setAttribute('title', i18n.t('clickToResumeTooltip')); // REMOVIDO - usa data-tooltip-key
        } else {
            buyPauseBtn.innerHTML = `<i class="fas fa-pause"></i> ${i18n.t('pause')}`;
            buyPauseBtn.disabled = !state.buyModeActive;
            buyPauseBtn.classList.remove("paused");
            // buyPauseBtn.setAttribute('title', i18n.t('tooltipPauseBuy')); // REMOVIDO - usa data-tooltip-key
        }
        // Garante que o data-tooltip-key original do HTML não seja removido
        if (!buyPauseBtn.hasAttribute('data-tooltip-key')) {
             buyPauseBtn.setAttribute('data-tooltip-key', (state.buyPausedUntil && state.buyPausedUntil > now) ? 'clickToResumeTooltip' : 'tooltipPauseBuy');
        } else {
            // Atualiza a chave se o estado mudou
            const expectedKey = (state.buyPausedUntil && state.buyPausedUntil > now) ? 'clickToResumeTooltip' : 'tooltipPauseBuy';
            if (buyPauseBtn.getAttribute('data-tooltip-key') !== expectedKey) {
                 buyPauseBtn.setAttribute('data-tooltip-key', expectedKey);
            }
        }
    }

    const sellPauseBtn = ui.getElement("sellPause");
    if (sellPauseBtn) {
        if (state.sellPausedUntil && state.sellPausedUntil > now) {
            const resumeTimestamp = state.sellPausedUntil;
            const resumeTimeFormatted = new Date(resumeTimestamp).toLocaleTimeString(state.language || 'pt-BR', { hour: '2-digit', minute: '2-digit' });
            sellPauseBtn.innerHTML = `<i class="fas fa-hourglass-end"></i> ${i18n.t('pausedUntil', { time: resumeTimeFormatted })}`;
            sellPauseBtn.disabled = false;
            sellPauseBtn.classList.add("paused");
            // sellPauseBtn.setAttribute('title', i18n.t('clickToResumeTooltip')); // REMOVIDO
        } else {
            sellPauseBtn.innerHTML = `<i class="fas fa-pause"></i> ${i18n.t('pause')}`;
            sellPauseBtn.disabled = !state.sellModeActive;
            sellPauseBtn.classList.remove("paused");
            // sellPauseBtn.setAttribute('title', i18n.t('tooltipPauseSell')); // REMOVIDO
        }
         // Garante que o data-tooltip-key original do HTML não seja removido
         if (!sellPauseBtn.hasAttribute('data-tooltip-key')) {
              sellPauseBtn.setAttribute('data-tooltip-key', (state.sellPausedUntil && state.sellPausedUntil > now) ? 'clickToResumeTooltip' : 'tooltipPauseSell');
         } else {
            // Atualiza a chave se o estado mudou
            const expectedKey = (state.sellPausedUntil && state.sellPausedUntil > now) ? 'clickToResumeTooltip' : 'tooltipPauseSell';
            if (sellPauseBtn.getAttribute('data-tooltip-key') !== expectedKey) {
                 sellPauseBtn.setAttribute('data-tooltip-key', expectedKey);
            }
         }
     }
    // --- FIM da Atualização dos Botões "Pausar" ---

    // --- Lucro e Idioma ---
     // Dentro da função updateUI:
 const worldProfitEl = ui.getElement("worldProfit");
 if (worldProfitEl) {
    // Mostra o valor apenas se for um número, caso contrário mostra o texto (ex: "Carregando...") ou um fallback
    const profitValue = state.worldProfit;
    worldProfitEl.textContent = typeof profitValue === 'number' ? String(profitValue) : (profitValue || '...');
 }

    const languageSelect = ui.getElement("languageSelect");
if (languageSelect) {
  const currentLangValue = state.language; // Usa o state como valor correto
  languageSelect.innerHTML = `
        <option value="pt" ${currentLangValue === "pt" ? "selected" : ""}>🇧🇷 ${i18n.t("portuguese")}</option>
        <option value="ru" ${currentLangValue === "ru" ? "selected" : ""}>🇷🇺 ${i18n.t("russian")}</option>
        <option value="en" ${currentLangValue === "en" ? "selected" : ""}>🇬🇧 ${i18n.t("english")}</option>
        <option value="nl" ${currentLangValue === "nl" ? "selected" : ""}>🇳🇱 ${i18n.t("dutch")}</option> {/* <<< ADICIONAR ESTA LINHA */}
    `;
  // Certifica que o valor selecionado reflete o estado, mesmo que a opção ainda não existisse antes
  languageSelect.value = ["pt", "ru", "en", "nl"].includes(currentLangValue) ? currentLangValue : 'pt';
}
    // Verifica o container do select de idioma para remover title, se houver
    const langDropdown = languageSelect?.closest('.dropdown');
    if (langDropdown && langDropdown.hasAttribute('title')) {
        // langDropdown.removeAttribute('title'); // Comentado pois ele tem data-tooltip-key
    }
    // Verifica o container do select de aldeia
    const villageDropdown = ui.getElement("villageSelect")?.closest('.dropdown');
    if (villageDropdown && villageDropdown.hasAttribute('title')) {
        // villageDropdown.removeAttribute('title'); // Comentado pois ele tem data-tooltip-key
    }


    // --- Atualização do Conteúdo Textual das Modais ---
    const updateModalContent = (modalId) => {
        const modalElement = document.getElementById(modalId);
        if (modalElement && (modalElement.style.display !== 'none' || modalId === 'settingsModal')) {
            const elementsToTranslate = modalElement.querySelectorAll("[data-i18n-key]");

            elementsToTranslate.forEach((el) => {
                const key = el.dataset.i18nKey;
                if (key) {
                     const translation = i18n.t(key, { defaultValue: key });

                     if ((el.tagName === "INPUT" || el.tagName === "TEXTAREA") && typeof el.placeholder !== 'undefined') {
                        if(el.placeholder !== translation) el.placeholder = translation;
                    } else if (el.tagName === "BUTTON") {
                         const iconHTML = el.querySelector('i')?.outerHTML || '';
                         const newButtonHTML = `${iconHTML} ${translation}`;
                         if(el.innerHTML.trim() !== newButtonHTML.trim()) el.innerHTML = newButtonHTML;
                     }
                     else {
                         const iconElement = el.querySelector('i.fas');
                         let textNodeToUpdate = null;
                         if (iconElement) {
                             let sibling = iconElement.nextSibling;
                             while (sibling) {
                                 if (sibling.nodeType === Node.TEXT_NODE && sibling.nodeValue.trim() !== '') {
                                     textNodeToUpdate = sibling; break;
                                 }
                                 sibling = sibling.nextSibling;
                             }
                             if (!textNodeToUpdate) {
                                 const childNodes = Array.from(el.childNodes);
                                 for (let i = childNodes.length - 1; i >= 0; i--) {
                                     if (childNodes[i].nodeType === Node.TEXT_NODE && childNodes[i].nodeValue.trim() !== '') {
                                         textNodeToUpdate = childNodes[i]; break;
                                     }
                                 }
                             }
                         } else {
                             textNodeToUpdate = Array.from(el.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '');
                             if (!textNodeToUpdate && el.childNodes.length === 1 && el.firstChild?.nodeType === Node.TEXT_NODE) {
                                 textNodeToUpdate = el.firstChild;
                             }
                         }

                         if (textNodeToUpdate) {
                            const currentText = textNodeToUpdate.nodeValue.trim();
                            const translatedText = translation.trim();
                            if (currentText !== translatedText) {
                                textNodeToUpdate.nodeValue = ` ${translation}`;
                            }
                         } else if (!iconElement && el.textContent.trim() !== translation.trim()) {
                             el.textContent = translation;
                         } else if (iconElement && !textNodeToUpdate){
                             const currentTextContent = el.textContent.replace(iconElement.outerText, '').trim();
                             if(currentTextContent !== translation.trim()){
                                Array.from(el.childNodes).forEach(node => {
                                    if(node.nodeType === Node.TEXT_NODE) { el.removeChild(node); }
                                });
                                el.appendChild(document.createTextNode(` ${translation}`));
                             }
                         }
                     }
                }
            });

                   // Atualiza tooltips (atributo title) APENAS para os ícones de informação
        const tooltipIcons = modalElement.querySelectorAll(".tooltip-icon[data-tooltip-key]");
        tooltipIcons.forEach((el) => {
            const key = el.dataset.tooltipKey;
             if (key) {
                const titleText = i18n.t(key, { defaultValue: key });
                 // LINHA REMOVIDA
             }
        });
        }
    };

    updateModalContent("transactionsModal");
    updateModalContent("settingsModal");
    updateModalContent("aiModal");

    updateElement("closeModal", i18n.t("close"));
    updateElement("closeAIModal", i18n.t("close"));

    // console.log("[DEBUG updateUI v14.3] Atualização completa da UI concluída.");
  }; // --- Fim da função updateUI (Modificada v14.3) ---








// ===========================================================
// === FUNÇÃO loadConfig (v5 - Remove Refs Configs Removidas) ===
// ===========================================================
const loadConfig = () => {
    //console.log("[LoadConfig v5 - Remove Refs] Iniciando carregamento...");
    const compressedConfig = localStorage.getItem("compressedConfig");
    const DEFAULT_PAUSE_DURATION_MINUTES = 5;
    let configData = {};

    // 1. Descomprime Configs Gerais
    if (compressedConfig) {
        try {
            const decompressedConfig = LZString.decompress(compressedConfig);
            if (decompressedConfig) {
                configData = JSON.parse(decompressedConfig);
            } else { console.warn("[LoadConfig v5] Descompressão nula."); }
        } catch (error) {
            console.error(`[LoadConfig v5] Erro parsear 'compressedConfig':`, error);
            configData = {};
            localStorage.removeItem("compressedConfig");
        }
    } else { /* console.log("[LoadConfig v5] Nenhuma 'compressedConfig' salva."); */ }

    // 2. Carrega Configs UI Principal
    document.querySelectorAll(".market-container .rate-input").forEach((input) => {
        const key = input?.dataset?.resource;
        if (key && configData[key] !== undefined) {
            input.value = configData[key];
        }
    });
    if (configData.premiumPointsInput !== undefined) {
        const premiumInput = ui.getElement("premiumPointsInput");
        if (premiumInput) premiumInput.value = configData.premiumPointsInput;
    } else {
         const premiumInput = ui.getElement("premiumPointsInput");
         if (premiumInput) premiumInput.value = "";
    }

    // 3. Carrega Configs da MODAL (Restantes)
    //console.log("[LoadConfig v5] Aplicando configs MODAL restantes e atualizando STATE...");

    // Duração Pausa Compra
    const loadedBuyPauseStr = configData.buyPauseDurationInput;
    const loadedBuyPauseNum = sanitizeNumber(loadedBuyPauseStr);
    mobx.runInAction(() => { state.buyPauseDurationMinutes = loadedBuyPauseNum > 0 ? loadedBuyPauseNum : DEFAULT_PAUSE_DURATION_MINUTES; });
    const buyPauseInputEl = document.getElementById('buyPauseDurationInput');
    if (buyPauseInputEl) buyPauseInputEl.value = state.buyPauseDurationMinutes;
    // console.log(` -> MODAL: Compra Pause Duration: State/UI: ${state.buyPauseDurationMinutes}`);

    // Duração Pausa Venda
    const loadedSellPauseStr = configData.sellPauseDurationInput;
    const loadedSellPauseNum = sanitizeNumber(loadedSellPauseStr);
    mobx.runInAction(() => { state.sellPauseDurationMinutes = loadedSellPauseNum > 0 ? loadedSellPauseNum : DEFAULT_PAUSE_DURATION_MINUTES; });
    const sellPauseInputEl = document.getElementById('sellPauseDurationInput');
    if (sellPauseInputEl) sellPauseInputEl.value = state.sellPauseDurationMinutes;
    // console.log(` -> MODAL: Venda Pause Duration: State/UI: ${state.sellPauseDurationMinutes}`);

    // REMOVIDO: Carregamento de checkIntervalInput
    // REMOVIDO: Carregamento de autoReloadOnErrorInput (state.autoReloadOnError é sempre true agora)
    // REMOVIDO: Carregamento de sellCooldownInput
    // REMOVIDO: Carregamento de merchantReserveInput

    // Carrega Configuração hCaptcha
    const closeOnHCaptchaCheckboxEl = document.getElementById('closeOnHCaptchaInput');
    if (closeOnHCaptchaCheckboxEl) {
        const loadedCloseOnHCaptcha = configData.closeOnHCaptchaInput;
        const valueToApply = typeof loadedCloseOnHCaptcha === 'boolean' ? loadedCloseOnHCaptcha : false;
        closeOnHCaptchaCheckboxEl.checked = valueToApply;
        if (state.closeTabOnHCaptcha !== valueToApply) {
             mobx.runInAction(() => { state.closeTabOnHCaptcha = valueToApply; });
        }
        //console.log(` -> MODAL: Close on hCaptcha: Lido '${loadedCloseOnHCaptcha}', State/UI: ${valueToApply}`);
    } else {
         console.warn("[LoadConfig v5] Checkbox #closeOnHCaptchaInput não encontrado.");
         if(state.closeTabOnHCaptcha !== false) {
            mobx.runInAction(() => { state.closeTabOnHCaptcha = false; });
         }
    }

    // 4. Carrega Idioma
   const langFromStorage = localStorage.getItem("language");
 const langFromConfig = configData.language;
 // Modifica a validação para incluir 'nl'
 const langToLoad = ["pt", "ru", "en", "nl"].includes(langFromStorage) ? langFromStorage : (["pt", "ru", "en", "nl"].includes(langFromConfig) ? langFromConfig : 'pt'); // <<< MODIFICAR AQUI
 if (state.language !== langToLoad) {
    mobx.runInAction(() => { state.language = langToLoad; });
 }
 const langSelectModalEl = document.getElementById('languageSelect'); if (langSelectModalEl) langSelectModalEl.value = state.language;

    // 5. Restaura Pausas Ativas
    const now = Date.now();
    // Pausa Compra
    const savedBuyPauseEndStr = localStorage.getItem('aquila_buyPauseEndTime');
    const buyPauseEndTs = savedBuyPauseEndStr ? parseInt(savedBuyPauseEndStr, 10) : null;
    if (buyPauseEndTs && !isNaN(buyPauseEndTs) && buyPauseEndTs > now) {
        mobx.runInAction(() => { state.buyPausedUntil = buyPauseEndTs; });
        const remainingDurationMs = buyPauseEndTs - now;
        if (buyPauseTimeoutId) { clearTimeout(buyPauseTimeoutId); }
        buyPauseTimeoutId = setTimeout(() => {
            mobx.runInAction(() => { state.buyPausedUntil = null; });
            localStorage.removeItem('aquila_buyPauseEndTime');
            buyPauseTimeoutId = null; updateUI();
            notifyUser(i18n.t("pauseExpired", { mode: i18n.t('buy', { defaultValue: 'Compra' }) }), "success");
            if (state.buyModeActive && !isProcessingBuy) { processBuyBasedOnResources(); }
        }, remainingDurationMs);
    } else {
        mobx.runInAction(() => { state.buyPausedUntil = null; });
        if (savedBuyPauseEndStr) { localStorage.removeItem('aquila_buyPauseEndTime'); }
    }
    // Pausa Venda
    const savedSellPauseEndStr = localStorage.getItem('aquila_sellPauseEndTime');
    const sellPauseEndTs = savedSellPauseEndStr ? parseInt(savedSellPauseEndStr, 10) : null;
    if (sellPauseEndTs && !isNaN(sellPauseEndTs) && sellPauseEndTs > now) {
        mobx.runInAction(() => { state.sellPausedUntil = sellPauseEndTs; });
        const remainingDurationMs = sellPauseEndTs - now;
        if (sellPauseTimeoutId) { clearTimeout(sellPauseTimeoutId); }
        sellPauseTimeoutId = setTimeout(() => {
            mobx.runInAction(() => { state.sellPausedUntil = null; });
            localStorage.removeItem('aquila_sellPauseEndTime');
            sellPauseTimeoutId = null; updateUI();
            notifyUser(i18n.t("pauseExpired", { mode: i18n.t('sell', { defaultValue: 'Venda' }) }), "success");
            if (state.sellModeActive && !isProcessingSell) { updateSell(); }
        }, remainingDurationMs);
    } else {
        mobx.runInAction(() => { state.sellPausedUntil = null; });
        if (savedSellPauseEndStr) { localStorage.removeItem('aquila_sellPauseEndTime'); }
    }

    //console.log("[LoadConfig v5 - Remove Refs] Função concluída.");
};
// --- FIM Função loadConfig (v5 - Remove Refs Configs Removidas) ---










// (O restante do código que você colou, como resources, resourceObservers, etc., permanece como está)
let resources; // <<< MANTIDO
const resourceObservers = {}; // Mantém a definição <<< MANTIDO

const setupResourceObservers = () => { // <<< MANTIDO
    // (código original de setupResourceObservers aqui)
    const resourceIds = ["wood", "stone", "iron"];
    resourceIds.forEach((resource) => {
      const element = document.getElementById(resource) || document.querySelector(`#${resource}`);
      if (element) {
        if (resourceObservers[resource]) {
           return;
        }
        const observer = new MutationObserver(() => {
          const amountText = element.textContent || "";
          const amount = sanitizeNumber(amountText);
          if (typeof currentResources !== 'undefined' && amount !== currentResources[resource]) {
                currentResources[resource] = amount;
                const now = Date.now();
                if (state.buyModeActive && !isProcessingBuy && (!state.buyPausedUntil || state.buyPausedUntil <= now)) {
                    processBuyBasedOnResources();
                }
                if (state.sellModeActive && !isProcessingSell && (!state.sellPausedUntil || state.sellPausedUntil <= now)) {
                    updateSell();
                }
          }
        });
        observer.observe(element, { childList: true, subtree: true, characterData: true });
        resourceObservers[resource] = observer;
      } else {
        // console.warn(...);
      }
    });
};

const exchangeRateElements = { // <<< MANTIDO
    wood: document.querySelector("#premium_exchange_rate_wood .premium-exchange-sep"),
    stone: document.querySelector("#premium_exchange_rate_stone .premium-exchange-sep"),
    iron: document.querySelector("#premium_exchange_rate_iron .premium-exchange-sep")
};
const exchangeRateObservers = {}; // <<< MANTIDO
// A função setupExchangeRateObservers() (se existir) continuaria aqui... <<< MANTIDO









  function setupExchangeRateObservers() {
    Object.entries(exchangeRateElements).forEach(([resource, element]) => {
      if (!element) {
        console.error(`Elemento para ${resource} n\xE3o encontrado!`);
        return;
      }
      const observer = new MutationObserver((mutations) => {
        const newRate = sanitizeNumber(
          element.textContent.trim().replace(/[^0-9.,]/g, "").replace(",", ".")
          // Converte vírgula para ponto decimal
        ) || 1;
        dataCache.set(`exchange_${resource}`, newRate);
        if (state.sellModeActive) {
          debouncedUpdateSell();
        }
      });
      observer.observe(element, {
        childList: true,
        subtree: true,
        characterData: true
        // Observa mudanças no texto
      });
      exchangeRateObservers[resource] = observer;
    });
  }
  function populateUserInfo() {
    const playerNameEl = document.getElementById("settingsPlayerName");
    const licenseExpiryEl = document.getElementById("settingsLicenseExpiry");
    const scriptVersionEl = document.getElementById("settingsScriptVersion");
    if (playerNameEl) {
      playerNameEl.textContent = currentPlayerNickname || "N\xE3o Encontrado";
    }
    if (licenseExpiryEl) {
      const storedExpiration = getStoredExpiration(currentPlayerNickname);
      if (storedExpiration && !isNaN(storedExpiration.getTime())) {
        try {
          licenseExpiryEl.textContent = storedExpiration.toLocaleString(state.language || "pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
          const now = /* @__PURE__ */ new Date();
          licenseExpiryEl.classList.remove("expired");
          if (now > storedExpiration) {
            licenseExpiryEl.classList.add("expired");
            //console.warn("Licen\xE7a expirada detectada ao popular UI.");
          }
        } catch (e) {
          console.error("Erro ao formatar data de expira\xE7\xE3o:", e);
          licenseExpiryEl.textContent = "Erro na Data";
          licenseExpiryEl.classList.remove("expired");
        }
      } else {
        licenseExpiryEl.textContent = "N\xE3o Dispon\xEDvel";
        licenseExpiryEl.classList.remove("expired");
      }
    }
    if (scriptVersionEl) {
      try {
        const scriptInfo = typeof GM_info !== "undefined" ? GM_info.script : null;
        if (scriptInfo && scriptInfo.version) {
          scriptVersionEl.textContent = scriptInfo.version;
        } else {
          scriptVersionEl.textContent = "6.2.0_firebase_auth_persist";
        }
      } catch (e) {
        console.error("Erro ao obter vers\xE3o do script via GM_info, usando fallback:", e);
        scriptVersionEl.textContent = "6.2.0_firebase_auth_persist";
      }
    }
  }
  const GAME_LOAD_TIMEOUT = 5e3;

















  /**
 * Verifica a presença de elementos hCaptcha na página e, se a configuração
 * estiver ativa, tenta fechar a aba.
 * @returns {boolean} Retorna true se o hCaptcha foi detectado e a tentativa de fechar foi feita, false caso contrário.
 */
function checkAndHandleHCaptcha() {
    // 1. Verifica se a funcionalidade está desativada no estado
    if (!state.closeTabOnHCaptcha) {
        return false; // Não faz nada se a opção não estiver marcada
    }

    // 2. Define seletores comuns para elementos hCaptcha
    //    (Estes podem precisar de ajuste dependendo de como o TW implementa)
    const hCaptchaSelectors = [
        'iframe[src*="hcaptcha.com"]',         // Iframe do hCaptcha
        'iframe[title*="hCaptcha"]',           // Iframe por título
        'div[data-hcaptcha-widget-id]',        // Div que geralmente contém o widget
        'div.h-captcha-container',             // Um possível container
        '[id^="hcaptcha-challenge"]',          // Elementos com ID começando com hcaptcha-challenge
        // Adicione outros seletores se encontrar elementos diferentes
    ];

    // 3. Procura por qualquer um dos elementos no DOM
    let captchaDetected = false;
    for (const selector of hCaptchaSelectors) {
        if (document.querySelector(selector)) {
            captchaDetected = true;
            // console.debug(`[hCaptcha Check] Elemento encontrado com seletor: ${selector}`); // Log de depuração (opcional)
            break; // Sai do loop assim que encontrar o primeiro
        }
    }

    // 4. Se um elemento hCaptcha foi detectado
    if (captchaDetected) {
        console.warn(i18n.t('hCaptchaDetectedLog', { defaultValue: "hCaptcha detectado!" })); // Log usando tradução

        // 5. Tenta fechar a aba
        console.log(i18n.t('attemptingTabCloseLog', { defaultValue: "Configuração ativa - Tentando fechar a aba..." }));
        try {
            // Importante: window.close() só funciona de forma confiável se
            // o script abriu a janela/aba. Caso contrário, o navegador
            // geralmente bloqueia por segurança.
            window.close();

            // Se window.close() não lançar erro, mas a aba não fechar (comum),
            // não há muito mais que o script possa fazer.
            // Poderíamos tentar um alert, mas isso pode ser irritante.
            // alert("hCaptcha detectado! Tentei fechar a aba, mas pode ter sido bloqueado pelo navegador.");

        } catch (error) {
            console.error(i18n.t('tabCloseErrorLog', { defaultValue: "Erro ao tentar fechar a aba (pode ser bloqueado pelo navegador):" }), error);
            // Notificar o usuário sobre o erro pode ser útil aqui, mas opcional
            // notifyError("hCaptcha detectado! Falha ao tentar fechar a aba.");
        }
        return true; // Indica que o captcha foi detectado e a ação foi tentada
    }

    // 6. Se nenhum hCaptcha foi encontrado
    return false; // Indica que está tudo limpo (ou a opção está desativada)
}










 /// Variável global para rastrear se Chart.js foi carregado
let isChartJsLoaded = false;
let chartJsLoadingPromise = null; // Para evitar múltiplas tentativas de carregamento

// Função para carregar Chart.js dinamicamente usando GM_xmlhttpRequest
function loadChartJsDynamically() {
    // Se já está carregado, retorna imediatamente uma Promise resolvida
    if (isChartJsLoaded) {
        // console.log("[Chart.js Loader] Já carregado."); // Log opcional
        return Promise.resolve();
    }
    // Se já está carregando, retorna a Promise existente
    if (chartJsLoadingPromise) {
        // console.log("[Chart.js Loader] Carregamento já em progresso."); // Log opcional
        return chartJsLoadingPromise;
    }

    console.log("[Chart.js Loader] Iniciando carregamento dinâmico...");
    // Cria a Promise que controlará o carregamento
    chartJsLoadingPromise = new Promise((resolve, reject) => { // <--- Promise criada aqui
        const chartJsUrl = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';

        GM_xmlhttpRequest({
            method: 'GET',
            url: chartJsUrl,
            timeout: 10000,
            onload: function(response) { // <--- O callback onload começa aqui
                if (response.status >= 200 && response.status < 300) {
                    console.log("[Chart.js Loader] Script baixado com sucesso.");
                    try {
                        console.log("[Chart.js Loader] Tentando injetar script no <head>...");
                        const scriptElement = document.createElement('script');
                        scriptElement.textContent = response.responseText; // USA O response AQUI DENTRO
                        scriptElement.setAttribute('data-chartjs-loaded', 'true');

                        const oldScript = document.querySelector('script[data-chartjs-loaded="true"]');
                        if (oldScript) {
                            oldScript.remove();
                            console.log("[Chart.js Loader] Script antigo removido.");
                        }

                        document.head.appendChild(scriptElement);
                        console.log("[Chart.js Loader] Script injetado no <head>.");

                        setTimeout(() => {
                            if (typeof Chart !== 'undefined') { // Verifica Chart global
                                console.log("[Chart.js Loader] Chart.js carregado e 'Chart' definido globalmente com sucesso!");
                                isChartJsLoaded = true;
                                chartJsLoadingPromise = null;
                                resolve(); // <--- Resolve a Promise externa AQUI
                            } else {
                                console.error("[Chart.js Loader] Script injetado, mas 'Chart' não foi definido globalmente após atraso.");
                                if (scriptElement.parentNode) { scriptElement.remove(); }
                                chartJsLoadingPromise = null;
                                reject(new Error("Falha ao definir Chart globalmente após injeção do script.")); // <--- Rejeita a Promise externa AQUI
                            }
                        }, 100);

                    } catch (e) {
                        console.error("[Chart.js Loader] Erro durante a injeção do script Chart.js:", e);
                        chartJsLoadingPromise = null;
                        reject(e); // <--- Rejeita a Promise externa AQUI
                    }
                } else {
                    console.error(`[Chart.js Loader] Falha ao baixar Chart.js. Status: ${response.status}`);
                    chartJsLoadingPromise = null;
                    reject(new Error(`Falha ao baixar Chart.js (Status: ${response.status})`)); // <--- Rejeita a Promise externa AQUI
                }
            }, // <--- Fim do callback onload
            onerror: function(error) {
                console.error("[Chart.js Loader] Erro de rede ao baixar Chart.js:", error);
                chartJsLoadingPromise = null;
                reject(error); // <--- Rejeita a Promise externa AQUI
            },
            ontimeout: function() {
                console.error("[Chart.js Loader] Timeout ao baixar Chart.js");
                chartJsLoadingPromise = null;
                reject(new Error("Timeout ao baixar Chart.js")); // <--- Rejeita a Promise externa AQUI
            }
        }); // <--- Fim do objeto GM_xmlhttpRequest
    }); // <--- Fim da criação da new Promise
    return chartJsLoadingPromise;
}
















// ================================================================
// ===      FUNÇÃO init ATUALIZADA (v9 - Background Log Fetch)    ===
// ================================================================
const init = async () => {
    console.log(`[Init v9 - Background Fetch] ${SCRIPT_NAME}: Iniciando inicialização...`);
    try {
        // 1. Inicializa a Interface Gráfica Base
        initializeUI();

        // 2. Mapeia e Cacheia Elementos Essenciais da UI do Script
        if (!initializeElements()) {
            throw new Error("Falha CRÍTICA ao inicializar elementos da UI RAGNAROK. O script não pode continuar.");
        }

        // 3. Configura Observadores
        setupResourceObservers();
        setupMarketRateObservers();
        setupExchangeRateObservers();
        setupMerchantsObserver();
        setupPremiumObserver();
        setupStorageObserver();

        // 4. Busca Informações Iniciais e Aplica Estilos
        updateVillageInfo();
        applyStyles();

        // 5. Inicializa Handlers de Recursos e Cacheia Botões do Jogo
        resources = initializeResources();
        updateGameElements();

        // 6. Carrega Configurações Salvas
        loadConfig();

        // 7. Configura Listeners de Eventos
        setupEvents();

        // 8. Aplica Tema e Atualiza UI (primeira vez, antes dos dados dinâmicos)
        updateTheme();
        updateUI();
         console.log("[Init v9] Setup inicial da UI concluído.");

        // 9. Verifica hCaptcha
        if (checkAndHandleHCaptcha()) {
             console.warn("[Init v9] hCaptcha detectado na inicialização. Interrompendo.");
             return;
        }

        // 10. Busca Dados Dinâmicos Essenciais (Rápidos)
        try {
            await Promise.all([
                fetchResources(),
                fetchIncomingResources()
            ]);
             console.log("[Init v9] Recursos/Chegando buscados (rápidos).");
        } catch (fetchError) {
            console.error("[Init v9] Erro ao buscar recursos/entradas iniciais:", fetchError);
             // Continua mesmo com erro aqui, mas avisa
             notifyError("Falha ao buscar dados iniciais da aldeia.");
        }


        // 11. *** INICIA A BUSCA DE LOGS EM SEGUNDO PLANO ***
        console.log("[Init v9] Iniciando fetchPremiumLogs em SEGUNDO PLANO...");
        fetchPremiumLogs(false) // Inicia a busca (false = não forçar busca completa inicialmente)
            .then(() => {
                // A função fetchPremiumLogs v17 já atualiza o state e chama updateUI internamente antes de resolver.
                // Podemos apenas logar aqui que a busca em segundo plano terminou bem.
                console.log("[Init v9] fetchPremiumLogs (background) CONCLUÍDO com sucesso.");
                // Uma chamada extra de updateUI aqui PODE ser redundante, mas garante consistência final.
                // updateUI(); // Descomente se notar inconsistências visuais após a carga.
            })
            .catch((error) => {
                // Lida com erros que ocorreram DENTRO do fetchPremiumLogs
                console.error("[Init v9] Erro durante fetchPremiumLogs (background):", error);
                // Notifica o usuário que a busca de logs falhou
                notifyError(i18n.t("logFetchError", { defaultValue: "Erro ao buscar histórico de PP." }));
                 // Garante que o lucro não fique como "Carregando..."
                mobx.runInAction(() => {
                     // Define como 0 ou "Erro" se preferir
                     if(state.worldProfit === "Carregando...") state.worldProfit = 0;
                });
                updateUI(); // Atualiza a UI para remover possível estado de erro/carregamento
            });
        console.log("[Init v9] Chamada para fetchPremiumLogs feita (continuando inicialização...)");


        // 12. Popula Informações do Usuário na Modal (Rápido)
        populateUserInfo();

        // 13. Executa a Primeira Verificação de Compra/Venda (Rápido se não travar)
        //     Isso pode rodar enquanto os logs carregam.
        try {
             console.log("[Init v9] Chamando updateAll inicial...");
             await updateAll();
        } catch(updateAllError) {
            console.error("[Init v9] Erro durante updateAll inicial:", updateAllError);
        }

        // 14. Log Final de Sucesso da Inicialização SÍNCRONA
        //     A busca de logs continuará em segundo plano.
        console.log(`[Init v9] ${SCRIPT_NAME}: Inicialização SÍNCRONA completa e bem-sucedida! (Logs carregando em background)`);

    } catch (error) {
        // Erros CRÍTICOS que impedem a inicialização básica
        console.error(`${SCRIPT_NAME}: Erro CRÍTICO durante a inicialização:`, error);
        const errorMessage = i18n.t("initError", { defaultValue: "Erro grave na inicialização" });
        const detail = error.message || String(error);
        try { notifyError(`${errorMessage}: ${detail}. Verifique o console (F12).`); } catch(e){}
        const container = ui.getElement("market-container");
        if (container) container.style.display = 'none'; // Esconde UI se falhar criticamente
    }
}; // --- Fim da função init (v9 - Background Log Fetch) ---


















  const checkGameLoaded = () => {
    const timeoutId = setTimeout(() => {
      const merchantsElement = document.querySelector("#market_merchant_available_count");
      const isTribalWarsLoaded = typeof TribalWars !== "undefined" && TribalWars.getGameData;
      if (!(merchantsElement && isTribalWarsLoaded)) {
        clearInterval(gameCheckInterval);
        alert(`${SCRIPT_NAME}: N\xE3o foi poss\xEDvel iniciar. Elementos essenciais do jogo n\xE3o foram encontrados ap\xF3s ${GAME_LOAD_TIMEOUT / 1e3} segundos. Recarregue a p\xE1gina ou verifique se h\xE1 outros scripts conflitando.`);
      }
    }, GAME_LOAD_TIMEOUT);
    const gameCheckInterval = setInterval(() => {
      try {
        const merchantsElement = document.querySelector("#market_merchant_available_count");
        const isTribalWarsLoaded = typeof TribalWars !== "undefined" && TribalWars.getGameData;
        const isSortableLoaded = typeof Sortable !== "undefined";
        const isMobxLoaded = typeof mobx !== "undefined";

        if (merchantsElement && isTribalWarsLoaded && isSortableLoaded && isMobxLoaded) {
          clearInterval(gameCheckInterval);
          clearTimeout(timeoutId);
          ////console.log(`${SCRIPT_NAME}: Jogo e depend\xEAncias carregados. Iniciando o script...`);
          init().catch((error) => {
            console.error(`${SCRIPT_NAME}: Erro n\xE3o capturado durante a execu\xE7\xE3o de init():`, error);
            notifyError(i18n.t("initError", { error: error.message || String(error) }) + " Erro cr\xEDtico na inicializa\xE7\xE3o.");
          });
        }
      } catch (error) {
      }
    }, 200);
  };
  checkGameLoaded();














 // ================================================================
// ===      FUNÇÃO applyStyles ATUALIZADA (v1.3 - Refine Input Width) ===
// ================================================================
const applyStyles = () => {
    const robotoFontLink = createElement("link", { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" });
    document.head.appendChild(robotoFontLink);
    const aquilaFontsLink = createElement("link", { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Poppins:wght@400;500;700&display=swap" });
    document.head.appendChild(aquilaFontsLink);
    const style = createElement("style");
    style.textContent = `

/* ====================================================== */
/* ===                ESTILOS GLOBAIS                 === */
/* ====================================================== */

@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Poppins:wght@400;500;700&display=swap');

.market-container * {
    box-sizing: border-box;
}

/* === Estilos para o Sumário de Lucro Filtrado === */
.filtered-profit-summary {
    background-color: rgba(14, 21, 37, 0.9); color: #D4AF37; font-weight: bold;
    text-align: center; padding: 10px 15px; margin-bottom: 15px;
    border-radius: 5px; border: 1px solid #303848; font-size: 1.1em;
    display: none; box-shadow: 0 2px 5px rgba(0,0,0,0.4);
}
.filtered-profit-summary .icon.header.premium {
    width: 18px; height: 18px; display: inline-block; vertical-align: text-bottom;
    margin-left: 5px; margin-right: 2px; position: relative; top: -2px;
}

/* Ícone Premium Point Global */
.icon.header.premium {
    display: inline-block; width: 18px; height: 18px;
    background-image: url('https://dsus.innogamescdn.com/asset/95eda994/graphic/icons/header.png');
    background-repeat: no-repeat; background-position: -433px 0px;
    vertical-align: middle; margin-right: 4px; overflow: hidden;
    filter: drop-shadow(0 0 2px #CD7F32);
}


/* Tooltip Global */
.aquila-tooltip, .tooltip {
    position: absolute; z-index:1000; background: rgba(8, 15, 33, 0.95);
    color: #E0E0E0; padding: 10px 15px; border-radius: 6px;
    border: 1px solid rgba(184, 134, 11, 0.5); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px); font-family: 'Poppins', sans-serif; font-size: 13px;
    line-height: 1.5; max-width: 280px; width: max-content;
    transition: opacity 0.3s ease; pointer-events: none; user-select: none;
    display: none;
    text-align: justify; /* <<< LINHA ADICIONADA */
}

/* ====================================================== */
/* === Estilos Específicos da Modal de Transações     === */
/* ====================================================== */
.modal#transactionsModal {
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); z-index: 2147483646;
    display: flex; justify-content: center; align-items: center;
    padding: 20px; backdrop-filter: blur(4px); opacity: 0; visibility: hidden;
    transition: opacity 0.3s ease, visibility 0s linear 0.3s;
}
.modal#transactionsModal[style*="display: flex"] {
    opacity: 1; visibility: visible; transition: opacity 0.3s ease, visibility 0s linear 0s;
}
.modal#transactionsModal .modal-content.aquila-prime-panel {
    display: flex; flex-direction: column; width: 100%; max-width: 900px; height: 100%; max-height: 80vh;
    background: linear-gradient(145deg, #1a1f2e, #111522); color: #e0e0e0;
    border: 1px solid #303848; border-radius: 8px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.7);
    font-family: 'Poppins', sans-serif; overflow: hidden;
    transform: scale(0.95); transition: transform 0.3s ease;
}
.modal#transactionsModal[style*="display: flex"] .modal-content.aquila-prime-panel { transform: scale(1); }
.modal#transactionsModal .aquila-modal-header {
    background-color: rgba(30, 40, 65, 0.3); padding: 12px 20px; display: flex; align-items: center;
    border-bottom: 1px solid #303848; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.6);
}
.modal#transactionsModal .aquila-modal-header .aquila-icon { flex-shrink: 0; margin-right: 10px; display: flex; align-items: center; }
.modal#transactionsModal .aquila-modal-header .aquila-icon img { height: 24px; width: 24px; display: block; }
.modal#transactionsModal .aquila-modal-header span[data-i18n-key="transactionsHeader"] {
    flex-grow: 1; text-align: center; padding: 0 15px; font-family: 'Cinzel', serif;
    font-weight: 700; font-size: 1.3em; color: #D4AF37; text-transform: uppercase;
    letter-spacing: 1px; text-shadow: 1px 1px 3px rgba(0,0,0,0.6);
}
.modal#transactionsModal .modal-scrollable-body {
    flex: 1; overflow-y: auto; padding: 20px; background-color: rgba(20, 25, 40, 0.3); min-height: 0;
}
.modal#transactionsModal .modal-scrollable-body::-webkit-scrollbar { width: 8px; height: 8px; }
.modal#transactionsModal .modal-scrollable-body::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
.modal#transactionsModal .modal-scrollable-body::-webkit-scrollbar-thumb { background-color: rgba(112, 122, 138, 0.5); border-radius: 4px; transition: background-color 0.3s ease; border: 1px solid rgba(0,0,0,0.3); }
.modal#transactionsModal .modal-scrollable-body::-webkit-scrollbar-thumb:hover { background-color: rgba(112, 122, 138, 0.8); }
#filterSection {
    padding: 15px 20px; margin-bottom: 20px; background: rgba(14, 21, 37, 0.5);
    border: 1px solid #303848; border-radius: 5px; display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;
}
.aquila-filter-item { display: flex; flex-direction: column; gap: 6px; }
.aquila-filter-item label { font-family: 'Poppins', sans-serif; font-size: 0.9em; font-weight: 500; color: #D4AF37; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; }
.aquila-filter-item label i.fas { color: #B8860B; font-size: 1em; opacity: 0.8; }
.aquila-input { padding: 7px 10px; border: 1px solid #3A4558; background: #0E1525; color: #e0e0e0; border-radius: 4px; font-size: 0.9em; font-family: 'Poppins', sans-serif; transition: all 0.2s ease; box-shadow: inset 0 1px 2px rgba(0,0,0,0.5); width: 100%; }
.aquila-input:focus { border-color: #B8860B; background: #141D30; outline: none; box-shadow: 0 0 5px rgba(184, 134, 11, 0.5); color: #FFF; }
.aquila-input::placeholder { color: #606878; opacity: 0.8; }
#transactionsTableContainer { margin-bottom: 20px; border: 1px solid #303848; border-radius: 5px; background: rgba(14, 21, 37, 0.7); box-shadow: 0 2px 10px rgba(0,0,0,0.6); overflow-x: auto; }
.ledger-table.aquila-table { width: 100%; border-collapse: collapse; font-size: 0.95em; min-width: 600px; }
.ledger-table.aquila-table th {
    background-color: #C4A470; color: #4B3A1A; padding: 12px 15px; text-align: left;
    font-weight: 700; font-family: 'Cinzel', serif; text-transform: uppercase;
    letter-spacing: 1px; border-bottom: 1px solid #A0885C; cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease; position: relative; white-space: nowrap;
}
.ledger-table.aquila-table th i.fas { margin-right: 6px; }
.ledger-table.aquila-table th:hover { background-color: #B89868; color: #3A2D14; }
.ledger-table.aquila-table tbody tr { background: rgba(8, 15, 33, 0.6); transition: background 0.2s ease; border-bottom: 1px solid #1a202e; }
.ledger-table.aquila-table tbody tr:last-child { border-bottom: none; }
.ledger-table.aquila-table tbody tr:hover { background: rgba(24, 31, 47, 0.8); }
.ledger-table.aquila-table td { padding: 10px 15px; color: #e0e0e0; text-align: left; font-family: 'Poppins', sans-serif; vertical-align: middle; }
.ledger-table.aquila-table .section-header-row td { background-color: rgba(14, 21, 37, 0.9); color: #B8860B; font-weight: bold; text-align: center; padding: 10px 15px; font-size: 1.1em; text-transform: uppercase; letter-spacing: 1px; border-top: 1px solid #303848; border-bottom: 1px solid #303848; }
.ledger-table.aquila-table .expense-row td:nth-child(3) { color: #E57373; }
.ledger-table.aquila-table .income-row td:nth-child(3) { color: #81C784; }
.ledger-table.aquila-table .profit-summary-row td { background-color: rgba(14, 21, 37, 0.9); color: #D4AF37; font-weight: bold; text-align: center; padding: 12px 15px; font-size: 1.15em; border-top: 2px solid #B8860B; }
.aquila-chart { margin-top: 20px; padding: 15px; background: rgba(14, 21, 37, 0.5); border: 1px solid #303848; border-radius: 5px; min-height: 250px; height: 300px; display: block; }
#transactionsChart { max-height: 100%; }
.modal#transactionsModal .modal-footer-controls {
    padding: 15px 20px; background-color: rgba(14, 21, 37, 0.7); border-top: 1px solid #303848;
    display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;
}
#paginationControls { display: flex; gap: 10px; align-items: center; }
#paginationControls .page-info { color: #A0AAB8; font-size: 0.9em; }
.aquila-btn { background: #303848; border: 1px solid #5A6578; color: #A0AAB8; padding: 8px 15px; border-radius: 5px; font-family: 'Poppins', sans-serif; font-size: 0.9em; font-weight: 500; text-transform: uppercase; cursor: pointer; transition: all 0.2s ease; }
.aquila-btn:hover:not(:disabled) { background: #B8860B; border-color: #D4AF37; color: #0A0F1A; transform: scale(1.03); }
.aquila-btn:disabled { opacity: 0.5; cursor: not-allowed; background: #252a33; border-color: #404855; color: #606878; }
.aquila-btn i.fas { margin-right: 5px; }

/* ========================================================================== */
/* === ESTILOS MODAL CONFIGURAÇÕES, GERAIS, ETC                             === */
/* ========================================================================== */
.modal { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); z-index: 2147483646; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px); opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0s linear 0.3s; }
.modal[style*="display: flex"] { opacity: 1; visibility: visible; transition: opacity 0.3s ease, visibility 0s linear 0s; }
.modal-content { background: linear-gradient(145deg, #1a1f2e, #111522); color: #e0e0e0; border: 1px solid #303848; border-radius: 8px; width: 650px; max-width: 90vw; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.7); overflow: hidden; transform: scale(0.95) translateY(-10px); transition: transform 0.3s ease; }
.modal[style*="display: flex"] .modal-content { transform: scale(1) translateY(0); }
.settings-body::-webkit-scrollbar { width: 8px; height: 8px; }
.settings-body::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px;}
.settings-body::-webkit-scrollbar-thumb { background-color: rgba(112, 122, 138, 0.5); border-radius: 4px; transition: background-color 0.3s ease; border: 1px solid rgba(0,0,0,0.3); }
.settings-body::-webkit-scrollbar-thumb:hover { background-color: rgba(112, 122, 138, 0.8); }
.settings-header { display: flex; align-items: center; padding: 12px 20px; border-bottom: 1px solid #303848; flex-shrink: 0; background-color: rgba(30, 40, 65, 0.3); }
.settings-header .aquila-icon { flex-shrink: 0; margin-right: 10px; display: flex; align-items: center; }
.settings-header .aquila-icon img { height: 24px; width: 24px; display: block; }
.settings-header h3 { margin: 0; flex-grow: 1; text-align: center; font-family: 'Cinzel', serif; font-size: 1.3em; font-weight: 700; color: #D4AF37; text-transform: uppercase; letter-spacing: 1px; text-shadow: 1px 1px 3px rgba(0,0,0,0.6); padding: 0 15px; }
.settings-header .close-btn { background: none; border: none; color: #A0AAB8; font-size: 2.0em; font-weight: bold; line-height: 1; cursor: pointer; padding: 0 5px; transition: color 0.2s ease, transform 0.2s ease; z-index: 2; margin-left: auto; flex-shrink: 0; }
.settings-header .close-btn:hover { color: #ff9999; transform: scale(1.1); }
.settings-body { padding: 20px; overflow-y: auto; flex-grow: 1; background-color: rgba(20, 25, 40, 0.3); }
.settings-section { margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px dashed rgba(184, 134, 11, 0.3); }
.settings-section:last-of-type { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
.settings-section h4 { font-size: 1.1em; margin-top: 0; margin-bottom: 18px; color: #EAEAEA; border-left: 4px solid #B8860B; padding-left: 15px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; }
 .settings-section h4 i.fas { font-size: 1.1em; opacity: 0.9; color: #b8860b; }
.user-info-section .info-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; font-size: 1.05em; padding: 12px 5px; border-bottom: 1px solid rgba(58, 48, 27, 0.5); transition: background-color 0.3s ease; }
.user-info-section .info-row:last-child { border-bottom: none; margin-bottom: 0;}
.user-info-section .info-row:hover { background-color: rgba(184, 134, 11, 0.05); }
.user-info-section .info-label { color: #9aa4b1; display: flex; align-items: center; gap: 8px; font-weight: 400; font-size: 0.95em; padding-top: 1px; }
.user-info-section .info-label i.fas { color: #707a88; width: 18px; text-align: center; font-size: 1.1em; opacity: 0.8; }
.user-info-section .info-value { font-weight: 700; color: #D4AF37; text-align: right; text-shadow: 0 0 4px rgba(212, 175, 55, 0.2); }
#settingsLicenseExpiry.expired { color: #ff7b7b !important; font-weight: 700 !important; text-shadow: 0 0 5px rgba(255, 123, 123, 0.6) !important; }
#settingsLicenseExpiry.soon { color: #ffc107 !important; font-weight: bold; }
.setting-item { display: flex; align-items: center; flex-wrap: wrap; margin-bottom: 15px; gap: 10px 15px; padding: 8px 0; position: relative; }
.setting-item .aquila-label { flex-basis: 240px; flex-shrink: 0; text-align: right; padding-right: 10px; font-size: 0.9em; color: #9aa4b1; display: flex; align-items: center; gap: 6px; }
.setting-item .aquila-label i.fas { width: 16px; text-align: center; color: #707a88; opacity: 0.8; }
.setting-item .aquila-label.checkbox-label { flex-basis: auto; text-align: left; padding-right: 0; cursor: pointer; order: 2; }
.aquila-input, .aquila-select { flex-grow: 1; min-width: 120px; padding: 8px 12px; border: 1px solid #252a3a; background-color: #0a0d14; color: #d0d5db; border-radius: 4px; font-size: 0.9em; transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease; box-shadow: inset 0 1px 3px rgba(0,0,0,0.6); }
.aquila-input:focus, .aquila-select:focus { border-color: #b8860b; background-color: #101420; outline: none; box-shadow: inset 0 1px 3px rgba(0,0,0,0.6), 0 0 8px rgba(184, 134, 11, 0.4); color: #ffffff; }
.aquila-input.number-input { width: 80px; flex-grow: 0; text-align: center; }
.aquila-select { appearance: none; -webkit-appearance: none; -moz-appearance: none; background-image: url('data:image/svg+xml;utf8,<svg fill="%23707a88" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'); background-repeat: no-repeat; background-position: right 10px center; background-size: 18px 18px; padding-right: 35px; cursor: pointer; }
.checkbox-item { justify-content: flex-start; align-items: center; }
.aquila-checkbox { order: 1; margin: 0 8px 0 0; width: 15px; height: 15px; accent-color: #b8860b; background-color: #0a0d14; border: 1px solid #252a3a; border-radius: 3px; cursor: pointer; appearance: none; -webkit-appearance: none; display: inline-block; position: relative; vertical-align: middle; transition: background-color 0.2s ease, border-color 0.2s ease; }
.aquila-checkbox:checked { background-color: #b8860b; border-color: #8b6f3a; }
.aquila-checkbox:checked::before { content: ''; display: block; width: 4px; height: 8px; border: solid #0a0d14; border-width: 0 2px 2px 0; transform: rotate(45deg); position: absolute; left: 4px; top: 1px; }
.aquila-checkbox:focus { outline: none; box-shadow: 0 0 5px rgba(184, 134, 11, 0.5); }
.tooltip-icon { color: #788292; cursor: help; font-size: 1.15em; transition: color 0.3s ease, transform 0.2s ease; margin-left: 5px; vertical-align: middle; }
.tooltip-icon:hover { color: #d4af37; transform: scale(1.1); }
.settings-footer.aquila-footer { padding: 12px 20px; border-top: 1px solid #3a301b; text-align: right; flex-shrink: 0; background: linear-gradient(to top, rgba(14, 21, 37, 0.8), rgba(8, 12, 22, 0.95)); display: flex; justify-content: space-between; align-items: center; }
.settings-footer .aquila-motto { font-family: 'Times New Roman', Times, serif; font-style: italic; font-size: 0.95em; color: #707a88; opacity: 0.8; }
#aiModal .modal-content h3 { padding: 15px 20px; margin:0; text-align: center; border-bottom: 1px solid #303848; font-size: 1.3em; color: #D4AF37; }
#aiModal .modal-content > div:not(:last-child) { padding: 20px; overflow-y: auto; flex-grow: 1; background-color: rgba(8, 15, 33, 0.5); }
#aiModal .modal-content > div:last-child { padding: 15px 20px; border-top: 1px solid #303848; text-align: center; flex-shrink: 0; background-color: rgba(14, 21, 37, 0.5); }
#aiPrompt { resize: vertical; padding: 10px; border: 1px solid #3A4558; border-radius: 5px; width: 100%; margin-bottom: 10px; min-height: 70px; background: #0E1525; color: #e0e0e0; font-size: 0.95em; }
#aiResponse { padding: 15px; border: 1px solid #303848; border-radius: 5px; min-height: 120px; margin-bottom: 15px; background: rgba(0,0,0,0.2); font-size: 0.95em; line-height: 1.6; overflow-y: auto; max-height: 300px;}
#aiModal .black-btn { margin: 0 5px; }
.notification { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%) translateY(10px); padding: 12px 25px; border-radius: 8px; font-size: 14px; font-weight: bold; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6); transition: opacity 0.4s ease, transform 0.4s ease; z-index: 2147483647; backdrop-filter: blur(5px); opacity: 0; pointer-events: none; color: #FFFFFF; border: 1px solid transparent; }
.notification.success { background-color: rgba(26, 93, 42, 0.85); border-color: rgba(42, 141, 58, 1); }
.notification.error { background-color: rgba(123, 28, 28, 0.85); border-color: rgba(176, 44, 44, 1); }
.notification.warning { background-color: rgba(184, 134, 11, 0.85); border-color: rgba(212, 175, 55, 1); color: #0A0F1A; }
.notification.show, .notification[style*="display: block"] { opacity: 1; transform: translateX(-50%) translateY(0); pointer-events: auto; }
.minimized-box { position: fixed; right: 15px; top: 4px; width: 34px; height: 34px; background-color: #0a0d14; border: 1px solid #4d3f1a; border-top: 2px solid #b8860b; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), inset 0 0 6px rgba(184, 134, 11, 0.1); display: flex; align-items: center; justify-content: center; border-radius: 5px; cursor: pointer; z-index: 2147483647; transition: all 0.25s ease; background-image: url('https://raw.githubusercontent.com/C7696/ragnarokcompra-e-venda/refs/heads/main/erasebg-transformed.ico'); background-size: 70% 70%; background-repeat: no-repeat; background-position: center center; }
.minimized-box:hover { transform: scale(1.08) translateY(-1px); border-color: #d4af37; background-color: #111522; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.7), 0 0 10px rgba(212, 175, 55, 0.25); }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* ========================================================================== */
/* === CONTAINER PRINCIPAL DO SCRIPT (.market-container)                    === */
/* ========================================================================== */
.market-container { overflow: hidden; padding: 20px; border-radius: 15px; width: 900px; max-width: 100%; margin: 0 auto; transition: box-shadow 0.3s ease, opacity 0.3s ease; display: flex; flex-direction: column; justify-content: space-between; height: auto; font-family: 'Roboto', sans-serif; box-sizing: border-box; background: linear-gradient(145deg, #080F21, #0D1732); color: #D0D5DB; border: 2px solid #B8860B; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7); }
.market-container.draggable { cursor: move; }
.market-container .header { text-align: center; margin-bottom: 15px; padding-bottom: 15px; flex-shrink: 0; position: relative; border-bottom: 1px solid rgba(184, 134, 11, 0.3); }
.market-container .header h2 { text-transform: uppercase; font-weight: 700; margin: 5px 0 10px 0; font-size: 1.6em; color: #D4AF37; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6); }
.market-container .dropdowns { display: flex; justify-content: space-between; width: 100%; align-items: center; margin-top: 10px; }
.market-container .header-buttons { display: flex; justify-content: space-between; width: 100%; position: absolute; top: 8px; left: 0; padding: 0 15px; box-sizing: border-box; align-items: center; }
.market-container .btn-group-left { display: flex; gap: 6px; align-items: center; }
.market-container .btn-group-right { display: flex; gap: 6px; align-items: center; }
.market-container .profit-info {
    margin-left: auto; display: flex; align-items: center; gap: 6px; order: 2;
    color: #D4AF37; font-weight: bold; font-size: 1.05em; background-color: rgba(5, 8, 15, 0.5);
    padding: 4px 10px; border-radius: 4px; border: 1px solid #202A3C; height: 24px; line-height: 24px;
}
.market-container .profit-info .icon.header.premium {
    width: 18px; height: 18px; display: inline-block; vertical-align: middle; position: relative; top: -1px;
}
.market-container .dropdown { display: flex; align-items: center; background-color: rgba(14, 21, 37, 0.5); padding: 4px 8px 4px 6px; border-radius: 5px; border: 1px solid #202A3C; }
.market-container .village-icon { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; margin-right: 6px; transition: transform 0.3s ease; }
.market-container .village-icon:hover { transform: scale(1.1); }
.market-container .village-icon svg path { fill: #B8860B; }
.market-container .header .dropdown select { padding: 5px 8px; border: 1px solid #202A3C; border-radius: 4px; font-size: 14px; transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease; background-color: #0E1525; color: #D0D5DB; appearance: none; -webkit-appearance: none; -moz-appearance: none; background-image: url('data:image/svg+xml;utf8,<svg fill="%23808A98" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'); background-repeat: no-repeat; background-position: right 8px center; background-size: 18px 18px; padding-right: 30px; cursor: pointer; height: 30px; box-sizing: border-box; }
.market-container .header .dropdown select:focus { border-color: #B8860B; outline: none; box-shadow: 0 0 5px rgba(184, 134, 11, 0.4); background-color: #0A0F1A; color: #FFF; }
.market-container .header .dropdown select:hover { border-color: #3A4C6A; }
.market-container .icon-btn { font-size: 1.2em; padding: 5px !important; border: none !important; border-radius: 5px; background: rgba(14, 21, 37, 0.6); transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out, background-color 0.2s ease, color 0.2s ease; opacity: 0.8; color: #A0AAB8; cursor: pointer; line-height: 1; display: inline-flex; align-items: center; justify-content: center; }
.market-container .icon-btn:hover { transform: scale(1.1) translateY(-1px); opacity: 1; color: #D4AF37; background-color: rgba(30, 40, 65, 0.8); }
.market-container .sections { display: flex; justify-content: space-between; align-items: stretch; flex-grow: 1; margin: 15px 0; }
.market-container .section { width: 48%; padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.6); transition: transform 0.3s ease; display: flex; flex-direction: column; justify-content: space-between; background-color: rgba(8, 15, 33, 0.4); border: 1px solid rgba(184, 134, 11, 0.15); }
.market-container .section:hover { transform: translateY(-5px); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.8); border-color: rgba(184, 134, 11, 0.4); }
.market-container .section h3 { margin-bottom: 10px; font-size: 16px; font-weight: 700; text-align: left; color: #EAEAEA; border-bottom: 1px solid rgba(184, 134, 11, 0.2); padding-bottom: 5px; }
.market-container .status { padding: 3px 8px; border-radius: 4px; font-weight: bold; display: inline-block; border: 1px solid transparent; }
.market-container .status.green { background-color: rgba(26, 93, 42, 0.8); color: #E8F5E9; border-color: #2A8D3A; text-shadow: 0 1px 1px rgba(0,0,0,0.5); }
.market-container .status.red { background-color: rgba(123, 28, 28, 0.8); color: #FFEBEE; border-color: #B02C2C; text-shadow: 0 1px 1px rgba(0,0,0,0.5); }
.market-container .base-card { padding: 8px 15px; border-radius: 8px; margin-bottom: 8px; transition: box-shadow 0.3s ease, background-color 0.2s ease; }
.market-container .resource-card { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: nowrap; cursor: move; background-color: rgba(14, 21, 37, 0.7); border: 1px solid #202A3C; padding: 8px 12px; border-radius: 6px; margin-bottom: 10px; transition: box-shadow 0.3s ease, background-color 0.2s ease, border-color 0.2s ease; box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4); }
.market-container .resource-card:hover { background-color: rgba(24, 31, 47, 0.8); border-color: #3A4C6A; box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4), 0 0 12px rgba(184, 134, 11, 0.3); }
.market-container .resource-card img { width: 22px; height: 22px; opacity: 0.9; margin-right: 5px; vertical-align: middle; }
/* === INPUTS DENTRO DOS CARDS (LARGURA REAJUSTADA E SPINNERS ESCONDIDOS) === */
.market-container .resource-card input {
    width: 70px; /* <<< VALOR REAJUSTADO */
    padding: 5px 8px; border: 1px solid #182030; border-radius: 4px; font-size: 14px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
    cursor: text; background-color: #05080F; color: #D0D5DB; text-align: right;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5); line-height: 1.3; height: 30px; box-sizing: border-box;
    /* Esconde spinners */
    -moz-appearance: textfield;
}
.market-container .resource-card input::-webkit-outer-spin-button,
.market-container .resource-card input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
.market-container .resource-card input:focus { background-color: #0A0F1A; border-color: #B8860B; color: #FFF; outline: none; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5), 0 0 6px rgba(184, 134, 11, 0.5); }
/* --- FIM Ajustes Input Cards --- */
.market-container .resource-card span { margin: 0 4px; font-size: 18px; font-weight: normal; transition: color 0.3s ease, text-shadow 0.3s ease; color: #808A98; text-shadow: 0 0 3px rgba(128, 138, 152, 0.5); line-height: 30px; vertical-align: middle; display: inline-block; height: 30px; }
.market-container .resource-card:hover span { color: #B8860B; text-shadow: 0 0 5px rgba(184, 134, 11, 0.7); }
.market-container .num-input { display: flex; align-items: center; gap: 5px; flex-shrink: 0; background-color: rgba(5, 8, 15, 0.6); padding: 3px 5px; border-radius: 4px; border: 1px solid #182030; height: 30px; box-sizing: border-box; }
 .num-input .resource-icon { width: 18px; height: 18px; opacity: 0.8; vertical-align: middle; }
 .num-input input { height: 100%; padding: 4px 6px; /* Herda width da regra .resource-card input */ }
  /* Esconde spinners também no input numérico com ícone */
 .market-container .num-input input[type="number"] { -moz-appearance: textfield; }
 .market-container .num-input input[type="number"]::-webkit-outer-spin-button,
 .market-container .num-input input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
 /* --- FIM Num Input --- */
.market-container .buttons { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; gap: 8px; }
.market-container .black-btn { padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 14px; transition: background-color 0.2s ease, transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; font-weight: bold; border: 1px solid transparent; background-color: transparent; color: #B0B5BB; }
.market-container .black-btn:hover:not(.toggle-btn):not(.footer-buttons-row .black-btn) { transform: scale(1.03) translateY(-1px); border-color: #4A5568; color: #EAEAEA; background-color: rgba(30, 40, 65, 0.3); }
.market-container .toggle-btn { padding: 8px 15px; border: 1px solid transparent; border-radius: 5px; cursor: pointer; font-size: 14px; transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease, border-color 0.3s ease, color 0.3s ease; font-weight: bold; text-shadow: 0 1px 1px rgba(0, 0, 0, 0.4); }
.market-container .toggle-btn.active { background: linear-gradient(135deg, #B8860B, #D4AF37); color: #1A1A1A; border-color: #A0740A; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 230, 150, 0.3); }
.market-container .toggle-btn.inactive { background: linear-gradient(135deg, #141D30, #2A3548); color: #808A98; border-color: #3A4558; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3); }
.market-container .toggle-btn:hover { transform: scale(1.02) translateY(-1px); filter: brightness(1.15); box-shadow: 0 3px 7px rgba(0, 0, 0, 0.5); }
 .toggle-btn.inactive:hover { color: #A0AAB8; border-color: #5A6578; filter: brightness(1.1); }
.market-container .section .buttons .black-btn:not(.toggle-btn) { padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 14px; transition: background-color 0.2s ease, transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease; font-weight: bold; background-color: #303848; border: 1px solid #5A6578; color: #A0AAB8; }
.market-container .section .buttons .black-btn:not(.toggle-btn):hover { background-color: #4A5568; border-color: #808A98; color: #D0D5DB; transform: scale(1.03) translateY(-1px); box-shadow: 0 0 6px rgba(128, 138, 152, 0.3); }
.market-container .premium-input-wrapper { display: flex; align-items: center; gap: 5px; }
#premiumPointsInput { width: 70px; padding: 5px; border-radius: 5px; font-size: 14px; transition: border-color 0.2s ease, box-shadow 0.2s ease; text-align: right; border: 1px solid #4A5568; background-color: #0E1525; color: #D4AF37; font-weight: bold; }
#premiumPointsInput:focus { border-color: #B8860B; outline: none; box-shadow: 0 0 5px rgba(184, 134, 11, 0.4); }
.market-container .footer { display: flex; justify-content: center; margin-top: 15px; flex-shrink: 0; width: 100%; }
.market-container .footer-buttons-row { display: flex; align-items: center; gap: 10px; background-color: rgba(8, 15, 33, 0.3); padding: 8px 15px; border-radius: 8px; border: none; backdrop-filter: blur(3px); }
.market-container .footer-buttons-row .black-btn { background-color: rgba(8, 15, 33, 0.6); border: 1px solid #4A5568; color: #D0D5DB; backdrop-filter: blur(2px); }
.market-container .footer-buttons-row .black-btn:hover { background-color: rgba(184, 134, 11, 0.2); border-color: #B8860B; color: #F0E68C; transform: scale(1.03) translateY(-1px); box-shadow: 0 0 8px rgba(184, 134, 11, 0.3); }
.market-container .footer-buttons-row .black-btn i { margin-right: 5px; }
.market-container .spinner { width: 20px; height: 20px; border: 3px solid rgba(184, 134, 11, 0.2); border-top: 3px solid #D4AF37; border-radius: 50%; animation: spin 1s linear infinite; margin-left: 10px; }
.market-container .draggable { user-select: none; touch-action: none; transition: transform 0.1s; }
.market-container .draggable:active { cursor: grabbing !important; }
.market-container .sortable-container { display: flex; flex-direction: column; gap: 10px; }
.market-container .footer-buttons-row #saveConfig svg.fa-floppy-disk { margin-right: 6px; height: 0.95em; width: auto; vertical-align: -2px; position: relative; }
.market-container .footer-buttons-row #saveConfig svg.fa-floppy-disk path { fill: #C4A470; transition: fill 0.2s ease; }
.market-container .footer-buttons-row #saveConfig:hover svg.fa-floppy-disk path { fill: #6F582A; }

/* === Media Queries AJUSTADAS (para largura do input) === */
@media (max-width: 768px) {
    .market-container { width: 95vw; padding: 15px; font-size: 14px; }
    .market-container .header h2 { font-size: 1.2em; margin: 10px 0; }
    .market-container .dropdowns { flex-direction: column; gap: 8px; align-items: flex-start; }
    .market-container .profit-info { margin-left: 0; margin-top: 5px; }
    .market-container .sections { flex-direction: column; gap: 15px; }
    .market-container .section { width: 100%; padding: 10px; }
    .market-container .base-card { padding: 6px 10px; }
    .market-container .resource-card { flex-wrap: wrap; gap: 6px; }
    .market-container .resource-card img { width: 20px; height: 20px; }
    .market-container .resource-card input, .market-container .num-input input {
        width: 70px; /* <<< REAJUSTADO */
        font-size: 12px; padding: 3px; height: 28px; line-height: 1.2;
    }
    .market-container .resource-card span { font-size: 14px; height: 28px; line-height: 28px; }
    .market-container .num-input .resource-icon { width: 16px; height: 16px; }
    .market-container .num-input { height: 28px; padding: 2px 4px; gap: 3px; }
    .market-container .buttons { flex-direction: row; gap: 8px; flex-wrap: wrap; justify-content: center;}
    .market-container .black-btn, .market-container .toggle-btn { padding: 7px 12px; font-size: 12px; }
    .market-container .spinner { width: 16px; height: 16px; border-width: 2px; }
    .market-container .footer-buttons-row { gap: 8px; padding: 6px 12px; }
    .market-container #premiumPointsInput { width: 60px; font-size: 12px; padding: 3px; height: 28px; }
}
@media (max-width: 480px) {
    .market-container { width: 98vw; padding: 10px; font-size: 12px; }
     .market-container .header h2 { font-size: 1.1em; }
     .market-container .section h3 { font-size: 14px; }
     .market-container .resource-card input, .market-container .num-input input {
         width: 60px; /* <<< REAJUSTADO */
         font-size: 11px; height: 26px;
     }
     .market-container .resource-card span { font-size: 13px; height: 26px; line-height: 26px; }
     .market-container .buttons { gap: 6px; }
     .market-container .black-btn, .market-container .toggle-btn { padding: 6px 10px; font-size: 11px; }
     .market-container .spinner { width: 14px; height: 14px; }
     .market-container .footer-buttons-row { gap: 6px; padding: 5px 10px; flex-wrap: wrap; }
     .market-container #premiumPointsInput { width: 50px; font-size: 11px; padding: 3px; height: 26px; }
}
 /* ====================================================== */
 /* ===    ESTILO STATUS FETCH LOGS (Aquila Theme)     === */
 /* ====================================================== */
 .log-fetch-status {
    /* --- Texto & Fonte --- */
    font-family: 'Poppins', sans-serif; /* Fonte padrão do tema */
    font-size: 0.9em;                   /* Um pouco maior para legibilidade */
    font-weight: 500;                   /* Meio-termo entre normal e bold */
    color: #D4AF37;                     /* Cor principal Aquila Gold */
    text-align: center;
    text-shadow: 0 0 4px rgba(212, 175, 55, 0.3); /* Sombra de texto sutil (como no lucro) */
    letter-spacing: 0.5px;              /* Espaçamento leve */

    /* --- Caixa e Layout --- */
    display: inline-block;              /* Mantém perto do título */
    padding: 5px 12px;                  /* Padding um pouco maior */
    margin: -5px auto 10px auto;        /* Ajusta margens (auto centraliza se o pai tiver text-align:center) */
    min-height: 22px;                   /* Altura mínima ajustada */
    border-radius: 5px;                 /* Consistente com outros elementos */

    /* --- Fundo e Borda --- */
    background-color: rgba(14, 21, 37, 0.6); /* Fundo escuro consistente, um pouco mais opaco */
    border: 1px solid #303848;             /* Borda padrão do tema */
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.5); /* Sombra interna sutil */

    /* --- Animação Temática --- */
    animation: aquilaStatusGlow 2s infinite alternate ease-in-out; /* Nova animação */

    /* --- Transição (Opcional, mas ajuda) --- */
    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;

    /* Ocultação será feita via JS (style.display), não precisa de opacity aqui */
 }



 /* Nova animação de brilho na borda */
 @keyframes aquilaStatusGlow {
    from {
        border-color: #3A4558; /* Começa com borda escura/média */
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.5), 0 0 3px rgba(184, 134, 11, 0.1); /* Sombra inicial */
    }
    to {
        border-color: #B8860B; /* Brilha para a cor de destaque Aquila */
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.5), 0 0 8px rgba(212, 175, 55, 0.4); /* Brilho externo suave */
    }
 }

    `;
    document.head.appendChild(style);
}; // --- Fim da função applyStyles (v1.3 - Refine Input Width & Hide Spinners) ---
})();
