// ============================================================================
// Загрузка данных из data-* атрибутов скрытого контейнера (передаётся из Flask)
// ============================================================================
const container = document.getElementById("data-container");
const summoners = JSON.parse(container.dataset.summoners);              // обычные саммонер-спеллы
const smite = JSON.parse(container.dataset.smite);                       // smite (используется только в Jungle)
const champion_arts = JSON.parse(container.dataset.championArts);        // арты чемпионов (фон главной карточки)
const champion_icons = JSON.parse(container.dataset.championIcons);      // иконки чемпионов (для бана)
const common_start_items = JSON.parse(container.dataset.commonStartItems);
const jungle_start_items = JSON.parse(container.dataset.jungleStartItems);
const support_start_items = JSON.parse(container.dataset.supportStartItems);
const legendary_items = JSON.parse(container.dataset.legendaryItems);    // легендарки (5 или 6 на ролл)
const boots = JSON.parse(container.dataset.boots);
const roles = JSON.parse(container.dataset.roles);                       // Top, Jungle, Mid, Bot, Support
const abilities = JSON.parse(container.dataset.abilities);               // абилки всех чемпионов (q/w/e)
const runes_branches = JSON.parse(container.dataset.runesBranches);      // 5 веток рун

// История роллов (localStorage). Ограничена 15 записями.
function loadData() {
  const raw = localStorage.getItem("myListOfLists");
  if (!raw) return []; // всегда массив
  return deserialize(raw);
}

const STORAGE_KEY = "myListOfLists";
const myData = loadData();

// ============================================================================
// Фильтр ролей: кнопки слева от главной карточки переключают, какие роли
// допустимы при рандомайзе. Один клик — выбор только этой роли,
// повторный — выключает фильтр (тогда роль выбирается из всех).
// ============================================================================
const role_buttons = document.querySelectorAll('.role-toggle');
role_buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('active')) {
      btn.classList.remove('active'); // выключаем, если повторный клик
    } else {
      role_buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  });
});

// ============================================================================
// Уникальные пассивки предметов — рядом с такими предметами рисуется звезда
// с тултипом, в котором написана сама пассивка.
// ============================================================================
const uniqueItems = [
  { name: "winter's approach", trait: "Manaflow" },
  { name: "manamune", trait: "Manaflow" },
  { name: "archangel's staff", trait: "Manaflow" },
  { name: "trailblazer", trait: "Momentum" },
  { name: "dead man's plate", trait: "Momentum" },
  { name: "sunfire aegis", trait: "Immolate" },
  { name: "hollow radiance", trait: "Immolate" },
  { name: "lich bane", trait: "Spellblade" },
  { name: "trinity force", trait: "Spellblade" },
  { name: "iceborn gauntlet", trait: "Spellblade" },
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
  { name: "profane hydra", trait: "Hydra" },
  { name: "stridebreaker", trait: "Hydra" },
  { name: "ravenous hydra", trait: "Hydra" },
  { name: "titanic hydra", trait: "Hydra" },
];


// ============================================================================
// Конфликты предметов — какие предметы не могут сосуществовать в одной сборке.
// Используется в isConflict(): при наборе пула легендарок предмет пропускается,
// если уже выбран кто-то из его "врагов".
// ============================================================================
const conflicts = {
  "winter's approach": ["manamune", "archangel's staff"],
  "manamune": ["winter's approach", "archangel's staff"],
  "archangel's staff": ["manamune", "manamune"],
  "trailblazer": ["dead man's plate"],
  "dead man's plate": ["trailblazer"],
  "sunfire aegis": ["hollow radiance"],
  "hollow radiance": ["sunfire aegis"],
  "lich bane": ["trinity force", "iceborn gauntlet", "Bloodsong"],
  "trinity force": ["lich bane", "iceborn gauntlet", "Bloodsong"],
  "iceborn gauntlet": ["trinity force", "lich bane", "Bloodsong"],
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
  "immortal shieldbow": ["sterack's cage", "maw of malmortius"],
  "sterack's cage": ["immortal shieldbow", "maw of malmortius"],
  "maw of malmortius": ["immortal shieldbow", "sterack's cage"],
  "profane hydra": ["stridebreaker", "ravenous hydra", "titanic hydra"],
  "stridebreaker": ["profane hydra", "titanic hydra", "ravenous hydra"],
  "ravenous hydra": ["profane hydra", "stridebreaker", "titanic hydra"],
  "titanic hydra": ["profane hydra", "stridebreaker", "ravenous hydra"],
  "Bloodsong": ["trinity force", "iceborn gauntlet", "lich bane"]
}

