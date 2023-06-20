import { Stremio } from "./stremio";
import { TitleType } from 'name-to-imdb';

async function main() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const manifest = await Stremio.createManifestIfNotExists(".");
    const promises = [];
    for (const titleType of ["series", "movie"] as TitleType[]) {
        for (const season of manifest.getSeasons()) {
            console.log(`Generating catalog for season ${season} ${titleType}`);
            const catalog = await Stremio.createCatalogIfNotExists(`${titleType}/latest_anime_seasons/genre=${season.toLowerCase()}.json`);
            await catalog.populate(currentYear, season, titleType);
            promises.push(catalog.writeToFile());
        }
        if (currentYear > manifest.getLastUpdate().getFullYear()) {
            for (let year = Math.max(2001, manifest.getLastUpdate().getFullYear()); year < currentYear; year++) {
                console.log(`Generating catalog for year ${year} ${titleType}`);
                const catalog = await Stremio.createCatalogIfNotExists(`${titleType}/archive_anime_seasons/genre=${year}.json`);
                for (const season of manifest.getSeasons()) {
                    await catalog.populate(year, season, titleType);
                }
                promises.push(catalog.writeToFile());
            }
        }
    }
    if (currentYear > manifest.getLastUpdate().getFullYear()) {
        await manifest.update(today);
    }
    await Promise.all(promises);
}

(async () => main())()