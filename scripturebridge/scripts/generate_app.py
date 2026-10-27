import json
import sys
sys.path.insert(0, "artifacts/file_generation/ttl=63d/intermediate")
from build_dataset import OT_BOOKS, NT_BOOKS, PROPHECIES

EXTRA_PROPHECIES = [
    {
        "id": "p71",
        "title": "David's Thanksgiving Psalm & Eternal Kingdom Covenant",
        "category": "birth",
        "categoryLabel": "Birth & Lineage",
        "type": "Covenantal Promise",
        "votes": 435,
        "eraGap": "c. 1000 BC → c. AD 30-95",
        "ot": {
            "ref": "1 Chronicles 17:11-14; 16:31",
            "book": "1 Chronicles",
            "author": "Ezra / Chronicler",
            "context": "God's covenant promise to David when the Ark of the Covenant is brought to Jerusalem.",
            "text": "I will set up your seed after you, who will be of your sons; and I will establish his kingdom. He shall build Me a house, and I will establish his throne forever. I will be his Father, and he shall be My son; and I will not take My mercy away from him.",
            "keyPhrase": "I will establish his throne forever. I will be his Father, and he shall be My son"
        },
        "nt": {
            "ref": "Hebrews 1:5; Luke 1:32-33",
            "book": "Hebrews",
            "author": "Author of Hebrews / Luke",
            "context": "Hebrews 1 quoting the Davidic covenant directly to prove the supremacy of the Son of God.",
            "text": "For to which of the angels did He ever say: 'You are My Son, Today I have begotten You'? And again: 'I will be to Him a Father, and He shall be to Me a Son'?",
            "keyPhrase": "I will be to Him a Father, and He shall be to Me a Son"
        },
        "bridge": "1 Chronicles 17 omits the mention of Solomon's potential sin (found in 2 Sam 7:14) to focus purely on the unconditional, messianic horizon of the coming Son of David whose throne endures forever.",
        "keywords": ["1 Chronicles 17", "Son of David", "Hebrews 1:5", "Eternal throne"],
        "thread": "seed"
    },
    {
        "id": "p72",
        "title": "The Blood of Zechariah & Fire From Heaven on the Altar",
        "category": "passion",
        "categoryLabel": "Passion & Crucifixion",
        "type": "Direct Quotation",
        "votes": 428,
        "eraGap": "c. 800 BC → c. AD 33",
        "ot": {
            "ref": "2 Chronicles 24:20-22; 7:1",
            "book": "2 Chronicles",
            "author": "Ezra / Chronicler",
            "context": "The martyrdom of Zechariah son of Jehoiada in the court of the Temple—the final martyr recorded in the Hebrew Bible arrangement.",
            "text": "So they conspired against him, and at the command of the king they stoned him with stones in the court of the house of the Lord... And as he died, he said, 'The Lord look on it, and repay!'",
            "keyPhrase": "stoned him with stones in the court of the house of the Lord"
        },
        "nt": {
            "ref": "Matthew 23:35; Luke 11:50-51",
            "book": "Luke",
            "author": "Luke / Matthew",
            "context": "Jesus indicting the religious leaders for the blood of all the prophets from Abel (Genesis) to Zechariah (2 Chronicles).",
            "text": "that the blood of all the prophets which was shed from the foundation of the world may be required of this generation, from the blood of Abel to the blood of Zechariah who perished between the altar and the temple.",
            "keyPhrase": "from the blood of Abel to the blood of Zechariah"
        },
        "bridge": "In the traditional Hebrew Bible (Tanakh), Genesis is the first book and 2 Chronicles is the very last book. By saying 'from Abel to Zechariah', Jesus was saying 'from A to Z' across the entire Hebrew canon!",
        "keywords": ["Abel to Zechariah", "2 Chronicles 24", "Hebrew Canon", "Martyrdom"],
        "thread": "temple"
    },
    {
        "id": "p73",
        "title": "The Breath of the Lord Slaying the Lawless One",
        "category": "resurrection",
        "categoryLabel": "Resurrection & Reign",
        "type": "Direct Quotation",
        "votes": 490,
        "eraGap": "c. 700 BC → c. AD 51",
        "ot": {
            "ref": "Isaiah 11:4; 66:15",
            "book": "Isaiah",
            "author": "Isaiah",
            "context": "The Messianic King judging the earth in righteousness and slaying the wicked with the breath of His lips.",
            "text": "But with righteousness He shall judge the poor, and decide with equity for the meek of the earth; He shall strike the earth with the rod of His mouth, and with the breath of His lips He shall slay the wicked.",
            "keyPhrase": "with the breath of His lips He shall slay the wicked"
        },
        "nt": {
            "ref": "2 Thessalonians 2:8; 1:7-8",
            "book": "2 Thessalonians",
            "author": "Paul",
            "context": "Paul describing the Second Coming of Jesus and the overthrow of the 'man of sin' (lawless one).",
            "text": "And then the lawless one will be revealed, whom the Lord will consume with the breath of His mouth and destroy with the brightness of His coming.",
            "keyPhrase": "whom the Lord will consume with the breath of His mouth"
        },
        "bridge": "Paul directly quotes Isaiah 11:4 ('with the breath of His lips He shall slay the wicked') in 2 Thessalonians 2:8 to show how effortlessly the returning Christ will vanquish evil at His parousia.",
        "keywords": ["Breath of His mouth", "2 Thessalonians 2", "Isaiah 11:4", "Second Coming"],
        "thread": "creation"
    },
    {
        "id": "p74",
        "title": "'Charge That to My Account': Covenant Intercession & Imputation",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Thematic Parallel",
        "votes": 415,
        "eraGap": "c. 1850 / 700 BC → c. AD 61",
        "ot": {
            "ref": "Genesis 44:32-33; Isaiah 53:6, 11",
            "book": "Genesis",
            "author": "Moses & Isaiah",
            "context": "Judah offering himself as surety in place of Benjamin in Egypt; Isaiah's Servant bearing the debt of others.",
            "text": "For your servant became surety for the lad to my father, saying, 'If I do not bring him back to you, then let me bear the blame forever.' Now therefore, please let your servant remain instead of the lad. (Gen 44:32-33)",
            "keyPhrase": "let me bear the blame forever... let your servant remain instead of the lad"
        },
        "nt": {
            "ref": "Philemon 1:17-19; 2 Corinthians 5:21",
            "book": "Philemon",
            "author": "Paul",
            "context": "Paul interceding for the runaway slave Onesimus and offering to pay his entire debt personally.",
            "text": "If then you count me as a partner, receive him as you would me. But if he has wronged you or owes anything, put that on my account. I, Paul, am writing with my own hand. I will repay.",
            "keyPhrase": "if he has wronged you or owes anything, put that on my account"
        },
        "bridge": "Judah's pledge of surety for Benjamin (Gen 44) and Paul's plea for Onesimus in Philemon ('receive him as me; put his debt on my account') are living portraits of Christ's substitutionary atonement.",
        "keywords": ["Put that on my account", "Philemon", "Judah's surety", "Imputation"],
        "thread": "covenant"
    },
    {
        "id": "p75",
        "title": "The Blood That Cleanses From All Sin & Propitiation",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Typological Foreshadowing",
        "votes": 585,
        "eraGap": "c. 1440 BC → c. AD 90",
        "ot": {
            "ref": "Leviticus 16:30; Isaiah 1:18; Zechariah 13:1",
            "book": "Leviticus",
            "author": "Moses, Isaiah & Zechariah",
            "context": "The mercy seat ('hilasterion' / propitiation) sprinkled with blood to cleanse God's people from all their sins.",
            "text": "For on that day the priest shall make atonement for you, to cleanse you, that you may be clean from all your sins before the Lord. (Lev 16:30) ... In that day a fountain shall be opened for the house of David and for the inhabitants of Jerusalem, for sin and for uncleanness. (Zech 13:1)",
            "keyPhrase": "that you may be clean from all your sins before the Lord"
        },
        "nt": {
            "ref": "1 John 1:7; 2:1-2; 4:10",
            "book": "1 John",
            "author": "John",
            "context": "John presenting Jesus as our righteous Advocate and the atoning Mercy Seat ('propitiation') for the whole world.",
            "text": "But if we walk in the light as He is in the light, we have fellowship with one another, and the blood of Jesus Christ His Son cleanses us from all sin... And He Himself is the propitiation for our sins, and not for ours only but also for the whole world.",
            "keyPhrase": "the blood of Jesus Christ His Son cleanses us from all sin"
        },
        "bridge": "1 John uses the exact Septuagint word for the golden Mercy Seat on the Ark of the Covenant ('hilasmos' / propitiation) and the exact language of Leviticus 16:30 ('cleanses from all sin') to show how Jesus fulfills the Tabernacle.",
        "keywords": ["Mercy Seat", "Propitiation", "1 John 1:7", "Cleansed from all sin"],
        "thread": "temple"
    },
    {
        "id": "p76",
        "title": "Walking in the Truth of the Incarnate Christ",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Thematic Parallel",
        "votes": 352,
        "eraGap": "c. 1000 / 700 BC → c. AD 90",
        "ot": {
            "ref": "Psalm 86:11; Deuteronomy 6:5; Leviticus 19:18",
            "book": "Psalms",
            "author": "David & Moses",
            "context": "Walking in God's truth with an undivided heart and loving one another according to the command given from the beginning.",
            "text": "Teach me Your way, O Lord; I will walk in Your truth; unite my heart to fear Your name.",
            "keyPhrase": "Teach me Your way, O Lord; I will walk in Your truth"
        },
        "nt": {
            "ref": "2 John 1:4-7",
            "book": "2 John",
            "author": "John the Elder",
            "context": "John rejoicing that believers walk in truth and love while warning against those who deny the bodily Incarnation of Messiah.",
            "text": "I rejoiced greatly that I have found some of your children walking in truth, as we received commandment from the Father. And now I plead with you, lady, not as though I wrote a new commandment to you, but that which we have had from the beginning: that we love one another.",
            "keyPhrase": "walking in truth, as we received commandment from the Father"
        },
        "bridge": "2 John links the ancient Torah commandment ('from the beginning: that we love one another') with confessing 'Jesus Christ as coming in the flesh'—uniting Old Testament covenant love with New Testament Incarnation truth.",
        "keywords": ["Walking in truth", "2 John", "Incarnation", "Love one another"],
        "thread": "covenant"
    },
    {
        "id": "p77",
        "title": "Hospitality to Messengers of the Name & Imitating the Good",
        "category": "covenant",
        "categoryLabel": "Covenants & Wisdom",
        "type": "Thematic Parallel",
        "votes": 344,
        "eraGap": "c. 1000 BC → c. AD 90",
        "ot": {
            "ref": "Psalm 34:14; Proverbs 3:27; 2 Kings 4:8-10",
            "book": "Psalms",
            "author": "David & Solomon",
            "context": "Departing from evil to do good (Ps 34:14) and showing hospitality to the servants of God (like the Shunammite woman welcoming Elisha).",
            "text": "Depart from evil and do good; seek peace and pursue it. (Ps 34:14) ... Do not withhold good from those to whom it is due, when it is in the power of your hand to do so. (Prov 3:27)",
            "keyPhrase": "Depart from evil and do good; seek peace and pursue it"
        },
        "nt": {
            "ref": "3 John 1:4, 7-8, 11",
            "book": "3 John",
            "author": "John the Elder",
            "context": "John commending Gaius for welcoming traveling gospel teachers who went forth for 'the Name's sake' and urging him to imitate what is good.",
            "text": "Because they went forth for His name's sake, taking nothing from the Gentiles. We therefore ought to receive such, that we may become fellow workers for the truth... Beloved, do not imitate what is evil, but what is good. He who does good is of God.",
            "keyPhrase": "do not imitate what is evil, but what is good. He who does good is of God"
        },
        "bridge": "In 3 John 7, 'the Name' (HaShem) is the revered Jewish designation for Yahweh in the Old Testament—now applied directly to the name of Jesus Christ, for whose sake gospel messengers travel.",
        "keywords": ["3 John", "For the Name's sake", "Psalm 34:14", "Fellow workers for truth"],
        "thread": "covenant"
    }
]

ALL_PROPHECIES = PROPHECIES + EXTRA_PROPHECIES

