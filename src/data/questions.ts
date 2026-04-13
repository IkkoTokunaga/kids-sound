export type QuestionCategory = "どうぶつ" | "のりもの" | "せいかつ" | "がっき";

export type Question = {
  id: string;
  name: string;
  fileName: string;
  category: QuestionCategory;
};

export const QUESTIONS: Question[] = [
  { id: "animal-01", name: "いぬ", fileName: "dog.mp3", category: "どうぶつ" },
  { id: "animal-02", name: "ねこ", fileName: "cat.mp3", category: "どうぶつ" },
  { id: "animal-03", name: "らいおん", fileName: "lion.mp3", category: "どうぶつ" },
  { id: "animal-04", name: "ぞう", fileName: "elephant.mp3", category: "どうぶつ" },
  { id: "animal-05", name: "うし", fileName: "cow.mp3", category: "どうぶつ" },
  { id: "animal-06", name: "ひつじ", fileName: "sheep.mp3", category: "どうぶつ" },
  { id: "animal-07", name: "ぶた", fileName: "pig.mp3", category: "どうぶつ" },
  { id: "animal-08", name: "うま", fileName: "horse.mp3", category: "どうぶつ" },
  { id: "animal-09", name: "かえる", fileName: "frog.mp3", category: "どうぶつ" },
  { id: "animal-10", name: "にわとり", fileName: "chicken.mp3", category: "どうぶつ" },
  { id: "animal-11", name: "ふくろう", fileName: "owl.mp3", category: "どうぶつ" },
  { id: "animal-12", name: "さる", fileName: "monkey.mp3", category: "どうぶつ" },

  { id: "vehicle-01", name: "きゅうきゅうしゃ", fileName: "ambulance.mp3", category: "のりもの" },
  { id: "vehicle-02", name: "ぱとかー", fileName: "police-car.mp3", category: "のりもの" },
  { id: "vehicle-03", name: "しょうぼうしゃ", fileName: "fire-truck.mp3", category: "のりもの" },
  { id: "vehicle-04", name: "ひこうき", fileName: "airplane.mp3", category: "のりもの" },
  { id: "vehicle-05", name: "ふね", fileName: "ship.mp3", category: "のりもの" },
  { id: "vehicle-06", name: "でんしゃ", fileName: "train.mp3", category: "のりもの" },
  { id: "vehicle-07", name: "しんかんせん", fileName: "shinkansen.mp3", category: "のりもの" },
  { id: "vehicle-08", name: "ばす", fileName: "bus.mp3", category: "のりもの" },
  { id: "vehicle-09", name: "たくしー", fileName: "taxi.mp3", category: "のりもの" },
  { id: "vehicle-10", name: "ばいく", fileName: "motorbike.mp3", category: "のりもの" },
  { id: "vehicle-11", name: "じてんしゃ", fileName: "bicycle.mp3", category: "のりもの" },
  { id: "vehicle-12", name: "へりこぷたー", fileName: "helicopter.mp3", category: "のりもの" },

  { id: "life-01", name: "すいどう", fileName: "water-tap.mp3", category: "せいかつ" },
  { id: "life-02", name: "といれ", fileName: "toilet.mp3", category: "せいかつ" },
  { id: "life-03", name: "はみがき", fileName: "toothbrushing.mp3", category: "せいかつ" },
  { id: "life-04", name: "でんわ", fileName: "telephone.mp3", category: "せいかつ" },
  { id: "life-05", name: "かみなり", fileName: "thunder.mp3", category: "せいかつ" },
  { id: "life-06", name: "どあ", fileName: "door.mp3", category: "せいかつ" },
  { id: "life-07", name: "ちゃいむ", fileName: "chime.mp3", category: "せいかつ" },
  { id: "life-08", name: "めざましどけい", fileName: "alarm-clock.mp3", category: "せいかつ" },
  { id: "life-09", name: "せんたくき", fileName: "washing-machine.mp3", category: "せいかつ" },
  { id: "life-10", name: "そうじき", fileName: "vacuum-cleaner.mp3", category: "せいかつ" },
  { id: "life-11", name: "ふらいぱん", fileName: "frying-pan.mp3", category: "せいかつ" },
  { id: "life-12", name: "ぽっと", fileName: "kettle.mp3", category: "せいかつ" },
  { id: "life-13", name: "ぷりんたー", fileName: "printer.mp3", category: "せいかつ" },

  { id: "instrument-01", name: "ぴあの", fileName: "piano.mp3", category: "がっき" },
  { id: "instrument-02", name: "どらむ", fileName: "drum-set.mp3", category: "がっき" },
  { id: "instrument-03", name: "らっぱ", fileName: "trumpet.mp3", category: "がっき" },
  { id: "instrument-04", name: "すず", fileName: "bell.mp3", category: "がっき" },
  { id: "instrument-05", name: "たいこ", fileName: "taiko.mp3", category: "がっき" },
  { id: "instrument-06", name: "ぎたー", fileName: "guitar.mp3", category: "がっき" },
  { id: "instrument-07", name: "ばいおりん", fileName: "violin.mp3", category: "がっき" },
  { id: "instrument-08", name: "ふるーと", fileName: "flute.mp3", category: "がっき" },
  { id: "instrument-09", name: "りこーだー", fileName: "recorder.mp3", category: "がっき" },
  { id: "instrument-10", name: "たんばりん", fileName: "tambourine.mp3", category: "がっき" },
  { id: "instrument-11", name: "かすたねっと", fileName: "castanets.mp3", category: "がっき" },
  { id: "instrument-12", name: "しろふぉん", fileName: "xylophone.mp3", category: "がっき" },
  { id: "instrument-13", name: "はーもにか", fileName: "harmonica.mp3", category: "がっき" },
];

export const QUESTION_CATEGORIES: QuestionCategory[] = ["どうぶつ", "のりもの", "せいかつ", "がっき"];
