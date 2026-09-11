const state = {
  data: [],
  schema: null,

  selectedId:
    localStorage.getItem("tm_atlas_selected") || "us",

  mode:
    localStorage.getItem("tm_atlas_language") || "ja",

  optionLanguage: null,
  region: "all",
  query: "",
  favoritesOnly: false,

  favorites: new Set(
    JSON.parse(
      localStorage.getItem("tm_atlas_favorites") || "[]"
    )
  )
};

const ui = {
  list: document.querySelector("#jurisdictionList"),
  detail: document.querySelector("#detailPanel"),
  count: document.querySelector("#jurisdictionCount"),
  search: document.querySelector("#searchInput"),
  filters: document.querySelector("#regionFilters"),
  favoriteFilter: document.querySelector("#favoritesOnly"),
  itemTemplate: document.querySelector(
    "#jurisdictionItemTemplate"
  )
};

const copy = {
  ja: {
    all: "すべて",
    europe: "欧州",
    americas: "米州",
    asia: "アジア",
    region: "地域制度",
    jurisdictions: "法域",

    created: "作成日",
    updated: "最終更新日",

    review: "要更新確認",
    draft: "調査中",
    current: "確認済み",

    memo: "面談・案件メモ",
    memoHint:
      "この端末に自動保存されます。代理人の回答、案件固有の注意点、次回確認事項など。",
    saved: "保存しました",

    optional: "追加言語",
    noData: "要調査",

    stats:
      "商標出願・国際出願の動向（直近10年）",
    statsPending: "統計データ未収録",
    statsHelp:
      "年、国内出願、当該法域の出願人による国外出願、マドプロによる指定件数を収録します。",

    news:
      "最近の法改正・審査実務・重要判例（直近3年）",

    faq: "現地代理人に聞くFAQ",
    sources: "参考サイト・出典",

    disclaimer:
      "法的判断または期限管理には、必ず最新の法令・官庁資料および現地代理人の助言を確認してください。",

    noResults:
      "条件に一致する法域がありません。"
  },

  en: {
    all: "All",
    europe: "Europe",
    americas: "Americas",
    asia: "Asia",
    region: "Regional systems",
    jurisdictions: "jurisdictions",

    created: "Created",
    updated: "Last updated",

    review: "Review required",
    draft: "Research in progress",
    current: "Reviewed",

    memo: "Meeting & matter notes",
    memoHint:
      "Saved automatically on this device. Record counsel’s answers, matter-specific points and follow-up questions.",
    saved: "Saved",

    optional: "Additional language",
    noData: "Research pending",

    stats:
      "Trademark filing trends (latest 10 years)",
    statsPending: "Statistics not yet added",
    statsHelp:
      "The table will contain year, domestic filings, outbound filings by applicants from this jurisdiction, and Madrid designations.",

    news:
      "Recent amendments, examination practice and key cases (latest 3 years)",

    faq: "Questions for local counsel",
    sources: "References and sources",

    disclaimer:
      "Always check current legislation, official guidance and advice from local counsel before relying on this information for legal decisions or deadline management.",

    noResults:
      "No jurisdictions match these filters."
  }
};

/* 言語処理 */

function primaryLanguage() {
  return state.mode === "en" ? "en" : "ja";
}

function text(value, language = primaryLanguage()) {
  return (
    value?.[language] ||
    value?.en ||
    value?.ja ||
    ""
  );
}

function localCopy(key) {
  return copy[primaryLanguage()][key];
}

function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>'"]/g,
    (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
      };

      return entities[character];
    }
  );
}

