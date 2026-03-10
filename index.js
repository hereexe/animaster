addListeners();

function addListeners() {
    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animaster().fadeIn(block, 5000);
        });

    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            animaster().move(block, 1000, { x: 100, y: 10 });
        });

    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            animaster().scale(block, 1000, 1.25);
        });

    // Слушатели для moveAndHide и кнопки отмены
    let moveAndHideAnimation;
    const moveAndHidePlayBtn = document.getElementById('moveAndHidePlay');
    const moveAndHideResetBtn = document.getElementById('moveAndHideReset');

    if (moveAndHidePlayBtn && moveAndHideResetBtn) {
        moveAndHidePlayBtn.addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            moveAndHideAnimation = animaster().moveAndHide(block, 1000, { x: 100, y: 20 });
        });

        moveAndHideResetBtn.addEventListener('click', function () {
            if (moveAndHideAnimation) {
                moveAndHideAnimation.reset();
            }
        });
    }

    // --- Пример работы пользовательской анимации из пункта 11 ---
    // Если на странице есть кнопка с id "customPlay" и блок "customBlock":
    const customPlayBtn = document.getElementById('customPlay');
    if (customPlayBtn) {
        customPlayBtn.addEventListener('click', function () {
            const block = document.getElementById('customBlock');
            const customAnimation = animaster()
                .addMove(200, { x: 40, y: 40 })
                .addScale(800, 1.3)
                .addMove(200, { x: 80, y: 0 })
                .addScale(800, 1)
                .addMove(200, { x: 40, y: -40 })
                .addScale(800, 0.7)
                .addMove(200, { x: 0, y: 0 })
                .addScale(800, 1);
            
            customAnimation.play(block);
        });
    }
}

function animaster() {
    // --- Служебные функции отмены ---
    function resetFadeIn(element) {
        element.style.transitionDuration = null;
        element.classList.remove('show');
        element.classList.add('hide');
    }

    function resetFadeOut(element) {
        element.style.transitionDuration = null;
        element.classList.remove('hide');
        element.classList.add('show');
    }

    function resetMoveAndScale(element) {
        element.style.transitionDuration = null;
        element.style.transform = null;
    }

    // --- Внутренние элементарные операции (работают напрямую с DOM) ---
    function fadeIn(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('hide');
        element.classList.add('show');
    }

    function fadeOut(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('show');
        element.classList.add('hide');
    }

    function move(element, duration, translation) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(translation, null);
    }

    function scale(element, duration, ratio) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(null, ratio);
    }

    // --- Сложная анимация moveAndHide ---
    // Она продолжает использовать внутренние функции `move` и `fadeOut`,
    // поэтому изменения публичного API её не ломают.
    function moveAndHide(element, duration, translation = { x: 100, y: 20 }) {
        const moveDuration = duration * 0.4;
        const hideDuration = duration * 0.6;

        move(element, moveDuration, translation);
        
        const timeout = setTimeout(() => {
            fadeOut(element, hideDuration);
        }, moveDuration);

        return {
            reset() {
                clearTimeout(timeout); 
                resetMoveAndScale(element); 
                resetFadeOut(element); 
            }
        };
    }

    // Возвращаемый объект (Публичное API)
    return {
        moveAndHide, // Остается без изменений
        
        _steps: [], 

        // --- Пункт 10: Методы для создания цепочки (Fluent API) ---
        addMove(duration, translation) {
            this._steps.push({ name: 'move', duration: duration, params: translation });
            return this;
        },
        addScale(duration, ratio) {
            this._steps.push({ name: 'scale', duration: duration, params: ratio });
            return this;
        },
        addFadeIn(duration) {
            this._steps.push({ name: 'fadeIn', duration: duration });
            return this;
        },
        addFadeOut(duration) {
            this._steps.push({ name: 'fadeOut', duration: duration });
            return this;
        },

        // Выполняет все шаги по очереди
        play(element) {
            let currentDelay = 0;
            
            this._steps.forEach(step => {
                setTimeout(() => {
                    if (step.name === 'move') {
                        // Вызываем внутреннюю функцию move из замыкания
                        move(element, step.duration, step.params);
                    } else if (step.name === 'scale') {
                        scale(element, step.duration, step.params);
                    } else if (step.name === 'fadeIn') {
                        fadeIn(element, step.duration);
                    } else if (step.name === 'fadeOut') {
                        fadeOut(element, step.duration);
                    }
                }, currentDelay);
                
                currentDelay += step.duration;
            });
            // Важно: мы НЕ очищаем массив this._steps, чтобы объект 
            // пользовательской анимации можно было применять многократно.
        },

        // --- Пункты 9 и 10: Переписываем базовые методы ---
        // Теперь они просто оборачивают новые методы add* и сразу вызывают play
        move(element, duration, translation) {
            this.addMove(duration, translation).play(element);
        },
        scale(element, duration, ratio) {
            this.addScale(duration, ratio).play(element);
        },
        fadeIn(element, duration) {
            this.addFadeIn(duration).play(element);
        },
        fadeOut(element, duration) {
            this.addFadeOut(duration).play(element);
        }
    }
}

function getTransform(translation, ratio) {
    const result = [];
    if (translation) {
        result.push(`translate(${translation.x}px,${translation.y}px)`);
    }
    if (ratio) {
        result.push(`scale(${ratio})`);
    }
    return result.join(' ');
}