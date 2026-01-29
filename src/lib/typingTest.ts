// Common English words for typing test
const commonWords = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
    "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
    "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
    "quick", "brown", "fox", "jumps", "lazy", "dog", "sphinx", "black", "quartz", "judge",
    "vow", "five", "boxing", "wizards", "jump", "quickly", "pack", "box", "dozen", "liquor",
    "jugs", "vexingly", "daft", "zebras", "keyboard", "typing", "speed", "test", "practice", "improve"
];

const punctuationMarks = [".", ",", "!", "?", ";", ":"];
const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export interface GenerateWordsOptions {
    includePunctuation?: boolean;
    includeNumbers?: boolean;
}

export function generateWords(
    count: number = 50,
    options: GenerateWordsOptions = {}
): string[] {
    const { includePunctuation = false, includeNumbers = false } = options;
    const words: string[] = [];

    for (let i = 0; i < count; i++) {
        let word = commonWords[Math.floor(Math.random() * commonWords.length)];

        // Add numbers - randomly prepend or append a number to some words
        if (includeNumbers && Math.random() < 0.15) {
            const num = numbers[Math.floor(Math.random() * numbers.length)];
            const num2 = numbers[Math.floor(Math.random() * numbers.length)];
            if (Math.random() < 0.5) {
                word = num + num2 + word;
            } else {
                word = word + num + num2;
            }
        }

        // Add punctuation - randomly add punctuation at the end of some words
        if (includePunctuation && Math.random() < 0.2) {
            const punct = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
            word = word + punct;
        }

        words.push(word);
    }

    return words;
}

export function calculateWPM(
    correctChars: number,
    elapsedTimeSeconds: number
): number {
    if (elapsedTimeSeconds === 0) return 0;
    // Standard: 5 characters = 1 word
    const words = correctChars / 5;
    const minutes = elapsedTimeSeconds / 60;
    return Math.round(words / minutes);
}

export function calculateAccuracy(
    correctChars: number,
    totalChars: number
): number {
    if (totalChars === 0) return 100;
    if (correctChars === 0) return 0;
    return Math.round((correctChars / totalChars) * 100);
}

export function calculateConsistency(wpmHistory: number[]): number {
    if (wpmHistory.length < 2) return 100;

    const mean = wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length;
    const variance = wpmHistory.reduce((sum, wpm) => sum + Math.pow(wpm - mean, 2), 0) / wpmHistory.length;
    const stdDev = Math.sqrt(variance);

    // Convert to percentage (lower deviation = higher consistency)
    const consistency = Math.max(0, 100 - (stdDev / mean) * 100);
    return Math.round(consistency);
}
