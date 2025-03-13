class Animaster{
    
    _steps = [];
    constructor(steps = []) {
        this._steps = [...steps];
    }

    _createNewAnimaster(newStep) {
        const newSteps = [...this._steps, newStep];
        return new Animaster(newSteps);
    }
    
    

    addMove(duration, translation){
        return this._createNewAnimaster({
            name: "move",
            duration: duration,
            translation: translation,
            ratio: null
        });
    };

    addScale(duration, ratio){
        return this._createNewAnimaster({
            name: "scale",
            duration: duration,
            ratio: ratio
        });
    }

    addFadeIn(duration){
        return this._createNewAnimaster({
            name: "fadeIn",
            duration: duration
        });
    }

    addFadeOut(duration){
        return this._createNewAnimaster({
            name: "fadeOut",
            duration: duration
        });
    }


    play(element, cycled = false) {
        const initialState = {
            transform: element.style.transform,
            transitionDuration: element.style.transitionDuration,
            className: element.className
        };

        let timeoutIDs = [];

        const runCycle = () => {
            let cumulativeDelay = 0;
            for (let i = 0; i < this._steps.length; i++) {
                const step = this._steps[i];
                cumulativeDelay += step.duration;
                const id = setTimeout(() => {
                    switch (step.name) {
                        case 'move':
                            this.move(element, step.duration, step.translation);
                            break;
                        case 'scale':
                            this.scale(element, step.duration, step.ratio);
                            break;
                        case 'fadeIn':
                            this.fadeIn(element, step.duration);
                            break;
                        case 'fadeOut':
                            this.fadeOut(element, step.duration);
                            break;
                        case 'rotate':
                            this.rotate(element, step.duration, step.angle);
                            break;
                        case 'delay':
                            break;
                    }
                }, cumulativeDelay);
                timeoutIDs.push(id);
            }
            if (cycled) {
                const cycleId = setTimeout(() => {
                    runCycle();
                }, cumulativeDelay);
                timeoutIDs.push(cycleId);
            }
        };

        runCycle();

        return {
            stop: () => {
                timeoutIDs.forEach(id => clearTimeout(id));
                this._resetMoveAndScale(element);
                this._resetFadeIn(element);
                this._resetFadeOut(element);
            },
            reset: () => {
                timeoutIDs.forEach(id => clearTimeout(id));
                element.style.transform = initialState.transform;
                element.style.transitionDuration = initialState.transitionDuration;
                element.className = initialState.className;
                return element;
            }
        };
    }




    /**
     * Функция, передвигающая элемент
     * @param element — HTMLElement, который надо анимировать
     * @param duration — Продолжительность анимации в миллисекундах
     * @param translation — объект с полями x и y, обозначающими смещение блока
     */
    move(element, duration, translation) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(translation, null);
        return {
            stop: () => {
                this._resetMoveAndScale(element);
            }
        };
    }

    /**
     * Функция, увеличивающая/уменьшающая элемент
     * @param element — HTMLElement, который надо анимировать
     * @param duration — Продолжительность анимации в миллисекундах
     * @param ratio — во сколько раз увеличить/уменьшить. Чтобы уменьшить, нужно передать значение меньше 1
     */
    scale(element, duration, ratio) {
        element.style.transitionDuration =  `${duration}ms`;
        element.style.transform = getTransform(null, ratio);
        return {
            stop: () => {
                this._resetMoveAndScale(element);
            }
        };
    }

    /**
     * Блок плавно появляется из прозрачного.
     * @param element — HTMLElement, который надо анимировать
     * @param duration — Продолжительность анимации в миллисекундах
     */
    fadeIn(element, duration) {
        element.style.transitionDuration =  `${duration}ms`;
        element.classList.remove('hide');
        element.classList.add('show');
        return {
            stop: () => {
                this._resetFadeIn(element);
            }
        };
    }

    /**
     * Блок плавно появляется из прозрачного.
     * @param element — HTMLElement, который надо анимировать
     * @param duration — Продолжительность анимации в миллисекундах
     */
    fadeOut(element, duration) {
        element.style.transitionDuration =  `${duration}ms`;
        element.classList.remove('show');
        element.classList.add('hide');
        return {
            stop: () => {
                this._resetFadeOut(element);
            }
        };
    }

    moveAndHide(element) {
        const animation = this.addMove(400, {x: 100, y: 20})
            .addFadeOut(600).play(element);
        return {
            stop: () => {
                animation.stop();
            },
            reset: () => {
                animation.reset();
            }
        };
    }

    rotate(element, duration, angle) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = `rotate(${angle}deg)`;
        return {
            stop: () => {
                this._resetRotate(element);
            }
        };
    }
    
    addRotate(duration, angle) {
        return this._createNewAnimaster({
            name: "rotate",
            duration: duration,
            angle: angle
        });
    }

    showAndHide(element){
        const animation = this
            .addFadeIn(333)
            .addDelay(333)
            .addFadeOut(333)
            .play(element);
        return {
            stop: () => {
                animation.stop();
            },
            reset: () => {
                animation.reset();
            }
        };
    }

    addDelay(duration){
        return this._createNewAnimaster({
            name: "delay",
            duration: duration
        });
    }

    heartBeating(element) {
        return this.addScale(500, 1.4)
            .addScale(500, 1)
            .play(element, true);
    }

    buildHandler() {
        const animInstance = this;
        return function () {
            return animInstance.play(this);
        }
    }

    _resetFadeIn(element) {
        element.style.transitionDuration = null;
        element.classList.remove('show');
        element.classList.add('hide');
    }

    _resetFadeOut(element) {
        element.style.transitionDuration = null;
        element.classList.remove('hide');
        element.classList.add('show');
    }

    _resetMoveAndScale(element) {
        element.style.transitionDuration = null;
        element.style.transform = null;
    }
}


