// ==UserScript==
// @name         Aquila prime
// @namespace    http://tampermonkey.net/
// @version      0.0.5.7
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

// @downloadURL  https://raw.githubusercontent.com/C7696/ragnarokcompra-e-venda/main/Aquila-Prime.user.js
// @updateURL    https://raw.githubusercontent.com/C7696/ragnarokcompra-e-venda/main/Aquila-Prime.user.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js
// @connect      firebaseio.com
// @connect      cloudfunctions.net
// @connect      googleapis.com
// @connect      gstatic.com
// @connect      cdn.jsdelivr.net
// @icon         https://cdn.jsdelivr.net/gh/C7696/ragnarokcompra-e-venda@main/erasebg-transformed.ico
// @require      https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js
// @require      https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js
// @require      https://unpkg.com/i18next@23.15.1/dist/umd/i18next.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/js/all.min.js
// @require      https://cdn.jsdelivr.net/npm/luxon@3.3.0/build/global/luxon.min.js
// @require      https://unpkg.com/mobx@6.9.0/dist/mobx.umd.production.min.js
// @require      https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js
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
  const SESSION_HEARTBEAT_MINUTES = 30;
  const SESSION_VALIDITY_MINUTES = 40;
  const IP_API_URL = "http://ip-api.com/json/?fields=status,message,query,city,country";
  const GM_SESSION_KEY_PREFIX = `${SCRIPT_NAME}_session_`;
  const GM_EXPIRATION_KEY_PREFIX = `${SCRIPT_NAME}_expiration_`;
  const GM_LAST_REG_DATE_KEY_PREFIX = `${SCRIPT_NAME}_last_reg_date_`; // <<< ADICIONE ESTA LINHA
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

  // >>> INÍCIO: Função para Logar no Firebase (CORRIGIDA P/ STRICT MODE, SÓ ERROS) <<<

  // Flag movida para fora da função para evitar arguments.callee
  let isCurrentlyLogging_logToFirebase = false;

  /**
   * Envia um log ou erro formatado para a coleção 'script_logs' no Firestore.
   * @param {'INFO' | 'WARN' | 'ERROR'} level - O nível do log.
   * @param {string} message - A mensagem principal a ser logada.
   * @param {Error | any} [errorOrDetails] - O objeto de erro (se aplicável) ou detalhes adicionais.
   */
  async function logToFirebase(level, message, errorOrDetails = null) {
    // Se o nível não for ERROR, não fazemos nada no Firebase.
    if (level !== 'ERROR') {
      // A flag isCurrentlyLogging_logToFirebase só é relevante para logging de ERRO,
      // então não precisamos resetá-la aqui.
      return;
    }

    // Evitar loop infinito se o próprio logging de ERRO falhar
    if (isCurrentlyLogging_logToFirebase) return; // Usa a flag externa
    isCurrentlyLogging_logToFirebase = true; // Define a flag externa

    try {
      // Se chegamos aqui, level É 'ERROR'. Tentaremos logar.
      const db = initializeFirebase();
      if (!db) {
        if(originalConsoleError) originalConsoleError('logToFirebase (ERROR): Firestore não inicializado, não é possível logar o erro.');
        else console.error('logToFirebase (ERROR): Firestore não inicializado, não é possível logar o erro.');
        isCurrentlyLogging_logToFirebase = false; // Reseta a flag externa
        return;
      }

      // Coleta informações de contexto
      const context = {
        player: currentPlayerNickname || 'Desconhecido',
        sessionId: currentSessionId || 'N/A',
        url: window.location.href,
        scriptVersion: typeof GM_info !== 'undefined' ? GM_info.script.version : 'Não detectada',
        userAgent: navigator.userAgent || 'N/A',
      };

      // Monta o objeto de log
      const logData = {
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        level: level, // Deverá ser 'ERROR'
        message: String(message),
        context: context,
        details: {}
      };

      // Se um erro foi passado, extrai informações relevantes
      if (errorOrDetails instanceof Error) {
        logData.details.errorMessage = errorOrDetails.message;
        logData.details.errorStack = errorOrDetails.stack || 'Sem stack trace';
        logData.details.errorName = errorOrDetails.name || 'Erro genérico';
      } else if (errorOrDetails !== null) {
        try {
          logData.details.extraData = JSON.stringify(errorOrDetails);
        } catch (e) {
          logData.details.extraData = 'Não foi possível serializar os detalhes adicionais.';
        }
      }

      // Adiciona o documento à coleção 'script_logs'
      await db.collection('script_logs').add(logData);

    } catch (logError) {
       if (originalConsoleError) originalConsoleError('Falha CRÍTICA ao logar ERRO para o Firebase:', logError, 'Log original era:', level, message);
       else console.error('Falha CRÍTICA ao logar ERRO para o Firebase:', logError, 'Log original era:', level, message);
    } finally {
        // Garante que a flag seja resetada, mesmo se ocorrer um erro
        isCurrentlyLogging_logToFirebase = false; // Reseta a flag externa
    }
  }
  // REMOVIDA a flag interna .isLogging
  // >>> FIM: Função para Logar no Firebase (CORRIGIDA) <<<






   // >>> INÍCIO: Logger Wrapper para Console e Firebase (SUBSTITUIR Bloco Anterior) <<<

  // Guarda referências aos métodos originais do console
  const originalConsoleLog = console.log.bind(console);
  const originalConsoleWarn = console.warn.bind(console);
  const originalConsoleError = console.error.bind(console); // Continuamos a guardar o original

  // Função auxiliar para formatar argumentos (mantida igual)
  const formatConsoleArgs = (args) => {
    try {
      return Array.from(args).map(arg => {
        if (arg instanceof Error) {
          return `Error: ${arg.message} (Stack: ${arg.stack})`;
        }
        if (typeof arg === 'object' && arg !== null) {
          try {
            return JSON.stringify(arg, null, 2); // Tenta formatar objetos
          } catch (e) {
            return '[Objeto não serializável]';
          }
        }
        return String(arg); // Converte outros tipos para string
      }).join(' '); // Junta os argumentos com espaço
    } catch (e) {
        return "Erro ao formatar argumentos do console";
    }
  };

  // Cria nosso objeto logger
  const logger = {
    log: function(...args) {
      // 1. Chama o console.log original
      originalConsoleLog.apply(console, args);
      // 2. Envia para o Firebase
      const message = formatConsoleArgs(args);
      logToFirebase('INFO', message);
    },
    warn: function(...args) {
      // 1. Chama o console.warn original
      originalConsoleWarn.apply(console, args);
      // 2. Envia para o Firebase
      const message = formatConsoleArgs(args);
      logToFirebase('WARN', message);
    },
    error: function(...args) {
      // 1. Chama o console.error original
      originalConsoleError.apply(console, args);
      // 2. Envia para o Firebase
      const message = formatConsoleArgs(args);
      const errorArg = Array.from(args).find(arg => arg instanceof Error);
      logToFirebase('ERROR', message, errorArg);
    }
  };



   // Modifica os handlers de erro globais para usar o originalConsoleError e logger.error
  window.onerror = function(message, source, lineno, colno, error) {
    const errorMessage = `Erro não tratado: ${message} em ${source}:${lineno}:${colno}`;
    // Loga no console ORIGINAL primeiro
    if (originalConsoleError) originalConsoleError(errorMessage, error);
    // Usa o nosso logger para enviar ao Firebase (que internamente chama logToFirebase)
    logger.error(errorMessage, error); // << ALTERADO para logger.error >>
  };

  window.onunhandledrejection = function(event) {
    const reason = event.reason || 'Motivo desconhecido';
    const errorMessage = `Rejeição de Promise não tratada: ${reason instanceof Error ? reason.message : reason}`;
     // Loga no console ORIGINAL primeiro
    if (originalConsoleError) originalConsoleError(errorMessage, event.reason);
    // Usa o nosso logger para enviar ao Firebase
    logger.error(errorMessage, event.reason); // << ALTERADO para logger.error >>
  };


  // >>> FIM: Logger Wrapper <<<









      // >>> INÍCIO: Captura de Erros Globais (ADICIONAR ESTE BLOCO) <<<

  // Captura erros de script não tratados
  window.onerror = function(message, source, lineno, colno, error) {
    const errorMessage = `Erro não tratado: ${message} em ${source}:${lineno}:${colno}`;
    // Chama o console.error *original* para garantir que o erro ainda apareça no console do dev
    if (originalConsoleError) {
        originalConsoleError(errorMessage, error);
    } else {
        // Fallback caso algo dê errado com a captura do original
        console.error(errorMessage, error);
    }

    // Envia para o Firebase usando nossa função (que já usa o console.error original internamente se falhar)
    logToFirebase('ERROR', errorMessage, error); // Passa o objeto error para detalhes

    // Retornar true pode suprimir o erro padrão do navegador, opcional
    // return true;
  };

  // Captura rejeições de Promises não tratadas (comuns em código async/await)
  window.onunhandledrejection = function(event) {
    const reason = event.reason || 'Motivo desconhecido';
    const errorMessage = `Rejeição de Promise não tratada: ${reason instanceof Error ? reason.message : reason}`;

    // Chama o console.error *original*
     if (originalConsoleError) {
         originalConsoleError(errorMessage, event.reason);
     } else {
         console.error(errorMessage, event.reason);
     }

    // Envia para o Firebase
    logToFirebase('ERROR', errorMessage, event.reason); // Passa a razão (que pode ser um Error)

    // Previne o log padrão do navegador sobre a rejeição (opcional)
    // event.preventDefault();
  };

  // >>> FIM: Captura de Erros Globais <<<










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

    const todayStr = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const lastRegistrationDateKey = GM_LAST_REG_DATE_KEY_PREFIX + playerNickname;
    const lastRegisteredDateStored = GM_getValue(lastRegistrationDateKey);

    const FirestoreTimestamp = firebase.firestore.Timestamp;
    let expirationDate = null; // Para armazenar a data de expiração da licença

    // Primeiro, sempre verificamos a validade da licença
    try {
      const playerDocRefForLicenseCheck = db.collection("jogadores_permitidos").doc(playerNickname);
      const playerDocSnapForLicenseCheck = await playerDocRefForLicenseCheck.get();

      if (!playerDocSnapForLicenseCheck.exists) {
        throw new Error("Nickname n\xE3o encontrado na lista de permiss\xF5es.");
      }
      const playerDataForLicenseCheck = playerDocSnapForLicenseCheck.data();
      if (!playerDataForLicenseCheck || !playerDataForLicenseCheck.data_expiracao || typeof playerDataForLicenseCheck.data_expiracao.toDate !== "function") {
        throw new Error("Formato da data de expira\xE7\xE3o inv\xE1lido no banco de dados.");
      }
      expirationDate = playerDataForLicenseCheck.data_expiracao.toDate();
      const currentDate = new Date();
      if (currentDate >= expirationDate) {
        throw new Error(`Licen\xE7a expirada em ${expirationDate.toLocaleString()}.`);
      }
      // Se chegou aqui, a licença está OK.
    } catch (licenseError) {
      // Se a verificação da licença falhar, retornamos o erro imediatamente.
      return {
        authorized: false,
        reason: `Falha na verifica\xE7\xE3o da licen\xE7a: ${licenseError.message}` || "Erro desconhecido na verifica\xE7\xE3o da licen\xE7a.",
        sessionId: null
      };
    }

    // Agora, verificamos se já houve um registro de sessão bem-sucedido hoje
    if (lastRegisteredDateStored === todayStr) {
      // Já registrou uma sessão hoje e a licença está OK (verificado acima).
      // Não criamos uma nova entrada em 'sessoes_ativas'.
      // Retornamos 'authorized: true' mas com sessionId: null para indicar que não uma *nova* sessão foi criada no Firestore.
      // A função 'verificarLicenca' usará o sessionId já armazenado no GM_SESSION_KEY_PREFIX para o heartbeat.
      return {
        authorized: true,
        reason: "Licen\xE7a OK. Sess\xE3o di\xE1ria j\xE1 registrada anteriormente.",
        sessionId: null, // Importante: indica que NENHUMA NOVA SESSÃO Firestore foi criada.
        expirationDate // Retornamos a data de expiração da licença que já foi verificada
      };
    }

    // Se não registrou hoje OU se a chave 'lastRegisteredDateStored' foi limpa (ex: por falha de heartbeat)
    // E a licença está OK (verificado no início da função), então tentamos registrar uma nova sessão.
    const newSessionId = generateSessionId();
    const playerDocRef = db.collection("jogadores_permitidos").doc(playerNickname);
    const sessionsColRef = playerDocRef.collection("sessoes_ativas");
    let finalResult = { authorized: false, reason: "Falha desconhecida no registro da sess\xE3o.", sessionId: null, expirationDate };

    try {
      await db.runTransaction(async (transaction) => {
        // A verificação da licença (playerDocSnap.exists e data_expiracao) já foi feita no início.
        // Aqui apenas criamos a nova sessão.
        const newSessionRef = sessionsColRef.doc(newSessionId);
        const nowTimestamp = FirestoreTimestamp.now();
        const sessionData = {
          timestamp_criacao: nowTimestamp,
          timestamp_heartbeat: nowTimestamp
        };
        transaction.set(newSessionRef, sessionData);
      });

      // Se a transação foi bem-sucedida, registramos a data.
      GM_setValue(lastRegistrationDateKey, todayStr);

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
        logger.warn(`${SCRIPT_NAME}: Falha ao atualizar info GEO/Navegador da sessão ${newSessionId} (Não crítico):`, updateError);
      }

      finalResult = {
        authorized: true,
        reason: "Licen\xE7a OK, Nova Sess\xE3o Registrada.",
        sessionId: newSessionId,
        expirationDate // expirationDate já foi obtido
      };
    } catch (error) {
      // Este catch é para erros na transação de criação da sessão.
      finalResult = {
        authorized: false,
        reason: `Falha no registro da sess\xE3o: ${error.message}` || "Erro desconhecido no registro da sess\xE3o.",
        sessionId: null,
        expirationDate // Mantém a data de expiração se já foi obtida
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
          // Se o heartbeat falhou (ex: sessão não encontrada no Firestore)
          // Limpamos a data do último registro para permitir que checkLicenseAndRegisterSession crie uma nova.
          const lastRegistrationDateKey = GM_LAST_REG_DATE_KEY_PREFIX + playerNickname;
          GM_deleteValue(lastRegistrationDateKey);
          logger.warn(`${SCRIPT_NAME}: Heartbeat falhou para sessão ${sessionId}. Chave ${lastRegistrationDateKey} limpa para permitir novo registro.`);

          const checkResult = await checkLicenseAndRegisterSession(playerNickname);
          if (checkResult.authorized && checkResult.sessionId) {
            currentSessionId = checkResult.sessionId; // Atualiza o currentSessionId com o novo
            sessionId = currentSessionId; // Atualiza o sessionId local do loop também
            // Atualiza o GM_SESSION_KEY_PREFIX com o novo sessionId
            const newStorageKey = GM_SESSION_KEY_PREFIX + playerNickname;
            GM_setValue(newStorageKey, { sessionId: currentSessionId, timestamp: Date.now(), expirationDate: checkResult.expirationDate.toISOString() });
            logger.log(`${SCRIPT_NAME}: Nova sessão ${currentSessionId} registrada e armazenada após falha de heartbeat.`);
          } else {
            desativarScript(checkResult.reason || "Falha ao recriar sess\xE3o ap\xF3s heartbeat.");
          }
        }
      } catch (error) {
        desativarScript(`Erro de comunica\xE7\xE3o com o servidor (${error.code || "desconhecido"}).`);
      }
    }, SESSION_HEARTBEAT_MINUTES * 60 * 1e3);
  } // <<< ESTA É A CHAVE QUE ESTAVA FALTANDO




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
    const currentDate = new Date();

    // Tenta usar a sessão já armazenada se a licença ainda parecer válida localmente
    if (storedExpiration && currentDate < storedExpiration) {
      const storedSessionData = GM_getValue(GM_SESSION_KEY_PREFIX + currentPlayerNickname);
      if (storedSessionData && storedSessionData.sessionId) {
        currentSessionId = storedSessionData.sessionId;
        // Poderíamos adicionar uma verificação rápida aqui se a sessão ainda existe no Firestore,
        // mas o heartbeat já fará isso. Por enquanto, confiamos na sessão armazenada.
        logger.log(`${SCRIPT_NAME}: Usando sessão armazenada localmente: ${currentSessionId} (Licença local válida).`);
        return true;
      }
    }

    // Se não há sessão local válida ou a licença local expirou, verifica com o servidor.
    const checkResult = await checkLicenseAndRegisterSession(currentPlayerNickname);

    if (checkResult.authorized) {
      // Licença está OK.
      if (checkResult.expirationDate) { // Garante que temos a data de expiração
        storeExpiration(currentPlayerNickname, checkResult.expirationDate);
      }

      if (checkResult.sessionId) {
        // Um NOVO sessionId foi criado no Firestore.
        currentSessionId = checkResult.sessionId;
        logger.log(`${SCRIPT_NAME}: Nova sessão Firestore ${currentSessionId} registrada.`);
      } else {
        // NENHUM novo sessionId foi criado no Firestore (já havia um para hoje).
        // Tentamos obter o sessionId da sessão ativa armazenada localmente.
        const existingSessionData = GM_getValue(GM_SESSION_KEY_PREFIX + currentPlayerNickname);
        if (existingSessionData && existingSessionData.sessionId) {
          currentSessionId = existingSessionData.sessionId;
          logger.log(`${SCRIPT_NAME}: Usando sessionId existente ${currentSessionId} (registro diário já feito).`);
        } else {
          // Se não houver nenhum sessionId armazenado (raro, mas possível), geramos um localmente.
          // O heartbeat tentará usá-lo; se falhar (porque não existe no Firestore),
          // a lógica de falha do heartbeat limpará GM_LAST_REG_DATE e registrará um novo.
          currentSessionId = generateSessionId();
          logger.warn(`${SCRIPT_NAME}: Nenhum sessionId Firestore novo nem local encontrado. Gerado localmente: ${currentSessionId}.`);
        }
      }

      // Atualiza/salva o GM_SESSION_KEY_PREFIX com o currentSessionId (seja novo, existente ou gerado)
      // e a data de expiração da licença.
      const storageKey = GM_SESSION_KEY_PREFIX + currentPlayerNickname;
      GM_setValue(storageKey, {
        sessionId: currentSessionId,
        timestamp: Date.now(),
        expirationDate: checkResult.expirationDate ? checkResult.expirationDate.toISOString() : getStoredExpiration(currentPlayerNickname)?.toISOString()
      });
      return true;
    } else {
      // Se checkResult.authorized for false
           // Se checkResult.authorized for false
      desativarScript(checkResult.reason || "Falha na verifica\xE7\xE3o da licen\xE7a.");
      return false;
    }
  } // <<< FINAL CORRETO DA FUNÇÃO verificarLicenca

  // <<< A CHAVE EXTRA FOI REMOVIDA DAQUI >>>

  if (typeof firebase === "undefined" || typeof firebase.firestore === "undefined") {
    // alert(`${SCRIPT_NAME}: Erro cr\xEDtico - Componentes de verifica\xE7\xE3o n\xE3o encontrados.`); // Troca alert por desativarScript
    desativarScript("Firebase não encontrado. Script não pode continuar."); // Mais informativo
    return; // Para a execução aqui
  }

  // Verifica a licença ANTES de continuar
  const licencaValida = await verificarLicenca(); // <<< ESTA LINHA AGORA DEVE FUNCIONAR
  if (!licencaValida) {
    // A função verificarLicenca já chama desativarScript se a licença for inválida.
    logger.error(`${SCRIPT_NAME}: Verificação de licença falhou. Script interrompido.`);
    return; // Interrompe a execução do script
  }

  // Se a licença for válida, marca o script como ativo e inicia o monitoramento/heartbeat
  isScriptActive = true;
  iniciarMonitoramentoRealtimeEHeartbeat(currentPlayerNickname, currentSessionId);
  logger.log(`${SCRIPT_NAME}: Licença VÁLIDA. Script ativo. Iniciando monitoramento e heartbeat para ${currentPlayerNickname} / ${currentSessionId}`);

  // --- Continuação da inicialização do script ---
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
  }; // <<< FIM DO BLOCO A SER SUBSTITUÍDO


