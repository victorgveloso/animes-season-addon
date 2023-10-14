import * as fs from "fs";
import * as path from "path";
import { Catalog } from "./stremio";

export function loadCatalogManualFixPatches(filePath?: string) {
    /**
     * Reads the manual fix patches from the file system and return map.
     */
    const patches: any = {
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
            FALL: new Map()
        }
    }
    if (!filePath) filePath = path.join(__dirname, "../../postprocess/fix/catalog/manual.csv");
    const patchFilepath = filePath;
    const patchFileContent = fs.readFileSync(patchFilepath, "utf8");
    for (const line of patchFileContent.split("\n")) {
        const [type,season,name,oldID,newID] = line.split(",");
        if (!isNaN(season as any)) {
            patches[type] = {...patches[type], [season]: patches[type][season] || new Map()};
        }
        patches[type][season]?.set(name, {[oldID]: newID});
    }
    return patches;
}

export function applyPatches(catalog: Catalog, patches: any, type: string, season: string) {
    catalog.getMetas().forEach(meta => {
        const patch = patches[type][season].get(meta.name);
        if (patch) {
            meta.id = patch[meta.id] || meta.id;
        }
    });
}