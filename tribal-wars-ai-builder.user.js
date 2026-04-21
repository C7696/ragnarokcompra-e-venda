// ==UserScript==
// @name         Tribal Wars AI Build Optimizer
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  IA automática para otimização de construções no Tribal Wars - Minimalista e Eficiente
// @author       Steve Jobs Style
// @match        https://*.tribalwars.nl/*
// @match        https://*.tribalwars.com.br/*
// @match        https://*.tribalwars.us/*
// @match        https://*.tribalwars.pt/*
// @match        https://*.tribalwars.de/*
// @match        https://*.tribalwars.fr/*
// @match        https://*.tribalwars.co.uk/*
// @match        https://*.tribalwars.it/*
// @match        https://*.tribalwars.es/*
// @match        https://*.tribalwars.pl/*
// @match        https://*.tribalwars.se/*
// @match        https://*.tribalwars.dk/*
// @match        https://*.tribalwars.no/*
// @match        https://*.tribalwars.fi/*
// @match        https://*.tribalwars.be/*
// @match        https://*.tribalwars.at/*
// @match        https://*.tribalwars.ch/*
// @match        https://*.tribalwars.cz/*
// @match        https://*.tribalwars.sk/*
// @match        https://*.tribalwars.hu/*
// @match        https://*.tribalwars.ro/*
// @match        https://*.tribalwars.bg/*
// @match        https://*.tribalwars.hr/*
// @match        https://*.tribalwars.si/*
// @match        https://*.tribalwars.lt/*
// @match        https://*.tribalwars.lv/*
// @match        https://*.tribalwars.ee/*
// @match        https://*.tribalwars.gr/*
// @match        https://*.tribalwars.tr/*
// @match        https://*.tribalwars.ru/*
// @match        https://*.tribalwars.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @grant        GM_addStyle
// @run-at       document-end
// @updateURL    https://cdn.jsdelivr.net/gh/tribal-wars-scripts/tribal-wars-ai-builder@main/tribal-wars-ai-builder.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/tribal-wars-scripts/tribal-wars-ai-builder@main/tribal-wars-ai-builder.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Configurações padrão
    const DEFAULT_CONFIG = {
        enabled: false,
        strategy: 'balanced',
        interval: 10,
        debug: false
    };

    // Estratégias de construção
    const STRATEGIES = {
        balanced: {
            name: 'Equilibrada',
            weights: {
                wood: 1.0, clay: 1.0, iron: 1.0,
                farm: 0.8, storage: 0.9, hide: 0.7,
                wall: 0.6, barracks: 0.5, stable: 0.4,
                workshop: 0.3, smith: 0.5, market: 0.4,
                church: 0.2, statue: 0.1
            }
        },
        military: {
            name: 'Militar',
            weights: {
                wood: 0.8, clay: 0.8, iron: 1.0,
                farm: 0.9, storage: 0.7, hide: 0.6,
                wall: 0.7, barracks: 1.0, stable: 0.9,
                workshop: 0.8, smith: 1.0, market: 0.3,
                church: 0.1, statue: 0.1
            }
        },
        economic: {
            name: 'Econômica',
            weights: {
                wood: 1.0, clay: 1.0, iron: 1.0,
                farm: 1.0, storage: 1.0, hide: 0.5,
                wall: 0.4, barracks: 0.3, stable: 0.2,
                workshop: 0.2, smith: 0.4, market: 0.8,
                church: 0.3, statue: 0.2
            }
        },
        defensive: {
            name: 'Defensiva',
            weights: {
                wood: 0.9, clay: 0.9, iron: 0.8,
                farm: 0.8, storage: 0.9, hide: 1.0,
                wall: 1.0, barracks: 0.7, stable: 0.5,
                workshop: 0.4, smith: 0.6, market: 0.3,
                church: 0.2, statue: 0.1
            }
        }
    };

    // Custos base dos edifícios
    const BUILDING_COSTS = {
        wood: { wood: 60, clay: 70, iron: 50 },
        clay: { wood: 70, clay: 80, iron: 50 },
        iron: { wood: 80, clay: 90, iron: 60 },
        farm: { wood: 100, clay: 120, iron: 80 },
        storage: { wood: 130, clay: 150, iron: 100 },
        hide: { wood: 140, clay: 160, iron: 110 },
        wall: { wood: 150, clay: 170, iron: 120 },
        barracks: { wood: 160, clay: 180, iron: 130 },
        stable: { wood: 200, clay: 220, iron: 150 },
        workshop: { wood: 250, clay: 270, iron: 180 },
        smith: { wood: 180, clay: 200, iron: 140 },
        market: { wood: 170, clay: 190, iron: 130 },
        church: { wood: 300, clay: 320, iron: 220 },
        statue: { wood: 400, clay: 420, iron: 300 }
    };

    // Nomes dos edifícios em NL (Holandês)
    const BUILDING_NAMES_NL = {
        wood: 'Houthakkersgebouw',
        clay: 'Leemgroeve',
        iron: 'Ijzermijn',
        farm: 'Boerderij',
        storage: 'Opslagplaats',
        hide: 'Schuilplaats',
        wall: 'Muur',
        barracks: 'Kazerne',
        stable: 'Stal',
        workshop: 'Werkplaats',
        smith: 'Smederij',
        market: 'Markt',
        church: 'Kerk',
        statue: 'Standbeeld'
    };

    class TribalWarsOptimizer {
        constructor() {
            this.config = this.loadConfig();
            this.resources = { wood: 0, clay: 0, iron: 0, storage: 0 };
            this.buildings = {};
            this.queueActive = false;
            this.intervalId = null;
            this.init();
        }

        loadConfig() {
            const saved = localStorage.getItem('tw_optimizer_config');
            return saved ? JSON.parse(saved) : { ...DEFAULT_CONFIG };
        }

        saveConfig() {
            localStorage.setItem('tw_optimizer_config', JSON.stringify(this.config));
        }

        init() {
            if (!this.isInVillage()) return;
            
            this.createUI();
            this.updateResources();
            this.scanBuildings();
            
            if (this.config.enabled) {
                this.startAutoBuild();
            }

            // Atualizar recursos a cada 3 segundos
            setInterval(() => this.updateResources(), 3000);
        }

        isInVillage() {
            return document.querySelector('#wood.res') !== null;
        }

        updateResources() {
            const woodEl = document.querySelector('#wood.res');
            const stoneEl = document.querySelector('#stone.res');
            const ironEl = document.querySelector('#iron.res');
            const storageEl = document.querySelector('#storage');

            if (woodEl) this.resources.wood = parseInt(woodEl.textContent.replace(/\D/g, '')) || 0;
            if (stoneEl) this.resources.clay = parseInt(stoneEl.textContent.replace(/\D/g, '')) || 0;
            if (ironEl) this.resources.iron = parseInt(ironEl.textContent.replace(/\D/g, '')) || 0;
            if (storageEl) this.resources.storage = parseInt(storageEl.textContent.replace(/\D/g, '')) || 1000;

            if (this.config.debug) {
                console.log('Recursos:', this.resources);
            }
        }

        scanBuildings() {
            const buildingRows = document.querySelectorAll('tr[id^="production_build_"], tr[id^="main_build_"]');
            
            buildingRows.forEach(row => {
                const id = row.id;
                const levelEl = row.querySelector('.lvl');
                
                if (levelEl) {
                    const level = parseInt(levelEl.textContent) || 0;
                    
                    if (id.includes('wood')) this.buildings.wood = level;
                    else if (id.includes('clay') || id.includes('stone')) this.buildings.clay = level;
                    else if (id.includes('iron')) this.buildings.iron = level;
                    else if (id.includes('farm')) this.buildings.farm = level;
                    else if (id.includes('storage')) this.buildings.storage = level;
                    else if (id.includes('hide')) this.buildings.hide = level;
                    else if (id.includes('wall')) this.buildings.wall = level;
                    else if (id.includes('barracks')) this.buildings.barracks = level;
                    else if (id.includes('stable')) this.buildings.stable = level;
                    else if (id.includes('workshop')) this.buildings.workshop = level;
                    else if (id.includes('smith')) this.buildings.smith = level;
                    else if (id.includes('market')) this.buildings.market = level;
                    else if (id.includes('church')) this.buildings.church = level;
                    else if (id.includes('statue')) this.buildings.statue = level;
                }
            });

            // Verificar fila de construção
            const queueEl = document.querySelector('.buildingqueue');
            this.queueActive = queueEl && queueEl.querySelectorAll('tr').length > 0;

            if (this.config.debug) {
                console.log('Edifícios:', this.buildings);
                console.log('Fila ativa:', this.queueActive);
            }
        }

        calculateCost(building, currentLevel) {
            const base = BUILDING_COSTS[building];
            if (!base) return null;

            const multiplier = Math.pow(1.5, currentLevel);
            return {
                wood: Math.floor(base.wood * multiplier),
                clay: Math.floor(base.clay * multiplier),
                iron: Math.floor(base.iron * multiplier)
            };
        }

        canAfford(cost) {
            return cost && 
                   this.resources.wood >= cost.wood && 
                   this.resources.clay >= cost.clay && 
                   this.resources.iron >= cost.iron;
        }

        getNextBuilding() {
            const strategy = STRATEGIES[this.config.strategy];
            let bestBuilding = null;
            let bestScore = -Infinity;

            for (const [building, weight] of Object.entries(strategy.weights)) {
                const currentLevel = this.buildings[building] || 0;
                const cost = this.calculateCost(building, currentLevel);
                
                if (!cost || !this.canAfford(cost)) continue;

                // Score baseado em peso da estratégia e nível atual (prioriza níveis mais baixos)
                const score = weight * (1 / (currentLevel + 1)) * 100;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestBuilding = { building, cost, level: currentLevel + 1, score };
                }
            }

            return bestBuilding;
        }

        buildNext() {
            if (this.queueActive) {
                if (this.config.debug) console.log('Fila ocupada, aguardando...');
                return;
            }

            const next = this.getNextBuilding();
            if (!next) {
                if (this.config.debug) console.log('Sem recursos para construir nada');
                return;
            }

            // Clicar no botão de construir
            const buildButton = document.querySelector(`#building_${next.building}_upgrade`);
            if (buildButton) {
                buildButton.click();
                
                const buildingName = BUILDING_NAMES_NL[next.building] || next.building;
                console.log(`🏗️ Construindo ${buildingName} nível ${next.level}`);
                
                // Notificação visual
                this.showNotification(`Construindo ${buildingName} nível ${next.level}`);
                
                // Reescanear após construção
                setTimeout(() => this.scanBuildings(), 2000);
            }
        }

        showNotification(message) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: slideDown 0.3s ease-out;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideUp 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        startAutoBuild() {
            if (this.intervalId) clearInterval(this.intervalId);
            
            this.intervalId = setInterval(() => {
                this.scanBuildings();
                this.buildNext();
            }, this.config.interval * 1000);

            console.log(`🤖 Auto-construção ativada (${this.config.interval}s)`);
        }

        stopAutoBuild() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            console.log('⏸️ Auto-construção pausada');
        }

        createUI() {
            // Container principal - Canto superior esquerdo (estilo minimalista)
            const container = document.createElement('div');
            container.id = 'tw-optimizer-panel';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: rgba(255, 255, 255, 0.98);
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 13px;
                z-index: 9999;
                min-width: 280px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(0,0,0,0.08);
            `;

            // Header
            const header = document.createElement('div');
            header.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                padding-bottom: 12px;
                border-bottom: 1px solid rgba(0,0,0,0.06);
            `;
            header.innerHTML = `
                <div style="font-weight: 600; color: #1d1d1f; font-size: 15px;">Build Optimizer</div>
                <div id="tw-status" style="width: 8px; height: 8px; border-radius: 50%; background: ${this.config.enabled ? '#34c759' : '#8e8e93'};"></div>
            `;

            // Toggle
            const toggleRow = document.createElement('div');
            toggleRow.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            `;
            toggleRow.innerHTML = `
                <span style="color: #1d1d1f; font-weight: 500;">Auto-construir</span>
                <label style="position: relative; display: inline-block; width: 44px; height: 24px;">
                    <input type="checkbox" ${this.config.enabled ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                    <span id="tw-toggle" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${this.config.enabled ? '#34c759' : '#e5e5ea'}; transition: 0.3s; border-radius: 24px;">
                        <span style="position: absolute; content: ''; height: 20px; width: 20px; left: ${this.config.enabled ? '22px' : '2px'}; bottom: 2px; background-color: white; transition: 0.3s; border-radius: 50%;"></span>
                    </span>
                </label>
            `;

            // Strategy selector
            const strategyRow = document.createElement('div');
            strategyRow.style.cssText = `margin-bottom: 12px;`;
            strategyRow.innerHTML = `
                <div style="color: #1d1d1f; font-weight: 500; margin-bottom: 6px;">Estratégia</div>
                <select id="tw-strategy" style="width: 100%; padding: 8px; border: 1px solid #d2d2d7; border-radius: 8px; font-size: 13px; background: white; color: #1d1d1f;">
                    ${Object.entries(STRATEGIES).map(([key, value]) => 
                        `<option value="${key}" ${this.config.strategy === key ? 'selected' : ''}>${value.name}</option>`
                    ).join('')}
                </select>
            `;

            // Interval selector
            const intervalRow = document.createElement('div');
            intervalRow.style.cssText = `margin-bottom: 12px;`;
            intervalRow.innerHTML = `
                <div style="color: #1d1d1f; font-weight: 500; margin-bottom: 6px;">Intervalo (segundos)</div>
                <input type="range" id="tw-interval" min="5" max="60" value="${this.config.interval}" 
                    style="width: 100%; accent-color: #007aff;">
                <div style="text-align: center; color: #86868b; font-size: 12px; margin-top: 4px;">${this.config.interval}s</div>
            `;

            // Debug toggle
            const debugRow = document.createElement('div');
            debugRow.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            `;
            debugRow.innerHTML = `
                <span style="color: #1d1d1f; font-weight: 500;">Debug</span>
                <label style="position: relative; display: inline-block; width: 44px; height: 24px;">
                    <input type="checkbox" ${this.config.debug ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                    <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${this.config.debug ? '#34c759' : '#e5e5ea'}; transition: 0.3s; border-radius: 24px;">
                        <span style="position: absolute; content: ''; height: 20px; width: 20px; left: ${this.config.debug ? '22px' : '2px'}; bottom: 2px; background-color: white; transition: 0.3s; border-radius: 50%;"></span>
                    </span>
                </label>
            `;

            // Resources display
            const resourcesDiv = document.createElement('div');
            resourcesDiv.id = 'tw-resources';
            resourcesDiv.style.cssText = `
                background: rgba(0,0,0,0.04);
                border-radius: 8px;
                padding: 10px;
                margin-top: 12px;
                font-size: 12px;
            `;
            resourcesDiv.innerHTML = `
                <div style="color: #86868b; margin-bottom: 6px; font-weight: 500;">Recursos</div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
                    <div><span style="color: #8B4513;">●</span> <span id="tw-wood">0</span></div>
                    <div><span style="color: #CD853F;">●</span> <span id="tw-clay">0</span></div>
                    <div><span style="color: #708090;">●</span> <span id="tw-iron">0</span></div>
                </div>
            `;

            // Next build info
            const nextBuildDiv = document.createElement('div');
            nextBuildDiv.id = 'tw-next-build';
            nextBuildDiv.style.cssText = `
                background: rgba(0,122,255,0.08);
                border-radius: 8px;
                padding: 10px;
                margin-top: 10px;
                font-size: 12px;
                color: #007aff;
                display: none;
            `;

            // Montar UI
            container.appendChild(header);
            container.appendChild(toggleRow);
            container.appendChild(strategyRow);
            container.appendChild(intervalRow);
            container.appendChild(debugRow);
            container.appendChild(resourcesDiv);
            container.appendChild(nextBuildDiv);
            document.body.appendChild(container);

            // Event listeners
            const checkbox = toggleRow.querySelector('input[type="checkbox"]');
            const toggle = document.getElementById('tw-toggle');
            const status = document.getElementById('tw-status');
            
            checkbox.addEventListener('change', () => {
                this.config.enabled = checkbox.checked;
                toggle.querySelector('span').style.left = checkbox.checked ? '22px' : '2px';
                toggle.style.backgroundColor = checkbox.checked ? '#34c759' : '#e5e5ea';
                status.style.background = checkbox.checked ? '#34c759' : '#8e8e93';
                this.saveConfig();
                
                if (checkbox.checked) {
                    this.startAutoBuild();
                } else {
                    this.stopAutoBuild();
                }
            });

            const strategySelect = document.getElementById('tw-strategy');
            strategySelect.addEventListener('change', () => {
                this.config.strategy = strategySelect.value;
                this.saveConfig();
            });

            const intervalInput = document.getElementById('tw-interval');
            const intervalDisplay = intervalRow.querySelector('div:last-child');
            intervalInput.addEventListener('input', () => {
                this.config.interval = parseInt(intervalInput.value);
                intervalDisplay.textContent = `${this.config.interval}s`;
                this.saveConfig();
                
                if (this.config.enabled) {
                    this.startAutoBuild();
                }
            });

            const debugCheckbox = debugRow.querySelector('input[type="checkbox"]');
            debugCheckbox.addEventListener('change', () => {
                this.config.debug = debugCheckbox.checked;
                this.saveConfig();
            });

            // Atualizar display de recursos periodicamente
            setInterval(() => this.updateResourceDisplay(), 2000);
            setInterval(() => this.updateNextBuildDisplay(), 5000);
        }

        updateResourceDisplay() {
            document.getElementById('tw-wood').textContent = this.resources.wood.toLocaleString();
            document.getElementById('tw-clay').textContent = this.resources.clay.toLocaleString();
            document.getElementById('tw-iron').textContent = this.resources.iron.toLocaleString();
        }

        updateNextBuildDisplay() {
            const nextBuildDiv = document.getElementById('tw-next-build');
            
            if (this.config.enabled && !this.queueActive) {
                const next = this.getNextBuilding();
                if (next) {
                    const buildingName = BUILDING_NAMES_NL[next.building] || next.building;
                    nextBuildDiv.style.display = 'block';
                    nextBuildDiv.innerHTML = `
                        <div style="font-weight: 600; margin-bottom: 4px;">Próxima construção</div>
                        <div>${buildingName} → Nível ${next.level}</div>
                        <div style="font-size: 11px; margin-top: 4px; opacity: 0.8;">
                            🪵 ${next.cost.wood.toLocaleString()} | 🧱 ${next.cost.clay.toLocaleString()} | 🔩 ${next.cost.iron.toLocaleString()}
                        </div>
                    `;
                    return;
                }
            }
            
            nextBuildDiv.style.display = 'none';
        }
    }

    // Inicializar quando a página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new TribalWarsOptimizer());
    } else {
        new TribalWarsOptimizer();
    }

    // Adicionar animações CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translate(-50%, -100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translate(-50%, 0); opacity: 1; }
            to { transform: translate(-50%, -100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

})();
