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
    all: "ã™ã¹ã¦",
    europe: "æ¬§å·ž",
    americas: "ç±³å·ž",
    asia: "ã‚¢ã‚¸ã‚¢",
    region: "åœ°åŸŸåˆ¶åº¦",
    jurisdictions: "æ³•åŸŸ",

    created: "ä½œæˆæ—¥",
    updated: "æœ€çµ‚æ›´æ–°æ—¥",

    review: "è¦æ›´æ–°ç¢ºèª",
    draft: "èª¿æŸ»ä¸­",
    current: "ç¢ºèªæ¸ˆã¿",

    memo: "é¢è«‡ãƒ»æ¡ˆä»¶ãƒ¡ãƒ¢",
    memoHint:
      "ã“ã®ç«¯æœ«ã«è‡ªå‹•ä¿å­˜ã•ã‚Œã¾ã™ã€‚ä»£ç†äººã®å›žç­”ã€æ¡ˆä»¶å›ºæœ‰ã®æ³¨æ„ç‚¹ã€æ¬¡å›žç¢ºèªäº‹é …ãªã©ã€‚",
    saved: "ä¿å­˜ã—ã¾ã—ãŸ",

    optional: "è¿½åŠ è¨€èªž",
    noData: "è¦èª¿æŸ»",

    stats:
      "å•†æ¨™å‡ºé¡˜ãƒ»å›½éš›å‡ºé¡˜ã®å‹•å‘ï¼ˆç›´è¿‘10å¹´ï¼‰",
    statsPending: "çµ±è¨ˆãƒ‡ãƒ¼ã‚¿æœªåŽéŒ²",
    statsHelp:
      "å¹´ã€å›½å†…å‡ºé¡˜ã€å½“è©²æ³•åŸŸã®å‡ºé¡˜äººã«ã‚ˆã‚‹å›½å¤–å‡ºé¡˜ã€ãƒžãƒ‰ãƒ—ãƒ­ã«ã‚ˆã‚‹æŒ‡å®šä»¶æ•°ã‚’åŽéŒ²ã—ã¾ã™ã€‚",

    news:
      "æœ€è¿‘ã®æ³•æ”¹æ­£ãƒ»å¯©æŸ»å®Ÿå‹™ãƒ»é‡è¦åˆ¤ä¾‹ï¼ˆç›´è¿‘3å¹´ï¼‰",

    notablePoints: "ç‰¹ç­†ã™ã¹ãç‚¹",
    importance: "é‡è¦åº¦",
    practicalImpact: "å®Ÿå‹™ã¸ã®å½±éŸ¿",
    recommendedAction: "æŽ¨å¥¨å¯¾å¿œ",
    agentQuestion: "ç¾åœ°ä»£ç†äººã¸ã®ç¢ºèªäº‹é …",
    source: "å‚è€ƒè³‡æ–™",
    checked: "ç¢ºèªæ—¥",

    faq: "ç¾åœ°ä»£ç†äººã«èžãFAQ",
    sources: "å‚è€ƒã‚µã‚¤ãƒˆãƒ»å‡ºå…¸",

    disclaimer:
      "æ³•çš„åˆ¤æ–­ã¾ãŸã¯æœŸé™ç®¡ç†ã«ã¯ã€å¿…ãšæœ€æ–°ã®æ³•ä»¤ãƒ»å®˜åºè³‡æ–™ãŠã‚ˆã³ç¾åœ°ä»£ç†äººã®åŠ©è¨€ã‚’ç¢ºèªã—ã¦ãã ã•ã„ã€‚",

    noResults:
      "æ¡ä»¶ã«ä¸€è‡´ã™ã‚‹æ³•åŸŸãŒã‚ã‚Šã¾ã›ã‚“ã€‚"
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
      "Saved automatically on this device. Record counselâ€™s answers, matter-specific points and follow-up questions.",
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

    notablePoints: "Notable points",
    importance: "Importance",
    practicalImpact: "Practical impact",
    recommendedAction: "Recommended action",
    agentQuestion: "Question for local counsel",
    source: "Source",
    checked: "Checked",

    faq: "Questions for local counsel",
    sources: "References and sources",

    disclaimer:
      "Always check current legislation, official guidance and advice from local counsel before relying on this information for legal decisions or deadline management.",

    noResults:
      "No jurisdictions match these filters."
  }
};

