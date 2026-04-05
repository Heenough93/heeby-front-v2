import Link from "next/link";

type ListBackActionProps = {
  href: string;
  label?: string;
};

export function ListBackAction({
  href,
  label = "← 목록"
}: ListBackActionProps) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
    >
      {label}
    </Link>
  );
}
