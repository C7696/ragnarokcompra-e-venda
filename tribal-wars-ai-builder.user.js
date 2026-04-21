// ==UserScript==
// @name         Tribal Wars AI Build Optimizer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Otimização automática de construções com IA para Tribal Wars - Configure uma vez, execute sozinho
// @author       AI Assistant
// @match        https://*.tribalwars.nl/*
// @match        https://*.tribalwars.com.br/*
// @match        https://*.tribalwars.us/*
// @match        https://*.tribalwars.pt/*
// @match        https://*.tribalwars.de/*
// @match        https://*.tribalwars.fr/*
// @match        https://*.tribalwars.co.uk/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @connect      *
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Configurações padrão
    const defaultConfig = {
        enabled: true,
        strategy: 'balanced', // balanced, military, economic, defensive
        autoBuild: true,
        checkInterval: 10000, // 10 segundos
        minResourcesPercent: 80, // Constrói quando tem 80% dos recursos
        maxQueueTime: 300, // Máximo 5 minutos na fila
        prioritizeUpgrades: true,
        ignoreBuildings: [],
        debugMode: false
    };

    // Dados dos edifícios (níveis máximos e benefícios)
    const buildingData = {
        main: { name: 'Sede', maxLevel: 25, priority: 10 },
        barracks: { name: 'Quartel', maxLevel: 25, priority: 8 },
        stable: { name: 'Estábulo', maxLevel: 25, priority: 7 },
        workshop: { name: 'Oficina', maxLevel: 25, priority: 6 },
        warehouse: { name: 'Armazém', maxLevel: 30, priority: 9 },
        hide: { name: 'Esconderijo', maxLevel: 10, priority: 5 },
        farm: { name: 'Fazenda', maxLevel: 30, priority: 9 },
        market: { name: 'Mercado', maxLevel: 25, priority: 7 },
        wood: { name: 'Serraria', maxLevel: 30, priority: 8 },
        clay: { name: 'Olaria', maxLevel: 30, priority: 8 },
        iron: { name: 'Mina de Ferro', maxLevel: 30, priority: 8 },
        storage: { name: 'Celeiro', maxLevel: 30, priority: 9 },
        wall: { name: 'Muralha', maxLevel: 20, priority: 6 },
        smith: { name: 'Ferreiro', maxLevel: 25, priority: 7 },
        place: { name: 'Praça', maxLevel: 20, priority: 4 },
        statue: { name: 'Estátua', maxLevel: 1, priority: 1 },
        rally_point: { name: 'Ponto de Encontro', maxLevel: 15, priority: 5 }
    };

    // Estratégias de construção
    const strategies = {
        balanced: {
            weights: {
                main: 10, barracks: 7, stable: 6, workshop: 5,
                warehouse: 9, hide: 4, farm: 9, market: 6,
                wood: 8, clay: 8, iron: 8, storage: 9,
                wall: 5, smith: 6, place: 3, statue: 1, rally_point: 4
            }
        },
        military: {
            weights: {
                main: 8, barracks: 10, stable: 9, workshop: 8,
                warehouse: 7, hide: 6, farm: 8, market: 5,
                wood: 7, clay: 7, iron: 7, storage: 7,
                wall: 7, smith: 10, place: 4, statue: 1, rally_point: 8
            }
        },
        economic: {
            weights: {
                main: 9, barracks: 5, stable: 4, workshop: 4,
                warehouse: 10, hide: 5, farm: 10, market: 9,
                wood: 10, clay: 10, iron: 10, storage: 10,
                wall: 4, smith: 5, place: 6, statue: 1, rally_point: 3
            }
        },
        defensive: {
            weights: {
                main: 9, barracks: 8, stable: 6, workshop: 5,
                warehouse: 8, hide: 10, farm: 8, market: 6,
                wood: 7, clay: 7, iron: 7, storage: 8,
                wall: 10, smith: 7, place: 5, statue: 1, rally_point: 6
            }
        }
    };

    let config = GM_getValue('tw_ai_config') || defaultConfig;
    let isRunning = false;
    let lastCheck = 0;

    // Função para salvar configuração
    function saveConfig() {
        GM_setValue('tw_ai_config', config);
    }

    // Função para obter recursos atuais
    function getResources() {
        try {
            const woodEl = document.querySelector('#resource_bar .wood');
            const clayEl = document.querySelector('#resource_bar .stone');
            const ironEl = document.querySelector('#resource_bar .iron');
            
            if (!woodEl || !clayEl || !ironEl) return null;

            const parseResource = (text) => {
                return parseInt(text.replace(/\./g, '').replace(/\s/g, ''));
            };

            return {
                wood: parseResource(woodEl.textContent),
                clay: parseResource(clayEl.textContent),
                iron: parseResource(ironEl.textContent),
                timestamp: Date.now()
            };
        } catch (e) {
            if (config.debugMode) console.log('Erro ao obter recursos:', e);
            return null;
        }
    }

    // Função para obter níveis atuais dos edifícios
    function getBuildingLevels() {
        const levels = {};
        try {
            const buildings = document.querySelectorAll('#buildings_table tr[id^="building_"]');
            buildings.forEach(building => {
                const id = building.id.replace('building_', '');
                const levelEl = building.querySelector('.lvl');
                if (levelEl) {
                    const levelText = levelEl.textContent;
                    const match = levelText.match(/(\d+)/);
                    if (match) {
                        levels[id] = parseInt(match[1]);
                    }
                }
            });
        } catch (e) {
            if (config.debugMode) console.log('Erro ao obter níveis:', e);
        }
        return levels;
    }

    // Função para verificar se há construção em andamento
    function isBuildingInProgress() {
        try {
            const queueEl = document.querySelector('#building_queue');
            if (!queueEl) return false;
            
            const activeBuilds = queueEl.querySelectorAll('.building_active');
            return activeBuilds.length > 0;
        } catch (e) {
            return false;
        }
    }

    // Função para obter custos de construção (simulado - precisa ser ajustado por servidor)
    function getBuildingCosts(buildingId, currentLevel) {
        const baseCosts = {
            main: { wood: 40, clay: 80, iron: 40 },
            barracks: { wood: 100, clay: 80, iron: 40 },
            stable: { wood: 200, clay: 150, iron: 100 },
            workshop: { wood: 200, clay: 250, iron: 150 },
            warehouse: { wood: 100, clay: 150, iron: 100 },
            hide: { wood: 100, clay: 100, iron: 50 },
            farm: { wood: 70, clay: 90, iron: 50 },
            market: { wood: 100, clay: 100, iron: 100 },
            wood: { wood: 60, clay: 40, iron: 20 },
            clay: { wood: 80, clay: 40, iron: 20 },
            iron: { wood: 100, clay: 80, iron: 40 },
            storage: { wood: 130, clay: 170, iron: 90 },
            wall: { wood: 0, clay: 50, iron: 80 },
            smith: { wood: 50, clay: 100, iron: 150 },
            place: { wood: 100, clay: 100, iron: 100 },
            statue: { wood: 1000, clay: 1000, iron: 1000 },
            rally_point: { wood: 50, clay: 50, iron: 50 }
        };

        const base = baseCosts[buildingId] || { wood: 100, clay: 100, iron: 100 };
        const multiplier = Math.pow(1.5, currentLevel); // Fórmula exponencial comum

        return {
            wood: Math.floor(base.wood * multiplier),
            clay: Math.floor(base.clay * multiplier),
            iron: Math.floor(base.iron * multiplier)
        };
    }

    // Função de IA para decidir próxima construção
    function aiDecideNextBuilding() {
        const resources = getResources();
        const levels = getBuildingLevels();
        
        if (!resources || !levels) return null;

        const strategy = strategies[config.strategy] || strategies.balanced;
        const candidates = [];

        // Analisar cada edifício
        Object.keys(buildingData).forEach(buildingId => {
            if (config.ignoreBuildings.includes(buildingId)) return;
            
            const currentLevel = levels[buildingId] || 0;
            const maxLevel = buildingData[buildingId].maxLevel;
            
            if (currentLevel >= maxLevel) return;

            const costs = getBuildingCosts(buildingId, currentLevel);
            const weight = strategy.weights[buildingId] || 5;
            
            // Calcular score baseado em múltiplos fatores
            let score = weight;

            // Bônus por estar abaixo do nível médio
            const avgLevel = Object.values(levels).reduce((a, b) => a + b, 0) / Object.keys(levels).length;
            if (currentLevel < avgLevel) score += 2;

            // Bônus por recursos suficientes
            const hasResources = resources.wood >= costs.wood && 
                               resources.clay >= costs.clay && 
                               resources.iron >= costs.iron;
            if (hasResources) score += 5;

            // Penalidade por custo muito alto
            const totalCost = costs.wood + costs.clay + costs.iron;
            const totalResources = resources.wood + resources.clay + resources.iron;
            if (totalCost > totalResources * 0.5) score -= 3;

            candidates.push({
                id: buildingId,
                name: buildingData[buildingId].name,
                currentLevel,
                nextLevel: currentLevel + 1,
                costs,
                score,
                hasResources
            });
        });

        // Ordenar por score e retornar o melhor
        candidates.sort((a, b) => b.score - a.score);
        return candidates[0] || null;
    }

    // Função para iniciar construção
    function startBuilding(buildingId) {
        try {
            const buildingRow = document.querySelector(`#building_${buildingId}`);
            if (!buildingRow) return false;

            const upgradeBtn = buildingRow.querySelector('a[href*="cmd=upgrade"]');
            if (!upgradeBtn) return false;

            if (config.debugMode) {
                console.log(`Iniciando construção: ${buildingId}`);
                return true; // Em debug mode, não clica realmente
            }

            upgradeBtn.click();
            return true;
        } catch (e) {
            if (config.debugMode) console.log('Erro ao iniciar construção:', e);
            return false;
        }
    }

    // Função principal de verificação
    function checkAndBuild() {
        if (!config.enabled || !config.autoBuild) return;
        
        if (isBuildingInProgress()) {
            if (config.debugMode) console.log('Construção em andamento, aguardando...');
            return;
        }

        const decision = aiDecideNextBuilding();
        if (!decision) {
            if (config.debugMode) console.log('Nenhuma construção disponível no momento');
            return;
        }

        if (!decision.hasResources) {
            if (config.debugMode) console.log(`Recursos insuficientes para ${decision.name}`);
            return;
        }

        if (startBuilding(decision.id)) {
            GM_notification({
                text: `Construindo ${decision.name} (nível ${decision.nextLevel})`,
                title: 'Tribal Wars AI Builder',
                timeout: 5000
            });
            
            if (config.debugMode) {
                console.log(`✅ Construção iniciada: ${decision.name}`);
            }
        }
    }

    // Interface do usuário
    function createUI() {
        const uiContainer = document.createElement('div');
        uiContainer.id = 'tw-ai-builder-ui';
        uiContainer.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.85);
            border: 2px solid #gold;
            border-radius: 10px;
            padding: 15px;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 12px;
            z-index: 10000;
            width: 300px;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        `;

        uiContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; color: #FFD700;">🤖 AI Build Optimizer</h3>
                <button id="tw-ai-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">×</button>
            </div>
            
            <div style="margin-bottom: 10px;">
                <label style="display: flex; align-items: center; margin-bottom: 5px;">
                    <input type="checkbox" id="tw-ai-enabled" ${config.enabled ? 'checked' : ''} style="margin-right: 5px;">
                    Ativar Auto-Construção
                </label>
                
                <label style="display: block; margin-bottom: 5px;">
                    Estratégia:
                    <select id="tw-ai-strategy" style="width: 100%; margin-top: 3px; padding: 3px;">
                        <option value="balanced" ${config.strategy === 'balanced' ? 'selected' : ''}>Equilibrada</option>
                        <option value="military" ${config.strategy === 'military' ? 'selected' : ''}>Militar</option>
                        <option value="economic" ${config.strategy === 'economic' ? 'selected' : ''}>Econômica</option>
                        <option value="defensive" ${config.strategy === 'defensive' ? 'selected' : ''}>Defensiva</option>
                    </select>
                </label>
                
                <label style="display: block; margin-bottom: 5px;">
                    Intervalo (segundos):
                    <input type="number" id="tw-ai-interval" value="${config.checkInterval / 1000}" min="5" max="60" style="width: 100%; margin-top: 3px; padding: 3px;">
                </label>
                
                <label style="display: flex; align-items: center; margin-bottom: 5px;">
                    <input type="checkbox" id="tw-ai-debug" ${config.debugMode ? 'checked' : ''} style="margin-right: 5px;">
                    Modo Debug
                </label>
            </div>
            
            <div id="tw-ai-status" style="background: rgba(255, 255, 255, 0.1); padding: 8px; border-radius: 5px; margin-bottom: 10px;">
                <strong>Status:</strong> <span id="tw-ai-status-text">Aguardando...</span>
            </div>
            
            <div id="tw-ai-next-build" style="background: rgba(255, 215, 0, 0.2); padding: 8px; border-radius: 5px; border: 1px solid #FFD700;">
                <strong>Próxima Construção:</strong><br>
                <span id="tw-ai-next-text">Analisando...</span>
            </div>
            
            <div style="margin-top: 10px; display: flex; gap: 5px;">
                <button id="tw-ai-save" style="flex: 1; background: #4CAF50; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">Salvar</button>
                <button id="tw-ai-reset" style="flex: 1; background: #f44336; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">Resetar</button>
            </div>
            
            <div style="margin-top: 10px; font-size: 10px; color: #aaa; text-align: center;">
                Configure uma vez, execute sozinho! ⚡
            </div>
        `;

        document.body.appendChild(uiContainer);

        // Event listeners
        document.getElementById('tw-ai-close').addEventListener('click', () => {
            uiContainer.style.display = 'none';
        });

        document.getElementById('tw-ai-save').addEventListener('click', () => {
            config.enabled = document.getElementById('tw-ai-enabled').checked;
            config.strategy = document.getElementById('tw-ai-strategy').value;
            config.checkInterval = parseInt(document.getElementById('tw-ai-interval').value) * 1000;
            config.debugMode = document.getElementById('tw-ai-debug').checked;
            
            saveConfig();
            updateStatus('Configurações salvas! ✅');
            
            GM_notification({
                text: 'Configurações salvas com sucesso!',
                title: 'Tribal Wars AI Builder',
                timeout: 3000
            });
        });

        document.getElementById('tw-ai-reset').addEventListener('click', () => {
            config = { ...defaultConfig };
            saveConfig();
            location.reload();
        });

        // Atualizar status periodicamente
        setInterval(updateStatusInfo, 2000);
    }

    function updateStatus(message) {
        const statusEl = document.getElementById('tw-ai-status-text');
        if (statusEl) statusEl.textContent = message;
    }

    function updateStatusInfo() {
        const nextBuildEl = document.getElementById('tw-ai-next-text');
        const statusEl = document.getElementById('tw-ai-status-text');
        
        if (!nextBuildEl || !statusEl) return;

        if (!config.enabled) {
            statusEl.textContent = 'Desativado';
            nextBuildEl.textContent = 'Ative para começar';
            return;
        }

        statusEl.textContent = 'Ativo - Monitorando...';
        
        const decision = aiDecideNextBuilding();
        if (decision) {
            nextBuildEl.textContent = `${decision.name} (nível ${decision.nextLevel}) - ${decision.hasResources ? '✅ Pronto' : '⏳ Aguardando recursos'}`;
        } else {
            nextBuildEl.textContent = 'Nenhuma construção disponível';
        }
    }

    // Inicialização
    function init() {
        // Aguardar carregamento da página
        if (document.readyState !== 'complete') {
            setTimeout(init, 100);
            return;
        }

        // Verificar se estamos na página correta (aldeia)
        if (!document.querySelector('#resource_bar')) {
            if (config.debugMode) console.log('Não é uma página de aldeia, aguardando...');
            setTimeout(init, 1000);
            return;
        }

        createUI();
        
        // Iniciar loop de verificação
        setInterval(checkAndBuild, config.checkInterval);
        
        if (config.debugMode) {
            console.log('🤖 Tribal Wars AI Builder iniciado!');
            console.log('Configuração:', config);
        }
    }

    // Iniciar script
    init();
})();
