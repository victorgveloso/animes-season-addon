declare module "name-to-imdb" {
    type TitleType = "movie" | "series";
    type NameToImdbOptions = {
        name: string;
        year?: number;
        type?: TitleType;
    }
    type CallbackType<T> = (err: Error | null, res: string | null | undefined, info: Object | undefined) => T;
    export default function nameToImdb<T>(args: NameToImdbOptions | string, cb: CallbackType<T>): T;
}