type FalsyValues = false | undefined | null;

type FalsyItem<O> = O | FalsyValues;

export const rejectFalsyItems = <O>(items: Array<FalsyItem<O>>) =>
  items.filter(Boolean) as Array<Exclude<O, FalsyValues>>;
