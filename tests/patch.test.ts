import { loadCatalogManualFixPatches } from '../src/patch';
import * as fs from "fs";

describe('loadCatalogManualFixPatches summer movie', () => {
    let filepath = "tests-loadCatalogManualFixPatches-summer-movie-manual.csv";
    beforeEach(()=>{
        fs.writeFileSync(filepath, "movie,SUMMER,The God of High School,tt12451520,tt1245152");
    });
    it('should map with only The God of High School in SUMMER movies', () => {
        let res = loadCatalogManualFixPatches(filepath);
        expect(res).toEqual({
            movie: {
                SUMMER: new Map([["The God of High School", {"tt12451520": "tt1245152"}]]),
                WINTER: new Map(),
                SPRING: new Map(),
                FALL: new Map()
            },
            series: {
                SUMMER: new Map(),
                WINTER: new Map(),
                SPRING: new Map(),
                FALL: new Map()
            }
        });
    });
    afterEach(()=>{
        fs.rmSync(filepath);
    });
});

describe('loadCatalogManualFixPatches 2001 series', () => {
    let filepath = "tests-loadCatalogManualFixPatches-manual.csv";
    beforeEach(()=>{
        fs.writeFileSync(filepath, "series,2001,Fruits Basket,tt0279850,tt0279851");
    });
    it('should map with only Fruits Basket in 2001 series', () => {
        let res = loadCatalogManualFixPatches(filepath);
        expect(res).toEqual({
            movie: {
                SUMMER: new Map(),
                WINTER: new Map(),
                SPRING: new Map(),
                FALL: new Map()
            },
            series: {
                SUMMER: new Map(),
                WINTER: new Map(),
                SPRING: new Map(),
                FALL: new Map(),
                2001: new Map([["Fruits Basket", {"tt0279850": "tt0279851"}]])
            }
        });
    });
    afterEach(()=>{
        fs.rmSync(filepath);
    });
});