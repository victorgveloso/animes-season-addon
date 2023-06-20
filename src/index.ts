import { Sorting, query, monthToSeason, createSortedSeasonList } from "./query";
import { Anilist, Imdb } from "./request";
import { Stremio, Meta } from "./stremio";
import { TitleType } from 'name-to-imdb';

async function main() {
    const stremio = new Stremio();
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentSeason = monthToSeason(currentMonth);
    const seasons = createSortedSeasonList(currentSeason);
    const promises = [];
    for (const titleType of ["series", "movie"] as TitleType[]) {
        for (const season of seasons) {
            const catalog = await stremio.createCatalogIfNotExists(`${titleType}/latest_anime_seasons/genre=${season.toLowerCase()}.json`);
            const q = query(currentYear, season, Sorting.POPULARITY_DESC, titleType);
            const anilist = new Anilist();
            const response = await anilist.fetch(q);
            const results = response?.data?.Page?.media;
            if (!results) continue;
            for (const anime of results) {
                const originalName = anime.title.english ?? anime.title.romaji;
                const name = Stremio.removeSeasonDetails(originalName);
                const id = await Imdb.getIdFromName(name, anime.seasonYear, titleType);
                const poster = anime.coverImage.medium ?? anime.bannerImage;
                catalog.addMeta({id,type:titleType,name:originalName,poster} as Meta);
            }
            promises.push(catalog.writeToFile());
        }
        for (let year = 2001; year < currentYear; year++) {
            const catalog = await stremio.createCatalogIfNotExists(`${titleType}/archive_anime_seasons/genre=${year}.json`);
            for (const season of seasons) {
                const q = query(year, season, Sorting.POPULARITY_DESC, titleType);
                const anilist = new Anilist();
                const response = await anilist.fetch(q);
                const results = response?.data?.Page?.media;
                if (!results) continue;
                for (const anime of results) {
                    const originalName = anime.title.english ?? anime.title.romaji;
                    const name = Stremio.removeSeasonDetails(originalName);
                    const id = await Imdb.getIdFromName(name, anime.seasonYear, titleType);
                    const poster = anime.coverImage.medium ?? anime.bannerImage;
                    catalog.addMeta({id,type:titleType,name:originalName,poster} as Meta);
                }
            }
            promises.push(catalog.writeToFile());
        }
    }
    await Promise.all(promises);
}

(async () => main())()