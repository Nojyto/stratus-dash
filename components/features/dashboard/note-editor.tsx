"use client"

import { updateNote } from "@/app/dashboard/actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { useDebounce } from "@/hooks/use-debounce"
import type { Note } from "@/types/dashboard"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { GFM } from "@lezer/markdown"
import CodeMirror from "@uiw/react-codemirror"
import { Settings } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useMemo, useState } from "react"
import { darkTheme, getEditorExtensions, lightTheme } from "./editor-theme"

type NoteEditorProps = {
  note: Note | null
  setNotesAction: React.Dispatch<React.SetStateAction<Note[]>>
}

type EditorSettings = {
  lineNumbers: boolean
  wysiwyg: boolean
}

export function NoteEditor({ note, setNotesAction }: NoteEditorProps) {
  const [content, setContent] = useState(note?.content || "")
  const { resolvedTheme } = useTheme()

  const [settings, setSettings] = useState<EditorSettings>({
    lineNumbers: false,
    wysiwyg: true,
  })

  const debouncedUpdate = useDebounce(async (newContent: unknown) => {
    const contentStr = newContent as string
    if (note) {
      const updatedNote = await updateNote(note.id, { content: contentStr })
      if (updatedNote) {
        setNotesAction((prev) =>
          prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
        )
      }
    }
  }, 1000)

  const onChange = useCallback(
    (value: string) => {
      setContent(value)
      debouncedUpdate(value)
    },
    [debouncedUpdate]
  )

  useEffect(() => {
    setContent(note?.content || "")
  }, [note])

  const extensions = useMemo(() => {
    return [
      markdown({
        base: markdownLanguage,
        codeLanguages: languages,
        extensions: [GFM],
      }),
      ...getEditorExtensions(settings),
    ]
  }, [settings])

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center bg-background text-muted-foreground">
        Select a note to start editing
      </div>
    )
  }

  return (
    <div className="relative h-full bg-background">
      <div className="absolute right-4 top-2 z-10">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
            >
              <Settings size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="grid gap-4">
              <h4 className="font-medium leading-none">Editor Settings</h4>
              <div className="flex items-center justify-between">
                <Label htmlFor="line-numbers">Line Numbers</Label>
                <Switch
                  id="line-numbers"
                  checked={settings.lineNumbers}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({ ...s, lineNumbers: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="wysiwyg-mode">Zen Mode</Label>
                <Switch
                  id="wysiwyg-mode"
                  checked={settings.wysiwyg}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({ ...s, wysiwyg: checked }))
                  }
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <CodeMirror
        value={content}
        onChange={onChange}
        extensions={extensions}
        theme={resolvedTheme === "dark" ? darkTheme : lightTheme}
        height="100%"
        className="h-full text-base"
        placeholder="Start writing..."
        basicSetup={{
          lineNumbers: settings.lineNumbers,
          foldGutter: false,
          autocompletion: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          drawSelection: true,
        }}
      />
    </div>
  )
}
