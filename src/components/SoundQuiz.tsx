"use client";

import { Sparkles, Volume2 } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

type AnimalQuiz = {
  name: string;
  soundFile: string;
};

const ANIMALS: AnimalQuiz[] = [
  { name: "いぬ", soundFile: "dog.mp3" },
  { name: "ねこ", soundFile: "cat.mp3" },
  { name: "ぞう", soundFile: "elephant.mp3" },
  { name: "らいおん", soundFile: "lion.mp3" },
  { name: "ひつじ", soundFile: "sheep.mp3" },
  { name: "にわとり", soundFile: "chicken.mp3" },
  { name: "かえる", soundFile: "frog.mp3" },
  { name: "うま", soundFile: "horse.mp3" },
  { name: "うぐいす", soundFile: "uguisu.mp3" },
  { name: "すずむし", soundFile: "suzumushi.mp3" },
  { name: "ふくろう", soundFile: "owl.mp3" },
  { name: "さる", soundFile: "monkey.mp3" },
];

const getShuffled = <T,>(items: T[]) => {
  return [...items].sort(() => Math.random() - 0.5);
};

const buildChoices = (answer: AnimalQuiz) => {
  const distractors = getShuffled(
    ANIMALS.filter((animal) => animal.name !== answer.name),
  ).slice(0, 3);
  const choices = getShuffled([answer, ...distractors]);

  // Safety guard: always keep a valid 4-choice quiz.
  if (choices.length !== 4 || !choices.some((animal) => animal.name === answer.name)) {
    return [answer, ...ANIMALS.filter((animal) => animal.name !== answer.name).slice(0, 3)];
  }

  return choices;
};

type ResultState = "idle" | "correct" | "wrong";
type GameState = "playing" | "cleared" | "failed";

