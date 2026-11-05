"""Store the KJV key phrases (exact KJV phrases for each bridge's two passages) in data/review.json as keyOtKjv and
keyNtKjv. The KJV is now the stored English Bible (the BSB is no longer offered).
Usage: python3 scripts/add_kjv_keys.py <kjv-keys.json>   ({"p1": {"ot": "...", "nt": "..."}, ...})"""
import json, os, sys
app = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(app, 'data', 'review.json')
rv = json.load(open(p, encoding='utf-8'))
keys = json.load(open(sys.argv[1], encoding='utf-8'))
for id_, k in keys.items():
    b = rv['bridges'].setdefault(id_, {})
    b['keyOtKjv'], b['keyNtKjv'] = k['ot'], k['nt']
if 'keyOtKjv' not in rv['about']:
    rv['about'] = rv['about'].rstrip() + ' keyOtKjv/keyNtKjv are exact KJV phrases.'
json.dump(rv, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(keys), 'bridges stored')
