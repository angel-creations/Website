import { useEffect } from 'react';

/*
 * The captured About template hides every .reveal-text node in page CSS and relied on
 * inline GSAP scripts. This scoped equivalent retains the original line-reveal language
 * without executing archived scripts globally.
 */
function splitLines(element: HTMLElement): HTMLSpanElement[] {
  if (element.dataset.splitText !== undefined) {
    return Array.from(element.querySelectorAll<HTMLSpanElement>(':scope > .line > .words'));
  }

  const sourceText = element.textContent ?? '';
  element.dataset.splitText = sourceText;
  const words = document.createDocumentFragment();

  sourceText.split(/\s/).forEach((word, wordIndex, sourceWords) => {
    word.split('-').forEach((part, partIndex, hyphenParts) => {
      const wordNode = document.createElement('span');
      wordNode.className = 'word';
      wordNode.textContent = part;
      words.append(wordNode);
      if (partIndex < hyphenParts.length - 1) {
        const hyphen = document.createElement('span');
        hyphen.className = 'hyphen';
        hyphen.textContent = '-';
        words.append(hyphen);
      }
    });
    if (wordIndex < sourceWords.length - 1) {
      const whitespace = document.createElement('span');
      whitespace.className = 'whitespace';
      whitespace.textContent = ' ';
      words.append(whitespace);
    }
  });
  element.replaceChildren(words);

  const lines: HTMLElement[][] = [];
  let line: HTMLElement[] | undefined;
  let lastTop: number | undefined;
  const tokens = Array.from(element.querySelectorAll<HTMLElement>(':scope > span'));
  tokens.forEach((token) => {
    if (token.offsetTop !== lastTop && !token.classList.contains('whitespace')) {
      lastTop = token.offsetTop;
      line = [];
      lines.push(line);
    }
    line?.push(token);
  });

  const wrapped = document.createDocumentFragment();
  lines.forEach((tokensInLine) => {
    const lineNode = document.createElement('span');
    lineNode.className = 'line';
    const wordsNode = document.createElement('span');
    wordsNode.className = 'words';
    tokensInLine.forEach((token) => wordsNode.append(token));
    lineNode.append(wordsNode);
    wrapped.append(lineNode);
  });
  element.replaceChildren(wrapped);

  return Array.from(element.querySelectorAll<HTMLSpanElement>(':scope > .line > .words'));
}

function showWithoutMotion(scope: HTMLElement, entries: HTMLElement[]): void {
  entries.forEach((element) => {
    element.dataset.aboutRevealed = 'true';
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    element.style.transform = 'none';
    element.querySelectorAll<HTMLElement>('.line > .words').forEach((line) => {
      line.style.transform = 'none';
      line.style.transition = 'none';
      line.style.willChange = 'auto';
    });
  });
  scope.querySelectorAll<HTMLElement>('.worded, .worded .letter').forEach((element) => {
    element.style.opacity = '1';
    element.style.transform = 'none';
    element.style.transition = 'none';
  });
}

function initialiseRotatingWords(scope: HTMLElement): () => void {
  const words = Array.from(scope.querySelectorAll<HTMLElement>('.worded'));
  if (words.length === 0) return () => undefined;

  const wordLetters = words.map((word) => {
    if (word.dataset.aboutRotatingText === undefined) {
      word.dataset.aboutRotatingText = word.textContent ?? '';
      const letters = document.createDocumentFragment();
      Array.from(word.dataset.aboutRotatingText).forEach((character) => {
        const letter = document.createElement('span');
        letter.className = 'letter';
        letter.textContent = character;
        letters.append(letter);
      });
      word.replaceChildren(letters);
    }
    return Array.from(word.querySelectorAll<HTMLElement>(':scope > .letter'));
  });

  let currentWord = 0;
  let interval: number | null = null;
  const timeouts = new Set<number>();
  const schedule = (callback: () => void, delay: number): void => {
    const timer = window.setTimeout(() => {
      timeouts.delete(timer);
      callback();
    }, delay);
    timeouts.add(timer);
  };
  const changeWord = (): void => {
    const current = wordLetters[currentWord];
    const nextIndex = currentWord === wordLetters.length - 1 ? 0 : currentWord + 1;
    const next = wordLetters[nextIndex];
    current.forEach((letter, index) => schedule(() => { letter.className = 'letter out'; }, index * 80));
    next.forEach((letter, index) => {
      letter.className = 'letter behind';
      if (next[0]?.parentElement instanceof HTMLElement) next[0].parentElement.style.opacity = '1';
      schedule(() => { letter.className = 'letter in'; }, 340 + (index * 80));
    });
    currentWord = nextIndex;
  };
  const start = (): void => {
    if (interval !== null || document.hidden) return;
    changeWord();
    interval = window.setInterval(changeWord, 4000);
  };
  const stop = (): void => {
    if (interval !== null) window.clearInterval(interval);
    interval = null;
    timeouts.forEach((timer) => window.clearTimeout(timer));
    timeouts.clear();
  };

  words.forEach((word) => { word.style.opacity = '0'; });
  if (words[0]) words[0].style.opacity = '1';
  start();
  const onVisibilityChange = (): void => {
    if (document.hidden) stop();
    else start();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    stop();
  };
}

