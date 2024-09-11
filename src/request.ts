import nameToImdb, { TitleType } from "name-to-imdb";
import { Stremio } from "./stremio";
export class Imdb {
    static async getIdFromName(name: string, year?: number, type?: TitleType) {
        return await new Promise((res,err) => nameToImdb(
            {name: name, year: year, type: type}, 
            (err1: Error | null, res1: string | null | undefined) => err1 ? err(err1) : res(res1))
            );
    }
}
export class Anilist {
    url = 'https://graphql.anilist.co';
    method = 'POST';
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    async fetch(query: string) {
        const options = {
            method: this.method,
            headers: this.headers,
            body: JSON.stringify({query})
        };
        const response = await fetch(this.url, options);
        return response.json();
    }
}
export enum IdSource {
    KITSU,
    IMDB,
    TMDB,
    MAL,
    ANILIST,
}
abstract class UrlResolver {
    protected next?: UrlResolver;
    setNext(resolver: UrlResolver) {
        if (!!this.next) this.next.setNext(resolver);
        else this.next = resolver;
    }
    protected async fetch(source:IdSource, id:string) {
        const response = await fetch(this.getUrl(source, id));
        return response.json();
    }
    async handle(source: IdSource, target: IdSource, id: string): Promise<any> {
        try {
            const response = await this.fetch(source, id);
            const result = this.getId(target, response);
            if (!!result) return result;
        } catch (error) {}
        return this.next?.handle(source, target, id);
    }
    protected abstract getUrl(source:IdSource, id:string): string;
    protected abstract getId(source:IdSource, id:any): string;
}
class YunaUrlResolver extends UrlResolver {
    private readonly sources = ["kitsu", "imdb", "themoviedb", "myanimelist", "anilist"];
    getUrl (source:IdSource, id:string) : string {
        return `https://arm.haglund.dev/api/v2/ids?source=${this.sources[source.valueOf()]}&id=${id}&include=kitsu,imdb`;
    };
    getId (source:IdSource, id:any) {
        return id[this.sources[source.valueOf()]];
    }
}
class KitsuUrlResolver extends UrlResolver {
    getUrl (source:IdSource, id:string) : string {
        return `https://anime-kitsu.strem.fun/meta/anime/${IdSource[source.valueOf()].toLowerCase()}:${id}.json`;
    };
    getId (source:IdSource, obj:any) {
        const meta = obj["meta"];
        switch (source) {
            case IdSource.KITSU:
                return meta["kitsu_id"];
            case IdSource.IMDB:
                return meta["imdb_id"];
            default:
                throw new Error("Invalid target id source");
        }
    }
}
class NameToImdbUrlResolver extends UrlResolver {
    constructor(private readonly name: string,
        private readonly year?: number, 
        private readonly type?: TitleType,
        private readonly preprocessName?: (s:string)=>string){super();}
    async handle(source: IdSource, target: IdSource, id: string): Promise<any> {
        let imdbId = await Imdb.getIdFromName(this.name, this.year, this.type);
        if (imdbId) return imdbId;
        let nextName: string = this.name;
        if (!!this.preprocessName) {
            nextName = this.preprocessName(this.name);
            imdbId = await Imdb.getIdFromName(nextName, this.year, this.type);
        }
        let maxRetry = nextName.match(/ /g)?.length ?? 0;
        while (!imdbId && maxRetry--) {
            nextName = nextName.substring(0, nextName.lastIndexOf(" "));
            if (nextName.trim().length == 0) break;
            imdbId = await Imdb.getIdFromName(nextName, this.year, this.type);
        };
        return imdbId ?? this.next?.handle(source, target, id);
    }
    getUrl (source:IdSource, id:string) : string {
        throw new Error("Not implemented");
    };
    getId (source:IdSource, obj:any) : string {
        throw new Error("Not implemented");
    }
}
export class IdResolver {
    private urlResolver: UrlResolver;
    constructor(
        private readonly source: IdSource,
        private readonly id: string,
        private readonly name?: string,
        private readonly year?: number, 
        private readonly type?: TitleType,
        private readonly preprocessName?: (s: string) => string
    ) {
        this.urlResolver = new YunaUrlResolver();
        if (!!this.name) {
            this.urlResolver.setNext(new NameToImdbUrlResolver(this.name, this.year, this.type, preprocessName));
        }
        this.urlResolver.setNext(new KitsuUrlResolver());
    }
    async resolveImdb() {
        return await this.urlResolver.handle(this.source, IdSource.IMDB, this.id);
    }
    async resolveKitsu() {
        const id = await this.urlResolver.handle(this.source, IdSource.KITSU, this.id);
        return id ? `kitsu:${id}` : undefined;
    }
}