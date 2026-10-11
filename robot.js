/* IBI is a scripted portfolio companion. No chat service or visitor data is used. */
(() => {
  const dock = document.querySelector('#byte-dock');
  if (!dock) return;
  const jokeText = document.querySelector('#byte-joke');
  const status = document.querySelector('#byte-status');
  const pauseButton = document.querySelector('#byte-pause');
  const voiceButton = document.querySelector('#byte-voice');
  const nextButton = document.querySelector('#byte-next');
  const avatar = document.querySelector('#byte-avatar');
  const readingPane = document.querySelector('#site-scroll');
  const dialog = document.querySelector('#project-dialog');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const jokes = [
    'My neural network started a band. It only plays deep tracks.',
    'I asked AI for a short answer. It sent me the director’s cut.',
    'My model joined a gym. It wanted stronger weights and fewer biases.',
    'I tried to be spontaneous. My training data saw it coming.',
    'I told my AI to think outside the box. It requested a bigger server.',
    'My favourite exercise? Running out of context.',
    'I asked a chatbot to keep a secret. It said, “Define keep.”',
    'My model went camping. It got lost in the random forest.',
    'I bought my AI a diary. Every entry started with “It depends.”',
    'My robot therapist said I had issues. I asked for the GitHub link.',
    'I tried a low-carb diet. Apparently, cookies are still essential.',
    'My model writes poetry. The rhyme is fine; the confidence is alarming.',
    'I joined a book club. They said reading the embeddings didn’t count.',
    'My AI made a five-year plan. Step one: find the missing semicolon.',
    'I asked for a little inspiration. The model returned 47 bullet points.',
    'I tried small talk. Accidentally generated a large language conversation.',
    'My neural network hates surprises. It prefers everything predicted.',
    'I opened a bakery for robots. Our speciality is microchips and dip.',
    'I asked AI to make my tea. It explained tea for 900 words.',
    'My model has great manners. It always says “thanks for the context.”',
    'I tried to take a holiday. My out-of-office reply started answering questions.',
    'My AI’s cooking is experimental. Every recipe has a temperature setting.',
    'I’m not procrastinating. I’m waiting for the next batch.',
    'My model went on a date. It brought excellent conversation starters and no context.',
    'I asked my AI for a reality check. It suggested checking the source.',
    'I’m great at multitasking: thinking, blinking, and forgetting why I opened this tab.',
    'My robot cat is very independent. It only responds to purr-ompts.',
    'I tried stand-up comedy. The audience asked for fewer training examples.',
    'My model is an optimist. Every loss is an opportunity to backpropagate.',
    'I asked AI to tidy my desk. It sorted my problems alphabetically.',
    'I don’t have a favourite child. I do have a preferred child process.',
    'My playlist is all algorithms. The recommendations are very self-centred.',
    'I took a mindfulness class. They told me to stay in the current context.',
    'I tried to write a humble bio. My model called me “revolutionary” six times.',
    'My AI joined a choir. Great harmony, occasional hallucinated lyrics.',
    'I asked for a bedtime story. It ended with “Would you like me to elaborate?”',
    'My robot dog doesn’t fetch sticks. It fetches dependencies.',
    'I’m learning to dance. So far, it’s mostly gradient descent.',
    'My AI tried gardening. It kept pruning the decision tree.',
    'I ordered a flat white. The model gave me a two-dimensional colour sample.',
    'I brought a spreadsheet to a party. Things got out of column.',
    'My dashboard went to art school. Now every bar has a backstory.',
    'I asked SQL for relationship advice. It suggested a better join.',
    'My data went to a spa. It came back clean, refreshed, and slightly normalised.',
    'I tried to tell a statistics joke. The response was not significant.',
    'My spreadsheet started meditating. It wanted inner cells.',
    'I put my feelings in a dashboard. Too many slicers, not enough clarity.',
    'My Python script wanted a pet. I recommended a panda.',
    'I asked a chart how it was doing. It said, “I’ve had my ups and downs.”',
    'My database has a great memory. Mine is mostly cached guesses.',
    'I told my model to be brief. It wrote a comprehensive guide to brevity.',
    'My AI got a coffee subscription. It calls it continuous integration.',
    'I tried speed dating. The latency was excellent; the compatibility was not.',
    'My model started a podcast. Episode one is still introducing the topic.',
    'I asked for a simple solution. My AI drew a twelve-box architecture diagram.',
    'I’m an excellent listener. Please stay within the context window.',
    'My model entered a staring contest. It blinked when the session timed out.',
    'I tried improv. Someone shouted “Yes, and!” I asked for acceptance criteria.',
    'My dreadlocks are wireless. The jokes still have a few bugs.',
    'I’m IBI. Small name, large language puns. Sorry in advance.'
  ];
  const gestures = [
    ['wave', 'Hello there!'], ['laugh', 'That one got me.'], ['dance', 'Tiny dance break'],
    ['wink', 'You got this.'], ['think', 'Big brain moment'], ['celebrate', 'Confetti time!'],
    ['heart', 'Sending good vibes'], ['moonwalk', 'Moonwalk mode'], ['wow', 'Mind. Blown.'],
    ['spin', 'A little victory spin'], ['bow', 'Thank you, thank you.'], ['dab', 'Data dab!'],
    ['backflip', 'Flipping out!'], ['juggle', 'Juggling a few ideas']
  ];
  const jokeInterval = 30000;
  const mood = document.querySelector('#byte-mood');
  let bag = [];
  let lastJoke = -1;
  let gestureIndex = 0;
  let jokeTimer;
  let motionTimer;
  let restTimer;
  let voice = false;
  let paused = motion.matches;
  let hidden = false;
  let ownSpeech = false;
  let speechGeneration = 0;
  try {
    paused = motion.matches || localStorage.getItem('byte-paused') === 'true';
    hidden = localStorage.getItem('byte-hidden') === 'true';
  } catch { /* The companion also works with browser storage disabled. */ }

  function save(key, value) {
    try { localStorage.setItem(key, String(value)); } catch { /* Optional preference. */ }
  }
  function blocked() { return hidden || document.hidden || Boolean(dialog?.open); }
  function clearTimers() {
    clearTimeout(jokeTimer);
    clearTimeout(motionTimer);
    clearTimeout(restTimer);
  }
  function cancelSpeech() {
    speechGeneration++;
    if (ownSpeech && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    ownSpeech = false;
  }
  function speak() {
    cancelSpeech();
    if (!voice || paused || blocked()) return;
    try {
      const generation = speechGeneration;
      const utterance = new SpeechSynthesisUtterance(jokeText.textContent);
      utterance.lang = 'en-AU';
      utterance.rate = 1;
      utterance.pitch = 1.15;
      utterance.onend = () => { if (generation === speechGeneration) ownSpeech = false; };
      utterance.onerror = () => {
        if (generation !== speechGeneration) return;
        ownSpeech = false;
        voice = false;
        updateControls();
        status.textContent = 'Voice is unavailable in this browser. IBI’s jokes are still available as text.';
      };
      ownSpeech = true;
      window.speechSynthesis.speak(utterance);
    } catch {
      voice = false;
      ownSpeech = false;
      updateControls();
      status.textContent = 'Voice is unavailable in this browser. Read the joke in IBI’s speech bubble.';
    }
  }
  function pickJoke() {
    if (!bag.length) {
      bag = jokes.map((_, i) => i);
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      if (bag[bag.length - 1] === lastJoke) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    lastJoke = bag.pop();
    jokeText.textContent = jokes[lastJoke];
  }
  function rest() {
    dock.dataset.gesture = 'idle';
    mood.textContent = 'Just vibing';
  }
  function gesture() {
    if (blocked()) return;
    if (paused || motion.matches) return;
    clearTimeout(restTimer);
    const [name, label] = gestures[gestureIndex++ % gestures.length];
    dock.dataset.gesture = name;
    mood.textContent = label;
    restTimer = setTimeout(rest, 4200);
  }
  function schedule() {
    clearTimeout(jokeTimer);
    clearTimeout(motionTimer);
    if (paused || blocked()) return;
    jokeTimer = setTimeout(() => { nextJoke(false); }, jokeInterval);
    if (!motion.matches) motionTimer = setTimeout(() => { gesture(); scheduleMotion(); }, 6500);
  }
  function scheduleMotion() {
    clearTimeout(motionTimer);
    if (!paused && !motion.matches && !blocked()) {
      motionTimer = setTimeout(() => { gesture(); scheduleMotion(); }, 6500);
    }
  }
  function nextJoke(manual) {
    pickJoke();
    if (manual) status.textContent = jokeText.textContent;
    gesture();
    speak();
    schedule();
  }
  function updateControls() {
    dock.hidden = hidden;
    dock.classList.toggle('is-paused', paused || blocked());
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.textContent = paused ? 'Resume' : 'Pause';
    pauseButton.title = paused ? 'Resume automatic jokes and gestures' : 'Pause automatic jokes, voice, and gestures';
    voiceButton.setAttribute('aria-pressed', String(voice));
    voiceButton.textContent = voice ? 'Voice on' : 'Voice off';
    document.querySelector('#byte-restore').textContent = hidden ? 'Bring IBI back ↗' : 'Meet IBI ↗';
  }
  function syncVisibility() {
    clearTimers();
    rest();
    dock.classList.toggle('is-suspended', Boolean(dialog?.open));
    updateControls();
    if (blocked()) cancelSpeech();
    schedule();
  }

  nextButton.addEventListener('click', () => nextJoke(true));
  avatar.addEventListener('click', () => nextJoke(true));
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    save('byte-paused', paused);
    clearTimers();
    cancelSpeech();
    rest();
    updateControls();
    status.textContent = paused ? 'IBI is paused. You can still ask for another joke.' : 'IBI’s automatic jokes have resumed.';
    schedule();
  });
  voiceButton.hidden = !('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);
  voiceButton.addEventListener('click', () => {
    voice = !voice;
    updateControls();
    if (voice) {
      // A deliberate click enables speech; audio never starts on page load.
      if (paused) status.textContent = 'Voice enabled. Resume IBI to hear the jokes.';
      else speak();
    } else cancelSpeech();
  });
  document.querySelector('#byte-hide').addEventListener('click', () => {
    hidden = true;
    save('byte-hidden', true);
    syncVisibility();
    // Keep keyboard focus near the user's reading position instead of jumping to the footer.
    const paneBounds = readingPane?.getBoundingClientRect();
    const nearby = [...document.querySelectorAll('main a, main button, main summary')].find(el => {
      const r = el.getBoundingClientRect();
      return r.width && r.top >= (paneBounds?.top || 0) && r.bottom <= (paneBounds?.bottom || innerHeight);
    });
    (nearby || document.querySelector('#byte-restore')).focus({ preventScroll: true });
  });
  document.querySelectorAll('[data-meet-byte]').forEach(button => button.addEventListener('click', () => {
    hidden = false;
    save('byte-hidden', false);
    syncVisibility();
    nextJoke(true);
    nextButton.focus({ preventScroll: true });
  }));
  document.addEventListener('visibilitychange', syncVisibility);
  if (dialog) new MutationObserver(syncVisibility).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  motion.addEventListener('change', () => {
    if (motion.matches) paused = true;
    clearTimers();
    cancelSpeech();
    rest();
    updateControls();
    schedule();
  });
  window.addEventListener('pagehide', () => { clearTimers(); cancelSpeech(); });
  window.addEventListener('pageshow', syncVisibility);
  pickJoke();
  updateControls();
  gesture();
  schedule();
})();
