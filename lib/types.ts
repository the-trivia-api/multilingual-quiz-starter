/** A tag as the browser sees it: just the text in the chosen language. */
export type Tag = {
  slug: string;
  label: string;
  description: string;
  count: number;
};

/** A question ready to play, with its answers already shuffled. */
export type QuizQuestion = {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: string;
};
