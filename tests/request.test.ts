import { Imdb, IdResolver, IdSource } from "../src/request";

describe.each(["jujutsu kaisen", 
"rising of shield hero", 
"demon slayer: kimetsu no yaiba swordsmith village", 
"attack on titan", 
"kimetsu no yaiba: katanakaji no sato-hen", 
"hell’s paradise", 
"hell's paradise", 
"promised neverland", 
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
describe.each([[145064,51009,"Jujutsu Kaisen 2nd Season"],
    [146065,51179,"Mushoku Tensei II: Isekai Ittara Honki Dasu"],
    [159322,53998,"BLEACH: Sennen Kessen-hen - Ketsubetsu-tan"],
    [146953,51498,"Masamune-kun no Revenge R"],
    [136149,49303,"Alice to Therese no Maboroshi Koujou"],
    [154745,53050,"Kanojo, Okarishimasu 3rd Season"],
    [147103,51552,"Watashi no Shiawase na Kekkon"],
    [163263,54898,"Bungou Stray Dogs 5th Season"],
    [155168,53200,"Hataraku Maou-sama!! 2nd Season"],
    [142877,50613,"Rurouni Kenshin: Meiji Kenkaku Romantan (2023)"],
    [139435,49858,"Shinigami Bocchan to Kuro Maid 2nd Season"],
    [154391,52969,"Jitsu wa Ore, Saikyou Deshita?"],
    [157654,53671,"Love Live! Nijigasaki Gakuen School Idol Doukoukai: NEXT SKY"]])("Pass for both", (anilistId, idMal, name) => {
    it(`should return a valid imdb id for Anilist ID (${anilistId})`, async () => {
        const resolver = new IdResolver(IdSource.ANILIST, anilistId.toString());
        const id = await resolver.resolveImdb();
        expect(id).toMatch(/tt\d{7,9}/);
    });
    it(`should return a valid imdb id for MAL ID (${idMal})`, async () => {
        const resolver = new IdResolver(IdSource.MAL, idMal.toString());
        const id = await resolver.resolveImdb();
        expect(id).toMatch(/tt\d{7,9}/);
    });
  });

describe.each([[155730,53379,"Uchi no Kaisha no Chiisai Senpai no Hanashi"],
    [150972,52082,"Shiro Seijo to Kuro Bokushi"],
    [146836,51458,"Lv1 Maou to One Room Yuusha"],
    [150429,51995,"Hibike! Euphonium: Ensemble Contest-hen"],
    [151513,52214,"Genjitsu no Yohane: SUNSHINE in the MIRROR"],
    [156040,53438,"Higeki no Genkyou to Naru Saikyou Gedou Last Boss Joou wa Tami no Tame ni Tsukushimasu."],
    [160188,54234,"Suki na Ko ga Megane wo Wasureta"],
    [109979,36699,"Kimitachi wa Dou Ikiru ka"],
    [163542,54947,"Spy Kyoushitsu 2nd season"],
    [162561,54688,"NARUTO (Shinsaku Anime)"],
    [146646,51318,"Hanma Baki Season 2"],
    [155418,53263,"Seija Musou: Salaryman, Isekai de Ikinokoru Tame ni Ayumu Michi"]])("Only anilist match", (anilistId, idMal, name) => {
    it(`should return a valid imdb id for Anilist ID (${anilistId})`, async () => {
        const resolver = new IdResolver(IdSource.ANILIST, anilistId.toString());
        const id = await resolver.resolveImdb();
        expect(id).toMatch(/tt\d{7,9}/);
    });
    it(`should fail to provide an imdb id for MAL ID (${idMal})`, async () => {
        const resolver = new IdResolver(IdSource.MAL, idMal.toString());
        const id = await resolver.resolveImdb();
        expect(id).toBeUndefined();
    });
  });

describe.each([[154966,53127,"Fate/strange Fake: Whispers of Dawn"],
    [159831,54112,"Zom 100: Zombie ni Naru Made ni Shitai 100 no Koto"],
    [163132,54856,"Horimiya -piece- "],
    [139606,49894,"Eiyuu Kyoushitsu"],
    [159926,54141,"BASTARD!!: Ankoku no Hakaishin - Jigoku no Chinkonka-hen"],
    [165356,55454,"Shuumatsu no Valkyrie II Part 2"],
    [142598,50582,"Nanatsu no Maken ga Shihai Suru"],
    [154643,53026,"SYNDUALITY Noir"],
    [155982,53428,"AYAKA"],
    [145140,51020,"Helck"],
    [160447,54275,"Temple"],
    [131863,48633,"Liar Liar"],
    [158530,53787,"AI no Idenshi"],
    [152802,52505,"Dark Gathering"],
    [153339,52611,"Okashi na Tensei"],
    [162983,54790,"Undead Girl Murder Farce"],
    [163079,54842,"Sugar Apple Fairy Tale Part 2"],
    [149883,51916,"Dekiru Neko wa Kyou mo Yuuutsu"],
    [148465,51764,"Level 1 dakedo Unique Skill de Saikyou desu"],
    [153360,52619,"Jidou Hanbaiki ni Umarekawatta Ore wa Meikyuu wo Samayou"],
    [162893,54760,"Ryza no Atelier: Tokoyami no Joou to Himitsu no Kakurega"],
    [163205,54883,"Mononogatari 2nd Season"]])("Only name matches", (anilistId, idMal, name) => {
    it(`should fail to provide an imdb id for Anilist ID (${anilistId})`, async () => {
        const resolver = new IdResolver(IdSource.ANILIST, anilistId.toString());
        const id = await resolver.resolveImdb();
        expect(id).toBeUndefined();
    });
    it(`should fail to provide an imdb id for MAL ID (${idMal})`, async () => {
        const resolver = new IdResolver(IdSource.MAL, idMal.toString());
        const id = await resolver.resolveImdb();
        expect(id).toBeUndefined();
    });
    it(`should return a valid imdb id for name (${name})`, async () => {
        const resolver = new IdResolver(IdSource.TMDB, "", name, 2023, "series");
        const id = await resolver.resolveImdb();
        expect(id).toMatch(/tt\d{7,9}/);
    });
  });

describe.each([[163327,54915,"Go-toubun no Hanayome∽"],
    [157397,53632,"Yumemiru Danshi wa Genjitsushugisha"],
    [98875,34683,"Hizukuri"]])("Unmatched", (anilistId, idMal, name) => {
    it(`should fail to provide an imdb id for Anilist ID (${anilistId}) and name (${name})`, async () => {
        const resolver = new IdResolver(IdSource.ANILIST, anilistId.toString(), name, 2023, "series");
        const id = await resolver.resolveImdb();
        expect(id).toBeUndefined();
    });
    it(`should fail to provide an imdb id for MAL ID (${idMal}) and name (${name})`, async () => {
        const resolver = new IdResolver(IdSource.MAL, idMal.toString(), name, 2023, "series");
        const id = await resolver.resolveImdb();
        expect(id).toBeUndefined();
    });
  });