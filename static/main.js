// ============================================================================
// Load data from the data-* attributes of a hidden container (passed from Flask)
// ============================================================================
const container = document.getElementById("data-container");
const summoners = JSON.parse(container.dataset.summoners);              // regular summoner spells
const smite = JSON.parse(container.dataset.smite);                       // smite (used only in Jungle)
const champion_arts = JSON.parse(container.dataset.championArts);        // champion arts (main card background)
const champion_icons = JSON.parse(container.dataset.championIcons);      // champion icons (for the ban)
const common_start_items = JSON.parse(container.dataset.commonStartItems);
const jungle_start_items = JSON.parse(container.dataset.jungleStartItems);
const support_start_items = JSON.parse(container.dataset.supportStartItems);
const legendary_items = JSON.parse(container.dataset.legendaryItems);    // legendary items (5 or 6 per roll)
const boots = JSON.parse(container.dataset.boots);
const roles = JSON.parse(container.dataset.roles);                       // Top, Jungle, Mid, Bot, Support
const abilities = JSON.parse(container.dataset.abilities);               // abilities of all champions (q/w/e)
const runes_branches = JSON.parse(container.dataset.runesBranches);      // 5 rune branches

// Roll history (localStorage). Limited to 15 entries.
function loadData() {
  const raw = localStorage.getItem("myListOfLists");
  if (!raw) return []; // always an array
  return deserialize(raw);
}

const STORAGE_KEY = "myListOfLists";
const myData = loadData();

// ============================================================================
// Role filter: the buttons to the left of the main card toggle which roles
// are allowed during the roll. One click selects only that role,
// a second click turns the filter off (then the role is chosen from all).
// ============================================================================
const role_buttons = document.querySelectorAll('.role-toggle');
role_buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('active')) {
      btn.classList.remove('active'); // turn off on a repeated click
    } else {
      role_buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  });
});

// ============================================================================
// Unique item passives — a star is drawn next to such items with a tooltip
// that shows the passive itself.
// ============================================================================
const uniqueItems = [
  { name: "rod of ages", trait: "Eternity" },
  { name: "zhonya's hourglass", trait: "Stasis" },
  { name: "winter's approach", trait: "Manaflow" },
  { name: "manamune", trait: "Manaflow" },
  { name: "archangel's staff", trait: "Manaflow" },
  { name: "whispering circlet", trait: "Manaflow" },
  { name: "trailblazer", trait: "Momentum" },
  { name: "dead man's plate", trait: "Momentum" },
  { name: "sunfire aegis", trait: "Immolate" },
  { name: "hollow radiance", trait: "Immolate" },
  { name: "lich bane", trait: "Spellblade" },
  { name: "trinity force", trait: "Spellblade" },
  { name: "iceborn gauntlet", trait: "Spellblade" },
  { name: "dusk and dawn", trait: "Spellblade" },
  { name: "bloodletter's curse", trait: "Blight" },
  { name: "void staff", trait: "Blight" },
  { name: "cryptbloom", trait: "Blight" },
  { name: "terminus", trait: "Blight, Fatality" },
  { name: "mortal reminder", trait: "Fatality" },
  { name: "lord dominik's regards", trait: "Fatality" },
  { name: "black cleaver", trait: "Fatality" },
  { name: "serylda's grudge", trait: "Fatality" },
  { name: "banshee's veil", trait: "Annul" },
  { name: "edge of night", trait: "Annul" },
  { name: "immortal shieldbow", trait: "Lifeline" },
  { name: "sterack's cage", trait: "Lifeline" },
  { name: "maw of malmortius", trait: "Lifeline" },
  { name: "protoplasm harness", trait: "Lifeline" },
  { name: "profane hydra", trait: "Hydra" },
  { name: "stridebreaker", trait: "Hydra" },
  { name: "ravenous hydra", trait: "Hydra" },
  { name: "titanic hydra", trait: "Hydra" },
];


// ============================================================================
// Item conflicts — which items cannot coexist in the same build.
// Used in isConflict(): while building the legendary pool an item is skipped
// if one of its "enemies" has already been selected.
// ============================================================================
const conflicts = {
  "winter's approach": ["manamune", "archangel's staff", "whispering circlet"],
  "manamune": ["winter's approach", "archangel's staff", "whispering circlet"],
  "archangel's staff": ["manamune", "manamune", "whispering circlet"],
  "whispering circlet": ["manamune", "manamune", "archangel's staff"],
  "trailblazer": ["dead man's plate"],
  "dead man's plate": ["trailblazer"],
  "sunfire aegis": ["hollow radiance"],
  "hollow radiance": ["sunfire aegis"],
  "lich bane": ["trinity force", "iceborn gauntlet", "Bloodsong", "dusk and dawn"],
  "trinity force": ["lich bane", "iceborn gauntlet", "Bloodsong", "dusk and dawn"],
  "iceborn gauntlet": ["trinity force", "lich bane", "Bloodsong", "dusk and dawn"],
  "dusk and dawn": ["trinity force", "lich bane", "Bloodsong", "iceborn gauntlet"],
  "bloodletter's curse": ["void staff", "cryptbloom"],
  "void staff": ["bloodletter's curse", "cryptbloom"],
  "cryptbloom": ["void staff", "bloodletter's curse"],
  "terminus": ["bloodletter's curse", "void staff", "cryptbloom",
    "black cleaver", "mortal reminder", "lord dominik's regards", "serylda's grudge"],
  "mortal reminder": ["black cleaver", "lord dominik's regards", "serylda's grudge"],
  "lord dominik's regards": ["mortal reminder", "black cleaver", "serylda's grudge"],
  "black cleaver": ["mortal reminder", "lord dominik's regards", "serylda's grudge"],
  "serylda's grudge": ["mortal reminder", "lord dominik's regards", "black cleaver"],
  "banshee's veil": ["edge of night"],
  "edge of night": ["banshee's veil"],
  "immortal shieldbow": ["sterack's cage", "maw of malmortius", "protoplasm harness"],
  "sterack's cage": ["immortal shieldbow", "maw of malmortius", "protoplasm harness"],
  "maw of malmortius": ["immortal shieldbow", "sterack's cage", "protoplasm harness"],
  "protoplasm harness": ["immortal shieldbow", "sterack's cage", "maw of malmortius"],
  "profane hydra": ["stridebreaker", "ravenous hydra", "titanic hydra"],
  "stridebreaker": ["profane hydra", "titanic hydra", "ravenous hydra"],
  "ravenous hydra": ["profane hydra", "stridebreaker", "titanic hydra"],
  "titanic hydra": ["profane hydra", "stridebreaker", "ravenous hydra"],
  "Bloodsong": ["trinity force", "iceborn gauntlet", "lich bane"]
}

