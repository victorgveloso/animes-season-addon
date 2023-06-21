import json
import glob
for i in glob.iglob("catalog/*/*/*.json"):
    print(i)
    with open(i, "r") as f:
        data = json.load(f)["metas"]
    for anime in data:
        if "poster" in anime and anime["poster"].startswith("https://s4.anilist.co/file/anilistcdn/media/anime/cover/small/"):
            anime["poster"] = anime["poster"].replace("https://s4.anilist.co/file/anilistcdn/media/anime/cover/small/", "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/")
    with open(i, "w") as f:
        json.dump({"metas": data}, f, indent=2, ensure_ascii=False)