const notableCopy = {
  ja: {
    categories: {
      filing: "å‡ºé¡˜",
      examination: "å¯©æŸ»",
      "use-evidence": "ä½¿ç”¨è¨¼æ‹ ",
      "non-use": "ä¸ä½¿ç”¨",
      opposition: "ç•°è­°",
      appeal: "ä¸æœç”³ç«‹ã¦",
      enforcement: "æ¨©åˆ©è¡Œä½¿",
      "border-measures": "æ°´éš›æŽªç½®",
      procedure: "æ‰‹ç¶š",
      "cost-risk": "è²»ç”¨ãƒ»ãƒªã‚¹ã‚¯",
      "local-practice": "ç¾åœ°å®Ÿå‹™",
      other: "ãã®ä»–"
    },
    importance: {
      high: "é«˜",
      medium: "ä¸­",
      low: "ä½Ž"
    },
    status: {
      verified: "ä¸€æ¬¡è³‡æ–™ç¢ºèªæ¸ˆã¿",
      "agent-confirmed": "ç¾åœ°ä»£ç†äººç¢ºèªæ¸ˆã¿",
      "research-needed": "è¦èª¿æŸ»",
      historical: "éŽåŽ»æƒ…å ±"
    }
  },
  en: {
    categories: {
      filing: "Filing",
      examination: "Examination",
      "use-evidence": "Use evidence",
      "non-use": "Non-use",
      opposition: "Opposition",
      appeal: "Appeal",
      enforcement: "Enforcement",
      "border-measures": "Border measures",
      procedure: "Procedure",
      "cost-risk": "Cost and risk",
      "local-practice": "Local practice",
      other: "Other"
    },
    importance: {
      high: "High",
      medium: "Medium",
      low: "Low"
    },
    status: {
      verified: "Verified from primary sources",
      "agent-confirmed": "Confirmed by local counsel",
      "research-needed": "Research needed",
      historical: "Historical information"
    }
  }
};

/* è¨€èªžå‡¦ç† */

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

/* æ¤œç´¢ã¨çµžã‚Šè¾¼ã¿ */

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

/* æ³•åŸŸä¸€è¦§ */

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

