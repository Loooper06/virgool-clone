export const createSlug = (str: string) => {
  return str
    .replace(/[،ًًًٌٍُِ\.\+\)(*&^%$#@!~'";:?><«»`ء]+/g, "")
    ?.replace(/[\s\-_]+/g, "-");
};

export const randomID = () => Math.random().toString(36).substring(2);
