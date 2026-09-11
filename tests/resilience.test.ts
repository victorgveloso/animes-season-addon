import { Anilist, AnilistApiError } from "../src/request";
import { Catalog } from "../src/stremio";
import { Season } from "../src/query";

describe("Anilist.fetch error handling", () => {
    afterEach(() => jest.restoreAllMocks());

    it("throws AnilistApiError on the real 2026-09-07 AniList outage response shape (403 + errors body)", async () => {
        jest.spyOn(global, "fetch").mockResolvedValue({
            ok: false,
            status: 403,
            statusText: "Forbidden",
            json: async () => ({
                errors: [{ message: "The AniList API has been temporarily disabled due to severe stability issues.", status: 403 }],
                data: null
            }),
        } as any);

        const anilist = new Anilist();
        await expect(anilist.fetch("query { Page { media { id } } }")).rejects.toBeInstanceOf(AnilistApiError);
    });

    it("still resolves normally for a well-formed 200 response", async () => {
        const fakeBody = { data: { Page: { media: [] } } };
        jest.spyOn(global, "fetch").mockResolvedValue({
            ok: true, status: 200, json: async () => fakeBody,
        } as any);

        const anilist = new Anilist();
        await expect(anilist.fetch("query { Page { media { id } } }")).resolves.toEqual(fakeBody);
    });
});

describe("Catalog.populate error propagation", () => {
    afterEach(() => jest.restoreAllMocks());

    it("propagates AnilistApiError instead of silently leaving metas empty", async () => {
        jest.spyOn(Anilist.prototype, "fetch").mockRejectedValue(new AnilistApiError("Anilist API request failed (403): outage"));
        const catalog = new Catalog("unused-test-path.json");

        await expect(catalog.populate(2026, Season.FALL, "series")).rejects.toThrow(AnilistApiError);
        expect(catalog.getMetas()).toEqual([]);
    });

    it("resolves normally with empty metas when Anilist legitimately reports zero anime this season", async () => {
        jest.spyOn(Anilist.prototype, "fetch").mockResolvedValue({ data: { Page: { media: [] } } });
        const catalog = new Catalog("unused-test-path.json");

        await expect(catalog.populate(2026, Season.FALL, "series")).resolves.toBeUndefined();
        expect(catalog.getMetas()).toEqual([]);
    });
});