/* å…±é€šã‚»ã‚¯ã‚·ãƒ§ãƒ³ */

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
        <span class="chevron">âŒ„</span>
      </button>

      <div class="section-body">
        ${body}
      </div>
    </section>
  `;
}

/* å•†æ¨™åˆ¶åº¦ã®å„é …ç›® */

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

/* å‡ºé¡˜çµ±è¨ˆ */

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
            statistics.coverage || "â€”"
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
                row.domestic ?? "â€”"
              )}
            </td>

            <td>
              ${escapeHtml(
                row.outbound ?? "â€”"
              )}
            </td>

            <td>
              ${escapeHtml(
                row.madridDesignations ?? "â€”"
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

/* æ³•æ”¹æ­£ãƒ»å¯©æŸ»å®Ÿå‹™ãƒ»åˆ¤ä¾‹ */

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

/* æ³•åŸŸå›ºæœ‰ã®ç‰¹ç­†ã™ã¹ãå®Ÿå‹™äº‹é … */

function notableTerm(group, value) {
  if (!value) {
    return "";
  }

  return (
    notableCopy[primaryLanguage()]?.[group]?.[
      value
    ] || value
  );
}

function renderNotablePoints(item) {
  const points = Array.isArray(
    item.notablePoints
  )
    ? item.notablePoints
    : [];

  if (!points.length) {
    return "";
  }

  const body = points
    .map((point) => {
      const importance = [
        "high",
        "medium",
        "low"
      ].includes(point.importance)
        ? point.importance
        : "medium";

      const status = [
        "verified",
        "agent-confirmed",
        "research-needed",
        "historical"
      ].includes(point.status)
        ? point.status
        : "research-needed";

      return `
        <article
          class="topic-card notable-card notable-${escapeHtml(
            importance
          )}"
        >
          <div class="topic-meta notable-meta">
            <span class="faq-tag notable-category">
              ${escapeHtml(
                notableTerm(
                  "categories",
                  point.category || "other"
                )
              )}
            </span>

            <span
              class="notable-importance importance-${escapeHtml(
                importance
              )}"
            >
              ${localCopy("importance")}:
              ${escapeHtml(
                notableTerm(
                  "importance",
                  importance
                )
              )}
            </span>

            <span
              class="notable-status status-${escapeHtml(
                status
              )}"
            >
              ${escapeHtml(
                notableTerm("status", status)
              )}
            </span>
          </div>

          <h4>
            ${multilingual(point.title)}
          </h4>

          <p class="notable-summary">
            ${multilingual(point.summary)}
          </p>

          ${
            point.practicalImpact
              ? `
                <div class="notable-detail">
                  <strong>
                    ${localCopy("practicalImpact")}
                  </strong>
                  <div>
                    ${multilingual(
                      point.practicalImpact
                    )}
                  </div>
                </div>
              `
              : ""
          }

          ${
            point.recommendedAction
              ? `
                <div class="notable-detail">
                  <strong>
                    ${localCopy("recommendedAction")}
                  </strong>
                  <div>
                    ${multilingual(
                      point.recommendedAction
                    )}
                  </div>
                </div>
              `
              : ""
          }

          ${
            point.agentQuestion
              ? `
                <div class="notable-detail notable-question">
                  <strong>
                    ${localCopy("agentQuestion")}
                  </strong>
                  <div>
                    ${multilingual(
                      point.agentQuestion
                    )}
                  </div>
                </div>
              `
              : ""
          }

          ${
            point.sourceUrl || point.checkedAt
              ? `
                <div class="notable-source">
                  ${
                    point.sourceUrl
                      ? `
                        <a
                          class="source-link"
                          href="${escapeHtml(
                            point.sourceUrl
                          )}"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          ${localCopy("source")}
                        </a>
                      `
                      : ""
                  }

                  ${
                    point.checkedAt
                      ? `
                        <time datetime="${escapeHtml(
                          point.checkedAt
                        )}">
                          ${localCopy("checked")}:
                          ${escapeHtml(
                            point.checkedAt
                          )}
                        </time>
                      `
                      : ""
                  }
                </div>
              `
              : ""
          }
        </article>
      `;
    })
    .join("");

  return sectionShell(
    localCopy("notablePoints"),
    body,
    true
  );
}

/* ç¾åœ°ä»£ç†äººã¸ã®è³ªå• */

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
                â†³ ${multilingual(faq.followUp)}
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

/* å‚è€ƒè³‡æ–™ */

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
                    source.checkedAt || "â€”"
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

/* æ³•åŸŸè©³ç´° */

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
    (item.availableLanguages || [])
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
          label = "FranÃ§ais";
        }

        if (language === "es") {
          label = "EspaÃ±ol";
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
          aria-label="ãŠæ°—ã«å…¥ã‚Š"
        >
          ${isFavorite ? "â˜…" : "â˜†"}
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

      ${renderNotablePoints(item)}

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

/* è©³ç´°ç”»é¢ã®æ“ä½œ */

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

/* æ³•åŸŸãƒ»ãŠæ°—ã«å…¥ã‚Šã®é¸æŠž */

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

/* å…¨ç”»é¢ã®å†æç”» */

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
      : "å•†æ¨™å®Ÿå‹™ã®æ³•åŸŸåˆ¥ã‚¬ã‚¤ãƒ‰";

  ui.search.placeholder =
    state.mode === "en"
      ? "Search jurisdictions, rules, cases and FAQs"
      : "æ³•åŸŸãƒ»åˆ¶åº¦ãƒ»åˆ¤ä¾‹ãƒ»FAQã‚’æ¤œç´¢";

  renderFilters();
  renderList();
  renderDetail();
}

/* è¨€èªžåˆ‡æ›¿ */

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

/* æ¤œç´¢ */

ui.search.addEventListener(
  "input",
  (event) => {
    state.query =
      event.target.value;

    renderList();
  }
);

/* ãŠæ°—ã«å…¥ã‚Šã®ã¿è¡¨ç¤º */

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
        ? "â˜…"
        : "â˜†";

    renderList();
  }
);

/* JSONã®èª­ã¿è¾¼ã¿ */

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
        ãƒ‡ãƒ¼ã‚¿ã‚’èª­ã¿è¾¼ã‚ã¾ã›ã‚“ã§ã—ãŸã€‚
      </div>
    `;
  });
