document.addEventListener('DOMContentLoaded', () => {
    // Element references
    const donateForm = document.getElementById('donation-form');
    const amountButtons = document.querySelectorAll('.amount-btn');
    const customAmountContainer = document.getElementById('custom-amount-container');
    const customAmountInput = document.getElementById('custom-amount');
    const donateButton = document.getElementById('donate-button');
    const successModal = document.getElementById('success-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const closeButton = document.querySelector('.close-button');
    const nameInput = document.getElementById('full-name');
    const emailInput = document.getElementById('email');
    const causeSelect = document.getElementById('cause');
    const cardNumberInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('expiry');
    const cvvInput = document.getElementById('cvv');
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const causeError = document.getElementById('cause-error');
    const cardError = document.getElementById('card-error');
    const expiryError = document.getElementById('expiry-error');
    const cvvError = document.getElementById('cvv-error');
    const tabs = document.querySelectorAll('.tab');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const prevButton = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const dots = document.querySelectorAll('.dot');
    const donorsCount = document.getElementById('donors-count');
    const donationTotal = document.getElementById('donation-total');
    const livesImpacted = document.getElementById('lives-impacted');

    // Gallery slide variables
    let currentSlide = 0;
    const slides = document.querySelectorAll('.gallery-slide');
    const totalSlides = slides.length;

    // Donation amount variable
    let selectedAmount = 10; 


    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            localStorage.setItem('donateNow_activeTab', tabId);

            if (tabId === 'impact') {
                animateCounters();
            }
        });
    });

    // Amount buttons functionality
    amountButtons.forEach(btn => {
        btn.addEventListener('click', () => {

            amountButtons.forEach(b => b.classList.remove('selected'));

            btn.classList.add('selected');

            if (btn.getAttribute('data-amount') === 'custom') {
                customAmountContainer.style.display = 'block';
                selectedAmount = parseInt(customAmountInput.value) || 0;
            } else {
                customAmountContainer.style.display = 'none';
                selectedAmount = parseInt(btn.getAttribute('data-amount'));
                
                // Save last amount to localStorage
                localStorage.setItem('donateNow_lastAmount', selectedAmount);
            }
        });
    });

    // Custom amount input functionality
    customAmountInput.addEventListener('input', () => {
        selectedAmount = parseInt(customAmountInput.value) || 0;
    });

    // Form validation
    donateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        
        // Reset error messages
        nameError.textContent = '';
        emailError.textContent = '';
        causeError.textContent = '';
        cardError.textContent = '';
        expiryError.textContent = '';
        cvvError.textContent = '';
        
        // Validate name
        if (!nameInput.value.trim()) {
            nameError.textContent = 'Please enter your full name';
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            emailError.textContent = 'Please enter a valid email address';
            isValid = false;
        }
        
        // Validate cause
        if (!causeSelect.value) {
            causeError.textContent = 'Please select a cause';
            isValid = false;
        }
        
        // Validate card number
        const cardRegex = /^[0-9]{16}$/;
        const cardValue = cardNumberInput.value.replace(/\s/g, '');
        if (!cardRegex.test(cardValue)) {
            cardError.textContent = 'Please enter a valid 16-digit card number';
            isValid = false;
        }
        
        // Validate expiry
        const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!expiryRegex.test(expiryInput.value)) {
            expiryError.textContent = 'Please enter a valid expiry date (MM/YY)';
            isValid = false;
        } else {
            // Check if card is expired
            const [month, year] = expiryInput.value.split('/');
            const expDate = new Date(2000 + parseInt(year), parseInt(month));
            const today = new Date();
            if (expDate < today) {
                expiryError.textContent = 'Card has expired';
                isValid = false;
            }
        }
        
        // Validate CVV
        const cvvRegex = /^[0-9]{3,4}$/;
        if (!cvvRegex.test(cvvInput.value)) {
            cvvError.textContent = 'Please enter a valid CVV';
            isValid = false;
        }
        
        // Validate amount
        if (selectedAmount <= 0) {
            alert('Please select a valid donation amount');
            isValid = false;
        }
        
        // If valid, process the donation
        if (isValid) {
            donateButton.classList.add('clicked');
            setTimeout(() => {
                donateButton.classList.remove('clicked');
            }, 1000);

            saveDonorPreferences();
            
            // Update stats
            updateDonationStats(selectedAmount);

            showSuccessModal();
            
            // Reset form
            donateForm.reset();
            amountButtons.forEach(b => b.classList.remove('selected'));
            amountButtons[2].classList.add('selected');
            selectedAmount = 25;
            customAmountContainer.style.display = 'none';
        }
    });

    // Gallery navigation
    function showSlide(n) {
        // Ensure n is within bounds
        currentSlide = (n + totalSlides) % totalSlides;
        
        // Update slides container position
        const gallerySlides = document.querySelector('.gallery-slides');
        gallerySlides.style.transform = `translateX(-${currentSlide * 25}%)`;
        
        // Update active class on slides
        slides.forEach((slide, index) => {
            if (index === currentSlide) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        // Update dots
        dots.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // Save current slide to localStorage
        localStorage.setItem('donateNow_currentSlide', currentSlide);
    }
    
    prevButton.addEventListener('click', () => {
        showSlide(currentSlide - 1);
    });
    
    nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
    });
    
    // Dot navigation
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.getAttribute('data-slide'));
            showSlide(slideIndex);
        });
    });
    
    
    // Confetti animation
    function createConfetti() {
        const confettiContainer = document.querySelector('.confetti');
        confettiContainer.innerHTML = '';
        
        const colors = ['#e74c3c', '#4a6fa5', '#2ecc71', '#f1c40f', '#9b59b6'];
        
        for (let x = 0; x < 100; x++) {
            const confetti = document.createElement('div');
            const size = Math.random() * 8 + 4;
            
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.position = 'absolute';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = '0';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            
            // Add animation
            confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
            
            // Create keyframes dynamically
            const keyframes = `
                @keyframes fall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    25% {
                        transform: translateY(${Math.random() * 25 + 25}%) translateX(${(Math.random() - 0.5) * 15}%) rotate(${Math.random() * 360}deg);
                    }
                    50% {
                        transform: translateY(${Math.random() * 25 + 50}%) translateX(${(Math.random() - 0.5) * 30}%) rotate(${Math.random() * 720}deg);
                    }
                    75% {
                        transform: translateY(${Math.random() * 25 + 75}%) translateX(${(Math.random() - 0.5) * 15}%) rotate(${Math.random() * 1080}deg);
                    }
                    100% {
                        transform: translateY(100%) rotate(${Math.random() * 1440}deg);
                        opacity: 0;
                    }
                }
            `;
            
            const style = document.createElement('style');
            style.textContent = keyframes;
            document.head.appendChild(style);
            
            confettiContainer.appendChild(confetti);
        }
    }
    
    // Counter animation for impact section
    function animateCounters() {
        const stats = [
            { element: donorsCount, target: getRandomStat(150, 300), prefix: '', suffix: '' },
            { element: donationTotal, target: getRandomStat(25000, 50000), prefix: 'R', suffix: '' },
            { element: livesImpacted, target: getRandomStat(2000, 5000), prefix: '', suffix: '+' }
        ];
        
        stats.forEach(stat => {
            animateCounter(stat.element, 0, stat.target, 2000, stat.prefix, stat.suffix);
        });
    }
    
    function getRandomStat(min, max) {
        // If we have a saved stat in localStorage, return that
        const savedStats = JSON.parse(localStorage.getItem('donateNow_stats') || '{}');
        const key = min + '-' + max;
        
        if (savedStats[key]) {
            return savedStats[key];
        }
        
        const value = Math.floor(Math.random() * (max - min + 1)) + min;
        
        // Update savedStats
        savedStats[key] = value;
        localStorage.setItem('donateNow_stats', JSON.stringify(savedStats));
        
        return value;
    }
    
    function animateCounter(element, start, end, duration, prefix = '', suffix = '') {
        element.classList.add('counting');
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            
            if (end >= 1000) {
                element.textContent = prefix + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix;
            } else {
                element.textContent = prefix + value + suffix;
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.classList.remove('counting');
            }
        };
        
        window.requestAnimationFrame(step);
    }
    
    // Save user preferences to localStorage
    function saveDonorPreferences() {
        if (nameInput.value && emailInput.value && causeSelect.value) {
            const donorData = {
                name: nameInput.value,
                email: emailInput.value,
                preferredCause: causeSelect.value
            };
            
            localStorage.setItem('donateNow_donorData', JSON.stringify(donorData));
        }
        
        // Increment donation count
        const donationCwnt = parseInt(localStorage.getItem('donateNow_donationCount') || '0') + 1;
        localStorage.setItem('donateNow_donationCount', donationCwnt);
        
        // Add to total donation amount
        const totalDonated = parseFloat(localStorage.getItem('donateNow_totalDonated') || '0') + selectedAmount;
        localStorage.setItem('donateNow_totalDonated', totalDonated);
    }
    
    // Update donation statistics based on new donation
    function updateDonationStats(amount) {
        // Get current stats
        const cntDonors = parseInt(donorsCount.textContent.replace(/,/g, ''));
        const crntTotal = parseFloat(donationTotal.textContent.replace(/[$,]/g, ''));
        const crntLives = parseInt(livesImpacted.textContent.replace(/[,+]/g, ''));
        
        // Calculate new stats
        const nDonors = cntDonors + 1;
        const nTotal = crntTotal + amount;
        const nLives = crntLives + Math.floor(amount / 10); // Assume each $10 impacts 1 life
        
        // Save to localStorage
        const stats = {
            '150-300': nDonors,
            '25000-50000': nTotal,
            '2000-5000': nLives
        };
        localStorage.setItem('donateNow_stats', JSON.stringify(stats));
        
        // Animate the counters to new values
        animateCounter(donorsCount, cntDonors, nDonors, 1500);
        animateCounter(donationTotal, crntTotal, nTotal, 1500, 'R');
        animateCounter(livesImpacted, crntLives, nLives, 1500, '', '+');
    }
    
    // Load user preferences from localStorage
    function loadUserPreferences() {
        // Load theme preference
        const darkTheme = localStorage.getItem('donateNow_darkTheme') === 'true';
        if (darkTheme) {
            document.body.classList.add('dark-theme');
            themeSwitch.classList.add('dark');
        }
        
        // Load active tab
        const activeTab = localStorage.getItem('donateNow_activeTab');
        if (activeTab) {
            tabs.forEach(tab => tab.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            const selectedTab = document.querySelector(`.tab[data-tab="${activeTab}"]`);
            if (selectedTab) {
                selectedTab.classList.add('active');
                document.getElementById(activeTab).classList.add('active');
                
                if (activeTab === 'impact') {
                    animateCounters();
                }
            }
        }
        
        // Load gallery slide position
        const imgSlide = localStorage.getItem('donateNow_currentSlide');
        if (imgSlide !== null) {
            showSlide(parseInt(imgSlide));
        }
        
        // Load donor data for pre-filling form
        const donorData = JSON.parse(localStorage.getItem('donateNow_donorData') || '{}');
        if (donorData.name) nameInput.value = donorData.name;
        if (donorData.email) emailInput.value = donorData.email;
        if (donorData.preferredCause) causeSelect.value = donorData.preferredCause;
        
        const lastAmount = localStorage.getItem('donateNow_lastAmount');
        if (lastAmount) {
            const amountBtn = document.querySelector(`.amount-btn[data-amount="${lastAmount}"]`);
            if (amountBtn) {
                amountBtn.click();
            }
        }
        
        // Initialize stats if needed
        if (!localStorage.getItem('donateNow_stats')) {
            animateCounters();
        }
    }
    
    // Initialize gallery
    showSlide(currentSlide);
    
    // Check if impact tab is active
    if (document.querySelector('.tab[data-tab="impact"]').classList.contains('active')) {
        animateCounters();
    }
    
    // Logo animation on hover
    const logo = document.getElementById('logo');
    logo.addEventListener('mouseover', () => {
        logo.querySelector('svg').style.animationPlayState = 'running';
    });
    
    logo.addEventListener('mouseout', () => {
        logo.querySelector('svg').style.animationPlayState = 'paused';
    });
    
    loadUserPreferences();
});