// ============================================================================
// Lookup table "rune name -> image id + branch". Needed for:
//   - history: to rebuild the image path from a rune name
//   - highlighting the correct rune when a branch is selected
// ============================================================================
const runes_names = [
  { name: "electrocute", img_name: "core_rune1", branch: "domination"},
  { name: "dark_harvest", img_name: "core_rune2", branch: "domination"},
  { name: "hail_of_blades", img_name: "core_rune3", branch: "domination"},
  { name: "press_the_attack", img_name: "core_rune1", branch: "precision"},
  { name: "fleet_footwork", img_name: "core_rune2", branch: "precision"},
  { name: "conqueror", img_name: "core_rune3", branch: "precision"},
  { name: "lethal_tempo", img_name: "core_rune4", branch: "precision"},
  { name: "summon_aery", img_name: "core_rune1", branch: "sorcery"},
  { name: "arcane_comet", img_name: "core_rune2", branch: "sorcery"},
  { name: "phase_rush", img_name: "core_rune3", branch: "sorcery"},
  { name: "deathfire_touch", img_name: "core_rune4", branch: "sorcery"},
  { name: "aftershock", img_name: "core_rune1", branch: "resolve"},
  { name: "grasp_of_the_undying", img_name: "core_rune2", branch: "resolve"},
  { name: "guardian", img_name: "core_rune3", branch: "resolve"},
  { name: "glacial_augment", img_name: "core_rune1", branch: "inspiration"},
  { name: "unsealed_spellbook", img_name: "core_rune2", branch: "inspiration"},
  { name: "first_strike", img_name: "core_rune3", branch: "inspiration"},
];

// ============================================================================
// Utilities and random-selection functions
// ============================================================================

// List of role ids whose filter button is currently active
function getCurrentRoles() {
  const activeButtons = [...role_buttons].filter(btn => btn.classList.contains('active'));
  return activeButtons.map(btn => btn.id);
}