export default function SoundQuiz() {
  const [answerOrder, setAnswerOrder] = useState(() => getShuffled(ANIMALS));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState<ResultState>("idle");
  const [gameState, setGameState] = useState<GameState>("playing");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioMessage, setAudioMessage] = useState("");
  const [correctMessage, setCorrectMessage] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalQuestions = answerOrder.length;
  const currentAnswer = answerOrder[questionIndex];
  const choices = useMemo(() => buildChoices(currentAnswer), [currentAnswer]);

  const resultText = useMemo(() => {
    if (gameState === "cleared") return "ぜんもん せいかい！ クリア！";
    if (gameState === "failed") return "こんかいは クリア ならず";
    if (result === "correct") return "せいかい！";
    if (result === "wrong") return "ざんねん！";
    return "どの どうぶつの こえ かな？";
  }, [gameState, result]);

  const stopSound = useCallback(() => {
    const currentAudio = audioRef.current;
    if (!currentAudio) return;

    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.onended = null;
    currentAudio.onerror = null;
    audioRef.current = null;
    setIsPlaying(false);
  }, []);

  const resetGame = useCallback(() => {
    stopSound();
    setAnswerOrder(getShuffled(ANIMALS));
    setQuestionIndex(0);
    setCorrectCount(0);
    setResult("idle");
    setGameState("playing");
    setAudioMessage("");
    setCorrectMessage("");
    setIsPlaying(false);
  }, [stopSound]);

  const playSound = useCallback(async () => {
    if (isPlaying) return;

    const soundPath = `/sounds/${currentAnswer.soundFile}`;
    setAudioMessage("");
    setIsPlaying(true);

    try {
      const response = await fetch(soundPath, { method: "HEAD" });
      if (!response.ok) {
        setAudioMessage("おとふぁいるが まだ ないよ");
        setIsPlaying(false);
        return;
      }

      const audio = new Audio(soundPath);
      audioRef.current = audio;
      audio.onended = () => {
        audioRef.current = null;
        setIsPlaying(false);
      };
      audio.onerror = () => {
        setAudioMessage("おとが さいせい できないよ");
        audioRef.current = null;
        setIsPlaying(false);
      };

      await audio.play();
    } catch {
      setAudioMessage("おとが さいせい できないよ");
      setIsPlaying(false);
    }
  }, [currentAnswer.soundFile, isPlaying]);

  const handleSelect = useCallback(
    (name: string) => {
      if (result !== "idle" || gameState !== "playing") return;
      stopSound();

      const isCorrect = name === currentAnswer.name;
      setResult(isCorrect ? "correct" : "wrong");
      setCorrectMessage(isCorrect ? "" : `せいかいは「${currentAnswer.name}」だよ`);

      window.setTimeout(() => {
        const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
        const isLastQuestion = questionIndex + 1 >= totalQuestions;

        if (isLastQuestion) {
          setCorrectCount(nextCorrectCount);
          setGameState(nextCorrectCount === totalQuestions ? "cleared" : "failed");
          setResult("idle");
          setCorrectMessage("");
          return;
        }

        setQuestionIndex((prev) => prev + 1);
        setCorrectCount(nextCorrectCount);
        setResult("idle");
        setCorrectMessage("");
      }, 1200);
    },
    [correctCount, currentAnswer.name, gameState, questionIndex, result, stopSound, totalQuestions],
  );

  return (
    <div className="flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-sky-100 via-emerald-100 to-yellow-100 p-1 md:p-4">
      <main className="grid h-[calc(100dvh-0.5rem)] w-full max-w-4xl grid-rows-[auto_1fr_auto] items-center gap-1 overflow-hidden rounded-3xl bg-white/80 p-2 shadow-xl backdrop-blur-sm md:h-[calc(100dvh-2rem)] md:gap-3 md:p-6">
        <h1 className="text-center text-[clamp(1.35rem,3.8dvh,2.4rem)] font-black tracking-wide text-fuchsia-600">
          おとあそび
        </h1>

        <div className="flex flex-col items-center justify-center gap-1 md:gap-3">
          <button
            type="button"
            onClick={playSound}
            disabled={isPlaying}
            className={`flex h-[min(20dvh,11rem)] w-[min(20dvh,11rem)] items-center justify-center rounded-3xl border-4 border-white bg-orange-400 text-white shadow-lg transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 md:h-[min(24dvh,13rem)] md:w-[min(24dvh,13rem)] ${
              isPlaying ? "animate-pulse" : "hover:bg-orange-500"
            }`}
          >
            <span className="flex flex-col items-center gap-1 text-[clamp(0.9rem,2.4dvh,1.4rem)] font-bold">
              <Volume2 className="h-[min(6.5dvh,3rem)] w-[min(6.5dvh,3rem)] md:h-[min(8dvh,3.5rem)] md:w-[min(8dvh,3.5rem)]" />
              おとをきく
            </span>
          </button>
          <p className="min-h-5 text-center text-[clamp(0.8rem,1.9dvh,1.2rem)] font-bold text-amber-600">
            {audioMessage}
          </p>

          <div
            className={`min-h-9 text-center text-[clamp(1.1rem,3.2dvh,2.1rem)] font-extrabold ${
              gameState === "cleared" || result === "correct"
                ? "animate-bounce text-emerald-500"
                : gameState === "failed" || result === "wrong"
                  ? "text-rose-500"
                  : "text-sky-700"
            }`}
          >
            {(gameState === "cleared" || result === "correct") && (
              <span className="mr-2 inline-flex items-center">
                <Sparkles className="h-8 w-8" />
              </span>
            )}
            {resultText}
            {(gameState === "cleared" || result === "correct") && (
              <span className="ml-2 inline-flex items-center">
                <Sparkles className="h-6 w-6 md:h-8 md:w-8" />
              </span>
            )}
          </div>
          <p className="min-h-5 text-center text-[clamp(0.8rem,1.9dvh,1.2rem)] font-bold text-rose-600">
            {correctMessage}
          </p>
        </div>

        <div className="w-full">
          <p className="mb-1 text-center text-[clamp(0.85rem,2.1dvh,1.2rem)] font-bold text-slate-700 md:mb-3">
            {Math.min(questionIndex + 1, totalQuestions)} / {totalQuestions}
          </p>

          {gameState === "playing" ? (
            <div className="grid w-full grid-cols-2 gap-1.5 md:gap-4">
              {choices.map((animal) => (
                <button
                  key={animal.name}
                  type="button"
                  onClick={() => handleSelect(animal.name)}
                  disabled={result !== "idle"}
                  className={`rounded-3xl border-2 border-white px-2 py-[clamp(0.35rem,1.2dvh,0.8rem)] text-[clamp(1rem,2.8dvh,1.8rem)] font-black text-slate-800 shadow-md transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-90 md:px-3 md:py-[clamp(0.6rem,1.5dvh,1rem)] ${
                    result === "wrong" && animal.name !== currentAnswer.name
                      ? "animate-shake bg-rose-200"
                      : "bg-violet-100 hover:bg-violet-200"
                  }`}
                >
                  {animal.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={resetGame}
                className="rounded-2xl bg-emerald-500 px-6 py-3 text-[clamp(1.1rem,2.8dvh,1.8rem)] font-black text-white shadow-md transition hover:bg-emerald-600 active:scale-95"
              >
                もういちど あそぶ
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