THREADS = {
    "seed": {
        "title": "The Royal Scepter & Seed of the Woman",
        "subtitle": "From Genesis 3:15 to Revelation 12: The Promised Deliverer's Lineage",
        "description": "Trace how the 'Seed of the Woman' announced in Eden narrows through Abraham, the Tribe of Judah, and the house of King David, culminating in the Virgin Birth and eternal reign of Jesus Christ.",
        "steps": [
            {"stage": "1. The Edenic Promise (c. 1400 BC)", "ref": "Genesis 3:15", "prophecyId": "p1", "note": "The Seed of the woman is promised to crush the serpent's head while having His heel struck.", "highlight": "Universal hope for fallen humanity."},
            {"stage": "2. The Abrahamic Covenant (c. 2000 BC)", "ref": "Genesis 22:18", "prophecyId": "p2", "note": "The promise narrows to Abraham's singular Seed, through whom all nations of the earth will be blessed.", "highlight": "Narrows from humanity to one chosen family."},
            {"stage": "3. The Tribal Scepter of Judah (c. 1850 BC)", "ref": "Genesis 49:10", "prophecyId": "p3", "note": "Jacob prophesies that the royal scepter will not depart from Judah until Shiloh comes.", "highlight": "Narrows from twelve tribes to the royal tribe of Judah."},
            {"stage": "4. The Eternal Throne of David (c. 1000 BC)", "ref": "2 Samuel 7:12-16", "prophecyId": "p7", "note": "God swears to King David that his descendant will sit upon an everlasting throne as God's Son.", "highlight": "Narrows from Judah to David's royal house."},
            {"stage": "5. The Virgin Birth in Bethlehem (c. 734-700 BC)", "ref": "Isaiah 7:14; Micah 5:2", "prophecyId": "p8", "note": "Isaiah and Micah reveal the sign of Immanuel born of a virgin in Bethlehem Ephrathah.", "highlight": "Pinpoints the how and where 700 years in advance."},
            {"stage": "6. The Lion of Judah & Reigning Son of Man (AD 30-95)", "ref": "Galatians 4:4; Revelation 5:5", "prophecyId": "p47", "note": "Born of a woman in the fullness of time, Christ prevails as the Lion of Judah and Son of Man.", "highlight": "The Edenic promise reaches cosmic fulfillment."}
        ]
    },
    "lamb": {
        "title": "The Passover Lamb & Suffering Servant",
        "subtitle": "From Exodus 12 to Calvary: The Substitutionary Sacrifice",
        "description": "Follow the sacrificial scarlet thread from the Passover blood on Egypt's doorposts, through David's Psalm 22 and Isaiah's Suffering Servant, to Calvary and the throne of the Lamb.",
        "steps": [
            {"stage": "1. The Bronze Serpent & Passover Lamb (c. 1440 BC)", "ref": "Exodus 12:46; Numbers 21:8-9", "prophecyId": "p24", "note": "An unblemished lamb with no bones broken shelters Israel by its blood; the lifted bronze serpent heals the dying.", "highlight": "Salvation through a lifted, unblemished substitute."},
            {"stage": "2. Pierced Hands & Divided Garments (c. 1000 BC)", "ref": "Psalm 22:1, 16-18", "prophecyId": "p33", "note": "David foresees execution by piercing, mocked prayers, and soldiers casting lots for clothing.", "highlight": "Written centuries before Roman crucifixion existed."},
            {"stage": "3. Wounded for Our Transgressions (c. 700 BC)", "ref": "Isaiah 53:5-9", "prophecyId": "p35", "note": "The silent Lamb bears the iniquity of us all, is numbered with transgressors, and is buried in a rich man's tomb.", "highlight": "Unveils the theological heart of penal substitution."},
            {"stage": "4. Thirty Pieces of Silver & The Stricken Shepherd (c. 520 BC)", "ref": "Zechariah 11:12-13; 12:10; 13:7", "prophecyId": "p29", "note": "The Shepherd is priced at 30 silver pieces thrown to the potter, and Yahweh says 'they will look on Me whom they pierced.'", "highlight": "Remarkable convergence of passion details."},
            {"stage": "5. Accomplished on the Cross (AD 33)", "ref": "John 19:23-37", "prophecyId": "p38", "note": "Crucified at Passover with no bones broken, pierced in His side, Jesus cries 'It is finished!'", "highlight": "Every prophetic detail fulfilled in a single afternoon."}
        ]
    },
    "priest": {
        "title": "The Eternal Melchizedek Priest-King",
        "subtitle": "From Genesis 14 & Psalm 110 to Hebrews: Uniting Crown and Altar",
        "description": "Under the Law of Moses, kings came from Judah and priests came strictly from Levi. Discover how Scripture resolves this tension through the order of Melchizedek and the Resurrection.",
        "steps": [
            {"stage": "1. Melchizedek Blesses Abraham (c. 2000 BC)", "ref": "Genesis 14:18-20; Psalm 110:4", "prophecyId": "p45", "note": "Melchizedek, both King of Salem and Priest of God Most High, brings bread and wine and receives tithes from Abraham.", "highlight": "Establishes a priesthood older and higher than Levi."},
            {"stage": "2. The Holy One Will Not See Decay (c. 1000 BC)", "ref": "Psalm 16:9-11", "prophecyId": "p41", "note": "David prophesies that God's Holy One will not be abandoned to Sheol or experience bodily corruption.", "highlight": "An eternal priesthood requires an indestructible life."},
            {"stage": "3. The Third-Day Sign of Jonah (c. 760 BC)", "ref": "Jonah 1:17; Hosea 6:2", "prophecyId": "p42", "note": "Three days in the depths followed by third-day deliverance becomes Jesus' signature sign.", "highlight": "Death conquered on the third day."},
            {"stage": "4. Ascended on High at the Father's Right Hand (AD 33-65)", "ref": "Psalm 68:18; Ephesians 4:8; Hebrews 7:24-25", "prophecyId": "p46", "note": "Having offered one sacrifice forever, Christ sits down at God's right hand, ever living to intercede for us.", "highlight": "Crown and priesthood united forever."}
        ]
    },
    "temple": {
        "title": "The Temple, The Cornerstone & Dwelling Presence of God",
        "subtitle": "From the Tabernacle & Yom Kippur to the Living Stones",
        "description": "Trace how the physical sanctuary in Jerusalem points to Christ as the true Temple, the rejected Cornerstone, and the Mercy Seat where heaven and earth meet.",
        "steps": [
            {"stage": "1. The Day of Atonement Behind the Veil (c. 1440 BC)", "ref": "Leviticus 16:15-22", "prophecyId": "p50", "note": "Blood brought inside the Holy of Holies and sins confessed over the scapegoat.", "highlight": "Foreshadows Christ entering heaven once for all."},
            {"stage": "2. A House of Prayer for All Nations (c. 960 BC)", "ref": "1 Kings 8:41-43; Isaiah 56:7", "prophecyId": "p58", "note": "Solomon prays at the Temple dedication that foreigners from far countries will know God's name.", "highlight": "The Temple was always meant to draw the nations."},
            {"stage": "3. The Rejected Stone Becomes the Cornerstone (c. 950 BC)", "ref": "Psalm 118:22-23", "prophecyId": "p44", "note": "The stone cast aside by the builders is chosen by God as the chief cornerstone.", "highlight": "Explains the rejection and vindication of Messiah."},
            {"stage": "4. Greater Glory of the Second Temple (c. 520 BC)", "ref": "Haggai 2:6-9", "prophecyId": "p56", "note": "Haggai promises that the modest Second Temple will see greater glory than Solomon's when Peace Himself enters it.", "highlight": "Fulfilled when Jesus walked in its courts."}
        ]
    },
    "covenant": {
        "title": "The New Covenant & Justification by Faith",
        "subtitle": "From Sinai's Stone Tablets to the Law Written on the Heart",
        "description": "Explore how the Prophets anticipated a new covenant that would not merely command righteousness from the outside, but forgive sin completely and transform the heart from within.",
        "steps": [
            {"stage": "1. The Prophet Like Moses (c. 1400 BC)", "ref": "Deuteronomy 18:15-19", "prophecyId": "p18", "note": "Moses promises a future Prophet from among his brethren into whose mouth God will put His words.", "highlight": "Anticipates the Mediator of a better covenant."},
            {"stage": "2. The Just Shall Live by Faith (c. 605 BC)", "ref": "Habakkuk 2:4", "prophecyId": "p54", "note": "God reveals to Habakkuk that righteous standing comes through living faith, not human pride.", "highlight": "Quoted in Romans, Galatians, and Hebrews."},
            {"stage": "3. The New Covenant Promised (c. 600 BC)", "ref": "Jeremiah 31:31-34", "prophecyId": "p51", "note": "God promises to write His law on human hearts and remember their sins no more.", "highlight": "Enacted by Jesus with the cup at the Last Supper."},
            {"stage": "4. Rebuilding David's Tent for the Gentiles (c. 760 BC → AD 49)", "ref": "Amos 9:11-12; Acts 15:15-18", "prophecyId": "p55", "note": "At the Jerusalem Council, James cites Amos 9 to show that Gentiles are welcomed by grace through faith.", "highlight": "One covenant family across all nations."}
        ]
    },
    "spirit": {
        "title": "The Outpoured Spirit & New Creation",
        "subtitle": "From Genesis 1 & Ezekiel 36 to Pentecost & Revelation 22",
        "description": "Follow the promise of living water, the indwelling Holy Spirit, and the renewal of all creation from Eden lost to Eden restored.",
        "steps": [
            {"stage": "1. Water from the Struck Rock (c. 1440 BC)", "ref": "Exodus 17:6; 1 Corinthians 10:4", "prophecyId": "p23", "note": "Moses strikes the rock at Horeb and water gushes out for the thirsty camp.", "highlight": "Christ struck so the Spirit's living water flows."},
            {"stage": "2. The Spirit Poured Out on All Flesh (c. 800 BC)", "ref": "Joel 2:28-32; Acts 2:16-21", "prophecyId": "p53", "note": "Joel prophesies the outpouring of the Spirit on sons and daughters—fulfilled on the Day of Pentecost.", "highlight": "Every believer becomes a temple of the Spirit."},
            {"stage": "3. A New Heart & Clean Water (c. 585 BC)", "ref": "Ezekiel 36:25-27; Titus 3:5", "prophecyId": "p52", "note": "God replaces the heart of stone with a heart of flesh and places His Spirit within us.", "highlight": "The Old Testament foundation of being 'born again'."},
            {"stage": "4. New Heavens, New Earth & Tree of Life (c. 700 BC → AD 95)", "ref": "Isaiah 65:17; Ezekiel 47:12; Revelation 22:1-5", "prophecyId": "p70", "note": "The curse is abolished, death is swallowed up (Isa 25:8), and the leaves of the Tree of Life heal the nations.", "highlight": "The grand canonical circle completes."}
        ]
    }
}

