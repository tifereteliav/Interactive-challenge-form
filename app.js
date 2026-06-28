/* ==========================================================================
   INTERACTIVE CHALLENGE FORM - FRONTLEND LOGIC & ANIMATIONS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('google-form');
    const cards = [
        document.getElementById('card-welcome'),
        document.getElementById('card-q1'),
        document.getElementById('card-q2'),
        document.getElementById('card-q3'),
        document.getElementById('card-q4'),
        document.getElementById('card-submit'),
        document.getElementById('card-loading'),
        document.getElementById('card-success')
    ];
    
    const btnStart = document.getElementById('btn-start');
    const btnPrevList = document.querySelectorAll('.btn-prev');
    const btnSubmit = document.getElementById('btn-submit');
    const btnReset = document.getElementById('btn-reset');
    
    // Progress Ring Elements
    const progressRing = document.getElementById('progress-ring');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressText = document.getElementById('progress-text');
    
    // Summary Value Elements
    const summaryValQ1 = document.getElementById('summary-val-q1');
    const summaryValQ2 = document.getElementById('summary-val-q2');
    const summaryValQ3 = document.getElementById('summary-val-q3');
    const summaryValQ4 = document.getElementById('summary-val-q4');
    
    // Loading Bar Elements
    const submitProgressBar = document.getElementById('submit-progress-bar');
    const loadingStatusText = document.getElementById('loading-status-text');
    
    // Canvas Confetti
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    
    let currentCardIndex = 0;
    let answeredQuestionsCount = 0;
    let isTransitioning = false;
    let confettiActive = false;
    let confettiParticles = [];
    
    // Questions Entry Names
    const questionKeys = [
        'entry.1994126403', // Q1
        'entry.753390370',  // Q2
        'entry.288096859',  // Q3
        'entry.1978441009'  // Q4
    ];

    // Initialize Progress Ring Length
    let ringLength = 0;
    function initProgressRing() {
        if (progressRing) {
            ringLength = progressRing.getTotalLength();
            progressRing.style.strokeDasharray = `${ringLength} ${ringLength}`;
            progressRing.style.strokeDashoffset = ringLength;
        }
    }
    
    initProgressRing();
    window.addEventListener('resize', () => {
        initProgressRing();
        updateProgress();
    });

    // Helper: Calculate progress based on answered questions
    function updateProgress() {
        // Calculate number of answered questions
        let answered = 0;
        questionKeys.forEach(key => {
            const checked = form.querySelector(`input[name="${key}"]:checked`);
            if (checked) answered++;
        });
        
        answeredQuestionsCount = answered;
        
        // Progress percent
        const percent = Math.round((answeredQuestionsCount / 4) * 100);
        
        // Update Ring
        if (progressRing && ringLength) {
            const offset = ringLength - (percent / 100) * ringLength;
            progressRing.style.strokeDashoffset = offset;
        }
        
        // Update Labels
        if (progressPercentage) {
            progressPercentage.textContent = `${percent}%`;
        }
        
        if (progressText) {
            if (percent === 0) progressText.textContent = 'התחלת האתגר';
            else if (percent === 100) progressText.textContent = 'הושלם!';
            else progressText.textContent = 'התקדמות';
        }
    }

    // Helper: Slide transition between cards
    function showCard(targetIndex, direction = 'forward') {
        if (isTransitioning || targetIndex === currentCardIndex) return;
        isTransitioning = true;

        const currentCard = cards[currentCardIndex];
        const nextCard = cards[targetIndex];
        
        // Add slide classes
        if (direction === 'forward') {
            currentCard.classList.add('slide-out-left');
            nextCard.classList.add('slide-in-right');
        } else {
            currentCard.classList.add('slide-out-right');
            nextCard.classList.add('slide-in-left');
        }
        
        nextCard.classList.add('active');

        // Wait for animation to finish
        setTimeout(() => {
            currentCard.classList.remove('active', 'slide-out-left', 'slide-out-right');
            nextCard.classList.remove('slide-in-right', 'slide-in-left');
            currentCardIndex = targetIndex;
            isTransitioning = false;
        }, 500);
    }

    // Auto-advance on radio select
    form.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            updateProgress();
            
            // Only auto-advance if we are on a question card (indices 1 to 4)
            if (currentCardIndex >= 1 && currentCardIndex <= 4) {
                // Wait a moment so the user sees the option select animation
                setTimeout(() => {
                    if (currentCardIndex < 4) {
                        showCard(currentCardIndex + 1, 'forward');
                    } else {
                        // All answered, show summary card
                        buildSummary();
                        showCard(5, 'forward'); // Go to card-submit
                    }
                }, 400);
            }
        });
    });

    // Populate the summary values for card-submit
    function buildSummary() {
        const q1Val = form.querySelector('input[name="entry.1994126403"]:checked')?.value || '-';
        const q2Val = form.querySelector('input[name="entry.753390370"]:checked')?.value || '-';
        const q3Val = form.querySelector('input[name="entry.288096859"]:checked')?.value || '-';
        const q4Val = form.querySelector('input[name="entry.1978441009"]:checked')?.value || '-';
        
        if (summaryValQ1) summaryValQ1.textContent = q1Val;
        if (summaryValQ2) summaryValQ2.textContent = q2Val;
        if (summaryValQ3) summaryValQ3.textContent = q3Val;
        if (summaryValQ4) summaryValQ4.textContent = q4Val;
    }

    // Button event listeners
    btnStart.addEventListener('click', () => {
        showCard(1, 'forward');
    });

    btnPrevList.forEach(btn => {
        btn.addEventListener('click', () => {
            // Determine previous index
            let prevIndex = currentCardIndex - 1;
            if (currentCardIndex === 5) {
                // If on submit summary card, go back to question 4
                prevIndex = 4;
            }
            if (prevIndex >= 0) {
                showCard(prevIndex, 'backward');
            }
        });
    });

    // Form Submission Handling
    form.addEventListener('submit', (e) => {
        // Form submits to iframe in background, we handle UI transition here
        showCard(6, 'forward'); // Go to card-loading
        
        // Start simulated loading progress bar
        let progress = 0;
        submitProgressBar.style.width = '0%';
        
        const loadingTexts = [
            'יוצר חיבור מאובטח...',
            'משדר תשובות לכנס...',
            'רושם את הצבעתך במערכת...',
            'מתקף נתונים...'
        ];
        
        const interval = setInterval(() => {
            progress += 5;
            submitProgressBar.style.width = `${progress}%`;
            
            // Cycle status texts
            const textIdx = Math.floor((progress / 100) * loadingTexts.length);
            if (textIdx < loadingTexts.length) {
                loadingStatusText.textContent = loadingTexts[textIdx];
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    showCard(7, 'forward'); // Go to card-success
                    triggerConfetti();
                }, 300);
            }
        }, 80);
    });

    // Reset button
    btnReset.addEventListener('click', () => {
        form.reset();
        updateProgress();
        stopConfetti();
        showCard(0, 'backward'); // Go to welcome card
    });

    // ==========================================================================
    // CONFETTI CELEBRATION SYSTEM
    // ==========================================================================
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const confettiColors = [
        '#00f2fe', // cyan
        '#0072ff', // blue
        '#d4af37', // gold
        '#ff007f', // hot pink
        '#a855f7'  // purple
    ];

    class ConfettiParticle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * -canvas.height - 20;
            this.size = Math.random() * 8 + 4;
            this.speedY = Math.random() * 4 + 4;
            this.speedX = Math.random() * 4 - 2;
            this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 4 - 2;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.rotation += this.rotationSpeed;
            
            // Loop particles back to top if they fall off
            if (this.y > canvas.height) {
                this.y = -20;
                this.x = Math.random() * canvas.width;
                this.speedY = Math.random() * 4 + 4;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }

    function triggerConfetti() {
        confettiActive = true;
        confettiParticles = [];
        for (let i = 0; i < 120; i++) {
            confettiParticles.push(new ConfettiParticle());
        }
        animateConfetti();
    }

    function animateConfetti() {
        if (!confettiActive) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confettiParticles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animateConfetti);
    }

    function stopConfetti() {
        confettiActive = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiParticles = [];
    }
});
