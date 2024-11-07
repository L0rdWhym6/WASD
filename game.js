
let score = 0;
let clickValue = 1;
let autoClickerInterval = null;
let autoClickerCost = 10;
let clickValueUpgradeCost = 20;
let bonusTimeUpgradeCost = 50;
let bonusTimeActive = false;
let level = 1;
let totalClicks = 0;
let lastClickTime = 0;
let clicksInLastSecond = 0;
let comboMultiplier = 1;
let comboTimer = null;
let prestigePoints = 0;
let prestigeMultiplier = 1;

const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const coinElement = document.getElementById('coin');
const autoClickerUpgradeBtn = document.getElementById('autoClickerUpgrade');
const clickValueUpgradeBtn = document.getElementById('clickValueUpgrade');
const bonusTimeUpgradeBtn = document.getElementById('bonusTimeUpgrade');
const achievementsList = document.getElementById('achievements-list');
const showAchievementsBtn = document.getElementById('showAchievements');
const achievementsContainer = document.querySelector('.achievements-container');
const closeAchievementsBtn = document.querySelector('.close-achievements-btn');
const comboMultiplierElement = document.getElementById('comboMultiplier');

const clickSound = document.getElementById('clickSound');
const upgradeSound = document.getElementById('upgradeSound');
const achievementSound = document.getElementById('achievementSound');

const achievements = [
    { id: 'click10', name: '10 кликов', requirement: () => totalClicks >= 10, progress: () => Math.min(totalClicks / 10, 1) },
    { id: 'click100', name: '100 кликов', requirement: () => totalClicks >= 100, progress: () => Math.min(totalClicks / 100, 1) },
    { id: 'click1000', name: '1000 кликов', requirement: () => totalClicks >= 1000, progress: () => Math.min(totalClicks / 1000, 1) },
    { id: 'score1000', name: '1000 монет', requirement: () => score >= 1000, progress: () => Math.min(score / 1000, 1) },
    { id: 'score10000', name: '10000 монет', requirement: () => score >= 10000, progress: () => Math.min(score / 10000, 1) },
    { id: 'level5', name: 'Уровень 5', requirement: () => level >= 5, progress: () => Math.min(level / 5, 1) },
    { id: 'level10', name: 'Уровень 10', requirement: () => level >= 10, progress: () => Math.min(level / 10, 1) },
    { id: 'autoClicker', name: 'Первый авто-кликер', requirement: () => autoClickerInterval !== null, progress: () => autoClickerInterval !== null ? 1 : 0 },
    { id: 'combo5x', name: 'Комбо 5x', requirement: () => comboMultiplier >= 5, progress: () => Math.min(comboMultiplier / 5, 1) },
    { id: 'combo10x', name: 'Комбо 10x', requirement: () => comboMultiplier >= 10, progress: () => Math.min(comboMultiplier / 10, 1) },
];

function updateScore(value) {
    score += value * comboMultiplier * prestigeMultiplier;
    scoreElement.textContent = Math.floor(score);
    updateUpgradeButtons();
    checkLevelUp();
    checkAchievements();
    checkPrestige();
    saveProgress();
}

function checkPrestige() {
    if (score >= 1000000 && !document.getElementById('prestigeBtn')) {
        const prestigeBtn = document.createElement('button');
        prestigeBtn.id = 'prestigeBtn';
        prestigeBtn.textContent = 'Престиж';
        prestigeBtn.classList.add('prestige-btn');
        prestigeBtn.addEventListener('click', performPrestige);
        document.querySelector('.game-container').appendChild(prestigeBtn);
    }
}

