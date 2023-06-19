// import express, { Express, Request, Response } from "express";
// import { detail, index, list } from "./service";
// import { Ad } from "./scraper";
import { Sorting, query, monthToSeason } from "./query";
import { Anilist, Imdb } from "./request";

async function main() {
    const today = new Date();
    const q = query(today.getFullYear(), monthToSeason(today.getMonth()), Sorting.POPULARITY_DESC);
    console.log(q);
    const anilist = new Anilist();
    const response = await anilist.fetch(q);
    console.log(JSON.stringify(response.data.Page.media[0], null, 2)); //JSON.stringify(response, null, 2)
    const imdbId = await Imdb.getIdFromName("Naruto", 2002, "series");
    console.log(imdbId);
}

(async () => main())()