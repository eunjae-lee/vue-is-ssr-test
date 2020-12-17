"use strict";
function _interopDefault(e) {
  return e && "object" == typeof e && "default" in e ? e.default : e;
}
Object.defineProperty(exports, "__esModule", { value: !0 });
var connectors = require("instantsearch.js/es/connectors"),
  Vue = _interopDefault(require("vue")),
  utils = require("instantsearch.js/es/lib/utils"),
  indexWidget = _interopDefault(
    require("instantsearch.js/es/widgets/index/index")
  ),
  instantsearch = _interopDefault(require("instantsearch.js/es")),
  algoliaHelper = _interopDefault(require("algoliasearch-helper"));
function suit(e, t, n) {
  if (!e) throw new Error("You need to provide `widgetName` in your data");
  var i = ["ais-" + e];
  return t && i.push("-" + t), n && i.push("--" + n), i.join("");
}
var createSuitMixin = function(e) {
    var t = e.name;
    return {
      props: { classNames: { type: Object, default: void 0 } },
      methods: {
        suit: function(e, n) {
          var i = suit(t, e, n),
            s = this.classNames && this.classNames[i];
          return s ? [i, s].join(" ") : i;
        }
      }
    };
  },
  cache = new Set();
function warn(e) {
  cache.has(e) || (cache.add(e), console.warn(e));
}
var createWidgetMixin = function(e) {
    void 0 === e && (e = {});
    var t = e.connector;
    return {
      inject: {
        instantSearchInstance: {
          from: "$_ais_instantSearchInstance",
          default: function() {
            var e = this.$options._componentTag;
            throw new TypeError(
              'It looks like you forgot to wrap your Algolia search component "<' +
                e +
                '>" inside of an "<ais-instant-search>" component.'
            );
          }
        },
        getParentIndex: {
          from: "$_ais_getParentIndex",
          default: function() {
            var e = this;
            return function() {
              return e.instantSearchInstance.mainIndex;
            };
          }
        }
      },
      data: function() {
        return { state: null };
      },
      created: function() {
        if ("function" == typeof t) {
          if (
            ((this.factory = t(this.updateState, function() {})),
            (this.widget = this.factory(this.widgetParams)),
            this.getParentIndex().addWidgets([this.widget]),
            this.instantSearchInstance.__initialSearchResults &&
              !this.instantSearchInstance.started)
          ) {
            if ("function" != typeof this.instantSearchInstance.__forceRender)
              throw new Error(
                "You are using server side rendering with <ais-instant-search> instead of <ais-instant-search-ssr>."
              );
            this.instantSearchInstance.__forceRender(
              this.widget,
              this.getParentIndex()
            );
          }
        } else
          !0 !== t &&
            warn(
              "You are using the InstantSearch widget mixin, but didn't provide a connector.\nWhile this is technically possible, and will give you access to the Helper,\nit's not the recommended way of making custom components.\n\nIf you want to disable this message, pass { connector: true } to the mixin.\n\nRead more on using connectors: https://alg.li/vue-custom"
            );
      },
      beforeDestroy: function() {
        this.widget && this.getParentIndex().removeWidgets([this.widget]);
      },
      watch: {
        widgetParams: {
          handler: function(e) {
            (this.state = null),
              this.getParentIndex().removeWidgets([this.widget]),
              (this.widget = this.factory(e)),
              this.getParentIndex().addWidgets([this.widget]);
          },
          deep: !0
        }
      },
      methods: {
        updateState: function(e, t) {
          void 0 === e && (e = {}), t || (this.state = e);
        }
      }
    };
  },
  Autocomplete = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            { class: e.suit() },
            [
              e._t(
                "default",
                [
                  n("p", [
                    e._v(
                      "This widget doesn't render anything without a filled in default slot."
                    )
                  ]),
                  e._v(" "),
                  n("p", [
                    e._v("query, function to refine and results are provided.")
                  ]),
                  e._v(" "),
                  n("pre", [e._v("refine: Function")]),
                  e._v(" "),
                  n("pre", [
                    e._v(
                      'currentRefinement: "' +
                        e._s(e.state.currentRefinement) +
                        '"'
                    )
                  ]),
                  e._v(" "),
                  n("details", [
                    e._m(0),
                    e._v(" "),
                    n("pre", [e._v(e._s(e.state.indices))])
                  ])
                ],
                {
                  refine: e.state.refine,
                  currentRefinement: e.state.currentRefinement,
                  indices: e.state.indices
                }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [
      function() {
        var e = this.$createElement,
          t = this._self._c || e;
        return t("summary", [t("code", [this._v("indices")]), this._v(":")]);
      }
    ],
    name: "AisAutocomplete",
    mixins: [
      createWidgetMixin({ connector: connectors.connectAutocomplete }),
      createSuitMixin({ name: "Autocomplete" })
    ],
    props: { escapeHTML: { type: Boolean, required: !1, default: !0 } },
    computed: {
      widgetParams: function() {
        return { escapeHTML: this.escapeHTML };
      }
    }
  },
  PANEL_EMITTER_NAMESPACE = "instantSearchPanelEmitter",
  PANEL_CHANGE_EVENT = "PANEL_CHANGE_EVENT",
  createPanelProviderMixin = function() {
    return {
      props: {
        emitter: {
          type: Object,
          required: !1,
          default: function() {
            return new Vue({ name: "PanelProvider" });
          }
        }
      },
      provide: function() {
        var e;
        return ((e = {})[PANEL_EMITTER_NAMESPACE] = this.emitter), e;
      },
      data: function() {
        return { canRefine: !0 };
      },
      created: function() {
        var e = this;
        this.emitter.$on(PANEL_CHANGE_EVENT, function(t) {
          e.updateCanRefine(t);
        });
      },
      beforeDestroy: function() {
        this.emitter.$destroy();
      },
      methods: {
        updateCanRefine: function(e) {
          this.canRefine = e;
        }
      }
    };
  },
  createPanelConsumerMixin = function(e) {
    var t = e.mapStateToCanRefine;
    return {
      inject: {
        emitter: {
          from: PANEL_EMITTER_NAMESPACE,
          default: function() {
            return { $emit: function() {} };
          }
        }
      },
      data: function() {
        return { state: null, hasAlreadyEmitted: !1 };
      },
      watch: {
        state: {
          immediate: !0,
          handler: function(e, n) {
            if (e) {
              var i = t(n || {}),
                s = t(e);
              (this.hasAlreadyEmitted && i === s) ||
                (this.emitter.$emit(PANEL_CHANGE_EVENT, s),
                (this.hasAlreadyEmitted = !0));
            }
          }
        }
      }
    };
  },
  Breadcrumb = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            {
              class: [
                e.suit(),
                !e.state.canRefine && e.suit("", "noRefinement")
              ]
            },
            [
              e._t(
                "default",
                [
                  n(
                    "ul",
                    { class: e.suit("list") },
                    [
                      n(
                        "li",
                        {
                          class: [
                            e.suit("item"),
                            !e.state.items.length && e.suit("item", "selected")
                          ]
                        },
                        [
                          Boolean(e.state.items.length)
                            ? n(
                                "a",
                                {
                                  class: e.suit("link"),
                                  attrs: { href: e.state.createURL() },
                                  on: {
                                    click: function(t) {
                                      t.preventDefault(), e.state.refine();
                                    }
                                  }
                                },
                                [e._t("rootLabel", [e._v("Home")])],
                                2
                              )
                            : n("span", [e._t("rootLabel", [e._v("Home")])], 2)
                        ]
                      ),
                      e._v(" "),
                      e._l(e.state.items, function(t, i) {
                        return n(
                          "li",
                          {
                            key: t.label,
                            class: [
                              e.suit("item"),
                              e.isLastItem(i) && e.suit("item", "selected")
                            ]
                          },
                          [
                            n(
                              "span",
                              {
                                class: e.suit("separator"),
                                attrs: { "aria-hidden": "true" }
                              },
                              [e._t("separator", [e._v(">")])],
                              2
                            ),
                            e._v(" "),
                            e.isLastItem(i)
                              ? n("span", [e._v(e._s(t.label))])
                              : n(
                                  "a",
                                  {
                                    class: e.suit("link"),
                                    attrs: { href: e.state.createURL(t.value) },
                                    on: {
                                      click: function(n) {
                                        n.preventDefault(),
                                          e.state.refine(t.value);
                                      }
                                    }
                                  },
                                  [e._v(e._s(t.label))]
                                )
                          ]
                        );
                      })
                    ],
                    2
                  )
                ],
                {
                  items: e.state.items,
                  canRefine: e.state.canRefine,
                  refine: e.state.refine,
                  createURL: e.state.createURL
                }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisBreadcrumb",
    mixins: [
      createWidgetMixin({ connector: connectors.connectBreadcrumb }),
      createPanelConsumerMixin({
        mapStateToCanRefine: function(e) {
          return Boolean(e.canRefine);
        }
      }),
      createSuitMixin({ name: "Breadcrumb" })
    ],
    props: {
      attributes: { type: Array, required: !0 },
      separator: { type: String, default: " > " },
      rootPath: { type: String, default: null },
      transformItems: {
        type: Function,
        default: function(e) {
          return e;
        }
      }
    },
    computed: {
      widgetParams: function() {
        return {
          attributes: this.attributes,
          separator: this.separator,
          rootPath: this.rootPath,
          transformItems: this.transformItems
        };
      }
    },
    methods: {
      isLastItem: function(e) {
        return this.state.items.length - 1 === e;
      }
    }
  },
  ClearRefinements = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            { class: e.suit() },
            [
              e._t(
                "default",
                [
                  n(
                    "button",
                    {
                      class: [
                        e.suit("button"),
                        !e.canRefine && e.suit("button", "disabled")
                      ],
                      attrs: { type: "reset", disabled: !e.canRefine },
                      on: {
                        click: function(t) {
                          return t.preventDefault(), e.state.refine(t);
                        }
                      }
                    },
                    [e._t("resetLabel", [e._v("Clear refinements")])],
                    2
                  )
                ],
                {
                  canRefine: e.canRefine,
                  refine: e.state.refine,
                  createURL: e.state.createURL
                }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisClearRefinements",
    mixins: [
      createWidgetMixin({ connector: connectors.connectClearRefinements }),
      createPanelConsumerMixin({
        mapStateToCanRefine: function(e) {
          return Boolean(e.hasRefinements);
        }
      }),
      createSuitMixin({ name: "ClearRefinements" })
    ],
    props: {
      excludedAttributes: { type: Array },
      includedAttributes: { type: Array },
      transformItems: {
        type: Function,
        default: function(e) {
          return e;
        }
      }
    },
    computed: {
      widgetParams: function() {
        return {
          includedAttributes: this.includedAttributes,
          excludedAttributes: this.excludedAttributes,
          transformItems: this.transformItems
        };
      },
      canRefine: function() {
        return this.state.hasRefinements;
      }
    }
  },
  Configure = {
    inheritAttrs: !1,
    name: "AisConfigure",
    mixins: [
      createSuitMixin({ name: "Configure" }),
      createWidgetMixin({ connector: connectors.connectConfigure })
    ],
    computed: {
      widgetParams: function() {
        return { searchParameters: this.$attrs };
      }
    },
    render: function(e) {
      return this.state && this.$scopedSlots.default
        ? e("div", { class: this.suit() }, [
            this.$scopedSlots.default({
              refine: this.state.refine,
              searchParameters: this.state.widgetParams.searchParameters
            })
          ])
        : null;
    }
  },
  ConfigureRelatedItems = {
    inheritAttrs: !1,
    name: "AisExperimentalConfigureRelatedItems",
    mixins: [
      createWidgetMixin({
        connector: connectors.EXPERIMENTAL_connectConfigureRelatedItems
      })
    ],
    props: {
      hit: { type: Object, required: !0 },
      matchingPatterns: { type: Object, required: !0 },
      transformSearchParameters: { type: Function, required: !1 }
    },
    computed: {
      widgetParams: function() {
        return {
          hit: this.hit,
          matchingPatterns: this.matchingPatterns,
          transformSearchParameters: this.transformSearchParameters
        };
      }
    },
    render: function() {
      return null;
    }
  },
  CurrentRefinements = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            { class: [e.suit(), e.noRefinement && e.suit("", "noRefinement")] },
            [
              e._t(
                "default",
                [
                  n(
                    "ul",
                    { class: e.suit("list") },
                    e._l(e.state.items, function(t) {
                      return n(
                        "li",
                        { key: t.attribute, class: e.suit("item") },
                        [
                          e._t(
                            "item",
                            [
                              n("span", { class: e.suit("label") }, [
                                e._v(e._s(e._f("capitalize")(t.label)) + ": ")
                              ]),
                              e._v(" "),
                              e._l(t.refinements, function(i) {
                                return n(
                                  "span",
                                  {
                                    key: e.createItemKey(i),
                                    class: e.suit("category")
                                  },
                                  [
                                    e._t(
                                      "refinement",
                                      [
                                        n(
                                          "span",
                                          { class: e.suit("categoryLabel") },
                                          [
                                            "query" === i.attribute
                                              ? n("q", [e._v(e._s(i.label))])
                                              : [
                                                  e._v(
                                                    " " + e._s(i.label) + " "
                                                  )
                                                ]
                                          ],
                                          2
                                        ),
                                        e._v(" "),
                                        n(
                                          "button",
                                          {
                                            class: e.suit("delete"),
                                            on: {
                                              click: function(e) {
                                                t.refine(i);
                                              }
                                            }
                                          },
                                          [e._v(" ✕ ")]
                                        )
                                      ],
                                      {
                                        refine: t.refine,
                                        refinement: i,
                                        createURL: e.state.createURL
                                      }
                                    )
                                  ],
                                  2
                                );
                              })
                            ],
                            {
                              refine: t.refine,
                              item: t,
                              createURL: e.state.createURL
                            }
                          )
                        ],
                        2
                      );
                    })
                  )
                ],
                {
                  refine: e.state.refine,
                  items: e.state.items,
                  createURL: e.state.createURL
                }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisCurrentRefinements",
    mixins: [
      createSuitMixin({ name: "CurrentRefinements" }),
      createWidgetMixin({ connector: connectors.connectCurrentRefinements }),
      createPanelConsumerMixin({
        mapStateToCanRefine: function(e) {
          return Boolean(e.items) && e.items.length > 0;
        }
      })
    ],
    props: {
      includedAttributes: { type: Array },
      excludedAttributes: { type: Array },
      transformItems: {
        type: Function,
        default: function(e) {
          return e;
        }
      }
    },
    computed: {
      noRefinement: function() {
        return this.state && 0 === this.state.items.length;
      },
      widgetParams: function() {
        return {
          includedAttributes: this.includedAttributes,
          excludedAttributes: this.excludedAttributes,
          transformItems: this.transformItems
        };
      }
    },
    methods: {
      createItemKey: function(e) {
        var t = e.attribute,
          n = e.value;
        return [t, e.type, n, e.operator].join(":");
      }
    },
    filters: {
      capitalize: function(e) {
        return e
          ? e
              .toString()
              .charAt(0)
              .toLocaleUpperCase() + e.toString().slice(1)
          : "";
      }
    }
  },
  HierarchicalMenuList = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return n(
        "ul",
        {
          class: [
            e.suit("list"),
            e.level > 0 && e.suit("list", "child"),
            e.suit("list", "lvl" + e.level)
          ]
        },
        e._l(e.items, function(t) {
          return n(
            "li",
            {
              key: t.value,
              class: [
                e.suit("item"),
                t.data && e.suit("item", "parent"),
                t.isRefined && e.suit("item", "selected")
              ]
            },
            [
              n(
                "a",
                {
                  class: e.suit("link"),
                  attrs: { href: e.createURL(t.value) },
                  on: {
                    click: function(n) {
                      n.preventDefault(), e.refine(t.value);
                    }
                  }
                },
                [
                  n("span", { class: e.suit("label") }, [e._v(e._s(t.label))]),
                  e._v(" "),
                  n("span", { class: e.suit("count") }, [e._v(e._s(t.count))])
                ]
              ),
              e._v(" "),
              t.data
                ? n("hierarchical-menu-list", {
                    attrs: {
                      items: t.data,
                      level: e.level + 1,
                      refine: e.refine,
                      createURL: e.createURL,
                      suit: e.suit
                    }
                  })
                : e._e()
            ],
            1
          );
        })
      );
    },
    staticRenderFns: [],
    name: "HierarchicalMenuList",
    props: {
      items: { type: Array, required: !0 },
      level: { type: Number, required: !0 },
      refine: { type: Function, required: !0 },
      createURL: { type: Function, required: !0 },
      suit: { type: Function, required: !0 }
    }
  },
  mapStateToCanRefine = function(e) {
    return Boolean(e.items) && e.items.length > 0;
  },
  HierarchicalMenu = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            { class: [e.suit(), !e.canRefine && e.suit("", "noRefinement")] },
            [
              e._t(
                "default",
                [
                  n("hierarchical-menu-list", {
                    attrs: {
                      items: e.state.items,
                      level: 0,
                      refine: e.state.refine,
                      createURL: e.state.createURL,
                      suit: e.suit
                    }
                  }),
                  e._v(" "),
                  e.showMore
                    ? n(
                        "button",
                        {
                          class: [
                            e.suit("showMore"),
                            !e.state.canToggleShowMore &&
                              e.suit("showMore", "disabled")
                          ],
                          attrs: { disabled: !e.state.canToggleShowMore },
                          on: {
                            click: function(t) {
                              return (
                                t.preventDefault(), e.state.toggleShowMore(t)
                              );
                            }
                          }
                        },
                        [
                          e._t(
                            "showMoreLabel",
                            [
                              e._v(
                                e._s(
                                  e.state.isShowingMore
                                    ? "Show less"
                                    : "Show more"
                                )
                              )
                            ],
                            { isShowingMore: e.state.isShowingMore }
                          )
                        ],
                        2
                      )
                    : e._e()
                ],
                {
                  items: e.state.items,
                  canRefine: e.canRefine,
                  canToggleShowMore: e.state.canToggleShowMore,
                  isShowingMore: e.state.isShowingMore,
                  refine: e.state.refine,
                  createURL: e.state.createURL,
                  toggleShowMore: e.state.toggleShowMore
                }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisHierarchicalMenu",
    mixins: [
      createSuitMixin({ name: "HierarchicalMenu" }),
      createWidgetMixin({ connector: connectors.connectHierarchicalMenu }),
      createPanelConsumerMixin({ mapStateToCanRefine: mapStateToCanRefine })
    ],
    components: { HierarchicalMenuList: HierarchicalMenuList },
    props: {
      attributes: { type: Array, required: !0 },
      limit: { type: Number, default: 10 },
      showMoreLimit: { type: Number, default: 20 },
      showMore: { type: Boolean, default: !1 },
      sortBy: {
        type: [Array, Function],
        default: function() {
          return ["name:asc"];
        }
      },
      separator: { type: String, default: " > " },
      rootPath: { type: String, default: null },
      showParentLevel: { type: Boolean, default: !0 },
      transformItems: {
        type: Function,
        default: function(e) {
          return e;
        }
      }
    },
    computed: {
      widgetParams: function() {
        return {
          attributes: this.attributes,
          limit: this.limit,
          showMore: this.showMore,
          showMoreLimit: this.showMoreLimit,
          separator: this.separator,
          rootPath: this.rootPath,
          showParentLevel: this.showParentLevel,
          sortBy: this.sortBy,
          transformItems: this.transformItems
        };
      },
      canRefine: function() {
        return mapStateToCanRefine(this.state);
      }
    }
  },
  htmlUnescapes = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'"
  },
  reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g,
  reHasEscapedHtml = RegExp(reEscapedHtml.source);
function unescape(e) {
  return e && reHasEscapedHtml.test(e)
    ? e.replace(reEscapedHtml, function(e) {
        return htmlUnescapes[e];
      })
    : e;
}
var TAG_PLACEHOLDER = {
  highlightPreTag: "__ais-highlight__",
  highlightPostTag: "__/ais-highlight__"
};
function parseHighlightedAttribute(e) {
  var t = e.preTag,
    n = e.postTag,
    i = e.highlightedValue;
  void 0 === i && (i = "");
  var s = i.split(t),
    a = s.shift(),
    r = "" === a ? [] : [{ value: a, isHighlighted: !1 }];
  if (n === t) {
    var o = !0;
    s.forEach(function(e) {
      r.push({ value: e, isHighlighted: o }), (o = !o);
    });
  } else
    s.forEach(function(e) {
      var t = e.split(n);
      r.push({ value: t[0], isHighlighted: !0 }),
        "" !== t[1] &&
          r.push({ value: " " === t[1] ? "  " : t[1], isHighlighted: !1 });
    });
  return r;
}
function parseAlgoliaHit(e) {
  var t = e.preTag;
  void 0 === t && (t = TAG_PLACEHOLDER.highlightPreTag);
  var n = e.postTag;
  void 0 === n && (n = TAG_PLACEHOLDER.highlightPostTag);
  var i = e.highlightProperty,
    s = e.attribute,
    a = e.hit;
  if (!a) throw new Error("`hit`, the matching record, must be provided");
  var r = utils.getPropertyByPath(a[i], s) || {};
  return Array.isArray(r)
    ? r.map(function(e) {
        return parseHighlightedAttribute({
          preTag: t,
          postTag: n,
          highlightedValue: unescape(e.value)
        });
      })
    : parseHighlightedAttribute({
        preTag: t,
        postTag: n,
        highlightedValue: unescape(r.value)
      });
}
var AisHighlighter = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return n(
        "span",
        { class: e.suit() },
        e._l(e.parsedHighlights, function(t, i) {
          var s = t.value,
            a = t.isHighlighted;
          return n(
            a ? e.highlightedTagName : e.textNode,
            { key: i, tag: "component", class: [a && e.suit("highlighted")] },
            [e._v(e._s(s))]
          );
        }),
        1
      );
    },
    staticRenderFns: [],
    name: "AisHighlighter",
    props: {
      hit: { type: Object, required: !0 },
      attribute: { type: String, required: !0 },
      highlightedTagName: { type: String, default: "mark" },
      suit: { type: Function, required: !0 },
      highlightProperty: { type: String, required: !0 },
      preTag: { type: String, required: !0 },
      postTag: { type: String, required: !0 }
    },
    data: function() {
      return {
        textNode: {
          functional: !0,
          render: function(e, t) {
            return t.slots().default;
          }
        }
      };
    },
    computed: {
      parsedHighlights: function() {
        return parseAlgoliaHit({
          attribute: this.attribute,
          hit: this.hit,
          highlightProperty: this.highlightProperty,
          preTag: this.preTag,
          postTag: this.postTag
        });
      }
    }
  },
  AisHighlight = {
    render: function() {
      var e = this.$createElement;
      return (this._self._c || e)("ais-highlighter", {
        attrs: {
          hit: this.hit,
          attribute: this.attribute,
          "highlighted-tag-name": this.highlightedTagName,
          suit: this.suit,
          "highlight-property": "_highlightResult",
          "pre-tag": "<mark>",
          "post-tag": "</mark>"
        }
      });
    },
    staticRenderFns: [],
    name: "AisHighlight",
    mixins: [createSuitMixin({ name: "Highlight" })],
    components: { AisHighlighter: AisHighlighter },
    props: {
      hit: { type: Object, required: !0 },
      attribute: { type: String, required: !0 },
      highlightedTagName: { type: String, default: "mark" }
    }
  },
  Hits = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            { class: e.suit() },
            [
              e._t(
                "default",
                [
                  n(
                    "ol",
                    { class: e.suit("list") },
                    e._l(e.items, function(t, i) {
                      return n(
                        "li",
                        { key: t.objectID, class: e.suit("item") },
                        [
                          e._t(
                            "item",
                            [
                              e._v(
                                "objectID: " +
                                  e._s(t.objectID) +
                                  ", index: " +
                                  e._s(i)
                              )
                            ],
                            { item: t, index: i, insights: e.state.insights }
                          )
                        ],
                        2
                      );
                    })
                  )
                ],
                { items: e.items, insights: e.state.insights }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisHits",
    mixins: [
      createWidgetMixin({ connector: connectors.connectHitsWithInsights }),
      createSuitMixin({ name: "Hits" })
    ],
    props: {
      escapeHTML: { type: Boolean, default: !0 },
      transformItems: {
        type: Function,
        default: function(e) {
          return e;
        }
      }
    },
    computed: {
      items: function() {
        return this.state.hits;
      },
      widgetParams: function() {
        return {
          escapeHTML: this.escapeHTML,
          transformItems: this.transformItems
        };
      }
    }
  },
  HitsPerPage = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            { class: e.suit() },
            [
              e._t(
                "default",
                [
                  n(
                    "select",
                    {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: e.selected,
                          expression: "selected"
                        }
                      ],
                      class: e.suit("select"),
                      on: {
                        change: [
                          function(t) {
                            var n = Array.prototype.filter
                              .call(t.target.options, function(e) {
                                return e.selected;
                              })
                              .map(function(e) {
                                return "_value" in e ? e._value : e.value;
                              });
                            e.selected = t.target.multiple ? n : n[0];
                          },
                          e.handleChange
                        ]
                      }
                    },
                    e._l(e.state.items, function(t) {
                      return n(
                        "option",
                        {
                          key: t.value,
                          class: e.suit("option"),
                          domProps: { value: t.value }
                        },
                        [e._v(e._s(t.label))]
                      );
                    })
                  )
                ],
                {
                  items: e.state.items,
                  refine: e.state.refine,
                  hasNoResults: e.state.hasNoResults
                }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisHitsPerPage",
    mixins: [
      createSuitMixin({ name: "HitsPerPage" }),
      createWidgetMixin({ connector: connectors.connectHitsPerPage }),
      createPanelConsumerMixin({
        mapStateToCanRefine: function(e) {
          return !1 === e.hasNoResults;
        }
      })
    ],
    props: {
      items: {
        type: Array,
        required: !0,
        default: function() {
          return [];
        }
      },
      transformItems: {
        type: Function,
        default: function(e) {
          return e;
        }
      }
    },
    data: function() {
      return {
        selected: this.items.find(function(e) {
          return !0 === e.default;
        }).value
      };
    },
    computed: {
      widgetParams: function() {
        return { items: this.items, transformItems: this.transformItems };
      }
    },
    methods: {
      handleChange: function() {
        this.state.refine(this.selected);
      }
    }
  },
  connectIndex = function() {
    return indexWidget;
  },
  Index = {
    name: "AisIndex",
    mixins: [
      createSuitMixin({ name: "Index" }),
      createWidgetMixin({ connector: connectIndex })
    ],
    provide: function() {
      var e = this;
      return {
        $_ais_getParentIndex: function() {
          return e.widget;
        }
      };
    },
    props: {
      indexName: { type: String, required: !0 },
      indexId: { type: String, required: !1 }
    },
    render: function(e) {
      return e("div", {}, this.$slots.default);
    },
    computed: {
      widgetParams: function() {
        return { indexName: this.indexName, indexId: this.indexId };
      }
    }
  },
  version = "3.4.2";
