export class Stremio {
    static removeSeasonDetails(base: string): string {
        const stopWords = [
            "", ":", "season", "arc", "final", "1st", "2nd", "3rd", "1", "2", "3", "-", "–", "—", "’", "'"
        ];
        for (let index = 4; index < 215; index++) {
            stopWords.push(`${index}`);
            stopWords.push(`${index}th`);
        }
        return base.toLowerCase().split(/\b/).map(word => word.trim()).filter(word => !stopWords.includes(word)).join(" ");
    }
}