// Função fetchMarketData ATUALIZADA para garantir o servidor correto
async function fetchMarketData(url) {
    // 1. Obtém informações do servidor atual
    let currentServer = '';
    let currentWorld = '';
    try {
        const gameData = TribalWars.getGameData();
        currentServer = window.location.hostname; // Ex: nl.tribalwars.nl
        currentWorld = gameData.world || 'unknown'; // Ex: nlXX
    } catch (e) {
        logger.error("[RAG-DEBUG-FetchMarketData] Erro ao obter dados do servidor:", e);
        throw new Error("Não foi possível identificar o servidor atual.");
    }

    // 2. Valida se a URL pertence ao servidor atual
    if (!url.includes(currentServer)) {
        // >> Log Adicionado <<
        console.warn(`[RAG-DEBUG-FetchMarketData] URL (${url}) NÃO corresponde ao servidor ATUAL (${currentServer}). Chamada IGNORADA.`);
        // Idealmente, isso não deveria acontecer, mas é bom registrar.
        throw new Error(`URL inválida para o servidor atual (${currentServer}).`);
        // Considerar retornar null ou algo que indique falha controlada? Por enquanto, lançar erro parece OK.
    }

    // 3. Cria uma chave de cache única incluindo o mundo
    const cacheKey = `${currentWorld}:${url}`;
    const cachedData = requestCache.get(cacheKey);
    if (cachedData) {
        // >> Log Adicionado <<
        // console.log(`[RAG-DEBUG-FetchMarketData] Cache HIT para ${cacheKey}. Retornando dados cacheados.`);
        return cachedData;
    }

    // >> Log Adicionado <<
    console.log(`[RAG-DEBUG-FetchMarketData] Buscando dados para [${cacheKey}]: ${url}`);
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                 // Poderíamos adicionar 'Accept-Language' mas geralmente não é necessário para estrutura HTML
                 // 'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8' // Exemplo
            },
            timeout: 7000,
            onload: function(response) {
                if (response.status >= 200 && response.status < 300) {
                    try {
                        const responseData = response.responseText;
                        // >> Log Adicionado (Trecho da Resposta) <<
                        console.log(`[RAG-DEBUG-FetchMarketData] Dados recebidos OK para [${cacheKey}]. Trecho Inicial:`, responseData.substring(0, 300) + "..."); // Loga os primeiros 300 caracteres
                        requestCache.set(cacheKey, responseData); // Usa cacheKey com mundo
                        resolve(responseData);
                    } catch (e) {
                        console.error(`[RAG-DEBUG-FetchMarketData] Erro ao processar resposta de [${cacheKey}]:`, e);
                        reject(new Error(`Erro ao processar resposta do servidor para ${cacheKey}`)); // Mais detalhe
                    }
                } else {
                    // >> Log Adicionado <<
                    console.error(`[RAG-DEBUG-FetchMarketData] Erro HTTP ${response.status} para [${cacheKey}]: ${response.statusText}. Resposta:`, response.responseText.substring(0, 500)); // Loga um trecho da resposta em caso de erro
                    reject(new Error(`Erro HTTP ${response.status} para ${cacheKey}`));
                }
            },
            onerror: function(error) {
                // >> Log Adicionado <<
                console.error(`[RAG-DEBUG-FetchMarketData] Erro de REDE para [${cacheKey}]:`, error);
                reject(new Error(`Erro de rede ao buscar dados para ${cacheKey}`));
            },
            ontimeout: function() {
                // >> Log Adicionado <<
                console.error(`[RAG-DEBUG-FetchMarketData] TIMEOUT para [${cacheKey}]`);
                reject(new Error(`Timeout ao buscar dados para ${cacheKey}`));
            }
        });
    });
}



