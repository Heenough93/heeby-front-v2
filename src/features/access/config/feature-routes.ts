export const featureRoutePatterns = {
  home: ["/"],
  login: ["/login"],
  travelArchive: ["/travel", /^\/travel\/[^/]+$/],
  travelEditor: ["/travel/new", /^\/travel\/[^/]+\/edit$/],
  journalTemplateAdmin: ["/templates", /^\/templates\/.+/],
  journalEditor: ["/journals/new", /^\/journals\/.+\/edit$/],
  journalArchive: ["/journals", /^\/journals\/.+/]
} as const;
