const form = document.querySelector("#resumeForm");
const preview = document.querySelector("#resumePreview");
const downloadButton = document.querySelector("#downloadPdf");
const printButton = document.querySelector("#printResume");
const shareButton = document.querySelector("#shareResume");
const suggestionButtons = document.querySelectorAll("[data-suggestion]");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const photoInput = document.querySelector("#photoInput");
const phoneInput = document.querySelector('input[name="telefone"]');
const addExperienceButton = document.querySelector("#addExperience");
const addCourseButton = document.querySelector("#addCourse");
const addLanguageButton = document.querySelector("#addLanguage");
const contactForm = document.querySelector("#contactForm");
const contactFeedback = document.querySelector("#contactFeedback");

let resumePhoto = "";

const skillSuggestions = {
  programacao: "HTML\nCSS\nJavaScript\nLógica de programação\nOrganização",
  administrativo: "Pacote Office\nOrganização de documentos\nAtendimento por e-mail\nComunicação",
  atendimento: "Comunicação\nAtendimento ao público\nTrabalho em equipe\nPontualidade",
  saude: "Comunicação\nResponsabilidade\nOrganização\nAtendimento humanizado\nTrabalho em equipe",
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPhone(value) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  if (numbers.length <= 2) {
    return numbers ? `(${numbers}` : "";
  }

  if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }

  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

function getValue(name) {
  return form.elements[name]?.value?.trim() || "";
}

function getRepeatValue(item, field) {
  return item.querySelector(`[data-field="${field}"]`)?.value?.trim() || "";
}

function formatWorkload(value) {
  const cleanValue = String(value || "").trim();
  if (!cleanValue) return "";
  if (/[a-zA-ZÀ-ÿ]/.test(cleanValue)) return cleanValue;
  return `${cleanValue} horas`;
}

function collectExperiences() {
  return [...document.querySelectorAll("[data-experience]")]
    .map((item) => ({
      empresa: getRepeatValue(item, "empresa"),
      cargo: getRepeatValue(item, "cargo"),
      periodo: getRepeatValue(item, "periodo"),
      descricao: getRepeatValue(item, "descricao"),
    }))
    .filter((item) => item.empresa || item.cargo || item.periodo || item.descricao);
}

function collectCourses() {
  return [...document.querySelectorAll("[data-course]")]
    .map((item) => ({
      nome: getRepeatValue(item, "nome"),
      instituicao: getRepeatValue(item, "instituicao"),
      carga: getRepeatValue(item, "carga"),
      ano: getRepeatValue(item, "ano"),
    }))
    .filter((item) => item.nome || item.instituicao || item.carga || item.ano);
}

function collectLanguages() {
  return [...document.querySelectorAll("[data-language]")]
    .map((item) => ({
      idioma: getRepeatValue(item, "idioma"),
      nivel: getRepeatValue(item, "nivel"),
    }))
    .filter((item) => item.idioma || item.nivel);
}

function getFormData() {
  return {
    nome: getValue("nome"),
    idade: getValue("idade"),
    cidade: getValue("cidade"),
    telefone: getValue("telefone"),
    email: getValue("email"),
    objetivo: getValue("objetivo"),
    nivelEscolar: getValue("nivelEscolar"),
    instituicao: getValue("instituicao"),
    anoConclusao: getValue("anoConclusao"),
    cursando: form.elements.cursando?.checked,
    areaInteresse: getValue("areaInteresse"),
    nivelHabilidade: getValue("nivelHabilidade") || "Básico",
    habilidades: getValue("habilidades"),
    voluntario: getValue("voluntario"),
    mostrarFoto: form.elements.mostrarFoto?.checked,
    corPrincipal: getValue("corPrincipal") || "#2563eb",
    estiloCabecalho: getValue("estiloCabecalho") || "simples",
    tamanhoTexto: getValue("tamanhoTexto") || "normal",
    formatoFoto: getValue("formatoFoto") || "quadrada",
    experiences: collectExperiences(),
    courses: collectCourses(),
    languages: collectLanguages(),
  };
}

