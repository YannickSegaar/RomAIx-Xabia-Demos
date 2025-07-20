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