function performPrestige() {
    const newPrestigePoints = Math.floor(Math.log10(score / 1000000));
    prestigePoints += newPrestigePoints;
    prestigeMultiplier = 1 + prestigePoints * 0.1;
    score = 0;
    clickValue = 1;
    autoClickerInterval = null;
    autoClickerCost = 10;
    clickValueUpgradeCost = 20;
    bonusTimeUpgradeCost = 50;
    level = 1;
    
    scoreElement.textContent = score;
    levelElement.textContent = level;
    updateUpgradeButtons();
    
    const prestigeNotification = document.createElement('div');
    prestigeNotification.textContent = `Престиж! +${newPrestigePoints} очков престижа`;
    prestigeNotification.classList.add('prestige-notification');
    document.body.appendChild(prestigeNotification);
    setTimeout(() => prestigeNotification.remove(), 3000);
    
    document.getElementById('prestigeBtn').remove();
    saveProgress();
}

function spawnRandomBonus() {
    const bonus = document.createElement('div');
    bonus.classList.add('random-bonus');
    bonus.style.left = `${Math.random() * 80 + 10}%`;
    bonus.style.top = `${Math.random() * 80 + 10}%`;
    document.body.appendChild(bonus);
    
    bonus.addEventListener('click', () => {
        const bonusValue = Math.floor(Math.random() * 3) + 1;
        switch (bonusValue) {
            case 1:
                updateScore(clickValue * 100);
                showFloatingText('+100x клик!', bonus.offsetLeft, bonus.offsetTop);
                break;
            case 2:
                comboMultiplier += 5;
                showFloatingText('+5x комбо!', bonus.offsetLeft, bonus.offsetTop);
                setTimeout(() => comboMultiplier = Math.max(comboMultiplier - 5, 1), 10000);
                break;
            case 3:
                activateBonusTime();
                showFloatingText('Бонусное время!', bonus.offsetLeft, bonus.offsetTop);
                break;
        }
        bonus.remove();
    });
    
    setTimeout(() => bonus.remove(), 5000);
}

setInterval(spawnRandomBonus, 30000);

function updateScore(value) {
    score += value * comboMultiplier;
    scoreElement.textContent = Math.floor(score);
    updateUpgradeButtons();
    checkLevelUp();
    checkAchievements();
    saveProgress();
}

function updateUpgradeButtons() {
    autoClickerUpgradeBtn.disabled = score < autoClickerCost;
    clickValueUpgradeBtn.disabled = score < clickValueUpgradeCost;
    bonusTimeUpgradeBtn.disabled = score < bonusTimeUpgradeCost;
}

function checkLevelUp() {
    const newLevel = Math.floor(Math.log2(score / 100 + 1)) + 1;
    if (newLevel > level) {
        level = newLevel;
        levelElement.textContent = level;
        clickValue = Math.pow(2, level - 1);
        showLevelUpNotification(level);
    }
}

