(function () {
  function overlayImageUrls() {
    if (!document.getElementById("image-overlay-styles")) {
      const style = document.createElement("style");
      style.id = "image-overlay-styles";
      style.textContent = `
        .image-overlay-wrapper {
          position: relative;
        }
        .image-url-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          max-height: 100%;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-size: 10px;
          padding: 2px;
          word-break: break-word;
          pointer-events: none;
          z-index: 9999;
        }
        .image-overlay-wrapper:hover .image-url-overlay {
          min-width: 200px;
          overflow-y: auto;
          max-height: 200px;
          white-space: normal;
          text-overflow: clip;
          background: rgba(0, 0, 0, 0.85);
        }
      `;
      document.head.appendChild(style);
    }

    const images = document.querySelectorAll("img");

    images.forEach((img) => {
      let target = img;

      // If the img is inside a <picture>, use the picture element
      if (img.parentElement?.tagName.toLowerCase() === "picture") {
        target = img.parentElement;
      }

      // Skip if already processed
      if (target.parentElement?.classList.contains("image-overlay-wrapper")) {
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "image-overlay-wrapper";

      target.parentNode.insertBefore(wrapper, target);
      wrapper.appendChild(target);

      const overlay = document.createElement("div");
      overlay.className = "image-url-overlay";
      overlay.textContent = img.currentSrc || img.src;

      wrapper.appendChild(overlay);

      setTimeout(() => {
        if (overlay.scrollHeight > overlay.offsetHeight) {
          overlay.classList.add("needs-expand");
        }
      }, 50);

      // Store reference
      img._urlOverlay = overlay;

      // Listen for changes: when image source changes or reloads
      const updateOverlay = () => {
        if (img._urlOverlay) {
          const newSrc = img.currentSrc || img.src;
          if (img._urlOverlay.textContent !== newSrc) {
            img._urlOverlay.textContent = newSrc;
          }
        }
      };

      img.addEventListener("load", updateOverlay);

      // (Optional) Also detect changes to 'src' attribute directly
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (
            mutation.type === "attributes" &&
            (mutation.attributeName === "src" ||
              mutation.attributeName === "srcset")
          ) {
            updateOverlay();
          }
        }
      });
      observer.observe(img, {
        attributes: true,
        attributeFilter: ["src", "srcset"],
      });
    });
  }

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    overlayImageUrls();
  } else {
    window.addEventListener("DOMContentLoaded", overlayImageUrls);
  }
})();
