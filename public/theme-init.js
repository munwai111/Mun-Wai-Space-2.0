// Applies the saved or preferred colour theme before first paint.
try {
  const t = localStorage.getItem("mw-theme");
  if (t) document.documentElement.dataset.theme = t;
  else if (matchMedia("(prefers-color-scheme: dark)").matches)
    document.documentElement.dataset.theme = "dark";
} catch {}
