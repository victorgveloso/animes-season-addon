import json
import glob
for i in glob.iglob("catalog/*/*/*.json"):
    print(i)
    with open(i, "r") as f:
        data = json.load(f)["metas"]
    data = [x for x in data if "id" in x and x["id"].startswith("tt")]
    with open(i, "w") as f:
        json.dump({"metas": data}, f, indent=2)