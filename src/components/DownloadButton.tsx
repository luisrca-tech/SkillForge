import { useState } from "react";
import { Download } from "lucide-react";
import SkillsInstallDialog from "./SkillsInstallDialog";

export default function DownloadButton() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <a
        href="/skills.zip"
        download
        onClick={() => setDialogOpen(true)}
        className="inline-flex items-center gap-2.5 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
      >
        <Download className="size-4" />
        Baixar skills
      </a>
      <SkillsInstallDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
