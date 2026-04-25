import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm font-mono text-emerald-400 overflow-x-auto">
      {children}
    </pre>
  );
}

export default function SkillsInstallDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark bg-neutral-950 border border-neutral-800 text-neutral-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-neutral-100">
            Como instalar os skills
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Descompacte o arquivo e copie a pasta <code className="text-emerald-400 text-xs">skills/</code> para o diretório correto.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="wsl">
          <TabsList className="bg-neutral-900 border border-neutral-800 w-full">
            <TabsTrigger value="wsl" className="data-active:bg-neutral-800 data-active:text-emerald-400 text-neutral-400">
              WSL
            </TabsTrigger>
            <TabsTrigger value="macos" className="data-active:bg-neutral-800 data-active:text-emerald-400 text-neutral-400">
              macOS
            </TabsTrigger>
            <TabsTrigger value="linux" className="data-active:bg-neutral-800 data-active:text-emerald-400 text-neutral-400">
              Linux
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wsl" className="mt-3 space-y-2">
            <CodeBlock>{"unzip skills.zip -d ~/.claude/skills/"}</CodeBlock>
            <p className="text-xs text-neutral-500">
              Dentro do WSL, o home fica em <code className="text-neutral-400">/home/&lt;user&gt;/.claude/skills/</code>.
              No Windows nativo, o caminho é diferente.
            </p>
          </TabsContent>

          <TabsContent value="macos" className="mt-3 space-y-2">
            <CodeBlock>{"unzip skills.zip -d ~/.claude/skills/"}</CodeBlock>
          </TabsContent>

          <TabsContent value="linux" className="mt-3 space-y-2">
            <CodeBlock>{"unzip skills.zip -d ~/.claude/skills/"}</CodeBlock>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-neutral-500 leading-relaxed border-l-2 border-neutral-800 pl-3">
          Os caminhos podem variar dependendo da ferramenta que você usa.
          A própria LLM pode te ajudar a encontrar o diretório correto para o seu setup.
        </p>

        <DialogFooter className="bg-neutral-900/50 border-neutral-800">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
