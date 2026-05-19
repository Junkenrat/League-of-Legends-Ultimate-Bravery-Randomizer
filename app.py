from flask import Flask, redirect, request
from flask import render_template
from flask import url_for


application = Flask(__name__)
application.config['SECRET_KEY'] = 'yandexlyceum_secret_key'


def main():
    application.run()


@application.route('/')
@application.route('/home')
def index():
    champion_data = [
        {"name": "aatrox", "type": "m"},
        {"name": "ahri", "type": "r"},
        {"name": "akali", "type": "m"},
        {"name": "akshan", "type": "r"},
        {"name": "alistar", "type": "m"},
        {"name": "ambessa", "type": "m"},
        {"name": "amumu", "type": "m"},
        {"name": "anivia", "type": "r"},
        {"name": "annie", "type": "r"},
        {"name": "aphelios", "type": "r"},
        {"name": "ashe", "type": "r"},
        {"name": "aurelion sol", "type": "r"},
        {"name": "aurora", "type": "r"},
        {"name": "azir", "type": "r"},
        {"name": "bard", "type": "r"},
        {"name": "bel'veth", "type": "m"},
        {"name": "blitzcrank", "type": "m"},
        {"name": "brand", "type": "r"},
        {"name": "braum", "type": "m"},
        {"name": "briar", "type": "m"},
        {"name": "caitlyn", "type": "r"},
        {"name": "camille", "type": "m"},
        {"name": "cassiopeia", "type": "m"},
        {"name": "cho'gath", "type": "m"},
        {"name": "corki", "type": "m"},
        {"name": "darius", "type": "m"},
        {"name": "diana", "type": "m"},
        {"name": "dr. mundo", "type": "m"},
        {"name": "draven", "type": "r"},
        {"name": "ekko", "type": "m"},
        {"name": "elise", "type": "m"},
        {"name": "evelynn", "type": "m"},
        {"name": "ezreal", "type": "r"},
        {"name": "fiddlesticks", "type": "r"},
        {"name": "fiora", "type": "m"},
        {"name": "fizz", "type": "m"},
        {"name": "galio", "type": "m"},
        {"name": "gangplank", "type": "m"},
        {"name": "garen", "type": "m"},
        {"name": "gnar", "type": "r"},
        {"name": "gragas", "type": "m"},
        {"name": "graves", "type": "r"},
        {"name": "gwen", "type": "m"},
        {"name": "hecarim", "type": "m"},
        {"name": "heimerdinger", "type": "r"},
        {"name": "hwei", "type": "r"},
        {"name": "illaoi", "type": "m"},
        {"name": "irelia", "type": "m"},
        {"name": "ivern", "type": "r"},
        {"name": "janna", "type": "r"},
        {"name": "jarvan iv", "type": "m"},
        {"name": "jax", "type": "m"},
        {"name": "jayce", "type": "r"},
        {"name": "jhin", "type": "r"},
        {"name": "jinx", "type": "r"},
        {"name": "k'sante", "type": "m"},
        {"name": "kai'sa", "type": "r"},
        {"name": "kalista", "type": "r"},
        {"name": "karma", "type": "r"},
        {"name": "karthus", "type": "m"},
        {"name": "kassadin", "type": "m"},
        {"name": "katarina", "type": "m"},
        {"name": "kayle", "type": "r"},
        {"name": "kayn", "type": "m"},
        {"name": "kennen", "type": "r"},
        {"name": "kha'zix", "type": "m"},
        {"name": "kindred", "type": "r"},
        {"name": "kled", "type": "m"},
        {"name": "kog'maw", "type": "r"},
        {"name": "leblanc", "type": "r"},
        {"name": "lee sin", "type": "m"},
        {"name": "leona", "type": "m"},
        {"name": "lillia", "type": "m"},
        {"name": "lissandra", "type": "r"},
        {"name": "lucian", "type": "r"},
        {"name": "lulu", "type": "r"},
        {"name": "lux", "type": "r"},
        {"name": "malphite", "type": "m"},
        {"name": "malzahar", "type": "r"},
        {"name": "maokai", "type": "m"},
        {"name": "master yi", "type": "m"},
        {"name": "mel", "type": "r"},
        {"name": "milio", "type": "r"},
        {"name": "miss fortune", "type": "r"},
        {"name": "mordekaiser", "type": "m"},
        {"name": "morgana", "type": "r"},
        {"name": "naafiri", "type": "m"},
        {"name": "nami", "type": "r"},
        {"name": "nasus", "type": "m"},
        {"name": "nautilus", "type": "m"},
        {"name": "neeko", "type": "r"},
        {"name": "nidalee", "type": "m"},
        {"name": "nilah", "type": "m"},
        {"name": "nocturne", "type": "m"},
        {"name": "nunu & willump", "type": "m"},
        {"name": "olaf", "type": "m"},
        {"name": "orianna", "type": "r"},
        {"name": "ornn", "type": "m"},
        {"name": "pantheon", "type": "m"},
        {"name": "poppy", "type": "m"},
        {"name": "pyke", "type": "m"},
        {"name": "qiyana", "type": "m"},
        {"name": "quinn", "type": "r"},
        {"name": "rakan", "type": "m"},
        {"name": "rammus", "type": "m"},
        {"name": "rek'sai", "type": "m"},
        {"name": "rell", "type": "m"},
        {"name": "renata glasc", "type": "r"},
        {"name": "renekton", "type": "m"},
        {"name": "rengar", "type": "m"},
        {"name": "riven", "type": "m"},
        {"name": "rumble", "type": "m"},
        {"name": "ryze", "type": "r"},
        {"name": "samira", "type": "m"},
        {"name": "sejuani", "type": "m"},
        {"name": "senna", "type": "r"},
        {"name": "seraphine", "type": "r"},
        {"name": "sett", "type": "m"},
        {"name": "shaco", "type": "m"},
        {"name": "shen", "type": "m"},
        {"name": "shyvana", "type": "m"},
        {"name": "singed", "type": "m"},
        {"name": "sion", "type": "m"},
        {"name": "sivir", "type": "r"},
        {"name": "skarner", "type": "m"},
        {"name": "smolder", "type": "r"},
        {"name": "sona", "type": "r"},
        {"name": "soraka", "type": "r"},
        {"name": "swain", "type": "r"},
        {"name": "sylas", "type": "m"},
        {"name": "syndra", "type": "r"},
        {"name": "tahm kench", "type": "m"},
        {"name": "taliyah", "type": "r"},
        {"name": "talon", "type": "m"},
        {"name": "taric", "type": "m"},
        {"name": "teemo", "type": "r"},
        {"name": "thresh", "type": "m"},
        {"name": "tristana", "type": "r"},
        {"name": "trundle", "type": "m"},
        {"name": "tryndamere", "type": "m"},
        {"name": "twisted fate", "type": "r"},
        {"name": "twitch", "type": "r"},
        {"name": "udyr", "type": "m"},
        {"name": "urgot", "type": "m"},
        {"name": "varus", "type": "r"},
        {"name": "vayne", "type": "r"},
        {"name": "veigar", "type": "r"},
        {"name": "vel'koz", "type": "r"},
        {"name": "vex", "type": "r"},
        {"name": "vi", "type": "m"},
        {"name": "viego", "type": "m"},
        {"name": "viktor", "type": "r"},
        {"name": "vladimir", "type": "r"},
        {"name": "volibear", "type": "m"},
        {"name": "warwick", "type": "m"},
        {"name": "wukong", "type": "m"},
        {"name": "xayah", "type": "r"},
        {"name": "xerath", "type": "r"},
        {"name": "xin zhao", "type": "m"},
        {"name": "yasuo", "type": "m"},
        {"name": "yone", "type": "m"},
        {"name": "yorick", "type": "m"},
        {"name": "yunara", "type": "r"},
        {"name": "yuumi", "type": "r"},
        {"name": "zaahen", "type": "m"},
        {"name": "zac", "type": "m"},
        {"name": "zed", "type": "m"},
        {"name": "zeri", "type": "m"},
        {"name": "ziggs", "type": "r"},
        {"name": "zilean", "type": "r"},
        {"name": "zoe", "type": "r"},
        {"name": "zyra", "type": "r"}
    ]

    champion_names = [
        "aatrox", "ahri", "akali", "akshan", "alistar", "aurora",
        "amumu", "anivia", "annie", "aphelios", "ambessa",
        "ashe", "aurelion sol", "azir", "bard", "bel'veth", 
        "blitzcrank", "brand", "braum", "briar", "caitlyn", 
        "camille", "cassiopeia", "cho'gath", "corki", "darius", 
        "diana", "draven", "dr. mundo", "ekko", "elise", 
        "evelynn", "ezreal", "fiddlesticks", "fiora", "fizz", 
        "galio", "gangplank", "garen", "gnar", "gragas", 
        "graves", "gwen", "hecarim", "heimerdinger", "hwei", 
        "illaoi", "irelia", "ivern", "janna", "jarvan iv", "jhin",
        "jax", "jayce", "jinx", "kai'sa", "kalista", "k'sante",
        "karma", "karthus", "kassadin", "katarina", "kayle", 
        "kayn", "kennen", "kha'zix", "kindred", "kled", "kog'maw", 
        "leblanc", "lee sin", "leona", "lillia", 
        "lissandra", "lucian", "lulu", "lux", "malphite", "mel",
        "malzahar", "maokai", "master yi", "milio", "miss fortune", 
        "mordekaiser", "morgana", "naafiri", "nami", "nasus", 
        "nautilus", "neeko", "nidalee", "nilah", "nocturne", 
        "nunu & willump", "olaf", "orianna", "ornn", "pantheon", 
        "poppy", "pyke", "qiyana", "quinn", "rakan", 
        "rammus", "rek'sai", "rell", "renata glasc", "renekton", 
        "rengar", "riven", "rumble", "ryze", "samira", 
        "sejuani", "senna", "seraphine", "sett", "shaco", 
        "shen", "shyvana", "singed", "sion", "sivir", 
        "skarner", "sona", "soraka", "swain", "sylas", "smolder",
        "syndra", "tahm kench", "taliyah", "talon", "taric", 
        "teemo", "thresh", "tristana", "trundle", "tryndamere", 
        "twisted fate", "twitch", "udyr", "urgot", "varus", 
        "vayne", "veigar", "vel'koz", "vex", "vi", "viego", 
        "viktor", "vladimir", "volibear", "warwick", "wukong", 
        "xayah", "xerath", "xin zhao", "yasuo", "yone", 
        "yorick", "yuumi", "yunara", "zaahen", "zac", "zed", 
        "zeri", "ziggs", "zilean", "zoe", "zyra"
    ]

    items_names = [
        "abyssal mask", "actualizer", "archangel's staff", "ardent censer", "axiom arc",
        "banshee's veil", "black cleaver", "blackfire torch", "bandlepipes", "bastionbreaker",
        "blade of the ruined king", "bloodletter's curse", "bloodthirster",
        "chempunk chainsword", "cosmic drive", "cryptbloom", "dusk and dawn",
        "dawncore", "dead man's plate", "death's dance", "echoes of helia",
        "eclipse", "edge of night", "essence reaver", "endless hunger",
        "experimental hexplate", "force of nature", "frozen heart", "fiendhunter bolts",
        "goinsoo's rageblade", "guardian angel", "heartsteel", 
        "hextech rocketbelt", "hollow radiance", "horizon focus",
        "hubris", "hullbreaker", "hexoptics c44", "hextech gunblade", "iceborn gauntlet", "immortal shieldbow",
        "imperial mandate", "infinity edge", "jak'sho, the protean",
        "kaenic rookern", "knight's vow", "kraken slayer", "liandry's torment",
        "lich bane", "locket of the iron solari", "lord dominik's regards", 
        "luden's companion", "malignance", "manamune", "maw of malmortius",
        "mejai's soulstealer", "mercurial scimitar", "mikael's blessing", "moonstone renewer", 
        "morellonomicon", "mortal reminder", "nashor's tooth", "navori flickerblade", 
        #"opportunity",
        "overlord's bloodmail", "phantom dance", "profane hydra", "protoplasm harness", "rabadon's deathcap",
        "randouin's omen", "rapid canonfire", "ravenous hydra", "redemption",
        "riftmaker", "rod of ages", "runaan's hurricane", "rylai's crystal scepter", "serpent's fang", 
        "serylda's grudge", "shadowflame", "shurelya's battlesong", "spear of shojin", "spirit visage",
        "staff of flowing water", "statikk shiv", "sterack's cage", "stormsurge", "stormrazor",
        "stridebreaker", "sundered sky", "sunfire aegis", "terminus",
        "the collector", "thornmail", "titanic hydra",
        #"trailblazer", 
        "trinity force", "umbral glaive",
        "unending despair", "void staff", "voltaic cyclosword", "whispering circlet",
        "warmog's armor", "winter's approach", "wit's end", "youmuu's ghostblade",
        "yun tal wildarrows", "zeke's convergence", "zhonya's hourglass"
    ]

    runes_branches_names = [
        "precision", "domination", "resolve", "sorcery", "inspiration"
    ]

    champion_arts = [
        {
            "name": el["name"].lower(),
            "type": el["type"],
            "image": f"/static/images/character_arts/{el['name'].lower()}.jpg"
        }
        for el in champion_data
]

    champion_icons = [
        {
            "name": name.lower(),
            "image": f"/static/images/character_icons/{name.lower()}.png"
        }
        for name in champion_names
    ]

    legendary_items = [
        {
            "name": name.lower(),
            "image": f"/static/images/items/legendary/{name.lower()}.png"
        }
        for name in items_names
    ] 

    abilities = []
    for name in champion_names:
        for key in ['q', 'w', 'e']:
            abilities.append({
                "name": f"{name.lower()}_{key}",
                "image": f"/static/images/abilities/{name.lower()}/{name.lower()}_{key}.webp"
            })
    
    runes_branches = [
        {
            "name": name.lower(),
            "image": f"/static/images/runes/branches/{name.lower()}.webp"
        }
        for name in runes_branches_names
    ]

    common_start_items = [
        {"name": 'boots', "image": url_for("static", filename="images/items/start/common/boots.webp")},
        {"name": 'cull', "image": url_for("static", filename="images/items/start/common/cull.webp")},
        {"name": 'dark Seal', "image": url_for("static", filename="images/items/start/common/dark seal.webp")},
        {"name": "doran's blade", "image": url_for("static", filename="images/items/start/common/doran's blade.webp")},
        {"name": "doran's ring", "image": url_for("static", filename="images/items/start/common/doran's ring.webp")},
        {"name": "doran's shield", "image": url_for("static", filename="images/items/start/common/doran's shield.webp")},
        {"name": "doran's bow", "image": url_for("static", filename="images/items/start/common/doran's bow.webp")},
        {"name": "doran's helm", "image": url_for("static", filename="images/items/start/common/doran's helm.webp")},
        #{"name": 'long sword', "image": url_for("static", filename="images/items/start/common/long sword.webp")}
    ] 

    jungle_start_items = [
        {"name": 'Gustwalker Hatchling', "image": url_for("static", filename="images/items/start/jungle/gustwalker hatchling.webp")},
        {"name": 'Mosstomper Seedling', "image": url_for("static", filename="images/items/start/jungle/mosstomper seedling.webp")},
        {"name": 'Scorchclaw Pup', "image": url_for("static", filename="images/items/start/jungle/scorchclaw pup.webp")},
    ]

    support_start_items = [
        {"name": 'Bloodsong', "image": url_for("static", filename="images/items/start/support/bloodsong.webp")},
        {"name": 'Celestial Opposition', "image": url_for("static", filename="images/items/start/support/celestial opposition.webp")},
        {"name": 'Dream Maker', "image": url_for("static", filename="images/items/start/support/dream maker.webp")},
        {"name": 'Solstice Sleigh', "image": url_for("static", filename="images/items/start/support/solstice sleigh.webp")},
        {"name": "Zaz'Zak's Realmspike", "image": url_for("static", filename="images/items/start/support/zaz'zak's realmspike.webp")}
    ]

    boots = [
        {"name": "Berserker's Greaves", "image": url_for("static", filename="images/items/boots/Berserker's Greaves.png")},
        {"name": 'Boots of Switness', "image": url_for("static", filename="images/items/boots/Boots of Switness.png")},
        {"name": 'Ionian Boots of Lucidity', "image": url_for("static", filename="images/items/boots/Ionian Boots of Lucidity.png")},
        {"name": "Mercury's Treads", "image": url_for("static", filename="images/items/boots/Mercury's Treads.png")},
        {"name": "Plated Steelcaps", "image": url_for("static", filename="images/items/boots/Plated Steelcaps.png")},
        {"name": "Sorcerer's Shoes", "image": url_for("static", filename="images/items/boots/Sorcerer's Shoes.png")},
        {"name": "Gluttonous Greaves", "image": url_for("static", filename="images/items/boots/Gluttonous Greaves.png")},
        #{"name": 'Symbiotic Soles', "image": url_for("static", filename="images/items/boots/Symbiotic Soles.png")},
    ]

    roles = [
        {"name": "Top", "image": url_for("static", filename="images/roles/top.png")},
        {"name": 'Jungle', "image": url_for("static", filename="images/roles/jungle.png")},
        {"name": 'Mid', "image": url_for("static", filename="images/roles/mid.png")},
        {"name": "Bot", "image": url_for("static", filename="images/roles/bot.png")},
        {"name": "Support", "image": url_for("static", filename="images/roles/support.png")},
    ]

    summoners = [
        {"name": 'Barrier', "image": url_for("static", filename="images/summoners/barrier.png")},
        {"name": 'Cleanse', "image": url_for("static", filename="images/summoners/cleanse.png")},
        {"name": 'Exhaust', "image": url_for("static", filename="images/summoners/exhaust.png")},
        {"name": 'Flash', "image": url_for("static", filename="images/summoners/flash.png")},
        {"name": 'Ghost', "image": url_for("static", filename="images/summoners/ghost.png")},
        {"name": 'Heal', "image": url_for("static", filename="images/summoners/heal.png")},
        {"name": 'Ignite', "image": url_for("static", filename="images/summoners/ignite.png")},
        {"name": 'Teleport', "image": url_for("static", filename="images/summoners/teleport.png")},
    ]

    smite = [
        {"name": 'Smite', "image": url_for("static", filename="images/summoners/smite.png")}
    ]

    return render_template(
        'index.html',
        summoners_json=summoners,
        champion_arts_json=champion_arts,
        champion_icons_json=champion_icons,
        common_start_items_json=common_start_items, 
        jungle_start_items_json=jungle_start_items,
        support_start_items_json=support_start_items,
        legendary_items_json=legendary_items,
        boots_json=boots,
        roles_json=roles,
        smite_json=smite,
        abilities_json=abilities,
        runes_branches_json=runes_branches
    )


if __name__ == "__main__":
    application.run(debug=True)
