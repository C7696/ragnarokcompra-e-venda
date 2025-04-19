// ==UserScript==
// @name         Aquila Prime
// @namespace    http://tampermonkey.net/
// @version      0.0.1
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

!async function(){"use strict";let e={apiKey:"AIzaSyAnDVwYDWa_JZj6uApXv6o9_d66JUZwF9o",authDomain:"compra-e-venda-ragnarok.firebaseapp.com",projectId:"compra-e-venda-ragnarok",storageBucket:"compra-e-venda-ragnarok.appspot.com",messagingSenderId:"896525993752",appId:"1:896525993752:web:1f99c76f66e16669f3c06d",measurementId:"G-1B10ECJN01"},t="RAGNAROK_AUTH_SESSION",a=`${t}_session_`,o=`${t}_expiration_`,r=!1,n=null,i=null,s=null,u=null,l=!1;function $(){try{return firebase.apps.length||firebase.initializeApp(e),firebase.firestore()}catch(a){return alert(`${t}: Falha cr\xedtica ao inicializar o sistema de verifica\xe7\xE3o. O script n\xe3o pode continuar.`),null}}function c(){return Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15)}async function d(){return new Promise(e=>{GM_xmlhttpRequest({method:"GET",url:"http://ip-api.com/json/?fields=status,message,query,city,country",timeout:5e3,onload:function(t){if(t.status>=200&&t.status<300)try{let a=JSON.parse(t.responseText);"success"===a.status?e({ip:a.query,city:a.city,country:a.country}):e({ip:"Erro API",city:"Erro API",country:"Erro API"})}catch(o){e({ip:"Erro Parse",city:"Erro Parse",country:"Erro Parse"})}else e({ip:`Erro HTTP ${t.status}`,city:`Erro HTTP ${t.status}`,country:`Erro HTTP ${t.status}`})},onerror:function(t){e({ip:"Erro Rede",city:"Erro Rede",country:"Erro Rede"})},ontimeout:function(){e({ip:"Timeout",city:"Timeout",country:"Timeout"})}})})}async function p(e){if(!e)return{authorized:!1,reason:"Nickname inv\xe1lido fornecido."};let t=$();if(!t)return{authorized:!1,reason:"Firestore n\xe3o inicializado."};let a=c(),o=t.collection("jogadores_permitidos").doc(e),r=o.collection("sessoes_ativas"),n={authorized:!1,reason:"Falha desconhecida na verifica\xe7\xe3o.",sessionId:null},i=firebase.firestore.Timestamp;try{let s=null;await t.runTransaction(async e=>{let t=await e.get(o);if(!t.exists)throw Error("Nickname n\xe3o encontrado na lista de permiss\xf5es.");let n=t.data();if(!n||!n.data_expiracao||"function"!=typeof n.data_expiracao.toDate)throw Error("Formato da data de expira\xe7\xe3o inv\xe1lido no banco de dados.");s=n.data_expiracao.toDate();let u=new Date;if(u>=s)throw Error(`Licen\xe7a expirada em ${s.toLocaleString()}.`);let l=r.doc(a),$=i.now();e.set(l,{timestamp_criacao:$,timestamp_heartbeat:$})});try{let u=await d(),l=r.doc(a);await l.update({ip_registrado:u.ip||"N/A",cidade_registrada:u.city||"N/A",pais_registrado:u.country||"N/A",info_navegador:navigator.userAgent||"N/A"})}catch(p){}n={authorized:!0,reason:"Licen\xe7a OK, Sess\xe3o Registrada.",sessionId:a,expirationDate:s}}catch(m){n={authorized:!1,reason:`Falha na verifica\xe7\xE3o: ${m.message}`||"Erro desconhecido na verifica\xe7\xe3o.",sessionId:null}}return n}async function m(e,t){if(!e||!t)return!1;let a=$();if(!a)return!1;let o=a.collection("jogadores_permitidos").doc(e).collection("sessoes_ativas").doc(t);try{return await o.update({timestamp_heartbeat:firebase.firestore.FieldValue.serverTimestamp()}),!0}catch(r){if("not-found"===r.code)return!1;throw r}}async function g(e,t){if(l||!e||!t)return;l=!0;try{GM_deleteValue(a+e)}catch(o){}let r=$();if(!r)return;let n=r.collection("jogadores_permitidos").doc(e).collection("sessoes_ativas").doc(t);try{n.delete()}catch(i){}}function f(e){if(!r&&null===n&&null===i)return;let t=r;if(r=!1,n){try{n()}catch(o){}n=null}if(i&&(clearInterval(i),i=null),t&&u){let l=a+u;try{GM_deleteValue(l)}catch(c){}}if(u&&s){let d=$();d&&d.collection("jogadores_permitidos").doc(u).collection("sessoes_ativas").doc(s).delete().catch(e=>{})}s=null,alert(`RAGNAROK: O script foi desativado.
Motivo: ${e}

Recarregue a p\xe1gina se o problema for resolvido.`);try{let p=document.querySelector(".market-container");if(p){p.querySelectorAll("button, input, select, textarea").forEach(e=>e.disabled=!0);let m=p.querySelector(".ragnarok-disabled-overlay");m||((m=document.createElement("div")).className="ragnarok-disabled-overlay",m.style.position="absolute",m.style.top="0",m.style.left="0",m.style.width="100%",m.style.height="100%",m.style.background="rgba(100, 100, 100, 0.7)",m.style.color="white",m.style.zIndex="1000",m.style.display="flex",m.style.flexDirection="column",m.style.justifyContent="center",m.style.alignItems="center",m.style.fontSize="18px",m.style.textAlign="center",m.style.backdropFilter="blur(2px)",m.style.borderRadius="15px",m.innerHTML=`Script RAGNAROK Desativado<br><small style="font-size: 12px;">(${e})</small>`,p.style.position="relative",p.appendChild(m))}}catch(g){}}async function h(e,t){if(!e||!t){f("Erro interno: Falta de dados para iniciar monitoramento.");return}let a=$();if(!a){f("Erro cr\xedtico: Firestore indispon\xedvel.");return}let o=a.collection("jogadores_permitidos").doc(e);n=o.onSnapshot(e=>{if(!r)return;if(!e.exists||!e.data()?.data_expiracao?.toDate()){f("Licen\xe7a revogada ou inv\xe1lida.");return}let t=e.data().data_expiracao.toDate();new Date>=t&&f(`Licen\xe7a expirou em ${t.toLocaleString()}.`)},e=>f(`Erro de conex\xe3o no monitoramento (${e.code}).`)),i=setInterval(async()=>{try{let a=await m(e,t);if(!a&&r){let o=await p(e);o.authorized&&o.sessionId?s=o.sessionId:f(o.reason||"Falha ao recriar sess\xe3o.")}}catch(n){f(`Erro de comunica\xe7\xE3o com o servidor (${n.code||"desconhecido"}).`)}},18e4),window.addEventListener("beforeunload",()=>g(e,t))}function b(e){let t=GM_getValue(o+e);if(t){let a=new Date(t);if(!isNaN(a.getTime()))return a}return null}async function x(){if(!(u=function e(){try{let t=TribalWars.getGameData().player.name.toString();if(!t||""===t.trim())throw Error("Nickname do jogador vazio ou inv\xe1lido.");return t}catch(a){return null}}()))return f("N\xe3o foi poss\xedvel identificar o Nickname."),!1;let e=b(u),t=new Date;if(e&&t<e)return s=GM_getValue(a+u)?.sessionId||c(),!0;let r=await p(u);if(!r.authorized||!r.sessionId||!r.expirationDate)return f(r.reason||"Falha na verifica\xe7\xe3o da licen\xe7a."),!1;{var n,i;n=u,GM_setValue(o+n,(i=r.expirationDate).toISOString()),s=r.sessionId;let l=a+u;return GM_setValue(l,{sessionId:s,timestamp:Date.now(),expirationDate:r.expirationDate.toISOString()}),!0}}if("undefined"==typeof firebase||void 0===firebase.firestore){alert(`${t}: Erro cr\xedtico - Componentes de verifica\xe7\xE3o n\xe3o encontrados.`);return}let _=await x();if(!_)return;r=!0,h(u,s);let y=!1,v=window._,E=luxon.DateTime,A=window.mobx,k={cache:{},cacheLimit:100,cacheKeys:[],get:function(e){if(this.cache[e])return this.cacheKeys=v.filter(this.cacheKeys,t=>t!==e),this.cacheKeys.push(e),this.cache[e].data},set:function(e,t){if(this.cache[e])this.cache[e].data=t,this.cacheKeys=v.filter(this.cacheKeys,t=>t!==e),this.cacheKeys.push(e);else{if(this.cacheKeys.length>=this.cacheLimit){let a=this.cacheKeys.shift();delete this.cache[a]}this.cache[e]={data:t},this.cacheKeys.push(e)}}};async function C(e){let t=k.get(e);return t||new Promise((t,a)=>{GM_xmlhttpRequest({method:"GET",url:e,headers:{"X-Requested-With":"XMLHttpRequest"},timeout:7e3,onload:function(o){if(o.status>=200&&o.status<300)try{let r=o.responseText;k.set(e,r),t(r)}catch(n){console.error(`[GM_XHR Parse Error] Erro ao processar resposta de ${e}:`,n),a(Error("Erro ao processar resposta do servidor"))}else console.error(`[GM_XHR HTTP Error] Status ${o.status} para ${e}`),a(Error(`Erro HTTP ${o.status}`))},onerror:function(t){console.error(`[GM_XHR Network Error] Erro de rede para ${e}:`,t),a(Error("Erro de rede ao buscar dados"))},ontimeout:function(){console.error(`[GM_XHR Timeout] Timeout para ${e}`),a(Error("Timeout ao buscar dados"))}})})}let w={resources:{pt:{translation:{title:"RAGNAROK COMPRA E VENDA DE RECURSOS",buyModeToggleOn:"Desativar Compra",buyModeToggleOff:"Habilitar Compra",sellModeToggleOn:"Desativar Venda",sellModeToggleOff:"Habilitar Venda",saveConfig:"Salvar",resetAll:"Resetar Tudo",pause:"Pausar",transactions:"Transa\xe7\xf5es",aiAssistant:"Assistente IA Ragnarok",settings:"Configura\xe7\xf5es",saveSuccess:"Configura\xe7\xe3o salva com sucesso!",portuguese:"Portugu\xeas",russian:"Russo",english:"Ingl\xeas",activated:"Ativado",deactivated:"Deativado",transactionInProgress:"Processando transa\xe7\xe3o...",transactionSuccess:"Transa\xe7\xe3o conclu\xedda com sucesso!",transactionError:"Erro na transa\xe7\xe3o. Tente novamente.",domError:"Erro ao acessar elementos do jogo. Atualizando...",noTransactions:"Nenhuma transa\xe7\xe3o encontrada.",transactionsHeader:"Hist\xf3rico de Transa\xe7\xf5es",transaction:"Transa\xe7\xe3o",date:"Data",type:"Tipo",change:"Mudan\xe7a",world:"Mundo",newPremiumPoints:"Novos Pontos Premium",close:"Fechar",filters:"Filtros",dateFrom:"Data Inicial",dateTo:"Data Final",worldFilter:"Filtro por Mundo",sortAsc:"Ordenar Ascendente",sortDesc:"Ordenar Descendente",page:"P\xe1gina",next:"Pr\xf3ximo",previous:"Anterior",chartTitle:"Mudan\xe7as ao Longo do Tempo",expenses:"Despesas",sales:"Lucros",profit:"Lucro",filteredPeriodProfitLabel:"Lucro L\xedquido (Per\xedodo)",aiPrompt:"Digite sua pergunta para o Assistente IA",aiLoading:"Carregando resposta...",aiError:"Erro ao obter resposta do AI",tooltipMinimize:"Minimizar Janela",tooltipSettings:"Abrir Configura\xe7\xf5es",tooltipAIAssistant:"Abrir Assistente IA",stockDesiredTooltip:"Define a quantidade m\xe1xima de {{resource}}, considerando a soma dos recursos dispon\xedveis na aldeia e os recursos em tr\xe2nsito.",userRateTooltip:"Taxa m\xednima (pontos premium por unidade) para comprar {{resource}}. O script s\xf3 compra se o mercado for igual ou maior.",buyPerTimeTooltip:"Quantidade m\xe1xima por compra/transa\xe7\xe3o. O script n\xe3o excede este valor.",reserveAmountTooltip:"Quantidade m\xednima de {{resource}} a manter. O script n\xe3o vende se o estoque for igual ou menor.",reserveRateTooltip:"Taxa m\xe1xima (pontos premium por unidade) para vender {{resource}}. O script s\xf3 vende se o mercado for igual ou menor.",sellLimitTooltip:"Quantidade m\xe1xima por venda/transa\xe7\xe3o. O script n\xe3o excede este valor.",tooltipVillageSelect:"Exibe a aldeia ativa e coordenadas.",tooltipPauseBuy:"Pausar Compra pelo tempo definido nas Configura\xe7\xf5es.",tooltipPauseSell:"Pausar Venda pelo tempo definido nas Configura\xe7\xf5es.",clickToResumeTooltip:"Clique para retomar",tooltipSaveConfig:"Salva as configura\xe7\xf5es atuais no armazenamento local do navegador.",tooltipTransactions:"Abre o hist\xf3rico de transa\xe7\xf5es de Pontos Premium.",tooltipPremiumLimit:"Limite M\xc1XIMO de PP que o script pode GASTAR em compras.",tooltipWorldProfit:"Exibe o saldo L\xcdQUIDO de Pontos Premium obtido neste mundo (Lucro Total - Custo Total, baseado no hist\xf3rico).",resourceNames:{wood:"madeira",stone:"argila",iron:"ferro"},settingsSectionAccount:"Informa\xe7\xf5es da Conta",settingsSectionLanguage:"Idioma",settingsSectionGeneral:"Geral",settingsSectionPause:"Configura\xe7\xf5es de Pausa",settingsLabelBuyPauseDuration:"Dura\xe7\xe3o Pausa Compra (min):",settingsLabelSellPauseDuration:"Dura\xe7\xe3o Pausa Venda (min):",settingsLabelPlayer:"Jogador:",settingsLabelLicense:"Licen\xe7a Expira em:",settingsLabelVersion:"Vers\xe3o do Script:",settingsLabelInterfaceLang:"Idioma da Interface:",settingsLabelCloseOnHCaptcha:"Fechar Aba no hCaptcha:",hCaptchaDetectedLog:"hCaptcha detectado!",attemptingTabCloseLog:"Configura\xe7\xe3o ativa - Tentando fechar a aba...",tabCloseErrorLog:"Erro ao tentar fechar a aba (pode ser bloqueado pelo navegador):",tooltipInterfaceLang:"Seleciona o idioma para a interface Aquila Prime.",tooltipBuyPauseDuration:"Tempo (em minutos) que o modo de compra ficar\xe1 pausado ao clicar no bot\xe3o 'Pausar'. A fun\xe7\xe3o ser\xe1 reativada automaticamente ap\xf3s este per\xedodo.",tooltipSellPauseDuration:"Tempo (em minutos) que o modo de venda ficar\xe1 pausado ao clicar no bot\xe3o 'Pausar'. A fun\xe7\xe3o ser\xe1 reativada automaticamente ap\xf3s este per\xedodo.",tooltipCloseOnHCaptcha:"Se marcado, o script tentar\xe1 fechar automaticamente a aba do navegador se um desafio hCaptcha for detectado nesta p\xe1gina.",statusLabel:"Status:",premiumExchange:"Troca Premium",pausedUntil:"Pausado at\xe9 {{time}}",pauseDurationSet:"Pausa de {{mode}} definida por {{duration}} minuto(s).",pauseExpired:"Pausa de {{mode}} expirou. Funcionalidade reativada.",statusResumedManually:"{{mode}} retomado manualmente.",setPauseDurationError:"Defina uma dura\xe7\xe3o de pausa (> 0) nas configura\xe7\xf5es.",buy:"Compra",sell:"Venda"}},ru:{translation:{title:"РАГНАРОК ПОКУПКА И ПРОДАЖА РЕСУРСОВ",buyModeToggleOn:"Отключить покупку",buyModeToggleOff:"Включить покупку",sellModeToggleOn:"Отключить продажу",sellModeToggleOff:"Включить продажу",saveConfig:"Сохранить",resetAll:"Сбросить всё",pause:"Пауза",transactions:"Транзакции",aiAssistant:"ИИ-Ассистент Рагнарок",settings:"Настройки",saveSuccess:"Конфигурация успешно сохранена!",portuguese:"Португальский",russian:"Русский",english:"Английский",activated:"Активировано",deactivated:"Деактивировано",transactionInProgress:"Обработка транзакции...",transactionSuccess:"Транзакция успешно завершена!",transactionError:"Ошибка транзакции. Попробуйте снова.",domError:"Ошибка доступа к элементам игры. Обновление...",noTransactions:"Транзакций не найдено.",transactionsHeader:"История транзакций",transaction:"Транзакция",date:"Дата",type:"Тип",change:"Изменение",world:"Мир",newPremiumPoints:"Новые премиум-очки",close:"Закрыть",filters:"Фильтры",dateFrom:"Дата начала",dateTo:"Дата окончания",worldFilter:"Фильтр по миру",sortAsc:"Сортировать по возрастанию",sortDesc:"Сортировать по убыванию",page:"Страница",next:"Следующая",previous:"Предыдущая",chartTitle:"Изменения с течением времени",expenses:"Расходы",sales:"Прибыль",profit:"Доход",filteredPeriodProfitLabel:"Чистая прибыль (Период)",aiPrompt:"Введите ваш вопрос для ИИ-помощника",aiLoading:"Загрузка ответа...",aiError:"Ошибка получения ответа от ИИ",tooltipMinimize:"Свернуть окно",tooltipSettings:"Открыть настройки",tooltipAIAssistant:"Открыть ИИ-ассистента",stockDesiredTooltip:"Устанавливает максимальное количество {{resource}}, учитывая сумму ресурсов в деревне и находящихся в пути.",userRateTooltip:"Минимальная ставка (премиум-очки за единицу) для покупки {{resource}}. Скрипт покупает только если рыночная ставка равна или выше.",buyPerTimeTooltip:"Максимальное количество за покупку/транзакцию. Скрипт не превышает это значение.",reserveAmountTooltip:"Минимальное количество {{resource}} для хранения. Скрипт не продает, если запас равен или меньше.",reserveRateTooltip:"Максимальная ставка (премиум-очки за единицу) для продажи {{resource}}. Скрипт продает только если рыночная ставка равна или ниже.",sellLimitTooltip:"Максимальное количество за продажу/транзакцию. Скрипт не превышает это значение.",tooltipVillageSelect:"Отображает активную деревню и координаты.",tooltipPauseBuy:"Приостановить покупку на время, указанное в настройках.",tooltipPauseSell:"Приостановить продажу на время, указанное в настройках.",clickToResumeTooltip:"Нажмите, чтобы возобновить",tooltipSaveConfig:"Сохраняет текущие настройки в локальном хранилище браузера.",tooltipTransactions:"Открывает историю транзакций Премиум-очков.",tooltipPremiumLimit:"МАКСИМАЛЬНЫЙ лимит ПП, который скрипт может ПОТРАТИТЬ на покупки.",tooltipWorldProfit:"Отображает ЧИСТУЮ прибыль в Премиум-очках, полученную в этом мире (Общий доход - Общие расходы, на основе истории).",resourceNames:{wood:"дерево",stone:"глина",iron:"железо"},settingsSectionAccount:"Информация об аккаунте",settingsSectionLanguage:"Язык",settingsSectionGeneral:"Общие",settingsSectionPause:"Настройки паузы",settingsLabelBuyPauseDuration:"Длит. паузы покупки (мин):",settingsLabelSellPauseDuration:"Длит. паузы продажи (мин):",settingsLabelPlayer:"Игрок:",settingsLabelLicense:"Лицензия действует до:",settingsLabelVersion:"Версия скрипта:",settingsLabelInterfaceLang:"Язык интерфейса:",settingsLabelCloseOnHCaptcha:"Закрывать вкладку при hCaptcha:",hCaptchaDetectedLog:"hCaptcha обнаружен!",attemptingTabCloseLog:"Настройка активна - Попытка закрытия вкладки...",tabCloseErrorLog:"Ошибка при попытке закрытия вкладки (может быть заблокировано браузером):",tooltipInterfaceLang:"Выберите язык для интерфейса Aquila Prime.",tooltipBuyPauseDuration:"Время (в минутах), на которое режим покупки будет приостановлен при нажатии кнопки 'Пауза'. Функция будет автоматически возобновлена после этого периода.",tooltipSellPauseDuration:"Время (в минутах), на которое режим продажи будет приостановлен при нажатии кнопки 'Пауза'. Функция будет автоматически возобновлена после этого периода.",tooltipCloseOnHCaptcha:"Если отмечено, скрипт попытается автоматически закрыть вкладку браузера, если на этой странице обнаружена проверка hCaptcha.",statusLabel:"Статус:",premiumExchange:"Премиум-обмен",pausedUntil:"Пауза до {{time}}",pauseDurationSet:"Пауза (Режим: {{mode}}) установлена на {{duration}} мин.",pauseExpired:"Пауза (Режим: {{mode}}) истекла. Функция возобновлена.",statusResumedManually:"Режим {{mode}} возобновлен вручную.",setPauseDurationError:"Укажите длительность паузы (> 0) в настройках.",buy:"Покупка",sell:"Продажа"}},en:{translation:{title:"RAGNAROK RESOURCE TRADING",buyModeToggleOn:"Turn Off Buying",buyModeToggleOff:"Turn On Buying",sellModeToggleOn:"Turn Off Selling",sellModeToggleOff:"Turn On Selling",saveConfig:"Save",resetAll:"Reset Everything",pause:"Pause",transactions:"Transactions",aiAssistant:"Ragnarok AI Assistant",settings:"Settings",saveSuccess:"Settings saved successfully!",portuguese:"Portuguese",russian:"Russian",english:"English",activated:"Activated",deactivated:"Deactivated",transactionInProgress:"Processing transaction...",transactionSuccess:"Transaction completed successfully!",transactionError:"Transaction failed. Please try again.",domError:"Error accessing game elements. Refreshing...",noTransactions:"No transactions found.",transactionsHeader:"Transaction History",transaction:"Transaction",date:"Date",type:"Type",change:"Change",world:"World",newPremiumPoints:"New Premium Points",close:"Close",filters:"Filters",dateFrom:"Start Date",dateTo:"End Date",worldFilter:"Filter by World",sortAsc:"Sort Ascending",sortDesc:"Sort Descending",page:"Page",next:"Next",previous:"Previous",chartTitle:"Changes Over Time",expenses:"Costs",sales:"Revenue",profit:"Profit",filteredPeriodProfitLabel:"Net Profit (Period)",aiPrompt:"Type your question for the AI Assistant",aiLoading:"Loading response...",aiError:"Error retrieving AI response",tooltipMinimize:"Minimize Window",tooltipSettings:"Open Settings",tooltipAIAssistant:"Open AI Assistant",stockDesiredTooltip:"Sets the maximum amount of {{resource}}, taking into account the sum of resources available in the village and those in transit.",userRateTooltip:"Minimum rate (premium points per unit) to buy {{resource}}. The script only buys if the market rate is at or above this.",buyPerTimeTooltip:"Maximum amount per purchase/transaction. The script won't exceed this value.",reserveAmountTooltip:"Minimum amount of {{resource}} to keep. The script won't sell if stock is at or below this.",reserveRateTooltip:"Maximum rate (premium points per unit) to sell {{resource}}. The script only sells if the market rate is at or below this.",sellLimitTooltip:"Maximum amount per sale/transaction. The script won't exceed this value.",tooltipVillageSelect:"Displays the active village and coordinates.",tooltipPauseBuy:"Pause Buying for the duration set in Settings.",tooltipPauseSell:"Pause Selling for the duration set in Settings.",clickToResumeTooltip:"Click to resume",tooltipSaveConfig:"Saves the current settings to the browser's local storage.",tooltipTransactions:"Opens the Premium Points transaction history.",tooltipPremiumLimit:"MAXIMUM PP limit the script can SPEND on purchases.",tooltipWorldProfit:"Displays the NET Premium Points balance obtained in this world (Total Income - Total Cost, based on history).",resourceNames:{wood:"wood",stone:"clay",iron:"iron"},settingsSectionAccount:"Account Information",settingsSectionLanguage:"Language",settingsSectionGeneral:"General",settingsSectionPause:"Pause Settings",settingsLabelBuyPauseDuration:"Buy Pause Duration (min):",settingsLabelSellPauseDuration:"Sell Pause Duration (min):",settingsLabelPlayer:"Player:",settingsLabelLicense:"License Expires:",settingsLabelVersion:"Script Version:",settingsLabelInterfaceLang:"Interface Language:",settingsLabelCloseOnHCaptcha:"Close Tab on hCaptcha:",hCaptchaDetectedLog:"hCaptcha detected!",attemptingTabCloseLog:"Setting enabled - Attempting to close tab...",tabCloseErrorLog:"Error attempting to close tab (may be blocked by browser):",tooltipInterfaceLang:"Select the language for the Aquila Prime interface.",tooltipBuyPauseDuration:"Time (in minutes) the buying mode will be paused when clicking the 'Pause' button. Functionality will automatically resume after this period.",tooltipSellPauseDuration:"Time (in minutes) the selling mode will be paused when clicking the 'Pause' button. Functionality will automatically resume after this period.",tooltipCloseOnHCaptcha:"If checked, the script will attempt to automatically close the browser tab if an hCaptcha challenge is detected on this page.",statusLabel:"Status:",premiumExchange:"Premium Exchange",pausedUntil:"Paused until {{time}}",pauseDurationSet:"{{mode}} Pause set for {{duration}} minute(s).",pauseExpired:"{{mode}} Pause expired. Functionality reactivated.",statusResumedManually:"{{mode}} manually resumed.",setPauseDurationError:"Set a pause duration (> 0) in settings.",buy:"Buying",sell:"Selling"}}}},T=window.i18next;if(T.isInitialized){T.addResourceBundle("pt","translation",w.resources.pt.translation,!0,!0),T.addResourceBundle("ru","translation",w.resources.ru.translation,!0,!0),T.addResourceBundle("en","translation",w.resources.en.translation,!0,!0);let P=localStorage.getItem("language")||"pt";T.language!==P&&T.changeLanguage(P).catch(e=>console.error("Erro ao mudar l\xedngua no i18next j\xe1 inicializado:",e))}else T.init({lng:localStorage.getItem("language")||"pt",fallbackLng:"en",resources:w.resources,debug:!1,interpolation:{escapeValue:!1}}).then(()=>{}).catch(e=>{console.error("Erro ao inicializar i18next:",e)});T.init({lng:localStorage.getItem("language")||"pt",fallbackLng:"en",resources:w.resources,debug:!1});let S=new Map,D={wood:0,stone:0,iron:0};function I(e,t){let a=`#${t}.res`;"stone"===t&&(a="#stone");let o=e.querySelector(a);if(!o)return 0;{let r=o.textContent,n=r.trim(),i=v.parseInt(n.replace(/\D/g,""),10);return i||0}}function F(){if("undefined"!=typeof TribalWars&&TribalWars.getGameData){let e=TribalWars.getGameData().village,t=e.storage_max||1e3;return t}let a=document.querySelector("#storage");if(!a)return 1e3;let o=a.textContent.trim(),r=o.split("/");if(r.length>=2){let n=W(r[1]);return n}return 1e3}async function M(){let e=TribalWars.getGameData().village.id,t=`https://${window.location.host}/game.php?village=${e}&screen=overview`,a=await C(t);if(a){let o=new DOMParser,r=o.parseFromString(a,"text/html");D.wood=I(r,"wood"),D.stone=I(r,"stone"),D.iron=I(r,"iron")}q.storageCapacity=F()}class R{constructor(e,t){this.name=e,this.config=t,this.elementCache=new Map}getDomElement(e){if(!this.elementCache.has(e)){let t=document.querySelector(e);return this.elementCache.set(e,t),t}return this.elementCache.get(e)}sanitizeNumber(e){return v.parseInt(e,10)||0}getStock(){return this.sanitizeNumber(this.getDomElement(this.config.stockSelector)?.textContent.trim())}getGameRate(){return this.sanitizeNumber(this.getDomElement(this.config.rateSelector)?.textContent.trim().replace(/\D/g,""))}getUserRate(){return this.sanitizeNumber(this.config.uiRateInput?.value)}getTotal(){return D[this.name]}getReserved(){return this.sanitizeNumber(this.config.uiReserveInput?.value)}getMarketValue(){let e=this.getDomElement(this.config.marketImg);if(!e)return 0;let t=e.parentElement?.textContent.trim();return t&&this.sanitizeNumber(t.replace(/[^0-9]/g,""))||0}getReserveRate(){return this.sanitizeNumber(this.config.uiReserveRateInput?.value)}getBuyInput(){return this.getDomElement(this.config.buyInputSelector)}getSellInput(){return this.getDomElement(this.config.sellInputSelector)}}let B=(e,t)=>({stockSelector:`#premium_exchange_stock_${e}`,rateSelector:`#premium_exchange_rate_${e} > div:nth-child(1)`,buyInputSelector:`input.premium-exchange-input[data-resource="${e}"][data-type="buy"]`,sellInputSelector:`input.premium-exchange-input[data-resource="${e}"][data-type="sell"]`,totalSelector:`#${e}.res`,marketImg:`.premium-exchange-sep img[src*="${e}_18x16"]`,outputDefault:t}),L={wood:B("wood",39),stone:B("stone",46),iron:B("iron",63)},q=A.observable({resources:{storageCapacity:1e3,wood:0,stone:0,iron:0},incomingResources:{wood:0,stone:0,iron:0},marketRates:{},transactions:[],buyModeActive:"true"===localStorage.getItem("buyModeActive"),sellModeActive:"true"===localStorage.getItem("sellModeActive"),buyPausedUntil:null,sellPausedUntil:null,buyPauseDurationMinutes:5,sellPauseDurationMinutes:5,hasExecutedBuy:!1,hasExecutedSell:!1,reloadPending:!1,autoReloadOnError:!0,closeTabOnHCaptcha:!1,isDarkMode:window.matchMedia("(prefers-color-scheme: dark)").matches,currentVillage:null,worldProfit:0,language:localStorage.getItem("language")||"pt",optimizedRates:A.computed(function(){return this.marketRates||{}}),rateHistory:{wood:[],stone:[],iron:[]},marketTrends:{wood:"neutral",stone:"neutral",iron:"neutral"},marketVolatility:{wood:0,stone:0,iron:0},lastUpdate:{wood:null,stone:null,iron:null},marketConditions:A.computed(function(){return{wood:{trend:this.marketTrends.wood,volatility:this.marketVolatility.wood,lastUpdate:this.lastUpdate.wood},stone:{trend:this.marketTrends.stone,volatility:this.marketVolatility.stone,lastUpdate:this.lastUpdate.stone},iron:{trend:this.marketTrends.iron,volatility:this.marketVolatility.iron,lastUpdate:this.lastUpdate.iron}}}),allTransactionsFetched:!1,isUpdating:!1,isSettingsModalOpen:!1,isMinimized:!1}),z=null,U=null,O={elements:new Map,buyInputs:new Map,sellInputs:new Map,gameElements:new Map,getElement(e){if(!this.elements.has(e)){let t=S.get(e);if(t)return this.elements.set(e,t),t;let a=document.querySelector(`#${e}`);return a&&(this.elements.set(e,a),S.set(e,a)),a}return this.elements.get(e)}},N=(e,t={})=>{let a=Object.assign(document.createElement(e),t);return t.id&&S.set(t.id,a),a};function G(){let e=document.getElementById("transactionsModal"),t=document.getElementById("aiModal"),a=document.getElementById("settingsModal");return e&&"flex"===e.style.display||t&&"flex"===t.style.display||a&&"flex"===a.style.display}let H=e=>{let t=O.elements.get("tooltip");if(!t){console.error("[Tooltip] Elemento tooltip n\xe3o encontrado!");return}let a=O.elements.get("market-container");if(!a){console.error("[Tooltip] Container principal n\xe3o encontrado!");return}let o=e.target,r=o.dataset.tooltipKey,n=o.dataset.tooltip,i="",s={};if(r)i=T.t(r,{defaultValue:`Tooltip: ${r}`});else{if(!(n&&o.classList.contains("rate-input")))return;i=T.t(n,{defaultValue:`Tooltip base: ${n}`});let u=o.dataset.resource||"",l="resource",$=u.match(/(wood|stone|iron)/);$&&$[1]&&(l=$[1]);let c=T.t(`resourceNames.${l}`,{defaultValue:l});s={resource:c}}let d=i;if(Object.keys(s).length>0&&i.includes("{{"))try{d=T.t(i,s)}catch(p){console.error(`[Tooltip] Erro na interpola\xe7\xe3o manual de '${i}' com`,s,p),d=i}!d||d.startsWith("Tooltip:")||d.startsWith("Tooltip base:"),t.innerHTML=d,t.style.display="block";let m=o.getBoundingClientRect(),g=a.getBoundingClientRect(),f=t.offsetWidth,h=t.offsetHeight,b=m.top-g.top,x=m.left-g.left,_=x+5,y=b+m.height+5;_+f>a.clientWidth-10&&(_=a.clientWidth-f-10),_<10&&(_=10),y+h>a.clientHeight-10&&(y=b-h-5),y<10&&(y=10),t.style.left=`${Math.max(0,_)}px`,t.style.top=`${Math.max(0,y)}px`},V=e=>{let t=O.elements.get("tooltip");if(!t||!t.style.display||"none"===t.style.display)return;let a=O.elements.get("market-container");if(!a)return;let o=e.target,r=o.getBoundingClientRect(),n=a.getBoundingClientRect(),i=t.offsetWidth,s=t.offsetHeight,u=r.top-n.top,l=r.left-n.left,$=l+5,c=u+r.height+5;$+i>a.clientWidth-10&&($=a.clientWidth-i-10),$<10&&($=10),c+s>a.clientHeight-10&&(c=u-s-5),c<10&&(c=10),t.style.left=`${Math.max(0,$)}px`,t.style.top=`${Math.max(0,c)}px`},j=()=>{let e=O.elements.get("tooltip");e&&(e.style.display="none")},W=e=>v.parseInt(e,10)||0,X=(e,t,a,o)=>{let r={"wood-stock":"stockDesiredTooltip","stone-stock":"stockDesiredTooltip","iron-stock":"stockDesiredTooltip",wood:"userRateTooltip",stone:"userRateTooltip",iron:"userRateTooltip","buy-per-time":"buyPerTimeTooltip","storage-limit":"buyPerTimeTooltip","max-spend":"buyPerTimeTooltip","reserve-wood":"reserveAmountTooltip","reserve-stone":"reserveAmountTooltip","reserve-iron":"reserveAmountTooltip","reserve-wood-rate":"reserveRateTooltip","reserve-stone-rate":"reserveRateTooltip","reserve-iron-rate":"reserveRateTooltip","sell-limit":"sellLimitTooltip","sell-limit-stone":"sellLimitTooltip","sell-limit-iron":"sellLimitTooltip"},n=(e,a)=>{if("buy"===t){if(0===a)return r[`${e}-stock`];if(1===a)return r[e];if(2===a&&"buy-per-time"===o[2].key)return r["buy-per-time"];if(2===a&&"storage-limit"===o[2].key)return r["storage-limit"];if(2===a&&"max-spend"===o[2].key)return r["max-spend"]}else if("sell"===t){if(0===a)return r[`reserve-${e}`];if(1===a)return r[`reserve-${e}-rate`];if(2===a&&"sell-limit"===o[2].key)return r["sell-limit"];if(2===a&&"sell-limit-stone"===o[2].key)return r["sell-limit-stone"];if(2===a&&"sell-limit-iron"===o[2].key)return r["sell-limit-iron"]}};return`
    <div class="resource-card base-card" data-resource="${e}">
        <img src="${a}" alt="${e}" />
        <input type="number" class="rate-input"
               data-resource="${"buy"===t?`${e}-stock`:`reserve-${e}`}"
               data-tooltip="${n(e,0)}"
               placeholder="${o[0]}">

        <span>${"buy"===t?"↑":"↓"}</span>

        <input type="number" class="rate-input"
               data-resource="${"buy"===t?e:`reserve-${e}-rate`}"
               data-tooltip="${n(e,1)}"
               placeholder="${o[1]}">

        <div class="num-input">
            <img src="https://dsus.innogamescdn.com/asset/95eda994/graphic/items/resources.png" alt="Resources" class="resource-icon" />
            <input type="number" class="rate-input"
                   data-resource="${"buy"===t?o[2].key:`sell-limit${"wood"===e?"":`-${e}`}`}"
                   data-tooltip="${n(e,2)}"
                   placeholder="${o[2].value}">
        </div>
    </div>
  `},K=(e,t,a="black-btn",o={})=>{let r="";for(let n in o)if(Object.hasOwnProperty.call(o,n)){let i=String(o[n]).replace(/"/g,'"');r+=` ${n}="${i}"`}return`<button class="${a||""}" id="${e}"${r}>${t}</button>`},J=async e=>(console.warn("[Gemini API] Chave API n\xe3o configurada. Chamada ignorada."),"Erro: Chave da API Gemini n\xe3o configurada no script."),Y=()=>{let e=N("div",{className:"market-container draggable",style:"position: fixed; top: 50px; left: 50px; z-index: 2147483647; overflow: hidden;"});S.set("market-container",e),O.elements.set("market-container",e),e.innerHTML=`
        <div class="market-container">
            <div class="header">
                <h2 id="headerTitle">${T.t("title")}</h2>
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
                        ${K("aiAssistantBtn",'<i class="fa-solid fa-robot"></i>',"icon-btn",{"data-tooltip-key":"tooltipAIAssistant"})}
                    </div>
                    <div class="btn-group-right">
                        ${K("minimizeButton",'<i class="fa-solid fa-window-minimize"></i>',"icon-btn",{"data-tooltip-key":"tooltipMinimize"})}
                        ${K("settingsBtn",'<i class="fa-solid fa-gear"></i>',"icon-btn",{"data-tooltip-key":"tooltipSettings"})}
                    </div>
                </div>
            </div>
            <div class="sections">
                <div class="section buy" id="buySection">

                    <h3 style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                        <span>
                           <span id="buyStatusLabel">${T.t("statusLabel")}</span>
                           <span class="status" id="buyStatus">${T.t(q.buyModeActive?"activated":"deactivated")}</span>
                        </span>
                        <div class="premium-input-wrapper" data-tooltip-key="tooltipPremiumLimit">
                            <span class="icon header premium"></span>
                            <input type="number" id="premiumPointsInput" placeholder="PP">
                        </div>
                    </h3>


                    <div class="sortable-container" id="buySortable">
                        ${X("wood","buy","https://dsus.innogamescdn.com/asset/95eda994/graphic/premium/features/WoodProduction_large.png",["200","2000",{key:"buy-per-time",value:"5000"}])}
                        ${X("stone","buy","https://dsus.innogamescdn.com/asset/95eda994/graphic/premium/features/StoneProduction_large.png",["200","2000",{key:"storage-limit",value:"5000"}])}
                        ${X("iron","buy","https://dsus.innogamescdn.com/asset/95eda994/graphic/premium/features/IronProduction_large.png",["200","2000",{key:"max-spend",value:"5000"}])}
                    </div>


                                    <div class="buttons buy-buttons">
                    ${K("buyModeToggle",T.t(q.buyModeActive?"buyModeToggleOn":"buyModeToggleOff"),"black-btn toggle-btn")}
                    ${K("buyPause",`<i class="fas fa-pause"></i> ${T.t("pause")}`,"black-btn",{"data-tooltip-key":"tooltipPauseBuy"})}
                    <span class="spinner" id="buySpinner" style="display: none;"></span>
                </div>

                </div>



                <div class="section sell" id="sellSection">

                    <h3><span id="sellStatusLabel">${T.t("statusLabel")}</span> <span class="status" id="sellStatus">${T.t(q.sellModeActive?"activated":"deactivated")}</span></h3>
                    <div class="sortable-container" id="sellSortable">
                        ${X("wood","sell","https://dsus.innogamescdn.com/asset/95eda994/graphic/premium/features/WoodProduction_large.png",["1000","64",{key:"sell-limit",value:"200"}])}
                        ${X("stone","sell","https://dsus.innogamescdn.com/asset/95eda994/graphic/premium/features/StoneProduction_large.png",["1000","64",{key:"sell-limit-stone",value:"200"}])}
                        ${X("iron","sell","https://dsus.innogamescdn.com/asset/95eda994/graphic/premium/features/IronProduction_large.png",["1000","64",{key:"sell-limit-iron",value:"200"}])}
                    </div>
                    <div class="buttons">
                        ${K("sellModeToggle",T.t(q.sellModeActive?"sellModeToggleOn":"sellModeToggleOff"),"black-btn toggle-btn")}
                        ${K("sellPause",`<i class="fas fa-pause"></i> ${T.t("pause")}`,"black-btn",{"data-tooltip-key":"tooltipPauseSell"})}
                        <span class="spinner" id="sellSpinner" style="display: none;"></span>
                    </div>
                </div>
            </div>
            <div class="footer">
                <div class="footer-buttons-row">
                    ${K("resetAll",`\u21BB ${T.t("resetAll")}`,"black-btn")}
                    ${K("transactionsBtn",T.t("transactions"),"black-btn",{"data-tooltip-key":"tooltipTransactions"})}
                    ${K("saveConfig",`<i class="fa-solid fa-floppy-disk"></i> ${T.t("saveConfig")}`,"black-btn",{"data-tooltip-key":"tooltipSaveConfig"})}
                </div>
            </div>

             <!-- MODAL TRANSA\xc7\xd5ES (Conte\xfado completo) -->
            <div class="modal aquila-prime-modal" id="transactionsModal" style="display: none; z-index: 50;">
                <div class="modal-content aquila-prime-panel">
                    <h3 class="aquila-modal-header">
                        <span class="aquila-icon">
                           <img src="https://raw.githubusercontent.com/C7696/ragnarokcompra-e-venda/refs/heads/main/erasebg-transformed.ico" alt="Aquila Icon" style="height: 24px; width: 24px; display: block;">
                        </span>
                        <span data-i18n-key="transactionsHeader">${T.t("transactionsHeader")}</span>
                    </h3>
                    <div class="modal-scrollable-body">
                       <div id="filterSection"></div>
                       <div id="filteredProfitSummary" class="filtered-profit-summary" style="display: none;"></div>
                       <div id="transactionsTableContainer"></div>
                       <div class="aquila-chart" id="transactionsChartContainer">
                          <canvas id="transactionsChart"></canvas>
                       </div>
                    </div>
                    <div class="modal-footer-controls">
                       <div id="paginationControls"></div>
                       <div>
                         ${K("closeModal",T.t("close"),"aquila-btn")}
                       </div>
                    </div>
                 </div>
            </div>

            <!-- MODAL IA (Conte\xfado completo) -->
            <div class="modal" id="aiModal" style="display: none; z-index: 50;">
                 <div class="modal-content">
                  <h3 data-i18n-key="aiAssistant">${T.t("aiAssistant")}</h3>
                  <div style="padding: 20px; flex-grow: 1; overflow-y: auto;">
                        <textarea id="aiPrompt" data-i18n-key="aiPrompt" placeholder="${T.t("aiPrompt")}" rows="4" style="width: 100%; margin-bottom: 10px;"></textarea>
                        <div id="aiResponse" style="margin-bottom: 10px; min-height: 50px; background: rgba(0,0,0,0.1); padding: 10px; border-radius: 4px; border: 1px solid #303848;"></div>
                  </div>
                  <div style="padding: 15px 20px; border-top: 1px solid #303848; text-align: center;">
                        ${K("submitAI","Enviar","aquila-btn")}
                        ${K("closeAIModal",T.t("close"),"aquila-btn")}
                  </div>
                </div>
            </div>


            <div class="modal aquila-modal" id="settingsModal" style="display: none; z-index: 50;">
                 <div class="modal-content settings-content aquila-panel">
                    <div class="settings-header aquila-header">
                       <span class="aquila-icon">
                          <img src="https://raw.githubusercontent.com/C7696/ragnarokcompra-e-venda/refs/heads/main/erasebg-transformed.ico" alt="Aquila Icon" style="height: 24px; width: 24px; display: block;">
                       </span>
                       <h3 data-i18n-key="settings">Configura\xe7\xf5es Aquila</h3>
                       <button id="closeSettingsModal" class="close-btn aquila-close-btn">\xd7</button>
                    </div>
                    <div class="settings-body aquila-body">

                       <div class="settings-section aquila-section user-info-section">
                          <h4 data-i18n-key="settingsSectionAccount"><i class="fas fa-user-astronaut"></i> Status Operacional</h4>
                           <div class="info-row aquila-info-item">
                             <span class="info-label aquila-label" data-i18n-key="settingsLabelPlayer"><i class="fas fa-user-circle"></i> Operador:</span>
                             <span class="info-value aquila-value" id="settingsPlayerName">--</span>
                          </div>
                          <div class="info-row aquila-info-item">
                              <span class="info-label aquila-label" data-i18n-key="settingsLabelLicense"><i class="fas fa-calendar-check"></i> Validade da Licen\xe7a:</span>
                              <span class="info-value aquila-value" id="settingsLicenseExpiry">--</span>
                          </div>
                           <div class="info-row aquila-info-item">
                              <span class="info-label aquila-label" data-i18n-key="settingsLabelVersion"><i class="fas fa-code-branch"></i> Vers\xe3o do Protocolo:</span>
                              <span class="info-value aquila-value" id="settingsScriptVersion">--</span>
                          </div>
                       </div>

                       <div class="settings-section aquila-section language-settings">
                           <h4 data-i18n-key="settingsSectionLanguage"><i class="fas fa-globe-americas"></i> Interface & Idioma</h4>
                           <div class="setting-item aquila-setting-item">
                                <label for="languageSelect" class="aquila-label" data-i18n-key="settingsLabelInterfaceLang"><i class="fas fa-language"></i> Idioma T\xe1tico:</label>
                                <select id="languageSelect" class="aquila-select"></select>
                                <span class="tooltip-icon" data-tooltip-key="tooltipInterfaceLang"><i class="fas fa-info-circle"></i></span>
                           </div>
                       </div>

                       <div class="settings-section aquila-section general-settings">
                           <h4 data-i18n-key="settingsSectionGeneral"><i class="fas fa-sliders-h"></i> Par\xe2metros Gerais</h4>

                           <div class="setting-item aquila-setting-item checkbox-item">
                               <input type="checkbox" class="settings-checkbox aquila-checkbox" id="closeOnHCaptchaInput">
                               <label for="closeOnHCaptchaInput" class="aquila-label checkbox-label" data-i18n-key="settingsLabelCloseOnHCaptcha"><i class="fas fa-window-close"></i> Fechar Aba no hCaptcha:</label>
                               <span class="tooltip-icon" data-tooltip-key="tooltipCloseOnHCaptcha"><i class="fas fa-info-circle"></i></span>
                           </div>
                       </div>


                       <div class="settings-section aquila-section pause-settings">
                           <h4 data-i18n-key="settingsSectionPause"><i class="fas fa-hourglass-half"></i> Configura\xe7\xf5es de Pausa</h4>
                           <div class="setting-item aquila-setting-item">
                               <label for="buyPauseDurationInput" class="aquila-label" data-i18n-key="settingsLabelBuyPauseDuration">
                                   <i class="fas fa-shopping-cart"></i><i class="fas fa-pause-circle" style="margin-left: 4px; opacity: 0.7;"></i> Dura\xe7\xe3o Pausa Compra (min):
                               </label>
                               <input type="number" class="settings-input aquila-input number-input" id="buyPauseDurationInput" min="1" step="1" placeholder="5">
                               <span class="tooltip-icon" data-tooltip-key="tooltipBuyPauseDuration"><i class="fas fa-info-circle"></i></span>
                           </div>
                           <div class="setting-item aquila-setting-item">
                               <label for="sellPauseDurationInput" class="aquila-label" data-i18n-key="settingsLabelSellPauseDuration">
                                    <i class="fas fa-dollar-sign"></i><i class="fas fa-pause-circle" style="margin-left: 4px; opacity: 0.7;"></i> Dura\xe7\xe3o Pausa Venda (min):
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
    `;let t=e.querySelector("#aquilaTooltip");t&&O.elements.set("tooltip",t),document.body.appendChild(e);let a=N("div",{id:"notification",className:"notification",style:"display: none; opacity: 0;"});document.body.appendChild(a),S.set("notification",a),O.elements.set("notification",a);let o=N("div",{id:"minimizedMarketBox",className:"minimized-box"});document.body.appendChild(o),O.elements.set("minimizedMarketBox",o);let r="true"===localStorage.getItem("isMinimized");void 0!==q&&(q.isMinimized=r),e.style.display=r?"none":"block",o.style.display=r?"flex":"none","function"==typeof Q&&Q(e),"function"==typeof Z&&Z();try{let n=JSON.parse(localStorage.getItem("marketContainerPosition"));n&&n.left&&n.top&&(e.style.left=n.left,e.style.top=n.top)}catch(i){localStorage.removeItem("marketContainerPosition")}},Q=e=>{let t=!1,a,o,r=null,n,i,s=!1;e.addEventListener("mousedown",r=>{t=!0;let n=e.getBoundingClientRect();a=r.clientX-n.left,o=r.clientY-n.top,e.style.cursor="grabbing"}),document.addEventListener("mouseup",()=>{t&&(t=!1,e.style.cursor="move",cancelAnimationFrame(r),e.style.left&&e.style.top&&localStorage.setItem("marketContainerPosition",JSON.stringify({left:e.style.left,top:e.style.top})))}),document.addEventListener("mousemove",u=>{if(!t||s)return;s=!0;let l=u.clientX-a,$=u.clientY-o,c=window.innerWidth-e.offsetWidth-10,d=window.innerHeight-e.offsetHeight-10;n=Math.max(0,Math.min(l,c)),i=Math.max(0,Math.min($,d));let p=()=>{r=requestAnimationFrame(()=>{t&&(e.style.left=`${n}px`,e.style.top=`${i}px`,p())})};p(),u.preventDefault(),setTimeout(()=>s=!1,16)}),e.addEventListener("mouseleave",()=>{t&&(t=!1,e.style.cursor="move",cancelAnimationFrame(r))})},Z=()=>{if("undefined"==typeof Sortable)return;let e=document.getElementById("buySortable"),t=document.getElementById("sellSortable");new Sortable(e,{animation:150,handle:".resource-card",onEnd(e){}}),new Sortable(t,{animation:150,handle:".resource-card",onEnd(e){}})},ee=()=>window.location.hostname.split(".")[0],et=()=>{if("undefined"!=typeof TribalWars&&TribalWars.getGameData){let e=TribalWars.getGameData().village;if(e){q.currentVillage={name:e.name,coordinates:e.coord,world:ee()},O.getElement("villageSelect").innerHTML=`<option value="current">${e.name} (${e.coord})</option>`;return}}q.currentVillage={name:"Desconhecido",coordinates:"N/A",world:ee()},O.getElement("villageSelect").innerHTML='<option value="current">Carregando...</option>'},ea=()=>(["headerTitle","worldProfit","buyModeToggle","sellModeToggle","saveConfig","resetAll","transactionsBtn","aiAssistantBtn","settingsBtn","languageSelect","villageSelect","buyStatus","sellStatus","buyPause","sellPause","buySpinner","sellSpinner","notification","transactionsModal","transactionsTableContainer","filterSection","paginationControls","transactionsChart","closeModal","aiModal","aiPrompt","aiResponse","submitAI","closeAIModal","minimizeButton","minimizedMarketBox","settingsModal","closeSettingsModal","premiumPointsInput"].forEach(e=>{let t=document.querySelector(`#${e}`);t&&(O.elements.set(e,t),S.set(e,t))}),O.elements.set("inputs",Array.from(document.querySelectorAll(".rate-input"))),O.elements.set("buyPerTimeInput",document.querySelector('.rate-input[data-resource="buy-per-time"]')),O.elements.set("storageLimitInput",document.querySelector('.rate-input[data-resource="storage-limit"]')),O.elements.set("maxSpendInput",document.querySelector('.rate-input[data-resource="max-spend"]')),O.elements.set("sellLimitInput",document.querySelector('.rate-input[data-resource="sell-limit"]')),Array.from(O.elements.values()).every(e=>null!==e)),eo=()=>{let e=Object.keys(L).reduce((e,t)=>{let a={...L[t]};return a.uiRateInput=document.querySelector(`.rate-input[data-resource="${t}"]`),a.uiReserveInput=document.querySelector(`.rate-input[data-resource="reserve-${t}"]`),a.uiReserveRateInput=document.querySelector(`.rate-input[data-resource="reserve-${t}-rate"]`),e[t]=new R(t,a),e},{});return Object.keys(e).forEach(t=>{O.buyInputs.set(t,e[t].getBuyInput()),O.sellInputs.set(t,e[t].getSellInput());let a=O.buyInputs.get(t);a&&!a.dataset.default&&(a.dataset.default="1000")}),e},er=()=>{O.gameElements.set("merchants",document.querySelector("#market_merchant_available_count")),O.gameElements.set("merchants",document.querySelector("#market_merchant_available_count")),O.gameElements.set("calculateButton",document.querySelector("input.btn-premium-exchange-buy")),O.gameElements.set("sellButton",document.querySelector("#premium_exchange_form > input"))},en=()=>{q.reloadPending||(q.reloadPending=!0,console.warn(`${t}: Agendando recarregamento da p\xe1gina em 2 segundos devido a um erro...`),setTimeout(()=>{window.location.reload()},2e3))},ei=(e,t="success",a=3e3)=>{let o=O.getElement("notification");o.textContent=e,o.className=`notification ${t}`,o.style.display="block",o.style.opacity="1",setTimeout(()=>{o.style.opacity="0",setTimeout(()=>o.style.display="none",500)},a)},es=e=>ei(e,"success"),eu=e=>ei(e,"error"),el=()=>{q.isDarkMode=window.matchMedia("(prefers-color-scheme: dark)").matches;let e=S.get("market-container");e.classList.toggle("dark",q.isDarkMode),e.classList.toggle("light",!q.isDarkMode)};window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",el);let e$=e=>{q[e]=!q[e],localStorage.setItem(e,q[e]),q.hasExecutedBuy=("buyModeActive"!==e||!!q[e])&&q.hasExecutedBuy,q.hasExecutedSell=("sellModeActive"!==e||!!q[e])&&q.hasExecutedSell,eK(),q[e]?"buyModeActive"===e?eG():eN():"buyModeActive"===e&&e6()},ec=!1,ed={},e2=async()=>{try{let{transactions:e}=await em(1);if(0===e.length)return!1;let t=e[0].date,a=ed[u];if(!a||0===a.length)return!0;let o=a[0].date;return t>o}catch(r){return console.error("[checkForUpdates] Erro ao verificar atualiza\xe7\xf5es:",r),!0}},ep=async()=>{let e=[],t=1,a=null;try{let{transactions:o,doc:r}=await em(t);o&&o.length>0&&e.push(...o);let n=r.querySelectorAll("a[href*='page=']"),i=1;n.forEach(e=>{let t=e.getAttribute("href"),a=t?.match(/page=(\d+)/);if(a&&a[1]){let o=v.parseInt(a[1],10);isNaN(o)||(i=Math.max(i,o+1))}}),a=i}catch(s){return console.error(`[fetchAllPages] Erro ao buscar/processar p\xe1gina 1:`,s),ec=!1,[]}for(;t<a;){t++;try{let{transactions:l}=await em(t);if(l&&l.length>0)e.push(...l);else break}catch($){console.error(`[fetchAllPages] Erro ao buscar p\xe1gina ${t}:`,$);break}await new Promise(e=>setTimeout(e,250))}e.length>0&&e.sort((e,t)=>{let a=e.date instanceof Date?e.date.getTime():0,o=t.date instanceof Date?t.date.getTime():0;return isNaN(a)||isNaN(o)?0:o-a});try{let c=`ragnarokMarketTransactions_${u}`;localStorage.setItem(c,JSON.stringify(e)),ed[u]=e}catch(d){console.error(`[fetchAllPages] Erro ao salvar logs para ${u}:`,d)}return ec=!1,e},em=async(e=1)=>{let t=TribalWars.getGameData?TribalWars.getGameData():{},a=t.village?.id||null;if(!a)throw Error("ID da vila n\xe3o encontrado no gameData");let o=`${window.location.origin}/game.php?village=${a}&screen=premium&mode=log`,r=1===e?o:`${o}&page=${e-1}`;try{let n=await C(r);if(!n)throw Error("Falha ao buscar logs premium");let i=new DOMParser().parseFromString(n,"text/html"),s=i.querySelector("#content_value");if(!s)throw Error("N\xe3o foi poss\xedvel encontrar o elemento #content_value");let u=null,l=s.querySelectorAll("table");for(let $ of l){let c=Array.from($.querySelectorAll("th")).map(e=>e.textContent.trim().toLowerCase());if(c.some(e=>e.includes("date")||e.includes("data"))&&c.some(e=>e.includes("world")||e.includes("mundo"))&&c.some(e=>e.includes("transaction")||e.includes("transa\xe7\xe3o"))){u=$;break}}let d=[];if(u){let p=Array.from(u.querySelectorAll("tr")).slice(1);d=e1(p)}return{transactions:d,doc:i}}catch(m){throw m}},eg=e=>{if(!e||"string"!=typeof e)return new Date(NaN);let t=null;for(let a of["en-US","pt-BR","ru"])if((t=E.fromFormat(e,"LLL dd, HH:mm",{locale:a})).isValid)break;if(!t||!t.isValid)return new Date(NaN);let o=E.now(),r=t.set({year:o.year});return r>o&&(r=r.set({year:o.year-1})),r.toJSDate()},e1=e=>{let t=[],a=window.location.hostname.includes("tribalwars.com.br")?"br":"us";return e.forEach(e=>{let o=e.querySelectorAll("td");if(o.length>=6){let r=eg(o[0].textContent.trim());if(isNaN(r.getTime()))return;let n=o[1].textContent.trim(),i=n.match(/(\d+)$/),s=n;if(i){let u=i[1];s=`${a}${u}`}let l=o[2].textContent.trim(),$=o[3].textContent.trim().match(/[-+]?\d+(?:\.\d+)?/),c=o[4].textContent.trim().match(/\d+/),d=l,p=$&&parseFloat($[0])||0;"Points redeemed"===l||"Pontos resgatados"===l||"Utilizado"===l?(d="Despesa",p=-Math.abs(p)):("Transfer"===l||"Transfer\xeancia"===l)&&(d=p<0?"Despesa":"Lucro"),t.push({date:r,type:d,change:Math.floor(p),newPremiumPoints:c&&v.parseInt(c[0],10)||0,world:s})}}),t.sort((e,t)=>t.date-e.date)},ef=()=>{if(!q.transactions||!q.currentVillage?.world)return 0;let e=q.transactions.filter(e=>e.world===q.currentVillage.world),t=e.filter(e=>e.change<0||"Despesa"===e.type).reduce((e,t)=>e+Math.abs(t.change),0),a=e.filter(e=>e.change>0||"Lucro"===e.type).reduce((e,t)=>e+t.change,0);return Math.floor(a-t)},eh=(e,t)=>{if(!e)return[];let{dateFrom:a,dateTo:o,worldFilter:r}=t;return v.filter(e,e=>{if(isNaN(e.date.getTime()))return!1;let t=a?new Date(a):null,n=o?new Date(o):null,i=(!t||e.date>=t)&&(!n||e.date<=n),s=!0;return r&&(s=e.world.toLowerCase().includes(r.toLowerCase().trim())),i&&s})},eb=(e,t,a)=>v.orderBy(e,[t],[a]),ex=(e,t,a=10)=>{let o=(t-1)*a;return v.slice(e,o,o+a)},e_=(e,t="date",a="desc",o=1,r=10)=>{let n=e.filter(e=>e.change<0||"Despesa"===e.type),i=e.filter(e=>e.change>0||"Lucro"===e.type),s=Math.floor(n.reduce((e,t)=>e+Math.abs(t.change),0)),u=Math.floor(i.reduce((e,t)=>e+t.change,0)),l=eb(n,t,a),$=eb(i,t,a),c=[{type:"header",label:T.t("expenses")},...l.map(e=>({...e,rowType:"expense"})),{type:"header",label:T.t("sales")},...$.map(e=>({...e,rowType:"income"})),{type:"summary",label:`${T.t("profit")}: <span class="icon header premium"></span> ${Math.floor(u-s)}`}],d=c.length,p=d>0?Math.ceil(d/r):1,m=ex(c,o,r),g=O.getElement("transactionsTableContainer");if(!g){console.error("Aquila Prime: Container da tabela (#transactionsTableContainer) n\xe3o encontrado.");return}g.innerHTML=`
        <table class="ledger-table aquila-table">
            <thead>
                <tr>
                    <th data-sort="date"><i class="fas fa-clock"></i> ${T.t("date")}</th>
                    <th data-sort="type"><i class="fas fa-exchange-alt"></i> ${T.t("type")}</th>
                    <th data-sort="change"><i class="fas fa-coins"></i> ${T.t("change")}</th>
                    <th data-sort="world"><i class="fas fa-globe"></i> ${T.t("world")}</th>
                </tr>
            </thead>
            <tbody id="transactionsTableBody">
                ${m.map(e=>{if("header"===e.type)return`<tr class="section-header-row"><td colspan="4" class="section-header">${e.label}</td></tr>`;if("summary"===e.type)return`<tr class="profit-summary-row"><td colspan="4">${e.label}</td></tr>`;if(e.date instanceof Date&&!isNaN(e.date.getTime())){let t="expense"===e.rowType?"expense-row":"income-row",a=e.date.toLocaleString(q.language||"pt-BR"),o=e.change<0?`(<span class="icon header premium"></span> ${Math.abs(e.change)})`:`<span class="icon header premium"></span> ${e.change}`;return`
                            <tr class="${t}">
                                <td>${a}</td>
                                <td>${e.type||"N/A"}</td>
                                <td>${o}</td>
                                <td>${e.world||"N/A"}</td>
                            </tr>`}return""}).join("")}
            </tbody>
        </table>
    `;let f=O.getElement("paginationControls");f&&(f.innerHTML=`
            <button class="aquila-btn" id="prevPage" ${o<=1?"disabled":""}><i class="fas fa-chevron-left"></i> ${T.t("previous")}</button>
            <span class="page-info">${T.t("page")} ${o} / ${p}</span>
            <button class="aquila-btn" id="nextPage" ${o>=p?"disabled":""}><i class="fas fa-chevron-right"></i> ${T.t("next")}</button>
        `,f.querySelector("#prevPage")?.addEventListener("click",()=>{o>1&&e_(e,t,a,o-1,r)}),f.querySelector("#nextPage")?.addEventListener("click",()=>{o<p&&e_(e,t,a,o+1,r)}));let h=O.getElement("transactionsChart");h&&e.length>0?(ev(e.sort((e,t)=>e.date-t.date)),h.style.display="block"):h&&(h.style.display="none"),g.querySelectorAll("th[data-sort]").forEach(o=>{o.addEventListener("click",()=>{let n=o.dataset.sort;e_(e,n,t===n&&"desc"===a?"asc":"desc",1,r)})})},ey=null,ev=async e=>{console.log("[DEBUG Aquila renderChart v8] Iniciada.");try{if(await (tr?Promise.resolve():tn||(console.log("[Chart.js Loader] Iniciando carregamento din\xe2mico..."),tn=new Promise((e,t)=>{GM_xmlhttpRequest({method:"GET",url:"https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js",timeout:1e4,onload:function(a){if(a.status>=200&&a.status<300){console.log("[Chart.js Loader] Script baixado com sucesso.");try{console.log("[Chart.js Loader] Tentando injetar script no <head>...");let o=document.createElement("script");o.textContent=a.responseText,o.setAttribute("data-chartjs-loaded","true");let r=document.querySelector('script[data-chartjs-loaded="true"]');r&&(r.remove(),console.log("[Chart.js Loader] Script antigo removido.")),document.head.appendChild(o),console.log("[Chart.js Loader] Script injetado no <head>."),setTimeout(()=>{"undefined"!=typeof Chart?(console.log("[Chart.js Loader] Chart.js carregado e 'Chart' definido globalmente com sucesso!"),tr=!0,tn=null,e()):(console.error("[Chart.js Loader] Script injetado, mas 'Chart' n\xe3o foi definido globalmente ap\xf3s atraso."),o.parentNode&&o.remove(),tn=null,t(Error("Falha ao definir Chart globalmente ap\xf3s inje\xe7\xe3o do script.")))},100)}catch(n){console.error("[Chart.js Loader] Erro durante a inje\xe7\xe3o do script Chart.js:",n),tn=null,t(n)}}else console.error(`[Chart.js Loader] Falha ao baixar Chart.js. Status: ${a.status}`),tn=null,t(Error(`Falha ao baixar Chart.js (Status: ${a.status})`))},onerror:function(e){console.error("[Chart.js Loader] Erro de rede ao baixar Chart.js:",e),tn=null,t(e)},ontimeout:function(){console.error("[Chart.js Loader] Timeout ao baixar Chart.js"),tn=null,t(Error("Timeout ao baixar Chart.js"))}})}))),"undefined"==typeof Chart)throw Error("Objeto Chart n\xe3o est\xe1 definido globalmente ap\xf3s carregamento.");console.log("[renderChart] Chart.js confirmado como carregado.")}catch(t){console.error("[renderChart] Erro cr\xedtico ao carregar/confirmar Chart.js:",t),eu("Falha ao carregar biblioteca do gr\xe1fico.");let a=O.getElement("transactionsChartContainer");a&&(a.style.display="none");return}let o=O.getElement("transactionsChartContainer");if(!o){console.error("[renderChart] ERRO: Container do gr\xe1fico #transactionsChartContainer n\xe3o encontrado!");return}let r=o.querySelector("canvas#transactionsChart");if(!r&&(console.warn("[renderChart] Canvas n\xe3o encontrado, recriando..."),o.innerHTML='<canvas id="transactionsChart"></canvas>',!(r=o.querySelector("canvas#transactionsChart")))){console.error("[renderChart] ERRO: Falha ao recriar o canvas!"),o.style.display="none";return}let n=r.getContext("2d");if(!n){console.error("[renderChart] ERRO: Contexto 2D n\xe3o obtido do canvas."),o.style.display="none";return}if(ey)try{ey.destroy(),console.log("[renderChart] Inst\xe2ncia anterior do gr\xe1fico destru\xedda.")}catch(i){console.warn("[renderChart] Erro ao destruir inst\xe2ncia anterior:",i)}finally{ey=null}if(e&&0!==e.length)o.style.display="block";else{console.log("[renderChart] Nenhuma transa\xe7\xe3o v\xe1lida para exibir no gr\xe1fico."),o.style.display="none";return}console.log("[renderChart] Preparando dados para o gr\xe1fico...");let s={};e.forEach(e=>{if(!(e.date instanceof Date)||isNaN(e.date.getTime()))return;let t=e.date.getUTCFullYear(),a=e.date.getUTCMonth(),o=e.date.getUTCDate(),r=`${t}-${String(a+1).padStart(2,"0")}-${String(o).padStart(2,"0")}`;if(!s[r]){let n=new Date(Date.UTC(t,a,o,0,0,0,0));s[r]={date:n,sales:0,expenses:0}}e.change>0?s[r].sales+=e.change:s[r].expenses+=Math.abs(e.change)});let u=Object.values(s).sort((e,t)=>e.date.getTime()-t.date.getTime()),l=u.map(e=>e.date.toLocaleDateString(q.language||"pt-BR",{day:"2-digit",month:"short",timeZone:"UTC"})),$=u.map(e=>e.sales),c=u.map(e=>e.expenses);console.log("[renderChart] Dados preparados:",{labels:l.length,sales:$.length,expenses:c.length});try{console.log("[renderChart] Criando nova inst\xe2ncia do Chart..."),ey=new Chart(n,{type:"bar",data:{labels:l,datasets:[{label:T.t("sales"),data:$,backgroundColor:"#81C784",borderColor:"#519657",borderWidth:1},{label:T.t("expenses"),data:c,backgroundColor:"#E57373",borderColor:"#B71C1C",borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,indexAxis:"x",scales:{x:{stacked:!0,title:{display:!0,text:T.t("date"),color:"#C0C0C0",font:{size:14,family:"'Poppins', sans-serif"}},ticks:{color:"#C0C0C0",font:{size:12}},grid:{display:!1}},y:{stacked:!0,title:{display:!0,text:T.t("change"),color:"#C0C0C0",font:{size:14,family:"'Poppins', sans-serif"}},ticks:{color:"#C0C0C0",font:{size:12},callback:e=>Math.abs(e)>=1e6?(e/1e6).toFixed(1)+" M":Math.abs(e)>=1e3?(e/1e3).toFixed(0)+" K":e.toLocaleString(q.language||"pt-BR")},grid:{color:"rgba(205, 127, 50, 0.15)",borderDash:[4,4]}}},plugins:{title:{display:!0,text:T.t("chartTitle"),color:"#CD7F32",font:{size:16,family:"'Cinzel', serif"},padding:{bottom:15}},legend:{display:!0,position:"bottom",labels:{color:"#C0C0C0",font:{size:13},boxWidth:15,padding:20}},tooltip:{backgroundColor:"rgba(10, 13, 20, 0.95)",titleFont:{family:"'Poppins', sans-serif",size:14},bodyFont:{family:"'Poppins', sans-serif",size:12},titleColor:"#CD7F32",bodyColor:"#C0C0C0",borderColor:"#CD7F32",borderWidth:1,cornerRadius:5,caretSize:6,padding:10,mode:"index",intersect:!1,callbacks:{label:function(e){let t=e.dataset.label||"";return t&&(t+=": "),null!==e.parsed.y&&(t+=e.parsed.y.toLocaleString(q.language||"pt-BR")),t}}}},interaction:{mode:"index",intersect:!1}}}),console.log("[renderChart] Nova inst\xe2ncia do gr\xe1fico criada com sucesso.")}catch(d){console.error("[renderChart] ERRO ao criar a nova inst\xe2ncia do Chart:",d),o.style.display="none",eu("Erro ao desenhar o gr\xe1fico."),ey=null}},eE=(e,t,a,o,r,n)=>{let i=O.getElement("filterSection"),s=O.getElement("transactionsTableContainer"),u=O.getElement("paginationControls"),l=O.getElement("transactionsChartContainer"),$=document.getElementById("filteredProfitSummary");if(!i||!s||!u||!l||!$){console.error("[DEBUG renderTransactionsModal v2] ERRO: Falha ao encontrar um ou mais elementos de CONTE\xdaDO interno (#filterSection, #transactionsTableContainer, #paginationControls, #transactionsChartContainer, #filteredProfitSummary).");return}i.innerHTML=`
        <div class="aquila-filter-grid">
            <div class="aquila-filter-item">
                <label for="dateFrom"><i class="fas fa-calendar-alt"></i> ${T.t("dateFrom")}</label>
                <input type="date" id="dateFrom" class="aquila-input" value="${t.dateFrom||""}">
            </div>
            <div class="aquila-filter-item">
                <label for="dateTo"><i class="fas fa-calendar-alt"></i> ${T.t("dateTo")}</label>
                <input type="date" id="dateTo" class="aquila-input" value="${t.dateTo||""}">
            </div>
            <div class="aquila-filter-item">
                <label for="worldFilter"><i class="fas fa-globe"></i> ${T.t("worldFilter")}</label>
                <input type="text" id="worldFilter" class="aquila-input" value="${t.worldFilter||""}" placeholder="${T.t("worldFilterPlaceholder",{defaultValue:"Ex: br118"})}">
            </div>
        </div>
    `;let c=v.debounce(()=>{let t={dateFrom:i.querySelector("#dateFrom")?.value||"",dateTo:i.querySelector("#dateTo")?.value||"",worldFilter:i.querySelector("#worldFilter")?.value||""},c=eh(e,t),d=0;if(c.length>0){try{let p=c.filter(e=>e.change>0).reduce((e,t)=>e+t.change,0),m=c.filter(e=>e.change<0).reduce((e,t)=>e+Math.abs(t.change),0);d=Math.floor(p-m)}catch(g){console.error("[DEBUG v2] Erro ao calcular lucro l\xedquido filtrado:",g),d="Erro"}let f=T.t("filteredPeriodProfitLabel",{defaultValue:"Lucro L\xedquido (Per\xedodo Selecionado)"});$.innerHTML=`${f}: <span class="icon header premium"></span> ${d}`,$.style.display="block",e_(c,a,o,r,n,t)}else $.style.display="none",s.innerHTML=`<p>${T.t("noTransactions")}</p>`,u&&(u.innerHTML=""),l&&(l.style.display="none"),ey&&(ey.destroy(),ey=null)},300);i.querySelectorAll("input").forEach(e=>e.addEventListener("input",c)),c()},e0=async()=>{if(!u){console.error("[showTransactions v3] Erro cr\xedtico: currentPlayerNickname n\xe3o definido!"),eu("N\xe3o foi poss\xedvel identificar o jogador atual para buscar o hist\xf3rico.");return}console.log(`[DEBUG showTransactions v3] Iniciada para ${u}.`);let e=O.getElement("transactionsModal"),t=O.getElement("transactionsTableContainer"),a=O.getElement("filterSection");if(e){if(e.style.display="flex",t&&!q.allTransactionsFetched){a&&(a.innerHTML="");let o=O.getElement("paginationControls");o&&(o.innerHTML="");let r=O.getElement("transactionsChartContainer");r&&(r.style.display="none");let n=document.getElementById("filteredProfitSummary");n&&(n.style.display="none"),t.innerHTML=`<p style="text-align:center; padding: 20px; font-style:italic;">${T.t("loadingInitialData",{defaultValue:"Carregando dados iniciais..."})}</p>`}console.log("[DEBUG showTransactions v3] Modal exibida.")}else{console.error("[DEBUG showTransactions v3] Erro CR\xcdTICO ao obter elemento da modal.");return}let i=q.transactions.length>0?A.toJS(q.transactions):ed[u]||[];if(0===i.length&&!q.allTransactionsFetched){console.log("[DEBUG showTransactions v3] Cache/State vazio e fetchAll=false, buscando p\xe1g 1 antes de renderizar...");try{await eA(!1),i=A.toJS(q.transactions),console.log(`[DEBUG showTransactions v3] P\xe1g 1 buscada, ${i.length} logs para render inicial.`)}catch(s){console.error("[DEBUG showTransactions v3] Erro ao buscar p\xe1g 1 inicial.",s),i=[],t&&(t.innerHTML=`<p style="text-align:center; padding: 20px; color: red;">${T.t("errorLoadingHistory",{defaultValue:"Erro ao carregar hist\xf3rico."})}</p>`)}}console.log(`[DEBUG showTransactions v3] Renderizando modal INICIALMENTE com ${i.length} logs.`),eE(i,{},"date","desc",1,10),q.allTransactionsFetched?(console.log("[DEBUG showTransactions v3] Todos os logs j\xe1 foram buscados anteriormente."),eE(i,{},"date","desc",1,10)):(console.log("[DEBUG showTransactions v3] Busca completa ainda n\xe3o realizada. Disparando fetchAndUpdateProfit(true) em segundo plano..."),eA(!0).then(e=>{console.log(`[DEBUG showTransactions v3] Busca completa CONCLU\xcdDA em segundo plano (${e?.length||0} logs).`);let t={dateFrom:a?.querySelector("#dateFrom")?.value||"",dateTo:a?.querySelector("#dateTo")?.value||"",worldFilter:a?.querySelector("#worldFilter")?.value||""};console.log("[DEBUG showTransactions v3] Re-renderizando modal com dados completos e filtros:",t),eE(e||[],t,"date","desc",1,10)}).catch(e=>{console.error("[DEBUG showTransactions v3] Erro durante a busca completa em segundo plano:",e),eu("Erro ao carregar o hist\xf3rico completo.")}))},eA=async(e=!1)=>{if(!u)throw console.error("[fetchAndUpdateProfit v3] Erro: currentPlayerNickname n\xe3o definido!"),A.runInAction(()=>{q.transactions.replace([]),q.worldProfit=0,q.allTransactionsFetched=!1}),eK(),Error("Nickname do jogador n\xe3o identificado.");if(console.log(`[DEBUG fetchAndUpdateProfit v3] Iniciando. FetchAll: ${e}`),q.allTransactionsFetched&&!e){console.log("[DEBUG fetchAndUpdateProfit v3] Usando dados completos j\xe1 cacheados.");let t=ef();return A.runInAction(()=>{q.worldProfit=t}),eK(),q.transactions}try{let a=[],o=!0,r=`ragnarokMarketTransactions_${u}`,n=localStorage.getItem(r);if(n&&!e)try{let i=JSON.parse(n).map(e=>({...e,date:new Date(e.date)}));ed[u]=i,a=i,console.log(`[DEBUG fetchAndUpdateProfit v3] ${i.length} logs carregados do localStorage.`);let s=await e2();s?(console.log("[DEBUG fetchAndUpdateProfit v3] Cache do localStorage desatualizado ou precisa buscar tudo."),e&&(a=[],ed[u]=[],localStorage.removeItem(r),console.log("[DEBUG fetchAndUpdateProfit v3] Cache limpo devido a fetchAll=true e cache desatualizado.")),A.runInAction(()=>{q.allTransactionsFetched=!1})):(console.log("[DEBUG fetchAndUpdateProfit v3] Cache do localStorage est\xe1 atualizado (baseado na p\xe1g 1)."),o=!1,A.runInAction(()=>{q.allTransactionsFetched=!0}))}catch(l){console.error("[DEBUG fetchAndUpdateProfit v3] Erro ao parsear localStorage, limpando.",l),localStorage.removeItem(r),a=[],ed[u]=[],A.runInAction(()=>{q.allTransactionsFetched=!1})}else A.runInAction(()=>{q.allTransactionsFetched=!1}),console.log("[DEBUG fetchAndUpdateProfit v3] Sem cache no localStorage ou fetchAll=true.");if(o){if(e)console.log("[DEBUG fetchAndUpdateProfit v3] Buscando TODAS as p\xe1ginas..."),a=await ep(),A.runInAction(()=>{q.allTransactionsFetched=!0}),console.log(`[DEBUG fetchAndUpdateProfit v3] Busca completa conclu\xedda: ${a.length} logs.`);else{console.log("[DEBUG fetchAndUpdateProfit v3] Buscando APENAS a primeira p\xe1gina...");let{transactions:$}=await em(1);a=$||[],A.runInAction(()=>{q.allTransactionsFetched=!1}),console.log(`[DEBUG fetchAndUpdateProfit v3] Primeira p\xe1gina buscada: ${a.length} logs.`),(!ed[u]||a.length>0&&(!ed[u][0]||a[0].date>ed[u][0].date))&&(ed[u]=a,console.log("[DEBUG fetchAndUpdateProfit v3] Cache em mem\xf3ria atualizado com a primeira p\xe1gina."))}}a&&Array.isArray(a)?(A.runInAction(()=>{q.transactions.replace(a)}),console.log(`[DEBUG fetchAndUpdateProfit v3] State.transactions atualizado com ${a.length} logs.`)):(console.warn("[DEBUG fetchAndUpdateProfit v3] Nenhum log para processar."),A.runInAction(()=>{q.transactions.replace([]),q.allTransactionsFetched=e}));let c=ef();return A.runInAction(()=>{q.worldProfit=c}),console.log(`[DEBUG fetchAndUpdateProfit v3] Lucro do mundo ${q.currentVillage?.world} recalculado: ${c}`),eK(),q.transactions}catch(d){throw console.error("[DEBUG fetchAndUpdateProfit v3] Erro geral:",d),A.runInAction(()=>{q.transactions.replace([]),q.worldProfit=0,q.allTransactionsFetched=!1}),ed[u]=[],localStorage.removeItem(`ragnarokMarketTransactions_${u}`),eK(),eu(T.t("domError")),d}},ek=(e,a,o)=>{let r=Date.now(),n="buy"===e,i=n?O.buyInputs.get(a.name):O.sellInputs.get(a.name),s=n?document.querySelector('input.btn-premium-exchange-buy[type="submit"]'):document.querySelector('#premium_exchange_form input.btn[type="submit"]'),u=n?O.getElement("buySpinner"):O.getElement("sellSpinner");if(!i||!s){console.error(`${t}: [TX-${r} - ${e}] Erro Cr\xedtico: Input (${i?"OK":"FALHA"}) ou Bot\xe3o de A\xe7\xE3o (${s?"OK":"FALHA"}) n\xe3o encontrado para ${a.name}. Tentando atualizar elementos DOM e agendando reload.`),er(),eu(T.t("domError")),en(),n?eC=!1:eF=!1;return}u&&(u.style.display="inline-block"),ei(T.t("transactionInProgress"),"warning");let l=()=>{if(s.disabled){let e=new MutationObserver(t=>{t.forEach(t=>{"disabled"!==t.attributeName||s.disabled||(e.disconnect(),s.click(),$())})});e.observe(s,{attributes:!0,attributeFilter:["disabled"]})}else s.click(),$()},$=()=>{let a=0,o=!1,i=setInterval(()=>{if(o){clearInterval(i);return}let s=null;for(let l of["div.ui-dialog[aria-describedby='premium_exchange_confirm_buy']","div.ui-dialog[aria-describedby='premium_exchange_confirm_sell']","div.ui-dialog:not([style*='display: none'])","div[role='dialog']:not([style*='display: none'])"])if((s=document.querySelector(l))&&(!s.style.display||"none"!==s.style.display))break;if(s){let $=null;for(let c of["div.confirmation-buttons button.btn.evt-confirm-btn.btn-confirm-yes","button.btn-confirm-yes",'button:enabled:contains("Sim")','button:enabled:contains("Yes")',".ui-dialog-buttonpane button:not(:disabled):first-of-type"])if(($=s.querySelector(c))&&!$.disabled)break;if($){clearInterval(i),o=!0;let d=0;if(n)try{let p=null;for(let m of["#confirmation-msg p",".dialog_content p",".ui-dialog-content p"])if(p=s.querySelector(m))break;if(p){let g=p.innerHTML,f=g.match(/<img\s[^>]*src="[^"]*premium\.png"[^>]*>\s*(\d+)/i);f&&f[1]&&(d=W(f[1]))}}catch(h){console.error(`${t}: [TX-${r} - Compra] Erro CR\xcdTICO ao tentar extrair/processar custo do PP no pop-up:`,h)}if(n&&d>0){console.log(`${t}: [TX-${r} - Compra] Custo ${d} > 0. Tentando atualizar input e salvar config.`);let b=O.getElement("premiumPointsInput");if(b){console.log(`${t}: [TX-${r} - Compra] Input de PP encontrado.`);let x=W(b.value)||0;console.log(`${t}: [TX-${r} - Compra] Valor ATUAL no input: ${x}`);let _=Math.max(0,x-d);console.log(`${t}: [TX-${r} - Compra] Novo valor CALCULADO para input: ${_}`),b.value=_,console.log(`${t}: [TX-${r} - Compra] Input visualmente atualizado para ${_}.`),eH(),console.log(`${t}: [TX-${r} - Compra] performSaveOperation() chamada para persistir o novo limite de PP (${_}).`)}else console.warn(`${t}: [TX-${r} - Compra] Input #premiumPointsInput N\xc3O encontrado.`)}else n&&console.log(`${t}: [TX-${r} - Compra] Custo do PP foi 0 ou n\xe3o p\xf4de ser extra\xeddo. Input e config n\xe3o ser\xe3o atualizados.`);console.log(`${t}: [TX-${r} - ${e}] Clicando no bot\xe3o 'Sim' AGORA.`),$.click(),u&&(u.style.display="none"),es(T.t("transactionSuccess")),en();return}s.querySelector("button.btn-confirm-yes")}++a>=50&&(clearInterval(i),o=!0,u&&(u.style.display="none"),eu(T.t("transactionError")+" (Timeout Confirma\xe7\xe3o)"),en(),n?eC=!1:eF=!1)},100)},c=W(o);if(isNaN(c)||c<=0){console.error(`${t}: [TX-${r} - ${e}] Quantidade inv\xe1lida (${o} -> ${c}). Transa\xe7\xE3o abortada.`),u&&(u.style.display="none"),n?eC=!1:eF=!1;return}i.value=c,i.dispatchEvent(new Event("input",{bubbles:!0})),i.dispatchEvent(new Event("change",{bubbles:!0})),i.dispatchEvent(new Event("keyup",{bubbles:!0})),setTimeout(l,150)},eC=!1,ew=async()=>{if(to()){console.log("[Compra] hCaptcha detectado. Abortando compra."),eC=!1;return}let e=Date.now();if(!q.buyModeActive){eC=!1;return}if(eC)return;if(q.buyPausedUntil&&q.buyPausedUntil>e){new Date(q.buyPausedUntil).toLocaleString();return}eC=!0;try{await eD()}catch(t){console.error("[Compra] Erro ao buscar recursos em tr\xe2nsito:",t),eC=!1;return}q.storageCapacity=F();let a=e3(),o=O.getElement("premiumPointsInput"),r=o?W(o.value):1/0,n=Math.min(a,r);if(n<=0){q.hasExecutedBuy=!1,eC=!1;return}let i=Object.keys(eY).map(e=>{let t=eY[e];if(!t)return null;let a=document.querySelector(`.rate-input[data-resource="${e}-stock"]`),o=document.querySelector(`.rate-input[data-resource="${e}"]`),r=document.querySelector('.rate-input[data-resource="buy-per-time"]'),n=W(a?.value)||0,i=W(o?.value)||0,s=W(r?.value)||1/0,u=t.getGameRate()||0;return{name:e,desiredStock:n,marketRate:u,userRateLimit:i,buyLimitPerTime:s}}).filter(e=>null!==e);if(void 0===D){console.error("[Compra] Vari\xe1vel global 'currentResources' n\xe3o est\xe1 definida!"),eC=!1;return}let s={action:"calculateBuyAmount",data:{resources:i,effectivePP:n,storageCapacity:q.storageCapacity,incomingResources:A.toJS(q.incomingResources),currentResources:A.toJS(D)}};eR.postMessage(s),eR.onmessage=async e=>{if(to()){console.log("[Compra - Worker Callback] hCaptcha detectado ANTES de processar resultado. Abortando.");return}if("buyAmountCalculated"===e.data.action){let{amountToBuy:t,resourceName:a}=e.data.result;if(t>0&&a&&eY[a]){let n=eY[a],i=e3(),s=D[a]||0;try{await ek("buy",n,t),A.runInAction(()=>{q.hasExecutedBuy=!0}),await new Promise(e=>setTimeout(e,1500));let u=e3(),l=D[a]||0,$=i-u;if(o&&r!==1/0&&($>0||l>s)){let c=Math.max(0,r-$);W(o.value)!==c&&(o.value=c,updateAndSavePPConfig(c))}}catch(d){console.error(`[Compra] Erro durante executeTransaction para ${a}:`,d)}}else A.runInAction(()=>{q.hasExecutedBuy=!1}),eC=!1}else e.data.error?(console.error("[Compra] Erro retornado pelo Worker:",e.data.error),eC=!1):(console.warn("[Compra] A\xe7\xe3o inesperada recebida do Worker:",e.data.action),eC=!1)},eR.onerror=e=>{console.error("[Compra] Erro GERAL no Worker:",e.message,e),eC=!1}};function e3(){let e=document.querySelector("#premium_points");return e?W(e.textContent.trim()):0}let e6=()=>O.buyInputs.forEach(e=>e&&(e.value="")),eT={log(){},error(){},warn(){},debug(){}};function eP(e){if("string"!=typeof e||!e)return 0;let t=e.replace(/[.,]/g,"").replace(/[^\d]/g,""),a=parseInt(t,10);return isNaN(a)?0:a}function eS(e){let t={wood:0,stone:0,iron:0};if(!e)return t;let a=e.querySelector(".icon.header.wood"),o=e.querySelector(".icon.header.stone"),r=e.querySelector(".icon.header.iron"),n=e=>{if(!e)return 0;let t=e.nextElementSibling;if(t&&t.textContent.match(/[\d.,]+/)&&!t.querySelector(".icon.header"))return eP(t.textContent);let a=e.nextSibling;for(;a&&a.nodeType!==Node.TEXT_NODE;){if(a.nodeType===Node.ELEMENT_NODE&&a.textContent.match(/[\d.,]+/)&&!a.querySelector(".icon.header"))return eP(a.textContent);a=a.nextSibling}if(a&&a.nodeType===Node.TEXT_NODE){let o=a.textContent.trim().match(/^[\s]*([\d.,]+)/);if(o)return eP(o[1])}let r=e.parentElement;if(r&&r.textContent){let n=r.textContent.trim(),i=n.match(/([\d.,]+)/g);i&&i.length}return 0};if(t.wood=n(a),t.stone=n(o),t.iron=n(r),0===t.wood&&0===t.stone&&0===t.iron&&(a||o||r)){eT.debug("Icon-based extraction failed, attempting text-based fallback within element:",e.textContent.substring(0,100));let i=e.textContent||"",s=(i.match(/[\d.,]+/g)||[]).map(e=>eP(e)),u=0;if(a&&u<s.length&&(t.wood=s[u],u++),o&&u<s.length&&(t.stone=s[u],u++),r&&u<s.length&&(t.iron=s[u],u++),eT.debug(" - Text fallback results:",t),1===u&&[a,o,r].filter(Boolean).length>1)return eT.warn("Single number found for multiple icons via text fallback, resetting as likely incorrect."),{wood:0,stone:0,iron:0}}return t}async function eD(){return new Promise((e,t)=>{let a="undefined"!=typeof TribalWars&&TribalWars.getGameData?TribalWars.getGameData():{},o=a.village?.id;if(!o)return eT.error("[Fetch] ID da vila n\xe3o encontrado."),A.runInAction(()=>{q.incomingResources.wood=0,q.incomingResources.stone=0,q.incomingResources.iron=0}),e({wood:0,stone:0,iron:0});let r=`https://${window.location.host}/game.php?village=${o}&screen=market&mode=transports`;eT.log(`[Fetch] Buscando dados de transporte de: ${r}`),GM_xmlhttpRequest({method:"GET",url:r,timeout:15e3,onload(a){if(a.status>=200&&a.status<300){eT.log("[Fetch] Resposta da p\xe1gina de transporte recebida (Status OK).");try{let o=function e(t){eT.log("Iniciando parseamento da p\xe1gina de transportes.");let a=new DOMParser,o=a.parseFromString(t,"text/html"),r={madeira:0,argila:0,ferro:0},n=!1,i=o.body.textContent.toLowerCase();if(i.includes("n\xe3o h\xe1 transportes chegando")||i.includes("nenhum transporte em chegada")||i.includes("no incoming transports")||i.includes("нет входящих транспортов"))return eT.log("P\xe1gina indica explicitamente que n\xe3o h\xe1 transportes de chegada."),r;let s=null;if(!(s=o.querySelector("#market_transports_in table.vis, #market_transports_in, #market_status_in table.vis"))){let u=Array.from(o.querySelectorAll("h2, h3, h4, .content-header, .box-header, th, .table-header")),l=["transportes em chegada","entrando","incoming transports","chegando","mercadores chegando","arrival","прибывающие транспорты","chegada","transporte de entrada","transporte chegando","транспорт прибытия"];for(let $ of u){let c=$.textContent.trim().toLowerCase();if(l.some(e=>c.includes(e))){eT.log(`Cabe\xe7alho de chegada encontrado: "${c}"`);let d=$,p=5;for(;d&&p>0;){if("TABLE"===d.tagName&&d.classList.contains("vis")){s=d;break}let m=d.querySelector("table.vis");if(m){s=m;break}d=d.nextElementSibling,p--}if(s){eT.log(`Tabela de chegada encontrada pr\xf3xima ao cabe\xe7alho "${c}"`);break}}}}if(s){eT.log("Processando tabela de chegada encontrada...");let g=Array.from(s.querySelectorAll("tr")).filter(e=>!e.querySelector("th")&&e.cells&&e.cells.length>1),f=Array.from(s.querySelectorAll("tr")).find(e=>{let t=e.textContent.toLowerCase();return(t.includes("total:")||t.includes("soma:")||t.includes("summe:")||t.includes("итого:")||t.includes("entrada:"))&&!e.querySelector("th")});if(f){eT.log("Processando linha de sum\xe1rio de chegada...");let h=eS(f);(h.wood>0||h.stone>0||h.iron>0)&&(r.madeira=h.wood,r.argila=h.stone,r.ferro=h.iron,n=!0,eT.log("Recursos extra\xeddos da linha de sum\xe1rio:",r))}else g.length>0?(eT.log(`Processando ${g.length} linhas de dados na tabela de chegada...`),g.forEach((e,t)=>{let a=eS(e);(a.wood>0||a.stone>0||a.iron>0)&&(r.madeira+=a.wood,r.argila+=a.stone,r.ferro+=a.iron,n=!0,eT.debug(`Linha ${t}: Recursos adicionados: W=${a.wood}, S=${a.stone}, I=${a.iron}`))}),eT.log("Total de recursos encontrados:",r)):eT.warn("Tabela de chegada encontrada, mas sem linhas de dados ou sum\xe1rio reconhec\xedvel.")}else eT.warn("Nenhuma tabela espec\xedfica de chegada encontrada. Tentando estrat\xe9gia alternativa...");if(!n){eT.log("Buscando linhas de transporte gerais e verificando dire\xe7\xe3o...");let b=[...o.querySelectorAll(".transport_row"),...o.querySelectorAll('tr[id^="market_"]'),...o.querySelectorAll("tr.row_a, tr.row_b"),...o.querySelectorAll("table.vis tr:not(:first-child)")];b.length>0?(eT.log(`Encontradas ${b.length} poss\xedveis linhas de transporte para an\xe1lise.`),b.forEach((e,t)=>{let a=!1,o=e.textContent.toLowerCase(),i=e.innerHTML.toLowerCase(),s=["para esta aldeia","incoming","arrival","chegada","chegando","entrada","para c\xe1","entrando","recebendo"],u=["arrow_right","arrow_in","icon_in","→","▶","⇨"];(s.some(e=>o.includes(e))||u.some(e=>i.includes(e)))&&(a=!0);let l=e.querySelector(".transport_direction, .direction, .movement-direction");if(l){let $=l.textContent.trim().toLowerCase(),c=l.innerHTML.toLowerCase();(s.some(e=>$.includes(e))||u.some(e=>c.includes(e)))&&(a=!0)}if(a){eT.debug(`Linha ${t} identificada como CHEGANDO`);let d=e.querySelector(".resources_sum, .res")||e,p=eS(d);(p.wood>0||p.stone>0||p.iron>0)&&(r.madeira+=p.wood,r.argila+=p.stone,r.ferro+=p.iron,n=!0,eT.debug(`Recursos adicionados: W=${p.wood}, S=${p.stone}, I=${p.iron}`))}})):eT.error("Nenhuma linha de transporte encontrada em toda a p\xe1gina.")}if(!n){eT.log("Tentando encontrar elementos de sum\xe1rio de recursos...");let x=[o.querySelector("#market_status_in"),o.querySelector(".incoming-resources"),o.querySelector(".resources-incoming"),...o.querySelectorAll(".sum_incoming"),...o.querySelectorAll(".incoming_total")].filter(Boolean);for(let _ of x){let y=eS(_);if(y.wood>0||y.stone>0||y.iron>0){r.madeira=y.wood,r.argila=y.stone,r.ferro=y.iron,n=!0,eT.log("Recursos encontrados em elemento de sum\xe1rio:",r);break}}}return n?(eT.log("Parseamento conclu\xeddo com sucesso. Recursos CHEGANDO:",r),{madeira:r.madeira,argila:r.argila,ferro:r.ferro}):(eT.error("N\xe3o foi poss\xedvel encontrar dados de transportes em chegada na p\xe1gina."),{madeira:0,argila:0,ferro:0})}(a.responseText);null===o?(eT.error("[Fetch] parseTransportData retornou null (falha ao encontrar/parsear dados). Resolvendo com recursos zerados."),A.runInAction(()=>{q.incomingResources.wood=0,q.incomingResources.stone=0,q.incomingResources.iron=0}),e({wood:0,stone:0,iron:0})):(eT.log("[Fetch] Atualizando state.incomingResources:",o),A.runInAction(()=>{q.incomingResources.wood=o.madeira||0,q.incomingResources.stone=o.argila||0,q.incomingResources.iron=o.ferro||0}),e({wood:q.incomingResources.wood,stone:q.incomingResources.stone,iron:q.incomingResources.iron}))}catch(r){eT.error(`[Fetch] Erro durante o parseamento: ${r.message}`,r),A.runInAction(()=>{q.incomingResources.wood=0,q.incomingResources.stone=0,q.incomingResources.iron=0}),t(r)}}else eT.error(`[Fetch] Falha ao buscar dados de transporte. Status: ${a.status}`),A.runInAction(()=>{q.incomingResources.wood=0,q.incomingResources.stone=0,q.incomingResources.iron=0}),t(Error(`HTTP error! status: ${a.status}`))},onerror(e){eT.error(`[Fetch] Erro na requisi\xe7\xE3o GM_xmlhttpRequest:`,e),A.runInAction(()=>{q.incomingResources.wood=0,q.incomingResources.stone=0,q.incomingResources.iron=0}),t(e)},ontimeout(){eT.error("[Fetch] Requisi\xe7\xe3o para transportes expirou (timeout)."),A.runInAction(()=>{q.incomingResources.wood=0,q.incomingResources.stone=0,q.incomingResources.iron=0}),t(Error("Transport request timed out"))}})})}let eI=new Map,eF=!1,eM=`
self.onmessage = function(e) {
    const { action, data } = e.data;
    switch (action) {
        case 'calculateSellAmount':
            const sellResult = calculateSellAmount(data);
            self.postMessage({ action: 'sellAmountCalculated', result: sellResult });
            break;
        case 'calculateBuyAmount':
            const buyResult = calculateBuyAmount(data); // A l\xf3gica de compra permanece a mesma
            self.postMessage({ action: 'buyAmountCalculated', result: buyResult });
            break;
        default:
            self.postMessage({ error: 'A\xe7\xE3o desconhecida' });
    }
};





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
            exchangeRate: r.exchangeRate // Taxa de c\xe2mbio mais recente
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

    // Determina a quantidade m\xe1xima poss\xedvel
    let amountToSell = Math.min(maxFromStock, maxFromMarket, maxFromMerchants, effectiveUserLimit);
    if (amountToSell <= 0) {
        return { amountToSell: 0, profit: 0, resourceName: topResource.resource.name };
    }

    // Garante o lucro m\xednimo e ajusta para m\xfaltiplo de exchangeRate
    const minAmountForProfit = Math.ceil(config.minProfitThreshold * exchangeRate);
    amountToSell = Math.max(amountToSell, minAmountForProfit);
    amountToSell = Math.floor(amountToSell / config.unitSize) * config.unitSize;

    if (amountToSell < config.unitSize) {
        return { amountToSell: 0, profit: 0, resourceName: topResource.resource.name };
    }

    // Ajuste otimizado para lucro inteiro e estoque dispon\xedvel
    let profit = calculateProfit(topResource.resource, amountToSell);
    amountToSell = Math.floor(amountToSell / exchangeRate) * exchangeRate; // M\xfaltiplo de exchangeRate
    profit = calculateProfit(topResource.resource, amountToSell);

    if (profit < config.minProfitThreshold) {
        return { amountToSell: 0, profit: 0, resourceName: topResource.resource.name };
    }

    // Verifica e ajusta o lucro para um valor inteiro vi\xe1vel
    const requiredStock = Math.ceil(amountToSell + config.FIXED_FEE + (amountToSell * dynamicFee));
    if (requiredStock > topResource.available) {
        // Tenta ajustar para o maior lucro inteiro poss\xedvel dentro do estoque
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
        // Tenta alcan\xe7ar o pr\xf3ximo PP inteiro se houver estoque
        const nextProfit = Math.ceil(profit);
        const nextAmount = Math.ceil(nextProfit * exchangeRate);
        const nextRequiredStock = Math.ceil(nextAmount + config.FIXED_FEE + (nextAmount * dynamicFee));
        if (nextRequiredStock <= topResource.available) {
            amountToSell = nextAmount;
            profit = nextProfit;
        }
    }

    // Nova l\xf3gica: Reavalia\xe7\xE3o din\xe2mica baseada em mudan\xe7as recentes do exchangeRate
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















function calculateBuyAmount(data) {
    const { resources, effectivePP, storageCapacity, incomingResources, currentResources } = data;

    const resourcesToConsider = resources.map(r => {
        const desiredStock = r.desiredStock || 0;
        const currentStock = currentResources[r.name] || 0;
        const incomingStock = incomingResources[r.name] || 0;
        const totalEffectiveStock = currentStock + incomingStock;

        const deficit = Math.max(0, desiredStock - totalEffectiveStock);
        const availableCapacity = Math.max(0, storageCapacity - totalEffectiveStock);
        const marketRate = r.marketRate || 0;
        const userRateLimit = r.userRateLimit || 0;
        const buyLimitPerTime = r.buyLimitPerTime || Infinity;
        const isRateAcceptable = marketRate > 0 && (userRateLimit === 0 || marketRate >= userRateLimit);

        const costInPP = Math.ceil(deficit / marketRate);
        const affordableAmount = Math.floor(effectivePP * marketRate);

        return {
            name: r.name,
            deficit,
            availableCapacity,
            marketRate,
            userRateLimit,
            isRateAcceptable,
            canPhysicallyBuy: Math.min(deficit, availableCapacity, affordableAmount),
            buyLimitPerTime
        };
    });

    const buyableResources = resourcesToConsider.filter(r =>
        r.deficit > 0 &&
        r.availableCapacity > 0 &&
        r.canPhysicallyBuy > 0 &&
        r.isRateAcceptable
    );

    if (buyableResources.length === 0) {
        return { amountToBuy: 0, resourceName: null };
    }

    buyableResources.sort((a, b) => b.marketRate - a.marketRate);
    const priorityResource = buyableResources[0];

    let buyAmount = Math.min(
        priorityResource.canPhysicallyBuy,
        priorityResource.buyLimitPerTime
    );

    const finalCostPP = Math.ceil(buyAmount / priorityResource.marketRate);
    if (finalCostPP > effectivePP) {
        buyAmount = Math.floor(effectivePP * priorityResource.marketRate);
    }

    buyAmount = Math.max(0, Math.floor(buyAmount));

    return { amountToBuy: buyAmount, resourceName: priorityResource.name };
}




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

function calculateProfit(resource, amountSold) {
    return Math.floor(amountSold / resource.exchangeRate);

}
`,eR=new Worker(URL.createObjectURL(new Blob([eM],{type:"text/javascript"})));function eB(){let e="gameData";if(eI.has(e))return eI.get(e);let t=e9();return t&&eI.set(e,t),t}function e9(){if("undefined"!=typeof TribalWars&&TribalWars.getGameData)try{return TribalWars.getGameData()}catch(e){}return null}function eL(e,t){let a=E.now();q.rateHistory[e].push({rate:t,timestamp:a}),q.rateHistory[e]=q.rateHistory[e].filter(e=>a.diff(e.timestamp,"minutes").minutes<=5),q.marketTrends[e]=function e(t){if(t.length<3)return"neutral";let a=t.slice(-3).map((e,t,a)=>t>0?e.rate-a[t-1].rate:0),o=a.reduce((e,t)=>e+t,0)/a.length;return o>.05?"up":o<-.05?"down":"neutral"}(q.rateHistory[e]),q.marketVolatility[e]=function e(t){if(t.length<2)return 0;let a=t.slice(-5).map((e,t,a)=>t>0?Math.abs(e.rate-a[t-1].rate):0);return(Math.max(...a)-Math.min(...a))/100}(q.rateHistory[e]),q.lastUpdate[e]=a.toLocaleString(E.DATETIME_SHORT)}function eq(e){if(!e||!e.name)return 100;let t=`#premium_exchange_rate_${e.name} > div:nth-child(1)`,a=document.querySelector(t);if(a){let o=a.textContent.trim(),r=parseFloat(o.replace(/[^0-9.]/g,""))||100;return eI.set(`rate_${e.name}`,r),eL(e.name,r),r}let n=`rate_${e.name}`;if(eI.has(n)){let i=eI.get(n);return eL(e.name,i),i}let s=eB();if(s&&s.market&&s.market.rates){let u=s.market.rates[e.name];if(void 0!==u){let l=parseFloat(u)||100;return eI.set(n,l),eL(e.name,l),l}}return eL(e.name,100),100}let e5={wood:document.querySelector("#premium_exchange_rate_wood > div:nth-child(1)"),stone:document.querySelector("#premium_exchange_rate_stone > div:nth-child(1)"),iron:document.querySelector("#premium_exchange_rate_iron > div:nth-child(1)")},ez={};function e4(e){let t=eq(e),a=q.marketTrends[e.name],o=.05;return"up"===a?o-=.01:"down"===a&&(o+=.015),t>=140&&t<=145?o=.0544:t<120?o=.06:t>150&&(o=.045),Math.min(Math.max(o,.04),.07)}function eU(e){let t=`exchange_${e.name}`,a=`#premium_exchange_rate_${e.name} .premium-exchange-sep`,o=document.querySelector(a);if(o){let r=o.textContent.trim(),n=parseFloat(r.replace(/[^0-9.]/g,""))||1;return eI.set(t,n),n}if(eI.has(t))return eI.get(t);let i=eB();if(i&&i.market&&i.market.exchangeRates){let s=i.market.exchangeRates[e.name];if(void 0!==s){let u=parseFloat(s)||1;return eI.set(t,u),u}}if(!o)return 1;let l=o.textContent.trim(),$=parseFloat(l.replace(/[^0-9.]/g,""))||1;return eI.set(t,$),$}function e8(e,t){eU(e);let a=e.exchangeRate||eU(e);return Math.floor(t/a)}function eO(){let e=document.querySelector("#market_merchant_available_count");return e?W(e.textContent):0}function eN(){if(to()){console.log("[Venda] hCaptcha detectado. Abortando venda."),eF=!1;return}let e=Date.now();if(y)return;if(!q.sellModeActive){eF=!1;return}if(eF)return;if(q.sellPausedUntil&&q.sellPausedUntil>e){new Date(q.sellPausedUntil).toLocaleString();return}let a=eO();if(a<=0){eF=!1;return}eF=!0;let o=Object.values(eY).map(e=>{if(!e||!e.name)return null;let t=e.getTotal(),a=e.getReserved(),o=function e(t){let a=t.name;try{let o=e9();if(o&&o.market&&o.market.capacities&&o.market.capacities[a]){let r=o.market.capacities[a];r.total,r.current}}catch(n){console.error(`[getMarketCapacity - ${a}] Erro ao acessar API TribalWars:`,n)}try{let i=document.querySelector(`#premium_exchange_capacity_${a}`),s=document.querySelector(`#premium_exchange_stock_${a}`);if(!i||!s)return 0;{let u=i.textContent.trim(),l=s.textContent.trim(),$=e=>parseInt(String(e||"0").replace(/[^\d]/g,""),10)||0,c=$(u),d=$(l);return Math.max(0,c-d)}}catch(p){return console.error(`[getMarketCapacity - ${a}] Erro ao ler DOM:`,p),0}}(e),r=eU(e),n=eq(e),i=e.getReserveRate(),s=function e(t){let a=`sellLimit_${t.name}`;if(eI.has(a))return eI.get(a);let o=function e(t,a){let o="wood"===t.name?`[data-resource="${a}"]`:`[data-resource="${a}-${t.name}"]`;return document.querySelector(o)}(t,"sell-limit");if(!o)return 1/0;let r=parseInt(o.value,10),n=isNaN(r)||r<=0?1/0:r;return eI.set(a,n),n}(e);return{name:e.name,marketRate:n,minRate:i,total:t,reserve:a,sellLimit:s,marketCapacityRaw:o,exchangeRate:r}}).filter(e=>null!==e),r={action:"calculateSellAmount",data:{resources:o,merchantsAvailable:a,state:{marketTrends:A.toJS(q.marketTrends),marketVolatility:A.toJS(q.marketVolatility)},config:{enforceMerchantLimit:!0,unitSize:100,FIXED_FEE:100,minProfitThreshold:1}}};try{eR.postMessage(r)}catch(n){console.error(`${t}: [Venda] Erro CR\xcdTICO ao enviar mensagem para o Worker:`,n),eF=!1;return}eR.onmessage=e=>{if(to()){console.log("[Venda - Worker Callback] hCaptcha detectado ANTES de processar resultado. Abortando.");return}if("sellAmountCalculated"===e.data.action){let{amountToSell:a,profit:o,resourceName:r}=e.data.result;if(a>0&&r&&eY[r]){let n=eY[r],i=n.getTotal(),s=n.getReserved(),u=eO();if(a<=Math.max(0,i-s)&&u>=Math.ceil(a/1e3)){y=!0,setTimeout(()=>{y=!1,q.sellModeActive&&!eF&&(!q.sellPausedUntil||q.sellPausedUntil<=Date.now())&&eN()},6e3);try{ek("sell",n,a),ei(`${T.t("profit")}: <span class="icon header premium"></span> ${o}`,"success")}catch(l){console.error(`[Venda] Erro durante executeTransaction para ${r}:`,l),y=!1}}else eF=!1}else eF=!1}else e.data.error?(console.error(`${t}: [Venda Worker Callback] Erro recebido do Worker:`,e.data.error),eF=!1):(console.warn("[Venda Worker Callback] A\xe7\xe3o inesperada recebida do Worker:",e.data.action),eF=!1)},eR.onerror=e=>{console.error(`${t}: [Venda Worker onerror] Erro GERAL na comunica\xe7\xe3o:`,e.message,e),eF=!1}}let e7=v.debounce(eN,150),eG=async()=>{!to()&&(q.buyModeActive&&await ew(),q.sellModeActive&&e7())},eH=()=>{let e={},t=document.querySelectorAll(".market-container .rate-input,#premiumPointsInput,#settingsModal .settings-input,#settingsModal .settings-checkbox,#settingsModal .aquila-select");t.forEach(t=>{if(!t)return;let a=t.id||t.dataset?.resource;if(!a)return;let o=null,r=!1,n=!1;if("checkbox"===t.type)o=t.checked,r=!0,"closeOnHCaptchaInput"===a&&void 0!==q.closeTabOnHCaptcha&&q.closeTabOnHCaptcha!==t.checked&&A.runInAction(()=>{q.closeTabOnHCaptcha=t.checked});else if("SELECT"===t.tagName)o=t.value,r=!0,"languageSelect"===a&&q.language!==t.value&&["pt","ru","en"].includes(t.value)&&A.runInAction(()=>{q.language=t.value});else{let i=t.value.trim();if("premiumPointsInput"===a){if(""===i)o="0",r=!0;else{let s=W(i);(n=!isNaN(s)&&s>=0)?(o=String(s),r=!0):(o=null,r=!1)}}else if(""===i)r=!1;else{let u=W(i);if(n=!1,n=["buyPauseDurationInput","sellPauseDurationInput"].includes(a)?!isNaN(u)&&u>=1:t.classList.contains("rate-input")?!isNaN(u)&&u>=0:!isNaN(u)){o=String(u),r=!0;try{A.runInAction(()=>{"buyPauseDurationInput"===a&&q.buyPauseDurationMinutes!==u?q.buyPauseDurationMinutes=u:"sellPauseDurationInput"===a&&q.sellPauseDurationMinutes!==u&&(q.sellPauseDurationMinutes=u)})}catch(l){}}else o=null,r=!1}}r&&null!==o?e[a]=o:e.hasOwnProperty(a)&&delete e[a]}),e.languageSelect?(e.language=e.languageSelect,delete e.languageSelect):e.language||(e.language=q.language||"pt");try{let a=JSON.stringify(e),o=LZString.compress(a);o?(localStorage.setItem("compressedConfig",o),localStorage.setItem("language",e.language)):(console.error("[PerformSaveOperation v5] ERRO CR\xcdTICO: Compress\xe3o LZString nula!"),eu("Falha grave compress\xe3o!"))}catch(r){console.error("[PerformSaveOperation v5] ERRO ao salvar no localStorage:",r),eu("Erro ao salvar configura\xe7\xf5es.")}},eV=()=>{console.log("[DEBUG setupEvents vPausaPersist+AutoSave] Iniciando configura\xe7\xe3o de eventos..."),console.log("[DEBUG setupEvents vPausaPersist+AutoSave] Configurando listeners 'input' UI Principal..."),Object.values(eY).forEach(e=>{e.config.uiRateInput&&e.config.uiRateInput.addEventListener("input",v.debounce(()=>{console.log(`[Input Change UI] Taxa compra ${e.name}`),q.buyModeActive&&!eC&&(!q.buyPausedUntil||q.buyPausedUntil<=Date.now())&&ew()},300));let t=document.querySelector(`.rate-input[data-resource="${e.name}-stock"]`);t&&t.addEventListener("input",v.debounce(()=>{console.log(`[Input Change UI] Estoque desejado ${e.name}`),q.buyModeActive&&!eC&&(!q.buyPausedUntil||q.buyPausedUntil<=Date.now())&&ew()},300)),e.config.uiReserveRateInput&&e.config.uiReserveRateInput.addEventListener("input",v.debounce(()=>{console.log(`[Input Change UI] Taxa reserva (m\xe1x. venda) ${e.name}`),q.sellModeActive&&!eF&&(!q.sellPausedUntil||q.sellPausedUntil<=Date.now())&&eN()},300));let a=document.querySelector(`.rate-input[data-resource="reserve-${e.name}"]`);a&&a.addEventListener("input",v.debounce(()=>{console.log(`[Input Change UI] Quantidade reserva ${e.name}`),q.sellModeActive&&!eF&&(!q.sellPausedUntil||q.sellPausedUntil<=Date.now())&&eN()},300));let o=document.querySelector(`.rate-input[data-resource="sell-limit-${e.name}"]`);if(o&&o.addEventListener("input",v.debounce(()=>{console.log(`[Input Change UI] Limite venda espec\xedfico ${e.name}`),q.sellModeActive&&!eF&&(!q.sellPausedUntil||q.sellPausedUntil<=Date.now())&&eN()},300)),"wood"===e.name){let r=document.querySelector('.rate-input[data-resource="sell-limit"]');r&&r.addEventListener("input",v.debounce(()=>{console.log("[Input Change UI] Limite venda GERAL (legacy wood)"),q.sellModeActive&&!eF&&(!q.sellPausedUntil||q.sellPausedUntil<=Date.now())&&eN()},300))}});let e=document.querySelector('.rate-input[data-resource="buy-per-time"]');e&&e.addEventListener("input",v.debounce(()=>{console.log("[Input Change UI] Limite por compra (buy-per-time)"),q.buyModeActive&&!eC&&(!q.buyPausedUntil||q.buyPausedUntil<=Date.now())&&ew()},300));let t=document.querySelector('.rate-input[data-resource="storage-limit"]');t&&t.addEventListener("input",v.debounce(()=>{console.log("[Input Change UI] Limite por armaz\xe9m (storage-limit)"),q.buyModeActive&&!eC&&(!q.buyPausedUntil||q.buyPausedUntil<=Date.now())&&ew()},300));let a=document.querySelector('.rate-input[data-resource="max-spend"]');a&&a.addEventListener("input",v.debounce(()=>{console.log("[Input Change UI] Gasto m\xe1x por compra (max-spend)"),q.buyModeActive&&!eC&&(!q.buyPausedUntil||q.buyPausedUntil<=Date.now())&&ew()},300)),console.log("[DEBUG setupEvents vPausaPersist+AutoSave] Configurando listeners 'click' bot\xf5es...");let o=(e,t)=>{let a=O.getElement(e);a&&(a.removeEventListener("click",t),a.addEventListener("click",t))};o("buyModeToggle",()=>e$("buyModeActive")),o("sellModeToggle",()=>e$("sellModeActive")),o("buyPause",()=>{let e=Date.now(),t="buyPausedUntil",a="aquila_buyPauseEndTime",o=q.buyPauseDurationMinutes,r="Compra";if(console.log(`[Pause Click - ${r}] Ativo: ${q.buyModeActive}, Pausado at\xe9: ${q[t]?new Date(q[t]).toLocaleString():"N\xe3o"}`),q[t]&&q[t]>e){console.log(`[Pause Click - ${r}] A\xe7\xe3o: RETOMAR manualmente.`),z?(clearTimeout(z),z=null,console.log(" -> Timeout existente limpo.")):console.log(" -> Nenhum timeout encontrado para limpar (pode j\xe1 ter sido limpo ou nunca definido)."),A.runInAction(()=>{q[t]=null}),console.log(" -> State da pausa ('buyPausedUntil') limpo."),localStorage.removeItem(a),console.log(` -> localStorage ('${a}') limpo.`),eK(),console.log(" -> UI atualizada."),ei(T.t("statusResumedManually",{mode:T.t("buy",{defaultValue:r})})||`${r} retomado manualmente.`,"success"),console.log(" -> Notifica\xe7\xe3o de retomada enviada."),q.buyModeActive&&!eC?(console.log(" -> Modo Compra est\xe1 ativo e n\xe3o est\xe1 processando. Tentando executar 'processBuyBasedOnResources()'..."),ew()):console.log(` -> N\xe3o tentando comprar: buyModeActive=${q.buyModeActive}, isProcessingBuy=${eC}`);return}if(!q.buyModeActive){console.log(` -> Ignorado: Modo Compra est\xe1 INATIVO. N\xe3o \xe9 poss\xedvel pausar.`);return}if(o>0){let n=e+6e4*o;A.runInAction(()=>{q[t]=n}),localStorage.setItem(a,n),console.log(` -> Pausa ${r} AGENDADA at\xe9: ${new Date(n).toLocaleString()}. State e Storage atualizados.`),eK(),ei(T.t("pauseDurationSet",{mode:T.t("buy",{defaultValue:r}),duration:o}),"warning"),z&&clearTimeout(z),z=setTimeout(()=>{console.log(`[Pause Timeout Callback - ${r}] Pausa expirou naturalmente.`),A.runInAction(()=>{q[t]=null}),localStorage.removeItem(a),z=null,eK(),ei(T.t("pauseExpired",{mode:T.t("buy",{defaultValue:r})}),"success"),q.buyModeActive&&!eC&&(console.log(" -> Tentando reativar Compra p\xf3s-expira\xe7\xe3o..."),ew())},6e4*o),console.log(` -> Timeout (${z}) agendado para a expira\xe7\xe3o.`)}else eu(T.t("setPauseDurationError")),console.warn(` -> Dura\xe7\xe3o inv\xe1lida para pausar: ${o}`)}),o("sellPause",()=>{let e=Date.now(),t="sellPausedUntil",a="aquila_sellPauseEndTime",o=q.sellPauseDurationMinutes,r="Venda";if(console.log(`[Pause Click - ${r}] Ativo: ${q.sellModeActive}, Pausado at\xe9: ${q[t]?new Date(q[t]).toLocaleString():"N\xe3o"}`),q[t]&&q[t]>e){console.log(`[Pause Click - ${r}] A\xe7\xe3o: RETOMAR manualmente.`),U?(clearTimeout(U),U=null,console.log(" -> Timeout existente limpo.")):console.log(" -> Nenhum timeout encontrado para limpar."),A.runInAction(()=>{q[t]=null}),console.log(" -> State da pausa ('sellPausedUntil') limpo."),localStorage.removeItem(a),console.log(` -> localStorage ('${a}') limpo.`),eK(),console.log(" -> UI atualizada."),ei(T.t("statusResumedManually",{mode:T.t("sell",{defaultValue:r})})||`${r} retomado manualmente.`,"success"),console.log(" -> Notifica\xe7\xe3o de retomada enviada."),q.sellModeActive&&!eF?(console.log(" -> Modo Venda est\xe1 ativo e n\xe3o est\xe1 processando. Tentando executar 'updateSell()'..."),eN()):console.log(` -> N\xe3o tentando vender: sellModeActive=${q.sellModeActive}, isProcessingSell=${eF}`);return}if(!q.sellModeActive){console.log(` -> Ignorado: Modo Venda est\xe1 INATIVO. N\xe3o \xe9 poss\xedvel pausar.`);return}if(o>0){let n=e+6e4*o;A.runInAction(()=>{q[t]=n}),localStorage.setItem(a,n),console.log(` -> Pausa ${r} AGENDADA at\xe9: ${new Date(n).toLocaleString()}. State e Storage atualizados.`),eK(),ei(T.t("pauseDurationSet",{mode:T.t("sell",{defaultValue:r}),duration:o}),"warning"),U&&clearTimeout(U),U=setTimeout(()=>{console.log(`[Pause Timeout Callback - ${r}] Pausa expirou naturalmente.`),A.runInAction(()=>{q[t]=null}),localStorage.removeItem(a),U=null,eK(),ei(T.t("pauseExpired",{mode:T.t("sell",{defaultValue:r})}),"success"),q.sellModeActive&&!eF&&(console.log(" -> Tentando reativar Venda p\xf3s-expira\xe7\xe3o..."),eN())},6e4*o),console.log(` -> Timeout (${U}) agendado para a expira\xe7\xe3o.`)}else eu(T.t("setPauseDurationError")),console.warn(` -> Dura\xe7\xe3o inv\xe1lida para pausar: ${o}`)}),o("saveConfig",()=>{console.log("[SaveConfig Button Click] Acionado save manual."),eH(),es(T.t("saveSuccess"))}),o("resetAll",()=>{console.warn("[ResetAll Button Click] INICIANDO RESET GERAL..."),document.querySelectorAll(".market-container .rate-input").forEach(e=>e.value="");let e=O.getElement("premiumPointsInput");e&&(e.value=""),document.querySelectorAll("#settingsModal .settings-input").forEach(e=>{e.value=e.placeholder||""});let t=document.getElementById("autoReloadOnErrorInput");t&&(t.checked=!0);let a=document.getElementById("languageSelect");a&&(a.value="pt");let o=document.getElementById("buyPauseDurationInput");o&&(o.value=5);let r=document.getElementById("sellPauseDurationInput");r&&(r.value=5);let n=document.getElementById("checkIntervalInput");n&&(n.value=n.placeholder||30);let i=document.getElementById("sellCooldownInput");i&&(i.value=i.placeholder||6);let s=document.getElementById("merchantReserveInput");s&&(s.value=s.placeholder||0),console.log("[ResetAll] Inputs resetados na UI."),localStorage.removeItem("compressedConfig"),localStorage.removeItem("language"),localStorage.removeItem("aquila_buyPauseEndTime"),localStorage.removeItem("aquila_sellPauseEndTime"),console.log("[ResetAll] localStorage (configs, lang, pausas) limpo."),A.runInAction(()=>{q.buyModeActive=!1,q.sellModeActive=!1,q.hasExecutedBuy=!1,q.hasExecutedSell=!1,q.buyPausedUntil=null,q.sellPausedUntil=null,q.buyPauseDurationMinutes=5,q.sellPauseDurationMinutes=5,q.language="pt"}),console.log("[ResetAll] State MobX redefinido."),localStorage.setItem("buyModeActive","false"),localStorage.setItem("sellModeActive","false"),z&&(clearTimeout(z),z=null,console.log(" -> Timeout pausa compra limpo.")),U&&(clearTimeout(U),U=null,console.log(" -> Timeout pausa venda limpo.")),eK(),console.log("[ResetAll] Conclu\xeddo."),es(T.t("resetAllSuccess",{defaultValue:"Configura\xe7\xf5es resetadas com sucesso!"}))}),o("transactionsBtn",e0),o("aiAssistantBtn",()=>{let e=O.getElement("aiModal");e&&(e.style.display="flex");let t=O.getElement("aiPrompt");t&&(t.value="");let a=O.getElement("aiResponse");a&&(a.innerHTML="")}),o("settingsBtn",()=>{ta();let e=document.getElementById("buyPauseDurationInput");e&&(e.value=q.buyPauseDurationMinutes);let t=document.getElementById("sellPauseDurationInput");t&&(t.value=q.sellPauseDurationMinutes);let a=document.getElementById("checkIntervalInput");a&&(a.value=a.placeholder||30);let o=document.getElementById("sellCooldownInput");o&&(o.value=o.placeholder||6);let r=document.getElementById("merchantReserveInput");r&&(r.value=r.placeholder||0);let n=document.getElementById("autoReloadOnErrorInput");n&&(n.checked=!0);let i=document.getElementById("languageSelect");i&&(i.value=q.language||"pt"),A.runInAction(()=>{q.isSettingsModalOpen=!0});let s=O.getElement("settingsModal");s&&(s.style.display="flex"),console.log("[DEBUG setupEvents] Modal Configs aberta, inputs populados via state.")}),o("submitAI",async()=>{let e=O.getElement("aiPrompt"),t=e?e.value:"";if(!t.trim())return;let a=O.getElement("aiResponse");a&&(a.innerHTML=`<p>${T.t("aiLoading")}</p>`);try{let o=await J(t);a&&(a.innerHTML=`<p>${o.replace(/\n/g,"<br>")}</p>`)}catch(r){a&&(a.innerHTML=`<p class="error">${T.t("aiError")}: ${r.message||r}</p>`)}}),o("closeModal",()=>{let e=O.getElement("transactionsModal");e&&(e.style.display="none"),ey&&(ey.destroy(),ey=null);let t=document.getElementById("transactionsChartContainer");t&&(t.innerHTML='<canvas id="transactionsChart"></canvas>',t.style.display="none")}),o("closeAIModal",()=>{let e=O.getElement("aiModal");e&&(e.style.display="none")}),o("closeSettingsModal",()=>{A.runInAction(()=>{q.isSettingsModalOpen=!1});let e=O.getElement("settingsModal");e&&(e.style.display="none")}),o("minimizeButton",()=>{let e=O.getElement("market-container"),t=O.getElement("minimizedMarketBox");e&&t&&(A.runInAction(()=>{q.isMinimized=!0}),e.style.display="none",t.style.display="flex",localStorage.setItem("isMinimized","true"))}),o("minimizedMarketBox",()=>{let e=O.getElement("market-container"),t=O.getElement("minimizedMarketBox");e&&t&&(A.runInAction(()=>{q.isMinimized=!1}),e.style.display="block",t.style.display="none",localStorage.setItem("isMinimized","false"))}),console.log("[DEBUG setupEvents vPausaPersist+AutoSave] Configurando listeners 'change' selects...");let r=O.getElement("languageSelect");r&&(r.removeEventListener("change",ej),r.addEventListener("change",ej));let n=O.getElement("villageSelect");n&&(n.removeEventListener("change",eW),n.addEventListener("change",eW)),console.log("[DEBUG setupEvents vPausaPersist+AutoSave] Configurando auto-save da modal...");let i=document.querySelectorAll("#settingsModal .settings-input, #settingsModal .settings-checkbox, #settingsModal .aquila-select"),s=v.debounce(()=>{console.log(`[AutoSave Triggered] Mudan\xe7a na modal detectada. Salvando ap\xf3s 1500ms...`),eH()},1500);i.forEach(e=>{let t="checkbox"===e.type?"change":"input";e.removeEventListener(t,s),e.addEventListener(t,s)}),console.log(`[DEBUG setupEvents AutoSave] Auto-save listeners adicionados (${i.length} elementos).`),console.log("[DEBUG setupEvents vPausaPersist+AutoSave] Configurando listeners tooltip...");let u="[data-tooltip], [data-tooltip-key]",l=document.querySelectorAll(`.market-container ${u}, .modal ${u}`);l.forEach(e=>{e.removeEventListener("mouseenter",H),e.removeEventListener("mousemove",V),e.removeEventListener("mouseleave",j),e.addEventListener("mouseenter",H),e.addEventListener("mousemove",V),e.addEventListener("mouseleave",j)}),console.log(`[DEBUG setupEvents Tooltip] Listeners adicionados/atualizados (${l.length}).`),window.removeEventListener("click",eX,!0),window.addEventListener("click",eX,!0),console.log("[DEBUG setupEvents vPausaPersist+AutoSave] Listener 'click fora modal' adicionado."),console.log("[DEBUG setupEvents vPausaPersist+AutoSave] Configura\xe7\xe3o de TODOS os eventos conclu\xedda.")};function ej(e){let t=e.target.value;["pt","ru","en"].includes(t)?(q.language!==t&&(A.runInAction(()=>{q.language=t}),console.log(`[Idioma Change] State atualizado para: ${t}`)),T.changeLanguage(t).then(()=>{localStorage.setItem("language",q.language),console.log(`[Idioma Change] i18next e localStorage atualizados para ${t}. Chamando updateUI...`),eK()}).catch(e=>{console.error(`[Idioma Change] Erro ao mudar idioma com i18next para ${t}:`,e)})):console.warn(`[Idioma Change] Idioma selecionado inv\xe1lido: ${t}`)}function eW(e){"current"===e.target.value&&et()}function eX(e){let t=(t,a=null,o=null)=>{let r=O.getElement(t);return!!r&&"flex"===r.style.display&&!r.querySelector(".modal-content")?.contains(e.target)&&(console.log(`[Click Fora] Detectado clique fora de #${t}. Fechando...`),r.style.display="none",a&&void 0!==q[a]&&A.runInAction(()=>{q[a]=!1}),"function"==typeof o&&o(),!0)},a=()=>{ey&&(ey.destroy(),ey=null);let e=document.getElementById("transactionsChartContainer");e&&(e.innerHTML='<canvas id="transactionsChart"></canvas>',e.style.display="none")};t("settingsModal","isSettingsModalOpen"),t("transactionsModal",null,a),t("aiModal")}let eK=()=>{let e=(e,t=null,a=null,o=null,r=null,n=null)=>{let i=O.getElement(e);if(i)try{null!==t&&(i.textContent=t),null!==a&&(i.innerHTML=a),null!==o&&null!==r&&("classname"===o.toLowerCase()||"class"===o.toLowerCase()?i.className=r:i.setAttribute(o,r)),null!==n&&void 0!==i.placeholder&&(i.placeholder=n)}catch(s){}};e("headerTitle",T.t("title")),e("saveConfig",null,`<i class="fa-solid fa-floppy-disk"></i> ${T.t("saveConfig")}`),e("resetAll",`\u21BB ${T.t("resetAll")}`),e("transactionsBtn",T.t("transactions")),e("settingsBtn",null,'<i class="fa-solid fa-gear"></i>'),e("aiAssistantBtn",null,'<i class="fa-solid fa-robot"></i>'),e("minimizeButton",null,'<i class="fa-solid fa-window-minimize"></i>'),e("buyStatusLabel",T.t("statusLabel")),e("sellStatusLabel",T.t("statusLabel"));let t=O.getElement("buyModeToggle");t&&(t.textContent=T.t(q.buyModeActive?"buyModeToggleOn":"buyModeToggleOff"),t.className=`black-btn toggle-btn ${q.buyModeActive?"active":"inactive"}`);let a=O.getElement("buyStatus");a&&(a.textContent=T.t(q.buyModeActive?"activated":"deactivated"),a.className=`status ${q.buyModeActive?"green":"red"}`);let o=O.getElement("sellModeToggle");o&&(o.textContent=T.t(q.sellModeActive?"sellModeToggleOn":"sellModeToggleOff"),o.className=`black-btn toggle-btn ${q.sellModeActive?"active":"inactive"}`);let r=O.getElement("sellStatus");r&&(r.textContent=T.t(q.sellModeActive?"activated":"deactivated"),r.className=`status ${q.sellModeActive?"green":"red"}`);let n=Date.now(),i=O.getElement("buyPause");if(i){if(q.buyPausedUntil&&q.buyPausedUntil>n){let s=q.buyPausedUntil,u=new Date(s).toLocaleTimeString(q.language||"pt-BR",{hour:"2-digit",minute:"2-digit"});i.innerHTML=`<i class="fas fa-hourglass-end"></i> ${T.t("pausedUntil",{time:u})}`,i.disabled=!1,i.classList.add("paused")}else i.innerHTML=`<i class="fas fa-pause"></i> ${T.t("pause")}`,i.disabled=!q.buyModeActive,i.classList.remove("paused");if(i.hasAttribute("data-tooltip-key")){let l=q.buyPausedUntil&&q.buyPausedUntil>n?"clickToResumeTooltip":"tooltipPauseBuy";i.getAttribute("data-tooltip-key")!==l&&i.setAttribute("data-tooltip-key",l)}else i.setAttribute("data-tooltip-key",q.buyPausedUntil&&q.buyPausedUntil>n?"clickToResumeTooltip":"tooltipPauseBuy")}let $=O.getElement("sellPause");if($){if(q.sellPausedUntil&&q.sellPausedUntil>n){let c=q.sellPausedUntil,d=new Date(c).toLocaleTimeString(q.language||"pt-BR",{hour:"2-digit",minute:"2-digit"});$.innerHTML=`<i class="fas fa-hourglass-end"></i> ${T.t("pausedUntil",{time:d})}`,$.disabled=!1,$.classList.add("paused")}else $.innerHTML=`<i class="fas fa-pause"></i> ${T.t("pause")}`,$.disabled=!q.sellModeActive,$.classList.remove("paused");if($.hasAttribute("data-tooltip-key")){let p=q.sellPausedUntil&&q.sellPausedUntil>n?"clickToResumeTooltip":"tooltipPauseSell";$.getAttribute("data-tooltip-key")!==p&&$.setAttribute("data-tooltip-key",p)}else $.setAttribute("data-tooltip-key",q.sellPausedUntil&&q.sellPausedUntil>n?"clickToResumeTooltip":"tooltipPauseSell")}let m=O.getElement("worldProfit");m&&(m.textContent=String(q.worldProfit||0));let g=O.getElement("languageSelect");if(g){let f=g.value;g.innerHTML=`
            <option value="pt" ${"pt"===q.language?"selected":""}>🇧🇷 ${T.t("portuguese")}</option>
            <option value="ru" ${"ru"===q.language?"selected":""}>🇷🇺 ${T.t("russian")}</option>
            <option value="en" ${"en"===q.language?"selected":""}>🇬🇧 ${T.t("english")}</option>
        `,g.value=["pt","ru","en"].includes(f)?f:q.language}let h=g?.closest(".dropdown");h&&h.hasAttribute("title");let b=O.getElement("villageSelect")?.closest(".dropdown");b&&b.hasAttribute("title");let x=e=>{let t=document.getElementById(e);if(t&&("none"!==t.style.display||"settingsModal"===e)){let a=t.querySelectorAll("[data-i18n-key]");a.forEach(e=>{let t=e.dataset.i18nKey;if(t){let a=T.t(t,{defaultValue:t});if(("INPUT"===e.tagName||"TEXTAREA"===e.tagName)&&void 0!==e.placeholder)e.placeholder!==a&&(e.placeholder=a);else if("BUTTON"===e.tagName){let o=e.querySelector("i")?.outerHTML||"",r=`${o} ${a}`;e.innerHTML.trim()!==r.trim()&&(e.innerHTML=r)}else{let n=e.querySelector("i.fas"),i=null;if(n){let s=n.nextSibling;for(;s;){if(s.nodeType===Node.TEXT_NODE&&""!==s.nodeValue.trim()){i=s;break}s=s.nextSibling}if(!i){let u=Array.from(e.childNodes);for(let l=u.length-1;l>=0;l--)if(u[l].nodeType===Node.TEXT_NODE&&""!==u[l].nodeValue.trim()){i=u[l];break}}}else(i=Array.from(e.childNodes).find(e=>e.nodeType===Node.TEXT_NODE&&""!==e.nodeValue.trim()))||1!==e.childNodes.length||e.firstChild?.nodeType!==Node.TEXT_NODE||(i=e.firstChild);if(i){let $=i.nodeValue.trim(),c=a.trim();$!==c&&(i.nodeValue=` ${a}`)}else if(n||e.textContent.trim()===a.trim()){if(n&&!i){let d=e.textContent.replace(n.outerText,"").trim();d!==a.trim()&&(Array.from(e.childNodes).forEach(t=>{t.nodeType===Node.TEXT_NODE&&e.removeChild(t)}),e.appendChild(document.createTextNode(` ${a}`)))}}else e.textContent=a}}});let o=t.querySelectorAll(".tooltip-icon[data-tooltip-key]");o.forEach(e=>{let t=e.dataset.tooltipKey;t&&T.t(t,{defaultValue:t})})}};x("transactionsModal"),x("settingsModal"),x("aiModal"),e("closeModal",T.t("close")),e("closeAIModal",T.t("close"))},eJ=()=>{console.log("[LoadConfig v5 - Remove Refs] Iniciando carregamento...");let e=localStorage.getItem("compressedConfig"),t={};if(e)try{let a=LZString.decompress(e);a?t=JSON.parse(a):console.warn("[LoadConfig v5] Descompress\xe3o nula.")}catch(o){console.error("[LoadConfig v5] Erro parsear 'compressedConfig':",o),t={},localStorage.removeItem("compressedConfig")}if(document.querySelectorAll(".market-container .rate-input").forEach(e=>{let a=e?.dataset?.resource;a&&void 0!==t[a]&&(e.value=t[a])}),void 0!==t.premiumPointsInput){let r=O.getElement("premiumPointsInput");r&&(r.value=t.premiumPointsInput)}else{let n=O.getElement("premiumPointsInput");n&&(n.value="")}console.log("[LoadConfig v5] Aplicando configs MODAL restantes e atualizando STATE...");let i=t.buyPauseDurationInput,s=W(i);A.runInAction(()=>{q.buyPauseDurationMinutes=s>0?s:5});let u=document.getElementById("buyPauseDurationInput");u&&(u.value=q.buyPauseDurationMinutes);let l=t.sellPauseDurationInput,$=W(l);A.runInAction(()=>{q.sellPauseDurationMinutes=$>0?$:5});let c=document.getElementById("sellPauseDurationInput");c&&(c.value=q.sellPauseDurationMinutes);let d=document.getElementById("closeOnHCaptchaInput");if(d){let p=t.closeOnHCaptchaInput,m="boolean"==typeof p&&p;d.checked=m,q.closeTabOnHCaptcha!==m&&A.runInAction(()=>{q.closeTabOnHCaptcha=m}),console.log(` -> MODAL: Close on hCaptcha: Lido '${p}', State/UI: ${m}`)}else console.warn("[LoadConfig v5] Checkbox #closeOnHCaptchaInput n\xe3o encontrado."),!1!==q.closeTabOnHCaptcha&&A.runInAction(()=>{q.closeTabOnHCaptcha=!1});let g=localStorage.getItem("language"),f=t.language,h=["pt","ru","en"].includes(g)?g:["pt","ru","en"].includes(f)?f:"pt";q.language!==h&&A.runInAction(()=>{q.language=h});let b=document.getElementById("languageSelect");b&&(b.value=q.language);let x=Date.now(),_=localStorage.getItem("aquila_buyPauseEndTime"),y=_?parseInt(_,10):null;y&&!isNaN(y)&&y>x?(A.runInAction(()=>{q.buyPausedUntil=y}),z&&clearTimeout(z),z=setTimeout(()=>{A.runInAction(()=>{q.buyPausedUntil=null}),localStorage.removeItem("aquila_buyPauseEndTime"),z=null,eK(),ei(T.t("pauseExpired",{mode:T.t("buy",{defaultValue:"Compra"})}),"success"),q.buyModeActive&&!eC&&ew()},y-x)):(A.runInAction(()=>{q.buyPausedUntil=null}),_&&localStorage.removeItem("aquila_buyPauseEndTime"));let v=localStorage.getItem("aquila_sellPauseEndTime"),E=v?parseInt(v,10):null;E&&!isNaN(E)&&E>x?(A.runInAction(()=>{q.sellPausedUntil=E}),U&&clearTimeout(U),U=setTimeout(()=>{A.runInAction(()=>{q.sellPausedUntil=null}),localStorage.removeItem("aquila_sellPauseEndTime"),U=null,eK(),ei(T.t("pauseExpired",{mode:T.t("sell",{defaultValue:"Venda"})}),"success"),q.sellModeActive&&!eF&&eN()},E-x)):(A.runInAction(()=>{q.sellPausedUntil=null}),v&&localStorage.removeItem("aquila_sellPauseEndTime")),console.log("[LoadConfig v5 - Remove Refs] Fun\xe7\xe3o conclu\xedda.")},eY,eQ={},eZ=()=>{["wood","stone","iron"].forEach(e=>{let t=document.getElementById(e)||document.querySelector(`#${e}`);if(t){if(eQ[e])return;let a=new MutationObserver(()=>{let a=t.textContent||"",o=W(a);if(void 0!==D&&o!==D[e]){D[e]=o;let r=Date.now();q.buyModeActive&&!eC&&(!q.buyPausedUntil||q.buyPausedUntil<=r)&&ew(),q.sellModeActive&&!eF&&(!q.sellPausedUntil||q.sellPausedUntil<=r)&&eN()}});a.observe(t,{childList:!0,subtree:!0,characterData:!0}),eQ[e]=a}})},te={wood:document.querySelector("#premium_exchange_rate_wood .premium-exchange-sep"),stone:document.querySelector("#premium_exchange_rate_stone .premium-exchange-sep"),iron:document.querySelector("#premium_exchange_rate_iron .premium-exchange-sep")},tt={};function ta(){let e=document.getElementById("settingsPlayerName"),t=document.getElementById("settingsLicenseExpiry"),a=document.getElementById("settingsScriptVersion");if(e&&(e.textContent=u||"N\xe3o Encontrado"),t){let o=b(u);if(o&&!isNaN(o.getTime()))try{t.textContent=o.toLocaleString(q.language||"pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});let r=new Date;t.classList.remove("expired"),r>o&&t.classList.add("expired")}catch(n){console.error("Erro ao formatar data de expira\xe7\xe3o:",n),t.textContent="Erro na Data",t.classList.remove("expired")}else t.textContent="N\xe3o Dispon\xedvel",t.classList.remove("expired")}if(a)try{let i="undefined"!=typeof GM_info?GM_info.script:null;i&&i.version?a.textContent=i.version:a.textContent="6.2.0_firebase_auth_persist"}catch(s){console.error("Erro ao obter vers\xe3o do script via GM_info, usando fallback:",s),a.textContent="6.2.0_firebase_auth_persist"}}function to(){if(!q.closeTabOnHCaptcha)return!1;let e=!1;for(let t of['iframe[src*="hcaptcha.com"]','iframe[title*="hCaptcha"]',"div[data-hcaptcha-widget-id]","div.h-captcha-container",'[id^="hcaptcha-challenge"]'])if(document.querySelector(t)){e=!0;break}if(e){console.warn(T.t("hCaptchaDetectedLog",{defaultValue:"hCaptcha detectado!"})),console.log(T.t("attemptingTabCloseLog",{defaultValue:"Configura\xe7\xe3o ativa - Tentando fechar a aba..."}));try{window.close()}catch(a){console.error(T.t("tabCloseErrorLog",{defaultValue:"Erro ao tentar fechar a aba (pode ser bloqueado pelo navegador):"}),a)}return!0}return!1}let tr=!1,tn=null,ti=async()=>{console.log(`${t}: Iniciando inicializa\xe7\xe3o...`);try{if(Y(),console.log("[Init] initializeUI conclu\xedda."),!ea())throw Error("Falha CR\xcdTICA ao inicializar elementos da UI RAGNAROK. O script n\xe3o pode continuar.");if(console.log("[Init] initializeElements conclu\xedda."),eZ(),Object.entries(e5).forEach(([e,t])=>{if(t){let a=new MutationObserver(()=>{let a=W(t.textContent.trim().replace(/[^0-9.]/g,""))||100;eI.set(`rate_${e}`,a),eL(e,a),q.sellModeActive&&!eF&&eN(),q.buyModeActive&&!eC&&ew()});a.observe(t,{childList:!0,subtree:!0,characterData:!0}),ez[e]=a}}),Object.entries(te).forEach(([e,t])=>{if(!t){console.error(`Elemento para ${e} n\xe3o encontrado!`);return}let a=new MutationObserver(a=>{let o=W(t.textContent.trim().replace(/[^0-9.,]/g,"").replace(",","."))||1;eI.set(`exchange_${e}`,o),q.sellModeActive&&e7()});a.observe(t,{childList:!0,subtree:!0,characterData:!0}),tt[e]=a}),!function e(){let t=document.querySelector("#market_merchant_available_count");if(t){let a=new MutationObserver(()=>{eO(),q.sellModeActive&&!eF&&eN()});a.observe(t,{childList:!0,subtree:!0,characterData:!0}),eQ.merchants=a}}(),!function e(){let t=document.querySelector("#premium_points");if(!t)return;let a=new MutationObserver(()=>{q.buyModeActive&&!eC&&ew()});a.observe(t,{childList:!0,subtree:!0,characterData:!0})}(),!function e(){let t=document.querySelector("#storage")||document.getElementById("storage");if(!t)return;let a=()=>{let e=document.getElementById("storage");if(e){let t=e.textContent||"",a=t.match(/(\d[\d.,]*)\s*\/\s*(\d[\d.,]*)/)||t.match(/(\d[\d.,]*)/);if(a&&a[2])return W(a[2].replace(/[.,]/g,""));if(a&&a[1])return W(a[1].replace(/[.,]/g,""))}return q.storageCapacity||1e3},o=new MutationObserver(()=>{let e=a();e!==q.storageCapacity&&(q.storageCapacity=e,q.buyModeActive&&!eC&&ew())});o.observe(t,{childList:!0,subtree:!0,characterData:!0})}(),console.log("[Init] Observers configurados."),et(),ts(),console.log("[Init] Informa\xe7\xf5es da vila e estilos aplicados."),eY=eo(),er(),console.log("[Init] Handlers de recursos e elementos do jogo inicializados."),eJ(),console.log("[Init] loadConfig conclu\xedda."),eV(),console.log("[Init] setupEvents conclu\xedda."),el(),eK(),console.log("[Init] Tema e UI atualizados p\xf3s-configura\xe7\xe3o."),console.log("[Init] Verificando hCaptcha na inicializa\xe7\xe3o..."),to()){console.warn("[Init] hCaptcha detectado na inicializa\xe7\xe3o e op\xe7\xe3o ativa. Interrompendo init.");return}console.log("[Init] Verifica\xe7\xe3o inicial de hCaptcha conclu\xedda (n\xe3o detectado ou op\xe7\xe3o inativa)."),console.log("[Init] Buscando dados din\xe2micos do jogo..."),await Promise.all([M(),eD()]),await eA(),console.log("[Init] Busca de dados din\xe2micos conclu\xedda."),q.intervals&&(clearInterval(q.intervals.resourceInterval),clearInterval(q.intervals.transportInterval),delete q.intervals,console.log("[Init] Intervalos antigos limpos.")),console.log("[Init] Executando verifica\xe7\xe3o inicial de compra/venda..."),await eG(),console.log("[Init] Verifica\xe7\xe3o inicial conclu\xedda."),ta(),console.log("[Init] Informa\xe7\xf5es do usu\xe1rio populadas."),console.log(`${t}: Inicializa\xe7\xe3o completa e bem-sucedida!`)}catch(e){console.error(`${t}: Erro CR\xcdTICO durante a inicializa\xe7\xe3o:`,e);let a=T.t("initError",{defaultValue:"Erro grave na inicializa\xe7\xe3o"}),o=e.message||String(e);eu(`${a}: ${o}. Verifique o console (F12) para mais detalhes.`)}};(()=>{let e=setTimeout(()=>{let e=document.querySelector("#market_merchant_available_count"),o="undefined"!=typeof TribalWars&&TribalWars.getGameData;e&&o||(clearInterval(a),alert(`${t}: N\xe3o foi poss\xedvel iniciar. Elementos essenciais do jogo n\xe3o foram encontrados ap\xf3s 5 segundos. Recarregue a p\xe1gina ou verifique se h\xe1 outros scripts conflitando.`))},5e3),a=setInterval(()=>{try{let o=document.querySelector("#market_merchant_available_count"),r="undefined"!=typeof TribalWars&&TribalWars.getGameData,n="undefined"!=typeof Sortable;o&&r&&n&&void 0!==A&&(clearInterval(a),clearTimeout(e),ti().catch(e=>{console.error(`${t}: Erro n\xe3o capturado durante a execu\xe7\xE3o de init():`,e),eu(T.t("initError",{error:e.message||String(e)})+" Erro cr\xedtico na inicializa\xe7\xe3o.")}))}catch(i){}},200)})();let ts=()=>{let e=N("link",{rel:"stylesheet",href:"https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"});document.head.appendChild(e);let t=N("link",{rel:"stylesheet",href:"https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Poppins:wght@400;500;700&display=swap"});document.head.appendChild(t);let a=N("style");a.textContent=`

/* ====================================================== */
/* ===                ESTILOS GLOBAIS                 === */
/* ====================================================== */

@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Poppins:wght@400;500;700&display=swap');

.market-container * {
    box-sizing: border-box;
}

/* === Estilos para o Sum\xe1rio de Lucro Filtrado === */
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

/* \xcdcone Premium Point Global */
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
/* === Estilos Espec\xedficos da Modal de Transa\xe7\xf5es     === */
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
/* === ESTILOS MODAL CONFIGURA\xc7\xd5ES, GERAIS, ETC                             === */
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
  /* Esconde spinners tamb\xe9m no input num\xe9rico com \xedcone */
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

    `,document.head.appendChild(a)}}();
