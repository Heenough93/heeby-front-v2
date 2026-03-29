import type { JournalTemplateFormValues } from "@/schemas/journal-template-schema";
import type { JournalTemplate } from "@/types/domain";

export function toJournalTemplateFormValues(
  journalTemplate: JournalTemplate
): JournalTemplateFormValues {
  return {
    name: journalTemplate.name,
    theme: journalTemplate.theme,
    visibility: journalTemplate.visibility,
    questions: journalTemplate.questions.map((question) => ({ value: question }))
  };
}
