// Pecky random quotes for sidebar
export const PECKY_QUOTES = [
  "While you were sleeping, Pecky bought the dip.",
  "NFT? Nah, it's a Not-Fried-Turkey.",
  "Keep calm and let the chicken moon.",
  "Staking? Pecky's been sitting on golden eggs for weeks.",
  "One wallet to hatch them all.",
  "The only rug Pecky knows is his nest.",
  "In Pecky we trust (and maybe in memes too).",
  "Pecky's wings aren't just for flying – they're for flipping NFTs.",
  "This wallet smells like victory and Doritos.",
  "Counting your chickens before they hatch..."
];

/**
 * Get a random quote from the Pecky quotes collection
 */
export function getRandomQuote(): string {
  return PECKY_QUOTES[Math.floor(Math.random() * PECKY_QUOTES.length)];
}