// >>> INÍCIO SUBSTITUIÇÃO OBJETO TRANSLATIONS COMPLETO (v1.5 - Ukr + CaptchaPauseText) <<<
const translations = {
    resources: {
      pt: {
        translation: {
          // --- Textos Gerais da UI ---
          title: "AQUILA PRIME COMPRA E VENDA DE RECURSOS",
          buyModeToggleOn: "Desativar Compra",
          buyModeToggleOff: "Habilitar Compra",
          sellModeToggleOn: "Desativar Venda",
          sellModeToggleOff: "Habilitar Venda",
          saveConfig: "Salvar",
          resetAll: "Resetar Tudo",
          pause: "Pausar",
          transactions: "Transa\xE7\xF5es",
          aiAssistant: "Assistente IA Aquila Prime",
          settings: "Configura\xE7\xF5es",
          saveSuccess: "Configura\xE7\xE3o salva com sucesso!",
          portuguese: "Portugu\xEAs",
          russian: "Russo",
          english: "Ingl\xEAs",
          ukrainian: "Ucraniano",
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
          tooltipAIAssistant: "Abrir Assistente IA Aquila Prime",
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
          settingsLabelCloseOnHCaptcha: "Pausar Script no Captcha:", // <-- TEXTO ALTERADO
          hCaptchaDetectedLog: "hCaptcha detectado!",
          attemptingTabCloseLog: "Configura\xE7\xE3o ativa - Tentando fechar a aba...", // (Log não mais usado, mas chave mantida)
          tabCloseErrorLog: "Erro ao tentar fechar a aba (pode ser bloqueado pelo navegador):", // (Log não mais usado, mas chave mantida)
          // --- Tooltips Configurações ---
          tooltipInterfaceLang: "Seleciona o idioma para a interface Aquila Prime.",
          tooltipBuyPauseDuration: "Tempo (em minutos) que o modo de compra ficará pausado ao clicar no botão 'Pausar'. A função será reativada automaticamente após este período.",
          tooltipSellPauseDuration: "Tempo (em minutos) que o modo de venda ficará pausado ao clicar no botão 'Pausar'. A função será reativada automaticamente após este período.",
          tooltipCloseOnHCaptcha: "Se marcado, o script pausará automaticamente as funções de compra e venda se um desafio captcha for detectado. Clique no botão de pausa novamente para retomar após resolver.", // <-- TEXTO ALTERADO
          statusLabel: "Status:",
          premiumExchange: "Troca Premium",
          // --- Textos Dinâmicos e Notificações ---
          pausedUntil: "Pausado até {{time}}",
          pauseDurationSet: "Pausa de {{mode}} definida por {{duration}} minuto(s).",
          pauseExpired: "Pausa de {{mode}} expirou. Funcionalidade reativada.",
          statusResumedManually: "{{mode}} retomado manualmente.",
          setPauseDurationError: "Defina uma duração de pausa (> 0) nas configurações.",
          buy: "Compra",
          sell: "Venda",
          captchaPauseNotification: "CAPTCHA detectado! Script pausado. Resolva o captcha e clique no botão 'Retomar' (Pausa) para continuar.",
        }
      },
      ru: {
        translation: {
          title: "АКВИЛА ПРАЙМ ПОКУПКА И ПРОДАЖА РЕСУРСОВ",
          buyModeToggleOn: "\u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u043E\u043A\u0443\u043F\u043A\u0443",
          buyModeToggleOff: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u043E\u043A\u0443\u043F\u043A\u0443",
          sellModeToggleOn: "\u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u0440\u043E\u0434\u0430\u0436\u0443",
          sellModeToggleOff: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043F\u0440\u043E\u0434\u0430\u0436\u0443",
          saveConfig: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C",
          resetAll: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0432\u0441\u0451",
          pause: "\u041F\u0430\u0443\u0437\u0430",
          transactions: "\u0422\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0438",
          aiAssistant: "\u0418\u0418-\u0410\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442 \u0410\u043A\u0432\u0438\u043B\u0430 \u041F\u0440\u0430\u0439\u043C",
          settings: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
          saveSuccess: "\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0430!",
          portuguese: "\u041F\u043E\u0440\u0442\u0443\u0433\u0430\u043B\u044C\u0441\u043A\u0438\u0439",
          russian: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
          english: "\u0410\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439",
          ukrainian: "Українська",
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
          tooltipAIAssistant: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0418\u0418-\u0430\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442\u0430 Aquila Prime",
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
          settingsSectionPause: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u0430\u0443\u0437\u044B",
          settingsLabelBuyPauseDuration: "\u0414\u043B\u0438\u0442. \u043F\u0430\u0443\u0437\u044B \u043F\u043E\u043A\u0443\u043F\u043A\u0438 (\u043C\u0438\u043D):",
          settingsLabelSellPauseDuration: "\u0414\u043B\u0438\u0442. \u043F\u0430\u0443\u0437\u044B \u043F\u0440\u043E\u0434\u0430\u0436\u0438 (\u043C\u0438\u043D):",
          settingsLabelPlayer: "\u0418\u0433\u0440\u043E\u043A:",
          settingsLabelLicense: "\u041B\u0438\u0446\u0435\u043D\u0437\u0438\u044F \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442 \u0434\u043E:",
          settingsLabelVersion: "\u0412\u0435\u0440\u0441\u0438\u044F \u0441\u043A\u0440\u0438\u043F\u0442\u0430:",
          settingsLabelInterfaceLang: "\u042F\u0437\u044B\u043A \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430:",
          settingsLabelCloseOnHCaptcha: "Пауза Скрипта при Captcha:", // <-- TEXTO ALTERADO
          hCaptchaDetectedLog: "hCaptcha \u043E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D!",
          attemptingTabCloseLog: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u0430 - \u041F\u043E\u043F\u044B\u0442\u043A\u0430 \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u044F \u0432\u043A\u043B\u0430\u0434\u043A\u0438...", // (Log não mais usado, mas chave mantida)
          tabCloseErrorLog: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u043E\u043F\u044B\u0442\u043A\u0435 \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u044F \u0432\u043A\u043B\u0430\u0434\u043A\u0438 (\u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043E\u043C):", // (Log não mais usado, mas chave mantida)
          tooltipInterfaceLang: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u044F\u0437\u044B\u043A \u0434\u043B\u044F \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430 Aquila Prime.",
          tooltipBuyPauseDuration: "\u0412\u0440\u0435\u043C\u044F (\u0432 \u043C\u0438\u043D\u0443\u0442\u0430\u0445), \u043D\u0430 \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0440\u0435\u0436\u0438\u043C \u043F\u043E\u043A\u0443\u043F\u043A\u0438 \u0431\u0443\u0434\u0435\u0442 \u043F\u0440\u0438\u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u043F\u0440\u0438 \u043D\u0430\u0436\u0430\u0442\u0438\u0438 \u043A\u043D\u043E\u043F\u043A\u0438 '\u041F\u0430\u0443\u0437\u0430'. \u0424\u0443\u043D\u043A\u0446\u0438\u044F \u0431\u0443\u0434\u0435\u0442 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0432\u043E\u0437\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0430 \u043F\u043E\u0441\u043B\u0435 \u044D\u0442\u043E\u0433\u043E \u043F\u0435\u0440\u0438\u043E\u0434\u0430.",
          tooltipSellPauseDuration: "\u0412\u0440\u0435\u043C\u044F (\u0432 \u043C\u0438\u043D\u0443\u0442\u0430\u0445), \u043D\u0430 \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0440\u0435\u0436\u0438\u043C \u043F\u0440\u043E\u0434\u0430\u0436\u0438 \u0431\u0443\u0434\u0435\u0442 \u043F\u0440\u0438\u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u043F\u0440\u0438 \u043D\u0430\u0436\u0430\u0442\u0438\u0438 \u043A\u043D\u043E\u043F\u043A\u0438 '\u041F\u0430\u0443\u0437\u0430'. \u0424\u0443\u043D\u043A\u0446\u0438\u044F \u0431\u0443\u0434\u0435\u0442 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0432\u043E\u0437\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0430 \u043F\u043E\u0441\u043B\u0435 \u044D\u0442\u043E\u0433\u043E \u043F\u0435\u0440\u0438\u043E\u0434\u0430.",
          tooltipCloseOnHCaptcha: "Если отмечено, скрипт автоматически приостановит функции покупки и продажи при обнаружении проверки captcha. Нажмите кнопку паузы еще раз, чтобы возобновить после решения.", // <-- TEXTO ALTERADO
          statusLabel: "\u0421\u0442\u0430\u0442\u0443\u0441:",
          premiumExchange: "\u041F\u0440\u0435\u043C\u0438\u0443\u043C-\u043E\u0431\u043C\u0435\u043D",
          pausedUntil: "\u041F\u0430\u0443\u0437\u0430 \u0434\u043E {{time}}",
          pauseDurationSet: "\u041F\u0430\u0443\u0437\u0430 (\u0420\u0435\u0436\u0438\u043C: {{mode}}) \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430 \u043D\u0430 {{duration}} \u043C\u0438\u043D.",
          pauseExpired: "\u041F\u0430\u0443\u0437\u0430 (\u0420\u0435\u0436\u0438\u043C: {{mode}}) \u0438\u0441\u0442\u0435\u043A\u043B\u0430. \u0424\u0443\u043D\u043A\u0446\u0438\u044F \u0432\u043E\u0437\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0430.",
          statusResumedManually: "\u0420\u0435\u0436\u0438\u043C {{mode}} \u0432\u043E\u0437\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D \u0432\u0440\u0443\u0447\u043D\u0443\u044E.",
          setPauseDurationError: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043F\u0430\u0443\u0437\u044B (> 0) \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445.",
          buy: "\u041F\u043E\u043A\u0443\u043F\u043A\u0430",
          sell: "\u041F\u0440\u043E\u0434\u0430\u0436\u0430",
          captchaPauseNotification: "Обнаружена КАПЧА! Скрипт приостановлен. Решите капчу и нажмите кнопку 'Возобновить' (Пауза), чтобы продолжить.",
        }
      },
      en: {
        translation: {
          title: "AQUILA PRIME RESOURCE TRADING",
          buyModeToggleOn: "Turn Off Buying",
          buyModeToggleOff: "Turn On Buying",
          sellModeToggleOn: "Turn Off Selling",
          sellModeToggleOff: "Turn On Selling",
          saveConfig: "Save",
          resetAll: "Reset Everything",
          pause: "Pause",
          transactions: "Transactions",
          aiAssistant: "Aquila Prime AI Assistant",
          settings: "Settings",
          saveSuccess: "Settings saved successfully!",
          portuguese: "Portuguese",
          russian: "Russian",
          english: "English",
          ukrainian: "Ukrainian",
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
          tooltipAIAssistant: "Open Aquila Prime AI Assistant",
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
          settingsSectionPause: "Pause Settings",
          settingsLabelBuyPauseDuration: "Buy Pause Duration (min):",
          settingsLabelSellPauseDuration: "Sell Pause Duration (min):",
          settingsLabelPlayer: "Player:",
          settingsLabelLicense: "License Expires:",
          settingsLabelVersion: "Script Version:",
          settingsLabelInterfaceLang: "Interface Language:",
          settingsLabelCloseOnHCaptcha: "Pause Script on Captcha:", // <-- TEXTO ALTERADO
          hCaptchaDetectedLog: "hCaptcha detected!",
          attemptingTabCloseLog: "Setting enabled - Attempting to close tab...", // (Log não mais usado, mas chave mantida)
          tabCloseErrorLog: "Error attempting to close tab (may be blocked by browser):", // (Log não mais usado, mas chave mantida)
          tooltipInterfaceLang: "Select the language for the Aquila Prime interface.",
          tooltipBuyPauseDuration: "Time (in minutes) the buying mode will be paused when clicking the 'Pause' button. Functionality will automatically resume after this period.",
          tooltipSellPauseDuration: "Time (in minutes) the selling mode will be paused when clicking the 'Pause' button. Functionality will automatically resume after this period.",
          tooltipCloseOnHCaptcha: "If checked, the script will automatically pause buying and selling functions if a captcha challenge is detected. Click the pause button again to resume after solving.", // <-- TEXTO ALTERADO
          statusLabel: "Status:",
          premiumExchange: "Premium Exchange",
          pausedUntil: "Paused until {{time}}",
          pauseDurationSet: "{{mode}} Pause set for {{duration}} minute(s).",
          pauseExpired: "{{mode}} Pause expired. Functionality reactivated.",
          statusResumedManually: "{{mode}} manually resumed.",
          setPauseDurationError: "Set a pause duration (> 0) in settings.",
           buy: "Buying",
           sell: "Selling",
          captchaPauseNotification: "CAPTCHA detected! Script paused. Solve the captcha and click the 'Resume' (Pause) button to continue.",
        }
      },
      uk: {
        translation: {
          title: "AQUILA PRIME КУПІВЛЯ ТА ПРОДАЖ РЕСУРСІВ",
          buyModeToggleOn: "Вимкнути Купівлю",
          buyModeToggleOff: "Увімкнути Купівлю",
          sellModeToggleOn: "Вимкнути Продаж",
          sellModeToggleOff: "Увімкнути Продаж",
          saveConfig: "Зберегти",
          resetAll: "Скинути Все",
          pause: "Пауза",
          transactions: "Транзакції",
          aiAssistant: "ШІ-Асистент Aquila Prime",
          settings: "Налаштування",
          saveSuccess: "Налаштування успішно збережено!",
          portuguese: "Португальська",
          russian: "Російська",
          english: "Англійська",
          ukrainian: "Українська",
          activated: "Активовано",
          deactivated: "Деактивовано",
          transactionInProgress: "Обробка транзакції...",
          transactionSuccess: "Транзакцію успішно завершено!",
          transactionError: "Помилка транзакції. Спробуйте ще раз.",
          domError: "Помилка доступу до елементів гри. Оновлення...",
          noTransactions: "Транзакцій не знайдено.",
          transactionsHeader: "Історія Транзакцій",
          transaction: "Транзакція",
          date: "Дата",
          type: "Тип",
          change: "Зміна",
          world: "Світ",
          newPremiumPoints: "Нові Преміум Очки",
          close: "Закрити",
          filters: "Фільтри",
          dateFrom: "Дата Від",
          dateTo: "Дата До",
          worldFilter: "Фільтр по Світу",
          sortAsc: "Сортувати за Зростанням",
          sortDesc: "Сортувати за Спаданням",
          page: "Сторінка",
          next: "Наступна",
          previous: "Попередня",
          chartTitle: "Зміни з Часом",
          expenses: "Витрати",
          sales: "Доходи",
          profit: "Прибуток",
          filteredPeriodProfitLabel: "Чистий Прибуток (Період)",
          aiPrompt: "Введіть ваше запитання для ШІ-Асистента",
          aiLoading: "Завантаження відповіді...",
          aiError: "Помилка отримання відповіді від ШІ",
          tooltipMinimize: "Згорнути Вікно",
          tooltipSettings: "Відкрити Налаштування",
          tooltipAIAssistant: "Відкрити ШІ-Асистента Aquila Prime",
          stockDesiredTooltip: "Встановлює максимальну кількість {{resource}}, враховуючи суму наявних ресурсів у селі та ресурсів у дорозі.",
          userRateTooltip: "Мінімальний курс (преміум очки за одиницю) для купівлі {{resource}}. Скрипт купує тільки якщо ринковий курс дорівнює або вищий.",
          buyPerTimeTooltip: "Максимальна кількість за одну купівлю/транзакцію. Скрипт не перевищує це значення.",
          reserveAmountTooltip: "Мінімальна кількість {{resource}}, яку потрібно залишити. Скрипт не продає, якщо запас дорівнює або менший.",
          reserveRateTooltip: "Максимальний курс (преміум очки за одиницю) для продажу {{resource}}. Скрипт продає тільки якщо ринковий курс дорівнює або нижчий.",
          sellLimitTooltip: "Максимальна кількість за один продаж/транзакцію. Скрипт не перевищує це значення.",
          tooltipVillageSelect: "Відображає активне село та координати.",
          tooltipPauseBuy: "Призупинити Купівлю на час, вказаний у Налаштуваннях.",
          tooltipPauseSell: "Призупинити Продаж на час, вказаний у Налаштуваннях.",
          clickToResumeTooltip: "Натисніть, щоб відновити",
          tooltipSaveConfig: "Зберігає поточні налаштування в локальному сховищі браузера.",
          tooltipTransactions: "Відкриває історію транзакцій Преміум Очок.",
          tooltipPremiumLimit: "МАКСИМАЛЬНИЙ ліміт ПО, який скрипт може ВИТРАТИТИ на покупки.",
          tooltipWorldProfit: "Відображає ЧИСТИЙ баланс Преміум Очок, отриманий у цьому світі (Загальний дохід - Загальні витрати, на основі історії).",
          resourceNames: {
            wood: "дерево",
            stone: "глина",
            iron: "залізо"
          },
          settingsSectionAccount: "Інформація Облікового Запису",
          settingsSectionLanguage: "Мова",
          settingsSectionGeneral: "Загальні",
          settingsSectionPause: "Налаштування Паузи",
          settingsLabelBuyPauseDuration: "Трив. Паузи Купівлі (хв):",
          settingsLabelSellPauseDuration: "Трив. Паузи Продажу (хв):",
          settingsLabelPlayer: "Гравець:",
          settingsLabelLicense: "Ліцензія Діє До:",
          settingsLabelVersion: "Версія Скрипту:",
          settingsLabelInterfaceLang: "Мова Інтерфейсу:",
          settingsLabelCloseOnHCaptcha: "Пауза Скрипту при Captcha:", // <-- TEXTO ALTERADO
          hCaptchaDetectedLog: "Виявлено hCaptcha!",
          attemptingTabCloseLog: "Налаштування активне - Спроба закрити вкладку...", // (Log não mais usado, mas chave mantida)
          tabCloseErrorLog: "Помилка при спробі закрити вкладку (може бути заблоковано браузером):", // (Log não mais usado, mas chave mantida)
          tooltipInterfaceLang: "Виберіть мову для інтерфейсу Aquila Prime.",
          tooltipBuyPauseDuration: "Час (у хвилинах), на який режим купівлі буде призупинено при натисканні кнопки 'Пауза'. Функція автоматично відновиться після цього періоду.",
          tooltipSellPauseDuration: "Час (у хвилинах), на який режим продажу буде призупинено при натисканні кнопки 'Пауза'. Функція автоматично відновиться після цього періоду.",
          tooltipCloseOnHCaptcha: "Якщо позначено, скрипт автоматично призупинить функції купівлі та продажу при виявленні перевірки captcha. Натисніть кнопку паузи ще раз, щоб відновити після розв'язання.", // <-- TEXTO ALTERADO
          statusLabel: "Статус:",
          premiumExchange: "Преміум Обмін",
          pausedUntil: "Пауза до {{time}}",
          pauseDurationSet: "Паузу {{mode}} встановлено на {{duration}} хвилин(и).",
          pauseExpired: "Пауза {{mode}} завершилася. Функцію відновлено.",
          statusResumedManually: "{{mode}} відновлено вручну.",
          setPauseDurationError: "Встановіть тривалість паузи (> 0) у налаштуваннях.",
          buy: "Купівля",
          sell: "Продаж",
          captchaPauseNotification: "Виявлено КАПЧУ! Скрипт призупинено. Розв'яжіть капчу та натисніть кнопку 'Відновити' (Пауза), щоб продовжити.",
        }
      }
    }
};
// >>> FIM SUBSTITUIÇÃO OBJETO TRANSLATIONS COMPLETO <<<


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
    i18n.addResourceBundle("uk", "translation", translations.resources.uk.translation, true, true); // <-- ADICIONADO
    const currentLang = localStorage.getItem("language") || "pt";
    if (i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang).catch((err) => console.error("Erro ao mudar l\xEDngua no i18next j\xE1 inicializado:", err));
    }
  }
  i18n.init({
    lng: localStorage.getItem("language") || "pt",
    // Keep using saved language or default
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
 // === INÍCIO DA ATUALIZAÇÃO ResourceHandler (v2 - Adiciona getMarketStockAvailable) ===
  class ResourceHandler {
    constructor(name, config) {
      this.name = name;
      this.config = config;
      this.elementCache = /* @__PURE__ */ new Map();
      // Log no construtor para confirmar criação
      // console.log(`[RAG-DEBUG-Handler ${this.name}] Handler Criado. Config:`, config);
    }

    // Função auxiliar interna para buscar elementos DOM
    getDomElement(selector) {
      // Log para depuração da busca de elementos (opcional, pode ficar barulhento)
      // console.log(`[RAG-DEBUG-Handler ${this.name}] Buscando elemento DOM com seletor: ${selector}`);
      if (!this.elementCache.has(selector)) {
        const element = document.querySelector(selector);
        // console.log(`[RAG-DEBUG-Handler ${this.name}] -> Cache MISS para '${selector}'. Elemento encontrado: ${!!element}`);
        this.elementCache.set(selector, element); // Cacheia mesmo se for null para evitar buscas repetidas
        return element;
      }
      // console.log(`[RAG-DEBUG-Handler ${this.name}] -> Cache HIT para '${selector}'.`);
      return this.elementCache.get(selector);
    }

    // Função auxiliar interna para limpar e converter números
    sanitizeNumber(value) {
      // Adiciona log para o valor de entrada e saída (pode ser útil para depurar NaNs)
      const originalValue = value;
      const sanitized = _.parseInt(String(value || '0').replace(/[.,]/g, ''), 10) || 0; // Trata null/undefined e remove pontos/vírgulas
      // console.log(`[RAG-DEBUG-Handler ${this.name} sanitizeNumber] Entrada: '${originalValue}', Saída: ${sanitized}`);
      return sanitized;
    }

    // Obtém o SEU estoque atual na visão do Mercado Premium
    getStock() {
        const element = this.getDomElement(this.config.stockSelector);
        const value = element ? element.textContent.trim() : '0';
        // Log específico para getStock
        // console.log(`[RAG-DEBUG-Handler ${this.name} getStock] Elemento: ${!!element}, Texto: '${value}'`);
        return this.sanitizeNumber(value);
    }

    // >>> NOVA FUNÇÃO: Obtém o ESTOQUE DISPONÍVEL PARA COMPRA NO MERCADO <<<
    getMarketStockAvailable() {
        const logPrefix = `[RAG-DEBUG-Handler ${this.name} getMarketStockAvailable v1.0]`;
        // O seletor é o mesmo do getStock, pois ambos são lidos da mesma área na UI do jogo
        const selector = this.config.stockSelector;
        // console.log(`${logPrefix} Buscando estoque do MERCADO com seletor: ${selector}`);
        const stockElement = this.getDomElement(selector); // Reusa getDomElement que tem cache

        if (stockElement) {
            const stockText = stockElement.textContent || '0';
            const availableStock = this.sanitizeNumber(stockText); // Reusa sanitizeNumber com log
           logger.log(`${logPrefix} -> Elemento encontrado. Texto: '${stockText}'. Estoque Mercado: ${availableStock}`);
            return availableStock;
        } else {
            console.warn(`${logPrefix} -> Elemento de estoque do mercado (${selector}) NÃO ENCONTRADO. Retornando 0.`);
            return 0; // Retorna 0 se o elemento não for encontrado
        }
    }
    // >>> FIM DA NOVA FUNÇÃO <<<

    // Obtém a TAXA DE COMPRA atual do jogo (PP por 1000 unidades)
    getGameRate() {
        const element = this.getDomElement(this.config.rateSelector);
        let value = '0';
        if (element) {
            value = element.textContent?.trim() || '0';
        }
        // Log específico para getGameRate (taxa de COMPRA)
        // console.log(`[RAG-DEBUG-Handler ${this.name} getGameRate] Elemento Taxa Compra: ${!!element}, Texto: '${value}'`);
        return this.sanitizeNumber(value.replace(/\D/g, "")); // Remove não dígitos antes de sanitizar
    }

    // Obtém a TAXA DE COMPRA mínima definida pelo usuário na UI do script
    getUserRate() {
      const value = this.config.uiRateInput ? this.config.uiRateInput.value : '0';
      // Log para taxa do usuário
      // console.log(`[RAG-DEBUG-Handler ${this.name} getUserRate] Valor input UI: '${value}'`);
      return this.sanitizeNumber(value);
    }

    // Obtém o SEU estoque TOTAL na aldeia (lido de currentResources)
    getTotal() {
        const total = currentResources[this.name] || 0; // Usa o objeto global atualizado por fetchResources
        // console.log(`[RAG-DEBUG-Handler ${this.name} getTotal] Valor de currentResources: ${total}`);
        return total; // Já é número, não precisa sanitizar
    }

    // Obtém a quantidade de RESERVA definida pelo usuário na UI do script (para Venda)
    getReserved() {
      const value = this.config.uiReserveInput ? this.config.uiReserveInput.value : '0';
      // Log para reserva do usuário
      // console.log(`[RAG-DEBUG-Handler ${this.name} getReserved] Valor input Reserva UI: '${value}'`);
      return this.sanitizeNumber(value);
    }

    // Obtém a TAXA DE VENDA (MÚLTIPLOS) do mercado (ex: 64 recursos / 1 PP)
    // getMarketValue ATUALIZADO v6.3 - Parseia SOMENTE o primeiro número encontrado
    getMarketValue() {
        const logPrefix = `[RAG-DEBUG-Handler ${this.name} getMarketValue v6.3]`; // Versão no Log
        // console.log(`${logPrefix} Iniciando busca por marketRate (Taxa VENDA).`);

        const iconSelector = `${this.config.marketImg}, img[title*='${this.name}' i], span.resource_icon_${this.name}`;
        const marketIcon = document.querySelector(iconSelector);

        if (!marketIcon) {
            // console.warn(`${logPrefix} ÍCONE NÃO ENCONTRADO. Tentando fallback taxa COMPRA.`);
            const buyRate = this.getGameRate(); // Obtém a taxa de compra (PP/1000)
            // console.warn(`${logPrefix} -> Ícone Venda NÃO encontrado. Usando Taxa Compra (${buyRate}) como fallback para lógica de VENDA.`);
            // A lógica de venda precisa do "exchange rate", não da taxa de compra. Isso aqui provavelmente não funciona bem.
            // Melhor retornar 0 para Venda se não achar o ícone.
            console.error(`${logPrefix} -> Ícone de Venda não encontrado. Retornando 0 para getMarketValue.`); return 0;

        }

        // console.log(`${logPrefix} Ícone ENCONTRADO. Buscando valor na CÉLULA (TD).`);
        const tableCell = marketIcon.closest('td');

        if (!tableCell) {
             console.warn(`${logPrefix} FALHOU: Ícone encontrado, mas não está dentro de uma célula TD? Retornando 0.`);
             return 0; // Retorna 0 se não achar célula
        }

        const cellText = tableCell.textContent.trim();
        // console.log(`${logPrefix}   -> Texto Bruto da Célula TD: '${cellText}'`);

        // Usa regex para encontrar o PRIMEIRO conjunto de dígitos (pode incluir ponto ou vírgula como separador decimal/milhar)
        const numberMatch = cellText.match(/([\d.,]+)/); // Encontra a primeira sequência de dígitos, pontos ou vírgulas

        if (numberMatch && numberMatch[1]) {
            const extractedNumberString = numberMatch[1];
            // console.log(`${logPrefix}   -> Primeira sequência numérica encontrada: '${extractedNumberString}'`);
            // Usa parseIntSafeTransport para limpar e converter
            const rate = parseIntSafeTransport(extractedNumberString); // parseIntSafeTransport foi fornecido antes

            if (rate > 0) {
                 // console.log(`${logPrefix} SUCESSO: Rate extraído (1º número) = ${rate}`);
                 return rate;
             } else {
                  console.warn(`${logPrefix} FALHOU: Primeiro número encontrado ('${extractedNumberString}'), mas parseado para ${rate}. Retornando 0.`);
                  return 0;
              }
        } else {
            console.warn(`${logPrefix} FALHOU: Nenhum número encontrado na célula TD '${cellText}'. Retornando 0.`);
            return 0;
        }
    } // Fim getMarketValue


    // Obtém a TAXA DE VENDA máxima definida pelo usuário na UI do script
    getReserveRate() {
      const value = this.config.uiReserveRateInput ? this.config.uiReserveRateInput.value : '0';
      // Log para taxa reserva do usuário
      // console.log(`[RAG-DEBUG-Handler ${this.name} getReserveRate] Valor input Taxa Reserva UI: '${value}'`);
      return this.sanitizeNumber(value);
    }

    // Obtém o elemento input de COMPRA no jogo
    getBuyInput() {
      return this.getDomElement(this.config.buyInputSelector);
    }

    // Obtém o elemento input de VENDA no jogo
    getSellInput() {
      return this.getDomElement(this.config.sellInputSelector);
    }
  }
// === FIM DA ATUALIZAÇÃO ResourceHandler ===












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









// Atualização do objeto state (sem transações, lucro, chart, etc.)
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
    marketRates: {}, // Mantido para análise de mercado se necessário
    buyModeActive: localStorage.getItem("buyModeActive") === "true",
    sellModeActive: localStorage.getItem("sellModeActive") === "true",
    buyPausedUntil: null,
    sellPausedUntil: null,
    buyPauseDurationMinutes: 5,
    sellPauseDurationMinutes: 5,
    hasExecutedBuy: false,
    hasExecutedSell: false,
    reloadPending: false,
    autoReloadOnError: true, // Mantido
    lastKnownPPLimitBeforeBuy: null, // Mantido para lógica pós-compra
    lastKnownPPBalanceBeforeBuy: null, // Mantido para lógica pós-compra
    closeTabOnHCaptcha: false,
    isDarkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
    currentVillage: null,
    // REMOVIDO: worldProfit
    language: localStorage.getItem("language") || "pt",
    optimizedRates: mobx.computed(function() {
        return this.marketRates || {};
    }),
    rateHistory: {
        wood: [],
        stone: [],
        iron: []
    }, // Mantido para análise de mercado
    marketTrends: {
        wood: "neutral",
        stone: "neutral",
        iron: "neutral"
    }, // Mantido para análise de mercado
    marketVolatility: {
        wood: 0,
        stone: 0,
        iron: 0
    }, // Mantido para análise de mercado
    lastUpdate: {
        wood: null,
        stone: null,
        iron: null
    }, // Mantido para análise de mercado
    marketConditions: mobx.computed(function() { // Mantido para análise de mercado
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
    // REMOVIDO: allTransactionsFetched
    // REMOVIDO: isUpdating (relacionado a transações)
    isSettingsModalOpen: false,
    isMinimized: false
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
// ===        FUNÇÃO initializeUI ATUALIZADA (v18 - Sem Logs/Transações) ===
// ================================================================
const initializeUI = () => {
    const container = createElement("div", {
        className: "market-container draggable",
        style: "position: fixed; top: 50px; left: 50px; z-index: 2147483647; overflow: hidden;"
    });
    elementCache.set("market-container", container);
    ui.elements.set("market-container", container);

    // --- HTML da Interface (Sem botão Transações, sem Modal Transações, sem Lucro Mundo) ---
    container.innerHTML = `
        <div class="market-container">
            <div class="header">
                <h2 id="headerTitle">${i18n.t("title")}</h2>
                <div class="dropdowns">
                    <div class="dropdown" data-tooltip-key="tooltipVillageSelect">
                        <span class="village-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="#ffa500"/>
                            </svg>
                        </span>
                        <select id="villageSelect"><option value="current">Carregando...</option></select>
                    </div>

                    <!-- REMOVIDO: Div de Lucro do Mundo -->
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
                    <!-- REMOVIDO: Botão Transações -->
                    ${createButton("saveConfig", `<i class="fa-solid fa-floppy-disk"></i> ${i18n.t("saveConfig")}`, "black-btn", {"data-tooltip-key": "tooltipSaveConfig"})}
                </div>
            </div>

            <!-- REMOVIDO: MODAL TRANSAÇÕES -->

            <!-- MODAL IA (Conteúdo Mantido) -->
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

             <!-- MODAL CONFIGURAÇÕES (Conteúdo Mantido) -->
            <div class="modal aquila-modal" id="settingsModal" style="display: none; z-index: 50;">
                 <div class="modal-content settings-content aquila-panel">
                    <div class="settings-header aquila-header">
                       <span class="aquila-icon">
                          <img src="https://cdn.jsdelivr.net/gh/C7696/ragnarokcompra-e-venda@main/erasebg-transformed.ico" alt="Aquila Icon" style="height: 24px; width: 24px; display: block;">
                       </span>
                       <h3 data-i18n-key="settings">Configurações Aquila</h3>
                       <button id="closeSettingsModal" class="close-btn aquila-close-btn">×</button>
                    </div>
                    <div class="settings-body aquila-body">

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
                       <label for="closeOnHCaptchaInput" class="aquila-label checkbox-label" data-i18n-key="settingsLabelCloseOnHCaptcha">
                            <i class="fas fa-shield-alt"></i>
                       </label>
                       <span class="tooltip-icon" data-tooltip-key="tooltipCloseOnHCaptcha">
                           <i class="fas fa-info-circle"></i>
                       </span>
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

                    </div>
                    <div class="settings-footer aquila-footer">
                         <span class="aquila-motto">Ex Caelo Vis</span>
                    </div>
                 </div>
            </div>

        </div>
         <div id="aquilaTooltip" class="tooltip aquila-tooltip" style="display: none; position: absolute; z-index: 100;"></div>
    `;
    // --- FIM DO HTML ---

    // Adiciona tooltip e notifications (restante da função igual)
    const tooltipElement = container.querySelector("#aquilaTooltip");
    if(tooltipElement) ui.elements.set("tooltip", tooltipElement);

    document.body.appendChild(container);

    const notificationElement = createElement("div", {
        id: "notification",
        className: "notification",
        style: "display: none; opacity: 0;"
    });
    document.body.appendChild(notificationElement);
    elementCache.set("notification", notificationElement);
    ui.elements.set("notification", notificationElement);

    const minimizedBox = createElement("div", {
        id: "minimizedMarketBox",
        className: "minimized-box"
    });
    document.body.appendChild(minimizedBox);
    ui.elements.set("minimizedMarketBox", minimizedBox);

    const isMinimized = localStorage.getItem("isMinimized") === "true";
    if (typeof state !== 'undefined') { state.isMinimized = isMinimized; }
    container.style.display = isMinimized ? "none" : "block";
    minimizedBox.style.display = isMinimized ? "flex" : "none";

    if (typeof addDragAndDropListeners === "function") {
        addDragAndDropListeners(container);
    }
    if (typeof initializeSortable === "function") {
        initializeSortable();
    }
    try {
        const savedPos = JSON.parse(localStorage.getItem("marketContainerPosition"));
        if (savedPos && savedPos.left && savedPos.top) {
            container.style.left = savedPos.left;
            container.style.top = savedPos.top;
        }
    } catch (e) {
        localStorage.removeItem("marketContainerPosition");
    }
}; // --- Fim da função initializeUI (v18 - Sem Logs/Transações) ---





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






// Atualizado para remover IDs de transações
const initializeElements = () => {
    const elementsToCache = [
      "headerTitle",
      // "worldProfit", // REMOVIDO
      "buyModeToggle",
      "sellModeToggle",
      "saveConfig",
      "resetAll",
      // "transactionsBtn", // REMOVIDO
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
      // "transactionsModal", // REMOVIDO
      // "transactionsTableContainer", // REMOVIDO
      // "filterSection", // REMOVIDO
      // "paginationControls", // REMOVIDO
      // "transactionsChart", // REMOVIDO
      // "closeModal", // REMOVIDO (agora é handled por IDs específicos)
      "aiModal",
      "aiPrompt",
      "aiResponse",
      "submitAI",
      "closeAIModal", // ID do botão de fechar da modal IA
      "minimizeButton",
      "minimizedMarketBox",
      "settingsModal",
      "closeSettingsModal", // ID do botão de fechar da modal Configs
      "premiumPointsInput"
    ];

    // Itera sobre os IDs e tenta buscar e guardar cada elemento
    elementsToCache.forEach((id) => {
      const element = document.querySelector(`#${id}`);
      if (element) {
        ui.elements.set(id, element);
        elementCache.set(id, element);
      } else {
        // Opcional: Adicionar um log se um elemento não for encontrado pode ajudar na depuração futura
        // console.warn(`[initializeElements] Elemento com ID "${id}" não encontrado no DOM.`);
      }
    });

    // Cacheia outros elementos importantes (inputs de recursos)
    ui.elements.set("inputs", Array.from(document.querySelectorAll(".rate-input")));
    ui.elements.set("buyPerTimeInput", document.querySelector('.rate-input[data-resource="buy-per-time"]'));
    ui.elements.set("storageLimitInput", document.querySelector('.rate-input[data-resource="storage-limit"]'));
    ui.elements.set("maxSpendInput", document.querySelector('.rate-input[data-resource="max-spend"]'));
    ui.elements.set("sellLimitInput", document.querySelector('.rate-input[data-resource="sell-limit"]'));

    // Verifica se TODOS os elementos restantes definidos como essenciais foram encontrados
    // Adapte esta lista se houver outros elementos absolutamente necessários para o script funcionar
    const essentialElements = [
        "buyModeToggle", "sellModeToggle", "saveConfig", "resetAll", "aiAssistantBtn",
        "settingsBtn", "languageSelect", "villageSelect", "buyPause", "sellPause",
        "aiModal", "aiPrompt", "aiResponse", "submitAI", "closeAIModal",
        "settingsModal", "closeSettingsModal", "premiumPointsInput", "minimizeButton",
        "minimizedMarketBox", "notification"
        // Adicione outros IDs essenciais aqui, se houver
    ];

    const allEssentialsFound = essentialElements.every(id => ui.elements.has(id) && ui.elements.get(id) !== null);

    if (!allEssentialsFound) {
        console.error("Nem todos os elementos essenciais da UI foram encontrados. O script pode não funcionar corretamente.");
        // Você pode querer lançar um erro aqui ou tomar outra ação,
        // mas por enquanto, apenas logamos o erro.
    }

    return allEssentialsFound; // Retorna true se todos os essenciais foram encontrados, false caso contrário
};
// --- Fim da função initializeElements (corrigida) ---










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


















































































































































// Função executeTransaction ATUALIZADA (vHumanize 1.2 - Acessa Flags Direto + Logs)
const executeTransaction = async (type, resource, amount) => {
    const transactionId = Date.now();
    const isBuy = type === "buy";
    const flagVariable = isBuy ? 'isProcessingBuy' : 'isProcessingSell'; // Nome da variável global correta
    const logPrefix = `${SCRIPT_NAME}: [TX-${transactionId} - ${type.toUpperCase()}]`;
    console.log(`${logPrefix} Iniciando transação (${amount} de ${resource.name})`);

    const input = isBuy ? ui.buyInputs.get(resource.name) : ui.sellInputs.get(resource.name);
    const actionButton = isBuy ? document.querySelector('input.btn-premium-exchange-buy[type="submit"]') : document.querySelector('#premium_exchange_form input.btn[type="submit"]');
    const transactionSpinner = isBuy ? ui.getElement("buySpinner") : ui.getElement("sellSpinner");

    // >>>>> FUNÇÃO PARA RESETAR A FLAG DIRETA <<<<<
    const resetCorrectFlag = () => {
        // Modifica a variável global do script diretamente
        if (isBuy && isProcessingBuy) {
            console.log(`${logPrefix} -> Resetando isProcessingBuy para false.`);
            isProcessingBuy = false;
        } else if (!isBuy && isProcessingSell) {
            console.log(`${logPrefix} -> Resetando isProcessingSell para false.`);
            isProcessingSell = false;
        }
    };
    // >>>>> FIM FUNÇÃO RESET FLAG <<<<<

    // Função auxiliar para pausa aleatória
    const randomDelay = (min = 150, max = 450) => {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        // console.log(`${logPrefix} -> Atraso: ${delay}ms`); // Log opcional
        return new Promise(resolve => setTimeout(resolve, delay));
    };

    // Verificações iniciais cruciais
    if (!input || !actionButton) {
      console.error(`${logPrefix} [ERRO CRÍTICO] Input ou Botão de Ação não encontrado!`);
      updateGameElements();
      notifyError(i18n.t("domError"));
      resetCorrectFlag(); // <<< RESETAR A FLAG
      scheduleReload();
      return; // Aborta
    }

    // --- Processo da Transação ---
    try {
        if (transactionSpinner) {
            transactionSpinner.style.display = "inline-block";
        }
        notifyUser(i18n.t("transactionInProgress"), "warning");
        console.log(`${logPrefix} -> Spinner ativado, notificação enviada.`);

        // --- Lógica de Ação no Botão Principal ---
        const handleActionButtonClick = () => {
             return new Promise(async (resolve, reject) => {
                console.log(`${logPrefix} handleActionButtonClick: Iniciado.`);
                if (actionButton.disabled) {
                    console.log(`${logPrefix} -> Botão principal desabilitado. Observer...`);
                    const observerTimeout = setTimeout(() => {
                        observer.disconnect();
                        console.warn(`${logPrefix} -> Timeout observer botão principal.`);
                        reject(new Error("Timeout esperando botão principal habilitar"));
                    }, 10000); // Timeout de 10s

                    const observer = new MutationObserver(async (mutations) => {
                       let processed = false;
                       for (const mutation of mutations) {
                           if (!processed && mutation.attributeName === "disabled" && !actionButton.disabled) {
                                processed = true; clearTimeout(observerTimeout); observer.disconnect();
                                console.log(`${logPrefix} -> Observer: Botão principal habilitado.`);
                                await randomDelay(100, 250);
                                console.log(`${logPrefix} -> Clicando botão principal (após observer)...`);
                                actionButton.click(); resolve(); return;
                           }
                       }
                    });
                    observer.observe(actionButton, { attributes: true, attributeFilter: ["disabled"] });
                } else {
                    console.log(`${logPrefix} -> Botão principal JÁ habilitado.`);
                    await randomDelay(100, 250);
                    console.log(`${logPrefix} -> Clicando botão principal (direto)...`);
                    actionButton.click(); resolve();
                }
            });
        };

        // --- Lógica para Checar Janela de Confirmação ---
        const startConfirmationCheck = () => {
            return new Promise((resolve, reject) => { // <<< Retorna Promise
                console.log(`${logPrefix} startConfirmationCheck: Iniciado.`);
                let attempts = 0; const maxAttempts = 50; let confirmationProcessed = false;
                const interval = setInterval(async () => {
                    if (confirmationProcessed) { clearInterval(interval); return; } // Sai se já processou

                    // Seletores do popup (mantidos)
                    const popupSelectors = [ "div.ui-dialog[aria-describedby='premium_exchange_confirm_buy']","div.ui-dialog[aria-describedby='premium_exchange_confirm_sell']","div.ui-dialog:not([style*='display: none'])", "div[role='dialog']:not([style*='display: none'])"];
                    let popup = null; for (const selector of popupSelectors) { popup = document.querySelector(selector); if (popup && (!popup.style.display || popup.style.display !== "none")) { break; } }

                    if (popup) {
                        // Seletores do botão de confirmação (mantidos)
                        const confirmButtonSelectors = [ "div.confirmation-buttons button.btn.evt-confirm-btn.btn-confirm-yes", "button.btn-confirm-yes", ".ui-dialog-buttonpane button:enabled:not(:disabled):first-of-type"];
                        let confirmButton = null;
                        for (const selector of confirmButtonSelectors) {
                           confirmButton = popup.querySelector(selector);
                           // Verifica se o botão está habilitado e, se for genérico, se tem o texto certo
                           if (confirmButton && !confirmButton.disabled) {
                               if (selector.includes(".ui-dialog-buttonpane")) {
                                   const text = confirmButton.textContent.trim().toLowerCase();
                                   if (text==='sim'||text==='yes'||text==='ok'){ break; } // Achou
                                   else { confirmButton=null; } // Texto errado
                                } else { break; } // Seletor específico, achou
                           }
                           else { confirmButton = null; } // Desabilitado ou não encontrado
                         }

                        if (confirmButton) { // Botão SIM encontrado e HABILITADO
                            if (!confirmationProcessed) {
                                confirmationProcessed = true; clearInterval(interval); // Para tudo
                                console.log(`${logPrefix} -> Botão 'Sim' encontrado e habilitado.`);
                                await randomDelay(200, 500); // Pausa antes de clicar
                                console.log(`${logPrefix} -> Clicando botão 'Sim' AGORA.`);
                                confirmButton.click();

                                // Salva timestamp DEPOIS do clique
                                const transactionEndTime = Date.now();
                                try { localStorage.setItem('aquila_lastTransactionTime', transactionEndTime.toString()); console.log(`${logPrefix} -> Timestamp (${transactionEndTime}) salvo.`); }
                                catch (e) { console.error(`${logPrefix} - [ERRO] Salvar timestamp:`, e); }

                                resolve(true); // <<< Resolve a Promise (SUCESSO)
                            }
                        } else { /* Aguardando botão 'Sim' ficar pronto... */ }
                    } else { /* Aguardando popup aparecer... */ }

                    // Lógica de Timeout
                    attempts++;
                    if (attempts >= maxAttempts && !confirmationProcessed) {
                        confirmationProcessed = true; clearInterval(interval);
                        console.warn(`${logPrefix} -> TIMEOUT: Pop-up ou botão 'Sim' não encontrado/habilitado.`);
                        try { localStorage.removeItem('aquila_lastTransactionTime'); } catch (e) {} // Limpa timestamp no timeout
                        reject(new Error("Timeout confirmação")); // <<< Rejeita a Promise (FALHA)
                    }
                }, 100 + Math.random() * 150); // Intervalo levemente randomizado
            }); // Fim Promise startConfirmationCheck
        }; // Fim const startConfirmationCheck

        // --- Sequência Principal de Ações ---
        const finalAmount = sanitizeNumber(amount);
        if (isNaN(finalAmount) || finalAmount <= 0) {
          throw new Error(`Quantidade inválida (${amount}).`); // Joga erro para o catch principal
        }

        await randomDelay(150, 400); // Pausa antes de preencher input
        console.log(`${logPrefix} -> Preenchendo input com: ${finalAmount}`);
        input.value = finalAmount;
        // Dispara eventos para garantir que o jogo reconheça a mudança
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        input.dispatchEvent(new Event("keyup", { bubbles: true }));

        await handleActionButtonClick(); // Espera clicar no primeiro botão (Calcular/Vender)
        console.log(`${logPrefix} -> Primeiro clique OK. Checando confirmação...`);

        await startConfirmationCheck(); // Espera clicar no botão 'Sim' (ou dar timeout/erro)

         // Se chegou aqui, a confirmação foi clicada com sucesso (startConfirmationCheck resolveu com true)
         console.log(`${logPrefix} -> Transação confirmada com sucesso.`);
         if (transactionSpinner) transactionSpinner.style.display = "none";
         notifySuccess(i18n.t("transactionSuccess"));
         resetCorrectFlag(); // <<< RESET no sucesso, ANTES do reload
         scheduleReload();

    } catch (error) {
         // Captura erros de qualquer uma das Promises (handleActionButtonClick ou startConfirmationCheck) ou do throw inicial
         console.error(`${logPrefix} [ERRO DURANTE TRANSAÇÃO]`, error.message || error);
         if (transactionSpinner) transactionSpinner.style.display = "none";
         notifyError(i18n.t("transactionError") + ` (${error.message || 'Erro desconhecido'})`);
         resetCorrectFlag(); // <<< RESET no erro, ANTES do reload
         scheduleReload();
     }

}; // --- Fim da função executeTransaction (vHumanize 1.2) ---




















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






// === INÍCIO DA ATUALIZAÇÃO processBuyBasedOnResources (v6.8.1 - Correções Pós-Log) ===
const processBuyBasedOnResources = async () => {
    const logPrefix = "[RAG-LOG Compra v6.8.1]"; // Prefixo atualizado para v6.8.1
    logger.log(`${logPrefix} ===== INÍCIO CHECAGEM COMPRA =====`);
    const LARGE_NUMBER_FOR_INFINITY = 999999999;

    // --- COOLDOWN CHECK ---
    const COOLDOWN_DURATION = 6000;
    const lastTxTimeStr = localStorage.getItem('aquila_lastTransactionTime');
    const lastTxTime = lastTxTimeStr ? parseInt(lastTxTimeStr, 10) : null;
    const nowForCooldown = Date.now();
    const timeSinceLastTx = lastTxTime && !isNaN(lastTxTime) ? nowForCooldown - lastTxTime : Infinity;
    if (timeSinceLastTx < COOLDOWN_DURATION) {
        // logger.log(`${logPrefix} - Cooldown ativo (${Math.round((COOLDOWN_DURATION - timeSinceLastTx)/1000)}s restantes). Saindo.`); // Silenciado
        return;
    }

    // --- Leitura INICIAL do Limite Input ---
    let currentLimitInputValue = 0;
    const premiumInputForInitialRead = ui.getElement("premiumPointsInput");
    if (premiumInputForInitialRead) {
        currentLimitInputValue = sanitizeNumber(premiumInputForInitialRead.value) || 0;
        // logger.log(`${logPrefix} - Limite PP no input: ${currentLimitInputValue}`);
    } else {
        logger.warn(`${logPrefix} - [AVISO] Campo premiumPointsInput NÃO ENCONTRADO! Limit será 0.`);
    }

    // --- LÓGICA PÓS-RECARGA ---
    const savedBalanceBeforeBuyStr = localStorage.getItem('aquila_ppBalanceBeforeBuy');
    const savedLimitBeforeBuyStr = localStorage.getItem('aquila_ppLimitBeforeBuy');
    if (savedBalanceBeforeBuyStr !== null && savedLimitBeforeBuyStr !== null) {
        logger.log(`${logPrefix} - Detectado Pós-Recarga. Processando...`);
        const balanceBeforeBuy = parseInt(savedBalanceBeforeBuyStr, 10);
        const limitBeforeBuy = parseInt(savedLimitBeforeBuyStr, 10);
        const currentPPBalanceNow = getAvailablePremiumPoints();

        localStorage.removeItem('aquila_ppBalanceBeforeBuy');
        localStorage.removeItem('aquila_ppLimitBeforeBuy');

        if (!isNaN(balanceBeforeBuy) && !isNaN(limitBeforeBuy)) {
            const ppSpent = balanceBeforeBuy - currentPPBalanceNow;
             // logger.log(`${logPrefix} -> Pós-Recarga Info: Saldo Ant=${balanceBeforeBuy}, Atual=${currentPPBalanceNow}, Gasto=${ppSpent}, Limite Ant=${limitBeforeBuy}`);

            if (ppSpent >= 0) {
                const newPPLimit = Math.max(0, limitBeforeBuy - ppSpent);
                // logger.log(`${logPrefix} -> Novo Limite Calculado: ${newPPLimit}`);
                const premiumInput = ui.getElement("premiumPointsInput");
                if (premiumInput) {
                    premiumInput.value = newPPLimit;
                    currentLimitInputValue = newPPLimit;
                    // logger.log(`${logPrefix} -> Campo Limite PP atualizado e config salva (via pós-recarga).`);
                    performSaveOperation();
                }
            } else {
                 // logger.log(`${logPrefix} -> Pós-Recarga: Gasto inválido. Restaurando limite salvo.`);
                 const premiumInput = ui.getElement("premiumPointsInput");
                 if (premiumInput) {
                     premiumInput.value = limitBeforeBuy;
                     currentLimitInputValue = limitBeforeBuy;
                     performSaveOperation();
                     // logger.log(`${logPrefix} -> Campo Limite PP restaurado.`);
                 }
             }
        } else {
             logger.warn(`${logPrefix} - [AVISO] Pós-Recarga: Falha parse. Usando limite atual: ${currentLimitInputValue}.`);
        }
        // logger.log(`${logPrefix} - Fim Processamento Pós-Recarga.`);
    }
    // --- FIM LÓGICA PÓS-RECARGA ---

    // --- Checagens de Estado ---
    const initialDelay = Math.random() * 200 + 50;
    await new Promise(resolve => setTimeout(resolve, initialDelay));

    const resetProcessingFlagIfNeeded = () => { // Função auxiliar
        if (isProcessingBuy) {
            // logger.log(`${logPrefix} [Reset Flag] Resetando isProcessingBuy=false.`);
            isProcessingBuy = false;
        }
    };

    if (checkAndHandleHCaptcha()) { logger.log(`${logPrefix} - hCaptcha detectado! Saindo.`); resetProcessingFlagIfNeeded(); return; }
    const now = Date.now();
    if (!state.buyModeActive) { resetProcessingFlagIfNeeded(); return; }
    if (isProcessingBuy) { /* logger.log(`${logPrefix} - Compra JÁ em processamento. Saindo.`); */ return; } // Silenciado
    if (state.buyPausedUntil && state.buyPausedUntil > now) { return; }
       // Adiciona um pequeno delay antes de checar a flag da venda para reduzir chance de conflito rápido
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100)); // Atraso ~50-150ms

    if (isProcessingSell) {
        // Mesmo após o delay, se a venda AINDA estiver processando, aí sim espera.
        logger.log(`${logPrefix} - VENDA ainda em andamento após delay. Aguardando.`);
        resetProcessingFlagIfNeeded(); // <<< ADICIONADO: Reseta a flag de COMPRA se for esperar
        return;
    }

    logger.log(`${logPrefix} - Verificações Iniciais OK.`);
    isProcessingBuy = true; // Marca como processando

    // --- Busca de Dados Essenciais ---
    try {
        await Promise.all([ fetchIncomingResources(), fetchResources() ]);
    } catch (error) {
        logger.error(`${logPrefix} - [ERRO] Buscar dados externos:`, error);
        resetProcessingFlagIfNeeded(); return;
    }

    // --- Leitura Limites UI (exceto PP) ---
    const readLimitInput = (selector, defaultValue = LARGE_NUMBER_FOR_INFINITY) => {
        const inputElement = document.querySelector(selector); return inputElement ? (sanitizeNumber(inputElement.value) > 0 ? sanitizeNumber(inputElement.value) : defaultValue) : defaultValue;
    };
    const currentBuyLimitPerTime = readLimitInput('.rate-input[data-resource="buy-per-time"]');

    // --- CÁLCULO DE PP EFETIVO ---
    const availablePP = getAvailablePremiumPoints();
    const maxPPLimit = (currentLimitInputValue > 0) ? currentLimitInputValue : 0;
    const effectivePP = Math.min(availablePP, maxPPLimit);

    if (effectivePP <= 0) {
        // logger.log(`${logPrefix} - PP Efetivo ZERO. Saindo.`); // Silenciado
        resetProcessingFlagIfNeeded(); return;
    }

    // ---- Monta dados para Worker ----
    const workerResourcesData = Object.keys(resources).map(name => {
        const handler = resources[name]; if (!handler) return null;
        const desiredStockInput = document.querySelector(`.rate-input[data-resource="${name}-stock"]`);
        const userRateLimitInput = document.querySelector(`.rate-input[data-resource="${name}"]`); // <<< Input da taxa definida pelo usuário
        const desiredStock = desiredStockInput ? sanitizeNumber(desiredStockInput.value) : 0;
        const userRateLimit = userRateLimitInput ? sanitizeNumber(userRateLimitInput.value) : 0; // <<< Valor da taxa do usuário
        const marketSellRate = handler.getMarketValue(); // <<< Taxa de VENDA do mercado (recursos / PP)
        if (marketSellRate <= 0) { return null; }
        // Log preparação para worker
        logger.log(`${logPrefix} -> Prep. ${name} p/ worker: Desj=${desiredStock}, TaxaMinUser=${userRateLimit}, TaxaVendaMerc=${marketSellRate}, Limite/Tempo=${currentBuyLimitPerTime}`);
        return { name, desiredStock, marketRate: marketSellRate, userRateLimit, buyLimitPerTime: currentBuyLimitPerTime }; // Envia userRateLimit para o worker
    }).filter(data => data !== null);

    if (workerResourcesData.length === 0) { logger.log(`${logPrefix} - Nenhum recurso válido para worker. Saindo.`); resetProcessingFlagIfNeeded(); return; }

    const workerData = {
        action: "calculateBuyAmount",
        data: { resources: workerResourcesData, effectivePP: effectivePP, storageCapacity: state.storageCapacity, incomingResources: mobx.toJS(state.incomingResources), currentResources: mobx.toJS(currentResources) }
    };

    // Log dados atuais
    logger.log(`${logPrefix} -> Recursos Atuais (p/ worker): W=${currentResources?.wood}, S=${currentResources?.stone}, I=${currentResources?.iron}`);
    logger.log(`${logPrefix} -> Recursos Chegando (p/ worker): W=${state.incomingResources?.wood}, S=${state.incomingResources?.stone}, I=${state.incomingResources?.iron}`);
    logger.log(`${logPrefix} -> Capacidade Armazém (p/ worker): ${state?.storageCapacity}`);
    logger.log(`${logPrefix} - Enviando para Worker...`);
    worker.postMessage(workerData);

    // --- Callback e Lógica Pós-Worker ---
    worker.onmessage = async (e) => {
        const resetProcessingFlag = () => {
            if (isProcessingBuy) {
                logger.log(`${logPrefix} [Callback Reset] Resetando isProcessingBuy=false.`);
                isProcessingBuy = false;
            }
        };

        if (checkAndHandleHCaptcha()) { logger.log(`${logPrefix} [CB] hCaptcha! Abortando.`); resetProcessingFlag(); return; }
        if (isProcessingSell) { logger.log(`${logPrefix} [CB] VENDA iniciou. Abortando compra.`); resetProcessingFlag(); return; }
        if (e.data.error) { logger.error(`${logPrefix} [ERRO WORKER]`, e.data.error); resetProcessingFlag(); return; }

        if (e.data.action === "buyAmountCalculated" && Array.isArray(e.data.result?.rankedBuyOptions)) {
            const rankedBuyOptions = e.data.result.rankedBuyOptions;
            if (rankedBuyOptions.length === 0) { logger.log(`${logPrefix} [CB] Worker não encontrou opções. Saindo.`); resetProcessingFlag(); return; }

            logger.log(`${logPrefix} - Worker retornou ${rankedBuyOptions.length} opções (antes da validação/ordenação).`);

            // --- >>> NOVA ETAPA: Coleta de Candidatos <<< ---
            let buyCandidates = [];
            const GAME_BUY_FEE_PERCENTAGE = 0.05; // Taxa de compra do jogo (estimada)

            logger.log(`${logPrefix} - Iniciando coleta e validação de candidatos...`);
            for (const option of rankedBuyOptions) {
                const resourceName = option.name;
                const idealAmountFromWorker = option.idealAmount; // Quantidade ideal calculada pelo worker (baseada em déficit, PP, etc.)
                const userRateLimit = option.userRateLimit; // <<< O LIMITE DEFINIDO PELO USUÁRIO, RETORNADO PELO WORKER
                const handler = resources[resourceName];

                if (!handler) { logger.log(`${logPrefix}   [!] Handler ${resourceName} inválido. Pulando.`); continue; }

                const currentMarketBuyRate = handler.getGameRate(); // <<< TAXA DE COMPRA REAL DO JOGO (PP / 1000 recursos)

                // Log detalhado para depuração
                logger.log(`${logPrefix}   [Analisando ${resourceName}] Taxa de Compra do Jogo (PP/1000): ${currentMarketBuyRate}, Seu Limite (PP/1000): ${userRateLimit}`);

                if (currentMarketBuyRate <= 0) {
                    logger.log(`${logPrefix}   [!] Taxa Compra REAL ${resourceName} inválida ou zero (${currentMarketBuyRate}). Pulando.`);
                    continue;
                }

                // CONDIÇÃO DE COMPRA: Pula se a taxa do jogo for MENOR que o limite do usuário
                if (userRateLimit > 0 && currentMarketBuyRate < userRateLimit) {
                    logger.log(`${logPrefix}   [PULANDO ${resourceName}] Motivo: Taxa do Jogo (${currentMarketBuyRate}) é MENOR que o seu limite (${userRateLimit}).`);
                    continue;
                }

                // Se chegou aqui, a taxa do jogo é ACEITÁVEL (>= limite do usuário ou limite é 0)
                // Agora verifica espaço, estoque de mercado e custo

                // Calcula espaço disponível no armazém
                const currentStockNow = currentResources[resourceName] || 0;
                const incomingStockNow = state.incomingResources[resourceName] || 0;
                const warehouseCapacityNow = state.storageCapacity || 0;
                const availableSpace = Math.max(0, warehouseCapacityNow - currentStockNow - incomingStockNow);
                const effectiveAvailableSpace = Math.floor(availableSpace / (1 + GAME_BUY_FEE_PERCENTAGE)); // Estima espaço líquido após taxa

                // Limita a quantidade pelo espaço disponível
                let amountConsideringSpace = Math.max(0, Math.floor(Math.min(idealAmountFromWorker, effectiveAvailableSpace)));

                if (amountConsideringSpace <= 0) {
                    logger.log(`${logPrefix}   [!] Sem espaço (${effectiveAvailableSpace}) ou Ideal worker (${idealAmountFromWorker}) zerado para ${resourceName}. Pulando.`);
                    continue;
                }

                // Obtém estoque do mercado DISPONÍVEL PARA COMPRA
                const marketAvailableStock = handler.getMarketStockAvailable();

                // Calcula a quantidade final a ser comprada, limitada pelo estoque do mercado
                const finalAmountToBuy = Math.min(amountConsideringSpace, marketAvailableStock);

                if (finalAmountToBuy <= 0) {
                    logger.log(`${logPrefix}   [!] Quantidade final zerada para ${resourceName} (Espaço/Ideal: ${amountConsideringSpace}, Mercado: ${marketAvailableStock}). Pulando.`);
                    continue;
                }

                // Calcula custo estimado usando a taxa de COMPRA real e a quantidade final
                const estimatedCost = Math.ceil(finalAmountToBuy / currentMarketBuyRate); // Usa a taxa de COMPRA correta
                const currentPPBalanceNow = getAvailablePremiumPoints(); // Recheca PP disponível

                // Validação final de custo
                if (estimatedCost > effectivePP || estimatedCost > currentPPBalanceNow ) {
                     logger.log(`${logPrefix}   [!] Custo Estimado ${resourceName} (${estimatedCost}) > PP Disponível (${Math.min(effectivePP, currentPPBalanceNow)}). Pulando.`);
                     continue;
                }

                // Se passou por todas as validações, adiciona como candidato
                logger.log(`${logPrefix}   [OK] Candidato ${resourceName} VÁLIDO. Qtd: ${finalAmountToBuy}, Estoque Mercado: ${marketAvailableStock}, Custo: ${estimatedCost} PP.`);
                buyCandidates.push({
                    name: resourceName,
                    handler: handler,
                    finalAmount: finalAmountToBuy,
                    marketStock: marketAvailableStock, // Mantém o estoque original para ordenação
                    estimatedCost: estimatedCost,
                    marketBuyRate: currentMarketBuyRate // Guarda para não precisar ler de novo
                });
            } // --- Fim do loop de coleta ---

            // --- >>> NOVA ETAPA: Ordenação por Estoque do Mercado <<< ---
            if (buyCandidates.length > 0) {
                logger.log(`${logPrefix} - Ordenando ${buyCandidates.length} candidatos por estoque de mercado (DESC)...`);
                buyCandidates.sort((a, b) => b.marketStock - a.marketStock); // Maior estoque primeiro
                // Log da lista ordenada
                 logger.log(`${logPrefix} - Candidatos Ordenados:`, buyCandidates.map(c => `${c.name} (Estoque: ${c.marketStock}, Qtd: ${c.finalAmount})`).join(', '));

                // --- >>> NOVA ETAPA: Tentativa de Execução (Iterando pelos Ordenados) <<< ---
                let buyExecuted = false; // Flag local
                for (const candidate of buyCandidates) {
                    logger.log(`${logPrefix} - Tentando executar compra para o melhor candidato: ${candidate.name}`);

                    // Revalidações finais rápidas
                    if (isProcessingSell) { logger.log(`${logPrefix} -> VENDA iniciou. Abortando tentativa.`); break; }
                    const currentPPBalanceAgain = getAvailablePremiumPoints(); // Última checagem de PP
                     if (candidate.estimatedCost > currentPPBalanceAgain) {
                         logger.log(`${logPrefix} -> Saldo PP insuficiente (${currentPPBalanceAgain} < ${candidate.estimatedCost}) na última checagem para ${candidate.name}. Pulando.`);
                         continue; // Tenta o próximo candidato, se houver
                     }
                     // Opcional: Revalidar estoque do mercado (pode ter mudado)
                     /*
                     const currentMarketStockAgain = candidate.handler.getMarketStockAvailable();
                     if(candidate.finalAmount > currentMarketStockAgain) {
                         logger.log(`${logPrefix}   [!] Estoque Mercado mudou! Qtd (${candidate.finalAmount}) > Atual (${currentMarketStockAgain}) para ${resourceName}. Pulando.`);
                         continue;
                     }
                     */

                    // --- Preparação Final e Execução ---
                    try {
                         localStorage.setItem('aquila_ppLimitBeforeBuy', String(currentLimitInputValue));
                         localStorage.setItem('aquila_ppBalanceBeforeBuy', String(currentPPBalanceAgain)); // Usa o saldo mais recente
                         logger.log(`${logPrefix} -> SALVO localStorage pré-compra: Limite=${currentLimitInputValue}, Saldo=${currentPPBalanceAgain}`);

                         buyExecuted = true; // Marca que a execução VAI ser chamada
                         logger.log(`${logPrefix} - ===> CHAMANDO executeTransaction (Buy, ${candidate.name}, ${candidate.finalAmount}) <===`);
                         await executeTransaction("buy", candidate.handler, candidate.finalAmount);
                         logger.log(`${logPrefix} - executeTransaction chamado para ${candidate.name}. Saindo.`);
                         // Não resetamos a flag aqui, pois executeTransaction fará isso após o reload agendado
                         return; // SAI da função onmessage após INICIAR a compra do melhor candidato

                    } catch (txError) {
                        logger.error(`${logPrefix} - [ERRO] executeTransaction falhou para ${candidate.name}:`, txError);
                         buyExecuted = false; // A execução falhou antes de completar
                        // Limpa localStorage porque a transação falhou
                        try { localStorage.removeItem('aquila_ppLimitBeforeBuy'); localStorage.removeItem('aquila_ppBalanceBeforeBuy'); logger.log(`${logPrefix} -> localStorage pré-compra removido (erro tx).`); } catch (e) {}
                        logger.log(`${logPrefix} -> Erro ao executar. Tentando próximo candidato ordenado (se houver)...`);
                         // O loop continuará para o próximo candidato
                     }

                } // --- Fim do loop de execução ordenada ---

                // Se o loop terminou e nenhuma compra foi executada
                 if (!buyExecuted) {
                     logger.log(`${logPrefix} - Nenhuma compra EXECUTADA após avaliar todos os candidatos ordenados (possivelmente erro ou PP/espaço/estoque insuficiente na última hora).`);
                     resetProcessingFlag(); // <<< Resetar se NENHUMA compra foi executada
                 }

            } else {
                logger.log(`${logPrefix} - Nenhum candidato VÁLIDO encontrado após validação inicial.`);
                resetProcessingFlag(); // <<< Resetar se não houver candidatos válidos
            }
            // --- Fim das novas etapas ---

        } else {
            logger.warn(`${logPrefix} - Ação inesperada worker: ${e.data.action}.`);
            resetProcessingFlag();
        }
    }; // --- FIM worker.onmessage ---

    // Handler para erros gerais do worker
    worker.onerror = (error) => {
        logger.error(`${logPrefix} - [ERRO GERAL WORKER]`, error.message || error);
        resetProcessingFlag(); // <<< Resetar em caso de erro do worker
    };

}; // --- Fim da função processBuyBasedOnResources (v6.8.1) ---
// === FIM DA ATUALIZAÇÃO ===














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



// Função extractResourcesFromElement ATUALIZADA (v6 - Extrai de Texto Direto e Ícones)
function extractResourcesFromElement(element) {
    const logPrefix = "[RAG-DEBUG-ExtractRes-v6]"; // V6 no log
    // console.log(`${logPrefix} Iniciando extração para elemento <${element?.tagName}>:`, element?.innerHTML?.substring(0, 150));

    if (!element) {
        console.warn(`${logPrefix} Elemento de entrada NULO.`);
        return { wood: 0, stone: 0, iron: 0 };
    }

    const resourcesExtracted = { wood: 0, stone: 0, iron: 0 };

    // 1. TENTATIVA DE EXTRAÇÃO DIRETA DO TEXTO (para TH de sumário como 'Прибывающие: 65 12')
    //    Pega todos os números DENTRO do texto do elemento principal e tenta associá-los aos ícones *dentro* dele.
    let potentialNumbersInText = (element.textContent.match(/[\d.,]+/g) || []).map(n => parseIntSafeTransport(n)).filter(n => n > 0);
    const iconsInsideElement = {
        wood: !!element.querySelector('.icon.header.wood, img[src*="wood"], img[title*="Madeira"], img[title*="Дерево"]'),
        stone: !!element.querySelector('.icon.header.stone, img[src*="stone"], img[src*="clay"], img[title*="Argila"], img[title*="Глина"]'),
        iron: !!element.querySelector('.icon.header.iron, img[src*="iron"], img[title*="Ferro"], img[title*="Железо"]')
    };
    let assignedFromTextDirectly = false;
    let numberIndex = 0;
    const orderOfIcons = ['wood', 'stone', 'iron'].filter(res => iconsInsideElement[res]); // Ordem padrão W-S-I, filtrada pelos ícones presentes

    // Se houver números no texto E ícones dentro, tenta associar na ordem
    if (potentialNumbersInText.length > 0 && orderOfIcons.length > 0 && potentialNumbersInText.length >= orderOfIcons.length) {
        console.log(`${logPrefix}  -> Tentando Extração Direta de Texto. Números: ${potentialNumbersInText.join(', ')}, Ícones na Ordem: ${orderOfIcons.join(', ')}`);
        for (const resourceName of orderOfIcons) {
            if (numberIndex < potentialNumbersInText.length) {
                resourcesExtracted[resourceName] = potentialNumbersInText[numberIndex];
                console.log(`${logPrefix}    -> Atribuição Direta [${resourceName}] = ${potentialNumbersInText[numberIndex]}`);
                assignedFromTextDirectly = true; // Marcar se conseguiu atribuir pelo menos um
                numberIndex++;
            }
        }
        if (assignedFromTextDirectly) {
            // console.log(`${logPrefix} -> Extração por Texto Direto CONCLUÍDA.`);
            return resourcesExtracted; // RETORNA AQUI se extraiu do texto direto (caso do TH Sumário)
        } else {
             console.log(`${logPrefix}  -> Extração Direta de Texto Falhou (inconsistência números/ícones?). Prosseguindo.`);
        }
    } else {
         //console.log(`${logPrefix}  -> Extração Direta de Texto pulada (sem números OU sem ícones internos).`);
    }


    // 2. TENTATIVA DE EXTRAÇÃO POR ÍCONE + VIZINHO (Lógica Anterior Melhorada)
    //    Isso é para linhas de tabela normais (<td>... <icon> NUMERO ...</td>)
    const iconSelectors = {
        wood: ".icon.header.wood, img[src*='wood'], img[title*='Madeira'], img[title*='Дерево'], span.res-wood",
        stone: ".icon.header.stone, img[src*='stone'], img[src*='clay'], img[title*='Argila'], img[title*='Глина'], span.res-stone, span.res-clay",
        iron: ".icon.header.iron, img[src*='iron'], img[title*='Ferro'], img[title*='Железо'], span.res-iron"
    };

    for (const resourceName in iconSelectors) {
        // Busca todos os ícones daquele tipo DENTRO do elemento atual (ex: linha <tr>)
        const icons = element.querySelectorAll(iconSelectors[resourceName]);

        icons.forEach(icon => {
             if (resourcesExtracted[resourceName] > 0) return; // Já achou pra esse recurso nesta linha, não sobrescreve
             //console.log(`${logPrefix} -> Verificando Ícone Próximo para [${resourceName}]`);
             const containingTd = icon.closest('td');

             if (containingTd) {
                 //console.log(`${logPrefix}   -> Ícone dentro da TD:`, containingTd.innerHTML.substring(0,100));
                 let numberFound = 0; let nextNode = icon.nextSibling; let sanityCheck = 0;

                while (nextNode && numberFound === 0 && sanityCheck < 10) { // Limite de busca para segurança
                    sanityCheck++;
                     if (nextNode.nodeType === Node.TEXT_NODE) {
                         const textContent = nextNode.nodeValue.trim();
                         //console.log(`${logPrefix}     -> Nó Texto Vizinho: '${textContent}'`);
                         if (textContent && /^[0-9.,]+$/.test(textContent.replace(/\s/g, ''))) {
                              numberFound = parseIntSafeTransport(textContent);
                             if (numberFound > 0) { console.log(`${logPrefix}   -> SUCESSO (Ícone Vizinho)! [${resourceName}] = ${numberFound}`); break; }
                         }
                    } else if (nextNode.nodeType === Node.ELEMENT_NODE && nextNode.matches('span:not(.grey):not(.icon), b, strong')) { // Ignora spans de separador (.)
                        const elementTextContent = nextNode.textContent.trim();
                        //console.log(`${logPrefix}     -> Elemento Vizinho <${nextNode.tagName}>: '${elementTextContent}'`);
                        if (elementTextContent && /^[0-9.,]+$/.test(elementTextContent.replace(/\s/g, ''))) {
                            numberFound = parseIntSafeTransport(elementTextContent);
                             if (numberFound > 0) { console.log(`${logPrefix}   -> SUCESSO (Ícone Vizinho)! [${resourceName}] = ${numberFound} (dentro <${nextNode.tagName}>)`); break; }
                        }
                    }
                     nextNode = nextNode.nextSibling;
                }

                // Fallback MUITO restrito: Pega PRIMEIRO número na TD se busca vizinha falhou
                if (numberFound === 0) {
                     // console.warn(`${logPrefix}   -> Falha busca vizinha [${resourceName}]. Usando fallback RESTRICTO na TD.`);
                     const tdTextOnly = containingTd.textContent; // Pega TODO texto da TD
                     const potentialNumberMatch = tdTextOnly.match(/([\d.,]+)/); // PRIMEIRO número
                    if (potentialNumberMatch && potentialNumberMatch[1]) {
                        const potentialNumber = parseIntSafeTransport(potentialNumberMatch[1]);
                        if(potentialNumber > 0) {
                             //console.warn(`${logPrefix}     -> Fallback Restrito TD usou ${potentialNumber} para [${resourceName}].`);
                             numberFound = potentialNumber; // Usa com cautela
                        }
                    }
                 }

                 if(numberFound > 0){
                    resourcesExtracted[resourceName] = numberFound; // Atribui SÓ se achou > 0
                 }

            } else { console.warn(`${logPrefix}   -> Ícone [${resourceName}] SEM CÉLULA TD PAI?`); }
        }); // Fim forEach icons
    } // Fim for..in

    // console.log(`${logPrefix} Extração FINALIZADA v6. Valores:`, resourcesExtracted);
    return resourcesExtracted;
}



/// Função parseTransportData ATUALIZADA (v6.2 - Keywords RU & TH Summary Extract)
function parseTransportData(html) {
    const logPrefix = "[RAG-DEBUG-ParseTransport-v6.2]"; // V6.2 no log
    console.log(`${logPrefix} Iniciando parseamento...`);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const incoming = { wood: 0, stone: 0, iron: 0 };
    let foundIncomingData = false;
    let incomingContainer = null; // Tabela ou div contendo dados
    let extractedFromSummaryTH = false; // Flag para indicar se pegamos do TH de resumo

    // --- Palavras-chave para Identificação (Incluindo Russo) ---
    const keywordsRU = ['прибывающие', 'подъезжающие']; // Incoming, Approaching
    const headerKeywordsNL = ['aankomst', 'aankomende', 'binnenkomende transporten'];
    const headerKeywordsEN = ['arrival', 'incoming transports'];
    const headerKeywordsPTBR = ['chegada', 'chegando', 'em chegada', 'transportes de chegada', 'própria', 'entrada', 'entradas', 'recursos a caminho'];
    // JUNTA TODAS as keywords de chegada/entrada/approaching
    const allArrivalKeywords = [...keywordsRU, ...headerKeywordsNL, ...headerKeywordsEN, ...headerKeywordsPTBR];

    const keywordsResumoRU = ['всего', 'сумма', 'итог']; // total, sum, result/total
    const keywordsResumoPTBR = ['total', 'soma', 'totais'];
    const keywordsResumoENNL = ['sum', 'total', 'summary', 'totaal'];
    const allSummaryKeywords = [...keywordsResumoRU, ...keywordsResumoPTBR, ...keywordsResumoENNL];

    // --- Estratégia 0: Indicador Explícito de Ausência (Adiciona RU) ---
    const noTransportIndicatorsRU = ['нет подъезжающих', 'нет входящих транспортов', 'никаких транспортов'];
    const noTransportIndicatorsPTBR = ["nenhum transporte chegando", "sem transportes de chegada", "não há transportes chegando", "sem entradas", "nenhuma entrada"];
    const noTransportIndicatorsGeneric = ["no incoming transports", "keine ankommenden transporte", "geen binnenkomende transporten"];
    const allNoTransportIndicators = [...noTransportIndicatorsRU, ...noTransportIndicatorsPTBR, ...noTransportIndicatorsGeneric];
    const bodyTextLower = doc.body.textContent.toLowerCase();
    if (allNoTransportIndicators.some(indicator => bodyTextLower.includes(indicator))) {
        console.log(`${logPrefix} Página indica explicitamente: NENHUM transporte de chegada.`);
        return { madeira: 0, argila: 0, ferro: 0 };
    }
    // console.log(`${logPrefix} HTML Completo:\n`, doc.documentElement.outerHTML);

    // --- Estratégia 1: Buscar TH de SUMÁRIO com keyword de chegada (Ex: <TH>Прибывающие: 65 12</TH>) ---
    console.log(`${logPrefix} Estratégia 1: Tentando localizar TH de Sumário de Chegada (Ex: Прибывающие:)...`);
    // Procura TH dentro de tabelas .vis ou no #market_status_bar
    const potentialSummaryTHs = doc.querySelectorAll('#market_status_bar th, table.vis th');
    summaryTHLoop:
    for (const th of potentialSummaryTHs) {
        const thText = th.textContent.toLowerCase();
        // Verifica se o TH contém uma keyword de chegada E pelo menos um ícone de recurso (para indicar que tem valores)
        if (allArrivalKeywords.some(keyword => thText.includes(keyword)) && th.querySelector('.icon.header.wood, .icon.header.stone, .icon.header.iron, img[src*="wood"], img[src*="stone"], img[src*="iron"]')) {
            console.log(`${logPrefix}  -> Encontrado TH de Sumário de Chegada candidato: "${th.textContent.trim()}"`);
            // Tenta extrair recursos DIRETAMENTE do TH (extractResourcesFromElement v6 precisa ser capaz disso)
            const resourcesExtracted = extractResourcesFromElement(th); // <<< Chama extract v6
            if (resourcesExtracted.wood > 0 || resourcesExtracted.stone > 0 || resourcesExtracted.iron > 0) {
                console.log(`${logPrefix}    -> SUCESSO! Recursos extraídos DIRETAMENTE do TH de Sumário. W=${resourcesExtracted.wood}, S=${resourcesExtracted.stone}, I=${resourcesExtracted.iron}`);
                incoming.wood = resourcesExtracted.wood; incoming.stone = resourcesExtracted.stone; incoming.iron = resourcesExtracted.iron;
                foundIncomingData = true;
                extractedFromSummaryTH = true; // Marca que pegamos daqui
                break summaryTHLoop; // ACHOU E EXTRAIU! Não precisa de mais nada.
            } else {
                 console.log(`${logPrefix}    -> TH de Sumário encontrado, mas extração retornou 0 recursos. Continuando busca...`);
            }
        }
    }
    if (foundIncomingData) console.log(`${logPrefix} -> Estratégia 1 (Sumário TH) BEM-SUCEDIDA.`);

    // --- Estratégias 2, 3, 4 (Hx, ID, TH-Lista): Só rodam se Estratégia 1 FALHOU em EXTRAIR dados ---
    if (!foundIncomingData) {
        console.log(`${logPrefix} -> Estratégia 1 (Sumário TH) Falhou ou Zerou. Tentando Estratégias 2/3/4 para achar a LISTA de transportes...`);
        // === Estratégia 2: Cabeçalho Hx/Strong/etc. ANTES da Tabela ===
        console.log(`${logPrefix} Estratégia 2: Tentando por Cabeçalho Hx/Strong ANTES da tabela...`);
        const headerSelectors = ['h2', 'h3', 'h4', 'div.vis_item > strong', 'div.boxtitle > span'];
        headerLoop:
        for (const selector of headerSelectors) { /* ...código da estratégia 2 da v6.1... */
            const headers = doc.querySelectorAll(selector);
            for (const header of headers) {
                const headerText = header.textContent.toLowerCase();
                // Usa a lista completa de keywords de chegada (inclui russo)
                if (allArrivalKeywords.some(keyword => headerText.includes(keyword))) {
                     console.log(`${logPrefix}   -> Encontrou cabeçalho <${header.tagName}> candidato (${selector}): "${header.textContent.trim()}"`);
                    let nextElement = header.nextElementSibling;
                    let parentElement = header.parentElement;
                    let searchProximity = 0;
                    while (searchProximity < 4 && !incomingContainer) {
                         if (nextElement && nextElement.matches('table.vis, table.borderlist')) {
                             incomingContainer = nextElement;
                             console.log(`${logPrefix}     -> Tabela IRMÃ encontrada (${nextElement.className})! MÉTODO: Hx + Tabela Irmã.`);
                             break headerLoop;
                         }
                        if (parentElement && parentElement.tagName !== 'BODY') {
                            const tableInParent = parentElement.querySelector('table.vis, table.borderlist');
                             if (tableInParent && !tableInParent.contains(header)) {
                                 let elementCursor = header; let foundTableAfter = false;
                                 while(elementCursor = elementCursor.nextSibling) {
                                    if(elementCursor === tableInParent || (elementCursor.contains && elementCursor.contains(tableInParent))) { foundTableAfter = true; break;}
                                 }
                                 if(foundTableAfter) {
                                     incomingContainer = tableInParent;
                                     console.log(`${logPrefix}     -> Tabela no PAI (${parentElement.tagName}) DEPOIS do header! MÉTODO: Hx + Tabela Pai.`);
                                     break headerLoop;
                                 }
                            }
                             parentElement = parentElement.parentElement;
                         }
                         if(nextElement) nextElement = nextElement.nextElementSibling; else break;
                         searchProximity++;
                    }
                }
                if (incomingContainer) break headerLoop;
            }
        } // Fim Hx Loop
        if (!incomingContainer) console.log(`${logPrefix} -> Estratégia 2 (Cabeçalho Hx) FALHOU.`);

        // === Estratégia 3: IDs #market_transports_in / #market_status_in ===
         if (!incomingContainer) {
             console.log(`${logPrefix} Estratégia 3: Tentando por IDs...`);
            const specificIdSelectors = ["#market_transports_in", "#market_status_in"];
             for (const selector of specificIdSelectors) { /* ...código da estratégia 3 da v6.1... */
                const containerDiv = doc.querySelector(selector);
                 if (containerDiv) {
                    const tableInside = containerDiv.querySelector("table.vis, table.borderlist");
                     if (tableInside) {
                         incomingContainer = tableInside;
                        console.log(`${logPrefix}     -> Encontrou Tabela DENTRO de ${selector}! MÉTODO: ID Específico.`);
                        break;
                    }
                }
             }
              if (!incomingContainer) console.log(`${logPrefix} -> Estratégia 3 (ID) FALHOU.`);
         }

        // === Estratégia 4: TH da LISTA com Keyword de Chegada + Ícone ===
        if (!incomingContainer) {
             console.log(`${logPrefix} Estratégia 4: Tentando por TH da Lista...`);
             const allTables = doc.querySelectorAll('table.vis, table.borderlist');
             tableLoop:
             for (const table of allTables) { /* ...código da estratégia 4 da v6.1... */
                 const thElements = table.querySelectorAll('th');
                 let tableHasArrivalKeywordInTH = false;
                 for (const th of thElements) {
                    if(allArrivalKeywords.some(keyword => th.textContent.toLowerCase().includes(keyword))){
                        tableHasArrivalKeywordInTH = true; break;
                    }
                 }
                 if (tableHasArrivalKeywordInTH) {
                    console.log(`${logPrefix}  -> Tabela candidata encontrada (TH contém keyword chegada). Verificando ícones...`);
                    const hasResourceIcon = table.querySelector(".icon.header.wood, .icon.header.stone, .icon.header.iron, img[src*='wood'], img[src*='stone'], img[src*='iron']");
                    if (hasResourceIcon) {
                        incomingContainer = table;
                        console.log(`${logPrefix}     -> Tabela CONFIRMADA por TH + Ícones! MÉTODO: TH Lista.`);
                        break tableLoop;
                    }
                 }
             }
             if (!incomingContainer) console.log(`${logPrefix} -> Estratégia 4 (TH Lista) FALHOU.`);
        }

    } // Fim do if(!foundIncomingData) após Estratégia 1

    // =======================================================
    // --- PROCESSAMENTO FINAL (Tabela da Lista OU Sumário TH já processado) ---
    // =======================================================
    if (incomingContainer && !extractedFromSummaryTH) { // Só processa a tabela se NÃO pegamos dados do Sumário TH
        console.log(`${logPrefix} PROCESSANDO a tabela da LISTA encontrada...`);
        // Processa linhas individuais DENTRO da tabela encontrada (que NÃO é a de sumário TH)
         // const dataRows = incomingContainer.querySelectorAll("tr:has(td):not(:has(th))"); // << Linha original com :has()
         const allRowsInContainer = incomingContainer.querySelectorAll("tr");
         const dataRows = [];
         allRowsInContainer.forEach(row => {
             if (row.querySelector("td") && !row.querySelector("th")) {
                 dataRows.push(row);
             }
         });
         let processedRowCount = 0;
         console.log(`${logPrefix}      -> ${dataRows.length} linhas de dados candidatas na tabela da lista (após filtro manual).`); // Log atualizado
         dataRows.forEach((row, index) => {
             const rowTextLower = row.textContent.toLowerCase();
             const isPlaceholderRow = ["próxima página", "anterior", "nenhum", "aldeia", "предыдущая страница", "следующая"].every(p => rowTextLower.includes(p));
             if (isPlaceholderRow) return;

             const resourcesExtracted = extractResourcesFromElement(row); // <<< Usa a função com logs detalhados

             if (resourcesExtracted.wood > 0 || resourcesExtracted.stone > 0 || resourcesExtracted.iron > 0) {
                 console.log(`${logPrefix}          -> Extração > 0 (Linha ${index+1} da Lista): W=${resourcesExtracted.wood}, S=${resourcesExtracted.stone}, I=${resourcesExtracted.iron}.`);
                 incoming.wood += resourcesExtracted.wood; incoming.stone += resourcesExtracted.stone; incoming.iron += resourcesExtracted.iron;
                 foundIncomingData = true; // Marcar que achou dados
                 processedRowCount++;
             }
         });
        if (foundIncomingData) console.log(`${logPrefix}   -> FIM Lista: TOTAL W=${incoming.wood}, S=${incoming.stone}, I=${incoming.iron} de ${processedRowCount} linha(s).`);
        else console.log(`${logPrefix}   -> FIM Lista: NENHUM recurso > 0 nas linhas individuais da tabela da lista.`);

    } else if (!incomingContainer && !extractedFromSummaryTH) { // Se NADA foi encontrado (nem Sumário TH, nem Tabela Lista)
        console.warn(`${logPrefix} Nenhuma tabela/container de transporte de chegada pôde ser identificada por NENHUMA estratégia.`);
        // (O código do diagnóstico de falha da v6.1 continua implícito aqui caso essa linha seja logada)
    }

    // Conclusão final
    if (!foundIncomingData) {
        console.log(`${logPrefix} Nenhuma informação ÚTIL de transporte encontrada.`);
    }
    console.log(`${logPrefix} Parseamento v6.2 concluído. Retornando (Madeira/Argila/Ferro):`, { madeira: incoming.wood, argila: incoming.stone, ferro: incoming.iron });
    return { madeira: incoming.wood, argila: incoming.stone, ferro: incoming.iron }; // Nomes em Português
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












// workerScript v8.10 – vende pelo menor marketRate e compra pelo maior marketRate
// -----------------------------------------------------------------------------
// Alterações v8.10:
// 1. Mantida lógica de venda: ordenação ASC por marketRate (menor primeiro).
// 2. CONFIRMADA lógica de compra: ordenação DESC por marketRate (maior primeiro).
// 3. Comentários atualizados.
// -----------------------------------------------------------------------------

const workerScript = `
self.onmessage = function(e) {
    const { action, data } = e.data;
    switch(action) {
        case 'calculateSellAmount':
            const sellResult = calculateSellAmount(data);
            self.postMessage({ action: 'sellAmountCalculated', result: sellResult });
            break;
        case 'calculateBuyAmount':
            const buyResult = calculateBuyAmount(data);
            self.postMessage({ action: 'buyAmountCalculated', result: buyResult });
            break;
        default:
            self.postMessage({ error: 'Ação desconhecida' });
    }
};

// =============================================================
// === calculateSellAmount (v8.10) ===
// =============================================================
function calculateSellAmount(data) {
    const { resources, merchantsAvailable, state, config } = data;
    console.log('[Worker v8.10] Iniciando cálculo. Mercadores:', merchantsAvailable, 'Config:', config); // Log inicial

    // --- Constantes para a Redução Percentual ---
    const MIN_REDUCTION_PERCENT = 0.10; // 10%
    const MAX_REDUCTION_PERCENT = 0.20; // 20%
    const MIN_AMOUNT_FOR_SCALING = 10000; // Quantidade a partir da qual a % começa a aumentar
    const MAX_AMOUNT_FOR_SCALING = 100000; // Quantidade na qual a % atinge o máximo
    // --------------------------------------------

    const resourceData = resources.map(r => {
        const marketRate  = r.marketRate;
        const userMinRate = r.minRate ?? Infinity;  // representa a *máxima* taxa que o usuário aceita
        const userMaxRate = r.maxRate ?? Infinity;  // teto opcional
        const total       = r.total;
        const reserve     = r.reserve;
        const available   = Math.max(0, total - reserve);

        const dynamicFee            = 0; // Simplificado
        const userSellLimitPerTx    = (!r.sellLimit || r.sellLimit === Infinity || r.sellLimit <= 0) ? 9999999 : r.sellLimit;
        const maxFromMarket         = Math.floor(r.marketCapacityRaw / (1 + dynamicFee));
        const maxFromStock          = Math.floor(available / (1 + dynamicFee));
        const maxFromMerchants      = config.enforceMerchantLimit ? Math.floor((merchantsAvailable * 1000) / (1 + dynamicFee)) : Infinity;
        const maxPossible           = Math.min(maxFromStock, maxFromMarket, maxFromMerchants);
        const potentialAmount       = Math.min(maxPossible, userSellLimitPerTx);

        // quantidade que REALMENTE poderia ser vendida (múltiplo da exchangeRate)
        const effectiveAmount = r.exchangeRate > 0 ? Math.floor(potentialAmount / r.exchangeRate) * r.exchangeRate : potentialAmount;

        return {
            resource: r,
            marketRate,
            userMinRate,
            userMaxRate,
            available,
            potentialAmount,
            effectiveAmount,
            exchangeRate: r.exchangeRate,
        };
    }).filter(r => {
        const meetsMin = r.marketRate <= r.userMinRate;      // taxa <= limite máximo
        const meetsMax = r.marketRate <= r.userMaxRate;      // teto opcional
        const hasEffectiveAmount   = r.effectiveAmount >= config.unitSize;
        const hasValidExchangeRate = r.exchangeRate && r.exchangeRate > 0;

        if (!meetsMin)              console.log('[Worker v8.10 Filtro] ' + r.resource.name + ' REJEITADO: Taxa de mercado (' + r.marketRate + ') > Limite Usuário (' + r.userMinRate + ')');
        else if (!meetsMax)         console.log('[Worker v8.10 Filtro] ' + r.resource.name + ' REJEITADO: Taxa de mercado (' + r.marketRate + ') > Máximo Usuário (' + r.userMaxRate + ')');
        if (!hasEffectiveAmount)    console.log('[Worker v8.10 Filtro] ' + r.resource.name + ' REJEITADO: Quantidade efetiva (' + r.effectiveAmount + ') < unitSize (' + config.unitSize + ')');
        if (!hasValidExchangeRate)  console.log('[Worker v8.10 Filtro] ' + r.resource.name + ' REJEITADO: Taxa de câmbio inválida (' + r.exchangeRate + ')');

        return meetsMin && meetsMax && hasEffectiveAmount && hasValidExchangeRate;
    }).sort((a, b) => {
        // *** VENDA: menor rate primeiro ***
        if (a.marketRate !== b.marketRate) return a.marketRate - b.marketRate; // menor taxa primeiro
        return b.effectiveAmount - a.effectiveAmount; // se empate, maior quantidade efetiva
    });

    if (resourceData.length === 0) {
        console.log('[Worker v8.10] Nenhum recurso elegível após filtros.');
        return { amountToSell: 0, profit: 0, resourceName: null };
    }

    const top = resourceData[0];
    let amountToSellInitial = top.effectiveAmount; // já validado

    // ================================
    // Redução Percentual Dinâmica
    // ================================
    const shouldApplyReduction = amountToSellInitial >= config.unitSize * 2;
    let reductionPercentage = 0;
    if (shouldApplyReduction) {
        reductionPercentage = MIN_REDUCTION_PERCENT;
        if (amountToSellInitial > MIN_AMOUNT_FOR_SCALING) {
            if (amountToSellInitial >= MAX_AMOUNT_FOR_SCALING) reductionPercentage = MAX_REDUCTION_PERCENT;
            else {
                const amountRange  = MAX_AMOUNT_FOR_SCALING - MIN_AMOUNT_FOR_SCALING;
                const percentRange = MAX_REDUCTION_PERCENT - MIN_REDUCTION_PERCENT;
                const progress     = (amountToSellInitial - MIN_AMOUNT_FOR_SCALING) / amountRange;
                reductionPercentage = MIN_REDUCTION_PERCENT + progress * percentRange;
            }
        }
    }

    let finalAmountToSell = shouldApplyReduction ? Math.floor(amountToSellInitial * (1 - reductionPercentage)) : amountToSellInitial;

    // Garante múltiplo novamente (pode ter quebrado com redução)
    finalAmountToSell = top.exchangeRate > 0 ? Math.floor(finalAmountToSell / top.exchangeRate) * top.exchangeRate
                                             : Math.floor(finalAmountToSell / config.unitSize) * config.unitSize;

    if (finalAmountToSell < config.unitSize) {
        console.log('[Worker v8.10] Após redução, quantidade < unitSize. Mantendo quantidade efetiva original.');
        finalAmountToSell = amountToSellInitial; // volta para valor seguro
    }

    const profit = calculateProfit(top.resource, finalAmountToSell);
    console.log('[Worker v8.10] Quantidade final a vender:', finalAmountToSell, 'Lucro estimado:', profit, 'Recurso:', top.resource.name);
    return { amountToSell: finalAmountToSell, profit, resourceName: top.resource.name };
}
// === FIM calculateSellAmount ===

// =============================================================
// === calculateBuyAmount (v8.10) ===
// =============================================================
// =============================================================
// === calculateBuyAmount (v8.10 - CORRIGIDO PARA RETORNAR userRateLimit) ===
// =============================================================
function calculateBuyAmount(data) {
    const { resources, effectivePP, storageCapacity, incomingResources, currentResources } = data;
    if (effectivePP <= 0) return { rankedBuyOptions: [] };

    const resourcesToConsider = resources.map(r => {
        // >>> Adicionado log para depurar o que o worker recebe <<<

        const marketRate = r.marketRate || 0; // Taxa VENDA que o worker recebeu (pode precisar revisar isso depois)
        if (marketRate <= 0) return null;

        const desiredStock      = r.desiredStock || 0;
        const currentStock      = currentResources[r.name]   || 0;
        const incomingStock     = incomingResources[r.name]  || 0;
        const totalEffective    = currentStock + incomingStock;
        const deficit           = Math.max(0, desiredStock - totalEffective);
        const availableCapacity = Math.max(0, storageCapacity - totalEffective);
        if (deficit <= 0 || availableCapacity <= 0) return null;

        const buyLimitPerTime      = r.buyLimitPerTime || Infinity;
        const maxPhysicallyPossible = Math.min(deficit, availableCapacity, buyLimitPerTime);

        // Calcula a quantidade que PODE ser comprada com o PP efetivo,
        // usando a TAXA DE COMPRA (marketRate que veio do jogo, ex: 374 PP / 1000 res)
        // Nota: o 'marketRate' recebido pelo worker aqui é na verdade a *taxa de venda* (res/PP).
        // Precisamos usar a taxa de COMPRA REAL que o script principal tem.
        // O worker só pode estimar aqui. A validação final será no script principal.
        // Vamos manter a lógica do worker como estava por enquanto, focando no retorno do userRateLimit.
        // A estimativa de 'affordableAmount' pode não ser precisa, mas a validação no script principal pega.
        let affordableAmount       = Math.floor(effectivePP * marketRate); // Estimativa com taxa de VENDA
        let costCheck              = Math.ceil(affordableAmount / marketRate); // Estimativa com taxa de VENDA
        if (costCheck > effectivePP) affordableAmount = Math.floor((effectivePP - 1) * marketRate);

        const idealAmount = Math.max(0, Math.min(maxPhysicallyPossible, affordableAmount));
        if (idealAmount <= 0) return null;

        // ***** CORREÇÃO AQUI: Incluir userRateLimit no retorno *****
        return {
             name: r.name,
             marketRate: r.marketRate, // Mantém a taxa de venda recebida (para referência)
             idealAmount: idealAmount,
             userRateLimit: r.userRateLimit // <<< ADICIONADO PARA RETORNAR O LIMITE DO USUÁRIO
        };
    }).filter(Boolean);

    // *** COMPRA: maior rate primeiro (usando a taxa de VENDA como proxy - pode ser melhorado depois) ***
    resourcesToConsider.sort((a, b) => b.marketRate - a.marketRate);

    return { rankedBuyOptions: resourcesToConsider };
}

function calculateProfit(resource, amountSold) {
    const rate = resource.exchangeRate && resource.exchangeRate > 0 ? resource.exchangeRate : 1;
    return Math.floor(amountSold / rate);
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





// === updateSell (v1.1 - Ajuste unitSize para Worker) ===
async function updateSell() {
    const logPrefix = "[updateSell v1.1]"; // Log de entrada atualizado
    //logger.log(`${logPrefix} Iniciando função...`);

    // --- COOLDOWN PERSISTENTE CHECK ---
    const COOLDOWN_DURATION = 6000;
    const lastTxTimeStr = localStorage.getItem('aquila_lastTransactionTime');
    const lastTxTime = lastTxTimeStr ? parseInt(lastTxTimeStr, 10) : null;
    const nowForCooldown = Date.now();
    const timeSinceLastTx = lastTxTime && !isNaN(lastTxTime) ? nowForCooldown - lastTxTime : Infinity;

    //logger.log(`${logPrefix} [Cooldown] Última transação: ${lastTxTime}, Tempo decorrido: ${timeSinceLastTx}ms`);

    if (timeSinceLastTx < COOLDOWN_DURATION) {
        const secondsRemaining = Math.ceil((COOLDOWN_DURATION - timeSinceLastTx) / 1000);
        //logger.log(`${logPrefix} [Cooldown] Cooldown ativo. Aguardando ${secondsRemaining}s.`);
        return;
    }
    // --- FIM COOLDOWN PERSISTENTE CHECK ---

    const initialDelay = Math.random() * 200 + 50;
    //logger.log(`${logPrefix} [Delay] Aguardando ${initialDelay}ms antes de continuar`);
    await new Promise(resolve => setTimeout(resolve, initialDelay));

    // Verifica hCaptcha
    if (checkAndHandleHCaptcha()) {
        logger.log(`${logPrefix} [hCaptcha] Detectado - Abortando venda`);
        if(isProcessingSell) isProcessingSell = false; // Garante reset da flag
        return;
    }

    // --- VERIFICAÇÕES INICIAIS ---
    //logger.log(`${logPrefix} [Verificações] Estado atual: SellModeActive: ${state.sellModeActive}, isProcessingSell: ${isProcessingSell}, sellPausedUntil: ${state.sellPausedUntil}`);

    if (!state.sellModeActive) {
        //logger.log(`${logPrefix} [Verificações] Modo venda desativado - Abortando`);
        return;
    }
    if (isProcessingSell) {
        //logger.log(`${logPrefix} [Verificações] Venda já em processamento - Abortando`);
        return;
    }
    if (state.sellPausedUntil && state.sellPausedUntil > Date.now()) {
        //logger.log(`${logPrefix} [Verificações] Modo venda pausado - Abortando`);
        return;
    }
    // --- FIM VERIFICAÇÕES INICIAIS ---

    // --- INÍCIO DA LÓGICA DE VENDA ---
    //logger.log(`${logPrefix} [Venda] Iniciando lógica principal`);
    const merchantsAvailableInitial = getMerchantsAvailable();
    //logger.log(`${logPrefix} [Mercadores] Disponíveis inicialmente: ${merchantsAvailableInitial}`);

    if (enforceMerchantLimit && merchantsAvailableInitial <= 0) {
        //logger.log(`${logPrefix} [Mercadores] Sem mercadores disponíveis - Abortando`);
        return;
    }

    isProcessingSell = true;
    //logger.log(`${logPrefix} [Estado] isProcessingSell marcado como true`);

    // --- Preparação de Dados para o Web Worker ---
    //logger.log(`${logPrefix} [Worker] Preparando dados para o Worker`);
    const resourcesDataForWorker = Object.values(resources)
      .map((resource) => {
          if (!resource || !resource.name) {
              logger.warn(`${logPrefix} [Worker] Recurso inválido encontrado`);
              return null;
          }

          const currentTotal = resource.getTotal();
          const currentReserve = resource.getReserved();
          const currentMarketCapacity = getMarketCapacity(resource);
          const currentExchangeRate = getExchangeRate(resource); // Taxa Recursos / PP
          const currentMarketRate = resource.getMarketValue(); // Taxa Recursos / PP (deve ser a mesma que exchange rate)
          const currentMinRate = resource.getReserveRate(); // Limite Máximo do Usuário (Recursos / PP)
          const currentSellLimit = getSellLimit(resource); // Limite por Transação

          // Adiciona logs para verificar os valores antes de enviar
           // logger.log(`${logPrefix} [Dados][${resource.name}] Total: ${currentTotal}, Reserva: ${currentReserve}, CapMercado: ${currentMarketCapacity}, TaxaCambio: ${currentExchangeRate}, TaxaMercado(getMarketValue): ${currentMarketRate}, LimiteUser: ${currentMinRate}, LimiteVendaTX: ${currentSellLimit}`);

          // Validação básica antes de enviar
          if (currentExchangeRate <= 0) {
              logger.warn(`${logPrefix} [Dados][${resource.name}] Taxa de Câmbio inválida (${currentExchangeRate}). Pulando recurso.`);
              return null;
          }
           if (currentMarketRate <= 0) {
               logger.warn(`${logPrefix} [Dados][${resource.name}] Taxa de Mercado (getMarketValue) inválida (${currentMarketRate}). Pulando recurso.`);
               return null;
           }


          return {
                name: resource.name,
                marketRate: currentMarketRate,       // Taxa atual Recursos / PP
                minRate: currentMinRate,             // Limite Máximo do Usuário (Recursos / PP) - Renomeado para clareza
                maxRate: Infinity,                   // Mantém o campo 'maxRate' (teto opcional) como era antes, mesmo que não usado ativamente agora
                total: currentTotal,
                reserve: currentReserve,
                sellLimit: currentSellLimit,         // Limite por transação
                marketCapacityRaw: currentMarketCapacity, // Capacidade do mercado
                exchangeRate: currentExchangeRate    // Taxa Recursos / PP (para cálculo de múltiplos)
          };
      })
      .filter(data => data !== null);

    //logger.log(`${logPrefix} [Worker] Dados preparados para envio:`, resourcesDataForWorker);

    if (resourcesDataForWorker.length === 0) {
        logger.log(`${logPrefix} [Worker] Nenhum recurso válido para processar após coleta de dados.`);
        isProcessingSell = false;
        return;
    }

    const workerData = {
        action: "calculateSellAmount",
        data: {
            resources: resourcesDataForWorker,
            merchantsAvailable: merchantsAvailableInitial,
            state: {
                marketTrends: mobx.toJS(state.marketTrends),
                marketVolatility: mobx.toJS(state.marketVolatility)
            },
            // ***** AJUSTE PRINCIPAL AQUI *****
            config: {
                enforceMerchantLimit,
                unitSize: 60, // <<< REDUZIDO DE 100 PARA 60 (ou outro valor < ~65)
                FIXED_FEE,
                minProfitThreshold
            }
            // ********************************
        }
    };

    //logger.log(`${logPrefix} [Worker] Enviando mensagem para Worker com dados:`, workerData);

    try {
        worker.postMessage(workerData);
        //logger.log(`${logPrefix} [Worker] Mensagem enviada com sucesso`);
    } catch (error) {
        logger.error(`${logPrefix} [Worker] Erro ao enviar mensagem:`, error);
        isProcessingSell = false;
        return;
    }

    // --- Callback para Resposta do Worker ---
    worker.onmessage = async (e) => {
        //logger.log(`${logPrefix} [Worker] Resposta recebida:`, e.data);

        // Resetar a flag é importante aqui DENTRO do callback,
        // porque a lógica assíncrona pode terminar a qualquer momento.
        const resetSellFlag = () => {
             if (isProcessingSell) {
                 //logger.log(`${logPrefix} [Worker Callback Reset] Resetando isProcessingSell=false.`);
                 isProcessingSell = false;
             }
        };

        if (checkAndHandleHCaptcha()) {
            logger.log(`${logPrefix} [Worker][hCaptcha] Detectado na resposta - Abortando`);
            resetSellFlag();
            return;
        }

        if (e.data.action === "sellAmountCalculated") {
            const result = e.data.result;
            //logger.log(`${logPrefix} [Worker][Resultado] Processando resposta:`, result);

            if (result.amountToSell > 0 && result.resourceName && resources[result.resourceName]) {
                //logger.log(`${logPrefix} [Worker][Ação] Venda recomendada: ${result.amountToSell} ${result.resourceName}`);

                // Verificação de estado antes da execução
                //logger.log(`${logPrefix} [Verificação Final] Verificando estado atual: isProcessingBuy: ${isProcessingBuy}`);

                if (isProcessingBuy) {
                    logger.log(`${logPrefix} [Conflito] Operação de compra detectada - Abortando venda`);
                    resetSellFlag();
                    return;
                }

                const resource = resources[result.resourceName];
                const latestTotal = resource.getTotal();
                const reserveAmount = resource.getReserved();
                const currentAvailable = Math.max(0, latestTotal - reserveAmount);
                const currentMerchants = getMerchantsAvailable();
                const requiredMerchants = Math.ceil(result.amountToSell / 1000);

                 //logger.log(`${logPrefix} [Validação Final] Dados atuais: amountToSell: ${result.amountToSell}, currentAvailable: ${currentAvailable}, currentMerchants: ${currentMerchants}, requiredMerchants: ${requiredMerchants}`);

                if (result.amountToSell <= currentAvailable && (!enforceMerchantLimit || currentMerchants >= requiredMerchants)) {
                     //logger.log(`${logPrefix} [Validação Final] Pré-condições satisfeitas - Executando transação`);

                    try {
                        await executeTransaction("sell", resource, result.amountToSell);
                        //logger.log(`${logPrefix} [Transação] Venda iniciada (executeTransaction chamado).`);
                        // Não resetamos a flag aqui, executeTransaction fará isso.
                         notifyUser(`${i18n.t("profit")}: <span class="icon header premium"></span> ${result.profit}`, "success");
                         // O return implícito aqui encerra o processamento desta mensagem do worker.
                    } catch (txError) {
                        logger.error(`${logPrefix} [Transação] Erro na execução de executeTransaction:`, txError);
                         resetSellFlag(); // Resetar a flag se a execução falhar
                    }
                } else {
                    logger.warn(`${logPrefix} [Validação Final] Pré-condições falharam (Recursos: ${result.amountToSell} <= ${currentAvailable}, Mercadores: ${currentMerchants} >= ${requiredMerchants}) - Cancelando transação`);
                    resetSellFlag(); // Resetar a flag se a validação final falhar
                }
            } else {
                //logger.log(`${logPrefix} [Worker][Resultado] Nenhuma ação de venda recomendada pelo worker.`);
                resetSellFlag(); // Resetar a flag se não houver recomendação
            }
        } else if (e.data.error) {
            logger.error(`${logPrefix} [Worker][Erro Mensagem]`, e.data.error);
             resetSellFlag(); // Resetar em caso de erro na mensagem
        } else {
             logger.warn(`${logPrefix} [Worker] Ação desconhecida na mensagem: ${e.data.action}`);
             resetSellFlag(); // Resetar para ações desconhecidas
        }
    };

    worker.onerror = (error) => {
        logger.error(`${logPrefix} [Worker][Erro Geral]`, error);
        if (isProcessingSell) { // Garante reset mesmo em erro geral
             isProcessingSell = false;
        }
    };
}
// === FIM updateSell ===



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
// ===       FUNÇÃO setupEvents ATUALIZADA (vPausa+AutoSave+SaveTrigger) ===
// ================================================================
const setupEvents = () => {
    const debounceDelay = 300;
    //console.log("[DEBUG setupEvents vPausa+AutoSave+SaveTrigger] Iniciando configuração de eventos...");

    // >>>>>>>>> DEFINIÇÃO DA FUNÇÃO AUXILIAR (PRECISA ESTAR AQUI DENTRO) <<<<<<<<<
    const setupClickListener = (elementId, handler) => {
        const element = ui.getElement(elementId);
        if (element) {
            element.removeEventListener('click', handler); // Previne duplicados
            element.addEventListener('click', handler);
        } else {
             //console.warn(`[setupClickListener] Elemento com ID "${elementId}" não encontrado.`);
        }
    };
    // >>>>>>>>> FIM DA DEFINIÇÃO <<<<<<<<<

    // --- 1. Listeners de Input da UI Principal (Debounced) ---
    //console.log("[DEBUG setupEvents vPausa+AutoSave+SaveTrigger] Configurando listeners 'input' UI Principal...");
     Object.values(resources).forEach((resource) => {
        if (resource.config.uiRateInput) {
            resource.config.uiRateInput.addEventListener("input", _.debounce(() => { if (state.buyModeActive && !isProcessingBuy && (!state.buyPausedUntil || state.buyPausedUntil <= Date.now())) { processBuyBasedOnResources(); } }, debounceDelay));
        }
        const desiredStockInput = document.querySelector(`.rate-input[data-resource="${resource.name}-stock"]`);
        if (desiredStockInput) {
            desiredStockInput.addEventListener("input", _.debounce(() => { if (state.buyModeActive && !isProcessingBuy && (!state.buyPausedUntil || state.buyPausedUntil <= Date.now())) { processBuyBasedOnResources(); } }, debounceDelay));
        }
        if (resource.config.uiReserveRateInput) {
            resource.config.uiReserveRateInput.addEventListener("input", _.debounce(() => { if (state.sellModeActive && !isProcessingSell && (!state.sellPausedUntil || state.sellPausedUntil <= Date.now())) { updateSell(); } }, debounceDelay));
        }
        const reserveAmountInput = document.querySelector(`.rate-input[data-resource="reserve-${resource.name}"]`);
        if (reserveAmountInput) {
            reserveAmountInput.addEventListener("input", _.debounce(() => { if (state.sellModeActive && !isProcessingSell && (!state.sellPausedUntil || state.sellPausedUntil <= Date.now())) { updateSell(); } }, debounceDelay));
        }
        const specificSellLimitInput = document.querySelector(`.rate-input[data-resource="sell-limit-${resource.name}"]`);
        if (specificSellLimitInput) {
           specificSellLimitInput.addEventListener("input", _.debounce(() => { if (state.sellModeActive && !isProcessingSell && (!state.sellPausedUntil || state.sellPausedUntil <= Date.now())) { updateSell(); } }, debounceDelay));
        }
        if (resource.name === 'wood') {
            const legacySellLimitInput = document.querySelector('.rate-input[data-resource="sell-limit"]');
            if (legacySellLimitInput) {
                 legacySellLimitInput.addEventListener("input", _.debounce(() => { if (state.sellModeActive && !isProcessingSell && (!state.sellPausedUntil || state.sellPausedUntil <= Date.now())) { updateSell(); } }, debounceDelay));
            }
        }
    });
    const buyPerTimeInput = document.querySelector('.rate-input[data-resource="buy-per-time"]');
    if (buyPerTimeInput) { buyPerTimeInput.addEventListener("input", _.debounce(() => { if (state.buyModeActive && !isProcessingBuy && (!state.buyPausedUntil || state.buyPausedUntil <= Date.now())) processBuyBasedOnResources(); }, debounceDelay)); }
    const storageLimitInput = document.querySelector('.rate-input[data-resource="storage-limit"]');
    if (storageLimitInput) { storageLimitInput.addEventListener("input", _.debounce(() => { if (state.buyModeActive && !isProcessingBuy && (!state.buyPausedUntil || state.buyPausedUntil <= Date.now())) processBuyBasedOnResources(); }, debounceDelay)); }
    const maxSpendInput = document.querySelector('.rate-input[data-resource="max-spend"]');
    if (maxSpendInput) { maxSpendInput.addEventListener("input", _.debounce(() => { if (state.buyModeActive && !isProcessingBuy && (!state.buyPausedUntil || state.buyPausedUntil <= Date.now())) processBuyBasedOnResources(); }, debounceDelay)); }
    const premiumPointsInputListenerTarget = ui.getElement("premiumPointsInput"); // Garante pegar o elemento correto para o listener do limite PP
    if (premiumPointsInputListenerTarget) { premiumPointsInputListenerTarget.addEventListener("input", _.debounce(() => { if (state.buyModeActive && !isProcessingBuy && (!state.buyPausedUntil || state.buyPausedUntil <= Date.now())) processBuyBasedOnResources(); }, debounceDelay));}


    // --- 2. Listeners de Botões (Click) ---
    setupClickListener("buyModeToggle", () => toggleMode("buyModeActive"));
    setupClickListener("sellModeToggle", () => toggleMode("sellModeActive"));

    setupClickListener("buyPause", () => { const now = Date.now(); const pauseStateKey = 'buyPausedUntil'; const storageKey = 'aquila_buyPauseEndTime'; const durationMinutes = state.buyPauseDurationMinutes; const modeString = 'Compra'; if (state[pauseStateKey] && state[pauseStateKey] > now) { if (buyPauseTimeoutId) { clearTimeout(buyPauseTimeoutId); buyPauseTimeoutId = null; } mobx.runInAction(() => { state[pauseStateKey] = null; }); localStorage.removeItem(storageKey); updateUI(); notifyUser(i18n.t("statusResumedManually", { mode: i18n.t('buy', {defaultValue: modeString}) }) || `${modeString} retomado manualmente.`, "success"); if (state.buyModeActive && !isProcessingBuy) { processBuyBasedOnResources(); } return; } if (!state.buyModeActive) { return; } if (durationMinutes > 0) { const pauseEndTime = now + durationMinutes * 60 * 1000; mobx.runInAction(() => { state[pauseStateKey] = pauseEndTime; }); localStorage.setItem(storageKey, pauseEndTime.toString()); updateUI(); notifyUser(i18n.t("pauseDurationSet", { mode: i18n.t('buy', { defaultValue: modeString }), duration: durationMinutes }), "warning"); if (buyPauseTimeoutId) clearTimeout(buyPauseTimeoutId); buyPauseTimeoutId = setTimeout(() => { mobx.runInAction(() => { state[pauseStateKey] = null; }); localStorage.removeItem(storageKey); buyPauseTimeoutId = null; updateUI(); notifyUser(i18n.t("pauseExpired", { mode: i18n.t('buy', { defaultValue: modeString }) }), "success"); if (state.buyModeActive && !isProcessingBuy) { processBuyBasedOnResources(); } }, durationMinutes * 60 * 1000); } else { notifyError(i18n.t("setPauseDurationError")); } });
     setupClickListener("sellPause", () => { const now = Date.now(); const pauseStateKey = 'sellPausedUntil'; const storageKey = 'aquila_sellPauseEndTime'; const durationMinutes = state.sellPauseDurationMinutes; const modeString = 'Venda'; if (state[pauseStateKey] && state[pauseStateKey] > now) { if (sellPauseTimeoutId) { clearTimeout(sellPauseTimeoutId); sellPauseTimeoutId = null; } mobx.runInAction(() => { state[pauseStateKey] = null; }); localStorage.removeItem(storageKey); updateUI(); notifyUser(i18n.t("statusResumedManually", { mode: i18n.t('sell', {defaultValue: modeString}) }) || `${modeString} retomado manualmente.`, "success"); if (state.sellModeActive && !isProcessingSell) { updateSell(); } return; } if (!state.sellModeActive) { return; } if (durationMinutes > 0) { const pauseEndTime = now + durationMinutes * 60 * 1000; mobx.runInAction(() => { state[pauseStateKey] = pauseEndTime; }); localStorage.setItem(storageKey, pauseEndTime.toString()); updateUI(); notifyUser(i18n.t("pauseDurationSet", { mode: i18n.t('sell', { defaultValue: modeString }), duration: durationMinutes }), "warning"); if (sellPauseTimeoutId) clearTimeout(sellPauseTimeoutId); sellPauseTimeoutId = setTimeout(() => { mobx.runInAction(() => { state[pauseStateKey] = null; }); localStorage.removeItem(storageKey); sellPauseTimeoutId = null; updateUI(); notifyUser(i18n.t("pauseExpired", { mode: i18n.t('sell', { defaultValue: modeString }) }), "success"); if (state.sellModeActive && !isProcessingSell) { updateSell(); } }, durationMinutes * 60 * 1000); } else { notifyError(i18n.t("setPauseDurationError")); } });

    // *** MODIFICADO: Listener Botão Salvar Config ***
    setupClickListener("saveConfig", () => {
        performSaveOperation(); // Salva primeiro
        notifySuccess(i18n.t("saveSuccess")); // Notifica

        // --- ADICIONADO: Trigger Compra Imediata ---
        console.log("[SaveConfig Click] Verificando se a compra deve ser acionada..."); // Log
        if (state.buyModeActive && !isProcessingBuy && (!state.buyPausedUntil || state.buyPausedUntil <= Date.now())) {
            console.log(" -> Condições OK! Chamando processBuyBasedOnResources() após salvar..."); // Log
            processBuyBasedOnResources(); // Chama a função de compra
        } else {
             console.log(` -> Compra não acionada. Condições: buyModeActive=${state.buyModeActive}, isProcessingBuy=${isProcessingBuy}, buyPaused=${!!state.buyPausedUntil}`); // Log explicando por que não chamou
        }
        // --- FIM DA ADIÇÃO ---
    });
    // *** FIM MODIFICAÇÃO ***

    setupClickListener("resetAll", resetAll);

    setupClickListener("aiAssistantBtn", () => { const modal = ui.getElement("aiModal"); if (modal) modal.style.display = "flex"; const prompt = ui.getElement("aiPrompt"); if(prompt) prompt.value = ""; const response = ui.getElement("aiResponse"); if (response) response.innerHTML = ""; });
     setupClickListener("settingsBtn", () => { populateUserInfo(); const buyPauseInput = document.getElementById('buyPauseDurationInput'); if (buyPauseInput) buyPauseInput.value = state.buyPauseDurationMinutes; const sellPauseInput = document.getElementById('sellPauseDurationInput'); if (sellPauseInput) sellPauseInput.value = state.sellPauseDurationMinutes; const closeHCaptchaCheck = document.getElementById('closeOnHCaptchaInput'); if (closeHCaptchaCheck) closeHCaptchaCheck.checked = state.closeTabOnHCaptcha; const langSelectModal = document.getElementById('languageSelect'); if (langSelectModal) langSelectModal.value = state.language || 'pt'; mobx.runInAction(() => { state.isSettingsModalOpen = true; }); const settingsModal = ui.getElement("settingsModal"); if(settingsModal) settingsModal.style.display = "flex"; });
    setupClickListener("submitAI", async () => { const promptInput = ui.getElement("aiPrompt"); const prompt = promptInput ? promptInput.value : ""; if (!prompt.trim()) return; const responseArea = ui.getElement("aiResponse"); if(responseArea) responseArea.innerHTML = `<p>${i18n.t("aiLoading")}</p>`; try { const response = await callGeminiAPI(prompt); if (responseArea) responseArea.innerHTML = `<p>${response.replace(/\n/g, '<br>')}</p>`; } catch (error) { if(responseArea) responseArea.innerHTML = `<p class="error">${i18n.t("aiError")}: ${error.message || error}</p>`; } });
    setupClickListener("closeAIModal", () => { const modal = ui.getElement("aiModal"); if (modal) modal.style.display = "none"; });
    setupClickListener("closeSettingsModal", () => { mobx.runInAction(() => { state.isSettingsModalOpen = false; }); const modal = ui.getElement("settingsModal"); if (modal) modal.style.display = "none"; });
    setupClickListener("minimizeButton", () => { const c=ui.getElement("market-container"), b=ui.getElement("minimizedMarketBox"); if(c&&b){ mobx.runInAction(() => { state.isMinimized = true; }); c.style.display="none"; b.style.display="flex"; localStorage.setItem("isMinimized", "true"); }});
    setupClickListener("minimizedMarketBox", () => { const c=ui.getElement("market-container"), b=ui.getElement("minimizedMarketBox"); if(c&&b){ mobx.runInAction(() => { state.isMinimized = false; }); c.style.display="block"; b.style.display="none"; localStorage.setItem("isMinimized", "false"); }});

    // --- 3. Listeners de Select (Idioma e Aldeia) ---
    const languageSelect = ui.getElement("languageSelect"); if (languageSelect) { languageSelect.removeEventListener("change", handleLanguageChange); languageSelect.addEventListener("change", handleLanguageChange); }
    const villageSelect = ui.getElement("villageSelect"); if (villageSelect) { villageSelect.removeEventListener("change", handleVillageChange); villageSelect.addEventListener("change", handleVillageChange); }

    // --- 4. SEÇÃO AUTO-SAVE para Modal Configs ---
    const modalConfigElementsSelector = '#settingsModal .settings-input, #settingsModal .settings-checkbox, #settingsModal .aquila-select';
    const modalConfigElements = document.querySelectorAll(modalConfigElementsSelector);
    const autoSaveDelay = 1500;
    const debouncedAutoSave = _.debounce(() => { performSaveOperation(); }, autoSaveDelay);
    modalConfigElements.forEach(element => { const eventType = (element.type === 'checkbox') ? 'change' : 'input'; element.removeEventListener(eventType, debouncedAutoSave); element.addEventListener(eventType, debouncedAutoSave); });

    // --- 5. Listeners para Tooltip ---
    const tooltipTriggerSelector = '[data-tooltip], [data-tooltip-key]';
    const tooltipElements = document.querySelectorAll(`.market-container ${tooltipTriggerSelector}, .modal ${tooltipTriggerSelector}`);
    tooltipElements.forEach((element) => { element.removeEventListener("mouseenter", showTooltip); element.removeEventListener("mousemove", updateTooltipPosition); element.removeEventListener("mouseleave", hideTooltip); element.addEventListener("mouseenter", showTooltip); element.addEventListener("mousemove", updateTooltipPosition); element.addEventListener("mouseleave", hideTooltip); });

    // --- 6. Listener para fechar modais com clique fora ---
    window.removeEventListener('click', handleOutsideModalClick, true);
    window.addEventListener('click', handleOutsideModalClick, true);

    //console.log("[DEBUG setupEvents vPausa+AutoSave+SaveTrigger] Configuração de TODOS os eventos concluída.");
}; // --- Fim da função setupEvents (vPausa+AutoSave+SaveTrigger) ---


// (As funções handleLanguageChange, handleVillageChange, handleOutsideModalClick devem estar definidas DEPOIS desta função, como já estavam antes)
// ... Coloque aqui as funções handleLanguageChange, handleVillageChange, handleOutsideModalClick ...
function handleLanguageChange(event) {
    const newLang = event.target.value;
        if (["pt", "ru", "en", "uk"].includes(newLang))  {
        if (state.language !== newLang) { mobx.runInAction(() => { state.language = newLang; }); /* console.log(`[Idioma Change] State: ${newLang}`); */ }
        i18n.changeLanguage(newLang).then(() => { localStorage.setItem("language", state.language); /* console.log(`[Idioma Change] i18n/Storage: ${newLang}. Atualizando UI...`); */ updateUI();
        }).catch(error => { console.error(`[Idioma Change] Erro i18next ${newLang}:`, error); });
    } else { console.warn(`[Idioma Change] Idioma inválido: ${newLang}`); }
}

function handleVillageChange(event) { /* console.log(`[Village Change] Seleção: ${event.target.value}`); */ if (event.target.value === "current") { updateVillageInfo(); } }

function handleOutsideModalClick(event) {
    const checkAndClose = (modalId, stateKey = null) => {
        const modalElement = ui.getElement(modalId);
        if (modalElement && modalElement.style.display === 'flex' && !modalElement.querySelector('.modal-content')?.contains(event.target)) {
            //console.log(`[Click Fora] Fechando #${modalId}...`);
            modalElement.style.display = 'none';
            if (stateKey && typeof state[stateKey] !== 'undefined') { mobx.runInAction(() => { state[stateKey] = false; }); }
            return true;
        }
        return false;
    };
    checkAndClose("settingsModal", "isSettingsModalOpen");
    checkAndClose("aiModal");
}









