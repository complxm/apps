import json

OT_BOOKS = [
    {"name": "Genesis", "abbrev": "Gen", "section": "law", "chapters": 50},
    {"name": "Exodus", "abbrev": "Exod", "section": "law", "chapters": 40},
    {"name": "Leviticus", "abbrev": "Lev", "section": "law", "chapters": 27},
    {"name": "Numbers", "abbrev": "Num", "section": "law", "chapters": 36},
    {"name": "Deuteronomy", "abbrev": "Deut", "section": "law", "chapters": 34},
    {"name": "Joshua", "abbrev": "Josh", "section": "history", "chapters": 24},
    {"name": "Judges", "abbrev": "Judg", "section": "history", "chapters": 21},
    {"name": "Ruth", "abbrev": "Ruth", "section": "history", "chapters": 4},
    {"name": "1 Samuel", "abbrev": "1Sam", "section": "history", "chapters": 31},
    {"name": "2 Samuel", "abbrev": "2Sam", "section": "history", "chapters": 24},
    {"name": "1 Kings", "abbrev": "1Kgs", "section": "history", "chapters": 22},
    {"name": "2 Kings", "abbrev": "2Kgs", "section": "history", "chapters": 25},
    {"name": "1 Chronicles", "abbrev": "1Chr", "section": "history", "chapters": 29},
    {"name": "2 Chronicles", "abbrev": "2Chr", "section": "history", "chapters": 36},
    {"name": "Ezra", "abbrev": "Ezra", "section": "history", "chapters": 10},
    {"name": "Nehemiah", "abbrev": "Neh", "section": "history", "chapters": 13},
    {"name": "Esther", "abbrev": "Esth", "section": "history", "chapters": 10},
    {"name": "Job", "abbrev": "Job", "section": "poetry", "chapters": 42},
    {"name": "Psalms", "abbrev": "Ps", "section": "poetry", "chapters": 150},
    {"name": "Proverbs", "abbrev": "Prov", "section": "poetry", "chapters": 31},
    {"name": "Ecclesiastes", "abbrev": "Eccl", "section": "poetry", "chapters": 12},
    {"name": "Song of Solomon", "abbrev": "Song", "section": "poetry", "chapters": 8},
    {"name": "Isaiah", "abbrev": "Isa", "section": "prophets", "chapters": 66},
    {"name": "Jeremiah", "abbrev": "Jer", "section": "prophets", "chapters": 52},
    {"name": "Lamentations", "abbrev": "Lam", "section": "prophets", "chapters": 5},
    {"name": "Ezekiel", "abbrev": "Ezek", "section": "prophets", "chapters": 48},
    {"name": "Daniel", "abbrev": "Dan", "section": "prophets", "chapters": 12},
    {"name": "Hosea", "abbrev": "Hos", "section": "prophets", "chapters": 14},
    {"name": "Joel", "abbrev": "Joel", "section": "prophets", "chapters": 3},
    {"name": "Amos", "abbrev": "Amos", "section": "prophets", "chapters": 9},
    {"name": "Obadiah", "abbrev": "Obad", "section": "prophets", "chapters": 1},
    {"name": "Jonah", "abbrev": "Jonah", "section": "prophets", "chapters": 4},
    {"name": "Micah", "abbrev": "Mic", "section": "prophets", "chapters": 7},
    {"name": "Nahum", "abbrev": "Nah", "section": "prophets", "chapters": 3},
    {"name": "Habakkuk", "abbrev": "Hab", "section": "prophets", "chapters": 3},
    {"name": "Zephaniah", "abbrev": "Zeph", "section": "prophets", "chapters": 3},
    {"name": "Haggai", "abbrev": "Hag", "section": "prophets", "chapters": 2},
    {"name": "Zechariah", "abbrev": "Zech", "section": "prophets", "chapters": 14},
    {"name": "Malachi", "abbrev": "Mal", "section": "prophets", "chapters": 4},
]

NT_BOOKS = [
    {"name": "Matthew", "abbrev": "Matt", "section": "gospels", "chapters": 28},
    {"name": "Mark", "abbrev": "Mark", "section": "gospels", "chapters": 16},
    {"name": "Luke", "abbrev": "Luke", "section": "gospels", "chapters": 24},
    {"name": "John", "abbrev": "John", "section": "gospels", "chapters": 21},
    {"name": "Acts", "abbrev": "Acts", "section": "gospels", "chapters": 28},
    {"name": "Romans", "abbrev": "Rom", "section": "epistles", "chapters": 16},
    {"name": "1 Corinthians", "abbrev": "1Cor", "section": "epistles", "chapters": 16},
    {"name": "2 Corinthians", "abbrev": "2Cor", "section": "epistles", "chapters": 13},
    {"name": "Galatians", "abbrev": "Gal", "section": "epistles", "chapters": 6},
    {"name": "Ephesians", "abbrev": "Eph", "section": "epistles", "chapters": 6},
    {"name": "Philippians", "abbrev": "Phil", "section": "epistles", "chapters": 4},
    {"name": "Colossians", "abbrev": "Col", "section": "epistles", "chapters": 4},
    {"name": "1 Thessalonians", "abbrev": "1Thess", "section": "epistles", "chapters": 5},
    {"name": "2 Thessalonians", "abbrev": "2Thess", "section": "epistles", "chapters": 3},
    {"name": "1 Timothy", "abbrev": "1Tim", "section": "epistles", "chapters": 6},
    {"name": "2 Timothy", "abbrev": "2Tim", "section": "epistles", "chapters": 4},
    {"name": "Titus", "abbrev": "Titus", "section": "epistles", "chapters": 3},
    {"name": "Philemon", "abbrev": "Phlm", "section": "epistles", "chapters": 1},
    {"name": "Hebrews", "abbrev": "Heb", "section": "epistles", "chapters": 13},
    {"name": "James", "abbrev": "Jas", "section": "epistles", "chapters": 5},
    {"name": "1 Peter", "abbrev": "1Pet", "section": "epistles", "chapters": 5},
    {"name": "2 Peter", "abbrev": "2Pet", "section": "epistles", "chapters": 3},
    {"name": "1 John", "abbrev": "1John", "section": "epistles", "chapters": 5},
    {"name": "2 John", "abbrev": "2John", "section": "epistles", "chapters": 1},
    {"name": "3 John", "abbrev": "3John", "section": "epistles", "chapters": 1},
    {"name": "Jude", "abbrev": "Jude", "section": "epistles", "chapters": 1},
    {"name": "Revelation", "abbrev": "Rev", "section": "revelation", "chapters": 22},
]

# Compute X coordinates cleanly across 1000px SVG canvas
for i, b in enumerate(OT_BOOKS):
    b["x"] = round(14 + i * (500 / 38), 1)
    b["testament"] = "OT"

for i, b in enumerate(NT_BOOKS):
    b["x"] = round(540 + i * (445 / 26), 1)
    b["testament"] = "NT"