function animaster(){
    return new Animaster();
}

addListeners();
let currentAnimation = null;

function addListeners() {
    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            currentAnimation = animaster().addFadeIn(5000).play(block);
        });

    document.getElementById('fadeInStop')
        .addEventListener('click', function () {
            if (currentAnimation) {
                currentAnimation.stop();
                currentAnimation.reset();
                currentAnimation = null;
            }
        });
    

    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            currentAnimation = animaster().addMove(1000, {x: 100, y: 10}).play(block);
        });

    document.getElementById('moveStop')
        .addEventListener('click', function () {
            if (currentAnimation) {
                currentAnimation.stop();
                currentAnimation.reset();
                currentAnimation = null;
            }
        });
    

    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            currentAnimation = animaster().addScale(1000, 1.25).play(block);
        });

    document.getElementById('scaleStop')
        .addEventListener('click', function () {
            if (currentAnimation) {
                currentAnimation.stop();
                currentAnimation.reset();
                currentAnimation = null;
            }
        });

    document.getElementById('fadeOutPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeOutBlock');
            currentAnimation = animaster().addFadeOut(1000).play(block);
        });

    document.getElementById('fadeOutStop')
        .addEventListener('click', function () {
            if (currentAnimation) {
                currentAnimation.stop();
                currentAnimation.reset();
                currentAnimation = null;
            }
        });
    document.getElementById('moveAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            currentAnimation = animaster().moveAndHide(block);
        });

    document.getElementById('moveAndHideStop')
        .addEventListener('click', function () {
            if (currentAnimation) {
                currentAnimation.stop();
                currentAnimation.reset();
                currentAnimation = null;
            }
        });

    document.getElementById('showAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('showAndHideBlock');
            currentAnimation = animaster().showAndHide(block);
        });

    document.getElementById('showAndHideStop')
        .addEventListener('click', function () {
            if (currentAnimation) {
                currentAnimation.stop();
                currentAnimation.reset();
                currentAnimation = null;
            }
        });
    
    document.getElementById('heartBeatingPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock');
            currentAnimation = animaster().heartBeating(block);
        });

    document.getElementById('heartBeatingStop')
        .addEventListener('click', function () {
            if (currentAnimation) {
                currentAnimation.stop();
                currentAnimation = null;
            }
        });

    document.getElementById('customAnimationPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('customAnimationBlock');
            const customAnimation = animaster()
                .addMove(200, {x: 40, y: 40})
                .addScale(800, 1.3)
                .addMove(200, {x: 80, y: 0})
                .addScale(800, 1)
                .addMove(200, {x: 40, y: -40})
                .addScale(800, 0.7)
                .addMove(200, {x: 0, y: 0})
                .addScale(800, 1);
            currentAnimation = customAnimation.play(block);
        });

    const worryAnimationHandler = animaster()
        .addMove(200, {x: 80, y: 0})
        .addMove(200, {x: 0, y: 0})
        .addMove(200, {x: 80, y: 0})
        .addMove(200, {x: 0, y: 0})
        .buildHandler();

    document
        .getElementById('worryAnimationPlay')
        .addEventListener('click', worryAnimationHandler);

    document.getElementById('rotatePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('rotateBlock');
            currentAnimation = animaster().addRotate(1000, 90).play(block);
        });

    document.getElementById('rotateStop')
        .addEventListener('click', function () {
            if (currentAnimation) {
                currentAnimation.stop();
                currentAnimation.reset();
                currentAnimation = null;
            }
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