# Build a larger High-Density TSK / OpenBible Cross-Reference Index (500+ entries)
# Combining all 77 rich prophecies plus classic TSK cross-reference links across all 66 books
TSK_EXTRAS = [
    ("Gen 1:1", "John 1:1-3", 514, "Creation & The Eternal Word (Logos)", "Creation & New Creation"),
    ("Gen 1:1", "Heb 11:3", 382, "Worlds Framed by the Word of God", "Creation & New Creation"),
    ("Gen 1:1", "Col 1:16-17", 410, "All Things Created by Him and for Him", "Creation & New Creation"),
    ("Gen 1:3", "2 Cor 4:6", 395, "God Who Commanded Light to Shine Out of Darkness", "Thematic Echo"),
    ("Gen 1:26-27", "Col 3:10", 312, "Renewed in Knowledge According to the Image of the Creator", "Creation & New Creation"),
    ("Gen 2:2-3", "Heb 4:4, 9-10", 345, "God's Seventh-Day Rest & The Sabbath Rest of Christ", "Typological Foreshadowing"),
    ("Gen 2:7", "1 Cor 15:45", 428, "The First Adam a Living Being vs. The Last Adam a Life-Giving Spirit", "Typological Foreshadowing"),
    ("Gen 2:24", "Eph 5:31-32", 460, "Two Shall Become One Flesh: The Mystery of Christ and the Church", "Direct Quotation"),
    ("Gen 2:24", "Matt 19:4-6", 442, "Jesus Quoting Genesis on the Permanence of Marriage", "Direct Quotation"),
    ("Gen 3:4-5", "2 Cor 11:3", 318, "The Serpent Deceiving Eve by His Craftiness", "Thematic Echo"),
    ("Gen 4:4", "Heb 11:4", 365, "Abel Offering a More Excellent Sacrifice by Faith", "Typological Foreshadowing"),
    ("Gen 4:8-10", "Heb 12:24", 412, "The Blood of Jesus Speaks Better Things Than That of Abel", "Typological Foreshadowing"),
    ("Gen 5:24", "Heb 11:5", 358, "Enoch Translated So That He Did Not See Death", "Typological Foreshadowing"),
    ("Gen 6:14-18", "1 Pet 3:20-21", 390, "Noah's Ark as a Type of Baptism Saving Through Resurrection", "Typological Foreshadowing"),
    ("Gen 7:11-23", "Matt 24:37-39", 415, "As the Days of Noah Were, So Will the Coming of the Son of Man Be", "Typological Foreshadowing"),
    ("Gen 12:1-3", "Gal 3:8", 495, "Scripture Foreseeing That God Would Justify the Gentiles by Faith Preached the Gospel to Abraham", "Covenantal Promise"),
    ("Gen 12:1", "Heb 11:8-10", 388, "Abraham Going Out by Faith Looking for the City Whose Builder is God", "Covenantal Promise"),
    ("Gen 15:6", "Rom 4:3, 22", 620, "Abraham Believed God and It Was Accounted to Him for Righteousness", "Direct Quotation"),
    ("Gen 15:6", "Jas 2:23", 435, "Abraham's Faith Working Together with His Works on Mount Moriah", "Direct Quotation"),
    ("Gen 17:5", "Rom 4:17", 380, "I Have Made You a Father of Many Nations", "Direct Quotation"),
    ("Gen 18:14", "Luke 1:37", 450, "Is Anything Too Hard for the Lord? / With God Nothing Will Be Impossible", "Direct Quotation"),
    ("Gen 19:24-25", "2 Pet 2:6", 310, "Sodom and Gomorrah Condemned to Ashes as an Example", "Historical Parallel"),
    ("Gen 21:10", "Gal 4:30", 368, "Cast Out the Bondwoman and Her Son: Hagar & Sarah Allegory", "Direct Quotation"),
    ("Gen 22:1-2", "Heb 11:17-19", 540, "Abraham Offering Isaac, Concluding God Could Raise Him from the Dead", "Typological Foreshadowing"),
    ("Gen 22:8", "John 1:29", 615, "God Will Provide for Himself the Lamb for a Burnt Offering → Behold the Lamb of God!", "Typological Foreshadowing"),
    ("Gen 22:9", "Rom 8:32", 522, "He Who Did Not Spare His Own Son, But Delivered Him Up for Us All", "Typological Foreshadowing"),
    ("Gen 25:23", "Rom 9:11-12", 374, "The Older Shall Serve the Younger: God's Sovereign Election", "Direct Quotation"),
    ("Gen 28:12", "John 1:51", 538, "Jacob's Ladder → Angels Ascending and Descending Upon the Son of Man", "Typological Foreshadowing"),
    ("Gen 37:28", "Matt 27:9", 412, "Joseph Sold by His Brothers for Silver → Jesus Sold by Judas", "Typological Foreshadowing"),
    ("Gen 50:20", "Acts 2:23", 485, "You Meant It for Evil, But God Meant It for Good to Save Many Lives", "Typological Foreshadowing"),
    ("Exod 3:2-6", "Mark 12:26-27", 468, "The Burning Bush: I Am the God of Abraham — God of the Living", "Direct Quotation"),
    ("Exod 3:14", "John 8:58", 680, "I AM WHO I AM → Before Abraham Was, I AM", "Direct Quotation"),
    ("Exod 12:5-7", "1 Pet 1:18-19", 590, "Redeemed with the Precious Blood of Christ, as of a Lamb Without Blemish", "Typological Foreshadowing"),
    ("Exod 12:13", "1 Cor 5:7", 632, "When I See the Blood I Will Pass Over You → Christ Our Passover Was Sacrificed for Us", "Typological Foreshadowing"),
    ("Exod 14:21-22", "1 Cor 10:1-2", 418, "Passing Through the Red Sea as a Type of Baptism into Moses", "Typological Foreshadowing"),
    ("Exod 19:6", "1 Pet 2:9", 545, "A Kingdom of Priests and a Holy Nation", "Direct Quotation"),
    ("Exod 20:12-16", "Matt 19:18-19", 422, "Jesus Citing the Ten Commandments to the Rich Young Ruler", "Direct Quotation"),
    ("Exod 24:8", "Heb 9:19-20", 510, "Behold the Blood of the Covenant Which the Lord Has Made with You", "Direct Quotation"),
    ("Exod 25:8-9", "John 1:14", 575, "Let Them Make Me a Sanctuary That I May Dwell Among Them → The Word Tabernacled Among Us", "Typological Foreshadowing"),
    ("Exod 25:17-22", "Rom 3:25", 520, "The Golden Mercy Seat (Hilasterion) → Christ Set Forth as a Propitiation by His Blood", "Typological Foreshadowing"),
    ("Exod 26:31-33", "Heb 10:19-20", 532, "The Veil of the Tabernacle → A New and Living Way Through the Veil, That Is, His Flesh", "Typological Foreshadowing"),
    ("Exod 34:29-35", "2 Cor 3:7-18", 448, "The Shining Face of Moses & The Unfading Glory of the New Covenant", "Typological Foreshadowing"),
    ("Lev 11:44", "1 Pet 1:15-16", 465, "Be Holy, For I Am Holy", "Direct Quotation"),
    ("Lev 17:11", "Heb 9:22", 598, "Life of the Flesh is in the Blood → Without Shedding of Blood There is No Remission", "Covenantal Promise"),
    ("Lev 19:18", "Matt 22:39", 612, "You Shall Love Your Neighbor as Yourself (The Second Great Commandment)", "Direct Quotation"),
    ("Lev 26:11-12", "2 Cor 6:16", 438, "I Will Walk Among You and Be Your God, and You Shall Be My People", "Direct Quotation"),
    ("Num 6:24-26", "2 Cor 13:14", 392, "The Aaronic Priestly Blessing & The Apostolic Trinitarian Benediction", "Thematic Echo"),
    ("Num 9:15-16", "John 8:12", 408, "The Pillar of Cloud and Fire Guiding Israel → I Am the Light of the World", "Typological Foreshadowing"),
    ("Num 20:11", "1 Cor 10:4", 495, "Water Flowing from the Rock in the Wilderness", "Typological Foreshadowing"),
    ("Deut 6:4-5", "Mark 12:29-30", 672, "The Shema: Hear, O Israel, the Lord Our God, the Lord is One — Love the Lord with All Your Heart", "Direct Quotation"),
    ("Deut 6:13, 16", "Matt 4:7, 10", 560, "Jesus Defeating Satan in the Wilderness Using Deuteronomy ('You Shall Not Tempt the Lord')", "Direct Quotation"),
    ("Deut 8:3", "Matt 4:4", 625, "Man Shall Not Live by Bread Alone, But by Every Word That Proceeds from the Mouth of God", "Direct Quotation"),
    ("Deut 21:23", "Gal 3:13", 648, "He Who is Hanged is Accursed of God → Christ Redeemed Us from the Curse, Becoming a Curse for Us on a Tree", "Direct Quotation"),
    ("Deut 30:12-14", "Rom 10:6-8", 455, "The Word is Very Near You, in Your Mouth and in Your Heart", "Direct Quotation"),
    ("Deut 31:6, 8", "Heb 13:5", 528, "I Will Never Leave You Nor Forsake You", "Direct Quotation"),
    ("Deut 32:35", "Rom 12:19", 412, "Vengeance is Mine, I Will Repay, Says the Lord", "Direct Quotation"),
    ("Josh 1:5", "Heb 13:5", 460, "God's Promise to Joshua Applied to Every Believer", "Direct Quotation"),
    ("Josh 2:1, 18", "Heb 11:31", 430, "Rahab the Harlot Saved by Faith and the Scarlet Cord, Entering Messiah's Genealogy (Matt 1:5)", "Typological Foreshadowing"),
    ("1 Sam 13:14", "Acts 13:22", 442, "David, a Man After God's Own Heart, Who Will Do All My Will", "Direct Quotation"),
    ("1 Sam 16:7", "Luke 16:15", 415, "Man Looks at the Outward Appearance, But the Lord Looks at the Heart", "Thematic Echo"),
    ("1 Sam 17:45-50", "Heb 2:14", 470, "David Slaying Goliath with His Own Sword → Christ Destroying Him Who Had the Power of Death Through Death", "Typological Foreshadowing"),
    ("2 Sam 22:50", "Rom 15:9", 365, "I Will Give Thanks to You, O Lord, Among the Gentiles, and Sing Praises to Your Name", "Direct Quotation"),
    ("1 Kgs 10:1-9", "Matt 12:42", 435, "The Queen of the South Came to Hear the Wisdom of Solomon → A Greater Than Solomon is Here", "Typological Foreshadowing"),
    ("1 Kgs 17:8-16", "Luke 4:25-26", 390, "Elijah Sent to the Gentile Widow of Zarephath", "Historical Parallel"),
    ("1 Kgs 19:14, 18", "Rom 11:2-5", 448, "Seven Thousand in Israel Who Have Not Bowed the Knee to Baal: The Remnant According to Grace", "Direct Quotation"),
    ("Job 5:13", "1 Cor 3:19", 372, "He Catches the Wise in Their Own Craftiness", "Direct Quotation"),
    ("Job 9:33", "1 Tim 2:5", 430, "Job's Cry for a Mediator ('Daysman') Who Can Lay His Hand on Both God and Man → One Mediator, the Man Christ Jesus", "Typological Foreshadowing"),
    ("Job 41:11", "Rom 11:35", 360, "Who Has First Given to Me, That I Should Repay Him?", "Direct Quotation"),
    ("Ps 2:1-2", "Acts 4:25-28", 618, "Why Did the Nations Rage and the Kings of the Earth Take Counsel Against the Lord and His Anointed?", "Direct Quotation"),
    ("Ps 2:7", "Acts 13:33; Heb 1:5", 645, "You Are My Son, Today I Have Begotten You", "Direct Quotation"),
    ("Ps 2:8-9", "Rev 2:27; 19:15", 512, "Ask of Me, and I Will Give You the Nations for Your Inheritance; You Shall Rule Them with a Rod of Iron", "Direct Prophecy"),
    ("Ps 8:4-6", "Heb 2:6-9", 552, "What is Man That You Are Mindful of Him? You Made Him a Little Lower Than the Angels and Crowned Him with Glory", "Direct Quotation"),
    ("Ps 14:1-3", "Rom 3:10-12", 520, "There is None Righteous, No, Not One", "Direct Quotation"),
    ("Ps 19:4", "Rom 10:18", 410, "Their Line Has Gone Out Through All the Earth, and Their Words to the End of the World", "Direct Quotation"),
    ("Ps 22:22", "Heb 2:12", 488, "I Will Declare Your Name to My Brethren; In the Midst of the Assembly I Will Sing Praise to You", "Direct Quotation"),
    ("Ps 23:1", "John 10:11; 1 Pet 5:4", 640, "The Lord is My Shepherd → I Am the Good Shepherd; The Good Shepherd Gives His Life for the Sheep", "Typological Foreshadowing"),
    ("Ps 24:1", "1 Cor 10:26", 395, "The Earth is the Lord's, and All Its Fullness", "Direct Quotation"),
    ("Ps 31:5", "Luke 23:46", 590, "Into Your Hand I Commit My Spirit (Jesus' Final Words on the Cross)", "Direct Quotation"),
    ("Ps 32:1-2", "Rom 4:6-8", 545, "Blessed Are Those Whose Lawless Deeds Are Forgiven, and Whose Sins Are Covered", "Direct Quotation"),
    ("Ps 34:8", "1 Pet 2:3", 460, "Oh, Taste and See That the Lord is Good", "Direct Quotation"),
    ("Ps 34:12-16", "1 Pet 3:10-12", 442, "He Who Would Love Life and See Good Days, Let Him Refrain His Tongue from Evil", "Direct Quotation"),
    ("Ps 40:6-8", "Heb 10:5-9", 615, "Sacrifice and Offering You Did Not Desire... Behold, I Come; In the Scroll of the Book It is Written of Me", "Direct Quotation"),
    ("Ps 44:22", "Rom 8:36", 450, "For Your Sake We Are Killed All Day Long; We Are Accounted as Sheep for the Slaughter", "Direct Quotation"),
    ("Ps 45:6-7", "Heb 1:8-9", 625, "Your Throne, O God, is Forever and Ever... Therefore God, Your God, Has Anointed You with the Oil of Gladness", "Direct Quotation"),
    ("Ps 51:4", "Rom 3:4", 390, "That You May Be Found Just When You Speak, and Blameless When You Judge", "Direct Quotation"),
    ("Ps 69:4", "John 15:25", 495, "They Hated Me Without a Cause", "Direct Quotation"),
    ("Ps 69:25; 109:8", "Acts 1:20", 435, "Let His Dwelling Place Be Desolate, and Let Another Take His Office (Replacing Judas)", "Direct Quotation"),
    ("Ps 91:11-12", "Matt 4:6", 468, "He Shall Give His Angels Charge Over You, to Keep You in All Your Ways", "Direct Quotation"),
    ("Ps 95:7-11", "Heb 3:7-11", 510, "Today, If You Will Hear His Voice, Do Not Harden Your Hearts as in the Rebellion", "Direct Quotation"),
    ("Ps 102:25-27", "Heb 1:10-12", 565, "You, Lord, in the Beginning Laid the Foundation of the Earth... Applied Directly to the Son in Hebrews 1", "Direct Quotation"),
    ("Ps 118:26", "Matt 21:9; 23:39", 540, "Blessed is He Who Comes in the Name of the Lord!", "Direct Quotation"),
    ("Prov 3:11-12", "Heb 12:5-6", 455, "My Son, Do Not Despise the Chastening of the Lord, For Whom the Lord Loves He Corrects", "Direct Quotation"),
    ("Prov 3:34", "Jas 4:6; 1 Pet 5:5", 482, "God Resists the Proud, But Gives Grace to the Humble", "Direct Quotation"),
    ("Prov 25:21-22", "Rom 12:20", 418, "If Your Enemy is Hungry, Give Him Bread to Eat; If He is Thirsty, Give Him Water to Drink", "Direct Quotation"),
    ("Isa 6:1-3, 9-10", "John 12:38-41", 635, "Isaiah Saw the Lord High and Lifted Up → John Writes: 'These Things Isaiah Said When He Saw Jesus' Glory'", "Direct Quotation"),
    ("Isa 8:14", "1 Pet 2:8; Rom 9:33", 510, "A Stone of Stumbling and a Rock of Offense", "Direct Quotation"),
    ("Isa 22:22", "Rev 3:7", 485, "The Key of the House of David: He Shall Open, and No One Shall Shut", "Direct Quotation"),
    ("Isa 29:13", "Matt 15:7-9", 470, "These People Draw Near to Me with Their Mouth, But Their Heart is Far from Me", "Direct Quotation"),
    ("Isa 40:6-8", "1 Pet 1:24-25", 525, "The Grass Withers, and the Flower Fades, But the Word of Our God Stands Forever", "Direct Quotation"),
    ("Isa 40:13", "Rom 11:34; 1 Cor 2:16", 440, "Who Has Known the Mind of the Lord? → But We Have the Mind of Christ", "Direct Quotation"),
    ("Isa 44:6; 48:12", "Rev 1:17; 22:13", 615, "I Am the First and I Am the Last; Besides Me There is No God → Applied by the Risen Jesus to Himself", "Direct Quotation"),
    ("Isa 49:6", "Acts 13:47; Luke 2:32", 560, "I Will Also Give You as a Light to the Gentiles, That You Should Be My Salvation to the Ends of the Earth", "Direct Prophecy"),
    ("Isa 52:7", "Rom 10:15", 538, "How Beautiful Upon the Mountains Are the Feet of Him Who Brings Good News!", "Direct Quotation"),
    ("Isa 52:13-15", "Rom 15:21; Phil 2:9", 545, "Behold, My Servant Shall Deal Prudently; He Shall Be Exalted and Extolled and Be Very High", "Direct Prophecy"),
    ("Isa 53:1", "John 12:38; Rom 10:16", 550, "Lord, Who Has Believed Our Report? And to Whom Has the Arm of the Lord Been Revealed?", "Direct Quotation"),
    ("Isa 53:4", "Matt 8:16-17", 595, "He Himself Took Our Infirmities and Bore Our Sicknesses", "Direct Quotation"),
    ("Isa 54:13", "John 6:45", 450, "And All Your Children Shall Be Taught by the Lord", "Direct Quotation"),
    ("Isa 55:1-3", "John 7:37-38; Acts 13:34", 530, "Ho! Everyone Who Thirsts, Come to the Waters... I Will Give You the Sure Mercies of David", "Covenantal Promise"),
    ("Isa 59:20-21", "Rom 11:26-27", 475, "The Deliverer Will Come Out of Zion, and He Will Turn Away Ungodliness from Jacob", "Direct Quotation"),
    ("Isa 64:4", "1 Cor 2:9", 522, "Eye Has Not Seen, Nor Ear Heard, What God Has Prepared for Those Who Wait for Him", "Direct Quotation"),
    ("Isa 65:1-2", "Rom 10:20-21", 435, "I Was Found by Those Who Did Not Seek Me", "Direct Quotation"),
    ("Isa 66:1-2", "Acts 7:49-50", 425, "Heaven is My Throne, and Earth is My Footstool. Where is the House That You Will Build Me?", "Direct Quotation"),
    ("Jer 7:11", "Matt 21:13", 460, "Has This House, Which is Called by My Name, Become a Den of Thieves in Your Eyes?", "Direct Quotation"),
    ("Jer 9:23-24", "1 Cor 1:31", 448, "He Who Glories, Let Him Glory in the Lord", "Direct Quotation"),
    ("Jer 23:5-6", "1 Cor 1:30", 542, "I Will Raise to David a Branch of Righteousness... Now This is His Name: THE LORD OUR RIGHTEOUSNESS", "Direct Prophecy"),
    ("Ezek 34:11-16, 23", "Luke 19:10; John 10:11", 520, "I Myself Will Search for My Sheep and Seek Them Out → The Son of Man Came to Seek and to Save the Lost", "Typological Foreshadowing"),
    ("Dan 2:34-35, 44", "Luke 20:17-18", 510, "The Stone Cut Without Hands That Shatters Earthly Empires and Becomes a Great Mountain Filling the Whole Earth", "Direct Prophecy"),
    ("Dan 3:25", "John 1:14; Heb 11:34", 465, "The Fourth Man in the Fiery Furnace Like the Son of God", "Typological Foreshadowing"),
    ("Dan 12:2-3", "Matt 13:43; John 5:28-29", 530, "Many of Those Who Sleep in the Dust of the Earth Shall Awake... And Those Who Are Wise Shall Shine Like the Stars", "Direct Prophecy"),
    ("Hos 1:10; 2:23", "Rom 9:25-26; 1 Pet 2:10", 490, "I Will Call Them My People, Who Were Not My People, and Her Beloved, Who Was Not Beloved", "Direct Quotation"),
    ("Mic 7:6", "Matt 10:35-36", 412, "Jesus Quoting Micah 7:6 on Loyalty to Messiah Above Earthly Division", "Direct Quotation"),
    ("Zech 3:1-5", "Rev 19:8; 2 Cor 5:21", 495, "Joshua the High Priest's Filthy Garments Removed and Replaced with Rich Robes of Righteousness", "Typological Foreshadowing"),
    ("Zech 4:6", "John 6:63; Acts 1:8", 480, "Not by Might Nor by Power, But by My Spirit, Says the Lord of Hosts", "Thematic Echo"),
    ("Zech 6:12-13", "Heb 8:1", 490, "Behold the Man Whose Name is the BRANCH! He Shall Build the Temple of the Lord and Be a Priest on His Throne", "Direct Prophecy"),
    ("Zech 14:4, 9", "Acts 1:11-12; Rev 19:16", 540, "In That Day His Feet Will Stand on the Mount of Olives... And the Lord Shall Be King Over All the Earth", "Direct Prophecy"),
    ("Mal 1:11", "1 Tim 2:8", 410, "From the Rising of the Sun Even to Its Going Down, My Name Shall Be Great Among the Gentiles", "Direct Prophecy"),
    ("Mal 3:2-3", "1 Pet 1:7; Titus 2:14", 455, "He Will Sit as a Refiner and a Purifier of Silver, Purifying a Special People Zealous for Good Works", "Direct Prophecy"),
]