export function AboutReveal(): null {
  useEffect(() => {
    const scope = document.querySelector<HTMLElement>('[data-about-page-reveal]');
    if (!scope) return undefined;

    const entries = Array.from(scope.querySelectorAll<HTMLElement>('.reveal-text'));
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timers = new Set<number>();
    const animationFrames = new Map<HTMLElement, number>();
    let observer: IntersectionObserver | null = null;
    let stopRotatingWords = (): void => undefined;

    const schedule = (callback: () => void, delay: number): void => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
    };

    const reveal = (element: HTMLElement): void => {
      if (element.dataset.aboutRevealed === 'true') return;
      element.dataset.aboutRevealed = 'true';
      element.style.opacity = '1';
      element.style.visibility = 'visible';
      const lines = Array.from(element.querySelectorAll<HTMLElement>(':scope > .line > .words'));
      lines.forEach((line) => {
        line.style.transform = 'translate3d(0, 100%, 0)';
        line.style.transition = 'transform 900ms cubic-bezier(0.215, 0.61, 0.355, 1)';
        line.style.willChange = 'transform';
      });
      lines.forEach((line, index) => {
        schedule(() => {
          const frame = window.requestAnimationFrame(() => {
            line.style.transform = 'translate3d(0, 0, 0)';
            line.style.willChange = '';
          });
          animationFrames.set(element, frame);
        }, 180 + (index * 120));
      });
    };

    const enableReducedMotion = (): void => {
      observer?.disconnect();
      observer = null;
      stopRotatingWords();
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
      showWithoutMotion(scope, entries);
    };

    const enableMotion = (): void => {
      // A live preference change must never pull already-readable text back below its clipping
      // line. Only entries that have not been revealed join the source-style choreography.
      const pendingEntries = entries.filter((element) => element.dataset.aboutRevealed !== 'true');
      entries.filter((element) => element.dataset.aboutRevealed === 'true').forEach((element) => {
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.querySelectorAll<HTMLElement>('.line > .words').forEach((line) => {
          line.style.transform = 'none';
          line.style.transition = '';
          line.style.willChange = 'auto';
        });
      });
      // `showWithoutMotion` uses inline overrides so content can never be hidden. Clear only
      // the rotating-word overrides when motion returns; revealed copy deliberately stays put.
      scope.querySelectorAll<HTMLElement>('.worded, .worded .letter').forEach((element) => {
        element.style.transform = '';
        element.style.transition = '';
      });
      pendingEntries.forEach((element) => {
        splitLines(element).forEach((line) => {
          line.style.transform = 'translate3d(0, 100%, 0)';
        });
      });
      stopRotatingWords = initialiseRotatingWords(scope);
      if (!('IntersectionObserver' in window)) {
        pendingEntries.forEach(reveal);
        return;
      }
      observer = new IntersectionObserver((observations) => {
        observations.forEach((observation) => {
          if (observation.isIntersecting) {
            reveal(observation.target as HTMLElement);
            observer?.unobserve(observation.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      pendingEntries.forEach((element) => observer?.observe(element));
    };

    const onMotionChange = (): void => {
      if (motionQuery.matches) enableReducedMotion();
      else enableMotion();
    };
    onMotionChange();
    motionQuery.addEventListener('change', onMotionChange);

    return () => {
      motionQuery.removeEventListener('change', onMotionChange);
      observer?.disconnect();
      stopRotatingWords();
      timers.forEach((timer) => window.clearTimeout(timer));
      animationFrames.forEach((frame) => window.cancelAnimationFrame(frame));
    };
  }, []);

  return null;
}
