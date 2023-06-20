import { TitleType } from "name-to-imdb";
import { promises as fs } from "fs";
import path from "path";
import { Season, Sorting, query } from "./query";
import { Anilist, Imdb } from "./request";
export type Meta = {
    id: string;
    type: TitleType;
    name: string;
    poster: string;
}
export class Catalog {
    #metas: Meta[] = [];
    #path: string;
    constructor(public readonly path: string) {
        this.#path = path;
    }
        
    addMeta(meta: Meta) {
        this.#metas.push(meta);
    }

    /**
     * Create a file at #path with the contents of #metas
     */
    async writeToFile() {
        await fs.writeFile(this.#path, JSON.stringify({metas: this.#metas}, null, 2));
    }

    async populate(year:number, season:Season, type:TitleType) {
        const q = query(year, season, Sorting.POPULARITY_DESC, type);
        const anilist = new Anilist();
        const response = await anilist.fetch(q);
        const results = response?.data?.Page?.media;
        if (!results) return;
        for (const anime of results) {
            const originalName = anime.title.english ?? anime.title.romaji;
            const name = Stremio.removeSeasonDetails(originalName);
            const id = await Imdb.getIdFromName(name, anime.seasonYear, type);
            const poster = anime.coverImage.medium ?? anime.bannerImage;
            this.addMeta({id,type,name:originalName,poster} as Meta);
        }
    }
}

export class Stremio {
    static async createCatalogIfNotExists(filePath: string) : Promise<Catalog> {
        const baseDir = "catalog";
        const dir = path.dirname(`${baseDir}/${filePath}`);
        try {
            await fs.stat(dir);
        } catch (error) {
            await fs.mkdir(dir, { recursive: true });
        }
        return new Catalog(`${baseDir}/${filePath}`);
    }
    static removeSeasonDetails(base: string): string {
        const stopWords = [
            "", ":", "season", "arc", "chapters", "chapter", "final", "1st", "2nd", "3rd", "1", "2", "3", 
            "-", "–", "—", "’", "'", "special", "the", "part"
        ];
        for (let index = 4; index < 215; index++) {
            stopWords.push(`${index}`);
            stopWords.push(`${index}th`);
        }
        return base.toLowerCase().split(/\b/).map(word => word.trim()).filter(word => !stopWords.includes(word)).join(" ");
    }
}