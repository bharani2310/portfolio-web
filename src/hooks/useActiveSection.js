import { useEffect, useState } from 'react';

/**
 * useActiveSection - observes a list of section ids and returns
 * whichever one currently occupies the most of the viewport,
 * so the navbar can highlight where the user actually is.
 */
export default function useActiveSection(ids = []) {
  const [activeId, setActiveId] = useState(ids[0]);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Counts a section as "current" once it occupies the
        // middle band of the screen, accounting for the sticky navbar.
        rootMargin: '-35% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}
