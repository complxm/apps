"""Store the Słowo Życia key phrases (exact SŻ phrases for each bridge's New Testament passage) in data/review.json
as keyNtSz, next to keyNt (BSB) and keyNtPl (UBG). Usage: python3 scripts/add_sz_keys.py <sz-keys.json>"""
import json, os, sys
app = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(app, 'data', 'review.json')
rv = json.load(open(p, encoding='utf-8'))
keys = json.load(open(sys.argv[1], encoding='utf-8'))
for id_, k in keys.items():
    rv['bridges'].setdefault(id_, {})['keyNtSz'] = k
rv['about'] = rv['about'].rstrip() + ('' if 'keyNtSz' in rv['about'] else ' keyNtSz are exact Słowo Życia phrases.')
json.dump(rv, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(keys), 'phrases stored')
