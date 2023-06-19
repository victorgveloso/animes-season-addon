import { Imdb } from "../src/request";

describe.each(["jujutsu kaisen",
"the rising of the shield hero",
"demon slayer kimetsu no yaiba swordsmith village",
"attack on titan",
"kimetsu no yaiba katanakaji no sato hen",
"hell s paradise",
"the promised neverland",
"jigokuraku"])("getIdFromName", (name) => {
    it(`should not return null for %s`, async () => {
        const id = await Imdb.getIdFromName(name);
        expect(id).not.toBeNull();
    });
    it(`should return a valid imdb id for %s`, async () => {
        const id = await Imdb.getIdFromName(name);
        expect(id).toMatch(/tt\d{7,9}/);
    });
});