// Returns 2 summoner spells. For Jungle the first is always smite, the second is random.
function getSummoners(arr, smite_arr, cur_role, count) {
  if (cur_role === "Jungle") {
    const randomSummoner = arr[Math.floor(Math.random() * arr.length)];
    return [smite_arr[0], randomSummoner]
  } else {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

// A single random element of an array
function get1Random(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

// Whether the candidate conflicts with already-selected items (per the conflicts table)
function isConflict(selected, candidate) {
  return selected.some(item => {
    const name1 = item.name;
    const name2 = candidate.name;
    return (conflicts[name1]?.includes(name2) || conflicts[name2]?.includes(name1));
  });
}

// Pick the starting item — the pool depends on the role
function getStartItem(c_arr, j_arr, s_arr, cur_role) {
  if (cur_role === "Jungle") {
    const randomIndex = Math.floor(Math.random() * j_arr.length);
    return j_arr[randomIndex];
  } else if (cur_role === "Support") {
    const randomIndex = Math.floor(Math.random() * s_arr.length);
    return s_arr[randomIndex];
  } else {
    const randomIndex = Math.floor(Math.random() * c_arr.length);
    return c_arr[randomIndex];
  }
}

// "No repeats": pick a champion among those not seen in the last 10 rolls
function pickChampionNoRepeats(champion_arts, recent_names) {
  const recent = new Set(recent_names.map(n => (n || "").toLowerCase()));
  const available = champion_arts.filter(c => !recent.has(c.name.toLowerCase()));
  const pool = available.length ? available : champion_arts; // fallback if everything is excluded
  return pool[Math.floor(Math.random() * pool.length)];
}

// Build a set of unique legendaries accounting for conflicts and special flags:
//   flag = true (Bloodsong) — skip "trinity/iceborn/lich"
//   champ_type = false (melee) — skip "runaan's hurricane"
function getItems(arr, count = 5, flag, champ_type) {
  const banned = ["trinity force", "lich bane", "iceborn gauntlet"];
  const forbiddenForFalse = ["runaan's hurricane"];
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  const result = [];

  for (const item of shuffled) {
    const itemName = (item.name?.toLowerCase?.() || item.toLowerCase());

    // if the item is banned and the flag is on -> skip
    if (flag && banned.includes(itemName)) {
      continue;
    }

    // if champ_type = false and the item is forbidden -> skip
    if (!champ_type && forbiddenForFalse.includes(itemName)) {
      continue;
    }

    if (!isConflict(result, item)) {
      result.push(item);
    }

    if (result.length === count) break;
  }

  return result;
}


function getRandomAbilities(arr, current_champion) {
  // Filter abilities that belong to the current champion
  const filtered = arr.filter(
    ability => ability.name.startsWith(current_champion.name.toLowerCase())
  );

  // Shuffle the abilities array
  const shuffled = filtered.sort(() => 0.5 - Math.random());

  // Return the first 3
  return shuffled.slice(0, 3);
}

// Pick a random role taking the active role filter buttons into account
function getRandomActiveRoleObject(roles) {
  const roleButtons = document.querySelectorAll('.role-toggle');

  // Get the names of active roles: ['Top', 'Jungle', ...]
  const activeRoleNames = [...roleButtons]
    .filter(btn => btn.classList.contains('active'))
    .map(btn => btn.id.replace('toggle_', ''))
    .map(role => role.charAt(0).toUpperCase() + role.slice(1));

  // If roles are selected — filter by them
  const filteredRoles = activeRoleNames.length > 0
    ? roles.filter(roleObj => activeRoleNames.includes(roleObj.name))
    : roles; // otherwise take all roles

  // Pick a random object
  const randomIndex = Math.floor(Math.random() * filteredRoles.length);
  return filteredRoles[randomIndex];
}

// Random banned champion — cannot match the currently selected one
function getBannedChampion(champions, cur_champ) {
  champ = get1Random(champions);
  while (champ === cur_champ) {
    champ = get1Random(champions);
  }
  return champ;
}

// ============================================================================
// Reset the highlight of the whole rune block — all branches/cores/secondary/shards to "gray".
// Called before every roll so the old highlight does not linger.
// ============================================================================
function noColorsForRunes() {
  for (let branch of runes_branches) {
    const id = branch.name;
    const element = document.getElementById(id);
    element.style.filter = 'grayscale(100%)';
    element.style.borderColor = '#939393';
  }
  for (let element of ["precision", "domination", "inspiration", "sorcery", "resolve"]) {
    document.getElementById(element).style.filter = 'grayscale(100%)';
    document.getElementById(element).style.borderColor = '#939393';
    document.getElementById(element).style.opacity = '0.35';
  }
  for (let element of ["branch_1", "branch_2", "branch_3", "branch_4"]) {
    document.getElementById(element).style.filter = 'grayscale(100%)';
    document.getElementById(element).style.borderColor = '#939393';
    document.getElementById(element).style.opacity = '0.35';
  }
  for (let element of ["core_rune1", "core_rune2", "core_rune3", "core_rune4",
    "core_rune5", "core_rune6", "core_rune7", "core_rune8", "core_rune9",
    "core_rune10", "core_rune11", "core_rune12", "core_rune13"]) {
    document.getElementById(element).style.filter = 'grayscale(100%)';
    document.getElementById(element).style.borderColor = '#939393';
    document.getElementById(element).style.opacity = '0.35';
  }
  for (let element of ["sec_rune1", "sec_rune2", "sec_rune3", "sec_rune4",
    "sec_rune5", "sec_rune6", "sec_rune7", "sec_rune8", "sec_rune9"]) {
    document.getElementById(element).style.filter = 'grayscale(100%)';
    document.getElementById(element).style.borderColor = '#939393';
    document.getElementById(element).style.opacity = '0.35';
  }
  for (let element of ["shard1", "shard2", "shard3", "shard4",
    "shard5", "shard6", "shard7", "shard8", "shard9"]) {
    document.getElementById(element).style.filter = 'grayscale(100%)';
    document.getElementById(element).style.borderColor = '#939393';
    document.getElementById(element).style.opacity = '0.35';
  }
}

// Fills the 4 branch slots in the secondary runes block: shows all branches except
// the main one, and highlights the specifically chosen secondary branch with a white border.
function assignImagesToBranches(imageList, excludedName, specialBranch) {
  // Filter the list: exclude one element by name
  const filteredList = imageList.filter(item => item.name !== excludedName);
  // Iterate over the 4 <img> with id="branch_1", "branch_2", ...
  for (let i = 0; i < 4; i++) {
    const imgId = `branch_${i + 1}`;
    const imgElement = document.getElementById(imgId);
    const imageData = filteredList[i];
    imgElement.src = imageData.image;

    // Check whether this matches the special branch
    if (imageData.image === specialBranch.image) {
      imgElement.style.border = '1px solid white';
      imgElement.style.filter = 'grayscale(0%)';
      imgElement.style.opacity = '1';
    } else {
      imgElement.style.border = '1px solid #939393;'; // clear if it does not match
    }
  }
}

// Secondary branch — any branch other than the main one
function getAddictionalBranch(branches, main_branch) {
  rune = get1Random(branches);
  while (rune === main_branch) {
    rune = get1Random(branches);
  }
  return rune;
}

// Swaps the rune images in the main block and the secondary runes block depending
// on the chosen branch (takes the URL from the <img> data-* attributes). Also shows/
// hides the 4th keystone rune: it only exists for precision and sorcery.
function assignMainPage(main_branch, sec_branch) {
  document
    .querySelectorAll('.core_main_runes img')
    .forEach(img => {
      const newSrc = img.dataset[main_branch];
      if (newSrc) img.src = newSrc;
      else console.warn(`${main_branch} not defined on`, img);
    });
  document
    .querySelectorAll('.additional_main_runes img')
    .forEach(img => {
      const newSrc = img.dataset[main_branch];
      if (newSrc) img.src = newSrc;
      else console.warn(`${main_branch} not defined on`, img);
    });
  document
    .querySelectorAll('.additional_runes img')
    .forEach(img => {
      const newSrc = img.dataset[sec_branch];
      if (newSrc) img.src = newSrc;
      else console.warn(`${sec_branch} not defined on`, img);
    });

  if (main_branch === "precision" || main_branch === "sorcery") {
    document.getElementById("core_rune4").style.display = 'inline';
  } else {
    document.getElementById("core_rune4").style.display = 'none';
  }
}


// Pick the 4 main runes: one from each row (keystone + 3 minor rows).
// For precision/sorcery the first row has 4 options, for the rest — 3.
function getMainRunes(main_branch) {
  let st1 = [];
  if (main_branch === "precision" || main_branch === "sorcery") {
    st1 = ["core_rune1", "core_rune2", "core_rune3", "core_rune4"];
  } else {
    st1 = ["core_rune1", "core_rune2", "core_rune3"];
  }
  const nd2 = ["core_rune5", "core_rune6", "core_rune7"];
  const rd3 = ["core_rune8", "core_rune9", "core_rune10"];
  const th4 = ["core_rune11", "core_rune12", "core_rune13"];
  return [get1Random(st1), get1Random(nd2), get1Random(rd3), get1Random(th4)];
}

// Two secondary runes from two different rows (3 rows of 3 runes)
function getSecRunes() {
  const st1 = ["sec_rune1", "sec_rune2", "sec_rune3"];
  const nd2 = ["sec_rune4", "sec_rune5", "sec_rune6"];
  const rd3 = ["sec_rune7", "sec_rune8", "sec_rune9"];

  const pools = [st1, nd2, rd3];

  // Pick two different arrays
  const firstIndex = Math.floor(Math.random() * pools.length);
  let secondIndex;
  do {
    secondIndex = Math.floor(Math.random() * pools.length);
  } while (secondIndex === firstIndex);

  const firstRune = get1Random(pools[firstIndex]);
  const secondRune = get1Random(pools[secondIndex]);

  return [firstRune, secondRune];
}


// Shows star indicators above items:
//   - "Runaan's Hurricane" -> yellow star labeled "Ranged only"
//   - Unique passives from uniqueItems -> pink star with the passive name
// For Support hides the 5th star, for non-Bot hides the 6th.
function showStarsForUniqueItems(objects, uniqueItems, role) {
  objects.forEach((cur_object, index) => {
    const starElement = document.getElementById(`star${index + 1}`);
    const textElement = document.getElementById(`text${index + 1}`);
    const imgElement = document.getElementById(`ss${index + 1}`);

    if (!starElement || !textElement) return; // guard against null

    // Special case "Runaan's Hurricane"
    if (cur_object.name.toLowerCase() === "runaan's hurricane") {
      starElement.style.display = 'inline-block';
      starElement.style.color = "yellow";
      textElement.textContent = "Ranged champions only";
      textElement.style.backgroundColor = "yellow";
      textElement.classList.add("yellow");
      imgElement.style.backgroundColor = "yellow";
      imgElement.style.borderColor = "yellow";
      return; // stop here
    }

    // Check for unique items
    const foundUnique = uniqueItems.find(u => u.name === cur_object.name);
    if (foundUnique) {
      starElement.style.display = 'inline-block';
      textElement.textContent = `Unique: ${foundUnique.trait}`;
    } else {
      // if not unique and not runaan's — hide the star
      starElement.style.display = 'none';
      starElement.style.backgroundColor = "#FF9E9E";
      textElement.style.borderColor = "#FF9E9E transparent transparent transparent";
      textElement.style.backgroundColor = "#FF9E9E";
      imgElement.style.backgroundColor = "#FF9E9E";
      imgElement.style.borderColor = "#FF9E9E";
      textElement.classList.remove("yellow");
    }
  });

  // If the role is Support — hide the 5th star
  if (role.name === "Support") {
    const starElement = document.getElementById('star5');
    if (starElement) {
      starElement.style.display = 'none';
    }
  }
  // If the role is not Bot — hide the 6th star
  if (role.name !== "Bot") {
    const starElement = document.getElementById('star6');
    if (starElement) {
      starElement.style.display = 'none';
    }
  }
}


// Controls the visibility of the 5th and 6th slots in items_row:
//   Support -> hide the 5th slot (support gets only 4 legendaries)
//   Bot     -> show the extra 6th slot
function assignRoles (cur_role) {
  if (cur_role === "Support") {
    document.getElementById('5th').style.display = 'none';
    document.getElementById('star5').style.display = 'none';
    document.getElementById('label5').style.display = 'none';
  } else {
    document.getElementById('5th').style.display = 'inline-block';
    document.getElementById('label5').style.display = 'block';
  }
  if (cur_role === "Bot") {
    document.getElementById('item_box_6').style.display = 'flex';
  } else {
    document.getElementById('item_box_6').style.display = 'none';
  }
}

function capitalizeFirstLetter(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getRuneName(branch, img_name) {
  let rune = runes_names.find(r => r.branch === branch && r.img_name === img_name);
  return rune ? rune.name : null;
}

function formatDate(date) {
  let day = date.getDate().toString().padStart(2, "0");   // day with a leading zero
  let month = (date.getMonth() + 1).toString().padStart(2, "0"); // month with a leading zero
  let year = date.getFullYear();
  return `${day}.${month}`;
}

// ============================================================================
// Render a single history row (number_h = 1..15). Each img_N_K is an icon
// in the row (rune, summoner, item, etc.). The image path is assembled from
// the names and folders stored in myData. Supports a 6th item for Bot.
// ============================================================================
function updateHistoryElement(number_h, champion_name_h, branch_name_h, rune_img_name_h, summoner1_name_h, summoner2_name_h,
  start_item_h, start_folder_h, boots_h, item1_h, item2_h, item3_h, item4_h, item5_h, role_h, ability1_h, ability2_h, ability3_h, date_var_h, item6_h
) {
  // File case convention:
  //   all folders -> lowercase, EXCEPT static/images/items/boots/ (Title Case).
  // That is why below most names are forced to lowercase,
  // while the boots name is kept as is (it is already Title Case in the data).
  const lc = s => (s == null ? "" : s.toString().toLowerCase());

  document.getElementById('element' + number_h.toString()).style.display = "flex";
  document.getElementById(`name${number_h.toString()}`).textContent = number_h.toString() + ". " + capitalizeFirstLetter(champion_name_h);
  // character_icons/ stores files in lowercase (aatrox.png, draven.png).
  // champion_name_h may be "Draven" (capitalizeFirstLetter applied on save),
  // so we force it to lowercase.
  document.getElementById('img_' + number_h.toString() + "_1").src = "/static/images/character_icons/" + lc(champion_name_h) + ".png";
  document.getElementById('img_' + number_h.toString() + "_2").src = "/static/images/runes/core/" + lc(branch_name_h) + "/"
  + getRuneName(branch_name_h, rune_img_name_h, runes_names) + ".webp";
  document.getElementById('img_' + number_h.toString() + "_3").src = "/static/images/summoners/"
  + lc(summoner1_name_h) + ".png";
  document.getElementById('img_' + number_h.toString() + "_4").src = "/static/images/summoners/"
  + lc(summoner2_name_h) + ".png";
  document.getElementById('img_' + number_h.toString() + "_5").src = "/static/images/items/start/" + lc(start_folder_h) + "/"
  + lc(start_item_h) + ".webp";
  document.getElementById('img_' + number_h.toString() + "_6").src = "/static/images/items/boots/" + boots_h + ".png";
  document.getElementById('img_' + number_h.toString() + "_7").src = "/static/images/items/legendary/" + lc(item1_h) + ".png";
  document.getElementById('img_' + number_h.toString() + "_8").src = "/static/images/items/legendary/" + lc(item2_h) + ".png";
  document.getElementById('img_' + number_h.toString() + "_9").src = "/static/images/items/legendary/" + lc(item3_h) + ".png";
  document.getElementById('img_' + number_h.toString() + "_10").src = "/static/images/items/legendary/" + lc(item4_h) + ".png";
  if (role_h === "Support") {
    document.getElementById('img_' + number_h.toString() + "_11").style.display = "none";
  } else {
    document.getElementById('img_' + number_h.toString() + "_11").style.display = "inline-block";
    document.getElementById('img_' + number_h.toString() + "_11").src = "/static/images/items/legendary/" + lc(item5_h) + ".png";
  }
  if (role_h === "Bot" && item6_h) {
    document.getElementById('img_' + number_h.toString() + "_16").style.display = "inline-block";
    document.getElementById('img_' + number_h.toString() + "_16").src = "/static/images/items/legendary/" + lc(item6_h) + ".png";
  } else {
    document.getElementById('img_' + number_h.toString() + "_16").style.display = "none";
  }
  document.getElementById('img_' + number_h.toString() + "_12").textContent = ability1_h.toUpperCase();
  document.getElementById('img_' + number_h.toString() + "_13").textContent = ability2_h.toUpperCase();
  document.getElementById('img_' + number_h.toString() + "_14").textContent = ability3_h.toUpperCase();
  document.getElementById('img_' + number_h.toString() + "_15").src = "/static/images/roles/" + role_h.toLowerCase() + ".png";

  const hours = date_var_h.getHours().toString().padStart(2, '0');
  const minutes = date_var_h.getMinutes().toString().padStart(2, '0');
  document.getElementById("time" + number_h.toString()).textContent = `${hours}:${minutes}`;

  document.getElementById("date" + number_h.toString()).textContent = formatDate(date_var_h);
}

// Given a role name returns the folder name for the starting items
function start_item_from_role (role) {
  if (role === "Support") {
    return "support"
  } else if (role === "Jungle") {
    return "jungle"
  } else {
    return "common"
  }
}

// ============================================================================
// Serialization to localStorage with Date support (otherwise JSON.stringify loses the type)
// ============================================================================
function serialize(data) {
  return JSON.stringify(data, function (key, value) {
    // original — the property's original value before toJSON
    const original = this && key ? this[key] : value;
    if (original instanceof Date) {
      return { __type: "Date", value: original.toISOString() };
    }
    return value;
  });
}

function deserialize(str) {
  if (!str) return [];
  return JSON.parse(str, (key, value) => {
    if (value && value.__type === "Date") {
      return new Date(value.value);
    }
    return value;
  });
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return deserialize(raw);
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, serialize(data));
}

// Remove a list by index
function removeList(index) {
  myData.splice(index, 1);
  saveData(myData);
}

// Add a new list (history is circular: at 15 entries it shifts out the oldest)
function addList(newList) {
  if (myData.length < 15) {
    myData.push(newList);
  } else {
    removeList(0);
    myData.push(newList);
  }
  saveData(myData);
}

// ============================================================================
// Main REROLL button handler: generates a full set of random fields
// (role, champion, summoners, runes, items, abilities, ban) and updates the whole UI.
// ============================================================================
document.getElementById('reroll_btn').addEventListener('click', () => {
  const noRepeatsActive = document.getElementById('no_repeats_btn')?.classList.contains('active');
  const bootsStartActive = document.getElementById('boots_start_btn')?.classList.contains('active');

  // --- 1. Random selection of all fields ----------------------------------
  const role = getRandomActiveRoleObject(roles);
  const [summoner1, summoner2] = getSummoners(summoners, smite, role.name, 2);
  // "No repeats": exclude the last 10 champions
  const recent = noRepeatsActive ? myData.slice(-10).map(v => v[0]) : [];
  const champion = noRepeatsActive ? pickChampionNoRepeats(champion_arts, recent) : get1Random(champion_arts);
  // "Boots start": if disabled, remove boots.webp from the common pool
  const common_pool = bootsStartActive ? common_start_items : common_start_items.filter(i => i.name.toLowerCase() !== "boots");
  const start_item = getStartItem(common_pool, jungle_start_items, support_start_items, role.name);
  let is_Bloodsong = false;
  if (start_item.name === "Bloodsong") {is_Bloodsong = true};
  let is_Ranged = false;
  if (champion.type === "r") {is_Ranged = true};
  // Bot gets 6 legendaries instead of 5
  const items = getItems(legendary_items, role.name === "Bot" ? 6 : 5, is_Bloodsong, is_Ranged);
  const boot = get1Random(boots);
  const abilities_order = getRandomAbilities(abilities, champion);
  const banned_champion = getBannedChampion(champion_icons, champion);
  const main_runes_branch = get1Random(runes_branches);
  const second_runes_branch = getAddictionalBranch(runes_branches, main_runes_branch);
  const first_group_runes = getMainRunes(main_runes_branch.name);
  const second_group_runes = getSecRunes();
  const shard_runes = [get1Random(["shard1", "shard2", "shard3"]), get1Random(["shard4", "shard5", "shard6"]), get1Random(["shard7", "shard8", "shard9"])];

  // --- 2. Prepare the rune blocks ----------------------------------------
  noColorsForRunes();
  assignImagesToBranches(runes_branches, main_runes_branch.name, second_runes_branch);
  assignMainPage(main_runes_branch.name, second_runes_branch.name);
  assignRoles(role.name);
  for (let element of ["star0", "star1", "star2", "star3", "star4", "star5", "star6"]) {
    document.getElementById(element).style.display = 'none';
  }

  // Redraw history (shows all previously saved rolls)
  myData.forEach((value, index) => {
    updateHistoryElement(myData.length - index, ...value);
  });

  // --- 3. Save the current roll into history -----------------------------
  // Array structure (indexes):
  //   0  champion_name, 1 main_branch, 2 main_rune1 (keystone), 3-4 summoners,
  //   5 start_item, 6 start_folder, 7 boot, 8-12 items 1-5, 13 role,
  //   14-16 ability letters, 17 date, 18 item6 (or null),
  //   19-21 main_rune2..4, 22 sec_branch, 23-24 sec_rune1-2,
  //   25-27 shards, 28 banned champion
  const generation1 = [
    capitalizeFirstLetter(champion.name),
    main_runes_branch.name,
    first_group_runes[0],
    summoner1.name.toLowerCase(),
    summoner2.name.toLowerCase(),
    start_item.name,
    start_item_from_role(role.name),
    boot.name,
    items[0].name,
    items[1].name,
    items[2].name,
    items[3].name,
    items[4].name,
    role.name,
    abilities_order[0].name.slice(-1),
    abilities_order[1].name.slice(-1),
    abilities_order[2].name.slice(-1),
    new Date(),
    role.name === "Bot" && items[5] ? items[5].name : null,
    first_group_runes[1],
    first_group_runes[2],
    first_group_runes[3],
    second_runes_branch.name,
    second_group_runes[0],
    second_group_runes[1],
    shard_runes[0],
    shard_runes[1],
    shard_runes[2],
    banned_champion.name
  ];

  addList(generation1);

  // --- 4. Apply the selection to the live UI ------------------------------
  // Main champion card (background + name)
  const card = document.getElementById('champion_card');
  card.style.backgroundImage = `url("${champion.image}")`;
  document.getElementById("champion_name").textContent = champion.name.toUpperCase();

  // Summoner spells
  document.getElementById('summoner1').src = summoner1.image;
  document.getElementById('summoner1').alt = summoner1.name;

  document.getElementById('summoner2').src = summoner2.image;
  document.getElementById('summoner2').alt = summoner2.name;

  // Start item / boots / role
  document.getElementById('start_item').src = start_item.image;
  document.getElementById('start_item').alt = start_item.name;

  document.getElementById('boot').src = boot.image;
  document.getElementById('boot').alt = boot.name;

  document.getElementById('role').src = role.image;
  document.getElementById('role').alt = role.name;

  // Legendaries 1-5 (+ 6th for Bot)
  document.getElementById('1st').src = items[0].image;
  document.getElementById('1st').alt = items[0].name;
  document.getElementById('2nd').src = items[1].image;
  document.getElementById('2nd').alt = items[1].name;
  document.getElementById('3rd').src = items[2].image;
  document.getElementById('3rd').alt = items[2].name;
  document.getElementById('4th').src = items[3].image;
  document.getElementById('4th').alt = items[3].name;
  document.getElementById('5th').src = items[4].image;
  document.getElementById('5th').alt = items[4].name;
  if (role.name === "Bot" && items[5]) {
    document.getElementById('6th').src = items[5].image;
    document.getElementById('6th').alt = items[5].name;
  }

  // Abilities (3 of them)
  document.getElementById('ability1').src = abilities_order[0].image;
  document.getElementById('ability1').alt = abilities_order[0].name;
  document.getElementById('ability2').src = abilities_order[1].image;
  document.getElementById('ability2').alt = abilities_order[1].name;
  document.getElementById('ability3').src = abilities_order[2].image;
  document.getElementById('ability3').alt = abilities_order[2].name;

  document.getElementById("no_h").style.display = 'none';

  // Aphelios special case: ability labels show AD/AS/ArP instead of Q/W/E
  if (champion.name === "aphelios") {
    document.getElementById('ability1').style.padding = "11px";
    document.getElementById('ability1').style.boxSizing = "border-box";
    document.getElementById('ability2').style.padding = "11px";
    document.getElementById('ability2').style.boxSizing = "border-box";
    document.getElementById('ability3').style.padding = "11px";
    document.getElementById('ability3').style.boxSizing = "border-box";
    ff1 = abilities_order[0];
    ff2 = abilities_order[1];
    ff3 = abilities_order[2];
    if (ff1.name === "aphelios_q") {
      document.getElementById('ability1_label').textContent = "AD";
    } else if (ff1.name === "aphelios_w") {
      document.getElementById('ability1_label').textContent = "AS";
    } else if (ff1.name === "aphelios_e") {
      document.getElementById('ability1_label').textContent = "ArP";
    }
    if (ff2.name === "aphelios_q") {
      document.getElementById('ability2_label').textContent = "AD";
    } else if (ff2.name === "aphelios_w") {
      document.getElementById('ability2_label').textContent = "AS";
    } else if (ff2.name === "aphelios_e") {
      document.getElementById('ability2_label').textContent = "ArP";
    }
    if (ff3.name === "aphelios_q") {
      document.getElementById('ability3_label').textContent = "AD";
    } else if (ff3.name === "aphelios_w") {
      document.getElementById('ability3_label').textContent = "AS";
    } else if (ff3.name === "aphelios_e") {
      document.getElementById('ability3_label').textContent = "ArP";
    }

  } else {
    document.getElementById('ability1').style.padding = "";
    document.getElementById('ability1').style.boxSizing = "";
    document.getElementById('ability2').style.padding = "";
    document.getElementById('ability2').style.boxSizing = "";
    document.getElementById('ability3').style.padding = "";
    document.getElementById('ability3').style.boxSizing = "";
    document.getElementById('ability1_label').textContent = abilities_order[0].name[abilities_order[0].name.length - 1].toUpperCase();
    document.getElementById('ability2_label').textContent = abilities_order[1].name[abilities_order[1].name.length - 1].toUpperCase();
    document.getElementById('ability3_label').textContent = abilities_order[2].name[abilities_order[2].name.length - 1].toUpperCase();
  }

  // Ban
  document.getElementById('banned_champion').src = banned_champion.image;
  document.getElementById('banned_champion').alt = banned_champion.name;

  // Highlight the main rune branch
  document.getElementById(main_runes_branch.name).style.filter = 'grayscale(0%)';
  document.getElementById(main_runes_branch.name).style.borderColor = 'white';
  document.getElementById(main_runes_branch.name).style.opacity = '1';

  // Highlight the 4 main runes
  for (let element of first_group_runes) {
    document.getElementById(element).style.filter = 'grayscale(0%)';
    document.getElementById(element).style.border = 'solid 1px white';
    document.getElementById(element).style.opacity = '1';
  }

  // Highlight the 2 secondary runes
  for (let element of second_group_runes) {
    document.getElementById(element).style.filter = 'grayscale(0%)';
    document.getElementById(element).style.border = 'solid 1px white';
    document.getElementById(element).style.opacity = '1';
  }

  // Highlight the 3 stat shards
  for (let element of shard_runes) {
    document.getElementById(element).style.filter = 'grayscale(0%)';
    document.getElementById(element).style.border = 'solid 1px white';
    document.getElementById(element).style.opacity = '1';
  }

  // Stars above unique items + a special one for Bloodsong start
  showStarsForUniqueItems(items, uniqueItems, role);
  if (start_item.name === "Bloodsong") {
    document.getElementById("star0").style.display = 'inline-block';
  } else {
    document.getElementById("star0").style.display = 'none';
  }

  // Final redraw of history (includes the entry just added)
  myData.forEach((value, index) => {
    updateHistoryElement(myData.length - index, ...value);
  });
});

// ============================================================================
// Initial setup on page load — performs one "automatic" roll so the UI does not
// show placeholders. The logic duplicates the reroll handler,
// but without no_repeats/boots_start (the toggles are off by default).
// ============================================================================
window.addEventListener('DOMContentLoaded', function () {
  const role = getRandomActiveRoleObject(roles);
  const [summoner1, summoner2] = getSummoners(summoners, smite, role.name, 2);
  const champion = get1Random(champion_arts);
  const common_pool_init = common_start_items.filter(i => i.name.toLowerCase() !== "boots");
  const start_item = getStartItem(common_pool_init, jungle_start_items, support_start_items, role.name);
  let is_Bloodsong = false;
  if (start_item.name === "Bloodsong") {is_Bloodsong = true};
  let is_Ranged = false;
  if (champion.type === "r") {is_Ranged = true};
  const items = getItems(legendary_items, role.name === "Bot" ? 6 : 5, is_Bloodsong, is_Ranged);
  const boot = get1Random(boots);
  const abilities_order = getRandomAbilities(abilities, champion);
  const banned_champion = getBannedChampion(champion_icons, champion);
  const main_runes_branch = get1Random(runes_branches);
  const second_runes_branch = getAddictionalBranch(runes_branches, main_runes_branch);
  const first_group_runes = getMainRunes(main_runes_branch.name);
  const second_group_runes = getSecRunes();
  const shard_runes = [get1Random(["shard1", "shard2", "shard3"]), get1Random(["shard4", "shard5", "shard6"]), get1Random(["shard7", "shard8", "shard9"])];

  noColorsForRunes();
  assignImagesToBranches(runes_branches, main_runes_branch.name, second_runes_branch);
  assignMainPage(main_runes_branch.name, second_runes_branch.name);
  assignRoles(role.name);
  for (let element of ["star0", "star1", "star2", "star3", "star4", "star5", "star6"]) {
    document.getElementById(element).style.display = 'none';
  }

  const generation1 = [
    capitalizeFirstLetter(champion.name),
    main_runes_branch.name,
    first_group_runes[0],
    summoner1.name.toLowerCase(),
    summoner2.name.toLowerCase(),
    start_item.name,
    start_item_from_role(role.name),
    boot.name,
    items[0].name,
    items[1].name,
    items[2].name,
    items[3].name,
    items[4].name,
    role.name,
    abilities_order[0].name.slice(-1),
    abilities_order[1].name.slice(-1),
    abilities_order[2].name.slice(-1),
    new Date(),
    role.name === "Bot" && items[5] ? items[5].name : null,
    first_group_runes[1],
    first_group_runes[2],
    first_group_runes[3],
    second_runes_branch.name,
    second_group_runes[0],
    second_group_runes[1],
    shard_runes[0],
    shard_runes[1],
    shard_runes[2],
    banned_champion.name
  ];

  addList(generation1);

  const card = document.getElementById('champion_card');
  card.style.backgroundImage = `url("${champion.image}")`;
  document.getElementById("champion_name").textContent = champion.name.toUpperCase();

  document.getElementById('summoner1').src = summoner1.image;
  document.getElementById('summoner1').alt = summoner1.name;

  document.getElementById('summoner2').src = summoner2.image;
  document.getElementById('summoner2').alt = summoner2.name;

  document.getElementById('start_item').src = start_item.image;
  document.getElementById('start_item').alt = start_item.name;

  document.getElementById('boot').src = boot.image;
  document.getElementById('boot').alt = boot.name;

  document.getElementById('role').src = role.image;
  document.getElementById('role').alt = role.name;

  document.getElementById('1st').src = items[0].image;
  document.getElementById('1st').alt = items[0].name;
  document.getElementById('2nd').src = items[1].image;
  document.getElementById('2nd').alt = items[1].name;
  document.getElementById('3rd').src = items[2].image;
  document.getElementById('3rd').alt = items[2].name;
  document.getElementById('4th').src = items[3].image;
  document.getElementById('4th').alt = items[3].name;
  document.getElementById('5th').src = items[4].image;
  document.getElementById('5th').alt = items[4].name;
  if (role.name === "Bot" && items[5]) {
    document.getElementById('6th').src = items[5].image;
    document.getElementById('6th').alt = items[5].name;
  }

  document.getElementById('ability1').src = abilities_order[0].image;
  document.getElementById('ability1').alt = abilities_order[0].name;
  document.getElementById('ability2').src = abilities_order[1].image;
  document.getElementById('ability2').alt = abilities_order[1].name;
  document.getElementById('ability3').src = abilities_order[2].image;
  document.getElementById('ability3').alt = abilities_order[2].name;

  if (champion.name === "aphelios") {
    document.getElementById('ability1').style.padding = "11px";
    document.getElementById('ability1').style.boxSizing = "border-box";
    document.getElementById('ability2').style.padding = "11px";
    document.getElementById('ability2').style.boxSizing = "border-box";
    document.getElementById('ability3').style.padding = "11px";
    document.getElementById('ability3').style.boxSizing = "border-box";
    ff1 = abilities_order[0];
    ff2 = abilities_order[1];
    ff3 = abilities_order[2];
    if (ff1.name === "aphelios_q") {
      document.getElementById('ability1_label').textContent = "AD";
    } else if (ff1.name === "aphelios_w") {
      document.getElementById('ability1_label').textContent = "AS";
    } else if (ff1.name === "aphelios_e") {
      document.getElementById('ability1_label').textContent = "ArP";
    }
    if (ff2.name === "aphelios_q") {
      document.getElementById('ability2_label').textContent = "AD";
    } else if (ff2.name === "aphelios_w") {
      document.getElementById('ability2_label').textContent = "AS";
    } else if (ff2.name === "aphelios_e") {
      document.getElementById('ability2_label').textContent = "ArP";
    }
    if (ff3.name === "aphelios_q") {
      document.getElementById('ability3_label').textContent = "AD";
    } else if (ff3.name === "aphelios_w") {
      document.getElementById('ability3_label').textContent = "AS";
    } else if (ff3.name === "aphelios_e") {
      document.getElementById('ability3_label').textContent = "ArP";
    }

  } else {
    document.getElementById('ability1').style.padding = "";
    document.getElementById('ability1').style.boxSizing = "";
    document.getElementById('ability2').style.padding = "";
    document.getElementById('ability2').style.boxSizing = "";
    document.getElementById('ability3').style.padding = "";
    document.getElementById('ability3').style.boxSizing = "";
    document.getElementById('ability1_label').textContent = abilities_order[0].name[abilities_order[0].name.length - 1].toUpperCase();
    document.getElementById('ability2_label').textContent = abilities_order[1].name[abilities_order[1].name.length - 1].toUpperCase();
    document.getElementById('ability3_label').textContent = abilities_order[2].name[abilities_order[2].name.length - 1].toUpperCase();
  }

  document.getElementById('banned_champion').src = banned_champion.image;
  document.getElementById('banned_champion').alt = banned_champion.name;

  document.getElementById(main_runes_branch.name).style.filter = 'grayscale(0%)';
  document.getElementById(main_runes_branch.name).style.borderColor = 'white';
  document.getElementById(main_runes_branch.name).style.opacity = '1';

  for (let element of first_group_runes) {
    document.getElementById(element).style.filter = 'grayscale(0%)';
    document.getElementById(element).style.border = 'solid 1px white';
    document.getElementById(element).style.opacity = '1';
  }

  for (let element of second_group_runes) {
    document.getElementById(element).style.filter = 'grayscale(0%)';
    document.getElementById(element).style.border = 'solid 1px white';
    document.getElementById(element).style.opacity = '1';
  }

  for (let element of shard_runes) {
    document.getElementById(element).style.filter = 'grayscale(0%)';
    document.getElementById(element).style.border = 'solid 1px white';
    document.getElementById(element).style.opacity = '1';
  }

  showStarsForUniqueItems(items, uniqueItems, role);
  if (start_item.name === "Bloodsong") {
    document.getElementById("star0").style.display = 'inline-block';
  } else {
    document.getElementById("star0").style.display = 'none';
  }

  if (myData.length > 0) {
    document.getElementById("no_h").style.display = 'none';
  }

  myData.forEach((value, index) => {
    updateHistoryElement(myData.length - index, ...value);
  });
});

// ============================================================================
// Toggle buttons "No repeats" / "Boots start" in the top bar.
// They just flip the .active class — the actual logic is read in reroll.
// ============================================================================
['no_repeats_btn', 'boots_start_btn'].forEach(id => {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', () => btn.classList.toggle('active'));
});

// ============================================================================
// Hover bubble with the image name (shared for items, banned, etc.)
// One shared div is created dynamically and reused. Coordinates are divided
// by the body zoom (because body has CSS zoom).
// ============================================================================
const itemTooltip = document.createElement('div');
itemTooltip.id = 'item-hover-tooltip';
document.body.appendChild(itemTooltip);

// Turns a URL -> a pretty name ("blade_of_the_ruined_king.png" -> "Blade of the Ruined King").
// Articles the/and/of stay lowercase (except when they are the first word).
function formatImageName(src) {
  const filename = decodeURIComponent(src.split('/').pop().replace(/\.[^.]+$/, ''));
  const lowerWords = new Set(['the', 'and', 'of']);
  return filename
    .replace(/[-_]/g, ' ')
    .replace(/(^|\s)\w/g, c => c.toUpperCase())
    .split(' ')
    .map((w, i) => (i > 0 && lowerWords.has(w.toLowerCase()) ? w.toLowerCase() : w))
    .join(' ');
}

// Tooltips for all item_label_box (start, boots, 1st..6th)
document.querySelectorAll('.item_label_box').forEach(box => {
  box.addEventListener('mouseenter', (e) => {
    // Do not show the tooltip when hovering the star itself — it has its own text
    if (e.target.closest('.tooltip_wrapper')) return;
    const img = box.querySelector('img.c123');
    if (!img) return;
    itemTooltip.textContent = formatImageName(img.src);

    const zoom = parseFloat(document.body.style.zoom) || 1;
    const rect = box.getBoundingClientRect();
    itemTooltip.style.left = ((rect.left + rect.width / 2) / zoom) + 'px';
    itemTooltip.style.top = (rect.top / zoom - 48) + 'px';
    itemTooltip.classList.add('visible');
  });

  box.addEventListener('mouseleave', () => {
    itemTooltip.classList.remove('visible');
  });

  // If the cursor moves from the star back to the slot itself — show the name again
  const star = box.querySelector('.tooltip_wrapper');
  if (star) {
    star.addEventListener('mouseenter', () => itemTooltip.classList.remove('visible'));
    star.addEventListener('mouseleave', (e) => {
      if (e.relatedTarget && e.relatedTarget.closest('.item_label_box') === box) {
        itemTooltip.classList.add('visible');
      }
    });
  }
});

// The same tooltip for standalone <img> outside item_label_box
['banned_champion', 'summoner1', 'summoner2', 'role'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('mouseenter', () => {
    itemTooltip.textContent = formatImageName(el.src);

    const zoom = parseFloat(document.body.style.zoom) || 1;
    const rect = el.getBoundingClientRect();
    itemTooltip.style.left = ((rect.left + rect.width / 2) / zoom) + 'px';
    itemTooltip.style.top = (rect.top / zoom - 48) + 'px';
    itemTooltip.classList.add('visible');
  });
  el.addEventListener('mouseleave', () => {
    itemTooltip.classList.remove('visible');
  });
});

// ============================================================================
// Restoring state from history: clicking a champion name restores the
// whole UI from the saved array (see the structure in the generation1 comment).
// ============================================================================

function applyStateFromHistory(v) {
  // Minimum length 18 — these are entries without the 6th item and shards
  if (!Array.isArray(v) || v.length < 18) return;

  // --- Parse all array fields ---
  const champion_name = v[0];
  const main_branch_name = v[1];
  const main_rune1 = v[2];
  const summoner1_name = v[3];
  const summoner2_name = v[4];
  const start_item_name = v[5];
  const start_folder = v[6];
  const boot_name = v[7];
  const item_names = [v[8], v[9], v[10], v[11], v[12]];
  const role_name = v[13];
  const ability_letters = [v[14], v[15], v[16]];
  // v[17] is date
  const item6_name = v[18];
  const main_rune2 = v[19];
  const main_rune3 = v[20];
  const main_rune4 = v[21];
  const sec_branch_name = v[22];
  const sec_rune1 = v[23];
  const sec_rune2 = v[24];
  const shardIds = [v[25], v[26], v[27]];
  const banned_name = v[28];

  // --- Look up objects by name in the data arrays ---
  const lc = s => (s || "").toString().toLowerCase();
  const champion = champion_arts.find(c => lc(c.name) === lc(champion_name));
  if (!champion) return;
  const allSummoners = [...summoners, ...smite];
  const summoner1 = allSummoners.find(s => lc(s.name) === lc(summoner1_name));
  const summoner2 = allSummoners.find(s => lc(s.name) === lc(summoner2_name));
  let startPool;
  if (start_folder === "jungle") startPool = jungle_start_items;
  else if (start_folder === "support") startPool = support_start_items;
  else startPool = common_start_items;
  const start_item = startPool.find(i => i.name === start_item_name);
  const boot = boots.find(b => b.name === boot_name);
  const role = roles.find(r => r.name === role_name);
  if (role_name === "Bot" && item6_name) item_names.push(item6_name);
  const items = item_names.map(n => legendary_items.find(i => i.name === n)).filter(Boolean);
  const banned_champion = banned_name ? champion_icons.find(c => c.name === banned_name) : null;
  const main_branch = runes_branches.find(b => b.name === main_branch_name);
  const sec_branch = runes_branches.find(b => b.name === sec_branch_name);
  const abilities_order = ability_letters.map(l =>
    abilities.find(a => a.name === `${lc(champion.name)}_${lc(l)}`)
  ).filter(Boolean);

  // Apply runes layout (set images & main_page based on branches)
  noColorsForRunes();
  if (main_branch && sec_branch) {
    assignImagesToBranches(runes_branches, main_branch.name, sec_branch);
    assignMainPage(main_branch.name, sec_branch.name);
  }

  // Reset stars
  for (let element of ["star0", "star1", "star2", "star3", "star4", "star5", "star6"]) {
    document.getElementById(element).style.display = 'none';
  }

  // Show/hide 5th and 6th item slots based on role
  assignRoles(role.name);

  // Champion card
  const card = document.getElementById('champion_card');
  card.style.backgroundImage = `url("${champion.image}")`;
  document.getElementById("champion_name").textContent = champion.name.toUpperCase();

  // Summoners
  if (summoner1) {
    document.getElementById('summoner1').src = summoner1.image;
    document.getElementById('summoner1').alt = summoner1.name;
  }
  if (summoner2) {
    document.getElementById('summoner2').src = summoner2.image;
    document.getElementById('summoner2').alt = summoner2.name;
  }

  // Start item
  if (start_item) {
    document.getElementById('start_item').src = start_item.image;
    document.getElementById('start_item').alt = start_item.name;
  }

  // Boot
  if (boot) {
    document.getElementById('boot').src = boot.image;
    document.getElementById('boot').alt = boot.name;
  }

  // Role
  if (role) {
    document.getElementById('role').src = role.image;
    document.getElementById('role').alt = role.name;
  }

  // Items
  ['1st', '2nd', '3rd', '4th', '5th', '6th'].forEach((id, i) => {
    if (items[i]) {
      const el = document.getElementById(id);
      el.src = items[i].image;
      el.alt = items[i].name;
    }
  });

  // Abilities
  abilities_order.forEach((ability, i) => {
    const img = document.getElementById(`ability${i + 1}`);
    img.src = ability.image;
    img.alt = ability.name;
    if (champion.name === "aphelios") {
      img.style.padding = "11px";
      img.style.boxSizing = "border-box";
      const letter = ability.name.slice(-1);
      const label = document.getElementById(`ability${i + 1}_label`);
      if (letter === "q") label.textContent = "AD";
      else if (letter === "w") label.textContent = "AS";
      else if (letter === "e") label.textContent = "ArP";
    } else {
      img.style.padding = "";
      img.style.boxSizing = "";
      document.getElementById(`ability${i + 1}_label`).textContent = ability.name.slice(-1).toUpperCase();
    }
  });

  // Banned champion
  if (banned_champion) {
    document.getElementById('banned_champion').src = banned_champion.image;
    document.getElementById('banned_champion').alt = banned_champion.name;
  }

  // Highlight main branch + main runes
  if (main_branch) {
    document.getElementById(main_branch.name).style.filter = 'grayscale(0%)';
    document.getElementById(main_branch.name).style.borderColor = 'white';
    document.getElementById(main_branch.name).style.opacity = '1';
  }
  for (const runeId of [main_rune1, main_rune2, main_rune3, main_rune4]) {
    if (!runeId) continue;
    const el = document.getElementById(runeId);
    if (!el) continue;
    el.style.filter = 'grayscale(0%)';
    el.style.border = 'solid 1px white';
    el.style.opacity = '1';
  }

  // Highlight sec runes
  for (const runeId of [sec_rune1, sec_rune2]) {
    if (!runeId) continue;
    const el = document.getElementById(runeId);
    if (!el) continue;
    el.style.filter = 'grayscale(0%)';
    el.style.border = 'solid 1px white';
    el.style.opacity = '1';
  }

  // Highlight shards
  for (const shardId of shardIds) {
    if (!shardId) continue;
    const el = document.getElementById(shardId);
    if (!el) continue;
    el.style.filter = 'grayscale(0%)';
    el.style.border = 'solid 1px white';
    el.style.opacity = '1';
  }

  // Stars for unique / runaan's items
  if (role) showStarsForUniqueItems(items, uniqueItems, role);
  if (start_item && start_item.name === "Bloodsong") {
    document.getElementById("star0").style.display = 'inline-block';
  } else {
    document.getElementById("star0").style.display = 'none';
  }
}

// Click on a champion name in history -> smooth scroll to top + restore the UI.
// Each history_element has an id like "elementN", where N is the ordinal number
// (1 — the most recent entry). Convert N -> index in myData.
document.querySelectorAll('.history_element').forEach(el => {
  const nameEl = el.querySelector('.example_name');
  if (!nameEl) return;
  nameEl.style.cursor = 'pointer';
  nameEl.addEventListener('click', () => {
    const number_h = parseInt(el.id.replace('element', ''), 10);
    const myDataIndex = myData.length - number_h;
    if (myDataIndex < 0 || myDataIndex >= myData.length) return;
    applyStateFromHistory(myData[myDataIndex]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
