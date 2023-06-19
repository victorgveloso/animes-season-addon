import { Sorting, query, monthToSeason } from "./query";
import { Anilist, Imdb } from "./request";
import { Stremio } from "./stremio";

async function main() {
    const today = new Date();
    const q = query(today.getFullYear(), monthToSeason(today.getMonth()), Sorting.POPULARITY_DESC);
    console.log(q);
    const anilist = new Anilist();
    const response = await anilist.fetch(q);
    const firstEntry = response.data.Page.media[0];
    console.log(JSON.stringify(firstEntry, null, 2)); //JSON.stringify(response, null, 2)
    const name = Stremio.removeSeasonDetails(firstEntry.title.english ?? firstEntry.title.romaji);
    console.log(name);
    const imdbId = await Imdb.getIdFromName(name, firstEntry.seasonYear, "series");
    console.log(imdbId);
}

(async () => main())()