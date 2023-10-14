import { TitleType } from "name-to-imdb";
import { promises as fs } from "fs";
import path from "path";
import { Season, Sorting, createSortedSeasonList, monthToSeason, query } from "./query";
import { Anilist, IdResolver, IdSource, Imdb } from "./request";
export type Meta = {
    id: string;
    type: TitleType;
    name: string;
    poster: string;
    behaviorHints?: {
        defaultVideoId: string;
    }
}
export class Catalog {
    private metas: Meta[] = [];
    constructor(private pathFile: string) {}
        
    addMeta(meta: Meta) {
        this.metas.push(meta);
    }

    getMetas() : Meta[] {
        return this.metas;
    }

    /**
     * Create a file at path with the contents of metas
     */
    async writeToFile() {
        await fs.writeFile(this.pathFile, JSON.stringify({metas: this.metas.filter((m) => m?.id?.startsWith("tt") || m?.id?.startsWith("kitsu"))}, null, 2));
    }

    describe({genres, tags, description}: {genres: string[], tags: string[], description: string}) {
        let result = "Genres: " + genres.join(", ");
        const isSpoilerFree = (tag:any) => !tag.isMediaSpoiler && !tag.isGeneralSpoiler;
        result += "\nTags:" + tags.filter(isSpoilerFree).map(({name}:any) => name).join("/");
        result += `\n${description}` ?? "";
        return result;
    }

    async populate(year:number, season:Season, type:TitleType) {
        const q = query(year, season, Sorting.POPULARITY_DESC, type);
        const anilist = new Anilist();
        const response = await anilist.fetch(q);
        const results = response?.data?.Page?.media;
        if (!results) return;
        for (const anime of results) {
            const originalName = anime.title.english ?? anime.title.romaji;
            let description = this.describe(anime);
            let fromAnilist = new IdResolver(IdSource.ANILIST, anime.id, originalName, anime.seasonYear, type, Stremio.removeSeasonDetails);
            let imdbId = await fromAnilist.resolveImdb();
            let id = imdbId;
            if (!imdbId) {
                id = await fromAnilist.resolveKitsu();
            }
            const poster = anime.coverImage.extraLarge ?? anime.coverImage.large ?? anime.coverImage.medium ?? anime.bannerImage;
            switch (type) {
                case "movie":
                    this.addMeta({id,type,name:originalName,poster, behaviorHints:{defaultVideoId:id}, description} as Meta);
                    break;
                default:
                    this.addMeta({id,type,name:originalName,poster, description} as Meta);
            }
        }
    }
}
export type CatalogExtra = {
    name: string;
    options: string[];
    isRequired: boolean;
}
export type CatalogDescription = {
    id: string;
    type: TitleType;
    name: string;
    extra: CatalogExtra[];
    extraSupported: string[];
}
enum CatalogType {
    LATEST = "latest",
    ARCHIVE = "archive"
}
type AbstractManifest = {
    id: string;
    version: string;
    name: string;
    description: string;
    logo: string;
    resources: string[];
    types: string[];
    catalogs: CatalogDescription[];
    idPrefixes: string[];
    lastUpdatedAt?: Date;
}
export class Manifest implements AbstractManifest {
    async update(today: Date) {
        this.lastUpdatedAt = today;
        let [major, minor, patch] = this.version.split(".");
        this.version = `${major}.${Number.parseInt(minor)+1}.${patch}`;
        this.years = Manifest.dateToYears(today);
        this.seasons = Manifest.dateToSeasons(today);
        for (const catalog of this.catalogs) {
            if (catalog.name == "Anime Years") {
                catalog.extra[0].options = this.years;
            }
            else if (catalog.name == "Anime Seasons") {
                catalog.extra[0].options = this.seasons;
            }
        }
        await this.writeToFile();
    }

    /**
     * Create a file at path with the contents of metas
     */
    async writeToFile() {
        await fs.writeFile(this.pathFile, JSON.stringify({
            id: this.id,
            version: this.version,
            name: this.name,
            description: this.description,
            logo: this.logo,
            resources: this.resources,
            types: this.types,
            catalogs: this.catalogs,
            idPrefixes: this.idPrefixes,
            lastUpdatedAt: this.lastUpdatedAt,
        }, null, 2));
    }