function formatMultiline(value) {
  const cleanValue = String(value || "").trim();
  if (!cleanValue) return "";

  const lines = cleanValue
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return `<p>${escapeHtml(cleanValue)}</p>`;
  }

  return `<ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
}

function createSection(title, content) {
  if (!content) return "";
  return `
    <section>
      <h3>${escapeHtml(title)}</h3>
      ${content}
    </section>
  `;
}

function lineList(items) {
  const filteredItems = items.filter(Boolean);
  if (!filteredItems.length) return "";
  return `<p>${filteredItems.map(escapeHtml).join(" | ")}</p>`;
}

function formatSkills(skills, level) {
  const lines = String(skills || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return "";

  return `<ul>${lines
    .map((line) => {
      const hasLevel = /\s-\s/.test(line);
      return `<li>${escapeHtml(hasLevel ? line : `${line} - ${level}`)}</li>`;
    })
    .join("")}</ul>`;
}

function formatExperiences(experiences) {
  if (!experiences.length) return "";

  return experiences
    .map((item) => {
      const title = [item.empresa, item.cargo, item.periodo].filter(Boolean).join(" | ");
      return `
        <div class="resume-entry">
          ${title ? `<p><strong>${escapeHtml(title)}</strong></p>` : ""}
          ${formatMultiline(item.descricao)}
        </div>
      `;
    })
    .join("");
}

function formatCourses(courses) {
  if (!courses.length) return "";

  return courses
    .map((item) => {
      const title = [item.nome, item.instituicao, formatWorkload(item.carga), item.ano].filter(Boolean).join(" | ");
      return `<div class="resume-entry"><p>${escapeHtml(title)}</p></div>`;
    })
    .join("");
}

function formatLanguages(languages) {
  if (!languages.length) return "";

  return `<ul>${languages
    .map((item) => `<li>${escapeHtml([item.idioma, item.nivel].filter(Boolean).join(" - "))}</li>`)
    .join("")}</ul>`;
}

function updateProgress(data) {
  if (!progressText || !progressBar) return;

  const checks = [
    data.nome,
    data.telefone,
    data.email,
    data.cidade,
    data.objetivo,
    data.nivelEscolar,
    data.instituicao,
    data.habilidades,
    data.experiences.length,
    data.courses.length,
  ];
  const completed = checks.filter(Boolean).length;
  const percent = Math.round((completed / checks.length) * 100);

  progressText.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
}

function renderResume() {
  const data = getFormData();
  const contacts = [data.idade ? `${data.idade} anos` : "", data.cidade, data.telefone, data.email].filter(Boolean);
  const education = [data.instituicao, data.nivelEscolar, data.cursando ? "Cursando" : data.anoConclusao].filter(Boolean);
  const photo = data.mostrarFoto && resumePhoto ? `<img class="resume-photo" src="${resumePhoto}" alt="Foto do candidato" />` : "";

  preview.style.setProperty("--resume-accent", data.corPrincipal);
  preview.dataset.header = data.estiloCabecalho;
  preview.dataset.font = data.tamanhoTexto;
  preview.dataset.photo = data.formatoFoto;

  preview.innerHTML = `
    <header class="resume-head">
      <div>
        <h2>${escapeHtml(data.nome || "Seu nome")}</h2>
        ${lineList(contacts) || "<p>Telefone | E-mail | Cidade/Estado</p>"}
      </div>
      ${photo}
    </header>
    ${createSection("Objetivo", formatMultiline(data.objetivo || "Preencha o formulário para gerar a prévia do currículo."))}
    ${createSection("Experiência profissional", formatExperiences(data.experiences))}
    ${createSection("Escolaridade", education.length ? `<p>${education.map(escapeHtml).join(" | ")}</p>` : "")}
    ${createSection("Cursos e certificações", formatCourses(data.courses))}
    ${createSection("Habilidades", formatSkills(data.habilidades, data.nivelHabilidade))}
    ${createSection("Idiomas", formatLanguages(data.languages))}
    ${createSection("Trabalho voluntário", formatMultiline(data.voluntario))}
  `;

  updateProgress(data);
}

function applySuggestion(type) {
  const data = getFormData();
  const objetivo = form.elements.objetivo;
  const habilidades = form.elements.habilidades;

  if (type === "first-job") {
    objetivo.value =
      "Em busca da primeira oportunidade profissional para desenvolver minhas habilidades, aprender com a equipe e contribuir com responsabilidade.";
  }

  if (type === "technology") {
    objetivo.value =
      "Atuar na área de tecnologia, contribuindo com dedicação, aprendizado contínuo e interesse em desenvolvimento digital.";
  }

  if (type === "skills") {
    habilidades.value =
      skillSuggestions[data.areaInteresse] ||
      "Comunicação\nOrganização\nTrabalho em equipe\nPontualidade\nConhecimento básico de internet e editores de texto";
  }

  renderResume();
}

function handlePhotoUpload() {
  const file = photoInput.files?.[0];

  if (!file) {
    resumePhoto = "";
    renderResume();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    resumePhoto = reader.result;
    renderResume();
  };
  reader.readAsDataURL(file);
}

function makeRemoveButton() {
  return `<button type="button" class="remove-button" data-remove-item>Remover</button>`;
}

function addExperience() {
  document.querySelector("#experienceList").insertAdjacentHTML(
    "beforeend",
    `<div class="repeat-item" data-experience>
      ${makeRemoveButton()}
      <div class="form-row">
        <label>Empresa<input data-field="empresa" type="text" placeholder="Ex.: Empresa anterior" /></label>
        <label>Cargo<input data-field="cargo" type="text" placeholder="Ex.: Auxiliar" /></label>
      </div>
      <label>Período<input data-field="periodo" type="text" placeholder="Ex.: Jan. 2024 - Dez. 2025" /></label>
      <label>Descrição das atividades<textarea data-field="descricao" rows="3" placeholder="Descreva suas principais atividades."></textarea></label>
    </div>`
  );
}

function addCourse() {
  document.querySelector("#courseList").insertAdjacentHTML(
    "beforeend",
    `<div class="repeat-item" data-course>
      ${makeRemoveButton()}
      <div class="form-row">
        <label>Nome do curso<input data-field="nome" type="text" placeholder="Ex.: Excel Básico" /></label>
        <label>Instituição<input data-field="instituicao" type="text" placeholder="Ex.: Senac" /></label>
      </div>
      <div class="form-row">
        <label>Carga horária<input data-field="carga" type="text" placeholder="Ex.: 40 horas" /></label>
        <label>Ano<input data-field="ano" type="text" placeholder="Ex.: 2026" /></label>
      </div>
    </div>`
  );
}

function addLanguage() {
  document.querySelector("#languageList").insertAdjacentHTML(
    "beforeend",
    `<div class="repeat-item" data-language>
      ${makeRemoveButton()}
      <div class="form-row">
        <label>Idioma<input data-field="idioma" type="text" placeholder="Ex.: Espanhol" /></label>
        <label>Nível<select data-field="nivel"><option value="">Selecione</option><option>Básico</option><option>Intermediário</option><option>Avançado</option><option>Fluente</option></select></label>
      </div>
    </div>`
  );
}

async function downloadPdf() {
  renderResume();

  if (window.html2pdf) {
    const personName = getValue("nome").toLowerCase().replace(/\s+/g, "-") || "curriculo";
    const pdfContainer = document.createElement("div");
    const pdfResume = preview.cloneNode(true);

    pdfContainer.className = "pdf-export-area";
    pdfResume.classList.add("pdf-version");
    pdfContainer.appendChild(pdfResume);
    document.body.appendChild(pdfContainer);

    const options = {
      margin: 0,
      filename: `${personName}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css"] },
    };

    try {
      await window.html2pdf().set(options).from(pdfResume).save();
    } finally {
      pdfContainer.remove();
    }
    return;
  }

  window.print();
}

