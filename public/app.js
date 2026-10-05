const STORAGE_KEY = "marioai.characters.v1";

let characters = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let currentId = characters[0]?.id || null;
let busy = false;

const $$ = (selector) => document.querySelector(selector);
const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function saveCharacters() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}

function currentCharacter() {
  return characters.find((character) => character.id === currentId) || null;
}

function defaultCharacter() {
  return {
    id: crypto.randomUUID(),
    name: "Aria",
    gender: "Female",
    genre: "Fantasy",
    maturity: "Mature",
    personality: "Warm, brave, curious, and emotionally expressive.",
    backstory: "A wandering mage searching for a lost city and a forgotten promise.",
    emotion: "Calm",
    hp: 100,
    maxHp: 100,
    relationship: 0,
    alive: true,
    memory: ["Aria is searching for the lost city of Aurelion."],
    history: [{ role: "assistant", content: "Aria turns toward you with a quiet smile. 'So... we're finally here.'" }]
  };
}

function normalizeCharacter(raw = {}) {
  const hp = Math.max(1, Number(raw.hp ?? raw.maxHp ?? 100));
  const maxHp = Math.max(1, Number(raw.maxHp ?? hp ?? 100));

  return {
    id: String(raw.id || crypto.randomUUID()),
    name: String(raw.name || "Aria"),
    gender: String(raw.gender || "Female"),
    genre: String(raw.genre || "Fantasy"),
    maturity: String(raw.maturity || "Mature"),
    personality: String(raw.personality || "Warm, brave, curious, and emotionally expressive."),
    backstory: String(raw.backstory || "A wandering soul with a hidden destiny."),
    emotion: String(raw.emotion || "Calm"),
    hp: Math.min(maxHp, hp),
    maxHp,
    relationship: Math.max(0, Math.min(100, Number(raw.relationship || 0))),
    alive: raw.alive !== false,
    memory: Array.isArray(raw.memory) ? raw.memory : [],
    history: Array.isArray(raw.history) ? raw.history : []
  };
}

function renderCharacterList() {
  const list = $("characterList");
  list.innerHTML = characters.map((character) => `
    <div class="character-card ${character.id === currentId ? "active" : ""}">
      <button type="button" data-id="${character.id}">
        <strong>${escapeHtml(character.name)}</strong>
        <small>${escapeHtml(character.genre)} · ${character.alive ? "Alive" : "Dead"}</small>
      </button>
    </div>
  `).join("");

  list.querySelectorAll("button[data-id]").forEach((button) => {
    button.addEventListener("click", () => {
      currentId = button.dataset.id;
      render();
    });
  });
}

function renderStatePanel(character) {
  $("statePanel").innerHTML = `
    <div class="state-row"><span>Emotion</span><strong>${escapeHtml(character.emotion)}</strong></div>
    <div class="state-row"><span>HP</span><strong>${character.hp}/${character.maxHp}</strong></div>
    <div class="state-row"><span>Bond</span><strong>${character.relationship}/100</strong></div>
    <div class="state-row"><span>Memory</span><strong>${character.memory.length}</strong></div>
    <div class="state-row"><span>Status</span><strong>${character.alive ? "Alive" : "Dead"}</strong></div>
  `;
}

function renderMemoryList(character) {
  const items = character.memory.length
    ? character.memory.slice(-8).reverse().map((memory) => `<div class="memory-item">🧠 ${escapeHtml(memory)}</div>`).join("")
    : "<div class=\"memory-item\">No memories yet.</div>";

  $("memoryList").innerHTML = items;
}

function renderMessages(character) {
  $("messages").innerHTML = (character.history || []).map((entry) => {
    const role = entry.role === "assistant" ? "ai" : entry.role === "user" ? "user" : "system";
    return `<div class="msg ${role}">${escapeHtml(entry.content)}</div>`;
  }).join("");

  $("messages").scrollTop = $("messages").scrollHeight;
}

