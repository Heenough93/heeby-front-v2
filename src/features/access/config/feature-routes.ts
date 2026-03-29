export const featureRoutePatterns = {
  home: ["/"],
  login: ["/login"],
  travelTracker: ["/travel", /^\/travel\/.+/],
  journalTemplateAdmin: ["/templates", /^\/templates\/.+/],
  journalEditor: ["/journals/new", /^\/journals\/.+\/edit$/],
  journalArchive: ["/journals", /^\/journals\/.+/]
} as const;
