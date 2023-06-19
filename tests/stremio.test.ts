import { Stremio } from "../src/stremio";
describe("removeSeasonDetails", () => {
    it.each([
        ["Jujutsu Kaisen 2nd Season", "jujutsu kaisen"],
        ["The Rising of the Shield Hero Season 3", "the rising of the shield hero"],
        ["Demon Slayer: Kimetsu no Yaiba Swordsmith Village Arc", "demon slayer kimetsu no yaiba swordsmith village"],
        ["Attack on Titan Final Season", "attack on titan"],
        ["Kimetsu no Yaiba: Katanakaji no Sato-hen", "kimetsu no yaiba katanakaji no sato hen"],
        ["Hell’s Paradise", "hell s paradise"],
        ["Hell's Paradise", "hell s paradise"],
        ["The Promised Neverland Season 2", "the promised neverland"],
        ["Jigokuraku", "jigokuraku"]
    ])("should remove season details from a string", (originalTitle, expectedTitle) => {
        expect(Stremio.removeSeasonDetails(originalTitle)).toBe(expectedTitle);
    });
});