function render() {
  const char = currentCharacter();

  if (!char) {
    $("emptyState").classList.remove("hidden");
    $("chatPanel").classList.add("hidden");
    renderCharacterList();
    return;
  }

  const normalized = normalizeCharacter(char);
  const index = characters.findIndex((item) => item.id === normalized.id);
  if (index >= 0) {
    characters[index] = normalized;
  }

  $("emptyState").classList.add("hidden");
  $("chatPanel").classList.remove("hidden");

  $("characterName").textContent = normalized.name;
  $("characterMeta").textContent = `${normalized.genre} · ${normalized.gender} · ${normalized.maturity}`;
  $("avatar").textContent = normalized.name.charAt(0).toUpperCase();
  $("emotionValue").textContent = normalized.emotion;
  $("hpValue").textContent = `${normalized.hp}/${normalized.maxHp}`;
  $("bondValue").textContent = `${normalized.relationship}/100`;
  $("aliveBadge").textContent = normalized.alive ? "ALIVE" : "DEAD";
  $("aliveBadge").classList.toggle("alive", normalized.alive);
  $("aliveBadge").classList.toggle("dead", !normalized.alive);
  $("sceneImage").textContent = `${normalized.name} appears`;
  $("sceneCaption").textContent = normalized.backstory;

  const mode = "Demo mode";
  $("charMode").textContent = mode;
  renderMessages(normalized);
  renderStatePanel(normalized);
  renderMemoryList(normalized);
  saveCharacters();
  renderCharacterList();
}

function inferState(character, userMessage, reply) {
  const text = `${userMessage} ${reply}`.toLowerCase();

  if (/love|happy|smile|laugh|excited|joy|glad/.test(text)) {
    character.emotion = "Happy";
  } else if (/angry|rage|furious|hate|mad/.test(text)) {
    character.emotion = "Angry";
  } else if (/sad|cry|lonely|grief|tear/.test(text)) {
    character.emotion = "Sad";
  } else if (/scared|fear|afraid|terrified|panic/.test(text)) {
    character.emotion = "Scared";
  } else if (/jealous|envy/.test(text)) {
    character.emotion = "Jealous";
  } else {
    character.emotion = "Calm";
  }

  if (/love|trust|friend|happy|thank|safe|protect/.test(text)) {
    character.relationship = Math.min(100, character.relationship + 4);
  } else if (/hate|anger|betray|abandon|hurt/.test(text)) {
    character.relationship = Math.max(0, character.relationship - 4);
  }
}

async function sendMessage(textOverride = null) {
  const current = currentCharacter();
  if (!current || busy || !current.alive) return;

  const message = (textOverride ?? $("chatInput").value).trim();
  if (!message) return;

  $("chatInput").value = "";
  $("charCounter").textContent = "0/10000";

  current.history.push({ role: "user", content: message });
  render();
  busy = true;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character: current,
        message,
        history: current.history,
        memory: current.memory,
        state: current,
        maturity: current.maturity
      })
    });

    const data = await response.json();
    if (!response.ok || !data?.reply) {
      throw new Error(data?.error || "Request failed.");
    }

    current.history.push({ role: "assistant", content: data.reply });
    inferState(current, message, data.reply);

    if (/remember|don't forget|i like|my name is|i love|favorite|important/.test(message.toLowerCase())) {
      const memoryText = message.replace(/^(remember|don't forget|i remember)\s+/i, "").trim();
      if (memoryText) {
        current.memory.push(memoryText);
      }
    }
  } catch (error) {
    current.history.push({ role: "system", content: `Error: ${error.message}` });
  } finally {
    busy = false;
    saveCharacters();
    render();
  }
}

