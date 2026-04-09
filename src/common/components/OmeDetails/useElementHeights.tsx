import { useEffect } from "react";

/**
 * This measures the height of the header and entity tabs for proper positioning of all elements.
 * I really, really wanted to make this layout simpler while making it work as I wanted but here we are.
 */
export const useElementHeights = () => {
  useEffect(() => {
    const updateHeights = () => {
      const omeHeader = document.querySelector<HTMLElement>("#ome-header"); //Entity tabs given this id

      if (omeHeader) {
        const omeHeaderHeight = omeHeader.offsetHeight;
        document.documentElement.style.setProperty("--ome-header-height", `${omeHeaderHeight}px`);
      }
    };

    // Initial measurement
    updateHeights();

    // Update on window resize
    window.addEventListener("resize", updateHeights);

    // Observe elements for size changes
    const omeHeader = document.querySelector<HTMLElement>(".ome-header");

    const observer = new ResizeObserver(updateHeights);
    if (omeHeader) observer.observe(omeHeader);

    return () => {
      window.removeEventListener("resize", updateHeights);
      observer.disconnect();
    };
  }, []);
};
