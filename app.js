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
    all: "\u{3059}\u{3079}\u{3066}",
    europe: "\u{6B27}\u{5DDE}",
    americas: "\u{7C73}\u{5DDE}",
    asia: "\u{30A2}\u{30B8}\u{30A2}",
    region: "\u{5730}\u{57DF}\u{5236}\u{5EA6}",
    jurisdictions: "\u{6CD5}\u{57DF}",

    created: "\u{4F5C}\u{6210}\u{65E5}",
    updated: "\u{6700}\u{7D42}\u{66F4}\u{65B0}\u{65E5}",

    review: "\u{8981}\u{66F4}\u{65B0}\u{78BA}\u{8A8D}",
    draft: "\u{8ABF}\u{67FB}\u{4E2D}",
    current: "\u{78BA}\u{8A8D}\u{6E08}\u{307F}",

    memo: "\u{9762}\u{8AC7}\u{30FB}\u{6848}\u{4EF6}\u{30E1}\u{30E2}",
    memoHint:
      "\u{3053}\u{306E}\u{7AEF}\u{672B}\u{306B}\u{81EA}\u{52D5}\u{4FDD}\u{5B58}\u{3055}\u{308C}\u{307E}\u{3059}\u{3002}\u{4EE3}\u{7406}\u{4EBA}\u{306E}\u{56DE}\u{7B54}\u{3001}\u{6848}\u{4EF6}\u{56FA}\u{6709}\u{306E}\u{6CE8}\u{610F}\u{70B9}\u{3001}\u{6B21}\u{56DE}\u{78BA}\u{8A8D}\u{4E8B}\u{9805}\u{306A}\u{3069}\u{3002}",
    saved: "\u{4FDD}\u{5B58}\u{3057}\u{307E}\u{3057}\u{305F}",

    optional: "\u{8FFD}\u{52A0}\u{8A00}\u{8A9E}",
    noData: "\u{8981}\u{8ABF}\u{67FB}",

    stats:
      "\u{5546}\u{6A19}\u{51FA}\u{9858}\u{30FB}\u{56FD}\u{969B}\u{51FA}\u{9858}\u{306E}\u{52D5}\u{5411}\u{FF08}\u{76F4}\u{8FD1}10\u{5E74}\u{FF09}",
    statsPending: "\u{7D71}\u{8A08}\u{30C7}\u{30FC}\u{30BF}\u{672A}\u{53CE}\u{9332}",
    statsHelp:
      "\u{5E74}\u{3001}\u{56FD}\u{5185}\u{51FA}\u{9858}\u{3001}\u{5F53}\u{8A72}\u{6CD5}\u{57DF}\u{306E}\u{51FA}\u{9858}\u{4EBA}\u{306B}\u{3088}\u{308B}\u{56FD}\u{5916}\u{51FA}\u{9858}\u{3001}\u{30DE}\u{30C9}\u{30D7}\u{30ED}\u{306B}\u{3088}\u{308B}\u{6307}\u{5B9A}\u{4EF6}\u{6570}\u{3092}\u{53CE}\u{9332}\u{3057}\u{307E}\u{3059}\u{3002}",

    news:
      "\u{6700}\u{8FD1}\u{306E}\u{6CD5}\u{6539}\u{6B63}\u{30FB}\u{5BE9}\u{67FB}\u{5B9F}\u{52D9}\u{30FB}\u{91CD}\u{8981}\u{5224}\u{4F8B}\u{FF08}\u{76F4}\u{8FD1}3\u{5E74}\u{FF09}",

    notablePoints: "\u{7279}\u{7B46}\u{3059}\u{3079}\u{304D}\u{70B9}",
    importance: "\u{91CD}\u{8981}\u{5EA6}",
    practicalImpact: "\u{5B9F}\u{52D9}\u{3078}\u{306E}\u{5F71}\u{97FF}",
    recommendedAction: "\u{63A8}\u{5968}\u{5BFE}\u{5FDC}",
    agentQuestion: "\u{73FE}\u{5730}\u{4EE3}\u{7406}\u{4EBA}\u{3078}\u{306E}\u{78BA}\u{8A8D}\u{4E8B}\u{9805}",
    source: "\u{53C2}\u{8003}\u{8CC7}\u{6599}",
    checked: "\u{78BA}\u{8A8D}\u{65E5}",

    faq: "\u{73FE}\u{5730}\u{4EE3}\u{7406}\u{4EBA}\u{306B}\u{805E}\u{304F}FAQ",
    sources: "\u{53C2}\u{8003}\u{30B5}\u{30A4}\u{30C8}\u{30FB}\u{51FA}\u{5178}",

    disclaimer:
      "\u{6CD5}\u{7684}\u{5224}\u{65AD}\u{307E}\u{305F}\u{306F}\u{671F}\u{9650}\u{7BA1}\u{7406}\u{306B}\u{306F}\u{3001}\u{5FC5}\u{305A}\u{6700}\u{65B0}\u{306E}\u{6CD5}\u{4EE4}\u{30FB}\u{5B98}\u{5E81}\u{8CC7}\u{6599}\u{304A}\u{3088}\u{3073}\u{73FE}\u{5730}\u{4EE3}\u{7406}\u{4EBA}\u{306E}\u{52A9}\u{8A00}\u{3092}\u{78BA}\u{8A8D}\u{3057}\u{3066}\u{304F}\u{3060}\u{3055}\u{3044}\u{3002}",

    noResults:
      "\u{6761}\u{4EF6}\u{306B}\u{4E00}\u{81F4}\u{3059}\u{308B}\u{6CD5}\u{57DF}\u{304C}\u{3042}\u{308A}\u{307E}\u{305B}\u{3093}\u{3002}"
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
      "Saved automatically on this device. Record counsel\u{2019}s answers, matter-specific points and follow-up questions.",
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
      filing: "\u{51FA}\u{9858}",
      examination: "\u{5BE9}\u{67FB}",
      "use-evidence": "\u{4F7F}\u{7528}\u{8A3C}\u{62E0}",
      "non-use": "\u{4E0D}\u{4F7F}\u{7528}",
      opposition: "\u{7570}\u{8B70}",
      appeal: "\u{4E0D}\u{670D}\u{7533}\u{7ACB}\u{3066}",
      enforcement: "\u{6A29}\u{5229}\u{884C}\u{4F7F}",
      "border-measures": "\u{6C34}\u{969B}\u{63AA}\u{7F6E}",
      procedure: "\u{624B}\u{7D9A}",
      "cost-risk": "\u{8CBB}\u{7528}\u{30FB}\u{30EA}\u{30B9}\u{30AF}",
      "local-practice": "\u{73FE}\u{5730}\u{5B9F}\u{52D9}",
      other: "\u{305D}\u{306E}\u{4ED6}"
    },
    importance: {
      high: "\u{9AD8}",
      medium: "\u{4E2D}",
      low: "\u{4F4E}"
    },
    status: {
      verified: "\u{4E00}\u{6B21}\u{8CC7}\u{6599}\u{78BA}\u{8A8D}\u{6E08}\u{307F}",
      "agent-confirmed": "\u{73FE}\u{5730}\u{4EE3}\u{7406}\u{4EBA}\u{78BA}\u{8A8D}\u{6E08}\u{307F}",
      "research-needed": "\u{8981}\u{8ABF}\u{67FB}",
      historical: "\u{904E}\u{53BB}\u{60C5}\u{5831}"
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

/* \u{8A00}\u{8A9E}\u{51E6}\u{7406} */

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

/* \u{691C}\u{7D22}\u{3068}\u{7D5E}\u{308A}\u{8FBC}\u{307F} */

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

/* \u{6CD5}\u{57DF}\u{4E00}\u{89A7} */

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

/* \u{5171}\u{901A}\u{30BB}\u{30AF}\u{30B7}\u{30E7}\u{30F3} */

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
        <span class="chevron">\u{2304}</span>
      </button>

      <div class="section-body">
        ${body}
      </div>
    </section>
  `;
}

/* \u{5546}\u{6A19}\u{5236}\u{5EA6}\u{306E}\u{5404}\u{9805}\u{76EE} */

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

/* \u{51FA}\u{9858}\u{7D71}\u{8A08} */

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
            statistics.coverage || "\u{2014}"
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
                row.domestic ?? "\u{2014}"
              )}
            </td>

            <td>
              ${escapeHtml(
                row.outbound ?? "\u{2014}"
              )}
            </td>

            <td>
              ${escapeHtml(
                row.madridDesignations ?? "\u{2014}"
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

/* \u{6CD5}\u{6539}\u{6B63}\u{30FB}\u{5BE9}\u{67FB}\u{5B9F}\u{52D9}\u{30FB}\u{5224}\u{4F8B} */

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

/* \u{6CD5}\u{57DF}\u{56FA}\u{6709}\u{306E}\u{7279}\u{7B46}\u{3059}\u{3079}\u{304D}\u{5B9F}\u{52D9}\u{4E8B}\u{9805} */

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

/* \u{73FE}\u{5730}\u{4EE3}\u{7406}\u{4EBA}\u{3078}\u{306E}\u{8CEA}\u{554F} */

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
                \u{21B3} ${multilingual(faq.followUp)}
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

/* \u{53C2}\u{8003}\u{8CC7}\u{6599} */

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
                    source.checkedAt || "\u{2014}"
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

/* \u{6CD5}\u{57DF}\u{8A73}\u{7D30} */

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
          label = "Fran\u{E7}ais";
        }

        if (language === "es") {
          label = "Espa\u{F1}ol";
        }
        
        if (language === "zh") {
          label = "中文";
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
          aria-label="\u{304A}\u{6C17}\u{306B}\u{5165}\u{308A}"
        >
          ${isFavorite ? "\u{2605}" : "\u{2606}"}
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

/* \u{8A73}\u{7D30}\u{753B}\u{9762}\u{306E}\u{64CD}\u{4F5C} */

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

/* \u{6CD5}\u{57DF}\u{30FB}\u{304A}\u{6C17}\u{306B}\u{5165}\u{308A}\u{306E}\u{9078}\u{629E} */

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

/* \u{5168}\u{753B}\u{9762}\u{306E}\u{518D}\u{63CF}\u{753B} */

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
      : "\u{5546}\u{6A19}\u{5B9F}\u{52D9}\u{306E}\u{6CD5}\u{57DF}\u{5225}\u{30AC}\u{30A4}\u{30C9}";

  ui.search.placeholder =
    state.mode === "en"
      ? "Search jurisdictions, rules, cases and FAQs"
      : "\u{6CD5}\u{57DF}\u{30FB}\u{5236}\u{5EA6}\u{30FB}\u{5224}\u{4F8B}\u{30FB}FAQ\u{3092}\u{691C}\u{7D22}";

  renderFilters();
  renderList();
  renderDetail();
}

/* \u{8A00}\u{8A9E}\u{5207}\u{66FF} */

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

/* \u{691C}\u{7D22} */

ui.search.addEventListener(
  "input",
  (event) => {
    state.query =
      event.target.value;

    renderList();
  }
);

/* \u{304A}\u{6C17}\u{306B}\u{5165}\u{308A}\u{306E}\u{307F}\u{8868}\u{793A} */

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
        ? "\u{2605}"
        : "\u{2606}";

    renderList();
  }
);

/* JSON\u{306E}\u{8AAD}\u{307F}\u{8FBC}\u{307F} */

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
        \u{30C7}\u{30FC}\u{30BF}\u{3092}\u{8AAD}\u{307F}\u{8FBC}\u{3081}\u{307E}\u{305B}\u{3093}\u{3067}\u{3057}\u{305F}\u{3002}
      </div>
    `;
  });
