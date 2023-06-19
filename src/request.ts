import nameToImdb, { TitleType } from "name-to-imdb";
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
        return response.json()
    }
}