// FUNÇÃO resetAll ATUALIZADA (v3 - Sem Tx Cache Clear)
const resetAll = () => { // REMOVIDO: Parâmetro setupClickListener daqui
    logger.warn("[ResetAll Button Click v3] INICIANDO RESET...");
    // Limpa inputs UI principal
    document.querySelectorAll('.market-container .rate-input').forEach(input => input.value = "");
    const premiumInput = ui.getElement("premiumPointsInput"); if (premiumInput) premiumInput.value = "";
    // Reset inputs modal UI para defaults/placeholders
    document.querySelectorAll('#settingsModal .settings-input').forEach(input => { input.value = input.placeholder || ""; });
    const closeHCaptchaCheck = document.getElementById('closeOnHCaptchaInput'); if (closeHCaptchaCheck) closeHCaptchaCheck.checked = false; // Reset hCaptcha para false
    const langSelect = document.getElementById('languageSelect'); if (langSelect) langSelect.value = 'pt';
    const buyPauseInputEl = document.getElementById('buyPauseDurationInput'); if (buyPauseInputEl) buyPauseInputEl.value = 5;
    const sellPauseInputEl = document.getElementById('sellPauseDurationInput'); if (sellPauseInputEl) sellPauseInputEl.value = 5;
    console.log("[ResetAll v3] Inputs UI e Modal resetados.");

    // REMOVIDO: Limpeza de Cache de Transações

    // Remove config geral e idioma
    localStorage.removeItem("compressedConfig");
    localStorage.removeItem("language");
    // Remove pausas persistentes
    localStorage.removeItem('aquila_buyPauseEndTime');
    localStorage.removeItem('aquila_sellPauseEndTime');
    console.log("[ResetAll v3] localStorage (configs, lang, pausas) limpo.");

    // Reseta state MobX
    mobx.runInAction(() => {
        state.buyModeActive = false; state.sellModeActive = false;
        state.hasExecutedBuy = false; state.hasExecutedSell = false;
        state.buyPausedUntil = null; state.sellPausedUntil = null;
        state.buyPauseDurationMinutes = 5; state.sellPauseDurationMinutes = 5;
        state.language = 'pt';
        // state.transactions.replace([]); // REMOVIDO
        // state.worldProfit = 0;        // REMOVIDO
        // state.allTransactionsFetched = false; // REMOVIDO
        state.closeTabOnHCaptcha = false;
    });
    console.log("[ResetAll v3] State MobX redefinido.");

    // Reseta flags de modo no storage
    localStorage.setItem("buyModeActive", "false");
    localStorage.setItem("sellModeActive", "false");

    // Limpa timeouts de pausa
    if (buyPauseTimeoutId) { clearTimeout(buyPauseTimeoutId); buyPauseTimeoutId = null; console.log(" -> Timeout pausa compra limpo."); }
    if (sellPauseTimeoutId) { clearTimeout(sellPauseTimeoutId); sellPauseTimeoutId = null; console.log(" -> Timeout pausa venda limpo."); }

    updateUI(); // Atualiza UI
    console.log("[ResetAll v3] Concluído.");
    notifySuccess(i18n.t("resetAllSuccess", { defaultValue: "Configurações resetadas com sucesso!" }));
};
// === FIM resetAll ATUALIZADA (v3 - Sem Tx Cache Clear) ===


















