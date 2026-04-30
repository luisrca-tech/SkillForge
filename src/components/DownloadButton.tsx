import { useState } from "react";
import { Download } from "lucide-react";
import { cn } from "../lib/utils";
import SkillsInstallDialog from "./SkillsInstallDialog";
import { useLocale } from "../context/LocaleContext";

type DownloadButtonProps = {
  className?: string;
};

export default function DownloadButton({ className }: DownloadButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { t } = useLocale();

  return (
    <>
      <a
        href="/skills.zip"
        download
        onClick={() => setDialogOpen(true)}
        className={cn(
          "inline-flex items-center gap-2.5 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400",
          className,
        )}
      >
        <Download className="size-4" />
        {t("download.label")}
      </a>
      <SkillsInstallDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
