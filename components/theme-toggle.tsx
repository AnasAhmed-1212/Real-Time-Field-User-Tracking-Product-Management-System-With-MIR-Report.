"use client"

import { useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

const THEME_EVENT = "sales-theme-change"

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener(THEME_EVENT, callback)
    window.removeEventListener("storage", callback)
  }
}

function getSnapshot() { return document.documentElement.classList.contains("dark") }
function getServerSnapshot() { return false }

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function toggleTheme() {
    const nextDark = !document.documentElement.classList.contains("dark")
    document.documentElement.classList.toggle("dark", nextDark)
    localStorage.setItem("sales-theme", nextDark ? "dark" : "light")
    window.dispatchEvent(new Event(THEME_EVENT))
  }

  return <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={dark ? "Use light theme" : "Use dark theme"} title={dark ? "Use light theme" : "Use dark theme"}>{dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}</Button>
}