// ================================================================
// ===  FUNÇÃO updateUI ATUALIZADA (v14.3 - Sem Logs/Transações) ===
// ================================================================
const updateUI = () => {
    //console.log("[DEBUG updateUI v14.3 - NoTx] Iniciando...");

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
    // updateElement("transactionsBtn", i18n.t("transactions")); // REMOVIDO
    updateElement("settingsBtn", null, `<i class="fa-solid fa-gear"></i>`);
    updateElement("aiAssistantBtn", null, `<i class="fa-solid fa-robot"></i>`);
    updateElement("minimizeButton", null, `<i class="fa-solid fa-window-minimize"></i>`);
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

    // --- ATUALIZAÇÃO BOTÕES PAUSAR (sem título) ---
    const now = Date.now();
    const buyPauseBtn = ui.getElement("buyPause");
    if (buyPauseBtn) {
        if (state.buyPausedUntil && state.buyPausedUntil > now) {
            const resumeTimestamp = state.buyPausedUntil;
            const resumeTimeFormatted = new Date(resumeTimestamp).toLocaleTimeString(state.language || 'pt-BR', { hour: '2-digit', minute: '2-digit' });
            buyPauseBtn.innerHTML = `<i class="fas fa-hourglass-end"></i> ${i18n.t('pausedUntil', { time: resumeTimeFormatted })}`;
            buyPauseBtn.disabled = false;
            buyPauseBtn.classList.add("paused");
            // Garante que o data-tooltip-key seja para retomar
            const expectedKey = 'clickToResumeTooltip';
            if (buyPauseBtn.getAttribute('data-tooltip-key') !== expectedKey) { buyPauseBtn.setAttribute('data-tooltip-key', expectedKey); }
        } else {
            buyPauseBtn.innerHTML = `<i class="fas fa-pause"></i> ${i18n.t('pause')}`;
            buyPauseBtn.disabled = !state.buyModeActive;
            buyPauseBtn.classList.remove("paused");
            // Garante que o data-tooltip-key seja para pausar
            const expectedKey = 'tooltipPauseBuy';
            if (buyPauseBtn.getAttribute('data-tooltip-key') !== expectedKey) { buyPauseBtn.setAttribute('data-tooltip-key', expectedKey); }
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
            // Garante que o data-tooltip-key seja para retomar
            const expectedKey = 'clickToResumeTooltip';
            if (sellPauseBtn.getAttribute('data-tooltip-key') !== expectedKey) { sellPauseBtn.setAttribute('data-tooltip-key', expectedKey); }
        } else {
            sellPauseBtn.innerHTML = `<i class="fas fa-pause"></i> ${i18n.t('pause')}`;
            sellPauseBtn.disabled = !state.sellModeActive;
            sellPauseBtn.classList.remove("paused");
            // Garante que o data-tooltip-key seja para pausar
            const expectedKey = 'tooltipPauseSell';
            if (sellPauseBtn.getAttribute('data-tooltip-key') !== expectedKey) { sellPauseBtn.setAttribute('data-tooltip-key', expectedKey); }
         }
     }

    // --- REMOVIDO: Atualização Lucro ---
    // const worldProfitEl = ui.getElement("worldProfit"); // REMOVIDO

    // --- Atualização Idioma (igual) ---
    const languageSelect = ui.getElement("languageSelect");
    if (languageSelect) {
      const currentLangValue = languageSelect.value;
            languageSelect.innerHTML = `
            <option value="pt" ${state.language === "pt" ? "selected" : ""}>🇧🇷 ${i18n.t("portuguese")}</option>
            <option value="ru" ${state.language === "ru" ? "selected" : ""}>🇷🇺 ${i18n.t("russian")}</option>
            <option value="en" ${state.language === "en" ? "selected" : ""}>🇬🇧 ${i18n.t("english")}</option>
            <option value="uk" ${state.language === "uk" ? "selected" : ""}>🇺🇦 ${i18n.t("ukrainian")}</option> {/* <-- ADICIONADO */}
        `;
       languageSelect.value = ["pt", "ru", "en"].includes(currentLangValue) ? currentLangValue : state.language;
    }

    // --- Atualização do Conteúdo Textual das Modais (igual) ---
    const updateModalContent = (modalId) => {
        const modalElement = document.getElementById(modalId);
        if (modalElement && (modalElement.style.display !== 'none' || modalId === 'settingsModal')) {
             // (Código interno de updateModalContent permanece igual)
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
                         const iconElement = el.querySelector('i.fas'); let textNodeToUpdate = null;
                         if (iconElement) { let sibling = iconElement.nextSibling; while (sibling) { if (sibling.nodeType === Node.TEXT_NODE && sibling.nodeValue.trim() !== '') { textNodeToUpdate = sibling; break; } sibling = sibling.nextSibling; } if (!textNodeToUpdate) { const childNodes = Array.from(el.childNodes); for (let i = childNodes.length - 1; i >= 0; i--) { if (childNodes[i].nodeType === Node.TEXT_NODE && childNodes[i].nodeValue.trim() !== '') { textNodeToUpdate = childNodes[i]; break; } } }
                         } else { textNodeToUpdate = Array.from(el.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== ''); if (!textNodeToUpdate && el.childNodes.length === 1 && el.firstChild?.nodeType === Node.TEXT_NODE) { textNodeToUpdate = el.firstChild; } }
                         if (textNodeToUpdate) { const currentText = textNodeToUpdate.nodeValue.trim(); const translatedText = translation.trim(); if (currentText !== translatedText) { textNodeToUpdate.nodeValue = ` ${translation}`; }
                         } else if (!iconElement && el.textContent.trim() !== translation.trim()) { el.textContent = translation;
                         } else if (iconElement && !textNodeToUpdate){ const currentTextContent = el.textContent.replace(iconElement.outerText, '').trim(); if(currentTextContent !== translation.trim()){ Array.from(el.childNodes).forEach(node => { if(node.nodeType === Node.TEXT_NODE) { el.removeChild(node); } }); el.appendChild(document.createTextNode(` ${translation}`)); } }
                     }
                }
            });
             // Atualiza tooltips apenas dos ícones
            const tooltipIcons = modalElement.querySelectorAll(".tooltip-icon[data-tooltip-key]");
            tooltipIcons.forEach((el) => { const key = el.dataset.tooltipKey; if (key) { const titleText = i18n.t(key, { defaultValue: key }); /* REMOVIDO: el.setAttribute('title', titleText); */ } });
        }
    };

    // updateModalContent("transactionsModal"); // REMOVIDO
    updateModalContent("settingsModal");
    updateModalContent("aiModal");

    // updateElement("closeModal", i18n.t("close")); // REMOVIDO
    updateElement("closeAIModal", i18n.t("close")); // Fechar Modal AI
    updateElement("closeSettingsModal", null, '×'); // Fechar Modal Configs (usa só o '×')

    // console.log("[DEBUG updateUI v14.3-NoTx] Atualização UI concluída.");
}; // --- Fim da função updateUI ---





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
        const langToLoad = ["pt", "ru", "en", "uk"].includes(langFromStorage) ? langFromStorage : (["pt", "ru", "en", "uk"].includes(langFromConfig) ? langFromConfig : 'pt'); // <-- ADICIONADO 'uk' nas duas verificações
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
















