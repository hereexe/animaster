addListeners();

let moveAndHideAnimation = null;
let heartBeatingAnimation = null;

function addListeners() {
    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animaster().fadeIn(block, 5000);
        });

    document.getElementById('fadeOutPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeOutBlock');
            animaster().fadeOut(block, 5000);
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

    document.getElementById('moveAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            moveAndHideAnimation = animaster().moveAndHide(block, 5000);
        });

    document.getElementById('moveAndHideReset')
        .addEventListener('click', function () {
            if (moveAndHideAnimation) {
                moveAndHideAnimation.reset();
                moveAndHideAnimation = null;
            }
        });

    document.getElementById('showAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('showAndHideBlock');
            animaster().showAndHide(block, 5000);
        });

    document.getElementById('heartBeatingPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock');
            heartBeatingAnimation = animaster().heartBeating(block);
        });

    document.getElementById('heartBeatingStop')
        .addEventListener('click', function () {
            if (heartBeatingAnimation) {
                heartBeatingAnimation.stop();
                heartBeatingAnimation = null;
            }
        });

    const worryAnimationHandler = animaster()
        .addMove(200, { x: 80, y: 0 })
        .addMove(200, { x: 0, y: 0 })
        .addMove(200, { x: 80, y: 0 })
        .addMove(200, { x: 0, y: 0 })
        .buildHandler();

    document.getElementById('worryAnimationBlock')
        .addEventListener('click', worryAnimationHandler);

    document.getElementById('customAnimationPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('customAnimationBlock');
            const customAnimation = animaster()
                .addMove(500, { x: 100, y: 0 })
                .addMove(500, { x: 0, y: 100 })
                .addMove(500, { x: 100, y: 100 });
            customAnimation.play(block);
        });
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

function animaster() {
    function _fadeIn(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('hide');
        element.classList.add('show');
    }

    function _fadeOut(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('show');
        element.classList.add('hide');
    }

    function _move(element, duration, translation) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(translation, null);
    }

    function _scale(element, duration, ratio) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(null, ratio);
    }

    function resetFadeIn(element) {
        element.classList.remove('show');
        element.classList.add('hide');
        element.style.transitionDuration = null;
    }

    function resetFadeOut(element) {
        element.classList.remove('hide');
        element.classList.add('show');
        element.style.transitionDuration = null;
    }

    function resetMoveAndScale(element) {
        element.style.transform = null;
        element.style.transitionDuration = null;
    }

    function executeStep(element, step) {
        switch (step.type) {
            case 'move':
                _move(element, step.duration, step.params.translation);
                break;
            case 'scale':
                _scale(element, step.duration, step.params.ratio);
                break;
            case 'fadeIn':
                _fadeIn(element, step.duration);
                break;
            case 'fadeOut':
                _fadeOut(element, step.duration);
                break;
            case 'delay':
                break;
        }
    }

    return {
        _steps: [],

        _clone() {
            const instance = animaster();
            instance._steps = this._steps.slice();
            return instance;
        },

        addMove(duration, translation) {
            const clone = this._clone();
            clone._steps.push({ type: 'move', duration, params: { translation } });
            return clone;
        },

        addScale(duration, ratio) {
            const clone = this._clone();
            clone._steps.push({ type: 'scale', duration, params: { ratio } });
            return clone;
        },

        addFadeIn(duration) {
            const clone = this._clone();
            clone._steps.push({ type: 'fadeIn', duration, params: {} });
            return clone;
        },

        addFadeOut(duration) {
            const clone = this._clone();
            clone._steps.push({ type: 'fadeOut', duration, params: {} });
            return clone;
        },

        addDelay(duration) {
            const clone = this._clone();
            clone._steps.push({ type: 'delay', duration, params: {} });
            return clone;
        },

        play(element, cycled = false) {
            const steps = this._steps;
            const timers = [];
            const initialClasses = [...element.classList];
            const initialTransform = element.style.transform;

            function runSteps() {
                let delay = 0;
                for (const step of steps) {
                    const timer = setTimeout(
                        () => executeStep(element, step),
                        delay
                    );
                    timers.push(timer);
                    delay += step.duration;
                }
                if (cycled) {
                    const cycleTimer = setTimeout(runSteps, delay);
                    timers.push(cycleTimer);
                }
            }

            runSteps();

            return {
                stop() {
                    timers.forEach(clearTimeout);
                },
                reset() {
                    this.stop();
                    resetMoveAndScale(element);
                    element.className = initialClasses.join(' ');
                }
            };
        },

        move(element, duration, translation) {
            return this.addMove(duration, translation).play(element);
        },

        fadeIn(element, duration) {
            return this.addFadeIn(duration).play(element);
        },

        fadeOut(element, duration) {
            return this.addFadeOut(duration).play(element);
        },

        scale(element, duration, ratio) {
            return this.addScale(duration, ratio).play(element);
        },

        moveAndHide(element, duration) {
            return this
                .addMove(duration * 2 / 5, { x: 100, y: 20 })
                .addFadeOut(duration * 3 / 5)
                .play(element);
        },

        showAndHide(element, duration) {
            const step = duration / 3;
            return this
                .addFadeIn(step)
                .addDelay(step)
                .addFadeOut(step)
                .play(element);
        },

        heartBeating(element) {
            return this
                .addScale(500, 1.4)
                .addScale(500, 1)
                .play(element, true);
        },

        buildHandler() {
            const animation = this;
            return function () {
                animation.play(this);
            };
        }
    };
}
