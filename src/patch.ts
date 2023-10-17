import * as fs from "fs";
import * as path from "path";
import { Catalog } from "./stremio";
export class Patches {
    private filePath: string;
    private patches: any = {
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
    };
    constructor(filePath?: string) {
        this.filePath = filePath || path.join(__dirname, "../../postprocess/fix/catalog/manual.csv");
    }
    loadCatalogManualFixPatches() {
        /**
         * Reads the manual fix patches from the file system and return map.
         */
        if (!this.filePath) this.filePath = path.join(__dirname, "../../postprocess/fix/catalog/manual.csv");
        const patchFilepath = this.filePath;
        const patchFileContent = fs.readFileSync(patchFilepath, "utf8");
        for (const line of patchFileContent.split("\n")) {
            const [type,season,name,oldID,newID] = line.split(",");
            if (!isNaN(season as any)) {
                this.patches[type] = {...this.patches[type], [season]: this.patches[type][season] || new Map()};
            }
            this.patches[type][season]?.set(name, {[oldID]: newID});
        }
        return this.patches;
    }
    
    applyPatches(catalog: Catalog, type: string, season: string) {
        catalog.getMetas().forEach(meta => {
            console.log(`Applying patch for ${meta.name} ${meta.id}`);
            const patch = this.patches[type][season].get(meta.name);
            console.log(patch);
            if (patch) {
                console.log(`Found patch for ${meta.name}: ${meta.id}=>${patch[meta.id]}`);
                meta.id = patch[meta.id] || meta.id;
            }
        });
    }

}
