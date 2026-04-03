export const featureRoutePatterns = {
  home: ["/"],
  login: ["/login"],
  travelEditor: ["/travel/new", /^\/travel\/[^/]+\/edit$/],
  travelArchive: ["/travel", /^\/travel\/[^/]+$/],
  routineEditor: ["/routines/new", /^\/routines\/[^/]+\/edit$/],
  routineArchive: ["/routines", /^\/routines\/[^/]+$/],
  stockEditor: ["/stocks/new", "/stocks/trades/new", /^\/stocks\/trades\/[^/]+\/edit$/, /^\/stocks\/[^/]+\/edit$/],
  stockArchive: ["/stocks", "/stocks/trades", /^\/stocks\/[^/]+$/],
  journalTemplateAdmin: ["/templates", /^\/templates\/.+/],
  journalEditor: ["/journals/new", /^\/journals\/.+\/edit$/],
  journalArchive: ["/journals", /^\/journals\/.+/]
} as const;
