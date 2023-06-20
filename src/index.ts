import { monthToSeason, createSortedSeasonList } from "./query";
import { Stremio } from "./stremio";
import { TitleType } from 'name-to-imdb';

async function main() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentSeason = monthToSeason(currentMonth);
    const seasons = createSortedSeasonList(currentSeason);
    const promises = [];
    for (const titleType of ["series", "movie"] as TitleType[]) {
        for (const season of seasons) {
            const catalog = await Stremio.createCatalogIfNotExists(`${titleType}/latest_anime_seasons/genre=${season.toLowerCase()}.json`);
            catalog.populate(currentYear, season, titleType);
            promises.push(catalog.writeToFile());
        }
        for (let year = 2001; year < currentYear; year++) {
            const catalog = await Stremio.createCatalogIfNotExists(`${titleType}/archive_anime_seasons/genre=${year}.json`);
            for (const season of seasons) {
                catalog.populate(year, season, titleType);
            }
            promises.push(catalog.writeToFile());
        }
    }
    await Promise.all(promises);
}

(async () => main())()