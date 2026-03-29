import type { JournalFormValues } from "@/schemas/journal-schema";
import type { Journal } from "@/types/domain";

export function toJournalFormValues(journal: Journal): JournalFormValues {
  return {
    title: journal.title,
    theme: journal.theme,
    journalTemplateId: journal.journalTemplateId,
    visibility: journal.visibility,
    answers: journal.answers.map((item) => ({
      question: item.question,
      answer: item.answer
    }))
  };
}
