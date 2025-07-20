//YRS: Tour Quiz Finder - VERSION 1

export const TourFinderQuizExtension1 = {
  name: 'TourFinderQuiz1',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_tourFinderQuiz1' || trace.payload?.name === 'ext_tourFinderQuiz1',
  render: ({ trace, element }) => {
    // --- Configuration (Passed from Voiceflow or default) ---
    const {
      workflowTitle = 'Find Your Perfect Xàbia Adventure',
      height = '700',
      primaryColor = '#0a9396',      // Deep Sea Blue/Teal
      secondaryColor = '#005f73',    // Darker Teal
      accentColor = '#ee9b00',       // Sandy Orange/Gold
      highlightColor = '#94d2bd',    // Light Seafoam Green
      backgroundColor = '#ffffff',
      textColor = '#333333',
      borderRadius = '12px',
      fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif"
    } = trace.payload || {};

    // --- Quiz Questions Data ---
    const questions = [
      {
        id: 'group-type',
        title: 'Who are you adventuring with?',
        description: 'This helps us find the perfect group vibe.',
        multiSelect: false,
        image: 'https://images.unsplash.com/photo-1529946179074-bcedd53a3275?q=80&w=870&auto=format&fit=crop',
        options: [
          { id: 'family', text: 'With Family', image: 'https://images.unsplash.com/photo-1550616196-b6b845116710?q=80&w=870&auto=format&fit=crop' },
          { id: 'couple', text: 'As a Couple', image: 'https://images.unsplash.com/photo-1532323544230-7191e6b6e379?q=80&w=870&auto=format&fit=crop' },
          { id: 'friends', text: 'With Friends', image: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?q=80&w=870&auto=format&fit=crop' },
          { id: 'solo', text: 'Flying Solo', image: 'https://images.unsplash.com/photo-1505503613146-8c4f519c5b59?q=80&w=870&auto=format&fit=crop' }
        ]
      },
      {
        id: 'vibe',
        title: 'What’s your ideal vacation vibe?',
        description: 'Choose the energy that calls to you.',
        multiSelect: false,
        image: 'https://images.unsplash.com/photo-1517495331395-900592962263?q=80&w=870&auto=format&fit=crop',
        options: [
          { id: 'relax', text: 'Total Relaxation', image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=870&auto=format&fit=crop' },
          { id: 'adventure', text: 'Adrenaline & Adventure', image: 'https://images.unsplash.com/photo-1617150097103-518390b1a202?q=80&w=870&auto=format&fit=crop' },
          { id: 'culture', text: 'Scenery & Culture', image: 'https://images.unsplash.com/photo-1599859223849-a03f47e0303c?q=80&w=870&auto=format&fit=crop' }
        ]
      },
      {
        id: 'environment',
        title: 'Where do you want to be?',
        description: 'Sun on your face, but from where?',
        multiSelect: false,
        image: 'https://images.unsplash.com/photo-1598453434037-3463c1d4cb13?q=80&w=870&auto=format&fit=crop',
        options: [
          { id: 'water', text: 'On the Water', image: 'https://images.unsplash.com/photo-1593184675909-ca9ab7a4e69b?q=80&w=870&auto=format&fit=crop' },
          { id: 'land', text: 'On Solid Ground', image: 'https://images.unsplash.com/photo-1623630654863-75b22b29d91f?q=80&w=870&auto=format&fit=crop' }
        ]
      }
    ];

    // --- Tour Recommendations Data ---
    const tourRecommendations = {
      'boat-trip': {
          name: 'Private Cove Discovery by Boat',
          description: 'Perfect for relaxing and soaking up the sun. Ideal for families and couples who want to discover the coast effortlessly.',
          image: 'https://images.unsplash.com/photo-1593184675909-ca9ab7a4e69b?q=80&w=870&auto=format&fit=crop'
      },
      'jet-ski': {
          name: 'Adrenaline Jet Ski Safari',
          description: 'Feel the speed and freedom on the open water! The perfect choice for friends and adventurous couples seeking a thrill.',
          image: 'https://images.unsplash.com/photo-1587123992021-36f04c7d061b?q=80&w=870&auto=format&fit=crop'
      },
      'hiking-montgo': {
          name: 'Guided Hike on Montgó',
          description: 'Discover local flora and fauna with spectacular views. Great for adventurers and lovers of culture and scenery.',
          image: 'https://images.unsplash.com/photo-1623630654863-75b22b29d91f?q=80&w=870&auto=format&fit=crop'
      },
      'kayak-snorkel': {
          name: 'Sea Cave Kayak & Snorkel Tour',
          description: 'A perfect mix of sport and relaxation, exploring hidden caves and vibrant marine life. Ideal for everyone!',
          image: 'https://images.unsplash.com/photo-1605333152643-d6facd9b68a6?q=80&w=870&auto=format&fit=crop'
      }
    };

    // --- State Variables ---
    let currentStepIndex = -1; // -1 for intro, 0+ for questions
    let answers = {};
    let calculatingTimeout = null;

    // --- Initial Setup ---
    element.innerHTML = '';
    const container = document.createElement('div');
    container.style.cssText = `width: 100%; display: flex; justify-content: center; align-items: flex-start; background-color: transparent; margin: 0; padding: 10px 0; font-family: ${fontFamily};`;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'tour-quiz-wrapper';
    wrapper.style.cssText = `
      width: 100%; max-width: 480px;
      border: 1px solid #e0e0e0; border-radius: ${borderRadius};
      overflow: hidden; background-color: ${backgroundColor};
      box-shadow: 0 4px 15px rgba(0,0,0,0.1); height: ${height}px;
      display: flex; flex-direction: column; margin: 0 auto; position: relative;
      opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease;
    `;

    // --- HTML Structure ---
    wrapper.innerHTML = `
      <style>
        .tour-quiz-wrapper * { box-sizing: border-box; font-family: inherit; }
        .workflow-header { background-color: ${primaryColor}; color: white; padding: 20px; text-align: center; }
        .workflow-header h2 { margin: 0; font-size: 22px; }
        .workflow-content { flex: 1; overflow-y: auto; padding: 25px; position: relative; }
        .workflow-step { display: none; animation: fadeIn 0.4s ease-in-out; }
        .workflow-step.active { display: flex; flex-direction: column; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Intro Step */
        .intro-image { width: 100%; height: 200px; object-fit: cover; border-radius: ${borderRadius}; margin-bottom: 20px; }
        .intro-title { font-size: 24px; font-weight: bold; color: ${textColor}; margin-bottom: 15px; text-align: center; }
        .intro-description { font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 25px; text-align: center; }
        
        /* Question Step */
        .progress-bar { width: 100%; background-color: #e0e0e0; border-radius: 5px; height: 8px; margin-bottom: 20px; }
        .progress-bar-fill { width: 0%; background-color: ${accentColor}; height: 100%; border-radius: 5px; transition: width 0.4s ease; }
        .question-title { font-size: 22px; font-weight: bold; color: ${textColor}; margin-bottom: 10px; }
        .question-description { font-size: 15px; color: #555; margin-bottom: 20px; }
        .options-container { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .option { border: 2px solid #e0e0e0; border-radius: ${borderRadius}; overflow: hidden; cursor: pointer; transition: all 0.2s ease; position: relative; }
        .option:hover { border-color: ${highlightColor}; transform: translateY(-3px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .option.selected { border-color: ${primaryColor}; }
        .option-image { width: 100%; height: 120px; object-fit: cover; }
        .option-text { padding: 15px 10px; font-size: 15px; text-align: center; font-weight: 500; color: ${textColor}; }
        .option-check { position: absolute; top: 10px; right: 10px; width: 24px; height: 24px; background-color: ${primaryColor}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: scale(0); transition: transform 0.2s ease; }
        .option.selected .option-check { transform: scale(1); }
        
        /* Calculating & Results Step */
        .centered-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 30px; }
        .spinner { width: 50px; height: 50px; border: 5px solid rgba(0,0,0,0.1); border-radius: 50%; border-top-color: ${primaryColor}; animation: spin 1s linear infinite; margin-bottom: 25px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .results-card { background: #fff; border-radius: ${borderRadius}; padding: 25px; text-align: center; width: 100%; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .results-image { width: 100%; height: 180px; object-fit: cover; border-radius: ${borderRadius}; margin-bottom: 20px; }
        .results-title { font-size: 22px; font-weight: bold; color: ${primaryColor}; margin-bottom: 10px; }
        .results-description { font-size: 15px; color: #555; line-height: 1.5; margin-bottom: 25px; }
        .prize-box { background-color: ${highlightColor}30; border: 2px dashed ${highlightColor}; border-radius: ${borderRadius}; padding: 15px; margin-top: 20px; }
        .prize-title { font-size: 16px; font-weight: bold; color: ${secondaryColor}; margin-bottom: 10px; }
        .prize-code { font-size: 20px; font-weight: bold; color: ${accentColor}; letter-spacing: 2px; }

        /* Buttons */
        .btn-container { padding: 20px 25px; width: 100%; margin-top: auto; background: #fff; border-top: 1px solid #eee; }
        .btn { display: block; width: 100%; padding: 15px; border-radius: ${borderRadius}; font-weight: bold; cursor: pointer; border: none; font-size: 16px; transition: all 0.2s ease; }
        .btn-primary { background-color: ${accentColor}; color: white; }
        .btn-primary:hover:not(:disabled) { background-color: #d48c00; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .btn-primary:disabled { background-color: #ccc; cursor: not-allowed; }
        .btn-secondary { background-color: #e0e0e0; color: #555; }
      </style>

      <div class="workflow-header"><h2>${workflowTitle}</h2></div>
      <div class="workflow-content">
        <div id="intro-step" class="workflow-step active">
          <img class="intro-image" src="https://images.unsplash.com/photo-1598453434037-3463c1d4cb13?q=80&w=870&auto=format&fit=crop" alt="Xàbia Coastline">
          <h3 class="intro-title">Your Perfect Day in Xàbia Awaits!</h3>
          <p class="intro-description">Answer 3 quick questions to uncover your ideal tour and win an exclusive discount!</p>
        </div>
        <div id="question-step" class="workflow-step"></div>
        <div id="calculating-step" class="workflow-step">
          <div class="centered-container">
            <div class="spinner"></div>
            <h3 class="intro-title">Crafting Your Adventure...</h3>
          </div>
        </div>
        <div id="results-step" class="workflow-step"></div>
      </div>
      <div class="btn-container">
        <button id="main-btn" class="btn btn-primary">Let's Go!</button>
      </div>
    `;
    
    container.appendChild(wrapper);
    element.appendChild(container);

    // --- Post-Render Animation ---
    setTimeout(() => {
      wrapper.style.opacity = '1';
      wrapper.style.transform = 'translateY(0)';
    }, 100);

    // --- Core Functions ---
    const mainBtn = wrapper.querySelector('#main-btn');
    const introStep = wrapper.querySelector('#intro-step');
    const questionStep = wrapper.querySelector('#question-step');
    const calculatingStep = wrapper.querySelector('#calculating-step');
    const resultsStep = wrapper.querySelector('#results-step');
    const btnContainer = wrapper.querySelector('.btn-container');

    function showStep(stepElement) {
        [introStep, questionStep, calculatingStep, resultsStep].forEach(s => s.classList.remove('active'));
        stepElement.classList.add('active');
    }

    function renderQuestion() {
        const question = questions[currentStepIndex];
        questionStep.innerHTML = `
            <div class="progress-bar"><div class="progress-bar-fill" style="width: ${((currentStepIndex + 1) / questions.length) * 100}%"></div></div>
            <h3 class="question-title">${question.title}</h3>
            <p class="question-description">${question.description}</p>
            <div class="options-container">
                ${question.options.map(opt => `
                    <div class="option" data-option-id="${opt.id}">
                        <img class="option-image" src="${opt.image}" alt="${opt.text}">
                        <div class="option-text">${opt.text}</div>
                        <div class="option-check">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        const isAnswered = !!answers[question.id];
        mainBtn.disabled = !isAnswered;
        mainBtn.textContent = (currentStepIndex === questions.length - 1) ? 'See My Tour!' : 'Next';

        if (isAnswered) {
            questionStep.querySelector(`.option[data-option-id="${answers[question.id]}"]`).classList.add('selected');
        }

        questionStep.querySelectorAll('.option').forEach(opt => {
            opt.addEventListener('click', () => {
                const selectedId = opt.dataset.optionId;
                answers[question.id] = selectedId;
                questionStep.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                mainBtn.disabled = false;
            });
        });
    }

    function calculateResults() {
        const { vibe, environment } = answers;
        if (vibe === 'adventure' && environment === 'water') return tourRecommendations['jet-ski'];
        if (vibe === 'relax' && environment === 'water') return tourRecommendations['boat-trip'];
        if (vibe === 'culture' && environment === 'land') return tourRecommendations['hiking-montgo'];
        return tourRecommendations['kayak-snorkel']; // Default
    }

    function renderResults() {
        const result = calculateResults();
        const discountCode = `XABIA${Math.floor(1000 + Math.random() * 9000)}`;

        resultsStep.innerHTML = `
          <div class="centered-container">
            <div class="results-card">
              <p style="font-weight: bold; color: #555;">YOUR PERFECT TOUR IS...</p>
              <h3 class="results-title">${result.name}</h3>
              <img class="results-image" src="${result.image}" alt="${result.name}">
              <p class="results-description">${result.description}</p>
              <div class="prize-box">
                <p class="prize-title">You've won a discount!</p>
                <p class="prize-code">${discountCode}</p>
              </div>
            </div>
          </div>
        `;

        mainBtn.textContent = 'Awesome! Send My Prize';
        mainBtn.disabled = false;
        btnContainer.style.display = 'block';

        // Send data back to Voiceflow
         if (window.voiceflow?.chat) {
            window.voiceflow.chat.interact({
                type: 'request',
                payload: {
                    type: 'tour-quiz-complete',
                    data: {
                        answers: answers,
                        recommendedTour: result.name,
                        discountCode: discountCode
                    }
                }
            });
        }
    }

    mainBtn.addEventListener('click', () => {
        if (currentStepIndex === -1) { // From intro to first question
            currentStepIndex = 0;
            showStep(questionStep);
            renderQuestion();
        } else if (currentStepIndex < questions.length - 1) { // Next question
            currentStepIndex++;
            showStep(questionStep);
            renderQuestion();
        } else if (currentStepIndex === questions.length - 1) { // To results
            showStep(calculatingStep);
            btnContainer.style.display = 'none';
            calculatingTimeout = setTimeout(() => {
                showStep(resultsStep);
                renderResults();
            }, 2000);
        } else { // Final click on results page
             // This can close the extension or show a final message
             wrapper.innerHTML = `<div class="centered-container"><h3 class="intro-title">Great! We've sent your prize to your email.</h3></div>`;
        }
    });

    // Cleanup function
    return function cleanup() {
      if (calculatingTimeout) clearTimeout(calculatingTimeout);
    };
  }
};

//YRS: Property Calculator - VERSION 1

export const PropertyCalculatorExtension1 = {
  name: 'PropertyCalculator1',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_propertyCalculator1' || trace.payload?.name === 'ext_propertyCalculator1',
  render: ({ trace, element }) => {
    // --- Configuration (Styled to match Xàbia Properties website) ---
    const {
      apiKey = 'AIzaSyA5y-Tq-IEhgS1NQxY7HgnXe4pPA4tPuH4', // IMPORTANT: Replace with your actual API key
      workflowTitle = 'Xàbia Property Finder',
      height = '700',
      primaryColor = '#3a5f8a',      // Professional Blue from screenshot
      secondaryColor = '#2c5282',    // Darker Blue for hover
      accentColor = '#3a5f8a',       // Using primary blue for buttons
      backgroundColor = '#ffffff',
      formBackgroundColor = '#f8f9fa',
      textColor = '#333333',
      borderRadius = '8px',
      fontFamily = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    } = trace.payload || {};

    // --- Sample Property Data (for demo purposes) ---
    const propertiesData = [
        { id: 'finca-montgo', name: 'Traditional Finca near Montgó', price: 850000, image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2e0?q=80&w=870&auto=format&fit=crop', description: 'Tranquility and space with a private plot and pool.'},
        { id: 'atico-arenal', name: 'Modern Penthouse in El Arenal', price: 680000, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=870&auto=format&fit=crop', description: 'Spacious and stylish, steps from the beach and restaurants.'},
        { id: 'apto-puerto', name: 'Apartment in The Port', price: 450000, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=870&auto=format&fit=crop', description: 'Perfect for enjoying the vibrant port atmosphere and amenities.'},
        { id: 'villa-grana', name: 'Luxury Villa in Granadella', price: 1850000, image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=870&auto=format&fit=crop', description: 'Front-line luxury with stunning sea views.'}
    ];

    // --- State Management ---
    const workflowData = {
      currentStep: 'location',
      userLocation: { address: '', lat: 0, lng: 0 },
      budgetInputs: { income: '', deposit: '', term: '25' },
      calculatedBudget: 0,
      matchingProperties: [],
      selectedProperty: null,
      contactInfo: { name: '', email: '', phone: '', availability: '' },
      autocomplete: null
    };

    // --- Initial Setup ---
    element.innerHTML = '';
    const container = document.createElement('div');
    container.style.cssText = `width: 100%; display: flex; justify-content: center; align-items: flex-start; background-color: transparent; margin: 0; padding: 10px 0; font-family: ${fontFamily};`;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'property-calc-wrapper';
    wrapper.style.cssText = `
      width: 100%; max-width: 480px;
      border: 1px solid #dee2e6; border-radius: ${borderRadius};
      overflow: hidden; background-color: ${backgroundColor};
      box-shadow: 0 5px 20px rgba(0,0,0,0.1); height: ${height}px;
      display: flex; flex-direction: column; margin: 0 auto; position: relative;
      opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease;
    `;

    // --- HTML Structure ---
    wrapper.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .property-calc-wrapper * { box-sizing: border-box; font-family: inherit; }
        .workflow-header { background-color: ${primaryColor}; color: white; padding: 16px 20px; text-align: center; }
        .workflow-header h2 { margin: 0; font-size: 20px; font-weight: 600; }
        .workflow-content { flex: 1; overflow-y: auto; position: relative; }
        .workflow-step { display: none; animation: fadeIn 0.4s ease-in-out; padding: 25px; height: 100%; }
        .workflow-step.active { display: flex; flex-direction: column; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .step-title { font-size: 22px; font-weight: 700; color: ${textColor}; margin-bottom: 10px; text-align: center; }
        .step-description { font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 25px; text-align: center; }
        
        /* Form Styles */
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-weight: 500; margin-bottom: 8px; font-size: 14px; }
        .form-input { width: 100%; padding: 12px; border: 1px solid #ced4da; border-radius: ${borderRadius}; font-size: 16px; }
        .form-input:focus { outline: none; border-color: ${primaryColor}; box-shadow: 0 0 0 2px ${primaryColor}40; }
        
        /* Location Step */
        .location-input-container { position: relative; }
        .location-input-container svg { position: absolute; left: 12px; top: 13px; color: #888; }
        #location-input { padding-left: 40px; }

        /* Budget Step */
        .input-group { display: flex; align-items: center; }
        .input-group-prepend { padding: 12px; background-color: #e9ecef; border: 1px solid #ced4da; border-right: none; border-radius: ${borderRadius} 0 0 ${borderRadius}; }
        .input-group .form-input { border-radius: 0 ${borderRadius} ${borderRadius} 0; }
        
        /* Results Step */
        .results-summary { background-color: ${formBackgroundColor}; padding: 20px; border-radius: ${borderRadius}; text-align: center; margin-bottom: 20px; }
        .budget-label { font-size: 16px; font-weight: 500; color: #555; margin-bottom: 5px; }
        .budget-amount { font-size: 32px; font-weight: 700; color: ${primaryColor}; }
        .disclaimer { font-size: 12px; color: #777; margin-top: 15px; line-height: 1.5; }
        
        /* Property Carousel */
        .carousel-container { width: 100%; height: 280px; position: relative; overflow: hidden; }
        .carousel-track { display: flex; height: 100%; transition: transform 0.4s ease; }
        .property-card { width: 100%; flex-shrink: 0; padding: 0 10px; }
        .property-card-inner { border: 1px solid #e0e0e0; border-radius: ${borderRadius}; overflow: hidden; height: 100%; display: flex; flex-direction: column; }
        .property-image { width: 100%; height: 150px; object-fit: cover; }
        .property-info { padding: 15px; }
        .property-name { font-size: 16px; font-weight: 600; margin-bottom: 5px; }
        .property-price { font-size: 15px; font-weight: 500; color: ${primaryColor}; }
        .carousel-nav { display: flex; justify-content: center; align-items: center; margin-top: 15px; }
        .nav-arrow { cursor: pointer; padding: 5px; }
        .nav-dots { display: flex; gap: 8px; margin: 0 15px; }
        .nav-dot { width: 10px; height: 10px; background: #ccc; border-radius: 50%; transition: background 0.2s; }
        .nav-dot.active { background: ${primaryColor}; }

        /* Confirmation Step */
        .confirmation-container { text-align: center; padding-top: 50px; }
        .confirmation-icon { color: #28a745; width: 80px; height: 80px; margin-bottom: 20px; }

        /* Buttons */
        .btn-container { padding: 20px; width: 100%; margin-top: auto; background: #fff; border-top: 1px solid #eee; }
        .btn { display: block; width: 100%; padding: 15px; border-radius: ${borderRadius}; font-weight: 600; cursor: pointer; border: none; font-size: 16px; transition: all 0.2s ease; }
        .btn-primary { background-color: ${accentColor}; color: white; }
        .btn-primary:hover:not(:disabled) { background-color: ${secondaryColor}; }
        .btn-primary:disabled { background-color: #ccc; cursor: not-allowed; }
      </style>

      <div class="workflow-header"><h2>${workflowTitle}</h2></div>
      <div class="workflow-content">
        <!-- Step 1: Location -->
        <div id="step-location" class="workflow-step">
          <h3 class="step-title">Where are you looking?</h3>
          <p class="step-description">Start by telling us the area in or around Xàbia that interests you most.</p>
          <div class="form-group location-input-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <input type="text" id="location-input" class="form-input" placeholder="e.g., El Arenal, Jávea">
          </div>
        </div>
        <!-- Step 2: Budget Inputs -->
        <div id="step-budget" class="workflow-step">
            <h3 class="step-title">Let's Talk Budget</h3>
            <p class="step-description">Provide some details so we can estimate your property budget.</p>
            <div class="form-group">
                <label for="income-input">Your Net Monthly Income</label>
                <div class="input-group"><span class="input-group-prepend">€</span><input type="number" id="income-input" class="form-input" placeholder="3000"></div>
            </div>
            <div class="form-group">
                <label for="deposit-input">Your Available Deposit</label>
                <div class="input-group"><span class="input-group-prepend">€</span><input type="number" id="deposit-input" class="form-input" placeholder="50000"></div>
            </div>
        </div>
        <!-- Step 3: Results -->
        <div id="step-results" class="workflow-step">
            <div class="results-summary">
                <p class="budget-label">Your Estimated Property Budget</p>
                <p id="budget-amount" class="budget-amount">€0</p>
                <p class="disclaimer"><strong>Disclaimer:</strong> This is an estimate for demonstration purposes only. A qualified agent will provide an accurate financial assessment.</p>
            </div>
            <h4 style="text-align: center; font-weight: 600; margin-bottom: 15px;">Properties in Your Range</h4>
            <div class="carousel-container">
                <div class="carousel-track" id="carousel-track"></div>
            </div>
            <div class="carousel-nav">
                <div class="nav-arrow" id="prev-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </div>
                <div class="nav-dots" id="nav-dots"></div>
                <div class="nav-arrow" id="next-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
            </div>
        </div>
        <!-- Step 4: Contact Form -->
        <div id="step-form" class="workflow-step">
            <h3 class="step-title">Request a Viewing</h3>
            <p class="step-description">You're one step away! Provide your details and preferred availability.</p>
            <div class="form-group"><label for="name-input">Full Name</label><input type="text" id="name-input" class="form-input"></div>
            <div class="form-group"><label for="email-input">Email Address</label><input type="email" id="email-input" class="form-input"></div>
            <div class="form-group"><label for="availability-input">Your Availability</label><textarea id="availability-input" class="form-input" rows="3" placeholder="e.g., Weekday afternoons, this weekend..."></textarea></div>
        </div>
        <!-- Step 5: Confirmation -->
        <div id="step-confirmation" class="workflow-step">
            <div class="confirmation-container">
                <svg class="confirmation-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <h3 class="step-title">Inquiry Sent!</h3>
                <p class="step-description">Thank you, [Customer Name]. We've received your request and one of our expert agents will contact you shortly to arrange your viewing.</p>
            </div>
        </div>
      </div>
      <div class="btn-container">
        <button id="main-btn" class="btn btn-primary" disabled>Next</button>
      </div>
    `;
    
    container.appendChild(wrapper);
    element.appendChild(container);

    // --- Post-Render Animation ---
    setTimeout(() => {
      wrapper.style.opacity = '1';
      wrapper.style.transform = 'translateY(0)';
    }, 100);

    // --- DOM Element References ---
    const mainBtn = wrapper.querySelector('#main-btn');
    const steps = {
        location: wrapper.querySelector('#step-location'),
        budget: wrapper.querySelector('#step-budget'),
        results: wrapper.querySelector('#step-results'),
        form: wrapper.querySelector('#step-form'),
        confirmation: wrapper.querySelector('#step-confirmation')
    };
    const locationInput = wrapper.querySelector('#location-input');
    const incomeInput = wrapper.querySelector('#income-input');
    const depositInput = wrapper.querySelector('#deposit-input');

    // --- Core Functions ---
    function showStep(stepName) {
        workflowData.currentStep = stepName;
        Object.values(steps).forEach(s => s.classList.remove('active'));
        steps[stepName].classList.add('active');
        updateButtonState();
    }
    
    function updateButtonState() {
        mainBtn.style.display = 'block';
        switch(workflowData.currentStep) {
            case 'location':
                mainBtn.textContent = 'Next';
                mainBtn.disabled = !workflowData.userLocation.address;
                break;
            case 'budget':
                mainBtn.textContent = 'Calculate My Budget';
                mainBtn.disabled = !incomeInput.value || !depositInput.value;
                break;
            case 'results':
                mainBtn.textContent = 'Request a Viewing';
                mainBtn.disabled = !workflowData.selectedProperty;
                break;
            case 'form':
                mainBtn.textContent = 'Submit Inquiry';
                const name = wrapper.querySelector('#name-input').value;
                const email = wrapper.querySelector('#email-input').value;
                mainBtn.disabled = !name || !email;
                break;
            case 'confirmation':
                mainBtn.style.display = 'none';
                break;
        }
    }

    function calculateBudget() {
        const income = parseFloat(incomeInput.value) || 0;
        const deposit = parseFloat(depositInput.value) || 0;
        
        // Simple formula: (Net monthly income * 35%) * 12 * (25 years / 2) + deposit
        const maxMonthlyPayment = income * 0.35;
        const estimatedLoan = maxMonthlyPayment * 12 * 12.5;
        workflowData.calculatedBudget = Math.round((estimatedLoan + deposit) / 1000) * 1000;

        // Filter properties and render
        workflowData.matchingProperties = propertiesData.filter(p => p.price <= workflowData.calculatedBudget);
        if (workflowData.matchingProperties.length === 0) {
            // If no properties match, show the cheapest one as an example
            workflowData.matchingProperties.push(propertiesData.sort((a,b) => a.price - b.price)[0]);
        }
        workflowData.selectedProperty = workflowData.matchingProperties[0]; // Pre-select first one

        renderResults();
    }

    function renderResults() {
        wrapper.querySelector('#budget-amount').textContent = `€${workflowData.calculatedBudget.toLocaleString('es-ES')}`;
        const track = wrapper.querySelector('#carousel-track');
        track.innerHTML = workflowData.matchingProperties.map(p => `
            <div class="property-card" data-property-id="${p.id}">
                <div class="property-card-inner">
                    <img src="${p.image}" alt="${p.name}" class="property-image">
                    <div class="property-info">
                        <p class="property-name">${p.name}</p>
                        <p class="property-price">€${p.price.toLocaleString('es-ES')}</p>
                    </div>
                </div>
            </div>
        `).join('');
        // More complex carousel logic would go here (navigation, etc.)
        updateButtonState();
    }

    function loadGoogleMapsScript() {
      if (window.google && window.google.maps) {
        initializeAutocomplete();
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      window.initGoogleMaps = initializeAutocomplete;
      document.head.appendChild(script);
    }

    function initializeAutocomplete() {
        const autocompleteOptions = {
            componentRestrictions: { country: "es" },
            bounds: new google.maps.LatLngBounds( // Bias towards Jávea area
                new google.maps.LatLng(38.7, -0.05), // SW
                new google.maps.LatLng(38.9, 0.25)   // NE
            ),
            fields: ["formatted_address", "geometry"]
        };
        workflowData.autocomplete = new google.maps.places.Autocomplete(locationInput, autocompleteOptions);
        workflowData.autocomplete.addListener('place_changed', () => {
            const place = workflowData.autocomplete.getPlace();
            if (place.geometry) {
                workflowData.userLocation = {
                    address: place.formatted_address,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };
                updateButtonState();
            }
        });
    }
    
    // --- Event Listeners ---
    mainBtn.addEventListener('click', () => {
        switch(workflowData.currentStep) {
            case 'location':
                showStep('budget');
                break;
            case 'budget':
                calculateBudget();
                showStep('results');
                break;
            case 'results':
                showStep('form');
                break;
            case 'form':
                // Capture form data
                workflowData.contactInfo.name = wrapper.querySelector('#name-input').value;
                workflowData.contactInfo.email = wrapper.querySelector('#email-input').value;
                workflowData.contactInfo.availability = wrapper.querySelector('#availability-input').value;
                
                // Update confirmation message with name
                steps.confirmation.querySelector('.step-description').textContent = `Thank you, ${workflowData.contactInfo.name}. We've received your request and one of our expert agents will contact you shortly to arrange your viewing.`;
                
                // Send data to Voiceflow
                if (window.voiceflow?.chat) {
                    window.voiceflow.chat.interact({
                        type: 'request',
                        payload: {
                            type: 'property-inquiry-complete',
                            data: workflowData
                        }
                    });
                }
                showStep('confirmation');
                break;
        }
    });

    // Input listeners to enable/disable button
    [locationInput, incomeInput, depositInput, wrapper.querySelector('#name-input'), wrapper.querySelector('#email-input')].forEach(input => {
        input.addEventListener('input', updateButtonState);
    });

    // --- Initial Kick-off ---
    showStep('location');
    loadGoogleMapsScript();

    return function cleanup() { /* ... */ };
  }
};