function showLevelUpNotification(newLevel) {
    const notification = document.createElement('div');
    notification.textContent = `Уровень повышен: ${newLevel}!`;
    notification.classList.add('level-up-notification');
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function checkAchievements() {
    achievements.forEach(achievement => {
        const achievementElement = document.getElementById(achievement.id) || createAchievementElement(achievement);
        const progress = achievement.progress();
        achievementElement.style.background = `linear-gradient(to right, #006400 ${progress * 100}%, #3c3c3e ${progress * 100}%)`;
        
        if (achievement.requirement() && !achievementElement.classList.contains('completed')) {
            achievementElement.classList.add('completed');
            showAchievementNotification(achievement.name);
            achievementSound.play();
        }
    });
}

function createAchievementElement(achievement) {
    const achievementElement = document.createElement('li');
    achievementElement.id = achievement.id;
    achievementElement.textContent = achievement.name;
    achievementElement.classList.add('achievement');
    achievementsList.appendChild(achievementElement);
    return achievementElement;
}

function showAchievementNotification(achievementName) {
    const notification = document.createElement('div');
    notification.textContent = `Достижение разблокировано: ${achievementName}`;
    notification.classList.add('achievement-notification');
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function checkAutoClicker() {
    const currentTime = Date.now();
    if (currentTime - lastClickTime < 50) {
        clicksInLastSecond++;
        if (clicksInLastSecond > 20) {
            alert('Обнаружен автокликер. Пожалуйста, играйте честно!');
            return false;
        }
    } else {
        clicksInLastSecond = 0;
    }
    lastClickTime = currentTime;
    return true;
}

function updateCombo() {
    comboMultiplier += 0.1;
    comboMultiplierElement.textContent = `x${comboMultiplier.toFixed(1)}`;
    comboMultiplierElement.classList.add('active');
    setTimeout(() => {
        comboMultiplierElement.classList.remove('active');
    }, 200);
    if (comboTimer) clearTimeout(comboTimer);
    comboTimer = setTimeout(() => {
        comboMultiplier = 1;
        comboMultiplierElement.textContent = 'x1';
    }, 2000);
}

function showFloatingText(text, x, y) {
    const floatingText = document.createElement('div');
    floatingText.textContent = text;
    floatingText.classList.add('floating-text');
    floatingText.style.left = `${x}px`;
    floatingText.style.top = `${y}px`;
    document.body.appendChild(floatingText);
    setTimeout(() => floatingText.remove(), 2000);
}

function createParticles(x, y) {
    const particlesContainer = document.createElement('div');
    particlesContainer.classList.add('particles-container');
    particlesContainer.style.left = `${x}px`;
    particlesContainer.style.top = `${y}px`;
    document.body.appendChild(particlesContainer);

    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.setProperty('--x', `${Math.random() * 100 - 50}px`);
        particle.style.setProperty('--y', `${Math.random() * 100 - 50}px`);
        particlesContainer.appendChild(particle);
    }

    setTimeout(() => {
        particlesContainer.remove();
    }, 1000);
}

function saveProgress() {
    const gameState = {
        score,
        clickValue,
        autoClickerCost,
        clickValueUpgradeCost,
        bonusTimeUpgradeCost,
        level,
        totalClicks
    };
    localStorage.setItem('cryptoClickerState', JSON.stringify(gameState));
}

function loadProgress() {
    const savedState = localStorage.getItem('cryptoClickerState');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        score = gameState.score;
        clickValue = gameState.clickValue;
        autoClickerCost = gameState.autoClickerCost;
        clickValueUpgradeCost = gameState.clickValueUpgradeCost;
        bonusTimeUpgradeCost = gameState.bonusTimeUpgradeCost;
        level = gameState.level;
        totalClicks = gameState.totalClicks;

        scoreElement.textContent = score;
        levelElement.textContent = level;
        autoClickerUpgradeBtn.textContent = `Авто-кликер (Цена: ${autoClickerCost})`;
        clickValueUpgradeBtn.textContent = `Улучшить клик (Цена: ${clickValueUpgradeCost})`;
        bonusTimeUpgradeBtn.textContent = `Бонусное время (Цена: ${bonusTimeUpgradeCost})`;

        updateUpgradeButtons();
        checkAchievements();
    }
}

coinElement.addEventListener('click', (event) => {
    if (checkAutoClicker()) {
        totalClicks++;
        let clickScore = clickValue;
        if (bonusTimeActive) {
            clickScore *= 2;
        }
        updateScore(clickScore);
        updateCombo();
        animateCoinClick();
        showFloatingText(`+${Math.floor(clickScore * comboMultiplier)}`, event.clientX, event.clientY);
        createParticles(event.clientX, event.clientY);
        clickSound.currentTime = 0;
        clickSound.play();
    }
});

function animateCoinClick() {
    coinElement.classList.add('clicked');
    setTimeout(() => {
        coinElement.classList.remove('clicked');
    }, 100);
}

coinElement.addEventListener('mouseover', () => {
    coinElement.classList.add('hover');
});

coinElement.addEventListener('mouseout', () => {
    coinElement.classList.remove('hover');
});

