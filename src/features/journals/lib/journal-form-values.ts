import type { JournalFormValues } from "@/features/journals/lib/journal-form-schema";
import type { Journal } from "@/features/journals/lib/journal-types";

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