async function shareResume() {
  const data = getFormData();
  const text = `Currículo de ${data.nome || "candidato"} criado no Impulso Tech.`;

  if (navigator.share) {
    await navigator.share({
      title: "Currículo Impulso Tech",
      text,
    });
    return;
  }

  alert("Use o botão Baixar PDF para compartilhar o currículo.");
}

if (form && preview) {
  form.addEventListener("input", renderResume);
  form.addEventListener("change", renderResume);
  form.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-item]");
    if (!removeButton) return;

    removeButton.closest(".repeat-item").remove();
    renderResume();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    renderResume();
    preview.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  photoInput.addEventListener("change", handlePhotoUpload);
  phoneInput.addEventListener("input", () => {
    phoneInput.value = formatPhone(phoneInput.value);
  });
  addExperienceButton.addEventListener("click", addExperience);
  addCourseButton.addEventListener("click", addCourse);
  addLanguageButton.addEventListener("click", addLanguage);
  downloadButton.addEventListener("click", downloadPdf);
  printButton.addEventListener("click", () => window.print());
  shareButton.addEventListener("click", shareResume);

  suggestionButtons.forEach((button) => {
    button.addEventListener("click", () => applySuggestion(button.dataset.suggestion));
  });

  renderResume();
}

if (contactForm && contactFeedback) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    contactFeedback.textContent = "Mensagem registrada. Em breve, entraremos em contato.";
    contactForm.reset();
  });
}
