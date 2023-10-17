import { Patches } from '../src/patch';
import * as fs from "fs";

describe('loadCatalogManualFixPatches summer movie', () => {
    let filepath = "tests-loadCatalogManualFixPatches-summer-movie-manual.csv";
    const patchCtl = new Patches(filepath);
    beforeEach(()=>{
        fs.writeFileSync(filepath, "movie,SUMMER,The God of High School,tt12451520,tt1245152");
    });
    it('should map with only The God of High School in SUMMER movies', () => {
        let res = patchCtl.loadCatalogManualFixPatches();
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

describe.each([ ["series,2001,Fruits Basket,tt0279850,tt0279851", "Fruits Basket"],
                ['series,2001,"Fruits Basket",tt0279850,tt0279851', "Fruits Basket"],
                ['series,2001,"Fruits,Basket",tt0279850,tt0279851', "Fruits,Basket"]])('loadCatalogManualFixPatches 2001 series', (input, name) => {
    let filepath = "tests-loadCatalogManualFixPatches-manual.csv";
    const patchCtl = new Patches(filepath);
    beforeEach(()=>{
        fs.writeFileSync(filepath, input);
    });
    it('should map with only Fruits Basket in 2001 series', () => {
        let res = patchCtl.loadCatalogManualFixPatches();
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
                2001: new Map([[name, {"tt0279850": "tt0279851"}]])
            }
        });
    });
    afterEach(()=>{
        fs.rmSync(filepath);
    });
});