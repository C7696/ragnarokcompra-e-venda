// ==UserScript==
// @name         Tribal Wars - Otimizador de Construções
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Otimiza construções no Tribal Wars - Mostra melhores edifícios para construir, tempos e atalhos
// @author       Você
// @match        https://*.tribalwars.nl/*
// @match        https://*.tribalwars.com.br/*
// @match        https://*.tribalwars.us/*
// @match        https://*.tribalwars.pt/*
// @match        https://*.tribalwars.co.uk/*
// @match        https://*.tribalwars.de/*
// @match        https://*.tribalwars.fr/*
// @match        https://*.tribalwars.it/*
// @match        https://*.tribalwars.es/*
// @match        https://*.tribalwars.pl/*
// @match        https://*.tribalwars.ru/*
// @match        https://*.tribalwars.gr/*
// @match        https://*.tribalwars.ro/*
// @match        https://*.tribalwars.bg/*
// @match        https://*.tribalwars.hr/*
// @match        https://*.tribalwars.si/*
// @match        https://*.tribalwars.sk/*
// @match        https://*.tribalwars.cz/*
// @match        https://*.tribalwars.hu/*
// @match        https://*.tribalwars.se/*
// @match        https://*.tribalwars.no/*
// @match        https://*.tribalwars.dk/*
// @match        https://*.tribalwars.fi/*
// @match        https://*.tribalwars.be/*
// @match        https://*.tribalwars.at/*
// @match        https://*.tribalwars.ch/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Configurações
    const CONFIG = {
        debug: false,
        refreshInterval: 5000, // ms
        showRecommendations: true,
        showBuildTime: true,
        showResourceCost: true
    };

    // Dados dos edifícios (custos base e multiplicadores)
    const BUILDINGS = {
        main: { name: 'Sede', baseCost: { wood: 30, clay: 40, iron: 60 }, factor: 1.2 },
        barracks: { name: 'Quartel', baseCost: { wood: 200, clay: 150, iron: 100 }, factor: 1.2 },
        stable: { name: 'Estábulo', baseCost: { wood: 200, clay: 200, iron: 150 }, factor: 1.2 },
        workshop: { name: 'Oficina', baseCost: { wood: 200, clay: 250, iron: 200 }, factor: 1.2 },
        warehouse: { name: 'Armazém', baseCost: { wood: 80, clay: 100, iron: 80 }, factor: 1.15 },
        hide: { name: 'Esconderijo', baseCost: { wood: 100, clay: 100, iron: 100 }, factor: 1.2 },
        rally_point: { name: 'Ponto de reunião', baseCost: { wood: 150, clay: 150, iron: 150 }, factor: 1.2 },
        market: { name: 'Mercado', baseCost: { wood: 100, clay: 150, iron: 100 }, factor: 1.2 },
        church: { name: 'Igreja', baseCost: { wood: 200, clay: 200, iron: 200 }, factor: 1.2 },
        smith: { name: 'Ferreiro', baseCost: { wood: 150, clay: 100, iron: 150 }, factor: 1.2 },
        statue: { name: 'Estatua', baseCost: { wood: 300, clay: 300, iron: 300 }, factor: 1.2 },
        wall: { name: 'Muralha', baseCost: { wood: 100, clay: 100, iron: 100 }, factor: 1.18 },
        farm: { name: 'Fazenda', baseCost: { wood: 70, clay: 90, iron: 50 }, factor: 1.15 },
        storage: { name: 'Celeiro', baseCost: { wood: 80, clay: 100, iron: 80 }, factor: 1.15 },
        academy: { name: 'Academia', baseCost: { wood: 300, clay: 300, iron: 300 }, factor: 1.2 },
        lucky: { name: 'Fonte da sorte', baseCost: { wood: 500, clay: 500, iron: 500 }, factor: 1.2 }
    };

    // Estratégias de construção
    const STRATEGIES = {
        balanced: 'Equilibrado',
        military: 'Militar',
        economic: 'Econômico',
        defensive: 'Defensivo'
    };

    let currentStrategy = 'balanced';
    let resources = { wood: 0, clay: 0, iron: 0 };
    let buildingLevels = {};

    // Função para obter recursos atuais
    function getResources() {
        const resourceElements = document.querySelectorAll('.resources .wood, .resources .stone, .resources .iron');
        if (resourceElements.length >= 3) {
            resources.wood = parseInt(resourceElements[0].textContent.replace(/[^0-9]/g, '')) || 0;
            resources.clay = parseInt(resourceElements[1].textContent.replace(/[^0-9]/g, '')) || 0;
            resources.iron = parseInt(resourceElements[2].textContent.replace(/[^0-9]/g, '')) || 0;
        } else {
            // Tentar outro seletor comum
            const resBar = document.querySelector('#resource_bar');
            if (resBar) {
                const woodEl = resBar.querySelector('.wood');
                const clayEl = resBar.querySelector('.stone');
                const ironEl = resBar.querySelector('.iron');
                if (woodEl) resources.wood = parseInt(woodEl.textContent.replace(/[^0-9]/g, '')) || 0;
                if (clayEl) resources.clay = parseInt(clayEl.textContent.replace(/[^0-9]/g, '')) || 0;
                if (ironEl) resources.iron = parseInt(ironEl.textContent.replace(/[^0-9]/g, '')) || 0;
            }
        }
        return resources;
    }

    // Função para obter níveis dos edifícios
    function getBuildingLevels() {
        buildingLevels = {};
        const buildingRows = document.querySelectorAll('#building_table tr, .building_row');
        buildingRows.forEach(row => {
            const buildingId = row.id || row.getAttribute('data-building');
            if (buildingId) {
                const levelEl = row.querySelector('.level, .building-level, span[class*="level"]');
                if (levelEl) {
                    const level = parseInt(levelEl.textContent.replace(/[^0-9]/g, '')) || 0;
                    buildingLevels[buildingId] = level;
                }
            }
        });
        return buildingLevels;
    }

    // Calcular custo de upgrade
    function calculateUpgradeCost(buildingId, currentLevel) {
        const building = BUILDINGS[buildingId];
        if (!building) return null;

        const factor = Math.pow(building.factor, currentLevel);
        return {
            wood: Math.floor(building.baseCost.wood * factor),
            clay: Math.floor(building.baseCost.clay * factor),
            iron: Math.floor(building.baseCost.iron * factor)
        };
    }

    // Calcular tempo de construção
    function calculateBuildTime(cost, buildingId) {
        // Fórmula aproximada do tempo de construção
        const totalCost = cost.wood + cost.clay + cost.iron;
        const baseTime = 60; // segundos base
        const timeMultiplier = 1.05;
        const timeInSeconds = baseTime * Math.pow(timeMultiplier, Math.log2(totalCost / 100 + 1));
        return Math.floor(timeInSeconds);
    }

    // Formatar tempo
    function formatTime(seconds) {
        if (seconds < 60) return seconds + 's';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ' + (seconds % 60) + 's';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours + 'h ' + minutes + 'm';
    }

    // Verificar se pode construir
    function canBuild(cost) {
        if (!cost) return false;
        return resources.wood >= cost.wood &&
               resources.clay >= cost.clay &&
               resources.iron >= cost.iron;
    }

    // Recomendar edifícios baseado na estratégia
    function getRecommendations() {
        const recommendations = [];
        const levels = getBuildingLevels();

        Object.keys(BUILDINGS).forEach(buildingId => {
            const currentLevel = levels[buildingId] || 0;
            const cost = calculateUpgradeCost(buildingId, currentLevel);
            if (!cost) return;

            let priority = 0;

            // Lógica de prioridade baseada na estratégia
            switch (currentStrategy) {
                case 'military':
                    if (['barracks', 'stable', 'workshop', 'smith'].includes(buildingId)) {
                        priority += 30;
                    }
                    priority += (20 - currentLevel); // Priorizar edifícios de nível baixo
                    break;
                case 'economic':
                    if (['warehouse', 'storage', 'farm', 'market'].includes(buildingId)) {
                        priority += 30;
                    }
                    priority += (20 - currentLevel);
                    break;
                case 'defensive':
                    if (['wall', 'hide', 'barracks', 'rally_point'].includes(buildingId)) {
                        priority += 30;
                    }
                    priority += (20 - currentLevel);
                    break;
                default: // balanced
                    priority += (20 - currentLevel);
                    if (['main', 'warehouse', 'storage', 'farm'].includes(buildingId)) {
                        priority += 10;
                    }
            }

            // Penalizar se não tiver recursos
            if (!canBuild(cost)) {
                priority -= 20;
            }

            recommendations.push({
                id: buildingId,
                name: BUILDINGS[buildingId].name,
                level: currentLevel,
                cost: cost,
                time: calculateBuildTime(cost, buildingId),
                canBuild: canBuild(cost),
                priority: priority
            });
        });

        // Ordenar por prioridade
        recommendations.sort((a, b) => b.priority - a.priority);
        return recommendations;
    }

    // Criar painel de otimização
    function createOptimizerPanel() {
        // Remover painel existente se houver
        const existingPanel = document.getElementById('tw-build-optimizer');
        if (existingPanel) {
            existingPanel.remove();
        }

        const panel = document.createElement('div');
        panel.id = 'tw-build-optimizer';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 320px;
            max-height: 80vh;
            overflow-y: auto;
            background: rgba(20, 20, 30, 0.95);
            border: 2px solid #gold;
            border-radius: 8px;
            padding: 15px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #fff;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 10px;';
        header.innerHTML = `
            <h3 style="margin: 0; color: #FFD700;">🏗️ Otimizador de Construções</h3>
            <button id="tw-close-optimizer" style="background: #c00; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">✕</button>
        `;
        panel.appendChild(header);

        // Seletor de estratégia
        const strategyDiv = document.createElement('div');
        strategyDiv.style.cssText = 'margin-bottom: 10px;';
        strategyDiv.innerHTML = `
            <label style="color: #aaa;">Estratégia:</label>
            <select id="tw-strategy-select" style="width: 100%; padding: 5px; margin-top: 5px; background: #333; color: white; border: 1px solid #555; border-radius: 3px;">
                <option value="balanced" ${currentStrategy === 'balanced' ? 'selected' : ''}>Equilibrado</option>
                <option value="military" ${currentStrategy === 'military' ? 'selected' : ''}>Militar</option>
                <option value="economic" ${currentStrategy === 'economic' ? 'selected' : ''}>Econômico</option>
                <option value="defensive" ${currentStrategy === 'defensive' ? 'selected' : ''}>Defensivo</option>
            </select>
        `;
        panel.appendChild(strategyDiv);

        // Recursos atuais
        const resDiv = document.createElement('div');
        resDiv.style.cssText = 'background: rgba(0,0,0,0.3); padding: 8px; border-radius: 5px; margin-bottom: 10px; font-size: 11px;';
        resDiv.innerHTML = `
            <div style="color: #8B4513;">🪵 Madeira: <span id="tw-res-wood">${resources.wood.toLocaleString()}</span></div>
            <div style="color: #A0522D;">🧱 Argila: <span id="tw-res-clay">${resources.clay.toLocaleString()}</span></div>
            <div style="color: #708090;">⛓️ Ferro: <span id="tw-res-iron">${resources.iron.toLocaleString()}</span></div>
        `;
        panel.appendChild(resDiv);

        // Lista de recomendações
        const recTitle = document.createElement('div');
        recTitle.style.cssText = 'font-weight: bold; color: #FFD700; margin: 10px 0 5px 0;';
        recTitle.textContent = '📋 Recomendações:';
        panel.appendChild(recTitle);

        const recList = document.createElement('div');
        recList.id = 'tw-recommendations-list';
        recList.style.cssText = 'max-height: 400px; overflow-y: auto;';
        panel.appendChild(recList);

        // Botão de atualizar
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'tw-refresh-optimizer';
        refreshBtn.textContent = '🔄 Atualizar';
        refreshBtn.style.cssText = 'width: 100%; padding: 8px; margin-top: 10px; background: #2E8B57; color: white; border: none; cursor: pointer; border-radius: 3px; font-weight: bold;';
        panel.appendChild(refreshBtn);

        document.body.appendChild(panel);

        // Event listeners
        document.getElementById('tw-close-optimizer').addEventListener('click', () => {
            panel.remove();
        });

        document.getElementById('tw-strategy-select').addEventListener('change', (e) => {
            currentStrategy = e.target.value;
            updateRecommendations();
        });

        document.getElementById('tw-refresh-optimizer').addEventListener('click', () => {
            getResources();
            getBuildingLevels();
            updateRecommendations();
        });

        // Atualizar recomendações iniciais
        updateRecommendations();
    }

    // Atualizar lista de recomendações
    function updateRecommendations() {
        const list = document.getElementById('tw-recommendations-list');
        if (!list) return;

        list.innerHTML = '';
        const recommendations = getRecommendations();

        if (recommendations.length === 0) {
            list.innerHTML = '<div style="color: #aaa; padding: 10px;">Nenhuma recomendação disponível</div>';
            return;
        }

        recommendations.slice(0, 10).forEach((rec, index) => {
            const item = document.createElement('div');
            item.style.cssText = `
                background: ${rec.canBuild ? 'rgba(46, 139, 87, 0.3)' : 'rgba(139, 69, 19, 0.3)'};
                padding: 8px;
                margin-bottom: 5px;
                border-radius: 4px;
                border-left: 3px solid ${rec.canBuild ? '#2E8B57' : '#8B4513'};
            `;

            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: ${rec.canBuild ? '#90EE90' : '#CD853F'};">#${index + 1} ${rec.name}</strong>
                    <span style="font-size: 10px; color: #aaa;">Nível ${rec.level} → ${rec.level + 1}</span>
                </div>
                <div style="font-size: 10px; margin-top: 5px; color: #ccc;">
                    💰 ${rec.cost.wood.toLocaleString()} 🪵 | ${rec.cost.clay.toLocaleString()} 🧱 | ${rec.cost.iron.toLocaleString()} ⛓️
                </div>
                <div style="font-size: 10px; color: #FFD700; margin-top: 3px;">
                    ⏱️ Tempo: ${formatTime(rec.time)}
                </div>
                ${rec.canBuild ? '<div style="font-size: 9px; color: #90EE90; margin-top: 3px;">✅ Pode construir</div>' : '<div style="font-size: 9px; color: #CD853F; margin-top: 3px;">❌ Recursos insuficientes</div>'}
            `;

            list.appendChild(item);
        });

        // Atualizar recursos display
        document.getElementById('tw-res-wood').textContent = resources.wood.toLocaleString();
        document.getElementById('tw-res-clay').textContent = resources.clay.toLocaleString();
        document.getElementById('tw-res-iron').textContent = resources.iron.toLocaleString();
    }

    // Adicionar botão para abrir o otimizador
    function addOptimizerButton() {
        // Verificar se já existe
        if (document.getElementById('tw-optimizer-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'tw-optimizer-btn';
        btn.innerHTML = '🏗️ Otimizar';
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #000;
            border: 2px solid #fff;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
            transition: all 0.3s ease;
        `;

        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.05)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
        });

        btn.addEventListener('click', () => {
            getResources();
            getBuildingLevels();
            createOptimizerPanel();
        });

        document.body.appendChild(btn);
    }

    // Inicializar
    function init() {
        console.log('[TW Build Optimizer] Iniciando...');
        
        // Aguardar carregamento completo
        setTimeout(() => {
            getResources();
            getBuildingLevels();
            addOptimizerButton();
            
            if (CONFIG.debug) {
                console.log('[TW Build Optimizer] Recursos:', resources);
                console.log('[TW Build Optimizer] Edifícios:', buildingLevels);
            }
        }, 2000);

        // Atualizar recursos periodicamente
        setInterval(() => {
            if (document.getElementById('tw-build-optimizer')) {
                getResources();
                updateRecommendations();
            }
        }, CONFIG.refreshInterval);
    }

    // Iniciar quando a página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
