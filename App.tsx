import { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  RotateCcw,
  Languages,
  ArrowRight,
  Trophy,
  MessageSquare,
  Lock,
  Sparkles,
} from 'lucide-react';
import { GAME_ROUNDS, SPANISH_ALPHABET } from './quizData';
import {
  playCorrectAnswerSound,
  playWrongAnswerSound,
  playLetterHitSound,
  playLetterMissSound,
  playWordSolvedSound,
} from './sound';

type TurnPhase = 'ANSWERING' | 'PICK_LETTER' | 'READY_NEXT' | 'ROUND_COMPLETE';

export default function App() {
  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [phase, setPhase] = useState<TurnPhase>('ANSWERING');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [lastPickedLetter, setLastPickedLetter] = useState<{
    letter: string;
    inWord: boolean;
  } | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [answeredCount, setAnsweredCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Tracks which Spanish items have their Armenian translation opened by clicking
  const [openQuestionTranslation, setOpenQuestionTranslation] = useState<boolean>(false);
  const [openOptionTranslations, setOpenOptionTranslations] = useState<Record<number, boolean>>({});

  const currentRound = GAME_ROUNDS[roundIndex];
  const currentQuestion = currentRound.questions[questionIndex];
  const secretChars = useMemo(
    () => currentRound.secretWord.split(''),
    [currentRound.secretWord]
  );

  const uniqueSecretLetters = useMemo(
    () => Array.from(new Set(secretChars)),
    [secretChars]
  );

  const isWordSolved = useMemo(
    () => uniqueSecretLetters.every((ch) => guessedLetters.includes(ch)),
    [uniqueSecretLetters, guessedLetters]
  );

  const remainingUniqueLetters = useMemo(
    () => uniqueSecretLetters.filter((ch) => !guessedLetters.includes(ch)).length,
    [uniqueSecretLetters, guessedLetters]
  );

  function resetRoundState(targetRoundIndex: number) {
    setRoundIndex(targetRoundIndex);
    setQuestionIndex(0);
    setPhase('ANSWERING');
    setSelectedOption(null);
    setGuessedLetters([]);
    setLastPickedLetter(null);
    setCorrectCount(0);
    setAnsweredCount(0);
    setOpenQuestionTranslation(false);
    setOpenOptionTranslations({});
  }

  function handleSelectAnswer(optionIdx: number) {
    if (phase !== 'ANSWERING') return;

    setSelectedOption(optionIdx);
    setAnsweredCount((c) => c + 1);

    const isCorrect = optionIdx === currentQuestion.correctIndex;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      playCorrectAnswerSound(soundEnabled);
      if (isWordSolved) {
        setPhase('READY_NEXT');
      } else {
        setPhase('PICK_LETTER');
      }
    } else {
      playWrongAnswerSound(soundEnabled);
      setPhase('READY_NEXT');
    }
  }

  function handlePickLetter(letter: string) {
    if (phase !== 'PICK_LETTER') return;
    if (guessedLetters.includes(letter)) return;

    const nextGuessed = [...guessedLetters, letter];
    setGuessedLetters(nextGuessed);

    const inWord = secretChars.includes(letter);
    setLastPickedLetter({ letter, inWord });

    const solvedNow = uniqueSecretLetters.every((ch) => nextGuessed.includes(ch));
    if (solvedNow) {
      playWordSolvedSound(soundEnabled);
    } else if (inWord) {
      playLetterHitSound(soundEnabled);
    } else {
      playLetterMissSound(soundEnabled);
    }

    setPhase('READY_NEXT');
  }

  function handleNextQuestion() {
    if (questionIndex + 1 < currentRound.questions.length) {
      setQuestionIndex((idx) => idx + 1);
      setPhase('ANSWERING');
      setSelectedOption(null);
      setLastPickedLetter(null);
      setOpenQuestionTranslation(false);
      setOpenOptionTranslations({});
    } else {
      setPhase('ROUND_COMPLETE');
    }
  }

  function toggleQuestionTranslation() {
    setOpenQuestionTranslation((prev) => !prev);
  }

  function toggleOptionTranslation(idx: number) {
    setOpenOptionTranslations((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  }

  const isAnswerCorrect =
    selectedOption !== null && selectedOption === currentQuestion.correctIndex;

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      {/* Top Bar: 3-zone contract */}
      <header className="bg-[#0b1326]/90 backdrop-blur-md border-b border-indigo-400/20 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent whitespace-nowrap shrink-0">
            Palabra de Oro
          </span>

          {/* Zone 2: Round links */}
          <nav className="flex items-center gap-4 sm:gap-7 overflow-x-auto">
            {GAME_ROUNDS.map((r, idx) => {
              const active = idx === roundIndex;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => resetRoundState(idx)}
                  className={`py-1.5 text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    active
                      ? 'border-amber-400 text-amber-300'
                      : 'border-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  Փուլ {r.roundNumber} · Ronda {r.roundNumber}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => resetRoundState(roundIndex)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1326]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Նորից / Reiniciar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Field of Wonders Secret Word Board (NO HINTS) */}
        <section
          aria-label="Табло Поле Чудес"
          className="bg-gradient-to-br from-[#064e3b] via-[#046c4e] to-[#0f766e] text-white rounded-2xl p-5 sm:p-8 shadow-xl border border-emerald-400/35"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-emerald-100 font-medium tracking-[0.01em]">
                <span>Փուլ {currentRound.roundNumber} / {GAME_ROUNDS.length}</span>
                <span aria-hidden="true">·</span>
                <span>Հարց {questionIndex + 1} / {currentRound.questions.length}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums text-amber-200 font-semibold">
                  Ճիշտ պատասխաններ՝ {correctCount}
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight mt-1.5 text-white">
                {currentRound.titleEs}
              </h1>
              <p className="text-sm text-emerald-50/90 mt-0.5 tracking-[0.01em]">
                {currentRound.titleHy}
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center">
              <button
                type="button"
                onClick={() => setSoundEnabled((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#033629]/80 hover:bg-[#022c22] text-emerald-50 border border-emerald-300/30 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4 text-amber-300" />
                    <span>Ձայնը միացված է</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-emerald-200" />
                    <span>Անջատված է</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Letter Tiles — strictly NO hints */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 py-3">
            {secretChars.map((ch, idx) => {
              const revealed = guessedLetters.includes(ch);
              const justRevealed =
                revealed && lastPickedLetter?.letter === ch && lastPickedLetter.inWord;

              return (
                <div
                  key={`${currentRound.id}-tile-${idx}`}
                  className={`w-12 h-14 sm:w-16 sm:h-20 rounded-xl flex items-center justify-center font-display text-2xl sm:text-4xl font-extrabold tracking-wide select-none transition-transform duration-200 ${
                    revealed
                      ? justRevealed
                        ? 'animate-tile-reveal bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 shadow-lg border-2 border-amber-100'
                        : 'animate-tile-reveal bg-white text-slate-950 shadow-md border-2 border-emerald-200'
                      : 'bg-[#03261d]/90 text-emerald-300/20 border-2 border-emerald-300/40 shadow-inner'
                  }`}
                >
                  {revealed ? ch : ''}
                </div>
              );
            })}
          </div>

          {/* Board status line */}
          <div className="mt-4 text-center">
            {isWordSolved ? (
              <div className="inline-flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base font-bold text-amber-300">
                <Trophy className="w-5 h-5 shrink-0" />
                <span>
                  Հիանալի է, Ռազմի՛կ։ Գլխավոր բառը բացված է՝ {currentRound.secretWord} · ¡Palabra descubierta!
                </span>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-emerald-50/90 tracking-[0.01em]">
                Մնաց բացելու {remainingUniqueLetters} տառ · Պատասխանիր հարցին ճիշտ և ինքդ ընտրիր տառ այբուբենից
              </p>
            )}
          </div>
        </section>

        {/* Active Gameplay or Round Complete */}
        {phase === 'ROUND_COMPLETE' ? (
          <section className="bg-[#0f1c36] rounded-2xl border border-indigo-400/30 shadow-xl p-6 sm:p-10 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center mx-auto mb-5 shadow-md">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Փուլ {currentRound.roundNumber} ավարտված է · ¡Ronda completada!
            </h2>
            <p className="text-slate-300 mt-3 text-base">
              Ճիշտ պատասխաններ՝{' '}
              <strong className="text-emerald-400 tabular-nums">
                {correctCount} / {currentRound.questions.length}
              </strong>
            </p>
            <p className="text-slate-300 mt-1.5 text-base">
              Գլխավոր բառը՝{' '}
              <strong className="font-display text-amber-300 tracking-wider">
                {currentRound.secretWord}
              </strong>{' '}
              {isWordSolved ? '(բացված է խաղի ընթացքում)' : '(մնաց չբացված տառեր)'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <button
                type="button"
                onClick={() => resetRoundState(roundIndex)}
                className="px-5 py-2.5 rounded-xl border border-indigo-400/40 text-slate-100 font-semibold text-sm hover:bg-indigo-950/80 transition-colors cursor-pointer"
              >
                Կրկնել այս փուլը · Repetir ronda
              </button>

              {roundIndex + 1 < GAME_ROUNDS.length && (
                <button
                  type="button"
                  onClick={() => resetRoundState(roundIndex + 1)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm hover:from-emerald-400 hover:to-teal-400 transition-colors cursor-pointer shadow-md"
                >
                  <span>
                    Անցնել Փուլ {roundIndex + 2} ({GAME_ROUNDS[roundIndex + 1].secretWord})
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Question & Answer Options */}
            <section className="lg:col-span-7 bg-[#0f1c36] rounded-2xl border border-indigo-400/25 shadow-xl p-5 sm:p-7 space-y-6">
              {/* Unboxed Metadata Line */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-indigo-400/15">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-cyan-300 tracking-[0.01em]">
                  <span>{currentQuestion.sectionEs}</span>
                  <span aria-hidden="true" className="text-indigo-400">·</span>
                  <span className="text-slate-300">{currentQuestion.sectionHy}</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-amber-300 tabular-nums">
                  {questionIndex + 1} / {currentRound.questions.length}
                </span>
              </div>

              {/* Clickable Spanish Question -> reveals Armenian translation */}
              <div>
                <button
                  type="button"
                  onClick={toggleQuestionTranslation}
                  className="w-full text-left group rounded-xl p-3.5 -m-1.5 hover:bg-[#162749] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg sm:text-xl font-bold text-white leading-snug tracking-[0.01em]">
                      {currentQuestion.questionEs}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 shrink-0 mt-1">
                      <Languages className="w-4 h-4" />
                      <span>{openQuestionTranslation ? 'Թաքցնել' : 'Հայերեն'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 group-hover:text-cyan-200 transition-colors">
                    Սեղմիր իսպաներեն հարցի վրա՝ հայերեն թարգմանությունը տեսնելու համար · Clic para traducción
                  </p>
                </button>

                {openQuestionTranslation && (
                  <div className="mt-3 px-4 py-3 rounded-xl bg-indigo-950/90 border border-indigo-400/35 text-sm sm:text-base text-indigo-100 leading-relaxed tracking-[0.01em]">
                    {currentQuestion.questionHy}
                  </div>
                )}
              </div>

              {/* 4 Answer Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectOption = idx === currentQuestion.correctIndex;
                  const hasAnswered = phase !== 'ANSWERING';
                  const isTranslationOpen = Boolean(openOptionTranslations[idx]);

                  let cardStyle =
                    'border-indigo-400/25 bg-[#152444] hover:border-cyan-400/60 hover:bg-[#1a2d54]';
                  if (hasAnswered) {
                    if (isCorrectOption) {
                      cardStyle = 'border-emerald-400 bg-emerald-950/80';
                    } else if (isSelected && !isCorrectOption) {
                      cardStyle = 'border-rose-400 bg-rose-950/80';
                    } else {
                      cardStyle = 'border-indigo-400/15 bg-[#111d36] opacity-70';
                    }
                  }

                  return (
                    <div
                      key={opt.letter}
                      className={`rounded-xl border transition-colors p-3.5 sm:p-4 ${cardStyle}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Click Spanish text to toggle Armenian translation */}
                        <button
                          type="button"
                          onClick={() => toggleOptionTranslation(idx)}
                          className="flex-1 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${
                                hasAnswered && isCorrectOption
                                  ? 'bg-emerald-500 text-slate-950'
                                  : hasAnswered && isSelected && !isCorrectOption
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-indigo-600 text-white'
                              }`}
                            >
                              {opt.letter}
                            </span>
                            <div>
                              <span className="text-sm sm:text-base font-medium text-white group-hover:text-cyan-200 transition-colors tracking-[0.01em]">
                                {opt.es}
                              </span>
                              <span className="block text-[11px] text-slate-400 mt-0.5 group-hover:text-cyan-300 transition-colors">
                                {isTranslationOpen
                                  ? 'Թաքցնել թարգմանությունը · Ocultar'
                                  : 'Սեղմիր՝ հայերեն թարգմանության համար · Ver en armenio'}
                              </span>
                            </div>
                          </div>
                        </button>

                        {/* Explicit Answer Selection Button */}
                        <div className="shrink-0">
                          {phase === 'ANSWERING' ? (
                            <button
                              type="button"
                              onClick={() => handleSelectAnswer(idx)}
                              className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-colors whitespace-nowrap cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                            >
                              Ընտրել
                            </button>
                          ) : isCorrectOption ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 py-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Ճիշտ է</span>
                            </span>
                          ) : isSelected ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-300 py-1.5">
                              <XCircle className="w-4 h-4" />
                              <span>Սխալ</span>
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {isTranslationOpen && (
                        <div className="mt-2.5 ml-10 px-3.5 py-2.5 rounded-lg bg-indigo-950/90 border border-indigo-400/30 text-sm text-indigo-100 tracking-[0.01em]">
                          {opt.hy}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Feedback & Next Question Bar */}
              {phase !== 'ANSWERING' && (
                <div className="pt-4 border-t border-indigo-400/15 space-y-4">
                  {isAnswerCorrect ? (
                    <div className="rounded-xl bg-emerald-950/90 border border-emerald-400/50 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm sm:text-base">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>
                          {phase === 'PICK_LETTER'
                            ? 'Ապրես։ Ճիշտ է։ Հիմա աջ կողմից ընտրիր մեկ տառ այբուբենից։'
                            : 'Ապրես։ Ճիշտ պատասխան է։'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-xs sm:text-sm text-emerald-100 pt-1">
                        <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-amber-300" />
                        <span>
                          <strong className="text-amber-300">Խոսքի վարժություն՝</strong>{' '}
                          {currentRound.speakingPromptEs} — {currentRound.speakingPromptHy}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-rose-950/90 border border-rose-400/50 p-4">
                      <div className="flex items-center gap-2 text-rose-200 font-semibold text-sm sm:text-base">
                        <XCircle className="w-5 h-5 shrink-0 text-rose-400" />
                        <span>
                          Սխալ պատասխան, բայց շարունակում ենք խաղը։ Ճիշտ տարբերակն է՝{' '}
                          <strong className="text-white">
                            {currentQuestion.options[currentQuestion.correctIndex].letter}
                          </strong>
                          ։
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      disabled={phase === 'PICK_LETTER'}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
                        phase === 'PICK_LETTER'
                          ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 shadow-md cursor-pointer'
                      }`}
                    >
                      <span>
                        {questionIndex + 1 < currentRound.questions.length
                          ? 'Հաջորդ հարցը · Siguiente'
                          : 'Ավարտել փուլը · Ver resumen'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Right Column: Spanish Alphabet Keyboard */}
            <aside className="lg:col-span-5 bg-[#0f1c36] rounded-2xl border border-indigo-400/25 shadow-xl p-5 sm:p-6 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">
                    Իսպանական այբուբեն · Alfabeto
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                    {phase === 'PICK_LETTER'
                      ? 'Ընտրիր մեկ տառ գլխավոր բառը բացելու համար'
                      : 'Տառ ընտրելու համար նախ պատասխանիր հարցին ճիշտ'}
                  </p>
                </div>

                {phase === 'PICK_LETTER' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 shrink-0">
                    <Sparkles className="w-4 h-4" />
                    <span>Բաց է</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Սպասում</span>
                  </span>
                )}
              </div>

              {/* Alphabet Grid */}
              <div
                className={`grid grid-cols-6 sm:grid-cols-7 gap-2 p-3 rounded-xl border transition-colors ${
                  phase === 'PICK_LETTER'
                    ? 'bg-amber-500/15 border-amber-400/70'
                    : 'bg-[#091224] border-indigo-400/20'
                }`}
              >
                {SPANISH_ALPHABET.map((letter) => {
                  const alreadyTried = guessedLetters.includes(letter);
                  const isHit = alreadyTried && secretChars.includes(letter);
                  const isMiss = alreadyTried && !secretChars.includes(letter);
                  const canClick = phase === 'PICK_LETTER' && !alreadyTried;

                  let btnClass =
                    'bg-[#132140] border-indigo-400/20 text-slate-500 cursor-not-allowed';

                  if (isHit) {
                    btnClass =
                      'bg-emerald-500 border-emerald-300 text-slate-950 font-extrabold shadow-sm cursor-default';
                  } else if (isMiss) {
                    btnClass =
                      'bg-slate-800/70 border-slate-700 text-slate-500 line-through cursor-default';
                  } else if (canClick) {
                    btnClass =
                      'bg-indigo-600 border-indigo-400 text-white hover:bg-amber-400 hover:text-slate-950 hover:border-amber-200 shadow-sm cursor-pointer';
                  }

                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={!canClick}
                      onClick={() => handlePickLetter(letter)}
                      className={`h-11 min-w-[40px] rounded-lg border font-display text-base font-bold transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${btnClass}`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>

              {/* Letter Pick Feedback */}
              {lastPickedLetter && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-medium border ${
                    lastPickedLetter.inWord
                      ? 'bg-emerald-950/90 border-emerald-400/50 text-emerald-200'
                      : 'bg-slate-900/90 border-slate-700 text-slate-300'
                  }`}
                >
                  {lastPickedLetter.inWord ? (
                    <span>
                      Հրաշալի է։ «{lastPickedLetter.letter}» տառը կա գլխավոր բառի մեջ · ¡La letra{' '}
                      {lastPickedLetter.letter} está!
                    </span>
                  ) : (
                    <span>
                      «{lastPickedLetter.letter}» տառը չկա բառի մեջ · La letra{' '}
                      {lastPickedLetter.letter} no está en la palabra.
                    </span>
                  )}
                </div>
              )}

              {/* Compact Progress Breakdown */}
              <div className="pt-3 border-t border-indigo-400/15 space-y-2 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Պատասխանած հարցեր</span>
                  <span className="font-bold text-white tabular-nums">
                    {answeredCount} / {currentRound.questions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ճիշտ պատասխաններ</span>
                  <span className="font-bold text-emerald-400 tabular-nums">
                    {correctCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Փորձված տառեր</span>
                  <span className="font-semibold text-amber-300 tabular-nums">
                    {guessedLetters.length > 0 ? guessedLetters.join(', ') : '—'}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