function multilingual(value) {
  if (!value) {
    return `
      <span class="missing-value">
        ${localCopy("noData")}
      </span>
    `;
  }

  const primary = text(value);
  const additionalTexts = [];

  if (state.mode === "bilingual") {
    additionalTexts.push(text(value, "en"));
  }

  if (
    state.optionLanguage &&
    value[state.optionLanguage]
  ) {
    additionalTexts.push(
      value[state.optionLanguage]
    );
  }

  const uniqueTexts = additionalTexts.filter(
    (item, index) =>
      item &&
      item !== primary &&
      additionalTexts.indexOf(item) === index
  );

  const translations = uniqueTexts
    .map(
      (item) => `
        <span class="translation">
          ${escapeHtml(item)}
        </span>
      `
    )
    .join("");

  return `${escapeHtml(primary)}${translations}`;
}

/* 検索と絞り込み */

function searchableText(item) {
  return JSON.stringify(item).toLocaleLowerCase();
}

function filteredData() {
  const query =
    state.query.trim().toLocaleLowerCase();

  return state.data.filter((item) => {
    const regionMatches =
      state.region === "all" ||
      item.region === state.region ||
      (
        state.region === "regional" &&
        item.type === "regional"
      );

    const queryMatches =
      !query ||
      searchableText(item).includes(query);

    const favoriteMatches =
      !state.favoritesOnly ||
      state.favorites.has(item.id);

    return (
      regionMatches &&
      queryMatches &&
      favoriteMatches
    );
  });
}

function renderFilters() {
  const filters = [
    ["all", "all"],
    ["europe", "europe"],
    ["americas", "americas"],
    ["asia", "asia"],
    ["regional", "region"]
  ];

  ui.filters.innerHTML = filters
    .map(
      ([id, label]) => `
        <button
          class="filter-button ${
            state.region === id ? "active" : ""
          }"
          data-region="${id}"
          type="button"
        >
          ${localCopy(label)}
        </button>
      `
    )
    .join("");

  ui.filters
    .querySelectorAll("button")
    .forEach((button) => {
      button.addEventListener("click", () => {
        state.region = button.dataset.region;
        renderAll();
      });
    });
}

/* 法域一覧 */

function renderList() {
  const items = filteredData();

  ui.count.textContent =
    `${items.length} ${localCopy("jurisdictions")}`;

  ui.list.innerHTML = "";

  if (!items.length) {
    ui.list.innerHTML = `
      <p class="empty-state">
        ${localCopy("noResults")}
      </p>
    `;

    return;
  }

  items.forEach((item) => {
    const node =
      ui.itemTemplate.content.cloneNode(true);

    const button =
      node.querySelector("button");

    button.dataset.id = item.id;

    button.classList.toggle(
      "active",
      state.selectedId === item.id
    );

    node.querySelector(".flag").textContent =
      item.flag;

    node.querySelector(".item-name").textContent =
      text(item.names);

    node.querySelector(".item-meta").textContent =
      item.type === "regional"
        ? localCopy("region")
        : text(item.office);

    node
      .querySelector(".freshness-dot")
      .classList.toggle(
        "review",
        item.status !== "current"
      );

    button.addEventListener("click", () => {
      selectJurisdiction(item.id);
    });

    ui.list.append(node);
  });
}

/* 共通セクション */

function sectionShell(
  title,
  body,
  open = false
) {
  return `
    <section
      class="info-section ${open ? "open" : ""}"
    >
      <button
        class="section-button"
        type="button"
        aria-expanded="${open}"
      >
        <span>${title}</span>
        <span class="chevron">⌄</span>
      </button>

      <div class="section-body">
        ${body}
      </div>
    </section>
  `;
}

/* 商標制度の各項目 */

function valueFor(item, field) {
  const value = item.facts?.[field.id];

  if (!value) {
    return `
      <span class="missing-value">
        ${localCopy("noData")}
      </span>
    `;
  }

  if (
    field.type === "link" &&
    value.url
  ) {
    return `
      ${multilingual(value)}

      <a
        class="source-link value-link"
        href="${escapeHtml(value.url)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${escapeHtml(value.url)}
      </a>
    `;
  }

  return multilingual(value);
}

