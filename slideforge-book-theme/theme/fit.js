(function () {
  function getContentBounds(root) {
    const slide = root.closest(".slide");
    const page = root.closest(".book-page");

    if (!slide || !page) {
      return null;
    }

    const pageStyle = window.getComputedStyle(page);
    const availableWidth =
      slide.clientWidth -
      parseFloat(pageStyle.paddingLeft) -
      parseFloat(pageStyle.paddingRight);
    const availableHeight =
      slide.clientHeight -
      parseFloat(pageStyle.paddingTop) -
      parseFloat(pageStyle.paddingBottom);

    return { availableWidth, availableHeight };
  }

  function resetLayout(root) {
    root.style.transform = "";
    root.style.transformOrigin = "";
    root.style.width = "";
  }

  function fitRoot(root) {
    const bounds = getContentBounds(root);

    if (!bounds) {
      return;
    }

    resetLayout(root);

    const naturalWidth = Math.ceil(root.scrollWidth);
    const naturalHeight = Math.ceil(root.scrollHeight);

    const widthRatio = bounds.availableWidth / naturalWidth;
    const heightRatio = bounds.availableHeight / naturalHeight;
    const scale = Math.min(1, widthRatio, heightRatio);

    if (scale >= 0.999) {
      return;
    }

    root.style.width = `${bounds.availableWidth / scale}px`;
    root.style.transformOrigin = "top left";
    root.style.transform = `scale(${scale})`;
  }

  function fitAll() {
    const roots = document.querySelectorAll('[data-auto-fit="shrink"]');
    roots.forEach(fitRoot);
  }

  async function run() {
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (_error) {
        // Ignore font readiness failures and fit with current metrics.
      }
    }

    fitAll();
  }

  window.addEventListener("load", run, { once: true });
  window.addEventListener("resize", fitAll);
})();
