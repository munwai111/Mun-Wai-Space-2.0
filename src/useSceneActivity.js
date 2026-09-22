import { useEffect, useState } from "react";

export default function useSceneActivity(ref, calm = false) {
  const [visible, setVisible] = useState(false);
  const [available, setAvailable] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (ref.current) observer.observe(ref.current);
    const update = () =>
      setAvailable(
        !document.hidden &&
          !document.documentElement.classList.contains("listening-open") &&
          !document.documentElement.classList.contains("impact-open") &&
          !document.documentElement.classList.contains("film-open"),
      );
    const modal = new MutationObserver(update);
    modal.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      modal.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);
  return visible && available && !calm;
}
