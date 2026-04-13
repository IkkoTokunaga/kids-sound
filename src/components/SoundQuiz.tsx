"use client";

import { Sparkles, Volume2 } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

import { QUESTIONS, type Question } from "@/data/questions";

type ResultState = "idle" | "correct" | "wrong";
type GameState = "playing" | "cleared" | "failed";
const QUESTIONS_PER_ROUND = 10;

const getShuffled = <T,>(items: T[]) => {
  return [...items].sort(() => Math.random() - 0.5);
};

const buildRoundQuestions = () => {
  return getShuffled(QUESTIONS).slice(0, Math.min(QUESTIONS_PER_ROUND, QUESTIONS.length));
};

const buildChoices = (answer: Question, pool: Question[]) => {
  const distractors = getShuffled(pool.filter((question) => question.id !== answer.id)).slice(0, 3);
  const choices = getShuffled([answer, ...distractors]);

  if (choices.length !== 4 || !choices.some((question) => question.id === answer.id)) {
    return [answer, ...pool.filter((question) => question.id !== answer.id).slice(0, 3)];
  }

  return choices;
};

export default function SoundQuiz() {
  const [answerOrder, setAnswerOrder] = useState<Question[]>(() => buildRoundQuestions());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState<ResultState>("idle");
  const [gameState, setGameState] = useState<GameState>("playing");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioMessage, setAudioMessage] = useState("");
  const [correctMessage, setCorrectMessage] = useState("");
  const [canSkipMissingAudio, setCanSkipMissingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalQuestions = answerOrder.length;
  const currentAnswer = answerOrder[questionIndex] ?? null;
  const choices = useMemo(() => {
    if (!currentAnswer) return [];
    const sameCategoryQuestions = QUESTIONS.filter(
      (question) => question.category === currentAnswer.category,
    );
    if (sameCategoryQuestions.length < 4) return [];
    return buildChoices(currentAnswer, sameCategoryQuestions);
  }, [currentAnswer]);

  const resultText = useMemo(() => {
    if (gameState === "cleared") return "ぜんもん せいかい！ クリア！";
    if (gameState === "failed") return "こんかいは クリア ならず";
    if (result === "correct") return "せいかい！";
    if (result === "wrong") return "ざんねん！";
    return "どの おと かな？";
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
    setAnswerOrder(buildRoundQuestions());
    setQuestionIndex(0);
    setCorrectCount(0);
    setResult("idle");
    setGameState("playing");
    setAudioMessage("");
    setCorrectMessage("");
    setCanSkipMissingAudio(false);
    setIsPlaying(false);
  }, [stopSound]);

  const moveToNextQuestion = useCallback(
    (isCorrect: boolean) => {
      const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
      const isLastQuestion = questionIndex + 1 >= totalQuestions;

      if (isLastQuestion) {
        setCorrectCount(nextCorrectCount);
        setGameState(nextCorrectCount === totalQuestions ? "cleared" : "failed");
        setResult("idle");
        setCorrectMessage("");
        setAudioMessage("");
        setCanSkipMissingAudio(false);
        return;
      }

      setQuestionIndex((prev) => prev + 1);
      setCorrectCount(nextCorrectCount);
      setResult("idle");
      setCorrectMessage("");
      setAudioMessage("");
      setCanSkipMissingAudio(false);
    },
    [correctCount, questionIndex, totalQuestions],
  );

  const playSound = useCallback(async () => {
    if (isPlaying || !currentAnswer) return;

    const soundPath = `/sounds/${currentAnswer.fileName}`;
    setAudioMessage("");
    setCanSkipMissingAudio(false);
    setIsPlaying(true);

    try {
      const response = await fetch(soundPath, { method: "HEAD" });
      if (!response.ok) {
        setAudioMessage("ふぁいるが みつかりません");
        setCanSkipMissingAudio(true);
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
        setCanSkipMissingAudio(true);
        audioRef.current = null;
        setIsPlaying(false);
      };

      await audio.play();
    } catch {
      setAudioMessage("おとが さいせい できないよ");
      setCanSkipMissingAudio(true);
      setIsPlaying(false);
    }
  }, [currentAnswer, isPlaying]);

  const handleSelect = useCallback(
    (name: string) => {
      if (result !== "idle" || gameState !== "playing" || !currentAnswer) return;
      stopSound();

      const isCorrect = name === currentAnswer.name;
      setResult(isCorrect ? "correct" : "wrong");
      setCorrectMessage(isCorrect ? "" : `せいかいは「${currentAnswer.name}」だよ`);
      setCanSkipMissingAudio(false);

      window.setTimeout(() => {
        moveToNextQuestion(isCorrect);
      }, 1200);
    },
    [currentAnswer, gameState, moveToNextQuestion, result, stopSound],
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
            disabled={isPlaying || gameState !== "playing"}
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
          {canSkipMissingAudio && gameState === "playing" && (
            <button
              type="button"
              onClick={() => moveToNextQuestion(false)}
              className="rounded-2xl bg-amber-400 px-4 py-2 text-[clamp(0.95rem,2.2dvh,1.3rem)] font-black text-white shadow-md transition hover:bg-amber-500 active:scale-95"
            >
              つぎの もんだいへ
            </button>
          )}

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
              {choices.map((question) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => handleSelect(question.name)}
                  disabled={result !== "idle"}
                  className={`rounded-3xl border-2 border-white px-2 py-[clamp(0.35rem,1.2dvh,0.8rem)] text-[clamp(1rem,2.8dvh,1.8rem)] font-black text-slate-800 shadow-md transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-90 md:px-3 md:py-[clamp(0.6rem,1.5dvh,1rem)] ${
                    result === "wrong" && question.name !== currentAnswer?.name
                      ? "animate-shake bg-rose-200"
                      : "bg-violet-100 hover:bg-violet-200"
                  }`}
                >
                  {question.name}
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
