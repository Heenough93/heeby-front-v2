import { ContactForm } from "@/features/contact/components/contact-form";
import { AppShell } from "@/shared/components/layout/app-shell";

export default function ContactPage() {
  return (
      <AppShell title="문의" className="max-w-3xl">
        <ContactForm />
      </AppShell>
  );
}