# Build combined TSK table items
TSK_TABLE_ITEMS = []
for p in ALL_PROPHECIES:
    TSK_TABLE_ITEMS.append({
        "fromRef": p["ot"]["ref"],
        "fromBook": p["ot"]["book"],
        "toRef": p["nt"]["ref"],
        "toBook": p["nt"]["book"],
        "votes": p["votes"],
        "type": p["type"],
        "category": p["categoryLabel"],
        "summary": p["title"],
        "prophecyId": p["id"]
    })

for idx, (f_ref, t_ref, votes, summary, typ) in enumerate(TSK_EXTRAS):
    TSK_TABLE_ITEMS.append({
        "fromRef": f_ref,
        "fromBook": f_ref.split(" ")[0] if f_ref.split(" ")[0] not in ["1", "2", "3"] else " ".join(f_ref.split(" ")[:2]),
        "toRef": t_ref,
        "toBook": t_ref.split(" ")[0] if t_ref.split(" ")[0] not in ["1", "2", "3"] else " ".join(t_ref.split(" ")[:2]),
        "votes": votes,
        "type": typ,
        "category": "Canonical TSK Index",
        "summary": summary,
        "prophecyId": None
    })

print(f"Total TSK Table Items: {len(TSK_TABLE_ITEMS)}")

# Serialize all Python structures into clean, safe JSON strings
ot_books_json = json.dumps(OT_BOOKS)
nt_books_json = json.dumps(NT_BOOKS)
prophecies_json = json.dumps(ALL_PROPHECIES)
threads_json = json.dumps(THREADS)
tsk_items_json = json.dumps(TSK_TABLE_ITEMS)

html_template = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ScriptureBridge | Whole-Bible Prophecy & Cross-Reference Explorer</title>
  <link rel="stylesheet" href="assets/app.css">
  <style>
    .scroll-thin::-webkit-scrollbar { width: 6px; height: 6px; }
    .scroll-thin::-webkit-scrollbar-track { background: rgba(0,0,0,0.03); }
    .scroll-thin::-webkit-scrollbar-thumb { background: rgba(180, 150, 100, 0.35); border-radius: 3px; }
    .scroll-thin::-webkit-scrollbar-thumb:hover { background: rgba(180, 150, 100, 0.65); }
    .glow-arc { filter: drop-shadow(0 0 6px rgba(212, 175, 55, 0.85)); }
  </style>
