export const featureRoutePatterns = {
  home: ["/"],
  login: ["/login"],
  contact: ["/contact"],
  travelEditor: ["/travel/new", /^\/travel\/[^/]+\/edit$/],
  travelArchive: ["/travel", /^\/travel\/[^/]+$/],
  routineEditor: ["/routines/new", /^\/routines\/[^/]+\/edit$/],
  routineArchive: ["/routines", /^\/routines\/[^/]+$/],
  stockEditor: ["/stocks/new", "/stocks/snapshots/new", "/stocks/trades/new", "/stocks/ipos/new", /^\/stocks\/trades\/[^/]+\/edit$/, /^\/stocks\/snapshots\/[^/]+\/edit$/, /^\/stocks\/[^/]+\/edit$/],
  stockArchive: ["/stocks", "/stocks/snapshots", "/stocks/trades", "/stocks/ipos", /^\/stocks\/snapshots\/[^/]+$/, /^\/stocks\/[^/]+$/],
  journalTemplateAdmin: ["/templates", /^\/templates\/.+/],
  journalEditor: ["/journals/new", /^\/journals\/.+\/edit$/],
  journalArchive: ["/journals", /^\/journals\/.+/]
} as const;