// >>> INÍCIO SUBSTITUIÇÃO PASSO 2 (Modificar checkAndHandleHCaptcha) <<<
// ======================================================================
// ===  FUNÇÃO checkAndHandleHCaptcha ATUALIZADA (v2 - Pausa em vez de Fechar) ===
// ======================================================================
/**
 * Verifica a presença de elementos captcha (hCaptcha ou botão específico)
 * e PAUSA o script se encontrar algum.
 * @returns {boolean} Retorna true se um captcha foi detectado e a pausa foi ativada, false caso contrário.
 */
function checkAndHandleHCaptcha() {
    const logPrefix = "[Captcha Check v2 - Pause]";

    // 1. Define seletores para hCaptcha e o botão específico
    const captchaSelectors = [
        'iframe[src*="hcaptcha.com"]',         // Iframe hCaptcha padrão
        'iframe[title*="hCaptcha"]',           // Iframe por título
        'div[data-hcaptcha-widget-id]',        // Div widget hCaptcha
        'div.h-captcha-container',             // Container hCaptcha
        '[id^="hcaptcha-challenge"]',          // Elementos com ID hcaptcha
        'a.btn.btn-default[href="#"]',         // Botão específico (ex: Begin botbescherming)
        // Adicione outros seletores se necessário
    ];

    // 2. Procura por qualquer um dos elementos no DOM
    let captchaDetected = false;
    let detectedElement = null; // Para log
    for (const selector of captchaSelectors) {
        detectedElement = document.querySelector(selector);
        if (detectedElement) {
            // Verificação adicional para o botão (opcional, podemos adicionar checagem de texto depois se necessário)
            if (selector === 'a.btn.btn-default[href="#"]') {
                // Poderíamos checar o texto aqui, mas por enquanto, a classe/href é suficiente
                // const buttonText = detectedElement.textContent.toLowerCase();
                // if (buttonText.includes('botbescherming') || buttonText.includes('bot protection')) {
                //    captchaDetected = true;
                //    break;
                // }
                captchaDetected = true; // Assume que este botão é sempre captcha
                break;
            } else {
                // Para iframes ou divs hCaptcha, a presença é suficiente
                captchaDetected = true;
                break;
            }
        }
    }

    // 3. Se um captcha foi detectado
    if (captchaDetected) {
        logger.warn(`${logPrefix} CAPTCHA Detectado! Elemento:`, detectedElement);

        // --- Lógica de Pausa ---
        const now = Date.now();
        // Define um timestamp de pausa muito longo (ex: 1 ano) para simular pausa indefinida
        const indefinitePauseTimestamp = now + 365 * 24 * 60 * 60 * 1000;

        let pauseApplied = false;
        mobx.runInAction(() => {
            // Pausa a Compra se não estiver já pausada indefinidamente
            if (!state.buyPausedUntil || state.buyPausedUntil < indefinitePauseTimestamp - 1000) { // Evita redefinir se já está indefinido
                state.buyPausedUntil = indefinitePauseTimestamp;
                localStorage.setItem('aquila_buyPauseEndTime', indefinitePauseTimestamp.toString());
                // Limpa timeout de pausa curta, se houver
                if (buyPauseTimeoutId) { clearTimeout(buyPauseTimeoutId); buyPauseTimeoutId = null; }
                pauseApplied = true;
                 logger.log(`${logPrefix} -> Modo Compra PAUSADO indefinidamente.`);
            }

            // Pausa a Venda se não estiver já pausada indefinidamente
            if (!state.sellPausedUntil || state.sellPausedUntil < indefinitePauseTimestamp - 1000) {
                state.sellPausedUntil = indefinitePauseTimestamp;
                localStorage.setItem('aquila_sellPauseEndTime', indefinitePauseTimestamp.toString());
                 // Limpa timeout de pausa curta, se houver
                if (sellPauseTimeoutId) { clearTimeout(sellPauseTimeoutId); sellPauseTimeoutId = null; }
                pauseApplied = true;
                logger.log(`${logPrefix} -> Modo Venda PAUSADO indefinidamente.`);
            }
        });

        // Atualiza a UI para mostrar o estado de pausa
        updateUI();

        // Notifica o usuário (apenas se realmente aplicou a pausa agora)
        if (pauseApplied) {
            notifyUser(i18n.t('captchaPauseNotification'), "warning", 10000); // Mostra por 10s
        }

        return true; // Indica que o captcha foi detectado e a ação de pausa foi aplicada (ou já estava aplicada)
    }

    // 4. Se nenhum Captcha foi encontrado
    return false;
}
// >>> FIM SUBSTITUIÇÃO PASSO 2 <<<








