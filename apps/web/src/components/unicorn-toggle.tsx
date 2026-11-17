import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";

const STORAGE_KEY = "unicorn";
const ATTRIBUTE = "data-unicorn";

function readStoredUnicorn(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

function writeStoredUnicorn(on: boolean) {
  try {
    if (on) {
      window.localStorage.setItem(STORAGE_KEY, "on");
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage can be blocked (private mode, cleared site data). The look still applies for this page view.
  }
}

export default function UnicornToggle() {
  const [on, setOn] = useState<boolean>(false);

  useEffect(() => {
    const initialOn =
      readStoredUnicorn() ||
      document.documentElement.getAttribute(ATTRIBUTE) === "on";
    setOn(initialOn);
    if (initialOn) {
      document.documentElement.setAttribute(ATTRIBUTE, "on");
    }
  }, []);

  function toggleUnicorn() {
    const nextOn = !on;
    if (nextOn) {
      document.documentElement.setAttribute(ATTRIBUTE, "on");
    } else {
      document.documentElement.removeAttribute(ATTRIBUTE);
    }
    writeStoredUnicorn(nextOn);
    setOn(nextOn);
  }

  const label = on
    ? "Unicorn theme: on. Click to turn off."
    : "Unicorn theme: off. Click to turn on.";

  return (
    <Button
      aria-label={label}
      aria-pressed={on}
      onClick={toggleUnicorn}
      size="sm"
      title={label}
      type="button"
      variant={on ? "secondary" : "outline"}
    >
      <Sparkles />
      Unicorn
    </Button>
  );
}