async function generateScene() {
  const current = currentCharacter();
  if (!current) return;

  try {
    const response = await fetch("/api/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Cinematic anime-style scene featuring ${current.name}, a ${current.gender} character, genre ${current.genre}. Emotion: ${current.emotion}. Backstory: ${current.backstory}.` 
      })
    });
    const data = await response.json();

    if (data?.image) {
      $("sceneImage").style.backgroundImage = `url(${data.image})`;
      $("sceneImage").style.backgroundSize = "cover";
      $("sceneImage").style.backgroundPosition = "center";
      $("sceneImage").textContent = "";
      current.history.push({ role: "system", content: `Scene generated for ${current.name}.` });
    } else {
      current.history.push({ role: "system", content: data?.message || "No scene generated yet." });
    }
  } catch (error) {
    current.history.push({ role: "system", content: `Scene error: ${error.message}` });
  }

  saveCharacters();
  render();
}

function addMemory() {
  const current = currentCharacter();
  if (!current) return;

  const value = window.prompt("Add a permanent memory:");
  if (!value || !value.trim()) return;

  current.memory.push(value.trim());
  saveCharacters();
  render();
}

function applyDamage() {
  const current = currentCharacter();
  if (!current || !current.alive) return;

  current.hp = Math.max(0, current.hp - 20);
  current.emotion = current.hp === 0 ? "Defeated" : "Pain";
  current.history.push({ role: "system", content: `⚔ ${current.name} took 20 damage. HP ${current.hp}/${current.maxHp}.` });

  if (current.hp === 0) {
    current.alive = false;
    current.history.push({ role: "system", content: `☠ ${current.name} has fallen.` });
  }

  saveCharacters();
  render();
}

function applyHeal() {
  const current = currentCharacter();
  if (!current || !current.alive) return;

  current.hp = Math.min(current.maxHp, current.hp + 20);
  current.emotion = "Relieved";
  current.history.push({ role: "system", content: `💚 ${current.name} recovered 20 HP.` });
  saveCharacters();
  render();
}

function cinematicPrompt() {
  const current = currentCharacter();
  if (!current) return;

  const prompt = "Create a cinematic continuation of this exact moment. Include atmosphere, emotion, body language, and a meaningful consequence.";
  sendMessage(prompt);
}

function updateCounter() {
  $("charCounter").textContent = `${$("chatInput").value.length}/10000`;
}

function openCharacterDialog() {
  $("characterForm").reset();
  $("charHp").value = 100;
  $("characterDialog").showModal();
}

function createCharacterFromForm(event) {
  event.preventDefault();

  const name = $("charNameInput").value.trim();
  if (!name) return;

  const character = normalizeCharacter({
    id: crypto.randomUUID(),
    name,
    gender: $("charGender").value,
    genre: $("charGenre").value,
    maturity: $("charMaturity").value,
    personality: $("charPersonality").value.trim() || "Warm, brave, curious, and emotionally expressive.",
    backstory: $("charBackstory").value.trim() || "A soul with a story still waiting to be written.",
    hp: Number($("charHp").value) || 100,
    maxHp: Number($("charHp").value) || 100,
    relationship: 0,
    emotion: "Calm",
    alive: true,
    memory: [],
    history: [{ role: "assistant", content: `${name} arrives in the room, eyes full of quiet possibility.` }]
  });

  characters.push(character);
  currentId = character.id;
  saveCharacters();
  render();
  $("characterDialog").close();
}

function initialize() {
  if (!characters.length) {
    characters.push(defaultCharacter());
    currentId = characters[0].id;
    saveCharacters();
  }

  $("emptyCreateBtn").addEventListener("click", openCharacterDialog);
  $("newCharacterBtn").addEventListener("click", openCharacterDialog);
  $("sendBtn").addEventListener("click", () => sendMessage());
  $("chatInput").addEventListener("input", updateCounter);
  $("chatInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  $("cinematicBtn").addEventListener("click", cinematicPrompt);
  $("imageBtn").addEventListener("click", generateScene);
  $("damageBtn").addEventListener("click", applyDamage);
  $("healBtn").addEventListener("click", applyHeal);
  $("memoryBtn").addEventListener("click", addMemory);
  $("characterForm").addEventListener("submit", createCharacterFromForm);

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialogId = button.getAttribute("data-close");
      const dialog = document.getElementById(dialogId);
      if (dialog) dialog.close();
    });
  });

  render();
}

initialize();