// ========================================================
// === FUNÇÃO initializeResources (Recursos e Handlers) ===
// ========================================================
const initializeResources = () => {
    const resourcesData = Object.keys(resourceConfigs).reduce((acc, name) => {
      // Pega a configuração base
      const config = { ...resourceConfigs[name] };
      // Busca e associa os elementos da UI correspondentes
      config.uiRateInput = document.querySelector(`.rate-input[data-resource="${name}"]`); // Input de Taxa Mín/Máx (Compra/Venda)
      config.uiReserveInput = document.querySelector(`.rate-input[data-resource="reserve-${name}"]`); // Input de Quantidade de Reserva (Venda)
      config.uiReserveRateInput = document.querySelector(`.rate-input[data-resource="reserve-${name}-rate"]`); // Input de Taxa de Reserva (Venda)
      // Adiciona o handler ao acumulador
      acc[name] = new ResourceHandler(name, config);
      return acc;
    }, {});

    // Itera sobre os recursos inicializados para definir valores padrão se necessário
    Object.keys(resourcesData).forEach((name) => {
      // Cacheia os inputs de compra/venda na UI
      ui.buyInputs.set(name, resourcesData[name].getBuyInput());
      ui.sellInputs.set(name, resourcesData[name].getSellInput());

      // Define um valor padrão para o input de compra (exemplo) se não houver um
      const buyInput = ui.buyInputs.get(name);
      if (buyInput && !buyInput.dataset.default) {
        // Poderia buscar de config ou usar um fixo
        buyInput.dataset.default = "1000"; // Ou um valor mais apropriado
      }
    });

    return resourcesData; // Retorna o objeto com todos os handlers de recursos
};
// --- FIM DA FUNÇÃO initializeResources ---