function _objectSpread(e) {
  for (var t = arguments, n = 1; n < arguments.length; n++) {
    var i = null != t[n] ? t[n] : {},
      s = Object.keys(i);
    "function" == typeof Object.getOwnPropertySymbols &&
      (s = s.concat(
        Object.getOwnPropertySymbols(i).filter(function(e) {
          return Object.getOwnPropertyDescriptor(i, e).enumerable;
        })
      )),
      s.forEach(function(t) {
        _defineProperty(e, t, i[t]);
      });
  }
  return e;
}
function _defineProperty(e, t, n) {
  return (
    t in e
      ? Object.defineProperty(e, t, {
          value: n,
          enumerable: !0,
          configurable: !0,
          writable: !0
        })
      : (e[t] = n),
    e
  );
}
var createInstantSearchComponent = function(e) {
    return _objectSpread(
      {
        mixins: [createSuitMixin({ name: "InstantSearch" })],
        provide: function() {
          return { $_ais_instantSearchInstance: this.instantSearchInstance };
        },
        watch: {
          searchClient: function(e) {
            this.instantSearchInstance.helper.setClient(e).search();
          },
          indexName: function(e) {
            this.instantSearchInstance.helper.setIndex(e).search();
          },
          stalledSearchDelay: function(e) {
            this.instantSearchInstance._stalledSearchDelay = e;
          },
          routing: function() {
            throw new Error(
              "routing configuration can not be changed dynamically at this point.\n\nPlease open a new issue: https://github.com/algolia/vue-instantsearch/issues/new?template=feature.md"
            );
          },
          searchFunction: function(e) {
            this.instantSearchInstance._searchFunction = e;
          }
        },
        created: function() {
          var e = this.instantSearchInstance.client;
          "function" == typeof e.addAlgoliaAgent &&
            (e.addAlgoliaAgent("Vue (" + Vue.version + ")"),
            e.addAlgoliaAgent("Vue InstantSearch (" + version + ")"));
        },
        mounted: function() {
          var e = this;
          this.$nextTick(function() {
            e.instantSearchInstance.started || e.instantSearchInstance.start();
          });
        },
        beforeDestroy: function() {
          this.instantSearchInstance.started &&
            this.instantSearchInstance.dispose(),
            (this.instantSearchInstance.__initialSearchResults = void 0);
        }
      },
      e
    );
  },
  oldApiWarning =
    "Vue InstantSearch: You used the prop api-key or app-id.\nThese have been replaced by search-client.\n\nSee more info here: https://www.algolia.com/doc/api-reference/widgets/instantsearch/vue/#widget-param-search-client",
  InstantSearch = createInstantSearchComponent({
    name: "AisInstantSearch",
    props: {
      searchClient: { type: Object, required: !0 },
      insightsClient: { type: Function, required: !1 },
      indexName: { type: String, required: !0 },
      routing: {
        default: null,
        validator: function(e) {
          return (
            !("boolean" == typeof e || (!e.router && !e.stateMapping)) ||
            (warn(
              "The `routing` option expects an object with `router` and/or `stateMapping`.\n\nSee https://www.algolia.com/doc/api-reference/widgets/instantsearch/vue/#widget-param-routing"
            ),
            !1)
          );
        }
      },
      stalledSearchDelay: { type: Number, default: 200 },
      searchFunction: { type: Function, default: null },
      initialUiState: { type: Object, required: !1 },
      apiKey: {
        type: String,
        default: null,
        validator: function(e) {
          return e && warn(oldApiWarning), !1;
        }
      },
      appId: {
        type: String,
        default: null,
        validator: function(e) {
          return e && warn(oldApiWarning), !1;
        }
      }
    },
    data: function() {
      return {
        instantSearchInstance: instantsearch({
          searchClient: this.searchClient,
          insightsClient: this.insightsClient,
          indexName: this.indexName,
          routing: this.routing,
          stalledSearchDelay: this.stalledSearchDelay,
          searchFunction: this.searchFunction,
          initialUiState: this.initialUiState
        })
      };
    },
    render: function(e) {
      var t;
      return e(
        "div",
        {
          class:
            ((t = {}), (t[this.suit()] = !0), (t[this.suit("", "ssr")] = !1), t)
        },
        this.$slots.default
      );
    }
  }),
  InstantSearchSsr = createInstantSearchComponent({
    name: "AisInstantSearchSsr",
    inject: {
      $_ais_ssrInstantSearchInstance: {
        default: function() {
          throw new Error(
            "`createServerRootMixin` is required when using SSR."
          );
        }
      }
    },
    data: function() {
      return { instantSearchInstance: this.$_ais_ssrInstantSearchInstance };
    },
    render: function(e) {
      var t;
      return e(
        "div",
        {
          class:
            ((t = {}), (t[this.suit()] = !0), (t[this.suit("", "ssr")] = !0), t)
        },
        this.$slots.default
      );
    }
  }),
  InfiniteHits = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            { class: e.suit() },
            [
              e.showPrevious
                ? e._t(
                    "loadPrevious",
                    [
                      n(
                        "button",
                        {
                          class: [
                            e.suit("loadPrevious"),
                            e.state.isFirstPage &&
                              e.suit("loadPrevious", "disabled")
                          ],
                          attrs: { disabled: e.state.isFirstPage },
                          on: {
                            click: function(t) {
                              e.refinePrevious();
                            }
                          }
                        },
                        [e._v("Show previous results")]
                      )
                    ],
                    {
                      refinePrevious: e.refinePrevious,
                      page: e.state.results.page,
                      isFirstPage: e.state.isFirstPage
                    }
                  )
                : e._e(),
              e._v(" "),
              e._t(
                "default",
                [
                  n(
                    "ol",
                    { class: e.suit("list") },
                    e._l(e.items, function(t, i) {
                      return n(
                        "li",
                        { key: t.objectID, class: e.suit("item") },
                        [
                          e._t(
                            "item",
                            [
                              e._v(
                                "objectID: " +
                                  e._s(t.objectID) +
                                  ", index: " +
                                  e._s(i)
                              )
                            ],
                            { item: t, index: i, insights: e.state.insights }
                          )
                        ],
                        2
                      );
                    })
                  ),
                  e._v(" "),
                  e._t(
                    "loadMore",
                    [
                      n(
                        "button",
                        {
                          class: [
                            e.suit("loadMore"),
                            e.state.isLastPage && e.suit("loadMore", "disabled")
                          ],
                          attrs: { disabled: e.state.isLastPage },
                          on: {
                            click: function(t) {
                              e.refineNext();
                            }
                          }
                        },
                        [e._v("Show more results")]
                      )
                    ],
                    {
                      refineNext: e.refineNext,
                      refine: e.refineNext,
                      page: e.state.results.page,
                      isLastPage: e.state.isLastPage
                    }
                  )
                ],
                {
                  items: e.items,
                  results: e.state.results,
                  isLastPage: e.state.isLastPage,
                  refinePrevious: e.refinePrevious,
                  refineNext: e.refineNext,
                  refine: e.refineNext,
                  insights: e.state.insights
                }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisInfiniteHits",
    mixins: [
      createWidgetMixin({
        connector: connectors.connectInfiniteHitsWithInsights
      }),
      createSuitMixin({ name: "InfiniteHits" })
    ],
    props: {
      showPrevious: { type: Boolean, default: !1 },
      escapeHTML: { type: Boolean, default: !0 },
      transformItems: {
        type: Function,
        default: function(e) {
          return e;
        }
      },
      cache: { type: Object, default: void 0 }
    },
    computed: {
      widgetParams: function() {
        return {
          showPrevious: this.showPrevious,
          escapeHTML: this.escapeHTML,
          transformItems: this.transformItems,
          cache: this.cache
        };
      },
      items: function() {
        return this.state.hits;
      }
    },
    methods: {
      refinePrevious: function() {
        this.state.showPrevious();
      },
      refineNext: function() {
        this.state.showMore();
      }
    }
  },
  Menu = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            {
              class: [
                e.suit(),
                !e.state.canRefine && e.suit("", "noRefinement")
              ]
            },
            [
              e._t(
                "default",
                [
                  n(
                    "ul",
                    { class: e.suit("list") },
                    e._l(e.state.items, function(t) {
                      return n(
                        "li",
                        {
                          key: t.value,
                          class: [
                            e.suit("item"),
                            t.isRefined && e.suit("item", "selected")
                          ]
                        },
                        [
                          n(
                            "a",
                            {
                              class: e.suit("link"),
                              attrs: { href: e.state.createURL(t.value) },
                              on: {
                                click: function(n) {
                                  n.preventDefault(), e.state.refine(t.value);
                                }
                              }
                            },
                            [
                              n("span", { class: e.suit("label") }, [
                                e._v(e._s(t.label))
                              ]),
                              e._v(" "),
                              n("span", { class: e.suit("count") }, [
                                e._v(e._s(t.count))
                              ])
                            ]
                          )
                        ]
                      );
                    })
                  ),
                  e._v(" "),
                  e.showShowMoreButton
                    ? n(
                        "button",
                        {
                          class: [
                            e.suit("showMore"),
                            !e.state.canToggleShowMore &&
                              e.suit("showMore", "disabled")
                          ],
                          attrs: { disabled: !e.state.canToggleShowMore },
                          on: {
                            click: function(t) {
                              t.preventDefault(), e.state.toggleShowMore();
                            }
                          }
                        },
                        [
                          e._t(
                            "showMoreLabel",
                            [
                              e._v(
                                e._s(
                                  e.state.isShowingMore
                                    ? "Show less"
                                    : "Show more"
                                )
                              )
                            ],
                            { isShowingMore: e.state.isShowingMore }
                          )
                        ],
                        2
                      )
                    : e._e()
                ],
                {
                  items: e.state.items,
                  canRefine: e.state.canRefine,
                  canToggleShowMore: e.state.canToggleShowMore,
                  isShowingMore: e.state.isShowingMore,
                  refine: e.state.refine,
                  createURL: e.state.createURL,
                  toggleShowMore: e.state.toggleShowMore
                }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisMenu",
    mixins: [
      createSuitMixin({ name: "Menu" }),
      createWidgetMixin({ connector: connectors.connectMenu }),
      createPanelConsumerMixin({
        mapStateToCanRefine: function(e) {
          return Boolean(e.canRefine);
        }
      })
    ],
    props: {
      attribute: { type: String, required: !0 },
      limit: { type: Number, default: 10 },
      showMoreLimit: { type: Number, default: 20 },
      showMore: { type: Boolean, default: !1 },
      sortBy: {
        type: [Array, Function],
        default: function() {
          return ["count:desc", "name:asc"];
        }
      },
      transformItems: {
        type: Function,
        default: function(e) {
          return e;
        }
      }
    },
    computed: {
      widgetParams: function() {
        return {
          attribute: this.attribute,
          limit: this.limit,
          showMore: this.showMore,
          showMoreLimit: this.showMoreLimit,
          sortBy: this.sortBy,
          transformItems: this.transformItems
        };
      },
      showShowMoreButton: function() {
        return this.state.canRefine && this.showMore;
      }
    }
  },
  MenuSelect = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            {
              class: [
                e.suit(),
                !e.state.canRefine && e.suit("", "noRefinement")
              ]
            },
            [
              e._t(
                "default",
                [
                  n(
                    "select",
                    {
                      class: e.suit("select"),
                      on: {
                        change: function(t) {
                          e.refine(t.currentTarget.value);
                        }
                      }
                    },
                    [
                      n(
                        "option",
                        { class: e.suit("option"), attrs: { value: "" } },
                        [e._t("defaultOption", [e._v("See all")])],
                        2
                      ),
                      e._v(" "),
                      e._l(e.state.items, function(t) {
                        return n(
                          "option",
                          {
                            key: t.value,
                            class: e.suit("option"),
                            domProps: { value: t.value, selected: t.isRefined }
                          },
                          [
                            e._t(
                              "item",
                              [
                                e._v(e._s(t.label) + " (" + e._s(t.count) + ")")
                              ],
                              { item: t }
                            )
                          ],
                          2
                        );
                      })
                    ],
                    2
                  )
                ],
                {
                  items: e.state.items,
                  canRefine: e.state.canRefine,
                  refine: e.refine,
                  createURL: e.state.createURL
                }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisMenuSelect",
    mixins: [
      createSuitMixin({ name: "MenuSelect" }),
      createWidgetMixin({ connector: connectors.connectMenu }),
      createPanelConsumerMixin({
        mapStateToCanRefine: function(e) {
          return Boolean(e.canRefine);
        }
      })
    ],
    props: {
      attribute: { type: String, required: !0 },
      limit: { type: Number, default: 10 },
      sortBy: {
        type: [Array, Function],
        default: function() {
          return ["name:asc"];
        }
      },
      transformItems: {
        type: Function,
        default: function(e) {
          return e;
        }
      }
    },
    computed: {
      widgetParams: function() {
        return {
          attribute: this.attribute,
          limit: this.limit,
          sortBy: this.sortBy,
          transformItems: this.transformItems
        };
      }
    },
    methods: {
      refine: function(e) {
        this.state.refine(e);
      }
    }
  },
  NumericMenu = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            { class: [e.suit(), !e.canRefine && e.suit("", "noRefinement")] },
            [
              e._t(
                "default",
                [
                  n(
                    "ul",
                    { class: [e.suit("list")] },
                    e._l(e.state.items, function(t) {
                      return n(
                        "li",
                        {
                          key: t.label,
                          class: [
                            e.suit("item"),
                            t.isRefined && e.suit("item", "selected")
                          ]
                        },
                        [
                          n("label", { class: e.suit("label") }, [
                            n("input", {
                              class: e.suit("radio"),
                              attrs: { type: "radio", name: e.attribute },
                              domProps: {
                                value: t.value,
                                checked: t.isRefined
                              },
                              on: {
                                change: function(t) {
                                  e.state.refine(t.target.value);
                                }
                              }
                            }),
                            e._v(" "),
                            n("span", { class: e.suit("labelText") }, [
                              e._v(e._s(t.label))
                            ])
                          ])
                        ]
                      );
                    })
                  )
                ],
                {
                  items: e.state.items,
                  canRefine: e.canRefine,
                  refine: e.state.refine,
                  createURL: e.state.createURL
                }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisNumericMenu",
    mixins: [
      createWidgetMixin({ connector: connectors.connectNumericMenu }),
      createSuitMixin({ name: "NumericMenu" }),
      createPanelConsumerMixin({
        mapStateToCanRefine: function(e) {
          return !1 === e.hasNoResults;
        }
      })
    ],
    props: {
      attribute: { type: String, required: !0 },
      items: { type: Array, required: !0 },
      transformItems: {
        type: Function,
        default: function(e) {
          return e;
        }
      }
    },
    computed: {
      widgetParams: function() {
        return {
          attribute: this.attribute,
          transformItems: this.transformItems,
          items: this.items
        };
      },
      canRefine: function() {
        return !this.state.hasNoResults;
      }
    }
  },
  Pagination = {
    render: function() {
      var e,
        t,
        n,
        i,
        s = this,
        a = s.$createElement,
        r = s._self._c || a;
      return s.state
        ? r(
            "div",
            { class: s.suit() },
            [
              s._t(
                "default",
                [
                  r(
                    "ul",
                    { class: s.suit("list") },
                    [
                      s.showFirst
                        ? r(
                            "li",
                            {
                              class:
                                ((e = {}),
                                (e[s.suit("item")] = !0),
                                (e[s.suit("item", "firstPage")] = !0),
                                (e[s.suit("item", "disabled")] =
                                  s.state.isFirstPage),
                                e)
                            },
                            [
                              s._t(
                                "first",
                                [
                                  s.state.isFirstPage
                                    ? [
                                        r(
                                          "span",
                                          {
                                            class: s.suit("link"),
                                            attrs: { "aria-label": "First" }
                                          },
                                          [s._v("‹‹")]
                                        )
                                      ]
                                    : [
                                        r(
                                          "a",
                                          {
                                            class: s.suit("link"),
                                            attrs: {
                                              "aria-label": "First",
                                              href: s.state.createURL(0)
                                            },
                                            on: {
                                              click: function(e) {
                                                e.preventDefault(), s.refine(0);
                                              }
                                            }
                                          },
                                          [s._v("‹‹")]
                                        )
                                      ]
                                ],
                                {
                                  createURL: function() {
                                    return s.state.createURL(0);
                                  },
                                  isFirstPage: s.state.isFirstPage,
                                  refine: function() {
                                    return s.refine(0);
                                  }
                                }
                              )
                            ],
                            2
                          )
                        : s._e(),
                      s._v(" "),
                      s.showPrevious
                        ? r(
                            "li",
                            {
                              class:
                                ((t = {}),
                                (t[s.suit("item")] = !0),
                                (t[s.suit("item", "previousPage")] = !0),
                                (t[s.suit("item", "disabled")] =
                                  s.state.isFirstPage),
                                t)
                            },
                            [
                              s._t(
                                "previous",
                                [
                                  s.state.isFirstPage
                                    ? [
                                        r(
                                          "span",
                                          {
                                            class: s.suit("link"),
                                            attrs: { "aria-label": "Previous" }
                                          },
                                          [s._v("‹")]
                                        )
                                      ]
                                    : [
                                        r(
                                          "a",
                                          {
                                            class: s.suit("link"),
                                            attrs: {
                                              "aria-label": "Previous",
                                              href: s.state.createURL(
                                                s.state.currentRefinement - 1
                                              )
                                            },
                                            on: {
                                              click: function(e) {
                                                e.preventDefault(),
                                                  s.refine(
                                                    s.state.currentRefinement -
                                                      1
                                                  );
                                              }
                                            }
                                          },
                                          [s._v("‹")]
                                        )
                                      ]
                                ],
                                {
                                  createURL: function() {
                                    return s.state.createURL(
                                      s.state.currentRefinement - 1
                                    );
                                  },
                                  isFirstPage: s.state.isFirstPage,
                                  refine: function() {
                                    return s.refine(
                                      s.state.currentRefinement - 1
                                    );
                                  }
                                }
                              )
                            ],
                            2
                          )
                        : s._e(),
                      s._v(" "),
                      s._l(s.state.pages, function(e) {
                        var t;
                        return r(
                          "li",
                          {
                            key: e,
                            class:
                              ((t = {}),
                              (t[s.suit("item")] = !0),
                              (t[s.suit("item", "selected")] =
                                s.state.currentRefinement === e),
                              t)
                          },
                          [
                            s._t(
                              "item",
                              [
                                r(
                                  "a",
                                  {
                                    class: s.suit("link"),
                                    attrs: { href: s.state.createURL(e) },
                                    on: {
                                      click: function(t) {
                                        t.preventDefault(), s.refine(e);
                                      }
                                    }
                                  },
                                  [s._v(s._s(e + 1))]
                                )
                              ],
                              {
                                page: e,
                                createURL: function() {
                                  return s.state.createURL(e);
                                },
                                isFirstPage: s.state.isFirstPage,
                                isLastPage: s.state.isLastPage,
                                refine: function() {
                                  return s.refine(e);
                                }
                              }
                            )
                          ],
                          2
                        );
                      }),
                      s._v(" "),
                      s.showNext
                        ? r(
                            "li",
                            {
                              class:
                                ((n = {}),
                                (n[s.suit("item")] = !0),
                                (n[s.suit("item", "nextPage")] = !0),
                                (n[s.suit("item", "disabled")] =
                                  s.state.isLastPage),
                                n)
                            },
                            [
                              s._t(
                                "next",
                                [
                                  s.state.isLastPage
                                    ? [
                                        r(
                                          "span",
                                          {
                                            class: s.suit("link"),
                                            attrs: { "aria-label": "Next" }
                                          },
                                          [s._v("›")]
                                        )
                                      ]
                                    : [
                                        r(
                                          "a",
                                          {
                                            class: s.suit("link"),
                                            attrs: {
                                              "aria-label": "Next",
                                              href: s.state.createURL(
                                                s.state.currentRefinement + 1
                                              )
                                            },
                                            on: {
                                              click: function(e) {
                                                e.preventDefault(),
                                                  s.refine(
                                                    s.state.currentRefinement +
                                                      1
                                                  );
                                              }
                                            }
                                          },
                                          [s._v("›")]
                                        )
                                      ]
                                ],
                                {
                                  createURL: function() {
                                    return s.state.createURL(
                                      s.state.currentRefinement + 1
                                    );
                                  },
                                  isLastPage: s.state.isLastPage,
                                  refine: function() {
                                    return s.refine(
                                      s.state.currentRefinement + 1
                                    );
                                  }
                                }
                              )
                            ],
                            2
                          )
                        : s._e(),
                      s._v(" "),
                      s.showLast
                        ? r(
                            "li",
                            {
                              class:
                                ((i = {}),
                                (i[s.suit("item")] = !0),
                                (i[s.suit("item", "lastPage")] = !0),
                                (i[s.suit("item", "disabled")] =
                                  s.state.isLastPage),
                                i)
                            },
                            [
                              s._t(
                                "last",
                                [
                                  s.state.isLastPage
                                    ? [
                                        r(
                                          "span",
                                          {
                                            class: s.suit("link"),
                                            attrs: { "aria-label": "Last" }
                                          },
                                          [s._v("››")]
                                        )
                                      ]
                                    : [
                                        r(
                                          "a",
                                          {
                                            class: s.suit("link"),
                                            attrs: {
                                              "aria-label": "Last",
                                              href: s.state.createURL(
                                                s.state.nbPages - 1
                                              )
                                            },
                                            on: {
                                              click: function(e) {
                                                e.preventDefault(),
                                                  s.refine(s.state.nbPages - 1);
                                              }
                                            }
                                          },
                                          [s._v("››")]
                                        )
                                      ]
                                ],
                                {
                                  createURL: function() {
                                    return s.state.createURL(
                                      s.state.nbPages - 1
                                    );
                                  },
                                  isLastPage: s.state.isLastPage,
                                  refine: function() {
                                    return s.refine(s.state.nbPages - 1);
                                  }
                                }
                              )
                            ],
                            2
                          )
                        : s._e()
                    ],
                    2
                  )
                ],
                {
                  refine: s.refine,
                  createURL: s.state.createURL,
                  currentRefinement: s.state.currentRefinement,
                  nbHits: s.state.nbHits,
                  nbPages: s.state.nbPages,
                  pages: s.state.pages,
                  isFirstPage: s.state.isFirstPage,
                  isLastPage: s.state.isLastPage
                }
              )
            ],
            2
          )
        : s._e();
    },
    staticRenderFns: [],
    name: "AisPagination",
    mixins: [
      createSuitMixin({ name: "Pagination" }),
      createWidgetMixin({ connector: connectors.connectPagination }),
      createPanelConsumerMixin({
        mapStateToCanRefine: function(e) {
          return e.nbPages > 1;
        }
      })
    ],
    props: {
      padding: {
        type: Number,
        default: 3,
        validator: function(e) {
          return e > 0;
        }
      },
      totalPages: {
        type: Number,
        default: void 0,
        validator: function(e) {
          return e > 0;
        }
      },
      showFirst: { type: Boolean, default: !0 },
      showLast: { type: Boolean, default: !0 },
      showNext: { type: Boolean, default: !0 },
      showPrevious: { type: Boolean, default: !0 }
    },
    computed: {
      widgetParams: function() {
        return { padding: this.padding, totalPages: this.totalPages };
      }
    },
    methods: {
      refine: function(e) {
        var t = Math.min(Math.max(e, 0), this.state.nbPages - 1);
        this.state.refine(t), this.$emit("page-change", t);
      }
    }
  },
  Panel = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return n(
        "div",
        { class: [e.suit(), !e.canRefine && e.suit("", "noRefinement")] },
        [
          e.$slots.header || e.$scopedSlots.header
            ? n(
                "div",
                { class: e.suit("header") },
                [e._t("header", null, { hasRefinements: e.canRefine })],
                2
              )
            : e._e(),
          e._v(" "),
          n(
            "div",
            { class: e.suit("body") },
            [e._t("default", null, { hasRefinements: e.canRefine })],
            2
          ),
          e._v(" "),
          e.$slots.footer || e.$scopedSlots.footer
            ? n(
                "div",
                { class: e.suit("footer") },
                [e._t("footer", null, { hasRefinements: e.canRefine })],
                2
              )
            : e._e()
        ]
      );
    },
    staticRenderFns: [],
    name: "AisPanel",
    mixins: [createSuitMixin({ name: "Panel" }), createPanelProviderMixin()]
  },
  PoweredBy = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return n("div", { class: e.suit() }, [
        n(
          "a",
          {
            class: e.suit("link"),
            attrs: {
              href: e.algoliaUrl,
              target: "_blank",
              rel: "noopener",
              "aria-label": "search by Algolia"
            }
          },
          [
            n(
              "svg",
              {
                class: [e.suit("logo"), e.suit("", e.theme)],
                staticStyle: { height: "1.2em", width: "auto" },
                attrs: { viewBox: "0 0 168 24" }
              },
              [
                n("path", {
                  attrs: {
                    fill: "dark" === e.theme ? "#FFF" : "#5D6494",
                    d:
                      "M6.97 6.68V8.3a4.47 4.47 0 0 0-2.42-.67 2.2 2.2 0 0 0-1.38.4c-.34.26-.5.6-.5 1.02 0 .43.16.77.49 1.03.33.25.83.53 1.51.83a7.04 7.04 0 0 1 1.9 1.08c.34.24.58.54.73.89.15.34.23.74.23 1.18 0 .95-.33 1.7-1 2.24a4 4 0 0 1-2.6.81 5.71 5.71 0 0 1-2.94-.68v-1.71c.84.63 1.81.94 2.92.94.58 0 1.05-.14 1.39-.4.34-.28.5-.65.5-1.13 0-.29-.1-.55-.3-.8a2.2 2.2 0 0 0-.65-.53 23.03 23.03 0 0 0-1.64-.78 13.67 13.67 0 0 1-1.11-.64c-.12-.1-.28-.22-.46-.4a1.72 1.72 0 0 1-.39-.5 4.46 4.46 0 0 1-.22-.6c-.07-.23-.1-.48-.1-.75 0-.91.33-1.63 1-2.17a4 4 0 0 1 2.57-.8c.97 0 1.8.18 2.47.52zm7.47 5.7v-.3a2.26 2.26 0 0 0-.5-1.44c-.3-.35-.74-.53-1.32-.53-.53 0-.99.2-1.37.58-.38.39-.62.95-.72 1.68h3.91zm1 2.79v1.4c-.6.34-1.38.51-2.36.51a4.02 4.02 0 0 1-3-1.13 4.04 4.04 0 0 1-1.11-2.97c0-1.3.34-2.32 1.02-3.06a3.38 3.38 0 0 1 2.6-1.1c1.03 0 1.85.32 2.46.96.6.64.9 1.57.9 2.78 0 .33-.03.68-.09 1.04h-5.31c.1.7.4 1.24.89 1.61.49.38 1.1.56 1.85.56.86 0 1.58-.2 2.15-.6zm6.61-1.78h-1.21c-.6 0-1.05.12-1.35.36-.3.23-.46.53-.46.89 0 .37.12.66.36.88.23.2.57.32 1.02.32.5 0 .9-.15 1.2-.43.3-.28.44-.65.44-1.1v-.92zm-4.07-2.55V9.33a4.96 4.96 0 0 1 2.5-.55c2.1 0 3.17 1.03 3.17 3.08V17H22.1v-.96c-.42.68-1.15 1.02-2.19 1.02-.76 0-1.38-.22-1.84-.66-.46-.44-.7-1-.7-1.68 0-.78.3-1.38.88-1.81.59-.43 1.4-.65 2.46-.65h1.34v-.46c0-.55-.13-.97-.4-1.25-.26-.29-.7-.43-1.32-.43-.86 0-1.65.24-2.35.72zm9.34-1.93v1.42c.39-1 1.1-1.5 2.12-1.5.15 0 .31.02.5.05v1.53c-.23-.1-.48-.14-.76-.14-.54 0-.99.24-1.34.71a2.8 2.8 0 0 0-.52 1.71V17h-1.57V8.91h1.57zm5 4.09a3 3 0 0 0 .76 2.01c.47.53 1.14.8 2 .8.64 0 1.24-.18 1.8-.53v1.4c-.53.32-1.2.48-2 .48a3.98 3.98 0 0 1-4.17-4.18c0-1.16.38-2.15 1.14-2.98a4 4 0 0 1 3.1-1.23c.7 0 1.34.15 1.92.44v1.44a3.24 3.24 0 0 0-1.77-.5A2.65 2.65 0 0 0 32.33 13zm7.92-7.28v4.58c.46-1 1.3-1.5 2.5-1.5.8 0 1.42.24 1.9.73.48.5.72 1.17.72 2.05V17H43.8v-5.1c0-.56-.14-.99-.43-1.29-.28-.3-.65-.45-1.1-.45-.54 0-1 .2-1.42.6-.4.4-.61 1.02-.61 1.85V17h-1.56V5.72h1.56zM55.2 15.74c.6 0 1.1-.25 1.5-.76.4-.5.6-1.16.6-1.95 0-.92-.2-1.62-.6-2.12-.4-.5-.92-.74-1.55-.74-.56 0-1.05.22-1.5.67-.44.45-.66 1.13-.66 2.06 0 .96.22 1.67.64 2.14.43.47.95.7 1.57.7zM53 5.72v4.42a2.74 2.74 0 0 1 2.43-1.34c1.03 0 1.86.38 2.51 1.15.65.76.97 1.78.97 3.05 0 1.13-.3 2.1-.92 2.9-.62.81-1.47 1.21-2.54 1.21s-1.9-.45-2.46-1.34V17h-1.58V5.72H53zm9.9 11.1l-3.22-7.9h1.74l1 2.62 1.26 3.42c.1-.32.48-1.46 1.15-3.42l.91-2.63h1.66l-2.92 7.87c-.78 2.07-1.96 3.1-3.56 3.1-.28 0-.53-.02-.73-.07v-1.34c.17.04.35.06.54.06 1.03 0 1.76-.57 2.17-1.7z"
                  }
                }),
                e._v(" "),
                n("path", {
                  attrs: {
                    fill: "#5468FF",
                    d:
                      "M78.99.94h16.6a2.97 2.97 0 0 1 2.96 2.96v16.6a2.97 2.97 0 0 1-2.97 2.96h-16.6a2.97 2.97 0 0 1-2.96-2.96V3.9A2.96 2.96 0 0 1 79 .94"
                  }
                }),
                e._v(" "),
                n("path", {
                  attrs: {
                    fill: "#FFF",
                    d:
                      "M89.63 5.97v-.78a.98.98 0 0 0-.98-.97h-2.28a.98.98 0 0 0-.97.97V6c0 .09.08.15.17.13a7.13 7.13 0 0 1 3.9-.02c.08.02.16-.04.16-.13m-6.25 1L83 6.6a.98.98 0 0 0-1.38 0l-.46.46a.97.97 0 0 0 0 1.38l.38.39c.06.06.15.04.2-.02a7.49 7.49 0 0 1 1.63-1.62c.07-.04.08-.14.02-.2m4.16 2.45v3.34c0 .1.1.17.2.12l2.97-1.54c.06-.03.08-.12.05-.18a3.7 3.7 0 0 0-3.08-1.87c-.07 0-.14.06-.14.13m0 8.05a4.49 4.49 0 1 1 0-8.98 4.49 4.49 0 0 1 0 8.98m0-10.85a6.37 6.37 0 1 0 0 12.74 6.37 6.37 0 0 0 0-12.74"
                  }
                }),
                e._v(" "),
                n("path", {
                  attrs: {
                    fill: "dark" === e.theme ? "#FFF" : "#5468FF",
                    d:
                      "M120.92 18.8c-4.38.02-4.38-3.54-4.38-4.1V1.36l2.67-.42v13.25c0 .32 0 2.36 1.71 2.37v2.24zm-10.84-2.18c.82 0 1.43-.04 1.85-.12v-2.72a5.48 5.48 0 0 0-1.57-.2c-.3 0-.6.02-.9.07-.3.04-.57.12-.81.24-.24.11-.44.28-.58.49a.93.93 0 0 0-.22.65c0 .63.22 1 .61 1.23.4.24.94.36 1.62.36zm-.23-9.7c.88 0 1.62.11 2.23.33.6.22 1.09.53 1.44.92.36.4.61.92.76 1.48.16.56.23 1.17.23 1.85v6.87c-.4.1-1.03.2-1.86.32-.84.12-1.78.18-2.82.18-.69 0-1.32-.07-1.9-.2a4 4 0 0 1-1.46-.63c-.4-.3-.72-.67-.96-1.13a4.3 4.3 0 0 1-.34-1.8c0-.66.13-1.08.39-1.53.26-.45.6-.82 1.04-1.1.45-.3.95-.5 1.54-.62a8.8 8.8 0 0 1 3.79.05v-.44c0-.3-.04-.6-.11-.87a1.78 1.78 0 0 0-1.1-1.22c-.31-.12-.7-.2-1.15-.2a9.75 9.75 0 0 0-2.95.46l-.33-2.19c.34-.12.84-.23 1.48-.35.65-.12 1.34-.18 2.08-.18zm52.84 9.63c.82 0 1.43-.05 1.85-.13V13.7a5.42 5.42 0 0 0-1.57-.2c-.3 0-.6.02-.9.07-.3.04-.57.12-.81.24-.24.12-.44.28-.58.5a.93.93 0 0 0-.22.65c0 .63.22.99.61 1.23.4.24.94.36 1.62.36zm-.23-9.7c.88 0 1.63.11 2.23.33.6.22 1.1.53 1.45.92.35.39.6.92.76 1.48.15.56.23 1.18.23 1.85v6.88c-.41.08-1.03.19-1.87.31-.83.12-1.77.18-2.81.18-.7 0-1.33-.06-1.9-.2a4 4 0 0 1-1.47-.63c-.4-.3-.72-.67-.95-1.13a4.3 4.3 0 0 1-.34-1.8c0-.66.13-1.08.38-1.53.26-.45.61-.82 1.05-1.1.44-.3.95-.5 1.53-.62a8.8 8.8 0 0 1 3.8.05v-.43c0-.31-.04-.6-.12-.88-.07-.28-.2-.52-.38-.73a1.78 1.78 0 0 0-.73-.5c-.3-.1-.68-.2-1.14-.2a9.85 9.85 0 0 0-2.95.47l-.32-2.19a11.63 11.63 0 0 1 3.55-.53zm-8.03-1.27a1.62 1.62 0 0 0 0-3.24 1.62 1.62 0 1 0 0 3.24zm1.35 13.22h-2.7V7.27l2.7-.42V18.8zm-4.72 0c-4.38.02-4.38-3.54-4.38-4.1l-.01-13.34 2.67-.42v13.25c0 .32 0 2.36 1.72 2.37v2.24zm-8.7-5.9a4.7 4.7 0 0 0-.74-2.79 2.4 2.4 0 0 0-2.07-1 2.4 2.4 0 0 0-2.06 1 4.7 4.7 0 0 0-.74 2.8c0 1.16.25 1.94.74 2.62a2.4 2.4 0 0 0 2.07 1.02c.88 0 1.57-.34 2.07-1.02.49-.68.73-1.46.73-2.63zm2.74 0a6.46 6.46 0 0 1-1.52 4.23c-.49.53-1.07.94-1.76 1.22-.68.29-1.73.45-2.26.45-.53 0-1.58-.15-2.25-.45a5.1 5.1 0 0 1-2.88-3.13 7.3 7.3 0 0 1-.01-4.84 5.13 5.13 0 0 1 2.9-3.1 5.67 5.67 0 0 1 2.22-.42c.81 0 1.56.14 2.24.42.69.29 1.28.69 1.75 1.22.49.52.87 1.15 1.14 1.89a7 7 0 0 1 .43 2.5zm-20.14 0c0 1.11.25 2.36.74 2.88.5.52 1.13.78 1.91.78a4.07 4.07 0 0 0 2.12-.6V9.33c-.19-.04-.99-.2-1.76-.23a2.67 2.67 0 0 0-2.23 1 4.73 4.73 0 0 0-.78 2.8zm7.44 5.27c0 1.82-.46 3.16-1.4 4-.94.85-2.37 1.27-4.3 1.27-.7 0-2.17-.13-3.34-.4l.43-2.11c.98.2 2.27.26 2.95.26 1.08 0 1.84-.22 2.3-.66.46-.43.68-1.08.68-1.94v-.44a5.2 5.2 0 0 1-2.54.6 5.6 5.6 0 0 1-2.01-.36 4.2 4.2 0 0 1-2.58-2.71 9.88 9.88 0 0 1 .02-5.35 4.92 4.92 0 0 1 2.93-2.96 6.6 6.6 0 0 1 2.43-.46 19.64 19.64 0 0 1 4.43.66v10.6z"
                  }
                })
              ]
            )
          ]
        )
      ]);
    },
    staticRenderFns: [],
    name: "AisPoweredBy",
    mixins: [createSuitMixin({ name: "PoweredBy" })],
    props: {
      theme: {
        default: "light",
        validator: function(e) {
          return -1 !== ["light", "dark"].indexOf(e);
        }
      }
    },
    computed: {
      algoliaUrl: function() {
        return (
          "https://www.algolia.com/?utm_source=vue-instantsearch&utm_medium=website&utm_content=" +
          (location ? location.hostname : "") +
          "&utm_campaign=poweredby"
        );
      }
    }
  },
  QueryRuleContext = {
    name: "AisQueryRuleContext",
    mixins: [
      createSuitMixin({ name: "QueryRuleContext" }),
      createWidgetMixin({ connector: connectors.connectQueryRules })
    ],
    props: {
      trackedFilters: { type: Object, required: !0 },
      transformRuleContexts: {
        type: Function,
        required: !1,
        default: function(e) {
          return e;
        }
      }
    },
    computed: {
      widgetParams: function() {
        return {
          trackedFilters: this.trackedFilters,
          transformRuleContexts: this.transformRuleContexts
        };
      }
    },
    render: function() {
      return null;
    }
  },
  QueryRuleCustomData = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            { class: e.suit() },
            [
              e._t(
                "default",
                e._l(e.state.items, function(t, i) {
                  return n(
                    "div",
                    { key: i },
                    [e._t("item", [n("pre", [e._v(e._s(t))])], { item: t })],
                    2
                  );
                }),
                { items: e.state.items }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisQueryRuleCustomData",
    mixins: [
      createSuitMixin({ name: "QueryRuleCustomData" }),
      createWidgetMixin({ connector: connectors.connectQueryRules })
    ],
    props: {
      transformItems: {
        type: Function,
        required: !1,
        default: function(e) {
          return e;
        }
      }
    },
    computed: {
      widgetParams: function() {
        return { transformItems: this.transformItems };
      }
    }
  },
  mapStateToCanRefine$1 = function(e) {
    return e && Boolean(e.range) && e.range.min !== e.range.max;
  },
  RangeInput = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            { class: [e.suit(), !e.canRefine && e.suit("", "noRefinement")] },
            [
              e._t(
                "default",
                [
                  n(
                    "form",
                    {
                      class: e.suit("form"),
                      on: {
                        submit: function(t) {
                          t.preventDefault(),
                            e.refine({
                              min: e.pick(e.minInput, e.values.min),
                              max: e.pick(e.maxInput, e.values.max)
                            });
                        }
                      }
                    },
                    [
                      n(
                        "label",
                        { class: e.suit("label") },
                        [
                          e._t("minLabel"),
                          e._v(" "),
                          n("input", {
                            class: [e.suit("input"), e.suit("input", "min")],
                            attrs: {
                              type: "number",
                              step: e.step,
                              min: e.state.range.min,
                              max: e.state.range.max,
                              placeholder: e.state.range.min
                            },
                            domProps: { value: e.values.min },
                            on: {
                              change: function(t) {
                                e.minInput = t.currentTarget.value;
                              }
                            }
                          })
                        ],
                        2
                      ),
                      e._v(" "),
                      n(
                        "span",
                        { class: e.suit("separator") },
                        [e._t("separator", [e._v("to")])],
                        2
                      ),
                      e._v(" "),
                      n(
                        "label",
                        { class: e.suit("label") },
                        [
                          e._t("maxLabel"),
                          e._v(" "),
                          n("input", {
                            class: [e.suit("input"), e.suit("input", "max")],
                            attrs: {
                              type: "number",
                              step: e.step,
                              min: e.state.range.min,
                              max: e.state.range.max,
                              placeholder: e.state.range.max
                            },
                            domProps: { value: e.values.max },
                            on: {
                              change: function(t) {
                                e.maxInput = t.currentTarget.value;
                              }
                            }
                          })
                        ],
                        2
                      ),
                      e._v(" "),
                      n(
                        "button",
                        { class: e.suit("submit"), attrs: { type: "submit" } },
                        [e._t("submitLabel", [e._v("Go")])],
                        2
                      )
                    ]
                  )
                ],
                {
                  currentRefinement: e.values,
                  refine: e.refine,
                  canRefine: e.canRefine,
                  range: e.state.range
                }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisRangeInput",
    mixins: [
      createSuitMixin({ name: "RangeInput" }),
      createWidgetMixin({ connector: connectors.connectRange }),
      createPanelConsumerMixin({ mapStateToCanRefine: mapStateToCanRefine$1 })
    ],
    props: {
      attribute: { type: String, required: !0 },
      min: { type: Number, required: !1, default: -1 / 0 },
      max: { type: Number, required: !1, default: 1 / 0 },
      precision: { type: Number, required: !1, default: 0 }
    },
    data: function() {
      return { minInput: void 0, maxInput: void 0 };
    },
    updated: function() {
      (this.minInput = void 0), (this.maxInput = void 0);
    },
    computed: {
      widgetParams: function() {
        return {
          attribute: this.attribute,
          min: this.min,
          max: this.max,
          precision: this.precision
        };
      },
      canRefine: function() {
        return mapStateToCanRefine$1(this.state);
      },
      step: function() {
        return 1 / Math.pow(10, this.precision);
      },
      values: function() {
        var e = this.state.start,
          t = e[0],
          n = e[1],
          i = this.state.range,
          s = i.min,
          a = i.max;
        return {
          min: t !== -1 / 0 && t !== s ? t : void 0,
          max: n !== 1 / 0 && n !== a ? n : void 0
        };
      }
    },
    methods: {
      pick: function(e, t) {
        return null != e ? e : t;
      },
      refine: function(e) {
        var t = e.min,
          n = e.max;
        this.state.refine([t, n]);
      }
    }
  },
  RatingMenu = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            { class: e.suit() },
            [
              e._t(
                "default",
                [
                  n(
                    "svg",
                    {
                      staticStyle: { display: "none" },
                      attrs: { xmlns: "http://www.w3.org/2000/svg" }
                    },
                    [
                      n(
                        "symbol",
                        {
                          attrs: {
                            id: "ais-RatingMenu-starSymbol",
                            viewBox: "0 0 24 24"
                          }
                        },
                        [
                          n("path", {
                            attrs: {
                              d:
                                "M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z"
                            }
                          })
                        ]
                      ),
                      e._v(" "),
                      n(
                        "symbol",
                        {
                          attrs: {
                            id: "ais-RatingMenu-starEmptySymbol",
                            viewBox: "0 0 24 24"
                          }
                        },
                        [
                          n("path", {
                            attrs: {
                              d:
                                "M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"
                            }
                          })
                        ]
                      )
                    ]
                  ),
                  e._v(" "),
                  n(
                    "ul",
                    { class: e.suit("list") },
                    e._l(e.state.items, function(t, i) {
                      return n(
                        "li",
                        {
                          key: i,
                          class: [
                            e.suit("item"),
                            t.isRefined && e.suit("item", "selected")
                          ]
                        },
                        [
                          n(
                            "a",
                            {
                              class: e.suit("link"),
                              attrs: {
                                href: e.state.createURL(t),
                                "aria-label": t.value + " & Up"
                              },
                              on: {
                                click: function(n) {
                                  n.preventDefault(), e.state.refine(t.value);
                                }
                              }
                            },
                            [
                              e._l(t.stars, function(t, i) {
                                return [
                                  t
                                    ? n(
                                        "svg",
                                        {
                                          key: i + "-full",
                                          class: [
                                            e.suit("starIcon"),
                                            e.suit("starIcon--full")
                                          ],
                                          attrs: {
                                            "aria-hidden": "true",
                                            width: "24",
                                            height: "24"
                                          }
                                        },
                                        [
                                          n("use", {
                                            attrs: {
                                              "xlink:href":
                                                "#ais-RatingMenu-starSymbol"
                                            }
                                          })
                                        ]
                                      )
                                    : n(
                                        "svg",
                                        {
                                          key: i + "-empty",
                                          class: [
                                            e.suit("starIcon"),
                                            e.suit("starIcon--empty")
                                          ],
                                          attrs: {
                                            "aria-hidden": "true",
                                            width: "24",
                                            height: "24"
                                          }
                                        },
                                        [
                                          n("use", {
                                            attrs: {
                                              "xlink:href":
                                                "#ais-RatingMenu-starEmptySymbol"
                                            }
                                          })
                                        ]
                                      )
                                ];
                              }),
                              e._v(" "),
                              n(
                                "span",
                                {
                                  class: e.suit("label"),
                                  attrs: { "aria-hidden": "true" }
                                },
                                [e._t("andUp", [e._v("& Up")])],
                                2
                              ),
                              e._v(" "),
                              n("span", { class: e.suit("count") }, [
                                e._v(e._s(t.count))
                              ])
                            ],
                            2
                          )
                        ]
                      );
                    })
                  )
                ],
                {
                  items: e.state.items,
                  refine: e.state.refine,
                  createURL: e.state.createURL
                }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisRatingMenu",
    mixins: [
      createSuitMixin({ name: "RatingMenu" }),
      createWidgetMixin({ connector: connectors.connectRatingMenu }),
      createPanelConsumerMixin({
        mapStateToCanRefine: function(e) {
          return !1 === e.hasNoResults;
        }
      })
    ],
    props: {
      attribute: { type: String, required: !0 },
      max: { type: Number, default: 5 }
    },
    computed: {
      widgetParams: function() {
        return { attribute: this.attribute, max: this.max };
      }
    }
  },
  SearchInput = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return n(
        "form",
        {
          class: e.suit("form"),
          attrs: { action: "", role: "search", novalidate: "" },
          on: {
            submit: function(t) {
              return t.preventDefault(), e.onFormSubmit(t);
            },
            reset: function(t) {
              return t.preventDefault(), e.onFormReset(t);
            }
          }
        },
        [
          n("input", {
            ref: "input",
            class: e.suit("input"),
            attrs: {
              type: "search",
              autocorrect: "off",
              autocapitalize: "off",
              autocomplete: "off",
              spellcheck: "false",
              required: "",
              maxlength: "512",
              "aria-label": "Search",
              placeholder: e.placeholder,
              autofocus: e.autofocus
            },
            domProps: { value: e.value },
            on: {
              focus: function(t) {
                e.$emit("focus", t);
              },
              blur: function(t) {
                e.$emit("blur", t);
              },
              input: function(t) {
                e.$emit("input", t.target.value);
              }
            }
          }),
          e._v(" "),
          n(
            "button",
            {
              class: e.suit("submit"),
              attrs: {
                type: "submit",
                title: e.submitTitle,
                hidden: e.showLoadingIndicator && e.shouldShowLoadingIndicator
              }
            },
            [
              e._t("submit-icon", [
                n(
                  "svg",
                  {
                    class: e.suit("submitIcon"),
                    attrs: {
                      role: "img",
                      xmlns: "http://www.w3.org/2000/svg",
                      width: "10",
                      height: "10",
                      viewBox: "0 0 40 40"
                    }
                  },
                  [
                    n("path", {
                      attrs: {
                        d:
                          "M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z",
                        fillRule: "evenodd"
                      }
                    })
                  ]
                )
              ])
            ],
            2
          ),
          e._v(" "),
          n(
            "button",
            {
              class: e.suit("reset"),
              attrs: {
                type: "reset",
                title: e.resetTitle,
                hidden:
                  !e.value ||
                  (e.showLoadingIndicator && e.shouldShowLoadingIndicator)
              }
            },
            [
              e._t("reset-icon", [
                n(
                  "svg",
                  {
                    class: e.suit("resetIcon"),
                    attrs: {
                      role: "img",
                      xmlns: "http://www.w3.org/2000/svg",
                      width: "1em",
                      height: "1em",
                      viewBox: "0 0 20 20"
                    }
                  },
                  [
                    n("path", {
                      attrs: {
                        d:
                          "M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z",
                        fillRule: "evenodd"
                      }
                    })
                  ]
                )
              ])
            ],
            2
          ),
          e._v(" "),
          e.showLoadingIndicator
            ? n(
                "span",
                {
                  class: e.suit("loadingIndicator"),
                  attrs: { hidden: !e.shouldShowLoadingIndicator }
                },
                [
                  e._t("loading-indicator", [
                    n(
                      "svg",
                      {
                        class: e.suit("loadingIcon"),
                        attrs: {
                          role: "img",
                          "aria-label": "Results are loading",
                          width: "16",
                          height: "16",
                          xmlns: "http://www.w3.org/2000/svg",
                          stroke: "#444",
                          viewBox: "0 0 38 38"
                        }
                      },
                      [
                        n(
                          "g",
                          { attrs: { fill: "none", "fill-rule": "evenodd" } },
                          [
                            n(
                              "g",
                              {
                                attrs: {
                                  transform: "translate(1 1)",
                                  "stroke-width": "2"
                                }
                              },
                              [
                                n("circle", {
                                  attrs: {
                                    "stroke-opacity": ".5",
                                    cx: "18",
                                    cy: "18",
                                    r: "18"
                                  }
                                }),
                                e._v(" "),
                                n(
                                  "path",
                                  {
                                    attrs: { d: "M36 18c0-9.94-8.06-18-18-18" }
                                  },
                                  [
                                    n("animateTransform", {
                                      attrs: {
                                        attributeName: "transform",
                                        type: "rotate",
                                        from: "0 18 18",
                                        to: "360 18 18",
                                        dur: "1s",
                                        repeatCount: "indefinite"
                                      }
                                    })
                                  ],
                                  1
                                )
                              ]
                            )
                          ]
                        )
                      ]
                    )
                  ])
                ],
                2
              )
            : e._e()
        ]
      );
    },
    staticRenderFns: [],
    name: "SearchInput",
    mixins: [createSuitMixin({ name: "SearchBox" })],
    props: {
      placeholder: { type: String, default: "Search here…" },
      autofocus: { type: Boolean, default: !1 },
      showLoadingIndicator: { type: Boolean, default: !1 },
      shouldShowLoadingIndicator: { type: Boolean, default: !1 },
      submitTitle: { type: String, default: "Search" },
      resetTitle: { type: String, default: "Clear" },
      value: { type: String, required: !0 }
    },
    data: function() {
      return { query: "" };
    },
    methods: {
      onFormSubmit: function() {
        this.$refs.input.blur();
      },
      onFormReset: function() {
        this.$emit("input", ""), this.$emit("reset");
      }
    }
  },
  noop = function() {},
  RefinementList = {
    render: function() {
      var e,
        t = this,
        n = t.$createElement,
        i = t._self._c || n;
      return t.state
        ? i(
            "div",
            {
              class: [
                t.suit(),
                !t.state.canRefine && t.suit("", "noRefinement")
              ]
            },
            [
              t._t(
                "default",
                [
                  t.searchable
                    ? i(
                        "div",
                        { class: t.suit("searchBox") },
                        [
                          i("search-input", {
                            attrs: {
                              placeholder: t.searchablePlaceholder,
                              "class-names": t.classNames
                            },
                            model: {
                              value: t.searchForFacetValues,
                              callback: function(e) {
                                t.searchForFacetValues = e;
                              },
                              expression: "searchForFacetValues"
                            }
                          })
                        ],
                        1
                      )
                    : t._e(),
                  t._v(" "),
                  t.state.isFromSearch && 0 === t.items.length
                    ? t._t(
                        "noResults",
                        [
                          i("div", { class: t.suit("noResults") }, [
                            t._v("No results.")
                          ])
                        ],
                        { query: t.searchForFacetValues }
                      )
                    : t._e(),
                  t._v(" "),
                  i(
                    "ul",
                    { class: t.suit("list") },
                    t._l(t.items, function(e) {
                      return i(
                        "li",
                        {
                          key: e.value,
                          class: [
                            t.suit("item"),
                            e.isRefined && t.suit("item", "selected")
                          ]
                        },
                        [
                          t._t(
                            "item",
                            [
                              i("label", { class: t.suit("label") }, [
                                i("input", {
                                  class: t.suit("checkbox"),
                                  attrs: { type: "checkbox" },
                                  domProps: {
                                    value: e.value,
                                    checked: e.isRefined
                                  },
                                  on: {
                                    change: function(n) {
                                      t.refine(e.value);
                                    }
                                  }
                                }),
                                t._v(" "),
                                t.searchable
                                  ? i(
                                      "span",
                                      { class: t.suit("labelText") },
                                      [
                                        i("ais-highlight", {
                                          attrs: { attribute: "item", hit: e }
                                        })
                                      ],
                                      1
                                    )
                                  : i("span", { class: t.suit("labelText") }, [
                                      t._v(t._s(e.label))
                                    ]),
                                t._v(" "),
                                i("span", { class: t.suit("count") }, [
                                  t._v(t._s(e.count))
                                ])
                              ])
                            ],
                            {
                              item: e,
                              refine: t.refine,
                              createURL: t.state.createURL
                            }
                          )
                        ],
                        2
                      );
                    })
                  ),
                  t._v(" "),
                  t.showMore
                    ? i(
                        "button",
                        {
                          class: [
                            t.suit("showMore"),
                            ((e = {}),
                            (e[t.suit("showMore", "disabled")] = !t.state
                              .canToggleShowMore),
                            e)
                          ],
                          attrs: { disabled: !t.state.canToggleShowMore },
                          on: { click: t.toggleShowMore }
                        },
                        [
                          t._t(
                            "showMoreLabel",
                            [
                              t._v(
                                "Show " +
                                  t._s(t.state.isShowingMore ? "less" : "more")
                              )
                            ],
                            { isShowingMore: t.state.isShowingMore }
                          )
                        ],
                        2
                      )
                    : t._e()
                ],
                {
                  items: t.items,
                  refine: t.refine,
                  searchForItems: t.state.searchForItems,
                  searchForItemsQuery: t.searchForFacetValuesQuery,
                  toggleShowMore: t.toggleShowMore,
                  canToggleShowMore: t.state.canToggleShowMore,
                  isShowingMore: t.state.isShowingMore,
                  createURL: t.state.createURL,
                  isFromSearch: t.state.isFromSearch,
                  canRefine: t.state.canRefine
                }
              )
            ],
            2
          )
        : t._e();
    },
    staticRenderFns: [],
    name: "AisRefinementList",
    components: { SearchInput: SearchInput, AisHighlight: AisHighlight },
    mixins: [
      createSuitMixin({ name: "RefinementList" }),
      createWidgetMixin({ connector: connectors.connectRefinementList }),
      createPanelConsumerMixin({
        mapStateToCanRefine: function(e) {
          return Boolean(e.canRefine);
        }
      })
    ],
    props: {
      attribute: { type: String, required: !0 },
      searchable: { type: Boolean, default: !1 },
      searchablePlaceholder: {
        default: "Search here…",
        type: String,
        required: !1
      },
      operator: {
        default: "or",
        validator: function(e) {
          return "and" === e || "or" === e;
        },
        required: !1
      },
      limit: { type: Number, default: 10, required: !1 },
      showMoreLimit: { type: Number, default: 20, required: !1 },
      showMore: { type: Boolean, default: !1, required: !1 },
      sortBy: {
        type: [Array, Function],
        default: function() {
          return ["isRefined", "count:desc", "name:asc"];
        },
        required: !1
      },
      transformItems: {
        type: Function,
        default: function(e) {
          return e;
        },
        required: !1
      }
    },
    data: function() {
      return { searchForFacetValuesQuery: "" };
    },
    computed: {
      searchForFacetValues: {
        get: function() {
          return this.searchForFacetValuesQuery;
        },
        set: function(e) {
          this.state.searchForItems(e), (this.searchForFacetValuesQuery = e);
        }
      },
      toggleShowMore: function() {
        return this.state.toggleShowMore || noop;
      },
      items: function() {
        return this.state.items.map(function(e) {
          return Object.assign({}, e, {
            _highlightResult: { item: { value: e.highlighted } }
          });
        });
      },
      widgetParams: function() {
        return {
          attribute: this.attribute,
          operator: this.operator,
          limit: this.limit,
          showMore: this.showMore,
          showMoreLimit: this.showMoreLimit,
          sortBy: this.sortBy,
          escapeFacetValues: !0,
          transformItems: this.transformItems
        };
      }
    },
    methods: {
      refine: function(e) {
        this.state.refine(e), (this.searchForFacetValuesQuery = "");
      }
    }
  },
  connectStateResults = function(e, t) {
    return (
      void 0 === t && (t = function() {}),
      function(n) {
        return (
          void 0 === n && (n = {}),
          {
            init: function(t) {
              var i = t.instantSearchInstance;
              e(
                {
                  state: void 0,
                  results: void 0,
                  instantSearchInstance: i,
                  widgetParams: n
                },
                !0
              );
            },
            render: function(t) {
              var i = t.results,
                s = t.instantSearchInstance,
                a = t.state,
                r = _objectSpread({}, i),
                o = _objectSpread({}, a);
              e(
                {
                  results: r,
                  state: o,
                  instantSearchInstance: s,
                  widgetParams: n
                },
                !1
              );
            },
            dispose: function() {
              t();
            }
          }
        );
      }
    );
  },
  StateResults = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state && e.state.state && e.state.results
        ? n(
            "div",
            { class: e.suit() },
            [
              e._t(
                "default",
                [
                  n("p", [
                    e._v(
                      " Use this component to have a different layout based on a certain state. "
                    )
                  ]),
                  e._v(" "),
                  e._m(0),
                  e._v(" "),
                  n("pre", [
                    e._v("results: " + e._s(Object.keys(e.state.results)))
                  ]),
                  e._v(" "),
                  n("pre", [e._v("state: " + e._s(Object.keys(e.state.state)))])
                ],
                null,
                e.stateResults
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [
      function() {
        var e = this.$createElement,
          t = this._self._c || e;
        return t("p", [
          this._v(
            " Fill in the slot, and get access to the following things on the "
          ),
          t("code", [this._v("slot-scope")]),
          this._v(": ")
        ]);
      }
    ],
    name: "AisStateResults",
    mixins: [
      createWidgetMixin({ connector: connectStateResults }),
      createSuitMixin({ name: "StateResults" })
    ],
    computed: {
      stateResults: function() {
        var e = this.state,
          t = e.state,
          n = e.results;
        return _objectSpread({}, n, { results: n, state: t });
      }
    }
  },
  SearchBox = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            { class: e.suit() },
            [
              e._t(
                "default",
                [
                  n(
                    "search-input",
                    {
                      attrs: {
                        placeholder: e.placeholder,
                        autofocus: e.autofocus,
                        "show-loading-indicator": e.showLoadingIndicator,
                        "should-show-loading-indicator":
                          e.state.isSearchStalled,
                        "submit-title": e.submitTitle,
                        "reset-title": e.resetTitle,
                        "class-names": e.classNames
                      },
                      on: {
                        focus: function(t) {
                          e.$emit("focus", t);
                        },
                        blur: function(t) {
                          e.$emit("blur", t);
                        },
                        reset: function(t) {
                          e.$emit("reset");
                        }
                      },
                      model: {
                        value: e.currentRefinement,
                        callback: function(t) {
                          e.currentRefinement = t;
                        },
                        expression: "currentRefinement"
                      }
                    },
                    [
                      e._t("loading-indicator", null, {
                        slot: "loading-indicator"
                      }),
                      e._v(" "),
                      e._t("submit-icon", null, { slot: "submit-icon" }),
                      e._v(" "),
                      e._t("reset-icon", null, { slot: "reset-icon" })
                    ],
                    2
                  )
                ],
                {
                  currentRefinement: e.currentRefinement,
                  isSearchStalled: e.state.isSearchStalled,
                  refine: e.state.refine
                }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisSearchBox",
    mixins: [
      createWidgetMixin({ connector: connectors.connectSearchBox }),
      createSuitMixin({ name: "SearchBox" })
    ],
    components: { SearchInput: SearchInput },
    props: {
      placeholder: { type: String, default: "Search here…" },
      autofocus: { type: Boolean, default: !1 },
      showLoadingIndicator: { type: Boolean, default: !1 },
      submitTitle: { type: String, default: "Search" },
      resetTitle: { type: String, default: "Clear" },
      value: { type: String, default: void 0 }
    },
    data: function() {
      return { localValue: "" };
    },
    computed: {
      isControlled: function() {
        return void 0 !== this.value;
      },
      currentRefinement: {
        get: function() {
          return (
            this.isControlled &&
              this.value !== this.localValue &&
              ((this.localValue = this.value),
              this.$emit("input", this.value),
              this.state.refine(this.value)),
            this.value || this.state.query || ""
          );
        },
        set: function(e) {
          (this.localValue = e),
            this.state.refine(e),
            this.isControlled && this.$emit("input", e);
        }
      }
    }
  },
  Snippet = {
    render: function() {
      var e = this.$createElement;
      return (this._self._c || e)("ais-highlighter", {
        attrs: {
          hit: this.hit,
          attribute: this.attribute,
          "highlighted-tag-name": this.highlightedTagName,
          suit: this.suit,
          "highlight-property": "_snippetResult",
          "pre-tag": "<mark>",
          "post-tag": "</mark>"
        }
      });
    },
    staticRenderFns: [],
    name: "AisSnippet",
    mixins: [createSuitMixin({ name: "Snippet" })],
    components: { AisHighlighter: AisHighlighter },
    props: {
      hit: { type: Object, required: !0 },
      attribute: { type: String, required: !0 },
      highlightedTagName: { type: String, default: "mark" }
    }
  },
  SortBy = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            { class: e.suit() },
            [
              e._t(
                "default",
                [
                  n(
                    "select",
                    {
                      class: e.suit("select"),
                      on: {
                        change: function(t) {
                          e.state.refine(t.currentTarget.value);
                        }
                      }
                    },
                    e._l(e.state.options, function(t) {
                      return n(
                        "option",
                        {
                          key: t.value,
                          class: e.suit("option"),
                          domProps: {
                            value: t.value,
                            selected: t.value === e.state.currentRefinement
                          }
                        },
                        [e._v(e._s(t.label))]
                      );
                    })
                  )
                ],
                {
                  items: e.state.options,
                  hasNoResults: e.state.hasNoResults,
                  refine: e.state.refine,
                  currentRefinement: e.state.currentRefinement
                }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisSortBy",
    mixins: [
      createSuitMixin({ name: "SortBy" }),
      createWidgetMixin({ connector: connectors.connectSortBy }),
      createPanelConsumerMixin({
        mapStateToCanRefine: function(e) {
          return !1 === e.hasNoResults;
        }
      })
    ],
    props: {
      items: { type: Array, required: !0 },
      transformItems: {
        type: Function,
        default: function(e) {
          return e;
        }
      }
    },
    computed: {
      widgetParams: function() {
        return { items: this.items, transformItems: this.transformItems };
      }
    }
  },
  Stats = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            { class: e.suit() },
            [
              e._t(
                "default",
                [
                  n("span", { class: e.suit("text") }, [
                    e._v(
                      e._s(e.state.nbHits.toLocaleString()) +
                        " results found in " +
                        e._s(e.state.processingTimeMS.toLocaleString()) +
                        "ms"
                    )
                  ])
                ],
                { results: e.state.instantSearchInstance.helper.lastResults },
                e.state
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisStats",
    mixins: [
      createWidgetMixin({ connector: connectors.connectStats }),
      createSuitMixin({ name: "Stats" })
    ],
    computed: {
      widgetParams: function() {
        return {};
      }
    }
  },
  mapStateToCanRefine$2 = function(e) {
    return Boolean(e.value && e.value.count);
  },
  ToggleRefinement = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            { class: [e.suit(), !e.canRefine && e.suit("", "noRefinement")] },
            [
              e._t(
                "default",
                [
                  n("label", { class: e.suit("label") }, [
                    n("input", {
                      class: e.suit("checkbox"),
                      attrs: { type: "checkbox", name: e.state.value.name },
                      domProps: {
                        value: e.on,
                        checked: e.state.value.isRefined
                      },
                      on: {
                        change: function(t) {
                          e.state.refine(e.state.value);
                        }
                      }
                    }),
                    e._v(" "),
                    n("span", { class: e.suit("labelText") }, [
                      e._v(e._s(e.label))
                    ]),
                    e._v(" "),
                    null !== e.state.value.count
                      ? n("span", { class: e.suit("count") }, [
                          e._v(e._s(e.state.value.count.toLocaleString()))
                        ])
                      : e._e()
                  ])
                ],
                {
                  value: e.state.value,
                  canRefine: e.canRefine,
                  refine: e.state.refine,
                  createURL: e.state.createURL
                }
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisToggleRefinement",
    mixins: [
      createSuitMixin({ name: "ToggleRefinement" }),
      createWidgetMixin({ connector: connectors.connectToggleRefinement }),
      createPanelConsumerMixin({ mapStateToCanRefine: mapStateToCanRefine$2 })
    ],
    props: {
      attribute: { type: String, required: !0 },
      label: { type: String, required: !0 },
      on: { type: [String, Number, Boolean, Array], required: !1, default: !0 },
      off: {
        type: [String, Number, Boolean, Array],
        required: !1,
        default: void 0
      }
    },
    computed: {
      widgetParams: function() {
        return {
          attribute: this.attribute,
          label: this.label,
          on: this.on,
          off: this.off
        };
      },
      canRefine: function() {
        return mapStateToCanRefine$2(this.state);
      }
    }
  },
  VoiceSearch = {
    render: function() {
      var e = this,
        t = e.$createElement,
        n = e._self._c || t;
      return e.state
        ? n(
            "div",
            { class: e.suit() },
            [
              e._t(
                "default",
                [
                  n(
                    "button",
                    {
                      class: e.suit("button"),
                      attrs: {
                        type: "button",
                        title: e.state.isBrowserSupported
                          ? e.buttonTitle
                          : e.disabledButtonTitle,
                        disabled: !e.state.isBrowserSupported
                      },
                      on: { click: e.handleClick }
                    },
                    [
                      e._t(
                        "buttonText",
                        [
                          e.errorNotAllowed
                            ? n("svg", e._b({}, "svg", e.buttonSvgAttrs, !1), [
                                n("line", {
                                  attrs: {
                                    x1: "1",
                                    y1: "1",
                                    x2: "23",
                                    y2: "23"
                                  }
                                }),
                                e._v(" "),
                                n("path", {
                                  attrs: {
                                    d:
                                      "M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"
                                  }
                                }),
                                e._v(" "),
                                n("path", {
                                  attrs: {
                                    d:
                                      "M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"
                                  }
                                }),
                                e._v(" "),
                                n("line", {
                                  attrs: {
                                    x1: "12",
                                    y1: "19",
                                    x2: "12",
                                    y2: "23"
                                  }
                                }),
                                e._v(" "),
                                n("line", {
                                  attrs: {
                                    x1: "8",
                                    y1: "23",
                                    x2: "16",
                                    y2: "23"
                                  }
                                })
                              ])
                            : n("svg", e._b({}, "svg", e.buttonSvgAttrs, !1), [
                                n("path", {
                                  attrs: {
                                    d:
                                      "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z",
                                    fill: e.state.isListening
                                      ? "currentColor"
                                      : "none"
                                  }
                                }),
                                e._v(" "),
                                n("path", {
                                  attrs: { d: "M19 10v2a7 7 0 0 1-14 0v-2" }
                                }),
                                e._v(" "),
                                n("line", {
                                  attrs: {
                                    x1: "12",
                                    y1: "19",
                                    x2: "12",
                                    y2: "23"
                                  }
                                }),
                                e._v(" "),
                                n("line", {
                                  attrs: {
                                    x1: "8",
                                    y1: "23",
                                    x2: "16",
                                    y2: "23"
                                  }
                                })
                              ])
                        ],
                        null,
                        e.innerSlotProps
                      )
                    ],
                    2
                  ),
                  e._v(" "),
                  n(
                    "div",
                    { class: e.suit("status") },
                    [
                      e._t(
                        "status",
                        [
                          n("p", [
                            e._v(e._s(e.state.voiceListeningState.transcript))
                          ])
                        ],
                        null,
                        e.innerSlotProps
                      )
                    ],
                    2
                  )
                ],
                null,
                e.rootSlotProps
              )
            ],
            2
          )
        : e._e();
    },
    staticRenderFns: [],
    name: "AisVoiceSearch",
    mixins: [
      createWidgetMixin({ connector: connectors.connectVoiceSearch }),
      createSuitMixin({ name: "VoiceSearch" })
    ],
    props: {
      searchAsYouSpeak: { type: Boolean, required: !1, default: void 0 },
      buttonTitle: { type: String, required: !1, default: "Search by voice" },
      disabledButtonTitle: {
        type: String,
        required: !1,
        default: "Search by voice (not supported on this browser)"
      }
    },
    data: function() {
      return {
        buttonSvgAttrs: {
          xmlns: "http://www.w3.org/2000/svg",
          width: "16",
          height: "16",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      };
    },
    computed: {
      widgetParams: function() {
        return { searchAsYouSpeak: this.searchAsYouSpeak };
      },
      errorNotAllowed: function() {
        return (
          "error" === this.state.voiceListeningState.status &&
          "not-allowed" === this.state.voiceListeningState.errorCode
        );
      },
      rootSlotProps: function() {
        return {
          isBrowserSupported: this.state.isBrowserSupported,
          isListening: this.state.isListening,
          toggleListening: this.state.toggleListening,
          voiceListeningState: this.state.voiceListeningState
        };
      },
      innerSlotProps: function() {
        return {
          status: this.state.voiceListeningState.status,
          errorCode: this.state.voiceListeningState.errorCode,
          isListening: this.state.isListening,
          transcript: this.state.voiceListeningState.transcript,
          isSpeechFinal: this.state.voiceListeningState.isSpeechFinal,
          isBrowserSupported: this.state.isBrowserSupported
        };
      }
    },
    methods: {
      handleClick: function(e) {
        e.currentTarget.blur(), this.state.toggleListening();
      }
    }
  },
  widgets = Object.freeze({
    __proto__: null,
    AisAutocomplete: Autocomplete,
    AisBreadcrumb: Breadcrumb,
    AisClearRefinements: ClearRefinements,
    AisConfigure: Configure,
    AisExperimentalConfigureRelatedItems: ConfigureRelatedItems,
    AisCurrentRefinements: CurrentRefinements,
    AisHierarchicalMenu: HierarchicalMenu,
    AisHighlight: AisHighlight,
    AisHits: Hits,
    AisHitsPerPage: HitsPerPage,
    AisIndex: Index,
    AisInstantSearch: InstantSearch,
    AisInstantSearchSsr: InstantSearchSsr,
    AisInfiniteHits: InfiniteHits,
    AisMenu: Menu,
    AisMenuSelect: MenuSelect,
    AisNumericMenu: NumericMenu,
    AisPagination: Pagination,
    AisPanel: Panel,
    AisPoweredBy: PoweredBy,
    AisQueryRuleContext: QueryRuleContext,
    AisQueryRuleCustomData: QueryRuleCustomData,
    AisRangeInput: RangeInput,
    AisRatingMenu: RatingMenu,
    AisRefinementList: RefinementList,
    AisStateResults: StateResults,
    AisSearchBox: SearchBox,
    AisSnippet: Snippet,
    AisSortBy: SortBy,
    AisStats: Stats,
    AisToggleRefinement: ToggleRefinement,
    AisVoiceSearch: VoiceSearch
  }),
  plugin = {
    install: function(e) {
      Object.keys(widgets).forEach(function(t) {
        e.component(widgets[t].name, widgets[t]);
      });
    }
  },
  SearchResults = algoliaHelper.SearchResults,
  SearchParameters = algoliaHelper.SearchParameters;
function walkIndex(e, t) {
  return (
    t(e),
    e.getWidgets().forEach(function(e) {
      "ais.index" === e.$$type && (t(e), walkIndex(e, t));
    })
  );
}
function renderToString(e, t) {
  return new Promise(function(n, i) {
    return t(e, function(e, t) {
      e && i(e), n(t);
    });
  });
}
function searchOnlyWithDerivedHelpers(e) {
  return new Promise(function(t, n) {
    e.searchOnlyWithDerivedHelpers(),
      e.derivedHelpers[0].on("result", function() {
        t();
      }),
      e.derivedHelpers.forEach(function(e) {
        return e.on("error", function(e) {
          n(e);
        });
      });
  });
}
function augmentInstantSearch(e, t, n) {
  var i,
    s = algoliaHelper(t, n),
    a = instantsearch(e);
  return (
    (a.findResultsState = function(e) {
      var t, n;
      try {
        t = require("vue-server-renderer/basic");
      } catch (e) {}
      if (!t) throw new Error("you need to install vue-server-renderer");
      return Promise.resolve()
        .then(function() {
          var t = {
              serverPrefetch: void 0,
              fetch: void 0,
              _base: void 0,
              name: "ais-ssr-root-component",
              router: e.$router,
              store: e.$store
            },
            i = e.$vnode
              ? e.$vnode.componentOptions.Ctor.extend(t)
              : Vue.component(Object.assign({}, e.$options, t));
          ((n = new i({ propsData: e.$options.propsData })).$slots = e.$slots),
            (n.$root = e.$root),
            (n.$options.serverPrefetch = []),
            (n.instantsearch.helper = s),
            (n.instantsearch.mainHelper = s),
            n.instantsearch.mainIndex.init({
              instantSearchInstance: n.instantsearch,
              parent: null,
              uiState: n.instantsearch._initialUiState
            });
        })
        .then(function() {
          return renderToString(n, t);
        })
        .then(function() {
          return searchOnlyWithDerivedHelpers(s);
        })
        .then(function() {
          var e = {};
          return (
            walkIndex(n.instantsearch.mainIndex, function(t) {
              e[t.getIndexId()] = t.getResults();
            }),
            a.hydrate(e),
            (i = Object.keys(e)
              .map(function(t) {
                var n = e[t],
                  i = n._state,
                  s = n._rawResults;
                return [
                  t,
                  {
                    _state: Object.keys(i).reduce(function(e, t) {
                      return (e[t] = i[t]), e;
                    }, {}),
                    _rawResults: s
                  }
                ];
              })
              .reduce(
                function(e, t) {
                  var n = t[0],
                    i = t[1];
                  return (e[n] = i), e;
                },
                { __identifier: "stringified" }
              )),
            a.getState()
          );
        });
    }),
    (a.getState = function() {
      if (!i)
        throw new Error("You need to wait for findResultsState to finish");
      return i;
    }),
    (a.__forceRender = function(e, t) {
      var n = t.getHelper(),
        i = a.__initialSearchResults[t.getIndexId()];
      if (i) {
        var s = i._state;
        n.state = s;
        e.render({
          helper: n,
          results: i,
          scopedResults: (function e(t) {
            return t
              .filter(function(e) {
                return "ais.index" === e.$$type;
              })
              .reduce(function(t, n) {
                return t.concat.apply(
                  t,
                  [
                    {
                      indexId: n.getIndexId(),
                      results: a.__initialSearchResults[n.getIndexId()],
                      helper: n.getHelper()
                    }
                  ].concat(e(n.getWidgets()))
                );
              }, []);
          })([t]),
          state: s,
          templatesConfig: {},
          createURL: function(e) {
            var i;
            return a._createURL(
              (((i = {})[t.getIndexId()] = t
                .getWidgets()
                .filter(function(e) {
                  return "ais.index" !== e.$$type;
                })
                .reduce(function(t, i) {
                  return i.getWidgetState
                    ? i.getWidgetState(t, { searchParameters: e, helper: n })
                    : t;
                }, {})),
              i)
            );
          },
          instantSearchInstance: a,
          searchMetadata: { isSearchStalled: !1 }
        });
      }
    }),
    (a.hydrate = function(e) {
      if (e) {
        var t =
          "stringified" === e.__identifier
            ? Object.keys(e).reduce(function(t, n) {
                return "__identifier" === n
                  ? t
                  : ((t[n] = new SearchResults(
                      new SearchParameters(e[n]._state),
                      e[n]._rawResults
                    )),
                    t);
              }, {})
            : e;
        (a.__initialSearchResults = t),
          (a.helper = s),
          (a.mainHelper = s),
          a.mainIndex.init({
            instantSearchInstance: a,
            parent: null,
            uiState: a._initialUiState
          });
      } else
        warn(
          "The result of `findResultsState()` needs to be passed to `hydrate()`."
        );
    }),
    a
  );
}
function createServerRootMixin(e) {
  void 0 === e && (e = {});
  var t = e.searchClient,
    n = e.indexName;
  if (!t || !n)
    throw new Error(
      "createServerRootMixin requires `searchClient` and `indexName` in the first argument"
    );
  var i = augmentInstantSearch(e, t, n);
  return {
    provide: function() {
      return { $_ais_ssrInstantSearchInstance: this.instantsearch };
    },
    data: function() {
      return { instantsearch: i };
    }
  };
}
(exports.AisAutocomplete = Autocomplete),
  (exports.AisBreadcrumb = Breadcrumb),
  (exports.AisClearRefinements = ClearRefinements),
  (exports.AisConfigure = Configure),
  (exports.AisCurrentRefinements = CurrentRefinements),
  (exports.AisExperimentalConfigureRelatedItems = ConfigureRelatedItems),
  (exports.AisHierarchicalMenu = HierarchicalMenu),
  (exports.AisHighlight = AisHighlight),
  (exports.AisHits = Hits),
  (exports.AisHitsPerPage = HitsPerPage),
  (exports.AisIndex = Index),
  (exports.AisInfiniteHits = InfiniteHits),
  (exports.AisInstantSearch = InstantSearch),
  (exports.AisInstantSearchSsr = InstantSearchSsr),
  (exports.AisMenu = Menu),
  (exports.AisMenuSelect = MenuSelect),
  (exports.AisNumericMenu = NumericMenu),
  (exports.AisPagination = Pagination),
  (exports.AisPanel = Panel),
  (exports.AisPoweredBy = PoweredBy),
  (exports.AisQueryRuleContext = QueryRuleContext),
  (exports.AisQueryRuleCustomData = QueryRuleCustomData),
  (exports.AisRangeInput = RangeInput),
  (exports.AisRatingMenu = RatingMenu),
  (exports.AisRefinementList = RefinementList),
  (exports.AisSearchBox = SearchBox),
  (exports.AisSnippet = Snippet),
  (exports.AisSortBy = SortBy),
  (exports.AisStateResults = StateResults),
  (exports.AisStats = Stats),
  (exports.AisToggleRefinement = ToggleRefinement),
  (exports.AisVoiceSearch = VoiceSearch),
  (exports.createServerRootMixin = createServerRootMixin),
  (exports.createSuitMixin = createSuitMixin),
  (exports.createWidgetMixin = createWidgetMixin),
  (exports.default = plugin);
//# sourceMappingURL=vue-instantsearch.common.js.map