function spawnRandomBonus() {
    const bonus = document.createElement('div');
    bonus.classList.add('random-bonus');
    bonus.style.left = `${Math.random() * 80 + 10}%`;
    bonus.style.top = `${Math.random() * 80 + 10}%`;
    document.body.appendChild(bonus);
    
    bonus.addEventListener('click', () => {
        const bonusValue = Math.floor(Math.random() * 3) + 1;
        switch (bonusValue) {
            case 1:
                updateScore(clickValue * 100);
                showFloatingText('+100x клик!', bonus.offsetLeft, bonus.offsetTop);
                break;
            case 2:
                comboMultiplier += 5;
                showFloatingText('+5x комбо!', bonus.offsetLeft, bonus.offsetTop);
                setTimeout(() => comboMultiplier = Math.max(comboMultiplier - 5, 1), 10000);
                break;
            case 3:
                activateBonusTime();
                showFloatingText('Бонусное время!', bonus.offsetLeft, bonus.offsetTop);
                break;
        }
        bonus.remove();
    });
    
    setTimeout(() => bonus.remove(), 5000);
}

setInterval(spawnRandomBonus, 30000);

autoClickerUpgradeBtn.addEventListener('click', () => {
    if (score >= autoClickerCost) {
        updateScore(-autoClickerCost);
        autoClickerCost *= 2;
        autoClickerUpgradeBtn.textContent = `Авто-кликер (Цена: ${autoClickerCost})`;
        if (autoClickerInterval === null) {
            autoClickerInterval = setInterval(() => {
                updateScore(clickValue);
            }, 1000);
        }
        upgradeSound.play();
    }
});

clickValueUpgradeBtn.addEventListener('click', () => {
    if (score >= clickValueUpgradeCost) {
        updateScore(-clickValueUpgradeCost);
        clickValue *= 2;
        clickValueUpgradeCost *= 2;
        clickValueUpgradeBtn.textContent = `Улучшить клик (Цена: ${clickValueUpgradeCost})`;
        upgradeSound.play();
    }
});

bonusTimeUpgradeBtn.addEventListener('click', () => {
    if (score >= bonusTimeUpgradeCost) {
        updateScore(-bonusTimeUpgradeCost);
        bonusTimeUpgradeCost *= 2;
        bonusTimeUpgradeBtn.textContent = `Бонусное время (Цена: ${bonusTimeUpgradeCost})`;
        activateBonusTime();
        upgradeSound.play();
    }
});

function activateBonusTime() {
    bonusTimeActive = true;
    coinElement.classList.add('bonus-active');
    setTimeout(() => {
        bonusTimeActive = false;
        coinElement.classList.remove('bonus-active');
    }, 30000);
}

showAchievementsBtn.addEventListener('click', () => {
    achievementsContainer.style.display = 'block';
});

closeAchievementsBtn.addEventListener('click', () => {
    achievementsContainer.style.display = 'none';
});

const resetProgressBtn = document.getElementById('resetProgress');

resetProgressBtn.addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.')) {
        resetProgress();
    }
});

function resetProgress() {
    score = 0;
    clickValue = 1;
    autoClickerInterval = null;
    autoClickerCost = 10;
    clickValueUpgradeCost = 20;
    bonusTimeUpgradeCost = 50;
    bonusTimeActive = false;
    level = 1;
    totalClicks = 0;
    comboMultiplier = 1;
    prestigePoints = 0;
    prestigeMultiplier = 1;

    scoreElement.textContent = score;
    levelElement.textContent = level;
    comboMultiplierElement.textContent = 'x1';
    updateUpgradeButtons();

    if (document.getElementById('prestigeBtn')) {
        document.getElementById('prestigeBtn').remove();
    }

    localStorage.removeItem('gameState');

    achievements.forEach(achievement => {
        const achievementElement = document.getElementById(achievement.id);
        if (achievementElement) {
            achievementElement.classList.remove('completed');
            achievementElement.style.background = '';
        }
    });

    alert('Прогресс успешно сброшен!');
}

loadProgress();

// Добавьте эффект частиц при клике на монету
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.classList.add('particles-container');
    coinElement.appendChild(particlesContainer);

    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.setProperty('--x', Math.random() * 200 - 100 + 'px');
        particle.style.setProperty('--y', Math.random() * 200 - 100 + 'px');
        particlesContainer.appendChild(particle);
    }

    setTimeout(() => {
        particlesContainer.remove();
    }, 1000);
}

coinElement.addEventListener('click', createParticles);
updateUpgradeButtons();
