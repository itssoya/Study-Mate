export const AVATAR_EMOJIS = [
  "🦊",
  "🐼",
  "🐸",
  "🦁",
  "🐨",
  "🦉",
  "🐯",
  "🐙",
  "🦄",
  "🐢",
  "🐧",
  "🦋",
];

export function getAvatarEmoji(userId = "") {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) % AVATAR_EMOJIS.length;
  }
  return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
}