    getLastUpdate() : Date {
        return this.lastUpdatedAt;
    }
    private seasons: Season[];
    private years: string[];
    constructor(
        private pathFile: string,
        public id: string,
        public version: string,
        public name: string,
        public description: string,
        public logo: string,
        public resources: string[],
        public types: string[],
        public idPrefixes: string[],
        public catalogs: CatalogDescription[],
        public lastUpdatedAt: Date = new Date(1970, 0, 1)
    ){
        if (catalogs.length == 0) {
            this.catalogs = [];
            this.seasons = Manifest.dateToSeasons(lastUpdatedAt);
            this.years = Manifest.dateToYears(lastUpdatedAt);
            this.addCatalog("series", CatalogType.LATEST);
            this.addCatalog("movie", CatalogType.LATEST);
            this.addCatalog("series", CatalogType.ARCHIVE);
            this.addCatalog("movie", CatalogType.ARCHIVE);
        }
        else {
            this.catalogs = catalogs;
            this.seasons = catalogs.find(catalog => catalog.id == "latest_anime_seasons")?.extra[0].options as Season[];
            this.years = catalogs.find(catalog => catalog.id == "archive_anime_seasons")?.extra[0].options as string[];
        }
    }
    static fromObject(pathFile: string, obj: AbstractManifest) : Manifest {
        return new Manifest(
            pathFile,
            obj.id,
            obj.version,
            obj.name,
            obj.description,
            obj.logo,
            obj.resources,
            obj.types,
            obj.idPrefixes,
            obj.catalogs,
            obj?.lastUpdatedAt
        );
    }
    static default(pathFile: string) : Manifest {
        return Manifest.fromObject(pathFile, {
            id: "animes-season-addon",
            version: "1.2.0",
            name: "Animes' season",
            description: "A catalog addon for the latest anime seasons",
            logo: "https://styles.redditmedia.com/t5_yo4xr/styles/communityIcon_rv2fpnvbmfra1.png",
            resources: ["catalog"],
            types: ["movie","series"],
            catalogs: [],
            idPrefixes: ["tt","kitsu"]
          } as AbstractManifest);
    }
    static async fromFile(filePath: string) : Promise<Manifest> {
        const manifest = await fs.readFile(filePath, "utf-8");
        const obj = JSON.parse(manifest);
        obj.lastUpdatedAt = new Date(obj.lastUpdatedAt);
        return Manifest.fromObject(filePath, obj);
    }
    getSeasons() : Season[] {
        return this.seasons;
    }
    getYears() : string[] {
        return this.years;
    }
    private static dateToYears(today: Date) : string[] {
        const years = []
        for (let y = today.getFullYear() - 1; y >= 2001; y--) {
            years.push(y.toString());
        }
        return years
    }
    private static dateToSeasons(today: Date) : Season[] {
        const currentMonth = today.getMonth();
        const currentSeason = monthToSeason(currentMonth);
        return createSortedSeasonList(currentSeason);
    }
    private addCatalog(contentType: TitleType, catalogType: CatalogType) {
        this.catalogs.push({
            type: contentType,
            id: catalogType == CatalogType.LATEST ? "latest_anime_seasons" : "archive_anime_seasons",
            name: catalogType == CatalogType.LATEST ? "Anime Seasons" : "Anime Years",
            extra: [{ 
                name: "genre", 
                options: catalogType == CatalogType.LATEST ? this.seasons : this.years, 
                isRequired: true }
            ],
            "extraSupported": ["genre"]
          });
    }
}
  


export class Stremio {
    private static baseDir = ".";
    static async createManifestIfNotExists(filePath: string) : Promise<Manifest> {
        const manifestPath = `${this.baseDir}/${filePath}/manifest.json`;
        const dir = path.dirname(manifestPath);
        let manifest: Manifest;
        try {
            await fs.stat(dir);
            await fs.stat(manifestPath);
            manifest = await Manifest.fromFile(manifestPath);
            console.log(`Manifest found at ${manifestPath}`);
            
        } catch (error) {
            await fs.mkdir(dir, { recursive: true });
            manifest = Manifest.default(manifestPath);
            await manifest.writeToFile();
            console.log(`Manifest created at ${manifestPath}`); 
        }
        return manifest;
    }
    static async createCatalogIfNotExists(filePath: string) : Promise<Catalog> {
        const dir = path.dirname(`${this.baseDir}/catalog/${filePath}`);
        try {
            await fs.stat(dir);
        } catch (error) {
            await fs.mkdir(dir, { recursive: true });
        }
        return new Catalog(`${this.baseDir}/catalog/${filePath}`);
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
        return base.toLowerCase().split(" ").map(word => word.trim()).filter(word => !stopWords.includes(word)).join(" ");
    }
}