function renderLegalSection(
  item,
  section,
  index
) {
  const rows = section.fields
    .map(
      (field) => `
        <div class="fact-row">
          <div class="fact-label">
            ${multilingual(field.label)}
          </div>

          <div class="fact-value">
            ${valueFor(item, field)}
          </div>
        </div>
      `
    )
    .join("");

  return sectionShell(
    multilingual(section.title),
    rows,
    index < 2
  );
}

/* 出願統計 */

function renderStatistics(item) {
  const statistics =
    item.statistics || {
      series: []
    };

  let body = `
    <p class="section-note">
      ${localCopy("statsHelp")}
    </p>
  `;

  if (!statistics.series?.length) {
    body += `
      <div class="data-placeholder">
        <strong>
          ${localCopy("statsPending")}
        </strong>

        <span>
          ${escapeHtml(
            statistics.coverage || "—"
          )}
        </span>
      </div>
    `;
  } else {
    const rows = statistics.series
      .map(
        (row) => `
          <tr>
            <td>
              ${escapeHtml(row.year)}
            </td>

            <td>
              ${escapeHtml(
                row.domestic ?? "—"
              )}
            </td>

            <td>
              ${escapeHtml(
                row.outbound ?? "—"
              )}
            </td>

            <td>
              ${escapeHtml(
                row.madridDesignations ?? "—"
              )}
            </td>
          </tr>
        `
      )
      .join("");

    body += `
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Domestic</th>
              <th>Outbound</th>
              <th>Madrid designations</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  return sectionShell(
    localCopy("stats"),
    body
  );
}

/* 法改正・審査実務・判例 */

function renderNews(item) {
  const newsItems = item.news || [];

  const body = newsItems.length
    ? newsItems
        .map(
          (topic) => `
            <article class="topic-card">
              <div class="topic-meta">
                <span class="faq-tag">
                  ${escapeHtml(topic.type)}
                </span>

                <time>
                  ${escapeHtml(topic.date)}
                </time>
              </div>

              <h4>
                ${multilingual(topic.title)}
              </h4>

              <p>
                ${multilingual(topic.summary)}
              </p>

              ${
                topic.sourceUrl
                  ? `
                    <a
                      class="source-link"
                      href="${escapeHtml(
                        topic.sourceUrl
                      )}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Source
                    </a>
                  `
                  : ""
              }
            </article>
          `
        )
        .join("")
    : `
        <div class="data-placeholder">
          ${localCopy("noData")}
        </div>
      `;

  return sectionShell(
    localCopy("news"),
    body,
    true
  );
}

/* 現地代理人への質問 */

function renderFaq(item) {
  const faqItems = item.faqs || [];

  const body = faqItems.length
    ? faqItems
        .map(
          (faq) => `
            <div class="faq-card">
              <span class="faq-tag">
                ${escapeHtml(faq.tag)}
              </span>

              <div class="faq-question">
                ${multilingual(faq.question)}
              </div>

              <div class="faq-followup">
                ↳ ${multilingual(faq.followUp)}
              </div>
            </div>
          `
        )
        .join("")
    : `
        <div class="data-placeholder">
          ${localCopy("noData")}
        </div>
      `;

  return sectionShell(
    localCopy("faq"),
    body
  );
}

/* 参考資料 */

function renderSources(item) {
  const sources = item.sources || [];

  const body = sources.length
    ? sources
        .map(
          (source) => `
            <div class="fact-row">
              <div class="fact-label">
                ${escapeHtml(source.label)}

                <span class="source-type">
                  ${escapeHtml(
                    source.type || ""
                  )}
                </span>
              </div>

              <div class="fact-value">
                <a
                  class="source-link"
                  href="${escapeHtml(source.url)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ${escapeHtml(source.url)}
                </a>

                <small class="source-checked">
                  ${localCopy("updated")}:
                  ${escapeHtml(
                    source.checkedAt || "—"
                  )}
                </small>
              </div>
            </div>
          `
        )
        .join("")
    : `
        <div class="data-placeholder">
          ${localCopy("noData")}
        </div>
      `;

  return sectionShell(
    localCopy("sources"),
    body
  );
}

/* 法域詳細 */

function renderDetail() {
  const item =
    state.data.find(
      (entry) =>
        entry.id === state.selectedId
    ) ||
    filteredData()[0];

  if (!item) {
    ui.detail.innerHTML = `
      <div class="empty-state">
        ${localCopy("noResults")}
      </div>
    `;

    return;
  }

  state.selectedId = item.id;

  const isFavorite =
    state.favorites.has(item.id);

  const optionalButtons =
    item.availableLanguages
      .map((language) => {
        let label =
          language.toUpperCase();

        if (language === "de") {
          label = "Deutsch";
        }

        if (language === "it") {
          label = "Italiano";
        }

        if (language === "fr") {
          label = "Français";
        }

        if (language === "es") {
          label = "Español";
        }

        return `
          <button
            class="option-lang ${
              state.optionLanguage === language
                ? "active"
                : ""
            }"
            data-lang="${language}"
            type="button"
          >
            ${label}
          </button>
        `;
      })
      .join("");

  const memo =
    localStorage.getItem(
      `tm_atlas_memo_${item.id}`
    ) || "";

  const schemaFields =
    state.schema.sections.flatMap(
      (section) => section.fields
    );

  const completedFields =
    schemaFields.filter(
      (field) =>
        item.facts?.[field.id]
    ).length;

  const completeness = Math.round(
    (
      completedFields /
      schemaFields.length
    ) * 100
  );

  const legalSections =
    state.schema.sections
      .map(
        (section, index) =>
          renderLegalSection(
            item,
            section,
            index
          )
      )
      .join("");

  ui.detail.innerHTML = `
    <header class="detail-hero">
      <div>
        <div class="eyebrow">
          ${
            item.type === "regional"
              ? localCopy("region")
              : escapeHtml(item.region)
          }
        </div>

        <h2 class="detail-title">
          ${multilingual(item.names)}
        </h2>

        <p class="detail-subtitle">
          ${multilingual(item.office)}
        </p>
      </div>

      <div class="hero-actions">
        <button
          id="favoriteButton"
          class="favorite-button ${
            isFavorite ? "on" : ""
          }"
          type="button"
          aria-pressed="${isFavorite}"
          aria-label="お気に入り"
        >
          ${isFavorite ? "★" : "☆"}
        </button>
      </div>
    </header>

    ${
      optionalButtons
        ? `
          <div class="option-langs">
            <span class="fact-label">
              ${localCopy("optional")}:
            </span>

            ${optionalButtons}
          </div>
        `
        : ""
    }

    <div class="status-line">
      <span
        class="status-pill status-${escapeHtml(
          item.status
        )}"
      >
        ${
          item.status === "current"
            ? localCopy("current")
            : item.status === "draft"
              ? localCopy("draft")
              : localCopy("review")
        }
      </span>

      <span class="status-date">
        ${localCopy("created")}:
        ${escapeHtml(item.createdAt)}
      </span>

      <span class="status-date">
        ${localCopy("updated")}:
        ${escapeHtml(item.updatedAt)}
      </span>

      <span class="completion">
        ${completeness}% fields populated
      </span>
    </div>

    <div class="section-stack">
      ${legalSections}

      ${renderStatistics(item)}

      ${renderNews(item)}

      ${renderFaq(item)}

      ${renderSources(item)}

      ${sectionShell(
        localCopy("memo"),
        `
          <textarea
            id="memoBox"
            class="memo-box"
            placeholder="${escapeHtml(
              localCopy("memoHint")
            )}"
          >${escapeHtml(memo)}</textarea>

          <div
            id="savedNote"
            class="saved-note"
          ></div>
        `,
        true
      )}
    </div>

    <p class="disclaimer">
      ${localCopy("disclaimer")}
    </p>
  `;

  wireDetail(item);
}

/* 詳細画面の操作 */

function wireDetail(item) {
  ui.detail
    .querySelectorAll(".section-button")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const section =
            button.closest(".info-section");

          section.classList.toggle("open");

          button.setAttribute(
            "aria-expanded",
            section.classList.contains("open")
          );
        }
      );
    });

  ui.detail
    .querySelectorAll(".option-lang")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const selectedLanguage =
            button.dataset.lang;

          state.optionLanguage =
            state.optionLanguage ===
            selectedLanguage
              ? null
              : selectedLanguage;

          renderDetail();
        }
      );
    });

  document
    .querySelector("#favoriteButton")
    .addEventListener(
      "click",
      () => {
        toggleFavorite(item.id);
      }
    );

  const memoBox =
    document.querySelector("#memoBox");

  let memoTimer;

  memoBox.addEventListener(
    "input",
    (event) => {
      clearTimeout(memoTimer);

      memoTimer = setTimeout(
        () => {
          localStorage.setItem(
            `tm_atlas_memo_${item.id}`,
            event.target.value
          );

          const savedNote =
            document.querySelector(
              "#savedNote"
            );

          savedNote.textContent =
            localCopy("saved");

          setTimeout(() => {
            if (savedNote) {
              savedNote.textContent = "";
            }
          }, 1200);
        },
        300
      );
    }
  );
}

/* 法域・お気に入りの選択 */

function selectJurisdiction(id) {
  state.selectedId = id;
  state.optionLanguage = null;

  localStorage.setItem(
    "tm_atlas_selected",
    id
  );

  renderList();
  renderDetail();
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
  } else {
    state.favorites.add(id);
  }

  localStorage.setItem(
    "tm_atlas_favorites",
    JSON.stringify(
      [...state.favorites]
    )
  );

  renderAll();
}

/* 全画面の再描画 */

function renderAll() {
  document.documentElement.lang =
    primaryLanguage();

  document
    .querySelectorAll(".lang-button")
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.mode === state.mode
      );
    });

  document.querySelector(
    "#brandSubtitle"
  ).textContent =
    state.mode === "en"
      ? "A practical jurisdiction guide for trade marks"
      : "商標実務の法域別ガイド";

  ui.search.placeholder =
    state.mode === "en"
      ? "Search jurisdictions, rules, cases and FAQs"
      : "法域・制度・判例・FAQを検索";

  renderFilters();
  renderList();
  renderDetail();
}

/* 言語切替 */

document
  .querySelectorAll(".lang-button")
  .forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        state.mode =
          button.dataset.mode;

        localStorage.setItem(
          "tm_atlas_language",
          state.mode
        );

        renderAll();
      }
    );
  });

/* 検索 */

ui.search.addEventListener(
  "input",
  (event) => {
    state.query =
      event.target.value;

    renderList();
  }
);

/* お気に入りのみ表示 */

ui.favoriteFilter.addEventListener(
  "click",
  () => {
    state.favoritesOnly =
      !state.favoritesOnly;

    ui.favoriteFilter.setAttribute(
      "aria-pressed",
      state.favoritesOnly
    );

    ui.favoriteFilter.textContent =
      state.favoritesOnly
        ? "★"
        : "☆";

    renderList();
  }
);

/* JSONの読み込み */

Promise.all([
  fetch("./data/schema.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "schema.json could not be loaded"
        );
      }

      return response.json();
    }),

  fetch("./data/index.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "index.json could not be loaded"
        );
      }

      return response.json();
    })
])
  .then(
    async ([schema, jurisdictionIndex]) => {
      state.schema = schema;

      state.data = await Promise.all(
        jurisdictionIndex.map(
          async (entry) => {
            const response = await fetch(
              entry.path
            );

            if (!response.ok) {
              throw new Error(
                `${entry.path} could not be loaded`
              );
            }

            return response.json();
          }
        )
      );

      renderAll();
    }
  )
  .catch((error) => {
    console.error(error);

    ui.detail.innerHTML = `
      <div class="empty-state">
        データを読み込めませんでした。
      </div>
    `;
  });
