import json
import glob
for i in glob.iglob("catalog/*/*/*.json"):
    print(i)
    with open(i, "r") as f:
        data = json.load(f)["metas"]
    for anime in data:
        if "behaviorHints" not in anime:
            anime["behaviorHints"] = {}
        anime["behaviorHints"]["defaultVideoId"] = anime["id"]
    with open(i, "w") as f:
        json.dump({"metas": data}, f, indent=2, ensure_ascii=False)