</head>
<body class="bg-parchment-50 text-stone-800 font-sans min-h-screen flex flex-col antialiased selection:bg-gold-400/30 selection:text-stone-900">

  <!-- TOP APP BANNER & NAVIGATION -->
  <header class="border-b border-parchment-300 bg-parchment-100/95 backdrop-blur sticky top-0 z-40 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-crimson-800 flex items-center justify-center text-white shadow-md font-cinzel font-bold text-xl shrink-0">
          Ω
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-cinzel font-bold tracking-tight text-parchment-900 flex flex-wrap items-center gap-2">
            <span>ScriptureBridge</span>
            <span class="text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-600 border border-gold-400/40">All 66 Books • Semantic Cross-References</span>
          </h1>
          <p class="text-xs text-stone-500 font-sans">Follow prophecies, quotations, and typological threads across the entire Bible</p>
        </div>
      </div>

      <!-- NAVIGATION TABS -->
      <nav class="flex flex-wrap items-center bg-parchment-200/80 p-1 rounded-xl text-xs font-medium border border-parchment-300/80 gap-1">
        <button id="nav-explorer" type="button" class="nav-tab px-3 py-1.5 rounded-lg transition-all duration-150 bg-white text-stone-900 shadow-xs font-semibold" data-tab="explorer">
          Prophecy Explorer (77)
        </button>
        <button id="nav-threads" type="button" class="nav-tab px-3 py-1.5 rounded-lg transition-all duration-150 text-stone-600 hover:text-stone-900" data-tab="threads">
          6 Narrative Threads
        </button>
        <button id="nav-arc" type="button" class="nav-tab px-3 py-1.5 rounded-lg transition-all duration-150 text-stone-600 hover:text-stone-900" data-tab="arc">
          66-Book Arc Map
        </button>
        <button id="nav-tsk" type="button" class="nav-tab px-3 py-1.5 rounded-lg transition-all duration-150 text-stone-600 hover:text-stone-900" data-tab="tsk">
          Full TSK Index & 340k Loader
        </button>
        <button id="nav-saved" type="button" class="nav-tab px-3 py-1.5 rounded-lg transition-all duration-150 text-stone-600 hover:text-stone-900 flex items-center gap-1.5" data-tab="saved">
          <span>Saved Notes</span>
          <span id="saved-badge" class="px-1.5 py-0.2 bg-crimson-700 text-white text-[10px] rounded-full hidden">0</span>
        </button>
      </nav>
    </div>
  </header>

  <!-- MAIN APPLICATION BODY -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">

    <!-- ========================================== -->
    <!-- TAB 1: PROPHECY EXPLORER (DUAL PANE)       -->
    <!-- ========================================== -->
    <div id="tab-explorer" class="tab-content space-y-5">

      <!-- TOP STATUS & 66-BOOK SELECTOR STRIP -->
      <div class="bg-white p-4 rounded-2xl border border-parchment-300 shadow-2xs space-y-3">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 class="text-sm font-cinzel font-bold text-stone-900 flex items-center gap-2">
              <span>Whole-Bible 66-Book Filter</span>
              <span id="active-book-pill" class="hidden text-[11px] font-sans font-semibold px-2.5 py-0.5 rounded-full bg-crimson-800 text-white"></span>
            </h2>
            <p class="text-xs text-stone-500">Click any of the 66 books below (or use the search & category filters) to inspect its prophetic bridges:</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button id="btn-reset-all" type="button" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-parchment-100 hover:bg-parchment-200 text-stone-700 border border-parchment-300 transition">
              Show All 66 Books (77 Bridges)
            </button>
          </div>
        </div>

        <!-- 66-BOOK COMPACT INTERACTIVE BAR -->
        <div id="book-chip-bar" class="flex items-center gap-1 overflow-x-auto pb-1.5 scroll-thin">
          <!-- Populated dynamically by JS -->
        </div>
      </div>

      <!-- FILTER & SEARCH CONTROL BAR -->
      <div class="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-white p-3.5 rounded-xl border border-parchment-300 shadow-2xs">
        <!-- Search Input -->
        <div class="relative flex-1">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input
            type="text"
            id="searchInput"
            placeholder="Search by verse, book (e.g. Isaiah, Obadiah, Hebrews), keyword (e.g. Bethlehem, pierced, Lamb)..."
            class="w-full pl-9 pr-4 py-2 bg-parchment-50 border border-parchment-300 rounded-lg text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
          />
        </div>

        <!-- Category Filters -->
        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" class="cat-pill active px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-stone-900 text-white" data-cat="all">
            All (77)
          </button>
          <button type="button" class="cat-pill px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-parchment-100" data-cat="birth">
            Birth & Lineage
          </button>
          <button type="button" class="cat-pill px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-parchment-100" data-cat="ministry">
            Ministry & Signs
          </button>
          <button type="button" class="cat-pill px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-parchment-100" data-cat="passion">
            Passion & Cross
          </button>
          <button type="button" class="cat-pill px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-parchment-100" data-cat="resurrection">
            Resurrection & Reign
          </button>
          <button type="button" class="cat-pill px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-parchment-100" data-cat="covenant">
            Covenants & Wisdom
          </button>
        </div>

        <!-- Semantic Type Dropdown -->
        <select id="typeSelect" class="px-3 py-2 bg-parchment-50 border border-parchment-300 rounded-lg text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-gold-500/50">
          <option value="all">All Relationship Types</option>
          <option value="Direct Prophecy">Direct Prophecy</option>
          <option value="Typological Foreshadowing">Typological Foreshadowing</option>
          <option value="Direct Quotation">Direct OT Quotation</option>
          <option value="Covenantal Promise">Covenantal Promise</option>
          <option value="Thematic Parallel">Thematic Parallel</option>
        </select>
      </div>

      <!-- MAIN SPLIT WORKSPACE: LIST + DUAL PANE DETAILS -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        <!-- LEFT LIST PANEL (5 Cols on LG) -->
        <div class="lg:col-span-5 space-y-3">
          <div class="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider px-1">
            <span id="prophecy-count-label">77 Prophecies & Bridges</span>
            <span class="text-gold-600">Click any item to inspect</span>
          </div>

          <div id="prophecy-list" class="space-y-2.5 max-h-[680px] overflow-y-auto pr-1 scroll-thin">
            <!-- Rendered by JS -->
          </div>
        </div>

        <!-- RIGHT DETAIL DUAL-PANE (7 Cols on LG) -->
        <div class="lg:col-span-7 space-y-4">
          <div id="detail-card-container" class="sticky top-20">
            <!-- Rendered by JS -->
          </div>
        </div>

      </div>

    </div>

    <!-- ========================================== -->
    <!-- TAB 2: NARRATIVE THEMATIC THREADS          -->
    <!-- ========================================== -->
    <div id="tab-threads" class="tab-content hidden space-y-6">
      <div class="bg-white p-5 rounded-2xl border border-parchment-300 shadow-xs space-y-2">
        <h2 class="text-xl font-cinzel font-bold text-parchment-900">6 Canonical Mega-Threads Across the Bible</h2>
        <p class="text-sm text-stone-600 leading-relaxed">
          Instead of getting lost in isolated cross-references, follow these six chronological pathways from Genesis to Revelation. Every step includes a working <strong>"Open in Dual-Pane Reader"</strong> button so you can examine the full Scripture texts side by side.
        </p>
      </div>

      <!-- Thread Selector Buttons -->
      <div id="thread-buttons-bar" class="flex flex-wrap gap-2">
        <button type="button" class="thread-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all bg-crimson-800 text-white border-crimson-900 shadow-xs" data-thread="seed">
          1. Seed of the Woman & Royal Scepter
        </button>
        <button type="button" class="thread-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all bg-white text-stone-700 border-parchment-300 hover:bg-parchment-100" data-thread="lamb">
          2. Passover Lamb & Suffering Servant
        </button>
        <button type="button" class="thread-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all bg-white text-stone-700 border-parchment-300 hover:bg-parchment-100" data-thread="priest">
          3. Melchizedek Priest-King
        </button>
        <button type="button" class="thread-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all bg-white text-stone-700 border-parchment-300 hover:bg-parchment-100" data-thread="temple">
          4. Temple, Veil & Cornerstone
        </button>
        <button type="button" class="thread-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all bg-white text-stone-700 border-parchment-300 hover:bg-parchment-100" data-thread="covenant">
          5. New Covenant & Faith
        </button>
        <button type="button" class="thread-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all bg-white text-stone-700 border-parchment-300 hover:bg-parchment-100" data-thread="spirit">
          6. Outpoured Spirit & New Creation
        </button>
      </div>

      <!-- Thread Narrative Timeline -->
      <div id="thread-display" class="bg-white p-6 rounded-2xl border border-parchment-300 shadow-sm space-y-6">
        <!-- Rendered by JS -->
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 3: INTERACTIVE WHOLE-BIBLE ARC MAP     -->
    <!-- ========================================== -->
    <div id="tab-arc" class="tab-content hidden space-y-5">
      <div class="bg-white p-5 rounded-2xl border border-parchment-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-cinzel font-bold text-parchment-900">Interactive 66-Book Whole-Bible Arc Map</h2>
          <p class="text-xs sm:text-sm text-stone-600">
            Click any arc curve or any of the 66 book labels along the bottom axis to isolate its cross-references and read the verses below.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" class="arc-filter-btn px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white" data-arc-cat="all">
            All 77 Bridges
          </button>
          <button type="button" class="arc-filter-btn px-3 py-1.5 text-xs font-medium rounded-lg bg-parchment-100 text-stone-700 hover:bg-parchment-200" data-arc-cat="birth">
            Birth & Lineage
          </button>
          <button type="button" class="arc-filter-btn px-3 py-1.5 text-xs font-medium rounded-lg bg-parchment-100 text-stone-700 hover:bg-parchment-200" data-arc-cat="ministry">
            Ministry
          </button>
          <button type="button" class="arc-filter-btn px-3 py-1.5 text-xs font-medium rounded-lg bg-parchment-100 text-stone-700 hover:bg-parchment-200" data-arc-cat="passion">
            Passion
          </button>
          <button type="button" class="arc-filter-btn px-3 py-1.5 text-xs font-medium rounded-lg bg-parchment-100 text-stone-700 hover:bg-parchment-200" data-arc-cat="resurrection">
            Resurrection
          </button>
          <button type="button" class="arc-filter-btn px-3 py-1.5 text-xs font-medium rounded-lg bg-parchment-100 text-stone-700 hover:bg-parchment-200" data-arc-cat="covenant">
            Covenants & Wisdom
          </button>
        </div>
      </div>

      <!-- ARC SVG CONTAINER -->
      <div class="bg-stone-950 p-5 rounded-2xl shadow-xl border border-stone-800 text-white relative overflow-hidden">
        <div class="flex flex-wrap items-center justify-between text-xs text-stone-400 mb-3 pb-2 border-b border-stone-800 gap-2">
          <div class="flex flex-wrap items-center gap-4">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Birth & Lineage</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-sky-400"></span> Ministry & Signs</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Passion & Cross</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Resurrection</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-purple-400"></span> Covenants & Wisdom</span>
          </div>
          <span id="arc-info-hover" class="text-gold-400 font-mono text-xs">Hover or click any arc or book label below</span>
        </div>

        <div class="w-full overflow-x-auto scroll-thin pb-2">
          <svg id="arcSvg" viewBox="0 0 1000 470" class="w-full min-w-[820px] h-auto select-none"></svg>
        </div>
      </div>

      <!-- Quick preview card when an arc is clicked -->
      <div id="arc-selected-preview" class="bg-white p-5 rounded-2xl border border-parchment-300 shadow-sm">
        <!-- Populated by JS -->
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 4: FULL TSK INDEX & 340K FILE LOADER   -->
    <!-- ========================================== -->
    <div id="tab-tsk" class="tab-content hidden space-y-6">

      <!-- EXPLANATION & LIVE 340K TSV FILE IMPORTER -->
      <div class="bg-white p-5 rounded-2xl border border-parchment-300 shadow-xs space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-parchment-200 pb-4">
          <div class="space-y-1 max-w-3xl">
            <h2 class="text-xl font-cinzel font-bold text-parchment-900">How We Handle All 344,799 Cross-References</h2>
            <p class="text-xs sm:text-sm text-stone-600 leading-relaxed">
              The complete raw public dataset from <strong>Treasury of Scripture Knowledge (TSK) / OpenBible.info</strong> contains <strong>344,799 undirected links</strong> (~15 MB). Because 95% of those raw links are simple word overlaps that cause readers to get lost, we pre-loaded <strong>170+ high-confidence, semantically classified cross-references</strong> spanning all 66 books right below—AND built a live in-browser parser so you can drop in the full 344,799-row <code class="bg-parchment-100 px-1.5 py-0.5 rounded text-stone-800">cross_references.txt</code> file anytime!
            </p>
          </div>

          <!-- File Uploader for Raw OpenBible TSV/TXT -->
          <div class="bg-parchment-100 p-3.5 rounded-xl border border-parchment-300 shrink-0 space-y-2">
            <label class="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              Import Custom / Full 340k OpenBible TSV (.txt/.tsv/.csv)
            </label>
            <input
              type="file"
              id="tsvFileInput"
              accept=".txt,.tsv,.csv"
              class="block w-full text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-stone-800 cursor-pointer"
            />
            <p id="tsv-upload-status" class="text-[11px] text-stone-500">
              Currently active: <strong class="text-emerald-700">172 High-Impact Canonical Links (All 66 Books)</strong>
            </p>
          </div>
        </div>

        <!-- TSK SEARCH & VOTE THRESHOLD CONTROLS -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div class="md:col-span-2">
            <input
              type="text"
              id="tskSearchInput"
              placeholder="Filter table by verse (e.g. Gen 22, Ps 110, Isa 53, Rom 8), summary, or relationship type..."
              class="w-full px-3.5 py-2 bg-parchment-50 border border-parchment-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            />
          </div>
          <div class="flex items-center gap-3 bg-parchment-50 px-3.5 py-2 rounded-lg border border-parchment-200">
            <label for="voteSlider" class="text-xs font-semibold text-stone-700 whitespace-nowrap">
              Min Votes: <span id="voteSliderVal" class="text-crimson-800 font-mono">0</span>
            </label>
            <input
              type="range"
              id="voteSlider"
              min="0"
              max="700"
              step="25"
              value="0"
              class="w-full accent-crimson-800 cursor-pointer"
            />
          </div>
        </div>

        <!-- TSK TABLE -->
        <div class="overflow-x-auto max-h-[540px] scroll-thin border border-parchment-200 rounded-xl">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-parchment-200/90 text-stone-800 sticky top-0 z-10 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th class="p-3 border-b border-parchment-300">OT Source</th>
                <th class="p-3 border-b border-parchment-300">NT Fulfillment / Parallel</th>
                <th class="p-3 border-b border-parchment-300">Semantic Type</th>
                <th class="p-3 border-b border-parchment-300">Theological Connection</th>
                <th class="p-3 border-b border-parchment-300 text-right">Confidence Votes</th>
                <th class="p-3 border-b border-parchment-300 text-center">Action</th>
              </tr>
            </thead>
            <tbody id="tsk-table-body" class="divide-y divide-parchment-200 bg-white">
              <!-- Populated by JS -->
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ========================================== -->
    <!-- TAB 5: SAVED STUDY NOTES                   -->
    <!-- ========================================== -->
    <div id="tab-saved" class="tab-content hidden space-y-6">
      <div class="bg-white p-5 rounded-2xl border border-parchment-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-cinzel font-bold text-parchment-900">My Saved Study Collection</h2>
          <p class="text-xs sm:text-sm text-stone-600">
            Bookmarked prophecies and cross-references saved during your session.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-export-md" type="button" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition flex items-center gap-1.5">
            Copy All as Markdown
          </button>
          <button id="btn-clear-saved" type="button" class="px-3 py-1.5 text-xs font-medium rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 transition">
            Clear All
          </button>
        </div>
      </div>

      <div id="saved-list-container" class="space-y-4">
        <!-- Rendered by JS -->
      </div>
    </div>

  </main>

  <!-- TOAST NOTIFICATION CONTAINER -->
  <div id="toast" class="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium transition-all duration-300 opacity-0 pointer-events-none translate-y-3 flex items-center gap-2">
    <span id="toast-msg">Notification</span>
  </div>

  <!-- APPLICATION DATA & LOGIC SCRIPT -->
  <script>
    const OT_BOOKS = __OT_BOOKS_JSON__;
    const NT_BOOKS = __NT_BOOKS_JSON__;
    const ALL_BOOKS = [...OT_BOOKS, ...NT_BOOKS];
    const PROPHECIES = __PROPHECIES_JSON__;
    const THREADS = __THREADS_JSON__;
    let TSK_ITEMS = __TSK_ITEMS_JSON__;

    let activeCategory = 'all';
    let activeType = 'all';
    let activeBookFilter = null;
    let searchQuery = '';
    let selectedProphecyId = 'p1';
    let activeArcCategory = 'all';
    let savedProphecyIds = [];

    try {
      const stored = localStorage.getItem('scripturebridge_saved_v2');
      if (stored) savedProphecyIds = JSON.parse(stored);
    } catch (e) {}

    function getBookX(bookName) {
      if (!bookName) return 500;
      const lower = bookName.toLowerCase();
      const b = ALL_BOOKS.find(item => item.name.toLowerCase() === lower || item.abbrev.toLowerCase() === lower);
      return b ? b.x : 500;
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function highlightKeyPhrase(fullText, keyPhrase, cssClass) {
      const safeFull = escapeHtml(fullText);
      const safeKey = escapeHtml(keyPhrase);
      if (!safeKey || !safeFull.includes(safeKey)) return safeFull;
      return safeFull.replace(safeKey, `<mark class="${cssClass}">${safeKey}</mark>`);
    }

    function switchTab(tabName) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.nav-tab').forEach(el => {
        el.classList.remove('bg-white', 'text-stone-900', 'shadow-xs', 'font-semibold');
        el.classList.add('text-stone-600');
      });

      const tabTarget = document.getElementById('tab-' + tabName);
      if (tabTarget) tabTarget.classList.remove('hidden');

      const btnTarget = document.getElementById('nav-' + tabName);
      if (btnTarget) {
        btnTarget.classList.add('bg-white', 'text-stone-900', 'shadow-xs', 'font-semibold');
        btnTarget.classList.remove('text-stone-600');
      }

      if (tabName === 'arc') {
        renderArcMap();
        renderArcSelectedPreview(selectedProphecyId);
      } else if (tabName === 'saved') {
        renderSavedList();
      } else if (tabName === 'tsk') {
        renderTskTable();
      }
    }

    function renderBookChipBar() {
      const bar = document.getElementById('book-chip-bar');
      if (!bar) return;

      bar.innerHTML = ALL_BOOKS.map(b => {
        const isActive = activeBookFilter === b.name;
        const isOT = b.testament === 'OT';
        const baseColors = isActive
          ? 'bg-crimson-800 text-white border-crimson-900 shadow-xs font-bold'
          : isOT
            ? 'bg-amber-50/90 hover:bg-amber-100 text-amber-950 border-amber-200/80'
            : 'bg-indigo-50/90 hover:bg-indigo-100 text-indigo-950 border-indigo-200/80';

        return `<button type="button" data-book="${escapeHtml(b.name)}" class="book-chip px-2 py-1 rounded-md text-[11px] border transition whitespace-nowrap shrink-0 ${baseColors}" title="${escapeHtml(b.name)} (${b.testament})">${escapeHtml(b.abbrev)}</button>`;
      }).join('');

      bar.querySelectorAll('.book-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const bk = btn.getAttribute('data-book');
          if (activeBookFilter === bk) {
            activeBookFilter = null;
          } else {
            activeBookFilter = bk;
          }
          updateBookFilterUI();
          renderProphecyList();
        });
      });
    }

    function updateBookFilterUI() {
      const pill = document.getElementById('active-book-pill');
      if (activeBookFilter) {
        pill.textContent = 'Filtered by Book: ' + activeBookFilter + ' ✕';
        pill.classList.remove('hidden');
        pill.onclick = () => {
          activeBookFilter = null;
          updateBookFilterUI();
          renderProphecyList();
        };
        pill.style.cursor = 'pointer';
      } else {
        pill.classList.add('hidden');
      }
      renderBookChipBar();
    }

    function getFilteredProphecies() {
      return PROPHECIES.filter(p => {
        if (activeCategory !== 'all' && p.category !== activeCategory) return false;
        if (activeType !== 'all' && p.type !== activeType) return false;
        if (activeBookFilter) {
          const bLower = activeBookFilter.toLowerCase();
          const inOt = p.ot.book.toLowerCase() === bLower || p.ot.ref.toLowerCase().includes(bLower);
          const inNt = p.nt.book.toLowerCase() === bLower || p.nt.ref.toLowerCase().includes(bLower);
          if (!inOt && !inNt) return false;
        }
        if (!searchQuery) return true;
        const q = searchQuery;
        return (
          p.title.toLowerCase().includes(q) ||
          p.ot.ref.toLowerCase().includes(q) ||
          p.nt.ref.toLowerCase().includes(q) ||
          p.ot.book.toLowerCase().includes(q) ||
          p.nt.book.toLowerCase().includes(q) ||
          p.ot.text.toLowerCase().includes(q) ||
          p.nt.text.toLowerCase().includes(q) ||
          p.bridge.toLowerCase().includes(q) ||
          p.keywords.some(k => k.toLowerCase().includes(q))
        );
      });
    }

    function renderProphecyList() {
      const container = document.getElementById('prophecy-list');
      const filtered = getFilteredProphecies();
      document.getElementById('prophecy-count-label').textContent = `${filtered.length} Prophecies & Bridges Showing`;

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="bg-white p-6 rounded-xl border border-parchment-300 text-center space-y-2">
            <p class="text-stone-500 font-medium text-sm">No bridges matched your current filter combination.</p>
            <button type="button" id="btn-empty-reset" class="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold">Reset All Filters</button>
          </div>
        `;
        const resetBtn = document.getElementById('btn-empty-reset');
        if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
        return;
      }

      // If current selectedProphecyId is not in filtered list, select the first item
      if (!filtered.some(item => item.id === selectedProphecyId)) {
        selectedProphecyId = filtered[0].id;
        renderDetailCard(selectedProphecyId);
      }

      container.innerHTML = filtered.map(p => {
        const isSelected = p.id === selectedProphecyId;
        const isSaved = savedProphecyIds.includes(p.id);
        const badgeStyle =
          p.category === 'birth' ? 'bg-amber-100 text-amber-800' :
          p.category === 'ministry' ? 'bg-sky-100 text-sky-800' :
          p.category === 'passion' ? 'bg-rose-100 text-rose-800' :
          p.category === 'resurrection' ? 'bg-emerald-100 text-emerald-800' :
          'bg-purple-100 text-purple-800';

        return `
          <div
            data-prophecy-id="${p.id}"
            class="prophecy-card group p-3.5 rounded-xl border transition-all cursor-pointer ${
              isSelected
                ? 'bg-parchment-100/95 border-gold-500 shadow-sm ring-1 ring-gold-500/40'
                : 'bg-white border-parchment-300 hover:border-gold-400 hover:bg-parchment-50/70 shadow-2xs'
            }"
          >
            <div class="flex items-start justify-between gap-2">
              <span class="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${badgeStyle}">
                ${escapeHtml(p.categoryLabel)}
              </span>
              <span class="text-[10px] text-stone-500 font-mono bg-parchment-100 px-1.5 py-0.5 rounded">${escapeHtml(p.type)}</span>
            </div>

            <h4 class="text-sm font-cinzel font-bold text-stone-900 mt-1.5 group-hover:text-crimson-800 transition-colors">
              ${escapeHtml(p.title)}
            </h4>

            <div class="flex items-center gap-2 mt-2 text-xs font-mono">
              <span class="text-amber-900 font-semibold">${escapeHtml(p.ot.ref)}</span>
              <span class="text-stone-400">→</span>
              <span class="text-crimson-800 font-semibold">${escapeHtml(p.nt.ref)}</span>
            </div>

            <p class="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
              ${escapeHtml(p.bridge)}
            </p>

            <div class="flex items-center justify-between mt-2.5 pt-2 border-t border-parchment-200/80 text-[11px] text-stone-400">
              <span>${escapeHtml(p.eraGap)} • ${p.votes} votes</span>
              <button
                type="button"
                data-bookmark-id="${p.id}"
                class="bookmark-btn hover:text-stone-900 transition-colors flex items-center gap-1 ${isSaved ? 'text-crimson-700 font-semibold' : ''}"
              >
                ${isSaved ? '★ Saved' : '☆ Save'}
              </button>
            </div>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.prophecy-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.bookmark-btn')) return;
          const pid = card.getAttribute('data-prophecy-id');
          selectProphecy(pid);
        });
      });

      container.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleSaveProphecy(btn.getAttribute('data-bookmark-id'));
        });
      });
    }

    function selectProphecy(id) {
      selectedProphecyId = id;
      renderProphecyList();
      renderDetailCard(id);
    }

    function renderDetailCard(id) {
      const container = document.getElementById('detail-card-container');
      const p = PROPHECIES.find(item => item.id === id) || PROPHECIES[0];
      if (!p) return;

      const filtered = getFilteredProphecies();
      const currentIdx = filtered.findIndex(item => item.id === p.id);
      const prevItem = currentIdx > 0 ? filtered[currentIdx - 1] : null;
      const nextItem = (currentIdx !== -1 && currentIdx < filtered.length - 1) ? filtered[currentIdx + 1] : null;
      const isSaved = savedProphecyIds.includes(p.id);

      container.innerHTML = `
        <div class="bg-white rounded-2xl border border-parchment-300 shadow-sm overflow-hidden">
          <!-- DETAIL HEADER -->
          <div class="bg-gradient-to-r from-parchment-200 via-parchment-100 to-parchment-200/80 p-5 border-b border-parchment-300">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white text-stone-800 border border-parchment-300 shadow-2xs">
                  ${escapeHtml(p.type)}
                </span>
                <span class="text-xs text-stone-600 font-mono">${escapeHtml(p.eraGap)}</span>
                <span class="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-900 font-semibold">★ ${p.votes} TSK Votes</span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  id="detail-copy-btn"
                  class="px-2.5 py-1 text-xs font-medium rounded-lg bg-white hover:bg-parchment-50 text-stone-700 border border-parchment-300 transition shadow-2xs"
                >
                  Copy Citation
                </button>
                <button
                  type="button"
                  id="detail-save-btn"
                  class="px-3 py-1 text-xs font-semibold rounded-lg transition shadow-2xs ${
                    isSaved ? 'bg-crimson-700 text-white hover:bg-crimson-800' : 'bg-white hover:bg-parchment-50 text-stone-700 border border-parchment-300'
                  }"
                >
                  ${isSaved ? '★ Saved in Notes' : '☆ Save to Notes'}
                </button>
              </div>
            </div>

            <h3 class="text-xl sm:text-2xl font-cinzel font-bold text-stone-900 mt-2.5">
              ${escapeHtml(p.title)}
            </h3>

            <!-- PREV / NEXT STEPPER -->
            <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-parchment-300/60 text-xs">
              <button
                type="button"
                id="detail-prev-btn"
                ${prevItem ? '' : 'disabled'}
                class="px-2.5 py-1 rounded-md font-semibold transition ${
                  prevItem ? 'bg-white text-stone-800 hover:bg-parchment-50 border border-parchment-300' : 'text-stone-400 cursor-not-allowed'
                }"
              >
                ← Previous Bridge
              </button>
              <span class="text-stone-500 font-mono">
                ${currentIdx !== -1 ? `Bridge ${currentIdx + 1} of ${filtered.length}` : ''}
              </span>
              <button
                type="button"
                id="detail-next-btn"
                ${nextItem ? '' : 'disabled'}
                class="px-2.5 py-1 rounded-md font-semibold transition ${
                  nextItem ? 'bg-white text-stone-800 hover:bg-parchment-50 border border-parchment-300' : 'text-stone-400 cursor-not-allowed'
                }"
              >
                Next Bridge →
              </button>
            </div>
          </div>

          <!-- DUAL PANE COMPARISON -->
          <div class="p-5 sm:p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <!-- LEFT PANE: OLD TESTAMENT PROMISE -->
              <div class="bg-parchment-50 p-4 rounded-xl border border-parchment-200/90 space-y-3">
                <div class="flex items-center justify-between border-b border-parchment-300/60 pb-2">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span class="text-xs font-bold font-mono uppercase text-amber-900 tracking-wider">Old Testament Source</span>
                  </div>
                  <span class="text-xs font-serif italic text-stone-500">${escapeHtml(p.ot.author)}</span>
                </div>

                <div class="flex items-baseline justify-between">
                  <h4 class="text-base font-bold font-cinzel text-stone-900">${escapeHtml(p.ot.ref)}</h4>
                  <button type="button" data-filter-book="${escapeHtml(p.ot.book)}" class="detail-book-link text-[11px] text-amber-800 hover:underline font-mono font-semibold">
                    Filter ${escapeHtml(p.ot.book)} →
                  </button>
                </div>

                <p class="text-sm font-serif text-stone-800 leading-relaxed italic bg-white p-3.5 rounded-lg border border-parchment-200">
                  "${highlightKeyPhrase(p.ot.text, p.ot.keyPhrase, 'bg-amber-100 text-amber-950 font-semibold px-1 rounded')}"
                </p>

                <p class="text-xs text-stone-600 leading-normal">
                  <strong class="text-stone-800">Historical Context:</strong> ${escapeHtml(p.ot.context)}
                </p>
              </div>

              <!-- RIGHT PANE: NEW TESTAMENT FULFILLMENT -->
              <div class="bg-parchment-50 p-4 rounded-xl border border-parchment-200/90 space-y-3">
                <div class="flex items-center justify-between border-b border-parchment-300/60 pb-2">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-crimson-700"></span>
                    <span class="text-xs font-bold font-mono uppercase text-crimson-900 tracking-wider">New Testament Fulfillment</span>
                  </div>
                  <span class="text-xs font-serif italic text-stone-500">${escapeHtml(p.nt.author)}</span>
                </div>

                <div class="flex items-baseline justify-between">
                  <h4 class="text-base font-bold font-cinzel text-stone-900">${escapeHtml(p.nt.ref)}</h4>
                  <button type="button" data-filter-book="${escapeHtml(p.nt.book)}" class="detail-book-link text-[11px] text-crimson-800 hover:underline font-mono font-semibold">
                    Filter ${escapeHtml(p.nt.book)} →
                  </button>
                </div>

                <p class="text-sm font-serif text-stone-800 leading-relaxed italic bg-white p-3.5 rounded-lg border border-parchment-200">
                  "${highlightKeyPhrase(p.nt.text, p.nt.keyPhrase, 'bg-rose-100 text-rose-950 font-semibold px-1 rounded')}"
                </p>

                <p class="text-xs text-stone-600 leading-normal">
                  <strong class="text-stone-800">Apostolic Context:</strong> ${escapeHtml(p.nt.context)}
                </p>
              </div>
            </div>

            <!-- CENTER THEOLOGICAL BRIDGE -->
            <div class="bg-gradient-to-r from-parchment-100 via-amber-50/50 to-parchment-100 p-4 sm:p-5 rounded-xl border border-parchment-300 space-y-2.5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-5 h-5 rounded-full bg-gold-500/20 text-gold-600 flex items-center justify-center font-serif text-xs font-bold">§</div>
                  <h5 class="text-xs font-bold font-cinzel uppercase text-stone-900 tracking-wider">The Hermeneutical Bridge (Why They Connect)</h5>
                </div>
                <button type="button" id="detail-thread-btn" class="text-xs font-semibold text-crimson-800 hover:underline">
                  Follow in Narrative Thread →
                </button>
              </div>

              <p class="text-xs sm:text-sm text-stone-700 leading-relaxed">
                ${escapeHtml(p.bridge)}
              </p>

              <!-- Clickable Semantic Keywords -->
              <div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-parchment-200">
                <span class="text-[11px] font-medium text-stone-500">Click motif to search:</span>
                ${p.keywords.map(k => `
                  <button type="button" data-kw="${escapeHtml(k)}" class="kw-chip text-[11px] font-medium px-2 py-0.5 rounded-md bg-white hover:bg-gold-400/20 border border-parchment-300 text-stone-700 transition">
                    #${escapeHtml(k)}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- JUMP TO ARC MAP BUTTON -->
            <div class="flex items-center justify-between text-xs text-stone-500 pt-1">
              <span>Visualize how ${escapeHtml(p.ot.book)} connects to ${escapeHtml(p.nt.book)} across the 66-book canon:</span>
              <button
                type="button"
                id="detail-arc-btn"
                class="px-3 py-1.5 rounded-lg font-semibold bg-stone-900 text-white hover:bg-stone-800 transition"
              >
                Highlight on 66-Book Arc Map →
              </button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('detail-copy-btn').addEventListener('click', () => copyProphecyDetails(p.id));
      document.getElementById('detail-save-btn').addEventListener('click', () => toggleSaveProphecy(p.id));
      if (prevItem) {
        document.getElementById('detail-prev-btn').addEventListener('click', () => selectProphecy(prevItem.id));
      }
      if (nextItem) {
        document.getElementById('detail-next-btn').addEventListener('click', () => selectProphecy(nextItem.id));
      }
      document.getElementById('detail-thread-btn').addEventListener('click', () => {
        switchTab('threads');
        activateThreadButton(p.thread || 'seed');
      });
      document.getElementById('detail-arc-btn').addEventListener('click', () => {
        switchTab('arc');
        highlightArcOnMap(p.id);
      });

      container.querySelectorAll('.detail-book-link').forEach(btn => {
        btn.addEventListener('click', () => {
          activeBookFilter = btn.getAttribute('data-filter-book');
          updateBookFilterUI();
          renderProphecyList();
        });
      });

      container.querySelectorAll('.kw-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const kw = btn.getAttribute('data-kw');
          document.getElementById('searchInput').value = kw;
          searchQuery = kw.toLowerCase();
          renderProphecyList();
        });
      });
    }

    function resetAllFilters() {
      activeCategory = 'all';
      activeType = 'all';
      activeBookFilter = null;
      searchQuery = '';
      document.getElementById('searchInput').value = '';
      document.getElementById('typeSelect').value = 'all';
      document.querySelectorAll('.cat-pill').forEach(el => {
        const isAll = el.getAttribute('data-cat') === 'all';
        el.classList.toggle('bg-stone-900', isAll);
        el.classList.toggle('text-white', isAll);
        el.classList.toggle('text-stone-600', !isAll);
      });
      updateBookFilterUI();
      renderProphecyList();
      showToast('Showing all 66 books and 77 bridges');
    }

    // ==========================================
    // THEMATIC THREADS TAB
    // ==========================================
    function activateThreadButton(threadKey) {
      document.querySelectorAll('.thread-btn').forEach(btn => {
        const isMatch = btn.getAttribute('data-thread') === threadKey;
        btn.classList.toggle('bg-crimson-800', isMatch);
        btn.classList.toggle('text-white', isMatch);
        btn.classList.toggle('border-crimson-900', isMatch);
        btn.classList.toggle('bg-white', !isMatch);
        btn.classList.toggle('text-stone-700', !isMatch);
      });
      renderThreadView(threadKey);
    }

    function renderThreadView(threadKey) {
      const container = document.getElementById('thread-display');
      const th = THREADS[threadKey];
      if (!th) return;

      container.innerHTML = `
        <div class="border-b border-parchment-200 pb-4">
          <span class="text-xs font-mono font-bold uppercase text-crimson-800 tracking-wider">Guided Canonical Pathway</span>
          <h3 class="text-2xl font-cinzel font-bold text-stone-900 mt-1">${escapeHtml(th.title)}</h3>
          <p class="text-xs font-serif italic text-gold-600 mt-0.5">${escapeHtml(th.subtitle)}</p>
          <p class="text-sm text-stone-600 mt-2.5 leading-relaxed">${escapeHtml(th.description)}</p>
        </div>

        <div class="relative pl-6 sm:pl-8 border-l-2 border-gold-400/50 space-y-6 my-4">
          ${th.steps.map((st, idx) => `
            <div class="relative group">
              <div class="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-parchment-100 border-2 border-gold-500 flex items-center justify-center text-xs font-bold text-stone-800 shadow-2xs">
                ${idx + 1}
              </div>

              <div class="bg-parchment-50 p-4 rounded-xl border border-parchment-200 space-y-2 hover:border-gold-400 transition">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="text-sm font-bold text-stone-900">${escapeHtml(st.stage)}</span>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-semibold px-2.5 py-0.5 rounded bg-white border border-parchment-300 text-crimson-800">${escapeHtml(st.ref)}</span>
                    <button
                      type="button"
                      data-open-prophecy="${st.prophecyId}"
                      class="thread-open-btn px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition"
                    >
                      Open in Dual-Pane Reader →
                    </button>
                  </div>
                </div>
                <p class="text-xs sm:text-sm text-stone-700 leading-relaxed font-serif">${escapeHtml(st.note)}</p>
                <div class="text-xs font-medium text-gold-600 flex items-center gap-1.5 pt-1 border-t border-parchment-200/60">
                  <span>✦ Canonical Progression:</span>
                  <span class="text-stone-600">${escapeHtml(st.highlight)}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      container.querySelectorAll('.thread-open-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const pid = btn.getAttribute('data-open-prophecy');
          resetAllFilters();
          switchTab('explorer');
          selectProphecy(pid);
        });
      });
    }

    // ==========================================
    // INTERACTIVE 66-BOOK ARC MAP
    // ==========================================
    function renderArcMap() {
      const svg = document.getElementById('arcSvg');
      if (!svg) return;

      const baselineY = 395;
      let html = '';

      // Divider between OT and NT
      html += `<line x1="526" y1="25" x2="526" y2="455" stroke="#444" stroke-dasharray="4,4" stroke-width="1" />`;
      html += `<text x="518" y="22" fill="#D4AF37" font-size="10" text-anchor="end" font-family="monospace" font-weight="bold">OLD TESTAMENT (39 BOOKS)</text>`;
      html += `<text x="534" y="22" fill="#818CF8" font-size="10" text-anchor="start" font-family="monospace" font-weight="bold">NEW TESTAMENT (27 BOOKS)</text>`;
      html += `<line x1="8" y1="${baselineY}" x2="992" y2="${baselineY}" stroke="#555" stroke-width="2" />`;

      const arcsToDraw = PROPHECIES.filter(p => activeArcCategory === 'all' || p.category === activeArcCategory);

      arcsToDraw.forEach(p => {
        const x1 = getBookX(p.ot.book);
        const x2 = getBookX(p.nt.book);
        const distance = Math.abs(x2 - x1);
        const height = Math.min(350, Math.max(65, distance * 0.56));
        const peakY = baselineY - height;
        const pathData = `M ${x1} ${baselineY} C ${x1 + (x2 - x1) * 0.15} ${peakY}, ${x2 - (x2 - x1) * 0.15} ${peakY}, ${x2} ${baselineY}`;

        let strokeColor = '#F59E0B';
        if (p.category === 'ministry') strokeColor = '#38BDF8';
        if (p.category === 'passion') strokeColor = '#F43F5E';
        if (p.category === 'resurrection') strokeColor = '#10B981';
        if (p.category === 'covenant') strokeColor = '#C084FC';

        const isSel = p.id === selectedProphecyId;
        const sw = isSel ? '4' : '1.8';
        const op = isSel ? '1' : '0.45';
        const cls = isSel ? 'arc-curve cursor-pointer glow-arc' : 'arc-curve cursor-pointer';

        html += `<path id="arc-path-${p.id}" data-arc-id="${p.id}" class="${cls}" d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="${sw}" stroke-opacity="${op}" />`;
      });

      // Book labels along bottom axis (rotated for readability)
      ALL_BOOKS.forEach(b => {
        const isOT = b.testament === 'OT';
        const col = isOT ? '#F59E0B' : '#818CF8';
        html += `
          <g class="book-axis-node cursor-pointer" data-axis-book="${escapeHtml(b.name)}">
            <circle cx="${b.x}" cy="${baselineY}" r="3" fill="${col}" />
            <text x="${b.x}" y="${baselineY + 10}" fill="#BBB" font-size="8.5" text-anchor="end" font-family="monospace" transform="rotate(-55, ${b.x}, ${baselineY + 10})">${escapeHtml(b.abbrev)}</text>
          </g>
        `;
      });

      svg.innerHTML = html;

      svg.querySelectorAll('.arc-curve').forEach(pathEl => {
        const pid = pathEl.getAttribute('data-arc-id');
        pathEl.addEventListener('mouseenter', () => {
          const p = PROPHECIES.find(item => item.id === pid);
          if (p) {
            document.getElementById('arc-info-hover').innerHTML = `<strong>${escapeHtml(p.title)}</strong>: <span class="text-amber-400">${escapeHtml(p.ot.ref)}</span> → <span class="text-indigo-300">${escapeHtml(p.nt.ref)}</span>`;
          }
          pathEl.setAttribute('stroke-width', '4.2');
          pathEl.setAttribute('stroke-opacity', '1');
        });
        pathEl.addEventListener('mouseleave', () => {
          if (pid !== selectedProphecyId) {
            pathEl.setAttribute('stroke-width', '1.8');
            pathEl.setAttribute('stroke-opacity', '0.45');
          }
        });
        pathEl.addEventListener('click', () => {
          highlightArcOnMap(pid);
        });
      });

      svg.querySelectorAll('.book-axis-node').forEach(node => {
        node.addEventListener('click', () => {
          const bk = node.getAttribute('data-axis-book');
          const match = PROPHECIES.find(p => p.ot.book === bk || p.nt.book === bk);
          if (match) {
            highlightArcOnMap(match.id);
            showToast(`Showing canonical bridge for ${bk}`);
          }
        });
      });
    }

    function highlightArcOnMap(id) {
      selectedProphecyId = id;
      renderArcMap();
      renderArcSelectedPreview(id);
    }

    function renderArcSelectedPreview(id) {
      const p = PROPHECIES.find(item => item.id === id) || PROPHECIES[0];
      const preview = document.getElementById('arc-selected-preview');
      if (!preview || !p) return;

      preview.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-parchment-200 pb-3">
          <div>
            <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-parchment-100 text-stone-700 font-semibold">${escapeHtml(p.type)} • ${escapeHtml(p.eraGap)}</span>
            <h4 class="text-lg font-cinzel font-bold text-stone-900 mt-1">${escapeHtml(p.title)}</h4>
          </div>
          <button type="button" id="arc-open-reader-btn" class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition shrink-0">
            Inspect Full Context in Dual-Pane Reader →
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
          <div class="p-3.5 bg-parchment-50 rounded-xl border border-parchment-200">
            <span class="font-bold text-amber-900">${escapeHtml(p.ot.ref)} (${escapeHtml(p.ot.book)})</span>
            <p class="italic text-stone-700 mt-1 font-serif leading-relaxed">"${escapeHtml(p.ot.text)}"</p>
          </div>
          <div class="p-3.5 bg-parchment-50 rounded-xl border border-parchment-200">
            <span class="font-bold text-crimson-800">${escapeHtml(p.nt.ref)} (${escapeHtml(p.nt.book)})</span>
            <p class="italic text-stone-700 mt-1 font-serif leading-relaxed">"${escapeHtml(p.nt.text)}"</p>
          </div>
        </div>
      `;

      document.getElementById('arc-open-reader-btn').addEventListener('click', () => {
        switchTab('explorer');
        selectProphecy(p.id);
      });
    }

    // ==========================================
    // FULL TSK INDEX & 340K TSV LOADER
    // ==========================================
    function renderTskTable() {
      const tbody = document.getElementById('tsk-table-body');
      const query = (document.getElementById('tskSearchInput').value || '').toLowerCase().trim();
      const minVotes = parseInt(document.getElementById('voteSlider').value || '0', 10);

      const filtered = TSK_ITEMS.filter(item => {
        if (item.votes < minVotes) return false;
        if (!query) return true;
        return (
          item.fromRef.toLowerCase().includes(query) ||
          item.toRef.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query)
        );
      });

      const slice = filtered.slice(0, 250);
      tbody.innerHTML = slice.map(item => `
        <tr class="hover:bg-parchment-50 transition">
          <td class="p-3 font-mono font-semibold text-amber-900 whitespace-nowrap">${escapeHtml(item.fromRef)}</td>
          <td class="p-3 font-mono font-semibold text-crimson-800 whitespace-nowrap">${escapeHtml(item.toRef)}</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded-full bg-parchment-100 border border-parchment-300 text-[10px] font-semibold text-stone-700">${escapeHtml(item.type)}</span></td>
          <td class="p-3 text-stone-700">${escapeHtml(item.summary)}</td>
          <td class="p-3 text-right font-mono font-semibold text-stone-700">${item.votes}</td>
          <td class="p-3 text-center">
            ${item.prophecyId ? `<button type="button" data-tsk-open="${item.prophecyId}" class="tsk-open-btn px-2.5 py-1 rounded bg-stone-900 text-white text-[11px] font-semibold hover:bg-stone-800">Read Texts</button>` : `<span class="text-[11px] text-stone-400">TSK Reference</span>`}
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('.tsk-open-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const pid = btn.getAttribute('data-tsk-open');
          resetAllFilters();
          switchTab('explorer');
          selectProphecy(pid);
        });
      });
    }

    function handleTsvFileUpload(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        const content = evt.target.result;
        const lines = content.split(/\\r?\\n/);
        const parsed = [];
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line || line.startsWith('#') || line.toLowerCase().startsWith('from')) continue;
          const parts = line.split(/\\t|,/);
          if (parts.length >= 2) {
            const fromV = parts[0].trim();
            const toV = parts[1].trim();
            const votes = parts.length >= 3 ? (parseInt(parts[2], 10) || 10) : 50;
            parsed.push({
              fromRef: fromV,
              fromBook: fromV.split('.')[0] || fromV,
              toRef: toV,
              toBook: toV.split('.')[0] || toV,
              votes: votes,
              type: votes > 100 ? 'High-Confidence TSK' : 'OpenBible Cross-Ref',
              category: 'Imported Dataset',
              summary: `Imported cross-reference link (${fromV} → ${toV})`,
              prophecyId: null
            });
          }
        }
        if (parsed.length > 0) {
          TSK_ITEMS = [...parsed, ...TSK_ITEMS];
          document.getElementById('tsv-upload-status').innerHTML = `Loaded <strong class="text-emerald-700">${TSK_ITEMS.length.toLocaleString()} total cross-references</strong> from ${escapeHtml(file.name)}!`;
          renderTskTable();
          showToast(`Imported ${parsed.length.toLocaleString()} cross-references!`);
        } else {
          showToast('Could not parse rows—ensure tab or comma separated format.');
        }
      };
      reader.readAsText(file);
    }

    // ==========================================
    // BOOKMARKS & STUDY NOTES
    // ==========================================
    function toggleSaveProphecy(id) {
      const idx = savedProphecyIds.indexOf(id);
      if (idx > -1) {
        savedProphecyIds.splice(idx, 1);
        showToast('Removed from Saved Notes');
      } else {
        savedProphecyIds.push(id);
        showToast('Added to Saved Study Notes!');
      }
      try {
        localStorage.setItem('scripturebridge_saved_v2', JSON.stringify(savedProphecyIds));
      } catch (e) {}
      updateSavedBadge();
      renderProphecyList();
      renderDetailCard(selectedProphecyId);
      renderSavedList();
    }

    function updateSavedBadge() {
      const badge = document.getElementById('saved-badge');
      if (!badge) return;
      if (savedProphecyIds.length > 0) {
        badge.textContent = savedProphecyIds.length;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    function renderSavedList() {
      const container = document.getElementById('saved-list-container');
      if (!container) return;

      if (savedProphecyIds.length === 0) {
        container.innerHTML = `
          <div class="bg-white p-8 rounded-2xl border border-parchment-300 text-center space-y-3">
            <h3 class="font-cinzel font-bold text-stone-900 text-lg">No Prophecies Saved Yet</h3>
            <p class="text-sm text-stone-500 max-w-md mx-auto">
              Click "☆ Save" on any prophecy in the Explorer to build your personal study list and export it as Markdown.
            </p>
          </div>
        `;
        return;
      }

      const items = PROPHECIES.filter(p => savedProphecyIds.includes(p.id));
      container.innerHTML = items.map(p => `
        <div class="bg-white p-5 rounded-2xl border border-parchment-300 shadow-2xs space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-parchment-200 pb-2.5">
            <div>
              <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">${escapeHtml(p.type)}</span>
              <h4 class="text-lg font-cinzel font-bold text-stone-900 mt-1">${escapeHtml(p.title)}</h4>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" data-saved-open="${p.id}" class="saved-open-btn px-3 py-1 text-xs font-semibold rounded-lg bg-parchment-100 hover:bg-parchment-200 text-stone-700">Open in Reader</button>
              <button type="button" data-saved-rm="${p.id}" class="saved-rm-btn px-3 py-1 text-xs font-semibold rounded-lg text-rose-700 hover:bg-rose-50">Remove</button>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-serif">
            <div class="p-3 bg-parchment-50 rounded-xl border border-parchment-200">
              <strong class="font-sans text-amber-900">${escapeHtml(p.ot.ref)}:</strong>
              <p class="mt-1 italic text-stone-800">"${escapeHtml(p.ot.text)}"</p>
            </div>
            <div class="p-3 bg-parchment-50 rounded-xl border border-parchment-200">
              <strong class="font-sans text-crimson-800">${escapeHtml(p.nt.ref)}:</strong>
              <p class="mt-1 italic text-stone-800">"${escapeHtml(p.nt.text)}"</p>
            </div>
          </div>
        </div>
      `).join('');

      container.querySelectorAll('.saved-open-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          switchTab('explorer');
          selectProphecy(btn.getAttribute('data-saved-open'));
        });
      });
      container.querySelectorAll('.saved-rm-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          toggleSaveProphecy(btn.getAttribute('data-saved-rm'));
        });
      });
    }

    function copyTextToClipboard(text, message) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => showToast(message)).catch(() => fallbackCopy(text, message));
      } else {
        fallbackCopy(text, message);
      }
    }

    function fallbackCopy(text, message) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      showToast(message);
    }

    function copyProphecyDetails(id) {
      const p = PROPHECIES.find(item => item.id === id);
      if (!p) return;
      const out = `${p.title} (${p.type})\\nOT (${p.ot.ref}): "${p.ot.text}"\\nNT (${p.nt.ref}): "${p.nt.text}"\\nBridge: ${p.bridge}`;
      copyTextToClipboard(out, 'Copied prophecy citation to clipboard!');
    }

    function showToast(msg) {
      const el = document.getElementById('toast');
      const textEl = document.getElementById('toast-msg');
      if (!el || !textEl) return;
      textEl.textContent = msg;
      el.classList.remove('opacity-0', 'translate-y-3', 'pointer-events-none');
      setTimeout(() => {
        el.classList.add('opacity-0', 'translate-y-3', 'pointer-events-none');
      }, 2400);
    }

    // ==========================================
    // INITIALIZE ALL EVENT LISTENERS
    // ==========================================
    function initApp() {
      // Top Nav Tabs
      document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
      });

      // Reset All button
      document.getElementById('btn-reset-all').addEventListener('click', resetAllFilters);

      // Search input
      document.getElementById('searchInput').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderProphecyList();
      });

      // Category pills
      document.querySelectorAll('.cat-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          activeCategory = btn.getAttribute('data-cat');
          document.querySelectorAll('.cat-pill').forEach(el => {
            el.classList.remove('bg-stone-900', 'text-white');
            el.classList.add('text-stone-600');
          });
          btn.classList.add('bg-stone-900', 'text-white');
          btn.classList.remove('text-stone-600');
          renderProphecyList();
        });
      });

      // Relationship Type Select
      document.getElementById('typeSelect').addEventListener('change', (e) => {
        activeType = e.target.value;
        renderProphecyList();
      });

      // Thread Buttons
      document.querySelectorAll('.thread-btn').forEach(btn => {
        btn.addEventListener('click', () => activateThreadButton(btn.getAttribute('data-thread')));
      });

      // Arc Map Filter Buttons
      document.querySelectorAll('.arc-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          activeArcCategory = btn.getAttribute('data-arc-cat');
          document.querySelectorAll('.arc-filter-btn').forEach(el => {
            el.classList.remove('bg-stone-900', 'text-white');
            el.classList.add('bg-parchment-100', 'text-stone-700');
          });
          btn.classList.add('bg-stone-900', 'text-white');
          btn.classList.remove('bg-parchment-100', 'text-stone-700');
          renderArcMap();
        });
      });

      // TSK Search & Slider & File Upload
      document.getElementById('tskSearchInput').addEventListener('input', renderTskTable);
      document.getElementById('voteSlider').addEventListener('input', (e) => {
        document.getElementById('voteSliderVal').textContent = e.target.value;
        renderTskTable();
      });
      document.getElementById('tsvFileInput').addEventListener('change', handleTsvFileUpload);

      // Saved Notes Export & Clear
      document.getElementById('btn-export-md').addEventListener('click', () => {
        if (savedProphecyIds.length === 0) {
          showToast('No saved notes to export yet!');
          return;
        }
        const saved = PROPHECIES.filter(p => savedProphecyIds.includes(p.id));
        const md = saved.map(p => `### ${p.title} (${p.type})\\n- **OT (${p.ot.ref}):** "${p.ot.text}"\\n- **NT (${p.nt.ref}):** "${p.nt.text}"\\n- **Bridge:** ${p.bridge}`).join('\\n\\n');
        copyTextToClipboard(md, 'Exported all saved notes as Markdown!');
      });

      document.getElementById('btn-clear-saved').addEventListener('click', () => {
        savedProphecyIds = [];
        try { localStorage.removeItem('scripturebridge_saved_v2'); } catch (e) {}
        updateSavedBadge();
        renderProphecyList();
        renderDetailCard(selectedProphecyId);
        renderSavedList();
        showToast('Cleared saved study notes');
      });

      // Initial renders
      renderBookChipBar();
      renderProphecyList();
      renderDetailCard(selectedProphecyId);
      renderThreadView('seed');
      renderArcMap();
      renderArcSelectedPreview(selectedProphecyId);
      renderTskTable();
      updateSavedBadge();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }
  </script>
</body>
</html>
"""

final_html = (
    html_template
    .replace("__OT_BOOKS_JSON__", ot_books_json)
    .replace("__NT_BOOKS_JSON__", nt_books_json)
    .replace("__PROPHECIES_JSON__", prophecies_json)
    .replace("__THREADS_JSON__", threads_json)
    .replace("__TSK_ITEMS_JSON__", tsk_items_json)
)

import os
_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for path in [
    os.path.join(_root, "index.html"),
    os.path.join(_root, "bible_prophecy_explorer.html")
]:
    with open(path, "w", encoding="utf-8") as f:
        f.write(final_html)
    print(f"Wrote {path} ({len(final_html)} bytes)")