// ============================================================================
// Таблица соответствия "имя руны → id картинки + ветка". Нужна для:
//   - истории: чтобы восстановить путь к картинке по имени руны
//   - подсветки правильной руны при выборе ветки
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
// Утилиты и функции рандомного выбора
// ============================================================================

// Список id ролей, у которых сейчас активна кнопка-фильтр
function getCurrentRoles() {
  const activeButtons = [...role_buttons].filter(btn => btn.classList.contains('active'));
  return activeButtons.map(btn => btn.id);
}

// Возвращает 2 саммонер-спелла. Для Jungle первый всегда smite, второй — случайный.
function getSummoners(arr, smite_arr, cur_role, count) {
  if (cur_role === "Jungle") {
    const randomSummoner = arr[Math.floor(Math.random() * arr.length)];
    return [smite_arr[0], randomSummoner]
  } else {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

// Один случайный элемент массива
function get1Random(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

// Конфликтует ли кандидат с уже выбранными предметами (по таблице conflicts)
function isConflict(selected, candidate) {
  return selected.some(item => {
    const name1 = item.name;
    const name2 = candidate.name;
    return (conflicts[name1]?.includes(name2) || conflicts[name2]?.includes(name1));
  });
}

// Выбор стартового предмета — пул зависит от роли
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

// "No repeats": выбираем чемпиона из тех, что не встречались в последних 10 роллах
function pickChampionNoRepeats(champion_arts, recent_names) {
  const recent = new Set(recent_names.map(n => (n || "").toLowerCase()));
  const available = champion_arts.filter(c => !recent.has(c.name.toLowerCase()));
  const pool = available.length ? available : champion_arts; // fallback если все запретили
  return pool[Math.floor(Math.random() * pool.length)];
}

// Набор уникальных легендарок с учётом конфликтов и спец-флагов:
//   flag = true (Bloodsong) — пропускаем "трини/айсборн/lich"
//   champ_type = false (мили) — пропускаем "runaan's hurricane"
function getItems(arr, count = 5, flag, champ_type) {
  const banned = ["trinity force", "lich bane", "iceborn gauntlet"];
  const forbiddenForFalse = ["runaan's hurricane"]; 
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  const result = [];

  for (const item of shuffled) {
    const itemName = (item.name?.toLowerCase?.() || item.toLowerCase());

    // если предмет запрещён и включён флаг → пропускаем
    if (flag && banned.includes(itemName)) {
      continue;
    }

    // если champ_type = false и предмет запрещён → пропускаем
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
  // Фильтруем способности, соответствующие текущему чемпиону
  const filtered = arr.filter(
    ability => ability.name.startsWith(current_champion.name.toLowerCase())
  );

  // Перемешиваем массив способностей
  const shuffled = filtered.sort(() => 0.5 - Math.random());

  // Возвращаем первые 3
  return shuffled.slice(0, 3);
}

// Выбор случайной роли с учётом активных role-кнопок-фильтров
function getRandomActiveRoleObject(roles) {
  const roleButtons = document.querySelectorAll('.role-toggle');

  // Получаем имена активных ролей: ['Top', 'Jungle', ...]
  const activeRoleNames = [...roleButtons]
    .filter(btn => btn.classList.contains('active'))
    .map(btn => btn.id.replace('toggle_', ''))
    .map(role => role.charAt(0).toUpperCase() + role.slice(1));

  // Если роли выбраны — фильтруем их
  const filteredRoles = activeRoleNames.length > 0
    ? roles.filter(roleObj => activeRoleNames.includes(roleObj.name))
    : roles; // иначе берём все роли

  // Выбираем случайный объект
  const randomIndex = Math.floor(Math.random() * filteredRoles.length);
  return filteredRoles[randomIndex];
}

// Случайный забаненный чемпион — не может совпасть с текущим выбранным
function getBannedChampion(champions, cur_champ) {
  champ = get1Random(champions);
  while (champ === cur_champ) {
    champ = get1Random(champions);
  }
  return champ;
}

// ============================================================================
// Сброс подсветки всего блока рун — все ветки/ядра/вторичные/шарды в "серый".
// Вызывается перед каждым роллом, чтобы старая подсветка не оставалась.
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

// Заполняет 4 слота-ветки в блоке вторичных рун: показывает все ветки кроме
// главной, и подсвечивает специально выбранную вторичную белой обводкой.
function assignImagesToBranches(imageList, excludedName, specialBranch) {
  // Отфильтровать список: исключить один элемент по имени
  const filteredList = imageList.filter(item => item.name !== excludedName);
  // Пройтись по 4 <img> с id="branch_1", "branch_2", ...
  for (let i = 0; i < 4; i++) {
    const imgId = `branch_${i + 1}`;
    const imgElement = document.getElementById(imgId);
    const imageData = filteredList[i];
    imgElement.src = imageData.image;

    // Проверяем — соответствует ли это special ветке
    if (imageData.image === specialBranch.image) {
      imgElement.style.border = '1px solid white'; 
      imgElement.style.filter = 'grayscale(0%)'; 
      imgElement.style.opacity = '1'; 
    } else {
      imgElement.style.border = '1px solid #939393;'; // очистим, если не соответствует
    }
  }
}

// Вторичная ветка — любая, кроме главной
function getAddictionalBranch(branches, main_branch) {
  rune = get1Random(branches);
  while (rune === main_branch) {
    rune = get1Random(branches);
  }
  return rune;
}

// Подменяет картинки рун в основном блоке и блоке вторичных рун в зависимости
// от выбранной ветки (берёт URL из data-* атрибутов <img>). Также показывает/
// скрывает 4-ю keystone-руну: она существует только для precision и sorcery.
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


// Выбор 4 основных рун: по одной из каждого ряда (keystone + 3 минор-ряда).
// Для precision/sorcery в первом ряду 4 варианта, для остальных — 3.
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

// Две вторичные руны из двух разных рядов (3 ряда по 3 руны)
function getSecRunes() {
  const st1 = ["sec_rune1", "sec_rune2", "sec_rune3"];
  const nd2 = ["sec_rune4", "sec_rune5", "sec_rune6"];
  const rd3 = ["sec_rune7", "sec_rune8", "sec_rune9"];
  
  const pools = [st1, nd2, rd3];

  // Выбираем два разных массива
  const firstIndex = Math.floor(Math.random() * pools.length);
  let secondIndex;
  do {
    secondIndex = Math.floor(Math.random() * pools.length);
  } while (secondIndex === firstIndex);

  const firstRune = get1Random(pools[firstIndex]);
  const secondRune = get1Random(pools[secondIndex]);

  return [firstRune, secondRune];
}


// Показывает звёздочки-индикаторы над предметами:
//   - "Runaan's Hurricane" → жёлтая звезда с подписью "Ranged only"
//   - Уникальные пассивки из uniqueItems → розовая звезда с названием пассивки
// Для Support прячет 5-ю звезду, для не-Bot прячет 6-ю.
function showStarsForUniqueItems(objects, uniqueItems, role) {
  objects.forEach((cur_object, index) => {
    const starElement = document.getElementById(`star${index + 1}`);
    const textElement = document.getElementById(`text${index + 1}`);
    const imgElement = document.getElementById(`ss${index + 1}`);

    if (!starElement || !textElement) return; // защита от null

    // Особый случай "Runaan's Hurricane"
    if (cur_object.name.toLowerCase() === "runaan's hurricane") {
      starElement.style.display = 'inline-block';
      starElement.style.color = "yellow";
      textElement.textContent = "Ranged champions only";
      textElement.style.backgroundColor = "yellow";
      textElement.classList.add("yellow");
      imgElement.style.backgroundColor = "yellow";
      imgElement.style.borderColor = "yellow";
      return; // дальше не идем
    }

    // Проверка на уникальные предметы
    const foundUnique = uniqueItems.find(u => u.name === cur_object.name);
    if (foundUnique) {
      starElement.style.display = 'inline-block';
      textElement.textContent = `Unique: ${foundUnique.trait}`;
    } else {
      // если не уникальный и не runaan's
      starElement.style.backgroundColor = "#FF9E9E";
      textElement.style.borderColor = "#FF9E9E transparent transparent transparent";
      textElement.style.backgroundColor = "#FF9E9E";
      imgElement.style.backgroundColor = "#FF9E9E";
      imgElement.style.borderColor = "#FF9E9E";
      textElement.classList.remove("yellow");
    }
  });

  // Если роль Support — скрываем 5-ю звезду
  if (role.name === "Support") {
    const starElement = document.getElementById('star5');
    if (starElement) {
      starElement.style.display = 'none';
    }
  }
  // Если роль не Bot — скрываем 6-ю звезду
  if (role.name !== "Bot") {
    const starElement = document.getElementById('star6');
    if (starElement) {
      starElement.style.display = 'none';
    }
  }
}


// Управляет видимостью 5-го и 6-го слотов в items_row:
//   Support → скрываем 5-й слот (у саппа только 4 легендарки)
//   Bot     → показываем дополнительный 6-й слот
function assignRoles (cur_role) {
  if (cur_role === "Support") {
    document.getElementById('5th').style.display = 'none';
    document.getElementById('star5').style.display = 'none';
    document.getElementById('label5').style.display = 'none';
  } else {
    document.getElementById('5th').style.display = 'inline-block';
    document.getElementById('star5').style.display = 'inline-block';
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
  let day = date.getDate().toString().padStart(2, "0");   // день с ведущим нулем
  let month = (date.getMonth() + 1).toString().padStart(2, "0"); // месяц с ведущим нулем
  let year = date.getFullYear();
  return `${day}.${month}`;
}

// ============================================================================
// Рендер одной строки истории (number_h = 1..15). Каждый img_N_K — это иконка
// в строке (рунка, саммонер, предмет и т.д.). Путь до картинки собирается из
// имён и папок, сохранённых в myData. Поддерживает 6-й предмет для Bot.
// ============================================================================
function updateHistoryElement(number_h, champion_name_h, branch_name_h, rune_img_name_h, summoner1_name_h, summoner2_name_h,
  start_item_h, start_folder_h, boots_h, item1_h, item2_h, item3_h, item4_h, item5_h, role_h, ability1_h, ability2_h, ability3_h, date_var_h, item6_h
) {
  // Соглашение по регистру файлов:
  //   все папки → lowercase, КРОМЕ static/images/items/boots/ (Title Case).
  // Поэтому ниже большинство имён принудительно приводится к нижнему регистру,
  // а имя бота — оставляем как есть (оно уже Title Case в данных).
  const lc = s => (s == null ? "" : s.toString().toLowerCase());

  document.getElementById('element' + number_h.toString()).style.display = "flex";
  document.getElementById(`name${number_h.toString()}`).textContent = number_h.toString() + ". " + capitalizeFirstLetter(champion_name_h);
  // character_icons/ хранит файлы в lowercase (aatrox.png, draven.png).
  // champion_name_h может быть "Draven" (capitalizeFirstLetter применён при сохранении),
  // поэтому принудительно приводим к нижнему регистру.
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

// По названию роли возвращает имя папки со стартовыми предметами
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
// Сериализация в localStorage с поддержкой Date (иначе JSON.stringify теряет тип)
// ============================================================================
function serialize(data) {
  return JSON.stringify(data, function (key, value) {
    // original — исходное значение свойства до toJSON
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

// Удалить список по индексу
function removeList(index) {
  myData.splice(index, 1);
  saveData(myData);
}

// Добавить новый список (история кольцевая: при 15 элементах сдвигает старые)
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
// Основной обработчик кнопки REROLL: генерирует полный набор случайных полей
// (роль, чемпион, саммонеры, руны, предметы, абилки, бан) и обновляет весь UI.
// ============================================================================
document.getElementById('reroll_btn').addEventListener('click', () => {
  const noRepeatsActive = document.getElementById('no_repeats_btn')?.classList.contains('active');
  const bootsStartActive = document.getElementById('boots_start_btn')?.classList.contains('active');

  // --- 1. Случайный выбор всех полей --------------------------------------
  const role = getRandomActiveRoleObject(roles);
  const [summoner1, summoner2] = getSummoners(summoners, smite, role.name, 2);
  // "No repeats": исключаем последних 10 чемпионов
  const recent = noRepeatsActive ? myData.slice(-10).map(v => v[0]) : [];
  const champion = noRepeatsActive ? pickChampionNoRepeats(champion_arts, recent) : get1Random(champion_arts);
  // "Boots start": если выключено, удаляем boots.webp из пула common
  const common_pool = bootsStartActive ? common_start_items : common_start_items.filter(i => i.name.toLowerCase() !== "boots");
  const start_item = getStartItem(common_pool, jungle_start_items, support_start_items, role.name);
  let is_Bloodsong = false;
  if (start_item.name === "Bloodsong") {is_Bloodsong = true};
  let is_Ranged = false;
  if (champion.type === "r") {is_Ranged = true};
  // Bot получает 6 легендарок вместо 5
  const items = getItems(legendary_items, role.name === "Bot" ? 6 : 5, is_Bloodsong, is_Ranged);
  const boot = get1Random(boots);
  const abilities_order = getRandomAbilities(abilities, champion);
  const banned_champion = getBannedChampion(champion_icons, champion);
  const main_runes_branch = get1Random(runes_branches);
  const second_runes_branch = getAddictionalBranch(runes_branches, main_runes_branch);
  const first_group_runes = getMainRunes(main_runes_branch.name);
  const second_group_runes = getSecRunes();
  const shard_runes = [get1Random(["shard1", "shard2", "shard3"]), get1Random(["shard4", "shard5", "shard6"]), get1Random(["shard7", "shard8", "shard9"])];

  // --- 2. Подготовка блоков рун ------------------------------------------
  noColorsForRunes();
  assignImagesToBranches(runes_branches, main_runes_branch.name, second_runes_branch);
  assignMainPage(main_runes_branch.name, second_runes_branch.name);
  assignRoles(role.name);
  for (let element of ["star0", "star1", "star2", "star3", "star4", "star5", "star6"]) {
    document.getElementById(element).style.display = 'none';
  }

  // Перерисовать историю (показывает все сохранённые ранее роллы)
  myData.forEach((value, index) => {
    updateHistoryElement(myData.length - index, ...value);
  });

  // --- 3. Сохраняем текущий ролл в history -------------------------------
  // Структура массива (индексы):
  //   0  champion_name, 1 main_branch, 2 main_rune1 (keystone), 3-4 summoners,
  //   5 start_item, 6 start_folder, 7 boot, 8-12 items 1-5, 13 role,
  //   14-16 ability letters, 17 date, 18 item6 (или null),
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

  // --- 4. Применяем выбранное к live-UI -----------------------------------
  // Главная карточка чемпиона (фон + имя)
  const card = document.getElementById('champion_card');
  card.style.backgroundImage = `url("${champion.image}")`;
  document.getElementById("champion_name").textContent = champion.name.toUpperCase();

  // Саммонер-спеллы
  document.getElementById('summoner1').src = summoner1.image;
  document.getElementById('summoner1').alt = summoner1.name;

  document.getElementById('summoner2').src = summoner2.image;
  document.getElementById('summoner2').alt = summoner2.name;

  // Стартовый предмет / боты / роль
  document.getElementById('start_item').src = start_item.image;
  document.getElementById('start_item').alt = start_item.name;

  document.getElementById('boot').src = boot.image;
  document.getElementById('boot').alt = boot.name;

  document.getElementById('role').src = role.image;
  document.getElementById('role').alt = role.name;

  // Легендарки 1-5 (+ 6-я для Bot)
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

  // Абилки (3 шт.)
  document.getElementById('ability1').src = abilities_order[0].image;
  document.getElementById('ability1').alt = abilities_order[0].name;
  document.getElementById('ability2').src = abilities_order[1].image;
  document.getElementById('ability2').alt = abilities_order[1].name;
  document.getElementById('ability3').src = abilities_order[2].image;
  document.getElementById('ability3').alt = abilities_order[2].name;

  document.getElementById("no_h").style.display = 'none';

  // Спец-обработка Aphelios: лейблы абилок показывают AD/AS/ArP вместо Q/W/E
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

  // Бан
  document.getElementById('banned_champion').src = banned_champion.image;
  document.getElementById('banned_champion').alt = banned_champion.name;

  // Подсветка главной ветки рун
  document.getElementById(main_runes_branch.name).style.filter = 'grayscale(0%)';
  document.getElementById(main_runes_branch.name).style.borderColor = 'white';
  document.getElementById(main_runes_branch.name).style.opacity = '1';

  // Подсветка 4 главных рун
  for (let element of first_group_runes) {
    document.getElementById(element).style.filter = 'grayscale(0%)';
    document.getElementById(element).style.border = 'solid 1px white';
    document.getElementById(element).style.opacity = '1';
  }

  // Подсветка 2 вторичных рун
  for (let element of second_group_runes) {
    document.getElementById(element).style.filter = 'grayscale(0%)';
    document.getElementById(element).style.border = 'solid 1px white';
    document.getElementById(element).style.opacity = '1';
  }

  // Подсветка 3 stat-шардов
  for (let element of shard_runes) {
    document.getElementById(element).style.filter = 'grayscale(0%)';
    document.getElementById(element).style.border = 'solid 1px white';
    document.getElementById(element).style.opacity = '1';
  }

  // Звёзды над уникальными предметами + специальная для Bloodsong start
  showStarsForUniqueItems(items, uniqueItems, role);
  if (start_item.name === "Bloodsong") {
    document.getElementById("star0").style.display = 'inline-block';
  } else {
    document.getElementById("star0").style.display = 'none';
  }

  // Финальная перерисовка истории (включает добавленную сейчас запись)
  myData.forEach((value, index) => {
    updateHistoryElement(myData.length - index, ...value);
  });
});

// ============================================================================
// Стартовая инициализация при загрузке страницы — делает один "автоматический"
// ролл, чтобы UI не показывал заглушки. Логика дублирует reroll-обработчик,
// но без учёта no_repeats/boots_start (тоглы по умолчанию выключены).
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
// Toggle-кнопки "No repeats" / "Boots start" в верхнем баре.
// Просто переключают класс .active — фактическая логика читается в reroll.
// ============================================================================
['no_repeats_btn', 'boots_start_btn'].forEach(id => {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', () => btn.classList.toggle('active'));
});

// ============================================================================ 
// Облачко с названием картинки при наведении (общее для items, banned, и т.д.)
// Один общий div создаётся динамически и переиспользуется. Координаты делятся
// на zoom тела (т.к. body имеет CSS zoom).
// ============================================================================
const itemTooltip = document.createElement('div');
itemTooltip.id = 'item-hover-tooltip';
document.body.appendChild(itemTooltip);

// Превращает URL → красивое имя ("blade_of_the_ruined_king.png" → "Blade of the Ruined King").
// Артикли the/and/of остаются строчными (кроме случая, когда они первое слово).
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

// Тултипы для всех item_label_box (start, boots, 1st..6th)
document.querySelectorAll('.item_label_box').forEach(box => {
  box.addEventListener('mouseenter', (e) => {
    // Не показываем тултип при наведении на саму звезду — у неё свой текст
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

  // Если курсор переходит со звезды обратно на сам слот — снова показываем имя
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

// Тот же тултип для одиночных <img> вне item_label_box
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
// Восстановление состояния из истории: по клику на имя чемпиона восстанавливаем
// весь UI по сохранённому массиву (см. структуру в комментарии к generation1).
// ============================================================================

function applyStateFromHistory(v) {
  // Минимальная длина 18 — это записи без 6-го предмета и шардов
  if (!Array.isArray(v) || v.length < 18) return;

  // --- Парсим все поля массива ---
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

  // --- Поиск объектов по именам в data-массивах ---
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

// Клик по имени чемпиона в истории → плавный скролл наверх + восстановление UI.
// Каждый history_element имеет id вида "elementN", где N — порядковый номер
// (1 — самая свежая запись). Конвертим N → индекс в myData.
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