// ======================================================
// === FUNÇÃO updateGameElements (Botões Jogo & Merc.) ===
// ======================================================
const updateGameElements = () => {
    // Cacheia o elemento de contagem de mercadores
    ui.gameElements.set("merchants", document.querySelector("#market_merchant_available_count"));
    // Cacheia o botão de calcular/confirmar compra
    ui.gameElements.set("calculateButton", document.querySelector("input.btn-premium-exchange-buy"));
    // Cacheia o botão de confirmar venda
    ui.gameElements.set("sellButton", document.querySelector("#premium_exchange_form > input.btn[type='submit']")); // Seletor mais específico
};
// --- FIM DA FUNÇÃO updateGameElements ---







  // FUNÇÃO init ATUALIZADA com try...catch para logging de erro
  const init = async () => {
    try { // <<< ADICIONAR TRY AQUI
      console.log(`[Init v10] ${SCRIPT_NAME}: Iniciando inicialização...`);
      // 1. Inicializa a Interface Gráfica Base
      initializeUI();

      // 2. Mapeia e Cacheia Elementos Essenciais da UI do Script
      if (!initializeElements()) {
        throw new Error("Falha CRÍTICA ao inicializar elementos da UI RAGNAROK.");
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
      applyStyles(); // applyStyles será atualizada depois

      // 5. Inicializa Handlers de Recursos e Cacheia Botões do Jogo
      resources = initializeResources();
      updateGameElements();

      // 6. Carrega Configurações Salvas
      loadConfig(); // loadConfig será atualizada depois

      // 7. Configura Listeners de Eventos
      setupEvents(); // setupEvents já foi atualizada

      // 8. Aplica Tema
      updateTheme();

      // 9. Atualiza a UI uma primeira vez
      updateUI(); // updateUI já foi atualizada

      // 10. Verifica hCaptcha ANTES de buscas
      if (checkAndHandleHCaptcha()) {
        console.warn("[Init v10] hCaptcha detectado na inicialização. Interrompendo buscas.");
        return;
      }

      // 11. Busca Dados Dinâmicos Essenciais
      console.log("[Init v10] Buscando recursos atuais e chegando...");
      await Promise.all([
        fetchResources(),
        fetchIncomingResources()
      ]);
      console.log("[Init v10] Recursos atuais e chegando obtidos.");

      // 13. Popula Informações do Usuário na Modal
      populateUserInfo();

      // 14. Executa a Primeira Verificação de Compra/Venda
      console.log("[Init v10] Primeira verificação updateAll() comentada.");
      // await updateAll();

      // 15. Chamada Final para Garantir a UI Atualizada
      updateUI();
      console.log("[Init v10] Chamada final de updateUI executada.");

      // 16. Log Final de Sucesso
      console.log(`[Init v10] ${SCRIPT_NAME}: Inicialização completa e bem-sucedida!`);

    // <<< INÍCIO DO CATCH ADICIONADO >>>
    } catch (error) {
      // Usa console.error original aqui também para ter certeza que aparece no console
           logger.error(`${SCRIPT_NAME}: Erro CRÍTICO durante a inicialização (função init):`, error);

      // Notifica o usuário ou esconde a UI, como antes
      const errorMessage = i18n?.t ? i18n.t("initError", { defaultValue: "Erro grave na inicialização" }) : "Erro grave na inicialização";
      const detail = error.message || String(error);
      try { notifyError(`${errorMessage}: ${detail}.`); } catch (e) { }
      const container = document.getElementById("market-container");
      if (container) container.style.display = 'none';
    }
    // <<< FIM DO CATCH ADICIONADO >>>
  }; // --- Fim da função init (ATUALIZADA COM TRY...CATCH) ---









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










(function autoReloadIfIdle() {
  let lastActivityTimestamp = Date.now();

  // Atualiza o timestamp a cada interação com o DOM ou execução do heartbeat
  const activityEvents = ['click', 'keydown', 'mousemove', 'scroll'];
  activityEvents.forEach(event => {
    window.addEventListener(event, () => {
      lastActivityTimestamp = Date.now();
    }, { passive: true });
  });

  // Checagem periódica para ver se a página está ociosa
  setInterval(() => {
    const now = Date.now();
    const secondsSinceLastActivity = (now - lastActivityTimestamp) / 1000;

    if (secondsSinceLastActivity > 30) {
      console.warn("Página inativa por mais de 30s. Recarregando...");
      location.reload();
    }
  }, 5000); // checa a cada 5s
})();






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
.minimized-box { position: fixed; right: 15px; top: 4px; width: 34px; height: 34px; background-color: #0a0d14; border: 1px solid #4d3f1a; border-top: 2px solid #b8860b; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), inset 0 0 6px rgba(184, 134, 11, 0.1); display: flex; align-items: center; justify-content: center; border-radius: 5px; cursor: pointer; z-index: 2147483647; transition: all 0.25s ease; background-image: url('https://cdn.jsdelivr.net/gh/C7696/ragnarokcompra-e-venda@main/erasebg-transformed.ico'); background-size: 70% 70%; background-repeat: no-repeat; background-position: center center; }
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
/* === FIM Media Queries === */

    `;
    document.head.appendChild(style);
}; // --- Fim da função applyStyles (v1.3 - Refine Input Width & Hide Spinners) ---
}());
