import { ConsumptionMethod } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

interface ConsumptionMethodOptionProps {
  slug: string;
  option: ConsumptionMethod;
  label: string;
  hint: string;
  imageUrl: string;
}

const ConsumptionMethodOption = ({
  slug,
  option,
  label,
  hint,
  imageUrl,
}: ConsumptionMethodOptionProps) => {
  return (
    <Link
      href={`/${slug}/menu?consumptionMethod=${option}`}
      className="group flex flex-col items-center gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-8"
    >
      <Image
        src={imageUrl}
        alt=""
        width={128}
        height={128}
        className="h-24 w-24 transition group-hover:scale-105 sm:h-32 sm:w-32"
      />
      <span className="space-y-1">
        <span className="block font-display text-lg font-bold sm:text-xl">
          {label}
        </span>
        <span className="block text-xs text-muted-foreground sm:text-sm">
          {hint}
        </span>
      </span>
    </Link>
  );
};

export default ConsumptionMethodOption;