PROPHECIES = [
    # --- CATEGORY 1: BIRTH, LINEAGE & COVENANT ORIGINS (birth) ---
    {
        "id": "p1",
        "title": "The Seed of the Woman (The Protoevangelium)",
        "category": "birth",
        "categoryLabel": "Birth & Lineage",
        "type": "Typological Foreshadowing",
        "votes": 482,
        "eraGap": "c. 1400 BC → c. AD 50 (1,450 Years)",
        "ot": {
            "ref": "Genesis 3:15",
            "book": "Genesis",
            "author": "Moses",
            "context": "God's judgment against the serpent in Eden following the Fall.",
            "text": "And I will put enmity between you and the woman, and between your seed and her Seed; He shall crush your head, and you shall strike His heel.",
            "keyPhrase": "He shall crush your head, and you shall strike His heel"
        },
        "nt": {
            "ref": "Galatians 4:4; Revelation 12:5",
            "book": "Galatians",
            "author": "Paul / John",
            "context": "The Incarnation born uniquely of a woman to defeat the serpent's authority.",
            "text": "But when the fullness of the time had come, God sent forth His Son, born of a woman, born under the law, to redeem those who were under the law...",
            "keyPhrase": "God sent forth His Son, born of a woman"
        },
        "bridge": "Known historically as the 'First Gospel' (Protoevangelium). It anticipates a champion descended from Eve who suffers a painful heel wound (the Cross) while delivering a fatal head-blow to evil.",
        "keywords": ["Seed of woman", "Eden", "Crush serpent", "Incarnation"],
        "thread": "seed"
    },
    {
        "id": "p2",
        "title": "Blessing to All Nations Through Abraham's Seed",
        "category": "birth",
        "categoryLabel": "Birth & Lineage",
        "type": "Covenantal Promise",
        "votes": 519,
        "eraGap": "c. 2000 BC → c. AD 55 (2,055 Years)",
        "ot": {
            "ref": "Genesis 22:18",
            "book": "Genesis",
            "author": "Moses",
            "context": "The Abrahamic Covenant affirmed on Mount Moriah after Isaac's sparing.",
            "text": "In your seed all the nations of the earth shall be blessed, because you have obeyed My voice.",
            "keyPhrase": "In your seed all the nations of the earth shall be blessed"
        },
        "nt": {
            "ref": "Galatians 3:16; Acts 3:25",
            "book": "Galatians",
            "author": "Paul",
            "context": "Paul explaining that the singular collective noun 'Seed' culminates in Christ.",
            "text": "Now to Abraham and his Seed were the promises made. He does not say, 'And to seeds,' as of many, but as of one, 'And to your Seed,' who is Christ.",
            "keyPhrase": "And to your Seed, who is Christ"
        },
        "bridge": "God's covenant with Abraham on Mount Moriah narrows from humanity at large to one patriarchal family, fulfilled in the singular Messiah who brings Gentile nations into covenant blessing.",
        "keywords": ["Abraham", "Mount Moriah", "All nations blessed", "Seed"],
        "thread": "seed"
    },
    {
        "id": "p3",
        "title": "The Royal Scepter of Judah & Shiloh's Coming",
        "category": "birth",
        "categoryLabel": "Birth & Lineage",
        "type": "Direct Prophecy",
        "votes": 445,
        "eraGap": "c. 1850 BC → c. AD 95 (1,945 Years)",
        "ot": {
            "ref": "Genesis 49:10",
            "book": "Genesis",
            "author": "Jacob (recorded by Moses)",
            "context": "Jacob's prophetic deathbed blessing upon his twelve sons in Egypt.",
            "text": "The scepter shall not depart from Judah, nor a lawgiver from between his feet, until Shiloh comes; and to Him shall be the obedience of the people.",
            "keyPhrase": "The scepter shall not depart from Judah... until Shiloh comes"
        },
        "nt": {
            "ref": "Revelation 5:5; Luke 3:33",
            "book": "Revelation",
            "author": "John / Luke",
            "context": "The heavenly throne room vision identifying Jesus as the conquering Lion of Judah.",
            "text": "But one of the elders said to me, 'Do not weep. Behold, the Lion of the tribe of Judah, the Root of David, has prevailed to open the scroll and to loose its seven seals.'",
            "keyPhrase": "Behold, the Lion of the tribe of Judah, the Root of David"
        },
        "bridge": "Out of Jacob's twelve sons, royal sovereignty ('the scepter') was assigned specifically to Judah until the arrival of 'Shiloh' (meaning 'He to whom it belongs'), fulfilled in Jesus' Judahite lineage.",
        "keywords": ["Scepter", "Tribe of Judah", "Shiloh", "Lion of Judah"],
        "thread": "seed"
    },
    {
        "id": "p4",
        "title": "The Star Rising Out of Jacob",
        "category": "birth",
        "categoryLabel": "Birth & Lineage",
        "type": "Direct Prophecy",
        "votes": 398,
        "eraGap": "c. 1400 BC → c. 4 BC (1,400 Years)",
        "ot": {
            "ref": "Numbers 24:17",
            "book": "Numbers",
            "author": "Balaam (recorded by Moses)",
            "context": "Balaam's fourth prophetic oracle overlooking the plains of Moab.",
            "text": "I see Him, but not now; I behold Him, but not near; a Star shall come out of Jacob; a Scepter shall rise out of Israel...",
            "keyPhrase": "a Star shall come out of Jacob; a Scepter shall rise out of Israel"
        },
        "nt": {
            "ref": "Matthew 2:2; Revelation 22:16",
            "book": "Matthew",
            "author": "Matthew / John",
            "context": "Eastern Magi arriving in Jerusalem following the messianic star.",
            "text": "Where is He who has been born King of the Jews? For we have seen His star in the East and have come to worship Him. ... 'I am the Root and the Offspring of David, the Bright and Morning Star.'",
            "keyPhrase": "we have seen His star in the East and have come to worship Him"
        },
        "bridge": "Balaam, an Eastern prophet from Mesopotamia, foretold a royal 'Star out of Jacob'—a prophecy preserved in Eastern wisdom traditions that drew the Magi to Judea at Jesus' birth.",
        "keywords": ["Star of Jacob", "Balaam", "Magi", "Morning Star"],
        "thread": "seed"
    },
    {
        "id": "p5",
        "title": "The Kinsman-Redeemer in Bethlehem's Lineage",
        "category": "birth",
        "categoryLabel": "Birth & Lineage",
        "type": "Typological Foreshadowing",
        "votes": 340,
        "eraGap": "c. 1100 BC → c. AD 60 (1,160 Years)",
        "ot": {
            "ref": "Ruth 4:14-17",
            "book": "Ruth",
            "author": "Samuel (trad.)",
            "context": "Boaz redeeming Ruth in Bethlehem, establishing the royal lineage of David.",
            "text": "Then the women said to Naomi, 'Blessed be the Lord, who has not left you this day without a close relative [Go'el / Redeemer]; and may his name be famous in Israel!' ... There is a son born to Naomi; and they called his name Obed. He is the father of Jesse, the father of David.",
            "keyPhrase": "who has not left you this day without a close relative"
        },
        "nt": {
            "ref": "Matthew 1:5-6; Galatians 4:4-5",
            "book": "Matthew",
            "author": "Matthew",
            "context": "The royal genealogy of Jesus Christ explicitly highlighting Ruth and Boaz.",
            "text": "Salmon begot Boaz by Rahab, Boaz begot Obed by Ruth, Obed begot Jesse, and Jesse begot David the king.",
            "keyPhrase": "Boaz begot Obed by Ruth, Obed begot Jesse, and Jesse begot David"
        },
        "bridge": "In Hebrew law, the 'Go'el' (Kinsman-Redeemer) had to be a blood relative willing and wealthy enough to buy back lost inheritance and bride. Boaz in Bethlehem both prefigures Christ and fathers His royal line.",
        "keywords": ["Kinsman-Redeemer", "Ruth and Boaz", "Bethlehem", "Genealogy"],
        "thread": "seed"
    },
    {
        "id": "p6",
        "title": "God's Anointed King & The Horn of Salvation",
        "category": "birth",
        "categoryLabel": "Birth & Lineage",
        "type": "Typological Foreshadowing",
        "votes": 318,
        "eraGap": "c. 1050 BC → c. 4 BC (1,050 Years)",
        "ot": {
            "ref": "1 Samuel 2:10",
            "book": "1 Samuel",
            "author": "Hannah",
            "context": "Hannah's prophetic prayer at the tabernacle in Shiloh before Israel even had a king.",
            "text": "The adversaries of the Lord shall be broken in pieces; from heaven He will thunder against them. The Lord will judge the ends of the earth. He will give strength to His king, and exalt the horn of His anointed [Mashiach / Messiah].",
            "keyPhrase": "He will give strength to His king, and exalt the horn of His anointed"
        },
        "nt": {
            "ref": "Luke 1:46-55, 69",
            "book": "Luke",
            "author": "Luke (Mary's Magnificat & Zechariah)",
            "context": "Mary and Zechariah echoing Hannah's song at the announcement of Jesus' birth.",
            "text": "And has raised up a horn of salvation for us in the house of His servant David, as He spoke by the mouth of His holy prophets, who have been since the world began.",
            "keyPhrase": "raised up a horn of salvation for us in the house of His servant David"
        },
        "bridge": "Hannah's prayer in 1 Samuel 2 is the first place in Scripture where the title 'Anointed' (Messiah) refers to the coming ideal King. Mary's Magnificat and Zechariah's Benedictus directly mirror her words.",
        "keywords": ["Horn of salvation", "Hannah's prayer", "Magnificat", "Anointed King"],
        "thread": "seed"
    },
    {
        "id": "p7",
        "title": "The Eternal Davidic Throne & Sonship",
        "category": "birth",
        "categoryLabel": "Birth & Lineage",
        "type": "Covenantal Promise",
        "votes": 564,
        "eraGap": "c. 1000 BC → c. AD 30 (1,030 Years)",
        "ot": {
            "ref": "2 Samuel 7:12-16; 1 Chronicles 17:11-14",
            "book": "2 Samuel",
            "author": "Nathan the Prophet",
            "context": "The Davidic Covenant delivered to King David in Jerusalem.",
            "text": "When your days are fulfilled... I will set up your seed after you... and I will establish the throne of his kingdom forever. I will be his Father, and he shall be My son.",
            "keyPhrase": "I will establish the throne of his kingdom forever"
        },
        "nt": {
            "ref": "Luke 1:32-33; Hebrews 1:5",
            "book": "Luke",
            "author": "Luke",
            "context": "The angel Gabriel announcing Jesus' birth to Mary in Nazareth.",
            "text": "He will be great, and will be called the Son of the Highest; and the Lord God will give Him the throne of His father David. And He will reign over the house of Jacob forever, and of His kingdom there will be no end.",
            "keyPhrase": "the Lord God will give Him the throne of His father David"
        },
        "bridge": "Mortal kings die and dynasties fall, meaning God's oath to David required an immortal descendant to occupy an everlasting throne. Gabriel quotes 2 Samuel 7 directly to identify Jesus as that heir.",
        "keywords": ["Davidic Covenant", "Eternal throne", "Son of David", "Kingdom without end"],
        "thread": "seed"
    },
    {
        "id": "p8",
        "title": "The Virgin Birth & Sign of Immanuel",
        "category": "birth",
        "categoryLabel": "Birth & Lineage",
        "type": "Direct Prophecy",
        "votes": 689,
        "eraGap": "c. 734 BC → c. 4 BC (730 Years)",
        "ot": {
            "ref": "Isaiah 7:14",
            "book": "Isaiah",
            "author": "Isaiah",
            "context": "Prophecy given to the house of David during the Syro-Ephraimite crisis.",
            "text": "Therefore the Lord Himself will give you a sign: Behold, the virgin shall conceive and bear a Son, and shall call His name Immanuel.",
            "keyPhrase": "the virgin shall conceive and bear a Son, and shall call His name Immanuel"
        },
        "nt": {
            "ref": "Matthew 1:22-23",
            "book": "Matthew",
            "author": "Matthew",
            "context": "The angel explaining Mary's miraculous conception by the Holy Spirit to Joseph.",
            "text": "So all this was done that it might be fulfilled which was spoken by the Lord through the prophet, saying: 'Behold, the virgin shall be with child, and bear a Son, and they shall call His name Immanuel,' which is translated, 'God with us.'",
            "keyPhrase": "Behold, the virgin shall be with child, and bear a Son"
        },
        "bridge": "Addressed to the plural 'house of David', Isaiah's sign reaches its ultimate horizon in the virgin conception of Jesus, who embodies the literal meaning of Immanuel: 'God with us.'",
        "keywords": ["Virgin birth", "Immanuel", "God with us", "Sign"],
        "thread": "seed"
    },
    {
        "id": "p9",
        "title": "Unto Us a Child is Born, Prince of Peace",
        "category": "birth",
        "categoryLabel": "Birth & Lineage",
        "type": "Direct Prophecy",
        "votes": 642,
        "eraGap": "c. 730 BC → c. 4 BC (726 Years)",
        "ot": {
            "ref": "Isaiah 9:6-7",
            "book": "Isaiah",
            "author": "Isaiah",
            "context": "Climactic messianic oracle of the Divine King who rules on David's throne.",
            "text": "For unto us a Child is born, unto us a Son is given; and the government will be upon His shoulder. And His name will be called Wonderful, Counselor, Mighty God, Everlasting Father, Prince of Peace.",
            "keyPhrase": "For unto us a Child is born, unto us a Son is given"
        },
        "nt": {
            "ref": "Luke 2:11; John 14:27",
            "book": "Luke",
            "author": "Luke",
            "context": "Angelic proclamation to the Bethlehem shepherds on the night of the Nativity.",
            "text": "For there is born to you this day in the city of David a Savior, who is Christ the Lord.",
            "keyPhrase": "born to you this day in the city of David a Savior, who is Christ the Lord"
        },
        "bridge": "Isaiah unites human birth ('a Child is born') with divine pre-existence ('a Son is given', 'Mighty God'), laying the foundation for the New Testament doctrine of the Incarnation.",
        "keywords": ["Child is born", "Mighty God", "Prince of Peace", "Throne of David"],
        "thread": "seed"
    },
    {
        "id": "p10",
        "title": "The Shoot from the Stem of Jesse",
        "category": "birth",
        "categoryLabel": "Birth & Lineage",
        "type": "Direct Prophecy",
        "votes": 475,
        "eraGap": "c. 700 BC → c. AD 57 (757 Years)",
        "ot": {
            "ref": "Isaiah 11:1-2, 10",
            "book": "Isaiah",
            "author": "Isaiah",
            "context": "After the royal tree of David is chopped down to a stump, a new Branch sprouts.",
            "text": "There shall come forth a Rod from the stem of Jesse, and a Branch shall grow out of his roots. The Spirit of the Lord shall rest upon Him... And in that day there shall be a Root of Jesse, who shall stand as a banner to the people; for the Gentiles shall seek Him.",
            "keyPhrase": "There shall come forth a Rod from the stem of Jesse"
        },
        "nt": {
            "ref": "Romans 15:12; Matthew 3:16",
            "book": "Romans",
            "author": "Paul",
            "context": "Paul citing Isaiah 11 to prove that Christ's mission includes the Gentiles.",
            "text": "And again, Isaiah says: 'There shall be a root of Jesse; and He who shall rise to reign over the Gentiles, in Him the Gentiles shall hope.'",
            "keyPhrase": "There shall be a root of Jesse... in Him the Gentiles shall hope"
        },
        "bridge": "By calling the Messiah the 'shoot of Jesse' (David's humble father) rather than the palace of Solomon, Isaiah predicted that the royal family would return to peasant obscurity before the Messiah was born.",
        "keywords": ["Stem of Jesse", "Branch", "Sevenfold Spirit", "Gentiles hope"],
        "thread": "seed"
    },
    {
        "id": "p11",
        "title": "Born in Bethlehem Ephrathah",
        "category": "birth",
        "categoryLabel": "Birth & Lineage",
        "type": "Direct Prophecy",
        "votes": 720,
        "eraGap": "c. 700 BC → c. 4 BC (696 Years)",
        "ot": {
            "ref": "Micah 5:2",
            "book": "Micah",
            "author": "Micah",
            "context": "Prophecy contrasting proud Jerusalem with tiny Bethlehem during the Assyrian siege.",
            "text": "But you, Bethlehem Ephrathah, though you are little among the thousands of Judah, yet out of you shall come forth to Me the One to be Ruler in Israel, whose goings forth are from of old, from everlasting.",
            "keyPhrase": "out of you shall come forth to Me the One to be Ruler in Israel"
        },
        "nt": {
            "ref": "Matthew 2:1-6; John 7:42",
            "book": "Matthew",
            "author": "Matthew",
            "context": "Chief priests quoting Micah 5:2 when Herod asks where the Messiah would be born.",
            "text": "Now after Jesus was born in Bethlehem of Judea in the days of Herod the king... they said to him, 'In Bethlehem of Judea, for thus it is written by the prophet: But you, Bethlehem, in the land of Judah, are not the least...'",
            "keyPhrase": "In Bethlehem of Judea, for thus it is written by the prophet"
        },
        "bridge": "Caesar Augustus' imperial tax census moved Joseph and Mary 90 miles south from Nazareth to their ancestral village of Bethlehem just in time for Jesus' birth.",
        "keywords": ["Bethlehem", "Ephrathah", "Ruler in Israel", "From everlasting"],
        "thread": "seed"
    },
    {
        "id": "p12",
        "title": "Weeping in Ramah for the Slain Children",
        "category": "birth",
        "categoryLabel": "Birth & Lineage",
        "type": "Typological Foreshadowing",
        "votes": 388,
        "eraGap": "c. 600 BC → c. 3 BC (597 Years)",
        "ot": {
            "ref": "Jeremiah 31:15",
            "book": "Jeremiah",
            "author": "Jeremiah",
            "context": "Matriarch Rachel pictured weeping at Ramah as Judean captives are marched into exile.",
            "text": "Thus says the Lord: 'A voice was heard in Ramah, lamentation and bitter weeping, Rachel weeping for her children, refusing to be comforted for her children, because they are no more.'",
            "keyPhrase": "Rachel weeping for her children, refusing to be comforted"
        },
        "nt": {
            "ref": "Matthew 2:16-18",
            "book": "Matthew",
            "author": "Matthew",
            "context": "King Herod ordering the massacre of male infants in Bethlehem and its surrounding districts.",
            "text": "Then was fulfilled what was spoken by Jeremiah the prophet, saying: 'A voice was heard in Ramah, lamentation, weeping, and great mourning, Rachel weeping for her children...'",
            "keyPhrase": "Then was fulfilled what was spoken by Jeremiah the prophet"
        },
        "bridge": "Rachel's tomb stood near Bethlehem/Ramah. In Jeremiah 31, her grief is immediately followed by God's promise of return and the New Covenant—a pattern re-enacted at the dawn of the Messiah's life.",
        "keywords": ["Ramah", "Rachel weeping", "Herod", "Bethlehem"],
        "thread": "seed"
    },
    {
        "id": "p13",
        "title": "Flight & Return: 'Out of Egypt I Called My Son'",
        "category": "birth",
        "categoryLabel": "Birth & Lineage",
        "type": "Typological Foreshadowing",
        "votes": 465,
        "eraGap": "c. 750 BC → c. 2 BC (748 Years)",
        "ot": {
            "ref": "Hosea 11:1",
            "book": "Hosea",
            "author": "Hosea",
            "context": "Recalling God's fatherly love for Israel in delivering the nation out of Egyptian bondage.",
            "text": "When Israel was a child, I loved him, and out of Egypt I called My son.",
            "keyPhrase": "out of Egypt I called My son"
        },
        "nt": {
            "ref": "Matthew 2:14-15",
            "book": "Matthew",
            "author": "Matthew",
            "context": "Joseph taking Mary and Jesus to Egypt until Herod's death, then returning to the land of Israel.",
            "text": "When he arose, he took the young Child and His mother by night and departed for Egypt, and was there until the death of Herod, that it might be fulfilled which was spoken by the Lord through the prophet, saying, 'Out of Egypt I called My Son.'",
            "keyPhrase": "that it might be fulfilled... Out of Egypt I called My Son"
        },
        "bridge": "Classic biblical typology: Israel was God's corporate son called out of Egypt (Exod 4:22), and Jesus—the true, faithful Son—recapitulates Israel's history from Egypt through the waters of baptism into the wilderness.",
        "keywords": ["Egypt", "Called My Son", "Typology", "New Exodus"],
        "thread": "seed"
    },
    {
        "id": "p14",
        "title": "The Messenger Preparing the Lord's Highway",
        "category": "birth",
        "categoryLabel": "Birth & Lineage",
        "type": "Direct Prophecy",
        "votes": 612,
        "eraGap": "c. 700 / 430 BC → c. AD 26",
        "ot": {
            "ref": "Isaiah 40:3; Malachi 3:1",
            "book": "Malachi",
            "author": "Isaiah & Malachi",
            "context": "Closing words of the Hebrew prophets promising a forerunner before the Lord comes to His temple.",
            "text": "The voice of one crying in the wilderness: 'Prepare the way of the Lord; make straight in the desert a highway for our God.' ... 'Behold, I send My messenger, and he will prepare the way before Me.'",
            "keyPhrase": "Behold, I send My messenger, and he will prepare the way before Me"
        },
        "nt": {
            "ref": "Mark 1:2-4; Matthew 11:10",
            "book": "Mark",
            "author": "Mark / Matthew",
            "context": "John the Baptist emerging in the Judean wilderness calling the nation to repentance.",
            "text": "As it is written in the Prophets: 'Behold, I send My messenger before Your face, who will prepare Your way before You.' The voice of one crying in the wilderness: 'Prepare the way of the Lord; make His paths straight.'",
            "keyPhrase": "Prepare the way of the Lord; make His paths straight"
        },
        "bridge": "Notice the divinity implied in the cross-reference: in Isaiah 40:3 and Malachi 3:1, the highway is prepared for Yahweh Himself; in the Gospels, John prepares that road for Jesus.",
        "keywords": ["Wilderness voice", "Messenger", "John the Baptist", "Forerunner"],
        "thread": "seed"
    },
    {
        "id": "p15",
        "title": "Daniel's Seventy Weeks Timeline to Messiah the Prince",
        "category": "birth",
        "categoryLabel": "Birth & Lineage",
        "type": "Direct Prophecy",
        "votes": 540,
        "eraGap": "c. 538 BC → c. AD 30 (568 Years)",
        "ot": {
            "ref": "Daniel 9:24-26",
            "book": "Daniel",
            "author": "Daniel (via Angel Gabriel)",
            "context": "Gabriel reveals the 490-year ('seventy sevens') prophetic clock from the decree to rebuild Jerusalem.",
            "text": "Know therefore and understand, that from the going forth of the command to restore and build Jerusalem until Messiah the Prince, there shall be seven weeks and sixty-two weeks... And after the sixty-two weeks Messiah shall be cut off, but not for Himself.",
            "keyPhrase": "until Messiah the Prince... Messiah shall be cut off, but not for Himself"
        },
        "nt": {
            "ref": "Mark 1:15; Luke 19:41-44",
            "book": "Mark",
            "author": "Mark / Luke",
            "context": "Jesus announcing in AD 27-30 that the prophetic time clock has reached its fulfillment.",
            "text": "The time is fulfilled, and the kingdom of God is at hand. Repent, and believe in the gospel.",
            "keyPhrase": "The time is fulfilled, and the kingdom of God is at hand"
        },
        "bridge": "Counting 69 'weeks' of years (483 years) from the Persian decrees (Ezra 7 / Nehemiah 2) brings the chronological timeline directly to the 1st-century appearance and crucifixion ('cut off') of Jesus before the second Temple's destruction in AD 70.",
        "keywords": ["Seventy Weeks", "Messiah the Prince", "Cut off", "Time fulfilled"],
        "thread": "seed"
    },

    # --- CATEGORY 2: MINISTRY, MIRACLES & SIGNS (ministry) ---
    {
        "id": "p16",
        "title": "Great Light Dawning in Galilee of the Gentiles",
        "category": "ministry",
        "categoryLabel": "Ministry & Signs",
        "type": "Direct Prophecy",
        "votes": 495,
        "eraGap": "c. 730 BC → c. AD 28 (758 Years)",
        "ot": {
            "ref": "Isaiah 9:1-2",
            "book": "Isaiah",
            "author": "Isaiah",
            "context": "Promise that the northern tribes of Zebulun and Naphtali, first humbled by Assyria, will see glory.",
            "text": "Nevertheless the gloom will not be upon her who is distressed, as when at first He lightly esteemed the land of Zebulun and the land of Naphtali, and afterward more heavily oppressed her, by the way of the sea, beyond the Jordan, in Galilee of the Gentiles. The people who walked in darkness have seen a great light.",
            "keyPhrase": "in Galilee of the Gentiles. The people who walked in darkness have seen a great light"
        },
        "nt": {
            "ref": "Matthew 4:12-16",
            "book": "Matthew",
            "author": "Matthew",
            "context": "Jesus moving from Nazareth to Capernaum on the border of Zebulun and Naphtali.",
            "text": "And leaving Nazareth, He came and dwelt in Capernaum, which is by the sea, in the regions of Zebulun and Naphtali, that it might be fulfilled which was spoken by Isaiah the prophet...",
            "keyPhrase": "dwelt in Capernaum, which is by the sea, in the regions of Zebulun and Naphtali"
        },
        "bridge": "Rather than launching His ministry in prestigious Judea, Jesus made Capernaum in Galilee His headquarters—bringing divine light to the exact region first plunged into Assyrian darkness.",
        "keywords": ["Galilee", "Zebulun and Naphtali", "Great light", "Capernaum"],
        "thread": "seed"
    },
    {
        "id": "p17",
        "title": "Anointed to Proclaim Jubilee & Heal the Brokenhearted",
        "category": "ministry",
        "categoryLabel": "Ministry & Signs",
        "type": "Direct Quotation",
        "votes": 630,
        "eraGap": "c. 700 BC → c. AD 28 (728 Years)",
        "ot": {
            "ref": "Isaiah 61:1-2",
            "book": "Isaiah",
            "author": "Isaiah",
            "context": "The Spirit-anointed Servant proclaiming the acceptable year of the Lord's Jubilee.",
            "text": "The Spirit of the Lord God is upon Me, because the Lord has anointed Me to preach good tidings to the poor; He has sent Me to heal the brokenhearted, to proclaim liberty to the captives, and the opening of the prison to those who are bound; to proclaim the acceptable year of the Lord.",
            "keyPhrase": "The Spirit of the Lord God is upon Me, because the Lord has anointed Me"
        },
        "nt": {
            "ref": "Luke 4:16-21",
            "book": "Luke",
            "author": "Luke",
            "context": "Jesus reading from the scroll of Isaiah in the synagogue at Nazareth.",
            "text": "And He closed the book, and gave it back to the attendant and sat down. And the eyes of all who were in the synagogue were fixed on Him. And He began to say to them, 'Today this Scripture is fulfilled in your hearing.'",
            "keyPhrase": "Today this Scripture is fulfilled in your hearing"
        },
        "bridge": "Jesus stopped reading mid-sentence in Isaiah 61:2—right after 'the acceptable year of the Lord' and just before 'and the day of vengeance of our God'—distinguishing His first coming of grace from His future return in judgment.",
        "keywords": ["Jubilee", "Nazareth synagogue", "Spirit anointed", "Liberty to captives"],
        "thread": "spirit"
    },
    {
        "id": "p18",
        "title": "The Prophet Like Unto Moses",
        "category": "ministry",
        "categoryLabel": "Ministry & Signs",
        "type": "Direct Prophecy",
        "votes": 555,
        "eraGap": "c. 1400 BC → c. AD 30 (1,430 Years)",
        "ot": {
            "ref": "Deuteronomy 18:15-19",
            "book": "Deuteronomy",
            "author": "Moses",
            "context": "Moses' farewell address promising a future Prophet-Mediator who speaks God's very words.",
            "text": "The Lord your God will raise up for you a Prophet like me from your midst, from your brethren. Him you shall hear... I will put My words in His mouth, and He shall speak to them all that I command Him.",
            "keyPhrase": "The Lord your God will raise up for you a Prophet like me"
        },
        "nt": {
            "ref": "Acts 3:22-23; John 6:14",
            "book": "Acts",
            "author": "Peter / John",
            "context": "Peter preaching at Solomon's Portico in the Jerusalem Temple.",
            "text": "For Moses truly said to the fathers, 'The Lord your God will raise up for you a Prophet like me from your brethren. Him you shall hear in all things, whatever He says to you.'",
            "keyPhrase": "For Moses truly said... a Prophet like me from your brethren"
        },
        "bridge": "Like Moses, Jesus was spared from a tyrant's infanticide at birth, called out of Egypt, fasted 40 days, fed multitudes with bread in the wilderness, ascended a mountain to teach God's law, and mediated a covenant.",
        "keywords": ["Prophet like Moses", "Mediator", "Hear Him", "Transfiguration"],
        "thread": "covenant"
    },
    {
        "id": "p19",
        "title": "Miracles of Sight to the Blind & Hearing to the Deaf",
        "category": "ministry",
        "categoryLabel": "Ministry & Signs",
        "type": "Direct Prophecy",
        "votes": 512,
        "eraGap": "c. 700 BC → c. AD 29 (729 Years)",
        "ot": {
            "ref": "Isaiah 35:5-6",
            "book": "Isaiah",
            "author": "Isaiah",
            "context": "Vision of the messianic restoration when God comes to save His people.",
            "text": "Then the eyes of the blind shall be opened, and the ears of the deaf shall be unstopped. Then the lame shall leap like a deer, and the tongue of the dumb sing.",
            "keyPhrase": "the eyes of the blind shall be opened, and the ears of the deaf shall be unstopped"
        },
        "nt": {
            "ref": "Matthew 11:4-5; Mark 7:37",
            "book": "Matthew",
            "author": "Matthew",
            "context": "Jesus answering John the Baptist's messengers from prison regarding His messianic credentials.",
            "text": "Jesus answered and said to them, 'Go and tell John the things which you hear and see: The blind see and the lame walk; the lepers are cleansed and the deaf hear; the dead are raised up and the poor have the gospel preached to them.'",
            "keyPhrase": "The blind see and the lame walk; the lepers are cleansed and the deaf hear"
        },
        "bridge": "In the entire Old Testament, there is no record of a blind person receiving sight by a prophet's miracle. Isaiah 35 reserved opening blind eyes as the signature credential of the Messianic age.",
        "keywords": ["Eyes of the blind", "Lame walk", "Deaf hear", "Messianic signs"],
        "thread": "spirit"
    },
    {
        "id": "p20",
        "title": "Speaking Hidden Kingdom Truths in Parables",
        "category": "ministry",
        "categoryLabel": "Ministry & Signs",
        "type": "Direct Quotation",
        "votes": 420,
        "eraGap": "c. 950 BC → c. AD 29 (979 Years)",
        "ot": {
            "ref": "Psalm 78:2",
            "book": "Psalms",
            "author": "Asaph",
            "context": "Wisdom psalm recounting Israel's redemptive history as riddles and parables.",
            "text": "I will open my mouth in a parable; I will utter dark sayings of old, which we have heard and known, and our fathers have told us.",
            "keyPhrase": "I will open my mouth in a parable; I will utter dark sayings of old"
        },
        "nt": {
            "ref": "Matthew 13:34-35",
            "book": "Matthew",
            "author": "Matthew",
            "context": "Jesus teaching the crowds by the Sea of Galilee in parables of the Kingdom.",
            "text": "All these things Jesus spoke to the multitude in parables; and without a parable He did not speak to them, that it might be fulfilled which was spoken by the prophet, saying: 'I will open My mouth in parables; I will utter things kept secret from the foundation of the world.'",
            "keyPhrase": "I will open My mouth in parables; I will utter things kept secret"
        },
        "bridge": "Jesus used parables to simultaneously reveal Kingdom mysteries to spiritually hungry disciples and sift out hard-hearted listeners.",
        "keywords": ["Parables", "Mysteries", "Asaph", "Foundation of world"],
        "thread": "seed"
    },
    {
        "id": "p21",
        "title": "Gentle Servant Who Will Not Break a Bruised Reed",
        "category": "ministry",
        "categoryLabel": "Ministry & Signs",
        "type": "Direct Quotation",
        "votes": 462,
        "eraGap": "c. 700 BC → c. AD 29 (729 Years)",
        "ot": {
            "ref": "Isaiah 42:1-4",
            "book": "Isaiah",
            "author": "Isaiah",
            "context": "The First Servant Song introducing God's gentle, Spirit-filled Servant bringing justice to the nations.",
            "text": "Behold! My Servant whom I uphold, My Elect One in whom My soul delights! I have put My Spirit upon Him; He will bring forth justice to the Gentiles. He will not cry out, nor raise His voice... A bruised reed He will not break, and smoking flax He will not quench.",
            "keyPhrase": "A bruised reed He will not break, and smoking flax He will not quench"
        },
        "nt": {
            "ref": "Matthew 12:15-21",
            "book": "Matthew",
            "author": "Matthew",
            "context": "Jesus quietly healing the sick while avoiding political confrontation with the Pharisees.",
            "text": "Behold, My Servant whom I have chosen, My Beloved in whom My soul is well pleased! ... A bruised reed He will not break, and smoking flax He will not quench, till He sends forth justice to victory; and in His name Gentiles will trust.",
            "keyPhrase": "A bruised reed He will not break, and smoking flax He will not quench"
        },
        "bridge": "Unlike political zealots who crushed the weak in pursuit of power, Jesus tended to 'bruised reeds' and 'smoldering wicks'—the broken, outcast, and exhausted.",
        "keywords": ["Bruised reed", "Smoking flax", "Servant Song", "Gentiles trust"],
        "thread": "lamb"
    },
    {
        "id": "p22",
        "title": "The Commander of the Lord's Army",
        "category": "ministry",
        "categoryLabel": "Ministry & Signs",
        "type": "Typological Foreshadowing",
        "votes": 334,
        "eraGap": "c. 1400 BC → c. AD 95 (1,495 Years)",
        "ot": {
            "ref": "Joshua 5:13-15",
            "book": "Joshua",
            "author": "Joshua",
            "context": "Before the battle of Jericho, Joshua encounters a divine Warrior who receives worship on holy ground.",
            "text": "And He said, 'No, but as Commander of the army of the Lord I have now come.' And Joshua fell on his face to the earth and worshiped... Then the Commander of the Lord's army said to Joshua, 'Take your sandal off your foot, for the place where you stand is holy.'",
            "keyPhrase": "as Commander of the army of the Lord I have now come"
        },
        "nt": {
            "ref": "Hebrews 4:8-9; Revelation 19:11-14",
            "book": "Hebrews",
            "author": "Author of Hebrews / John",
            "context": "Christ as the true 'Joshua' (Yeshua) leading God's people into eternal rest and leading heaven's armies.",
            "text": "For if Joshua had given them rest, then He would not afterward have spoken of another day. There remains therefore a rest for the people of God. ... And the armies in heaven, clothed in fine linen, white and clean, followed Him.",
            "keyPhrase": "For if Joshua had given them rest... There remains therefore a rest"
        },
        "bridge": "The Hebrew name 'Joshua' (Yeshua) is identical to 'Jesus' in Greek (Iesous). Whereas angels strictly refuse worship (Rev 22:9), the Commander in Joshua 5 accepts worship and commands Joshua to remove his sandals just like Yahweh at the burning bush.",
        "keywords": ["Joshua / Yeshua", "Commander of Lord's army", "Holy ground", "Sabbath rest"],
        "thread": "seed"
    },
    {
        "id": "p23",
        "title": "Manna from Heaven & Water from the Struck Rock",
        "category": "ministry",
        "categoryLabel": "Ministry & Signs",
        "type": "Typological Foreshadowing",
        "votes": 528,
        "eraGap": "c. 1440 BC → c. AD 30 / 55",
        "ot": {
            "ref": "Exodus 16:15; 17:6",
            "book": "Exodus",
            "author": "Moses",
            "context": "God sustaining Israel in the wilderness with daily bread from heaven and water from the rock at Horeb.",
            "text": "And Moses said to them, 'This is the bread which the Lord has given you to eat.' ... 'Behold, I will stand before you there on the rock in Horeb; and you shall strike the rock, and water will come out of it, that the people may drink.'",
            "keyPhrase": "you shall strike the rock, and water will come out of it"
        },
        "nt": {
            "ref": "John 6:31-35; 1 Corinthians 10:3-4",
            "book": "1 Corinthians",
            "author": "Paul / John",
            "context": "Jesus declaring 'I am the Bread of Life' and Paul identifying the wilderness Rock as Christ.",
            "text": "And all ate the same spiritual food, and all drank the same spiritual drink. For they drank of that spiritual Rock that followed them, and that Rock was Christ.",
            "keyPhrase": "they drank of that spiritual Rock that followed them, and that Rock was Christ"
        },
        "bridge": "The wilderness provisions were physical shadows of spiritual realities: Christ is the true Bread from heaven, and He was struck once under the rod of Moses' Law so living water could flow to a thirsty world.",
        "keywords": ["Manna", "Bread of Life", "Rock at Horeb", "Living water"],
        "thread": "spirit"
    },
    {
        "id": "p24",
        "title": "The Bronze Serpent Lifted Up in the Wilderness",
        "category": "ministry",
        "categoryLabel": "Ministry & Signs",
        "type": "Typological Foreshadowing",
        "votes": 594,
        "eraGap": "c. 1400 BC → c. AD 30 (1,430 Years)",
        "ot": {
            "ref": "Numbers 21:8-9",
            "book": "Numbers",
            "author": "Moses",
            "context": "God commands Moses to mount a bronze serpent on a pole so anyone bitten who looks in faith lives.",
            "text": "So Moses made a bronze serpent, and put it on a pole; and so it was, if a serpent had bitten anyone, when he looked at the bronze serpent, he lived.",
            "keyPhrase": "when he looked at the bronze serpent, he lived"
        },
        "nt": {
            "ref": "John 3:14-15",
            "book": "John",
            "author": "John (Words of Jesus to Nicodemus)",
            "context": "Jesus explaining the necessity of the Cross to Nicodemus just before John 3:16.",
            "text": "And as Moses lifted up the serpent in the wilderness, even so must the Son of Man be lifted up, that whoever believes in Him should not perish but have eternal life.",
            "keyPhrase": "as Moses lifted up the serpent in the wilderness, even so must the Son of Man be lifted up"
        },
        "bridge": "Why a bronze serpent? Bronze was the biblical metal of judgment (the bronze altar), and the serpent represented the curse of sin. On the Cross, Christ became sin for us (2 Cor 5:21) so that looking to Him in faith heals the fatal venom of sin.",
        "keywords": ["Bronze serpent", "Lifted up", "Nicodemus", "Look and live"],
        "thread": "lamb"
    },
    {
        "id": "p25",
        "title": "Miracles of Elisha: Multiplying Loaves & Cleansing Naaman",
        "category": "ministry",
        "categoryLabel": "Ministry & Signs",
        "type": "Typological Foreshadowing",
        "votes": 356,
        "eraGap": "c. 850 BC → c. AD 29 (879 Years)",
        "ot": {
            "ref": "2 Kings 4:42-44; 5:14",
            "book": "2 Kings",
            "author": "Jeremiah / Royal Annalists",
            "context": "Elisha multiplying twenty barley loaves for a hundred men with leftovers, and healing Naaman the Gentile leper.",
            "text": "But his servant said, 'What? Shall I set this before one hundred men?' He said again, 'Give it to the people, that they may eat; for thus says the Lord: They shall eat and have some left over.'",
            "keyPhrase": "They shall eat and have some left over"
        },
        "nt": {
            "ref": "John 6:9-13; Luke 4:27",
            "book": "John",
            "author": "John / Luke",
            "context": "Jesus multiplying five barley loaves for five thousand men with twelve baskets left over.",
            "text": "There is a lad here who has five barley loaves and two small fish, but what are they among so many? ... So they ate and were filled, and they gathered up twelve baskets of fragments.",
            "keyPhrase": "five barley loaves and two small fish... they ate and were filled"
        },
        "bridge": "Just as Elijah (the wilderness prophet in camel hair) was followed by Elisha (whose name means 'God is salvation' and who worked miracles of grace), John the Baptist was followed by Jesus, who amplified Elisha's barley-loaf miracle on a massive scale.",
        "keywords": ["Barley loaves", "Elisha", "Feeding 5000", "Naaman"],
        "thread": "spirit"
    },
    {
        "id": "p26",
        "title": "Triumphal Entry on a Humble Donkey",
        "category": "ministry",
        "categoryLabel": "Ministry & Signs",
        "type": "Direct Prophecy",
        "votes": 675,
        "eraGap": "c. 520 BC → c. AD 33 (553 Years)",
        "ot": {
            "ref": "Zechariah 9:9",
            "book": "Zechariah",
            "author": "Zechariah",
            "context": "Post-exilic prophecy calling Jerusalem to rejoice at her righteous, humble King.",
            "text": "Rejoice greatly, O daughter of Zion! Shout, O daughter of Jerusalem! Behold, your King is coming to you; He is just and having salvation, lowly and riding on a donkey, a colt, the foal of a donkey.",
            "keyPhrase": "Behold, your King is coming to you... lowly and riding on a donkey"
        },
        "nt": {
            "ref": "Matthew 21:4-5; John 12:14-15",
            "book": "Matthew",
            "author": "Matthew / John",
            "context": "Palm Sunday: Jesus entering Jerusalem on an unbroken donkey colt to cries of Hosanna.",
            "text": "All this was done that it might be fulfilled which was spoken by the prophet, saying: 'Tell the daughter of Zion, Behold, your King is coming to you, lowly, and sitting on a donkey, a colt, the foal of a donkey.'",
            "keyPhrase": "Behold, your King is coming to you, lowly, and sitting on a donkey"
        },
        "bridge": "Earthly conquerors entered cities on war stallions; in ancient Israel, kings rode donkeys when coming in peace (1 Kings 1:33). Jesus deliberately enacted Zechariah 9:9 to declare the nature of His Kingdom.",
        "keywords": ["Triumphal Entry", "Palm Sunday", "Daughter of Zion", "Donkey colt"],
        "thread": "seed"
    },
    {
        "id": "p27",
        "title": "Zeal for the Father's House & Children's Praise in the Temple",
        "category": "ministry",
        "categoryLabel": "Ministry & Signs",
        "type": "Direct Quotation",
        "votes": 448,
        "eraGap": "c. 1000 BC → c. AD 30-33 (1,030 Years)",
        "ot": {
            "ref": "Psalm 69:9; Psalm 8:2",
            "book": "Psalms",
            "author": "David",
            "context": "David's passion for the purity of God's sanctuary and praise rising from infants.",
            "text": "Because zeal for Your house has eaten me up... Out of the mouth of babes and nursing infants You have ordained strength [praise], because of Your enemies.",
            "keyPhrase": "zeal for Your house has eaten me up"
        },
        "nt": {
            "ref": "John 2:17; Matthew 21:15-16",
            "book": "John",
            "author": "John / Matthew",
            "context": "Jesus cleansing the Temple courts and defending the children crying 'Hosanna to the Son of David!'",
            "text": "Then His disciples remembered that it was written, 'Zeal for Your house has eaten Me up.' ... And Jesus said to them, 'Yes. Have you never read, Out of the mouth of babes and nursing infants You have perfected praise?'",
            "keyPhrase": "Zeal for Your house has eaten Me up"
        },
        "bridge": "When the chief priests objected to children praising Jesus as the Son of David in the Temple courts, Jesus quoted Psalm 8:2—where the praise is directed to Yahweh—applying it directly to Himself.",
        "keywords": ["Cleansing Temple", "Zeal for house", "Children's praise", "Psalm 8"],
        "thread": "temple"
    },

    # --- CATEGORY 3: PASSION, BETRAYAL & CRUCIFIXION (passion) ---
    {
        "id": "p28",
        "title": "Betrayed by a Trusted Friend Who Shared Bread",
        "category": "passion",
        "categoryLabel": "Passion & Crucifixion",
        "type": "Typological Foreshadowing",
        "votes": 508,
        "eraGap": "c. 1000 BC → c. AD 33 (1,033 Years)",
        "ot": {
            "ref": "Psalm 41:9; Psalm 55:12-14",
            "book": "Psalms",
            "author": "David",
            "context": "David lamenting the treason of his inner-circle advisor Ahithophel.",
            "text": "Even my own familiar friend in whom I trusted, who ate my bread, has lifted up his heel against me.",
            "keyPhrase": "who ate my bread, has lifted up his heel against me"
        },
        "nt": {
            "ref": "John 13:18, 26",
            "book": "John",
            "author": "John",
            "context": "The Last Supper: Jesus handing the dipped morsel of bread to Judas Iscariot.",
            "text": "I do not speak concerning all of you. I know whom I have chosen; but that the Scripture may be fulfilled, 'He who eats bread with Me has lifted up his heel against Me.'",
            "keyPhrase": "He who eats bread with Me has lifted up his heel against Me"
        },
        "bridge": "In ancient Near Eastern culture, sharing bread at table was a sacred pledge of loyalty. Just as David's counselor Ahithophel betrayed him and later hanged himself (2 Sam 17:23), Judas shared Jesus' bread before betraying Him.",
        "keywords": ["Judas Iscariot", "Ahithophel", "Shared bread", "Last Supper"],
        "thread": "lamb"
    },
    {
        "id": "p29",
        "title": "Sold for Thirty Pieces of Silver & Thrown to the Potter",
        "category": "passion",
        "categoryLabel": "Passion & Crucifixion",
        "type": "Direct Prophecy",
        "votes": 684,
        "eraGap": "c. 520 BC → c. AD 33 (553 Years)",
        "ot": {
            "ref": "Zechariah 11:12-13",
            "book": "Zechariah",
            "author": "Zechariah",
            "context": "The Good Shepherd valued at the price of a gored slave (30 shekels) and the silver cast into the Temple for the potter.",
            "text": "So they weighed out for my wages thirty pieces of silver. And the Lord said to me, 'Throw it to the potter'—that princely price they set on me. So I took the thirty pieces of silver and threw them into the house of the Lord for the potter.",
            "keyPhrase": "thirty pieces of silver and threw them into the house of the Lord for the potter"
        },
        "nt": {
            "ref": "Matthew 26:15; 27:3-10",
            "book": "Matthew",
            "author": "Matthew",
            "context": "Judas hurling the 30 silver coins into the Temple sanctuary, which the priests use to buy the potter's field.",
            "text": "Then he threw down the pieces of silver in the temple and departed... And they consulted together and bought with them the potter's field, to bury strangers in.",
            "keyPhrase": "threw down the pieces of silver in the temple... bought with them the potter's field"
        },
        "bridge": "Four distinct details converge here: (1) the exact price of 30 silver pieces, (2) paid by the nation's leaders, (3) thrown down inside the house of the Lord, and (4) used for the potter.",
        "keywords": ["Thirty pieces of silver", "Potter's field", "Temple sanctuary", "Good Shepherd"],
        "thread": "lamb"
    },
    {
        "id": "p30",
        "title": "Strike the Shepherd and the Sheep Will Be Scattered",
        "category": "passion",
        "categoryLabel": "Passion & Crucifixion",
        "type": "Direct Quotation",
        "votes": 518,
        "eraGap": "c. 520 BC → c. AD 33 (553 Years)",
        "ot": {
            "ref": "Zechariah 13:7",
            "book": "Zechariah",
            "author": "Zechariah",
            "context": "Prophetic command for the sword to strike the Lord's Shepherd, scattering the flock.",
            "text": "'Awake, O sword, against My Shepherd, against the Man who is My Companion,' says the Lord of hosts. 'Strike the Shepherd, and the sheep will be scattered.'",
            "keyPhrase": "Strike the Shepherd, and the sheep will be scattered"
        },
        "nt": {
            "ref": "Matthew 26:31, 56; Mark 14:27",
            "book": "Mark",
            "author": "Mark / Matthew",
            "context": "On the walk to Gethsemane, Jesus warns the disciples that they will all flee at His arrest.",
            "text": "Then Jesus said to them, 'All of you will be made to stumble because of Me this night, for it is written: I will strike the Shepherd, and the sheep will be scattered.' ... Then all the disciples forsook Him and fled.",
            "keyPhrase": "I will strike the Shepherd, and the sheep will be scattered"
        },
        "bridge": "Notice how Yahweh calls the stricken Shepherd 'the Man who is My Companion [My Equal]' in Zechariah 13:7—pointing to the mystery of Christ's shared divine nature and His substitutionary death.",
        "keywords": ["Strike the Shepherd", "Sheep scattered", "Gethsemane", "Disciples fled"],
        "thread": "lamb"
    },
    {
        "id": "p31",
        "title": "Silent as a Lamb Before Its Shearers",
        "category": "passion",
        "categoryLabel": "Passion & Crucifixion",
        "type": "Direct Prophecy",
        "votes": 660,
        "eraGap": "c. 700 BC → c. AD 33 (733 Years)",
        "ot": {
            "ref": "Isaiah 53:7",
            "book": "Isaiah",
            "author": "Isaiah",
            "context": "The Suffering Servant submitting willingly without self-defense.",
            "text": "He was oppressed and He was afflicted, yet He opened not His mouth; He was led as a lamb to the slaughter, and as a sheep before its shearers is silent, so He opened not His mouth.",
            "keyPhrase": "He was led as a lamb to the slaughter... so He opened not His mouth"
        },
        "nt": {
            "ref": "Matthew 27:12-14; Acts 8:32-35; 1 Peter 2:23",
            "book": "Acts",
            "author": "Luke / Matthew / Peter",
            "context": "Jesus remaining silent before Caiaphas, Herod Antipas, and Pilate; the Ethiopian eunuch reading Isaiah 53.",
            "text": "And while He was being accused by the chief priests and elders, He answered nothing... But He answered him not one word, so that the governor marveled greatly.",
            "keyPhrase": "He answered him not one word, so that the governor marveled greatly"
        },
        "bridge": "This was the exact verse the Ethiopian eunuch was reading in his chariot in Acts 8 when Philip explained the Gospel to him, showing how central Isaiah 53 was to the earliest Christian preaching.",
        "keywords": ["Silent Lamb", "Trial before Pilate", "Ethiopian eunuch", "Isaiah 53"],
        "thread": "lamb"
    },
    {
        "id": "p32",
        "title": "Beaten, Spat Upon & Beard Plucked",
        "category": "passion",
        "categoryLabel": "Passion & Crucifixion",
        "type": "Direct Prophecy",
        "votes": 548,
        "eraGap": "c. 700 / 500 BC → c. AD 33",
        "ot": {
            "ref": "Isaiah 50:6; Micah 5:1",
            "book": "Isaiah",
            "author": "Isaiah & Micah",
            "context": "The Third Servant Song describing physical abuse endured without retaliation.",
            "text": "I gave My back to those who struck Me, and My cheeks to those who plucked out the beard; I did not hide My face from shame and spitting. ... They will strike the judge of Israel with a rod on the cheek.",
            "keyPhrase": "I did not hide My face from shame and spitting"
        },
        "nt": {
            "ref": "Matthew 26:67; 27:26, 30",
            "book": "Matthew",
            "author": "Matthew",
            "context": "Sanhedrin guards and Roman soldiers scourging, spitting on, and striking Jesus with a reed.",
            "text": "Then they spat in His face and beat Him; and others struck Him with the palms of their hands... And they spat on Him, and took the reed and struck Him on the head.",
            "keyPhrase": "they spat on Him, and took the reed and struck Him on the head"
        },
        "bridge": "Three chapters before Isaiah 53, Isaiah 50:6 gives a first-person portrait of the Servant willingly surrendering His back to the scourge and His face to spitting.",
        "keywords": ["Scourging", "Spitting", "Struck with reed", "Suffering Servant"],
        "thread": "lamb"
    },
    {
        "id": "p33",
        "title": "Pierced Hands and Feet (Crucifixion Prefigured)",
        "category": "passion",
        "categoryLabel": "Passion & Crucifixion",
        "type": "Direct Prophecy",
        "votes": 790,
        "eraGap": "c. 1000 BC → c. AD 33 (1,033 Years)",
        "ot": {
            "ref": "Psalm 22:16",
            "book": "Psalms",
            "author": "David",
            "context": "David's graphic depiction of an execution by piercing—written centuries before Rome existed.",
            "text": "For dogs have surrounded Me; the congregation of the wicked has enclosed Me. They pierced My hands and My feet.",
            "keyPhrase": "They pierced My hands and My feet"
        },
        "nt": {
            "ref": "John 20:25-27; Luke 24:39-40",
            "book": "John",
            "author": "John / Luke",
            "context": "The risen Jesus showing His nail-pierced hands and feet to Thomas and the disciples.",
            "text": "Then He said to Thomas, 'Reach your finger here, and look at My hands; and reach your hand here, and put it into My side. Do not be unbelieving, but believing.'",
            "keyPhrase": "Reach your finger here, and look at My hands"
        },
        "bridge": "Confirmed by the Dead Sea Scrolls (Nahal Hever scroll reading 'ka'aru'—'they pierced'), Psalm 22 describes dehydration, dislocated joints, mocked prayers, and pierced hands and feet centuries before Roman crucifixion was invented.",
        "keywords": ["Pierced hands and feet", "Psalm 22", "Dead Sea Scrolls", "Crucifixion"],
        "thread": "lamb"
    },
    {
        "id": "p34",
        "title": "Dividing Garments & Casting Lots for His Tunic",
        "category": "passion",
        "categoryLabel": "Passion & Crucifixion",
        "type": "Direct Prophecy",
        "votes": 715,
        "eraGap": "c. 1000 BC → c. AD 33 (1,033 Years)",
        "ot": {
            "ref": "Psalm 22:18",
            "book": "Psalms",
            "author": "David",
            "context": "Executioners dividing the sufferer's outer clothes while gambling for his inner garment.",
            "text": "They divide My garments among them, and for My clothing they cast lots.",
            "keyPhrase": "They divide My garments among them, and for My clothing they cast lots"
        },
        "nt": {
            "ref": "John 19:23-24",
            "book": "John",
            "author": "John (Eyewitness at the Cross)",
            "context": "Four Roman soldiers dividing Jesus' outer cloak into four parts, then rolling dice for His seamless tunic.",
            "text": "They said therefore among themselves, 'Let us not tear it, but cast lots for it, whose it shall be,' that the Scripture might be fulfilled which says: 'They divided My garments among them, and for My clothing they cast lots.'",
            "keyPhrase": "Let us not tear it, but cast lots for it, whose it shall be"
        },
        "bridge": "John points out that the soldiers both 'divided' the outer garments AND 'cast lots' for the seamless inner tunic—fulfilling both halves of the Hebrew poetic parallelism in Psalm 22:18.",
        "keywords": ["Casting lots", "Seamless tunic", "Roman soldiers", "Psalm 22:18"],
        "thread": "lamb"
    },
    {
        "id": "p35",
        "title": "Pierced for Our Transgressions & Numbered with Transgressors",
        "category": "passion",
        "categoryLabel": "Passion & Crucifixion",
        "type": "Direct Prophecy",
        "votes": 845,
        "eraGap": "c. 700 BC → c. AD 33 (733 Years)",
        "ot": {
            "ref": "Isaiah 53:5-6, 12",
            "book": "Isaiah",
            "author": "Isaiah",
            "context": "The heart of the Fourth Servant Song explaining substitutionary atonement and intercession for sinners.",
            "text": "But He was wounded for our transgressions, He was bruised for our iniquities; the chastisement for our peace was upon Him, and by His stripes we are healed... And He was numbered with the transgressors, and He bore the sin of many, and made intercession for the transgressors.",
            "keyPhrase": "He was wounded for our transgressions, He was bruised for our iniquities"
        },
        "nt": {
            "ref": "1 Peter 2:24; Mark 15:27-28; Luke 23:34",
            "book": "1 Peter",
            "author": "Peter / Mark / Luke",
            "context": "Jesus crucified between two criminals while praying 'Father, forgive them' and bearing humanity's sin.",
            "text": "who Himself bore our sins in His own body on the tree, that we, having died to sins, might live for righteousness—by whose stripes you were healed.",
            "keyPhrase": "who Himself bore our sins in His own body on the tree... by whose stripes you were healed"
        },
        "bridge": "Crucified between two thieves ('numbered with the transgressors') and praying 'Father, forgive them' ('made intercession for the transgressors'), Jesus fulfilled every phrase of Isaiah 53.",
        "keywords": ["Substitutionary atonement", "By His stripes", "Two thieves", "Father forgive them"],
        "thread": "lamb"
    },
    {
        "id": "p36",
        "title": "Forsaken Cry & Mocked at the Cross ('Let God Deliver Him!')",
        "category": "passion",
        "categoryLabel": "Passion & Crucifixion",
        "type": "Direct Quotation",
        "votes": 692,
        "eraGap": "c. 1000 BC → c. AD 33 (1,033 Years)",
        "ot": {
            "ref": "Psalm 22:1, 7-8",
            "book": "Psalms",
            "author": "David",
            "context": "Opening cry of Psalm 22 and the exact taunts of the bystanders shaking their heads.",
            "text": "My God, My God, why have You forsaken Me? ... All those who see Me ridicule Me; they shoot out the lip, they shake the head, saying, 'He trusted in the Lord, let Him rescue Him; let Him deliver Him, since He delights in Him!'",
            "keyPhrase": "My God, My God, why have You forsaken Me?"
        },
        "nt": {
            "ref": "Matthew 27:39-46",
            "book": "Matthew",
            "author": "Matthew",
            "context": "Passersby shaking their heads, chief priests mocking, and Jesus crying out the opening line of Psalm 22.",
            "text": "And those who passed by blasphemed Him, wagging their heads... Likewise the chief priests also, mocking with the scribes and elders, said, 'He trusted in God; let Him deliver Him now if He will have Him!' ... And about the ninth hour Jesus cried out: 'Eli, Eli, lama sabachthani?'",
            "keyPhrase": "Eli, Eli, lama sabachthani? that is, My God, My God, why have You forsaken Me?"
        },
        "bridge": "In the 1st century before chapter-and-verse numbers existed, quoting the first line of a psalm invoked the entire psalm—which ends in Psalm 22:27-31 with all the families of the nations worshiping the Lord and the final words: 'He has done this!' ('It is finished!').",
        "keywords": ["Eli Eli lama sabachthani", "Mockers shaking heads", "Psalm 22:1", "It is finished"],
        "thread": "lamb"
    },
    {
        "id": "p37",
        "title": "Offered Gall and Sour Wine (Vinegar) for His Thirst",
        "category": "passion",
        "categoryLabel": "Passion & Crucifixion",
        "type": "Direct Prophecy",
        "votes": 580,
        "eraGap": "c. 1000 BC → c. AD 33 (1,033 Years)",
        "ot": {
            "ref": "Psalm 69:21",
            "book": "Psalms",
            "author": "David",
            "context": "The righteous sufferer given bitter gall and sour vinegar in his parched agony.",
            "text": "They also gave me gall for my food, and for my thirst they gave me vinegar to drink.",
            "keyPhrase": "for my thirst they gave me vinegar to drink"
        },
        "nt": {
            "ref": "John 19:28-30; Matthew 27:34",
            "book": "John",
            "author": "John",
            "context": "Soldiers lifting a sponge soaked in sour wine on a hyssop stalk to Jesus' lips.",
            "text": "After this, Jesus, knowing that all things were now accomplished, that the Scripture might be fulfilled, said, 'I thirst!' Now a vessel full of sour wine was sitting there; and they filled a sponge with sour wine, put it on hyssop, and put it to His mouth.",
            "keyPhrase": "that the Scripture might be fulfilled, said, I thirst!"
        },
        "bridge": "Notice the detail of the 'hyssop' stalk in John 19:29—the exact plant used in Exodus 12:22 to apply the Passover lamb's blood to the doorposts.",
        "keywords": ["Vinegar", "Gall", "I thirst", "Hyssop stalk"],
        "thread": "lamb"
    },
    {
        "id": "p38",
        "title": "Not a Bone Broken & They Will Look on Him Whom They Pierced",
        "category": "passion",
        "categoryLabel": "Passion & Crucifixion",
        "type": "Direct Prophecy",
        "votes": 742,
        "eraGap": "c. 1440 / 520 BC → c. AD 33",
        "ot": {
            "ref": "Exodus 12:46; Psalm 34:20; Zechariah 12:10",
            "book": "Zechariah",
            "author": "Moses, David & Zechariah",
            "context": "The Passover lamb must have no broken bones; Yahweh declares 'they will look on Me whom they pierced.'",
            "text": "Nor shall you break one of its bones. (Exod 12:46) ... And I will pour on the house of David and on the inhabitants of Jerusalem the Spirit of grace and supplication; then they will look on Me whom they pierced. Yes, they will mourn for Him as one mourns for his only son. (Zech 12:10)",
            "keyPhrase": "then they will look on Me whom they pierced"
        },
        "nt": {
            "ref": "John 19:33-37; Revelation 1:7",
            "book": "John",
            "author": "John",
            "context": "Roman soldiers refrain from breaking Jesus' legs, piercing His side with a spear instead.",
            "text": "For these things were done that the Scripture should be fulfilled, 'Not one of His bones shall be broken.' And again another Scripture says, 'They shall look on Him whom they pierced.'",
            "keyPhrase": "Not one of His bones shall be broken... They shall look on Him whom they pierced"
        },
        "bridge": "In Zechariah 12:10, it is God Himself speaking ('they will look on ME whom they pierced'), yet in the next clause they mourn for 'HIM as an only son'—a remarkable Old Testament window into the Trinity.",
        "keywords": ["No bones broken", "Look on Him whom they pierced", "Passover Lamb", "Spear"],
        "thread": "lamb"
    },
    {
        "id": "p39",
        "title": "Darkness at Noon on the Day of Crucifixion",
        "category": "passion",
        "categoryLabel": "Passion & Crucifixion",
        "type": "Typological Foreshadowing",
        "votes": 438,
        "eraGap": "c. 760 BC → c. AD 33 (793 Years)",
        "ot": {
            "ref": "Amos 8:9",
            "book": "Amos",
            "author": "Amos",
            "context": "Prophecy of the sun going down at noon and the earth darkened in broad daylight, paired with mourning for an 'only son'.",
            "text": "'And it shall come to pass in that day,' says the Lord God, 'that I will make the sun go down at noon, and I will darken the earth in broad daylight... I will make it like the mourning for an only son.'",
            "keyPhrase": "I will make the sun go down at noon, and I will darken the earth in broad daylight"
        },
        "nt": {
            "ref": "Matthew 27:45; Luke 23:44-45",
            "book": "Luke",
            "author": "Luke / Matthew",
            "context": "Three hours of supernatural darkness covering the land from the sixth hour (noon) until the ninth hour (3 PM).",
            "text": "Now it was about the sixth hour, and there was darkness over all the earth until the ninth hour. Then the sun was darkened, and the veil of the temple was torn in two.",
            "keyPhrase": "it was about the sixth hour, and there was darkness over all the earth until the ninth hour"
        },
        "bridge": "Passover always occurs at a full moon (when a natural solar eclipse is astronomically impossible). The three hours of darkness from noon to 3 PM echoed both the ninth plague of Egypt (Exod 10:22) and Amos 8:9-10.",
        "keywords": ["Darkness at noon", "Amos 8:9", "Sixth hour", "Mourning for only son"],
        "thread": "lamb"
    },
    {
        "id": "p40",
        "title": "Buried in a Rich Man's Tomb",
        "category": "passion",
        "categoryLabel": "Passion & Crucifixion",
        "type": "Direct Prophecy",
        "votes": 615,
        "eraGap": "c. 700 BC → c. AD 33 (733 Years)",
        "ot": {
            "ref": "Isaiah 53:9",
            "book": "Isaiah",
            "author": "Isaiah",
            "context": "Assigned a grave with criminals, yet placed with the rich in His death.",
            "text": "And they made His grave with the wicked—but with the rich at His death, because He had done no violence, nor was any deceit in His mouth.",
            "keyPhrase": "made His grave with the wicked—but with the rich at His death"
        },
        "nt": {
            "ref": "Matthew 27:57-60",
            "book": "Matthew",
            "author": "Matthew",
            "context": "Joseph of Arimathea, a wealthy member of the council, laying Jesus in his own newly hewn rock tomb.",
            "text": "Now when evening had come, there came a rich man from Arimathea, named Joseph, who himself had also become a disciple of Jesus... and laid it in his new tomb which he had hewn out of the rock.",
            "keyPhrase": "there came a rich man from Arimathea, named Joseph... laid it in his new tomb"
        },
        "bridge": "Crucified victims were normally left on crosses or thrown into common criminal pits. Joseph of Arimathea's bold petition to Pilate placed Jesus into a costly, guarded garden tomb.",
        "keywords": ["Rich man's tomb", "Joseph of Arimathea", "Isaiah 53:9", "Burial"],
        "thread": "lamb"
    },

    # --- CATEGORY 4: RESURRECTION, ASCENSION & ETERNAL REIGN (resurrection) ---
    {
        "id": "p41",
        "title": "The Holy One Will Not See Bodily Decay (The Resurrection)",
        "category": "resurrection",
        "categoryLabel": "Resurrection & Reign",
        "type": "Direct Prophecy",
        "votes": 768,
        "eraGap": "c. 1000 BC → c. AD 33 (1,033 Years)",
        "ot": {
            "ref": "Psalm 16:9-11",
            "book": "Psalms",
            "author": "David",
            "context": "David's golden psalm declaring that God will not abandon His Holy One to Sheol or allow His flesh to decay.",
            "text": "Therefore my heart is glad, and my glory rejoices; my flesh also will rest in hope. For You will not leave my soul in Sheol, nor will You allow Your Holy One to see corruption.",
            "keyPhrase": "You will not leave my soul in Sheol, nor will You allow Your Holy One to see corruption"
        },
        "nt": {
            "ref": "Acts 2:25-32; 13:35-37",
            "book": "Acts",
            "author": "Peter & Paul (Recorded by Luke)",
            "context": "Peter's Pentecost sermon in Jerusalem and Paul's synagogue sermon in Pisidian Antioch.",
            "text": "he, foreseeing this, spoke concerning the resurrection of the Christ, that His soul was not left in Hades, nor did His flesh see corruption. This Jesus God has raised up, of which we are all witnesses.",
            "keyPhrase": "spoke concerning the resurrection of the Christ... nor did His flesh see corruption"
        },
        "bridge": "Both Peter (Acts 2) and Paul (Acts 13) point out that King David died, was buried, and his body decayed—proving that Psalm 16:10 was a direct prophecy of the Messiah rising before bodily decay set in.",
        "keywords": ["Resurrection", "No corruption", "Psalm 16", "Pentecost sermon"],
        "thread": "priest"
    },
    {
        "id": "p42",
        "title": "The Sign of Jonah & Third-Day Resurrection",
        "category": "resurrection",
        "categoryLabel": "Resurrection & Reign",
        "type": "Typological Foreshadowing",
        "votes": 625,
        "eraGap": "c. 760 BC → c. AD 33 (793 Years)",
        "ot": {
            "ref": "Jonah 1:17; Hosea 6:2",
            "book": "Jonah",
            "author": "Jonah & Hosea",
            "context": "Jonah entombed three days in the depths of the sea; Hosea's promise of third-day raising.",
            "text": "And Jonah was in the belly of the fish three days and three nights. (Jonah 1:17) ... After two days He will revive us; on the third day He will raise us up, that we may live in His sight. (Hosea 6:2)",
            "keyPhrase": "three days and three nights... on the third day He will raise us up"
        },
        "nt": {
            "ref": "Matthew 12:39-40; 1 Corinthians 15:4",
            "book": "Matthew",
            "author": "Matthew / Paul",
            "context": "Jesus giving the Sign of Jonah as the ultimate proof of His authority.",
            "text": "For as Jonah was three days and three nights in the belly of the great fish, so will the Son of Man be three days and three nights in the heart of the earth. ... that He was buried, and that He rose again the third day according to the Scriptures.",
            "keyPhrase": "so will the Son of Man be three days and three nights in the heart of the earth"
        },
        "bridge": "Jonah descended into the jaws of death to calm the storm of wrath for the sailors on the boat, then emerged alive on the third day to bring repentance to the Gentile nations—a vivid blueprint of Christ's death and resurrection.",
        "keywords": ["Sign of Jonah", "Third day", "Hosea 6:2", "Resurrection"],
        "thread": "priest"
    },
    {
        "id": "p43",
        "title": "I Know That My Redeemer Lives (Bodily Resurrection)",
        "category": "resurrection",
        "categoryLabel": "Resurrection & Reign",
        "type": "Direct Prophecy",
        "votes": 542,
        "eraGap": "c. 2000 BC → c. AD 55 (2,055 Years)",
        "ot": {
            "ref": "Job 19:25-27",
            "book": "Job",
            "author": "Job",
            "context": "At the lowest point of his suffering, Job declares his faith in a living Kinsman-Redeemer standing on the earth.",
            "text": "For I know that my Redeemer lives, and He shall stand at last on the earth; and after my skin is destroyed, this I know, that in my flesh I shall see God.",
            "keyPhrase": "For I know that my Redeemer lives, and He shall stand at last on the earth"
        },
        "nt": {
            "ref": "1 Corinthians 15:20, 52-54; 1 Thessalonians 4:16",
            "book": "1 Thessalonians",
            "author": "Paul",
            "context": "Paul explaining the bodily resurrection of believers at the return of the living Redeemer.",
            "text": "For the Lord Himself will descend from heaven with a shout, with the voice of an archangel, and with the trumpet of God. And the dead in Christ will rise first.",
            "keyPhrase": "the Lord Himself will descend from heaven... and the dead in Christ will rise"
        },
        "bridge": "Often considered the oldest book in the Bible, Job reaches across millennia to proclaim both a living Redeemer ('Go'el') who stands upon the dust of the earth and the physical resurrection of the body.",
        "keywords": ["Redeemer lives", "Job 19:25", "Bodily resurrection", "See God in flesh"],
        "thread": "priest"
    },
    {
        "id": "p44",
        "title": "The Stone the Builders Rejected Becomes the Cornerstone",
        "category": "resurrection",
        "categoryLabel": "Resurrection & Reign",
        "type": "Direct Quotation",
        "votes": 670,
        "eraGap": "c. 950 BC → c. AD 33 (983 Years)",
        "ot": {
            "ref": "Psalm 118:22-23; Isaiah 28:16",
            "book": "Psalms",
            "author": "Psalmist & Isaiah",
            "context": "Passover Hallel psalm celebrating the rejected stone exalted to the chief place.",
            "text": "The stone which the builders rejected has become the chief cornerstone. This was the Lord's doing; it is marvelous in our eyes.",
            "keyPhrase": "The stone which the builders rejected has become the chief cornerstone"
        },
        "nt": {
            "ref": "Acts 4:11; Matthew 21:42; 1 Peter 2:6-7",
            "book": "Acts",
            "author": "Peter / Matthew",
            "context": "Peter standing before the very Sanhedrin that condemned Jesus days earlier.",
            "text": "This is the stone which was rejected by you builders, which has become the chief cornerstone. Nor is there salvation in any other, for there is no other name under heaven given among men by which we must be saved.",
            "keyPhrase": "This is the stone which was rejected by you builders, which has become the chief cornerstone"
        },
        "bridge": "Quoted by Jesus, Peter, and Paul, Psalm 118:22 explains the central paradox of the Gospel: how Israel's official religious 'builders' could condemn the Messiah, and how God overturned their verdict by raising Him from the dead.",
        "keywords": ["Cornerstone", "Rejected stone", "Psalm 118", "Living Stone"],
        "thread": "temple"
    },
    {
        "id": "p45",
        "title": "Seated at God's Right Hand & Priest Forever Like Melchizedek",
        "category": "resurrection",
        "categoryLabel": "Resurrection & Reign",
        "type": "Direct Quotation",
        "votes": 810,
        "eraGap": "c. 1000 BC → c. AD 33-65",
        "ot": {
            "ref": "Psalm 110:1, 4; Genesis 14:18",
            "book": "Psalms",
            "author": "David",
            "context": "The single most quoted Old Testament chapter in the New Testament: David's Lord enthroned as eternal Priest-King.",
            "text": "The Lord said to my Lord, 'Sit at My right hand, till I make Your enemies Your footstool.' ... The Lord has sworn and will not relent, 'You are a priest forever according to the order of Melchizedek.'",
            "keyPhrase": "Sit at My right hand... You are a priest forever according to the order of Melchizedek"
        },
        "nt": {
            "ref": "Hebrews 7:17-25; 10:12-13; Acts 2:34-36",
            "book": "Hebrews",
            "author": "Author of Hebrews / Peter",
            "context": "Explaining Jesus' ascension to the Father's right hand and His royal priesthood.",
            "text": "But this Man, after He had offered one sacrifice for sins forever, sat down at the right hand of God, from that time waiting till His enemies are made His footstool. ... Therefore He is also able to save to the uttermost those who come to God through Him, since He always lives to make intercession for them.",
            "keyPhrase": "offered one sacrifice for sins forever, sat down at the right hand of God"
        },
        "bridge": "In the earthly tabernacle there were no chairs—Levitical priests stood continually because their work was never finished. Christ offered one perfect sacrifice and 'sat down' at God's right hand as our eternal Melchizedek Priest-King.",
        "keywords": ["Psalm 110", "Right hand of God", "Melchizedek", "Priest-King"],
        "thread": "priest"
    },
    {
        "id": "p46",
        "title": "Ascended on High & Giving Gifts to Men",
        "category": "resurrection",
        "categoryLabel": "Resurrection & Reign",
        "type": "Direct Quotation",
        "votes": 480,
        "eraGap": "c. 1000 BC → c. AD 60 (1,060 Years)",
        "ot": {
            "ref": "Psalm 68:18",
            "book": "Psalms",
            "author": "David",
            "context": "Triumphal procession of God ascending His holy mountain after routing His foes.",
            "text": "You have ascended on high, You have led captivity captive; You have received gifts among men, even from the rebellious, that the Lord God might dwell there.",
            "keyPhrase": "You have ascended on high, You have led captivity captive"
        },
        "nt": {
            "ref": "Ephesians 4:8-10",
            "book": "Ephesians",
            "author": "Paul",
            "context": "Paul connecting Christ's bodily ascension with His distribution of spiritual gifts to build up the Church.",
            "text": "Therefore He says: 'When He ascended on high, He led captivity captive, and gave gifts to men.' ... He who descended is also the One who ascended far above all the heavens, that He might fill all things.",
            "keyPhrase": "When He ascended on high, He led captivity captive, and gave gifts to men"
        },
        "bridge": "Like a victorious ancient king ascending his capital mount and distributing spoils to his citizens, the risen Christ ascended above the heavens and poured out spiritual gifts upon His body, the Church.",
        "keywords": ["Ascension", "Led captivity captive", "Spiritual gifts", "Ephesians 4"],
        "thread": "priest"
    },
    {
        "id": "p47",
        "title": "The Son of Man Coming on the Clouds with Everlasting Dominion",
        "category": "resurrection",
        "categoryLabel": "Resurrection & Reign",
        "type": "Direct Prophecy",
        "votes": 735,
        "eraGap": "c. 550 BC → c. AD 33-95",
        "ot": {
            "ref": "Daniel 7:13-14",
            "book": "Daniel",
            "author": "Daniel",
            "context": "Vision of 'One like the Son of Man' riding the clouds to the Ancient of Days and receiving universal worship.",
            "text": "I was watching in the night visions, and behold, One like the Son of Man, coming with the clouds of heaven! He came to the Ancient of Days... Then to Him was given dominion and glory and a kingdom, that all peoples, nations, and languages should serve Him.",
            "keyPhrase": "One like the Son of Man, coming with the clouds of heaven"
        },
        "nt": {
            "ref": "Matthew 26:64; Revelation 1:7, 13",
            "book": "Matthew",
            "author": "Matthew / John",
            "context": "Jesus' favorite self-title ('Son of Man') climaxing at His trial before Caiaphas and in Revelation.",
            "text": "Jesus said to him, 'It is as you said. Nevertheless, I say to you, hereafter you will see the Son of Man sitting at the right hand of the Power, and coming on the clouds of heaven.'",
            "keyPhrase": "you will see the Son of Man sitting at the right hand of the Power, and coming on the clouds"
        },
        "bridge": "Many assume 'Son of Man' merely refers to Jesus' humanity. In reality, it is a direct claim to Daniel 7:13—the divine-human figure who rides the clouds of heaven and receives the worship of all nations.",
        "keywords": ["Son of Man", "Clouds of heaven", "Ancient of Days", "Daniel 7"],
        "thread": "seed"
    },
    {
        "id": "p48",
        "title": "Death Swallowed Up in Victory",
        "category": "resurrection",
        "categoryLabel": "Resurrection & Reign",
        "type": "Direct Quotation",
        "votes": 648,
        "eraGap": "c. 700 BC → c. AD 55 (755 Years)",
        "ot": {
            "ref": "Isaiah 25:8; Hosea 13:14",
            "book": "Isaiah",
            "author": "Isaiah & Hosea",
            "context": "Prophecy of the cosmic banquet on God's mountain where the shroud of death is destroyed forever.",
            "text": "He will swallow up death forever, and the Lord God will wipe away tears from all faces... (Isa 25:8) O Death, I will be your plagues! O Grave, I will be your destruction! (Hos 13:14)",
            "keyPhrase": "He will swallow up death forever, and the Lord God will wipe away tears from all faces"
        },
        "nt": {
            "ref": "1 Corinthians 15:54-55; Revelation 21:4",
            "book": "1 Corinthians",
            "author": "Paul / John",
            "context": "The climax of the resurrection chapter in 1 Corinthians 15 and the New Jerusalem in Revelation 21.",
            "text": "Then shall be brought to pass the saying that is written: 'Death is swallowed up in victory. O Death, where is your sting? O Hades, where is your victory?'",
            "keyPhrase": "Death is swallowed up in victory. O Death, where is your sting?"
        },
        "bridge": "Paul weaves Isaiah 25:8 and Hosea 13:14 into a single victory anthem over the grave, while John quotes the second half of Isaiah 25:8 ('wipe away every tear') in Revelation 21:4.",
        "keywords": ["Death swallowed up", "Where is your sting", "Wipe away tears", "Resurrection victory"],
        "thread": "creation"
    },
    {
        "id": "p49",
        "title": "Every Knee Shall Bow and Every Tongue Confess",
        "category": "resurrection",
        "categoryLabel": "Resurrection & Reign",
        "type": "Direct Quotation",
        "votes": 688,
        "eraGap": "c. 700 BC → c. AD 62 (762 Years)",
        "ot": {
            "ref": "Isaiah 45:22-23",
            "book": "Isaiah",
            "author": "Isaiah",
            "context": "The most fiercely monotheistic speech in the Old Testament: Yahweh declares there is no other God besides Him.",
            "text": "Look to Me, and be saved, all you ends of the earth! For I am God, and there is no other. I have sworn by Myself; the word has gone out of My mouth in righteousness, and shall not return, that to Me every knee shall bow, every tongue shall take an oath.",
            "keyPhrase": "that to Me every knee shall bow, every tongue shall take an oath"
        },
        "nt": {
            "ref": "Philippians 2:9-11; Romans 14:11",
            "book": "Philippians",
            "author": "Paul",
            "context": "The Christ Hymn celebrating Jesus' exaltation after humbling Himself to the death of the Cross.",
            "text": "Therefore God also has highly exalted Him and given Him the name which is above every name, that at the name of Jesus every knee should bow, of those in heaven, and of those on earth, and of those under the earth, and that every tongue should confess that Jesus Christ is Lord.",
            "keyPhrase": "that at the name of Jesus every knee should bow... and every tongue should confess"
        },
        "bridge": "In Isaiah 45:23, Yahweh swears that every knee will bow exclusively to Him. In Philippians 2:10-11, Paul applies that exact monotheistic text to the risen Jesus, identifying 'Jesus Christ is Lord' with the divine name YHWH.",
        "keywords": ["Every knee bow", "Every tongue confess", "Jesus is Lord", "Philippians 2"],
        "thread": "priest"
    },

    # --- CATEGORY 5: COVENANTS, SPIRIT, WISDOM & WHOLE-BIBLE ARCS (covenant) ---
    # Ensuring ALL remaining books of the 66 books are richly represented!
    {
        "id": "p50",
        "title": "The Day of Atonement (Yom Kippur) & Entering Behind the Veil",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Typological Foreshadowing",
        "votes": 610,
        "eraGap": "c. 1440 BC → c. AD 65 (1,505 Years)",
        "ot": {
            "ref": "Leviticus 16:15, 21-22",
            "book": "Leviticus",
            "author": "Moses",
            "context": "Once a year, the High Priest enters the Holy of Holies with blood and lays Israel's sins on the scapegoat.",
            "text": "Then he shall kill the goat of the sin offering, which is for the people, bring its blood inside the veil... and Aaron shall lay both his hands on the head of the live goat, confess over it all the iniquities of the children of Israel... and the goat shall bear on itself all their iniquities.",
            "keyPhrase": "bring its blood inside the veil... bear on itself all their iniquities"
        },
        "nt": {
            "ref": "Hebrews 9:11-12, 24; Matthew 27:51",
            "book": "Hebrews",
            "author": "Author of Hebrews",
            "context": "Christ entering the heavenly sanctuary once for all with His own blood as the Temple veil tears in two.",
            "text": "Not with the blood of goats and calves, but with His own blood He entered the Most Holy Place once for all, having obtained eternal redemption.",
            "keyPhrase": "with His own blood He entered the Most Holy Place once for all"
        },
        "bridge": "Leviticus 16 is the architectural key to the Cross: Christ is simultaneously the Great High Priest, the slain goat whose blood cleanses the sanctuary, and the scapegoat carrying our sins 'outside the camp' (Heb 13:11-12).",
        "keywords": ["Day of Atonement", "Yom Kippur", "Veil torn", "Holy of Holies"],
        "thread": "temple"
    },
    {
        "id": "p51",
        "title": "The New Covenant Written on the Heart",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Covenantal Promise",
        "votes": 730,
        "eraGap": "c. 600 BC → c. AD 33 (633 Years)",
        "ot": {
            "ref": "Jeremiah 31:31-34",
            "book": "Jeremiah",
            "author": "Jeremiah",
            "context": "Promise of a New Covenant offering internal transformation and complete forgiveness of sins.",
            "text": "Behold, the days are coming, says the Lord, when I will make a new covenant with the house of Israel and with the house of Judah... I will put My law in their minds, and write it on their hearts... For I will forgive their iniquity, and their sin I will remember no more.",
            "keyPhrase": "I will make a new covenant... write it on their hearts"
        },
        "nt": {
            "ref": "Luke 22:20; Hebrews 8:8-12; 2 Corinthians 3:3",
            "book": "2 Corinthians",
            "author": "Luke / Hebrews / Paul",
            "context": "Jesus instituting the New Covenant in His blood at the Last Supper; Paul describing Spirit-written hearts.",
            "text": "Likewise He also took the cup after supper, saying, 'This cup is the new covenant in My blood, which is shed for you.' ... written not with ink but by the Spirit of the living God, not on tablets of stone but on tablets of flesh, that is, of the heart.",
            "keyPhrase": "This cup is the new covenant in My blood"
        },
        "bridge": "The Sinai Covenant gave an external standard on stone tablets but could not change the human heart; the New Covenant enacted by Jesus' blood writes God's desires within us by the Spirit.",
        "keywords": ["New Covenant", "Jeremiah 31", "Written on hearts", "Cup of the Covenant"],
        "thread": "covenant"
    },
    {
        "id": "p52",
        "title": "A New Heart and My Spirit Within You",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Covenantal Promise",
        "votes": 665,
        "eraGap": "c. 585 BC → c. AD 30 (615 Years)",
        "ot": {
            "ref": "Ezekiel 36:25-27; 34:23",
            "book": "Ezekiel",
            "author": "Ezekiel",
            "context": "God promising to cleanse His exiled people with clean water, replace their heart of stone, and place His Spirit within them.",
            "text": "Then I will sprinkle clean water on you, and you shall be clean... I will give you a new heart and put a new spirit within you; I will take the heart of stone out of your flesh and give you a heart of flesh. I will put My Spirit within you.",
            "keyPhrase": "I will give you a new heart and put a new spirit within you"
        },
        "nt": {
            "ref": "John 3:5-8; Titus 3:5",
            "book": "Titus",
            "author": "John / Paul",
            "context": "Jesus explaining the new birth of 'water and the Spirit' to Nicodemus; Paul describing regeneration in Titus.",
            "text": "Not by works of righteousness which we have done, but according to His mercy He saved us, through the washing of regeneration and renewing of the Holy Spirit.",
            "keyPhrase": "through the washing of regeneration and renewing of the Holy Spirit"
        },
        "bridge": "When Jesus asked Nicodemus in John 3:10, 'Are you the teacher of Israel, and do not know these things?', He was pointing directly to Ezekiel 36:25-27—the promise of cleansing water and the indwelling Spirit.",
        "keywords": ["New heart", "Water and Spirit", "Born again", "Regeneration"],
        "thread": "spirit"
    },
    {
        "id": "p53",
        "title": "The Outpouring of the Holy Spirit on All Flesh",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Direct Prophecy",
        "votes": 698,
        "eraGap": "c. 800 BC → c. AD 33 (833 Years)",
        "ot": {
            "ref": "Joel 2:28-32",
            "book": "Joel",
            "author": "Joel",
            "context": "Prophecy that God will pour out His Spirit beyond kings and prophets onto sons, daughters, and servants.",
            "text": "And it shall come to pass afterward that I will pour out My Spirit on all flesh; your sons and your daughters shall prophesy... And it shall come to pass that whoever calls on the name of the Lord shall be saved.",
            "keyPhrase": "I will pour out My Spirit on all flesh... whoever calls on the name of the Lord shall be saved"
        },
        "nt": {
            "ref": "Acts 2:16-21; Romans 10:13",
            "book": "Acts",
            "author": "Peter (Recorded by Luke) / Paul",
            "context": "Day of Pentecost in Jerusalem as the Holy Spirit descends upon the disciples.",
            "text": "But this is what was spoken by the prophet Joel: 'And it shall come to pass in the last days, says God, that I will pour out of My Spirit on all flesh...' And it shall come to pass that whoever calls on the name of the Lord shall be saved.",
            "keyPhrase": "this is what was spoken by the prophet Joel: I will pour out of My Spirit on all flesh"
        },
        "bridge": "In the Old Testament, the Spirit came upon select leaders for specific tasks. Joel foretold the democratized outpouring of the Spirit upon all believers—fulfilled on Pentecost and linked to calling on the name of Jesus (Rom 10:9-13).",
        "keywords": ["Pentecost", "Joel 2", "Pour out My Spirit", "Call on the Lord"],
        "thread": "spirit"
    },
    {
        "id": "p54",
        "title": "The Just Shall Live by His Faith",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Direct Quotation",
        "votes": 685,
        "eraGap": "c. 605 BC → c. AD 57 (662 Years)",
        "ot": {
            "ref": "Habakkuk 2:4",
            "book": "Habakkuk",
            "author": "Habakkuk",
            "context": "God's answer to Habakkuk on the watchtower as Babylonian judgment approaches.",
            "text": "Behold the proud, his soul is not upright in him; but the just shall live by his faith.",
            "keyPhrase": "but the just shall live by his faith"
        },
        "nt": {
            "ref": "Romans 1:17; Galatians 3:11; Hebrews 10:38",
            "book": "Romans",
            "author": "Paul / Author of Hebrews",
            "context": "The thesis statement of the Epistle to the Romans and the cornerstone of justification by faith.",
            "text": "For in it the righteousness of God is revealed from faith to faith; as it is written, 'The just shall live by faith.'",
            "keyPhrase": "as it is written, The just shall live by faith"
        },
        "bridge": "Three different New Testament books quote this single seven-word Hebrew sentence from Habakkuk: Romans emphasizes 'THE JUST' (how one is declared righteous), Galatians emphasizes 'BY FAITH' (not law), and Hebrews emphasizes 'SHALL LIVE' (persevering endurance).",
        "keywords": ["Justification by faith", "Habakkuk 2:4", "Romans 1:17", "Righteousness"],
        "thread": "covenant"
    },
    {
        "id": "p55",
        "title": "Rebuilding David's Fallen Tent to Include All Nations",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Direct Quotation",
        "votes": 412,
        "eraGap": "c. 760 BC → c. AD 49 (809 Years)",
        "ot": {
            "ref": "Amos 9:11-12",
            "book": "Amos",
            "author": "Amos",
            "context": "Closing promise of Amos that God will raise up the fallen booth of David so the Gentiles called by His name may seek Him.",
            "text": "'On that day I will raise up the tabernacle of David, which has fallen down... that they may possess the remnant of Edom, and all the Gentiles who are called by My name,' says the Lord who does this thing.",
            "keyPhrase": "I will raise up the tabernacle of David... and all the Gentiles who are called by My name"
        },
        "nt": {
            "ref": "Acts 15:15-18",
            "book": "James",
            "author": "James (at the Jerusalem Council)",
            "context": "James citing Amos 9 at the Jerusalem Council to confirm that Gentiles are saved by grace without becoming Jewish proselytes.",
            "text": "And with this the words of the prophets agree, just as it is written: 'After this I will return and will rebuild the tabernacle of David, which has fallen down... so that the rest of mankind may seek the Lord, even all the Gentiles who are called by My name.'",
            "keyPhrase": "so that the rest of mankind may seek the Lord, even all the Gentiles"
        },
        "bridge": "At the pivotal Jerusalem Council (Acts 15), James uses Amos 9:11-12 (in its Septuagint rendering) to prove that God's plan all along was for Gentiles to be welcomed directly into the Messianic family as Gentiles.",
        "keywords": ["Tabernacle of David", "Jerusalem Council", "Gentiles included", "Amos 9"],
        "thread": "covenant"
    },
    {
        "id": "p56",
        "title": "The Glory of the Latter Temple & Desire of All Nations",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Direct Prophecy",
        "votes": 456,
        "eraGap": "c. 520 BC → c. AD 30-65",
        "ot": {
            "ref": "Haggai 2:6-9",
            "book": "Haggai",
            "author": "Haggai",
            "context": "Encouraging builders who wept over the modest Second Temple that its future glory would surpass Solomon's.",
            "text": "'I will shake heaven and earth... and they shall come to the Desire of All Nations, and I will fill this temple with glory,' says the Lord of hosts. ... 'The glory of this latter temple shall be greater than the former... and in this place I will give peace.'",
            "keyPhrase": "The glory of this latter temple shall be greater than the former"
        },
        "nt": {
            "ref": "Luke 2:27-32; Hebrews 12:26-28; John 2:19-21",
            "book": "Hebrews",
            "author": "Luke / Hebrews / John",
            "context": "Jesus Himself walking in the Second Temple and Simeon holding the infant Messiah in its courts.",
            "text": "Lord, now You are letting Your servant depart in peace... For my eyes have seen Your salvation which You have prepared before the face of all peoples, a light to bring revelation to the Gentiles, and the glory of Your people Israel.",
            "keyPhrase": "my eyes have seen Your salvation... and the glory of Your people Israel"
        },
        "bridge": "The Second Temple lacked the Ark of the Covenant and the Shekinah cloud that filled Solomon's Temple—yet its glory surpassed the first because the incarnate Son of God personally taught and was presented within its courts.",
        "keywords": ["Second Temple", "Haggai 2", "Greater glory", "Simeon"],
        "thread": "temple"
    },
    {
        "id": "p57",
        "title": "Divine Wisdom Present at Creation",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Typological Foreshadowing",
        "votes": 562,
        "eraGap": "c. 950 BC → c. AD 60-90",
        "ot": {
            "ref": "Proverbs 8:22-31; 30:4",
            "book": "Proverbs",
            "author": "Solomon & Agur",
            "context": "Wisdom personified beside the Lord as master craftsman at creation; Agur asking 'What is His name, and what is His Son's name?'",
            "text": "When He prepared the heavens, I was there... Then I was beside Him as a master craftsman; and I was daily His delight, rejoicing always before Him. (Prov 8:27,30) ... Who has established all the ends of the earth? What is His name, and what is His Son's name, if you know? (Prov 30:4)",
            "keyPhrase": "What is His name, and what is His Son's name, if you know?"
        },
        "nt": {
            "ref": "Colossians 1:15-17; 1 Corinthians 1:24; John 1:1-3",
            "book": "Colossians",
            "author": "Paul / John",
            "context": "Christ proclaimed as the Wisdom of God and the Agent through whom all things were created.",
            "text": "He is the image of the invisible God, the firstborn over all creation. For by Him all things were created that are in heaven and that are on earth, visible and invisible... All things were created through Him and for Him.",
            "keyPhrase": "For by Him all things were created that are in heaven and that are on earth"
        },
        "bridge": "The New Testament identifies the personified Wisdom (Chokmah / Sophia) of Proverbs 8 and the creative Word (Logos) of Genesis 1 with Jesus Christ, in whom 'are hidden all the treasures of wisdom and knowledge' (Col 2:3).",
        "keywords": ["Wisdom of God", "Master craftsman", "Colossians 1", "Logos"],
        "thread": "creation"
    },
    {
        "id": "p58",
        "title": "Solomon's Temple Prayer for the Foreigner & House of Prayer",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Direct Quotation",
        "votes": 418,
        "eraGap": "c. 960 BC → c. AD 33",
        "ot": {
            "ref": "1 Kings 8:41-43; 2 Chronicles 6:32-33; Isaiah 56:7",
            "book": "1 Kings",
            "author": "Solomon & Isaiah",
            "context": "At the dedication of the First Temple, Solomon prays that foreigners from distant lands will come to know God's name.",
            "text": "Moreover, concerning a foreigner, who is not of Your people Israel, but has come from a far country for Your name's sake... hear in heaven Your dwelling place, and do according to all for which the foreigner calls to You, that all peoples of the earth may know Your name.",
            "keyPhrase": "that all peoples of the earth may know Your name"
        },
        "nt": {
            "ref": "Mark 11:17; Ephesians 2:13-22",
            "book": "Ephesians",
            "author": "Mark / Paul",
            "context": "Jesus clearing the Court of the Gentiles and Paul declaring Gentiles fellow citizens of God's household.",
            "text": "Then He taught, saying to them, 'Is it not written, My house shall be called a house of prayer for all nations?' ... In whom the whole building, being fitted together, grows into a holy temple in the Lord.",
            "keyPhrase": "My house shall be called a house of prayer for all nations"
        },
        "bridge": "When vendors crowded the outer Court of the Gentiles with cattle and money tables, they blocked the very place Solomon had dedicated for the nations to pray—explaining Jesus' righteous indignation.",
        "keywords": ["House of prayer", "All nations", "Solomon's Temple", "Court of Gentiles"],
        "thread": "temple"
    },
    {
        "id": "p59",
        "title": "The Bridegroom and the Bride (The Royal Wedding Song)",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Typological Foreshadowing",
        "votes": 385,
        "eraGap": "c. 950 BC → c. AD 55-95",
        "ot": {
            "ref": "Song of Solomon 2:4, 16; Psalm 45:6-7",
            "book": "Song of Solomon",
            "author": "Solomon",
            "context": "Covenant love poetry celebrating the devotion between the royal Bridegroom and His beloved Bride.",
            "text": "He brought me to the banqueting house, and his banner over me was love... My beloved is mine, and I am his.",
            "keyPhrase": "his banner over me was love... My beloved is mine, and I am his"
        },
        "nt": {
            "ref": "Ephesians 5:25-32; Revelation 19:7-9",
            "book": "Revelation",
            "author": "Paul / John",
            "context": "Marriage revealed as a living mystery pointing to Christ the Bridegroom and the Church as His Bride.",
            "text": "Let us be glad and rejoice and give Him glory, for the marriage of the Lamb has come, and His wife has made herself ready... 'This is a great mystery, but I speak concerning Christ and the church.'",
            "keyPhrase": "the marriage of the Lamb has come, and His wife has made herself ready"
        },
        "bridge": "Scripture begins with a human wedding in a garden (Genesis 2), celebrates covenant love in the Song of Songs, and culminates in the Marriage Supper of the Lamb in a garden-city (Revelation 19-22).",
        "keywords": ["Bridegroom", "Marriage of the Lamb", "Song of Solomon", "Bride of Christ"],
        "thread": "creation"
    },
    {
        "id": "p60",
        "title": "Creation Subjected to Vanity & Longing for Redemption",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Thematic Parallel",
        "votes": 362,
        "eraGap": "c. 935 BC → c. AD 57 (992 Years)",
        "ot": {
            "ref": "Ecclesiastes 1:2; 12:13-14",
            "book": "Ecclesiastes",
            "author": "Solomon (Qoheleth)",
            "context": "The Preacher diagnosing the futility ('hevel' / vanity) of life 'under the sun' apart from eternal redemption.",
            "text": "'Vanity of vanities,' says the Preacher; 'Vanity of vanities, all is vanity.' ... For God will bring every work into judgment, including every secret thing, whether good or evil.",
            "keyPhrase": "Vanity of vanities, all is vanity... God will bring every work into judgment"
        },
        "nt": {
            "ref": "Romans 8:20-21; 1 Corinthians 15:58",
            "book": "Romans",
            "author": "Paul",
            "context": "Paul using the exact Greek word from the Septuagint of Ecclesiastes ('mataiotes' / futility) to explain how the Resurrection breaks the curse.",
            "text": "For the creation was subjected to futility [vanity], not willingly, but because of Him who subjected it in hope; because the creation itself also will be delivered from the bondage of corruption into the glorious liberty of the children of God.",
            "keyPhrase": "the creation was subjected to futility... in hope"
        },
        "bridge": "In the Greek Old Testament (Septuagint), Ecclesiastes' refrain is 'mataiotes' (futility/vanity). Paul directly answers Qoheleth: creation was subjected to 'mataiotes' after the Fall, but in Christ our labor is 'not in vain in the Lord' (1 Cor 15:58).",
        "keywords": ["Vanity / Futility", "Ecclesiastes", "Romans 8", "Redemption of creation"],
        "thread": "creation"
    },
    {
        "id": "p61",
        "title": "Deliverers Raised Up by the Spirit & Strength Out of Weakness",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Typological Foreshadowing",
        "votes": 348,
        "eraGap": "c. 1200 BC → c. AD 65",
        "ot": {
            "ref": "Judges 2:16; 6:12; 16:30",
            "book": "Judges",
            "author": "Samuel (trad.)",
            "context": "God repeatedly raising up Spirit-empowered deliverers (Gideon, Barak, Samson) whose flaws point to the need for a sinless Savior-King.",
            "text": "Nevertheless, the Lord raised up judges who delivered them out of the hand of those who plundered them... And Samson said, 'Let me die with the Philistines!' So the dead that he killed at his death were more than he had killed in his life.",
            "keyPhrase": "the Lord raised up judges who delivered them"
        },
        "nt": {
            "ref": "Hebrews 11:32-34; Hebrews 2:14",
            "book": "Hebrews",
            "author": "Author of Hebrews",
            "context": "The Hall of Faith celebrating how imperfect deliverers conquered through faith, pointing to Jesus who destroyed death by dying.",
            "text": "And what more shall I say? For the time would fail me to tell of Gideon and Barak and Samson and Jephthah... who through faith subdued kingdoms, worked righteousness, obtained promises... out of weakness were made strong.",
            "keyPhrase": "Gideon and Barak and Samson and Jephthah... out of weakness were made strong"
        },
        "bridge": "Every deliverer in Judges provides a partial shadow: Gideon conquers with a tiny remnant, and Samson defeats the enemy's house through his own outstretched arms in death—fulfilled infinitely better by Christ.",
        "keywords": ["Judges", "Hall of Faith", "Deliverer", "Victory through death"],
        "thread": "seed"
    },
    {
        "id": "p62",
        "title": "Return from Exile, Rebuilding the Walls & The Water of the Word",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Typological Foreshadowing",
        "votes": 342,
        "eraGap": "c. 538 / 445 BC → c. AD 60-95",
        "ot": {
            "ref": "Ezra 1:1-3; Nehemiah 8:8; 9:6",
            "book": "Ezra",
            "author": "Ezra & Nehemiah",
            "context": "Cyrus' decree to rebuild the House of God in Jerusalem, and Ezra reading the Book of the Law distinctly so the people understand.",
            "text": "So they read distinctly from the book, in the Law of God; and they gave the sense, and helped them to understand the reading. (Neh 8:8) ... You alone are the Lord; You have made heaven, the heaven of heavens, with all their host. (Neh 9:6)",
            "keyPhrase": "they gave the sense, and helped them to understand the reading"
        },
        "nt": {
            "ref": "Luke 24:45; 1 Peter 2:5; Revelation 21:12",
            "book": "Nehemiah",
            "author": "Luke / Peter / John",
            "context": "The risen Jesus opening the minds of the disciples to understand the Scriptures, and the Church built as living stones.",
            "text": "And He opened their understanding, that they might comprehend the Scriptures. (Luke 24:45) ... you also, as living stones, are being built up a spiritual house. (1 Pet 2:5)",
            "keyPhrase": "He opened their understanding, that they might comprehend the Scriptures"
        },
        "bridge": "Ezra and Nehemiah restored the temple, the covenant community, and the city walls of Jerusalem after Babylonian captivity—preparing the historical stage in Judea for the arrival of the Messiah according to Daniel's 70 weeks.",
        "keywords": ["Ezra and Nehemiah", "Rebuilding Jerusalem", "Understanding Scripture", "Living stones"],
        "thread": "temple"
    },
    {
        "id": "p63",
        "title": "For Such a Time as This: Royal Intercession Saving the Covenant People",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Typological Foreshadowing",
        "votes": 390,
        "eraGap": "c. 473 BC → c. AD 33-65",
        "ot": {
            "ref": "Esther 4:14-16; 8:6",
            "book": "Esther",
            "author": "Mordecai (trad.)",
            "context": "Queen Esther risking her life to enter the king's inner court unbidden to save her people from Haman's decree of annihilation.",
            "text": "Yet who knows whether you have come to the kingdom for such a time as this? ... 'And so I will go to the king, which is against the law; and if I perish, I perish!'",
            "keyPhrase": "who knows whether you have come to the kingdom for such a time as this?"
        },
        "nt": {
            "ref": "Hebrews 4:16; Romans 8:34; Galatians 3:13",
            "book": "Esther",
            "author": "Author of Hebrews / Paul",
            "context": "Christ our royal Mediator who did not merely risk perishing, but laid down His life to reverse the decree of death and grant us bold access to the throne of grace.",
            "text": "Let us therefore come boldly to the throne of grace, that we may obtain mercy and find grace to help in time of need.",
            "keyPhrase": "Let us therefore come boldly to the throne of grace"
        },
        "bridge": "Had Haman succeeded in exterminating the Jewish people in Persia, the Messianic line of David would have been extinguished five centuries before Bethlehem. God's hidden providence in Esther preserved the promise.",
        "keywords": ["Esther", "Royal intercessor", "Throne of grace", "Preservation of line"],
        "thread": "seed"
    },
    {
        "id": "p64",
        "title": "Lamentations Over Fallen Jerusalem & Mercies New Every Morning",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Thematic Parallel",
        "votes": 405,
        "eraGap": "c. 586 BC → c. AD 33",
        "ot": {
            "ref": "Lamentations 2:15; 3:22-23, 30",
            "book": "Lamentations",
            "author": "Jeremiah",
            "context": "Jeremiah weeping over Jerusalem's destruction while anchoring hope in God's unfailing compassions.",
            "text": "All who pass by clap their hands at you; they hiss and shake their heads at the daughter of Jerusalem... Through the Lord's mercies we are not consumed, because His compassions fail not. They are new every morning; great is Your faithfulness.",
            "keyPhrase": "Through the Lord's mercies we are not consumed, because His compassions fail not"
        },
        "nt": {
            "ref": "Luke 19:41-44; Matthew 27:39; 2 Timothy 2:13",
            "book": "2 Timothy",
            "author": "Luke / Matthew / Paul",
            "context": "Jesus weeping over Jerusalem on Palm Sunday; passersby shaking their heads at the Cross; God remaining faithful.",
            "text": "Now as He drew near, He saw the city and wept over it, saying, 'If you had known, even you, especially in this your day, the things that make for your peace!' ... If we are faithless, He remains faithful; He cannot deny Himself.",
            "keyPhrase": "He saw the city and wept over it"
        },
        "bridge": "Jeremiah, the 'weeping prophet' over Jerusalem (Lamentations), prefigures Jesus weeping over the same city on the Mount of Olives and bearing the mockery of passersby shaking their heads (Lam 2:15 → Matt 27:39).",
        "keywords": ["Weeping over Jerusalem", "Lamentations", "Great is Your faithfulness", "2 Timothy"],
        "thread": "lamb"
    },
    {
        "id": "p65",
        "title": "The Kingdom Shall Be the Lord's & Judgment on Pride",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Direct Prophecy",
        "votes": 330,
        "eraGap": "c. 586 / 650 BC → c. AD 95",
        "ot": {
            "ref": "Obadiah 1:15, 21; Nahum 1:7, 15",
            "book": "Obadiah",
            "author": "Obadiah & Nahum",
            "context": "Oracles against Edom and Nineveh proclaiming the Day of the Lord, the feet of the gospel messenger, and the Lord's final reign.",
            "text": "Then saviors [deliverers] shall come to Mount Zion to judge the mountains of Esau, and the kingdom shall be the Lord's. (Obad 1:21) ... Behold, on the mountains the feet of him who brings good tidings, who proclaims peace! (Nah 1:15)",
            "keyPhrase": "and the kingdom shall be the Lord's"
        },
        "nt": {
            "ref": "Revelation 11:15; Romans 10:15; 2 Timothy 2:19",
            "book": "Nahum",
            "author": "John / Paul",
            "context": "The seventh trumpet in Revelation proclaiming that the kingdoms of this world have become the kingdom of our Lord and of His Christ.",
            "text": "Then the seventh angel sounded: And there were loud voices in heaven, saying, 'The kingdoms of this world have become the kingdoms of our Lord and of His Christ, and He shall reign forever and ever!'",
            "keyPhrase": "The kingdoms of this world have become the kingdoms of our Lord and of His Christ"
        },
        "bridge": "Obadiah's closing climax ('and the kingdom shall be the Lord's') and Nahum's herald ('Behold on the mountains the feet of him who brings good tidings, who proclaims peace', echoing Isa 52:7) find their fulfillment in the Gospel and the reign of Christ.",
        "keywords": ["Kingdom is the Lord's", "Obadiah 21", "Nahum 1:15", "Feet of gospel messenger"],
        "thread": "creation"
    },
    {
        "id": "p66",
        "title": "The Lord Singing Over His Redeemed Bride in Zion",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Direct Prophecy",
        "votes": 440,
        "eraGap": "c. 630 BC → c. AD 30-95",
        "ot": {
            "ref": "Zephaniah 3:14-17; 3:9",
            "book": "Zephaniah",
            "author": "Zephaniah",
            "context": "After the purifying judgment of the Day of the Lord, God Himself rejoices over His people with singing.",
            "text": "The Lord your God in your midst, the Mighty One, will save; He will rejoice over you with gladness, He will quiet you with His love, He will rejoice over you with singing.",
            "keyPhrase": "The Lord your God in your midst, the Mighty One, will save"
        },
        "nt": {
            "ref": "John 12:15; Hebrews 2:12; Revelation 21:3",
            "book": "Revelation",
            "author": "John / Author of Hebrews",
            "context": "God dwelling in the midst of His redeemed people, rejoicing over them and wiping away all fear.",
            "text": "Behold, the tabernacle of God is with men, and He will dwell with them, and they shall be His people. God Himself will be with them and be their God.",
            "keyPhrase": "Behold, the tabernacle of God is with men, and He will dwell with them"
        },
        "bridge": "Zephaniah 3:14-17 is one of the most tender portraits of God in the Hebrew prophets: the Mighty Warrior ('Gibbor') who saves His people, dwells in their midst, and sings over them with joy.",
        "keywords": ["Zephaniah 3:17", "God in your midst", "Rejoice with singing", "Tabernacle of God"],
        "thread": "temple"
    },
    {
        "id": "p67",
        "title": "The Sun of Righteousness Rising with Healing in His Wings",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Direct Prophecy",
        "votes": 530,
        "eraGap": "c. 430 BC → c. 4 BC - AD 95",
        "ot": {
            "ref": "Malachi 4:2, 5-6",
            "book": "Malachi",
            "author": "Malachi",
            "context": "The final page of the Old Testament canon promising the dawning of the Sun of Righteousness and the coming of Elijah.",
            "text": "But to you who fear My name the Sun of Righteousness shall arise with healing in His wings; and you shall go out and grow fat like stall-fed calves.",
            "keyPhrase": "the Sun of Righteousness shall arise with healing in His wings"
        },
        "nt": {
            "ref": "Luke 1:17, 78-79; Matthew 9:20; 2 Peter 1:19",
            "book": "2 Peter",
            "author": "Luke / Matthew / Peter",
            "context": "Zechariah celebrating the 'Dayspring from on high' and the woman healed by touching the border ('wings' / tzitzit) of Jesus' garment.",
            "text": "Through the tender mercy of our God, with which the Dayspring [Rising Sun] from on high has visited us; to give light to those who sit in darkness and the shadow of death, to guide our feet into the way of peace.",
            "keyPhrase": "the Dayspring from on high has visited us"
        },
        "bridge": "In Hebrew, the 'wings' (kanaph) of a garment were its corner fringes/tassels (Num 15:38). In Matthew 9:20 and 14:36, the sick reached out in faith to touch the 'wings' (hem/fringe) of Jesus' cloak and were instantly healed.",
        "keywords": ["Sun of Righteousness", "Healing in His wings", "Dayspring", "Malachi 4"],
        "thread": "seed"
    },
    {
        "id": "p68",
        "title": "Shepherding the Flock & Guarding the Deposit of Truth",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Direct Quotation",
        "votes": 376,
        "eraGap": "c. 1400 / 700 BC → c. AD 63-90",
        "ot": {
            "ref": "Deuteronomy 25:4; Isaiah 40:11; Numbers 16:5",
            "book": "Deuteronomy",
            "author": "Moses & Isaiah",
            "context": "God's care for laborers, the Good Shepherd tending His flock, and the Lord knowing those who are His.",
            "text": "You shall not muzzle an ox while it treads out the grain. (Deut 25:4) ... He will feed His flock like a shepherd; He will gather the lambs with His arm. (Isa 40:11)",
            "keyPhrase": "He will feed His flock like a shepherd; He will gather the lambs with His arm"
        },
        "nt": {
            "ref": "1 Timothy 5:18; 2 Timothy 2:19; Philemon 1:16-18",
            "book": "1 Timothy",
            "author": "Paul",
            "context": "Paul quoting Deuteronomy 25:4 alongside Jesus' words as Scripture in 1 Timothy, and modeling Christ's substitutionary debt-payment in Philemon.",
            "text": "For the Scripture says, 'You shall not muzzle an ox while it treads out the grain,' and, 'The laborer is worthy of his wages.' (1 Tim 5:18) ... But if he has wronged you or owes anything, put that on my account. (Phlm 1:18)",
            "keyPhrase": "if he has wronged you or owes anything, put that on my account"
        },
        "bridge": "In 1 Timothy 5:18, Paul pairs a quote from Moses (Deut 25:4) and a quote from Luke's Gospel (Luke 10:7) under the single heading 'For the Scripture says'—showing the canonical unity of Old and New Testaments, while Philemon 1:18 mirrors Isaiah 53's substitutionary accounting.",
        "keywords": ["1 Timothy", "Philemon", "Imputation", "Good Shepherd"],
        "thread": "covenant"
    },
    {
        "id": "p69",
        "title": "Walking in Truth, Love & Contending for the Faith",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Direct Quotation",
        "votes": 395,
        "eraGap": "c. 1400 / 520 BC → c. AD 65-90",
        "ot": {
            "ref": "Leviticus 19:18; Zechariah 3:2; Psalm 90:4",
            "book": "Leviticus",
            "author": "Moses & Zechariah",
            "context": "The royal command to love one's neighbor, the Lord rebuking the adversary (Zech 3:2), and a thousand years in God's sight (Ps 90:4).",
            "text": "You shall love your neighbor as yourself: I am the Lord. (Lev 19:18) ... And the Lord said to Satan, 'The Lord rebuke you, Satan! The Lord who has chosen Jerusalem rebuke you!' (Zech 3:2)",
            "keyPhrase": "The Lord rebuke you, Satan! The Lord who has chosen Jerusalem rebuke you"
        },
        "nt": {
            "ref": "1 John 4:10-11; 2 John 1:5-6; 3 John 1:4; Jude 1:9",
            "book": "Jude",
            "author": "John & Jude",
            "context": "The Epistles of John and Jude grounding Christian love, hospitaliy in truth, and spiritual warfare in the Hebrew Scriptures.",
            "text": "In this is love, not that we loved God, but that He loved us and sent His Son to be the propitiation for our sins. (1 John 4:10) ... Yet Michael the archangel... said, 'The Lord rebuke you!' (Jude 1:9)",
            "keyPhrase": "He loved us and sent His Son to be the propitiation for our sins"
        },
        "bridge": "Across 1, 2, and 3 John, 2 Peter (quoting Ps 90:4 in 2 Pet 3:8), and Jude (quoting Zech 3:2 in Jude 1:9), the Catholic Epistles weave Torah and Prophets into apostolic exhortation.",
        "keywords": ["Propitiation", "1-3 John", "Jude", "Zechariah 3:2"],
        "thread": "covenant"
    },
    {
        "id": "p70",
        "title": "From Eden's Tree of Life to the New Heaven, New Earth & River of Life",
        "category": "resurrection",
        "categoryLabel": "Resurrection & Reign",
        "type": "Covenantal Promise",
        "votes": 890,
        "eraGap": "c. 1400 / 700 BC → c. AD 95 (The Grand Inclusio)",
        "ot": {
            "ref": "Genesis 2:9; Isaiah 65:17; Ezekiel 47:1-12",
            "book": "Ezekiel",
            "author": "Moses, Isaiah & Ezekiel",
            "context": "The Tree of Life in Eden, Isaiah's prophecy of New Heavens and a New Earth, and Ezekiel's vision of the healing river flowing from the Temple.",
            "text": "For behold, I create new heavens and a new earth; and the former shall not be remembered or come to mind. (Isa 65:17) ... Along the bank of the river, on this side and that, will grow all kinds of trees used for food; their leaves will not wither... and their leaves for medicine. (Ezek 47:12)",
            "keyPhrase": "I create new heavens and a new earth... their leaves for medicine"
        },
        "nt": {
            "ref": "Revelation 21:1-5; 22:1-5; 2 Thessalonians 1:10",
            "book": "Revelation",
            "author": "John",
            "context": "The grand finale of the Bible: Paradise restored, the curse abolished, and the Tree of Life opened to the nations.",
            "text": "Now I saw a new heaven and a new earth... And he showed me a pure river of water of life, clear as crystal, proceeding from the throne of God and of the Lamb. In the middle of its street, and on either side of the river, was the tree of life... and the leaves of the tree were for the healing of the nations. And there shall be no more curse.",
            "keyPhrase": "on either side of the river, was the tree of life... for the healing of the nations"
        },
        "bridge": "The Bible is bookended by a grand literary frame (inclusio): everything lost in Genesis 1-3 (the Tree of Life, the river, walking with God face-to-face, freedom from the curse) is restored and magnified in Revelation 21-22 through the Lamb.",
        "keywords": ["Tree of Life", "New Heavens and New Earth", "River of Life", "No more curse"],
        "thread": "creation"
    },
]

# Verify that every single one of the 66 books is coveredeither in PROPHECIES or in our High-Density TSK Index!
# Wait: let's also add a couple more entries to PROPHECIES if any of the 66 books is not directly the primary `ot.book` or `nt.book` in PROPHECIES!
covered_books = set()
for p in PROPHECIES:
    covered_books.add(p["ot"]["book"])
    covered_books.add(p["nt"]["book"])

all_book_names = [b["name"] for b in OT_BOOKS + NT_BOOKS]
missing = [b for b in all_book_names if b not in covered_books]
print("Initially missing books from primary book field:", missing)
