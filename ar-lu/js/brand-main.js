
(() => {
  "use strict";

  /* =========================================================
     巨匠・典藏｜完整互動 JS

     1. Header 捲動效果
     2. 手機選單
     3. Reveal 淡入動畫
     4. 精選旅程：無限循環＋中央定位＋圓點＋觸控
     5. 歐洲／紐澳區域圖片輪播
     6. 歐洲經典行程：直接讀取 HTML
     7. 紐澳經典行程：直接讀取 HTML
     8. 響應式重新定位
     9. 經典行程左右切換與觸控拖曳
    10. 推薦行程展開／收合
  ========================================================= */

  const $ = (selector, scope = document) =>
    scope ? scope.querySelector(selector) : null;

  const $$ = (selector, scope = document) =>
    scope ? [...scope.querySelectorAll(selector)] : [];

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );


  /* =========================================================
     0. 推薦行程｜歐洲與紐澳共用展開／收合
  ========================================================= */

  function setTripMoreHeight(more, height) {
    if (!more) return;
    more.style.height = `${Math.max(0, height)}px`;
  }

  function openTripMore(card, toggle, more) {
    card.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");

    more.style.opacity = "1";

    if (reducedMotionQuery.matches) {
      more.style.height = "auto";
      return;
    }

    more.style.height = "0px";

    requestAnimationFrame(() => {
      if (!card.classList.contains("is-open")) return;
      setTripMoreHeight(more, more.scrollHeight);
    });

    const onTransitionEnd = event => {
      if (
        event.target !== more ||
        event.propertyName !== "height"
      ) {
        return;
      }

      more.removeEventListener("transitionend", onTransitionEnd);

      if (card.classList.contains("is-open")) {
        more.style.height = "auto";
      }
    };

    more.addEventListener("transitionend", onTransitionEnd);
  }

  function closeTripMore(card, toggle, more) {
    const currentHeight = more.getBoundingClientRect().height;

    card.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");

    if (reducedMotionQuery.matches) {
      more.style.height = "0px";
      more.style.opacity = "0";
      return;
    }

    more.style.height = `${currentHeight}px`;
    more.style.opacity = "0";

    void more.offsetHeight;

    more.style.height = "0px";
  }

  document.addEventListener("click", event => {
    const target = event.target instanceof Element
      ? event.target
      : event.target?.parentElement;

    const toggle = target?.closest(
      ".classic-card .trip-toggle, .trip-card .trip-toggle"
    );

    if (!toggle) return;

    const card = toggle.closest(".classic-card, .trip-card");
    const more = card?.querySelector(".trip-more");

    if (!card || !more) return;

    if (card.classList.contains("is-open")) {
      closeTripMore(card, toggle, more);
    } else {
      openTripMore(card, toggle, more);
    }
  });


  /* =========================================================
     1. Header 捲動效果
  ========================================================= */

  const header = $("#siteHeader");
  const menuToggle = $(".menu-toggle");
  const mainNav = $(".main-nav");

  function handleHeader() {
    if (!header) return;

    header.classList.toggle("scrolled", window.scrollY > 70);
  }

  if (header) {
    window.addEventListener("scroll", handleHeader, {
      passive: true
    });

    handleHeader();
  }


  /* =========================================================
     2. 手機選單
  ========================================================= */

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  $$(".main-nav a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav?.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });


  /* =========================================================
     3. Reveal 淡入動畫
  ========================================================= */

  const revealItems = $$(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach(el => revealObserver.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add("is-visible"));
  }


  /* =========================================================
     4. 精選旅程｜無限循環輪播
  ========================================================= */

  const featuredRoot = $("#featuredSlider");

  const featured = {
    root: featuredRoot,
    track: featuredRoot
      ? $(".featured-track", featuredRoot)
      : null,
    items: featuredRoot
      ? $$(".featured-track > .featured-item", featuredRoot)
      : [],
    renderedItems: [],
    index: 0,
    position: 0,
    dots: $('[data-dots-for="featuredSlider"]'),
    initialized: false
  };

  const featuredControls = $(
    '[data-slider-controls="featuredSlider"]'
  );

  const featuredPrev = featuredControls
    ? $(".prev", featuredControls)
    : null;

  const featuredNext = featuredControls
    ? $(".next", featuredControls)
    : null;


  function setupFeaturedInfinite() {
    const { track, items } = featured;

    if (!track || !items.length || featured.initialized) return;

    const originalItems = items.slice();
    const total = originalItems.length;

    const previousSet = originalItems.map(item =>
      item.cloneNode(true)
    );

    const middleSet = originalItems.map(item =>
      item.cloneNode(true)
    );

    const nextSet = originalItems.map(item =>
      item.cloneNode(true)
    );

    track.innerHTML = "";

    [
      ...previousSet,
      ...middleSet,
      ...nextSet
    ].forEach(item => {
      item.classList.remove("is-active");
      item.removeAttribute("aria-current");
      track.appendChild(item);
    });

    featured.renderedItems = [...track.children];

    const activeIndex = originalItems.findIndex(item =>
      item.classList.contains("is-active")
    );

    featured.index = activeIndex >= 0 ? activeIndex : 0;
    featured.position = total + featured.index;
    featured.initialized = true;
  }


  function renderFeaturedDots() {
    const dotWrap = featured.dots;

    if (!dotWrap || !featured.items.length) return;

    dotWrap.innerHTML = "";

    featured.items.forEach((item, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.setAttribute(
        "aria-label",
        `切換到第 ${index + 1} 個行程`
      );

      button.addEventListener("click", () => goToFeatured(index));

      dotWrap.appendChild(button);
    });
  }


  function updateFeaturedActive() {
    const { renderedItems } = featured;

    if (!renderedItems.length) return;

    renderedItems.forEach((item, index) => {
      const isActive = index === featured.position;

      item.classList.toggle("is-active", isActive);

      if (isActive) {
        item.setAttribute("aria-current", "true");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    if (featured.dots) {
      [...featured.dots.children].forEach((dot, index) => {
        const isActive = index === featured.index;

        dot.classList.toggle("is-active", isActive);
        dot.setAttribute(
          "aria-current",
          isActive ? "true" : "false"
        );
      });
    }
  }


  function renderFeatured(animate = true) {
    const { root, track, renderedItems } = featured;

    if (!root || !track || !renderedItems.length) return;

    const total = featured.items.length;
    if (!total) return;

    featured.position = Math.max(
      0,
      Math.min(featured.position, renderedItems.length - 1)
    );

    featured.index =
      ((featured.position - total) % total + total) % total;

    updateFeaturedActive();

    const activeItem = renderedItems[featured.position];
    if (!activeItem) return;

    const viewportWidth = root.clientWidth;

    const itemCenter =
      activeItem.offsetLeft + activeItem.offsetWidth / 2;

    const offset = viewportWidth / 2 - itemCenter;

    track.style.transition = animate
      ? "transform .65s cubic-bezier(.22, .75, .25, 1)"
      : "none";

    track.style.transform = `translate3d(${offset}px, 0, 0)`;

    featuredPrev?.setAttribute("aria-label", "上一個行程");
    featuredNext?.setAttribute("aria-label", "下一個行程");

    if (!animate) {
      track.getBoundingClientRect();
      track.style.transition =
        "transform .65s cubic-bezier(.22, .75, .25, 1)";
    }
  }


  function goToFeatured(index) {
    const total = featured.items.length;
    if (!total) return;

    const normalizedIndex = ((index % total) + total) % total;

    featured.index = normalizedIndex;
    featured.position = total + normalizedIndex;

    renderFeatured(true);
  }


  function featuredMove(step) {
    if (!featured.items.length) return;

    featured.position += step;
    renderFeatured(true);
  }

  featuredPrev?.addEventListener("click", () => featuredMove(-1));
  featuredNext?.addEventListener("click", () => featuredMove(1));


  if (featured.track) {
    featured.track.addEventListener("transitionend", event => {
      if (
        event.target !== featured.track ||
        event.propertyName !== "transform"
      ) {
        return;
      }

      const total = featured.items.length;
      if (!total) return;

      if (featured.position < total) {
        featured.position += total;
        renderFeatured(false);
      } else if (featured.position >= total * 2) {
        featured.position -= total;
        renderFeatured(false);
      }
    });
  }


  let featuredStartX = null;
  let featuredStartY = null;

  featured.root?.addEventListener(
    "touchstart",
    event => {
      if (!event.touches.length) return;

      featuredStartX = event.touches[0].clientX;
      featuredStartY = event.touches[0].clientY;
    },
    { passive: true }
  );

  featured.root?.addEventListener(
    "touchend",
    event => {
      if (
        featuredStartX === null ||
        featuredStartY === null ||
        !event.changedTouches.length
      ) {
        return;
      }

      const deltaX =
        event.changedTouches[0].clientX - featuredStartX;

      const deltaY =
        event.changedTouches[0].clientY - featuredStartY;

      if (
        Math.abs(deltaX) > 45 &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.2
      ) {
        featuredMove(deltaX < 0 ? 1 : -1);
      }

      featuredStartX = null;
      featuredStartY = null;
    },
    { passive: true }
  );


  function refreshFeaturedPosition() {
    if (!featured.items.length) return;
    renderFeatured(false);
  }

  if (featured.items.length) {
    setupFeaturedInfinite();
    renderFeaturedDots();
    refreshFeaturedPosition();

    window.addEventListener("load", refreshFeaturedPosition);

    if ("ResizeObserver" in window && featured.root) {
      const featuredResizeObserver = new ResizeObserver(() => {
        refreshFeaturedPosition();
      });

      featuredResizeObserver.observe(featured.root);
    }
  }


  /* =========================================================
     5. 歐洲／紐澳區域圖片輪播
  ========================================================= */

  function setupRegionSlider(id) {
    const root = document.getElementById(id);
    if (!root) return null;

    const track = $(".region-track", root);
    const prev = $(".region-prev", root);
    const next = $(".region-next", root);
    const dots = $(".region-dots", root);

    if (!track || root.dataset.regionInitialized === "true") {
      return null;
    }

    root.dataset.regionInitialized = "true";

    const slides = $$(".region-slide", track);
    const total = slides.length;

    if (!total) return null;

    let index = 0;
    let timer = null;
    let resizeTimer = null;
    let touchStartX = null;
    let touchStartY = null;

    const initialIndex = slides.findIndex(slide =>
      slide.classList.contains("is-active")
    );

    index = initialIndex >= 0 ? initialIndex : 0;

    function updateSlides() {
      slides.forEach((slide, i) => {
        slide.classList.remove("is-active", "is-prev", "is-next");

        if (i === index) {
          slide.classList.add("is-active");
        } else if (i === (index - 1 + total) % total) {
          slide.classList.add("is-prev");
        } else if (i === (index + 1) % total) {
          slide.classList.add("is-next");
        }

        const copy = $(".region-copy", slide);

        if (copy) {
          copy.style.display = i === index ? "" : "none";
        }
      });

      if (dots) {
        $$("button", dots).forEach((button, i) => {
          const active = i === index;

          button.classList.toggle("is-active", active);
          button.classList.toggle("active", active);
          button.setAttribute(
            "aria-current",
            active ? "true" : "false"
          );
        });
      }
    }

    function render() {
      updateSlides();
    }

    function restart() {
      clearInterval(timer);

      if (total > 1 && !reducedMotionQuery.matches) {
        timer = setInterval(() => move(1), 6000);
      }
    }

    function goTo(target) {
      index = (target + total) % total;
      render();
      restart();
    }

    function move(step) {
      goTo(index + step);
    }

    function buildDots() {
      if (!dots) return;

      dots.innerHTML = "";

      slides.forEach((slide, i) => {
        const button = document.createElement("button");

        button.type = "button";
        button.setAttribute(
          "aria-label",
          `切換到第 ${i + 1} 張`
        );

        button.addEventListener("click", () => goTo(i));
        dots.appendChild(button);
      });
    }

    prev?.addEventListener("click", () => move(-1));
    next?.addEventListener("click", () => move(1));

    root.addEventListener("mouseenter", () => clearInterval(timer));
    root.addEventListener("mouseleave", restart);

    root.addEventListener(
      "touchstart",
      event => {
        if (!event.touches.length) return;

        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      },
      { passive: true }
    );

    root.addEventListener(
      "touchend",
      event => {
        if (
          touchStartX === null ||
          touchStartY === null ||
          !event.changedTouches.length
        ) {
          return;
        }

        const dx =
          event.changedTouches[0].clientX - touchStartX;

        const dy =
          event.changedTouches[0].clientY - touchStartY;

        if (
          Math.abs(dx) > 45 &&
          Math.abs(dx) > Math.abs(dy) * 1.2
        ) {
          move(dx < 0 ? 1 : -1);
        }

        touchStartX = null;
        touchStartY = null;
      },
      { passive: true }
    );

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(render, 120);
    });

    buildDots();
    render();
    restart();

    return { root, track, render, move };
  }

  setupRegionSlider("europeRegion");
  setupRegionSlider("oceaniaRegion");


  /* =========================================================
     6. 經典行程狀態
     歐洲與紐澳都直接讀取 HTML
  ========================================================= */

  const classicState = {
    europe: {
      category: "western",
      offset: 0
    },
    oceania: {
      category: "newzealand",
      offset: 0
    }
  };


  /* =========================================================
     7. 可見卡片數量
  ========================================================= */

  function cardsVisible() {
    if (window.innerWidth <= 720) return 1;
    if (window.innerWidth <= 1000) return 2;
    return 3;
  }


  /* =========================================================
     8. 取得經典行程容器
  ========================================================= */

  function getClassicTrack(type) {
    return document.getElementById(
      type === "europe"
        ? "europeClassicTrack"
        : "oceaniaClassicTrack"
    );
  }


  /* =========================================================
     9. 取得目前顯示的經典行程卡片
     歐洲與紐澳統一使用 .classic-card
  ========================================================= */

  function getClassicCards(type) {
    const track = getClassicTrack(type);
    if (!track) return [];

    return $$(".classic-card", track).filter(card =>
      getComputedStyle(card).display !== "none"
    );
  }


  /* =========================================================
     10. 更新經典行程位置
  ========================================================= */

  function updateClassicPosition(type) {
    const track = getClassicTrack(type);
    const state = classicState[type];

    if (!track || !state) return;

    const cards = getClassicCards(type);

    if (!cards.length) {
      track.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    const maxOffset = Math.max(
      0,
      cards.length - cardsVisible()
    );

    state.offset = Math.max(
      0,
      Math.min(state.offset, maxOffset)
    );

    const firstCard = cards[0];
    const cardWidth = firstCard.getBoundingClientRect().width;
    const trackStyle = window.getComputedStyle(track);

    const gap =
      parseFloat(trackStyle.columnGap) ||
      parseFloat(trackStyle.gap) ||
      0;

    const offset = state.offset * (cardWidth + gap);

    track.style.transform =
      `translate3d(${-offset}px, 0, 0)`;
  }


  /* =========================================================
     11. 歐洲經典行程篩選
     直接控制 HTML 卡片，不建立、不刪除卡片
  ========================================================= */

  function filterEuropeCards(category) {
    const track = document.getElementById("europeClassicTrack");
    if (!track) return;

    $$(".classic-card", track).forEach(card => {
      card.style.display =
        card.dataset.region === category ? "" : "none";
    });

    classicState.europe.category = category;
    classicState.europe.offset = 0;

    track.style.transform = "translate3d(0, 0, 0)";
    updateClassicPosition("europe");
  }


  /* =========================================================
     12. 紐澳經典行程篩選
     直接控制 HTML 卡片，不建立、不刪除卡片
     HTML 必須設定：
     data-country="newzealand"
     data-country="australia"
  ========================================================= */

  function filterOceaniaCards(category) {
    const track = document.getElementById("oceaniaClassicTrack");
    if (!track) return;

    $$(".classic-card", track).forEach(card => {
      const isMatch = card.dataset.country === category;

      card.style.display = isMatch ? "" : "none";

      // 切換分類時收合推薦行程
      card.classList.remove("is-open");

      const toggle = $(".trip-toggle", card);
      const more = $(".trip-more", card);

      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
      }

      if (more) {
        more.style.height = "0px";
        more.style.opacity = "0";
      }
    });

    classicState.oceania.category = category;
    classicState.oceania.offset = 0;

    track.style.transform = "translate3d(0, 0, 0)";
    updateClassicPosition("oceania");
  }


  /* =========================================================
     13. 經典行程左右切換
  ========================================================= */

  function changeClassic(type, step) {
    const state = classicState[type];
    if (!state) return;

    const cards = getClassicCards(type);

    const maxOffset = Math.max(
      0,
      cards.length - cardsVisible()
    );

    if (maxOffset <= 0) {
      state.offset = 0;
      updateClassicPosition(type);
      return;
    }

    state.offset += step;

    if (state.offset > maxOffset) {
      state.offset = 0;
    }

    if (state.offset < 0) {
      state.offset = maxOffset;
    }

    updateClassicPosition(type);
  }


  /* =========================================================
     14. 區域篩選按鈕
     歐洲：western / eastern / southern / northern
     紐澳：newzealand / australia
  ========================================================= */

  $$("[data-filter-group]").forEach(group => {
    const type = group.dataset.filterGroup;

    if (!classicState[type]) return;

    $$(".filter-btn", group).forEach(button => {
      button.addEventListener("click", () => {
        const category = button.dataset.filter;

        const validCategory = type === "europe"
          ? ["western", "eastern", "southern", "northern"].includes(category)
          : ["newzealand", "australia"].includes(category);

        if (!validCategory) return;

        $$(".filter-btn", group).forEach(item => {
          item.classList.remove("is-active");
          item.setAttribute("aria-pressed", "false");
        });

        button.classList.add("is-active");
        button.setAttribute("aria-pressed", "true");

        if (type === "europe") {
          filterEuropeCards(category);
        } else if (type === "oceania") {
          filterOceaniaCards(category);
        }
      });
    });
  });


  /* =========================================================
     15. 經典行程左右箭頭
  ========================================================= */

  $$("[data-classic-prev]").forEach(button => {
    button.addEventListener("click", () => {
      const type = button.dataset.classicPrev;

      if (!classicState[type]) return;

      changeClassic(type, -1);
    });
  });

  $$("[data-classic-next]").forEach(button => {
    button.addEventListener("click", () => {
      const type = button.dataset.classicNext;

      if (!classicState[type]) return;

      changeClassic(type, 1);
    });
  });


  /* =========================================================
     16. 初始化經典行程
     不產生、不刪除任何行程卡片
  ========================================================= */

  function initializeClassicFilters() {
    const europeTrack = document.getElementById("europeClassicTrack");
    const oceaniaTrack = document.getElementById("oceaniaClassicTrack");

    if (europeTrack) {
      filterEuropeCards("western");

      const europeGroup = $('[data-filter-group="europe"]');

      $$(".filter-btn", europeGroup).forEach(button => {
        const active = button.dataset.filter === "western";

        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }

    if (oceaniaTrack) {
      filterOceaniaCards("newzealand");

      const oceaniaGroup = $('[data-filter-group="oceania"]');

      $$(".filter-btn", oceaniaGroup).forEach(button => {
        const active = button.dataset.filter === "newzealand";

        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }
  }

  initializeClassicFilters();


  /* =========================================================
     17. 經典行程觸控／滑鼠拖曳
  ========================================================= */

  function enableDrag(track, type) {
    if (!track) return;

    let startX = 0;
    let startY = 0;
    let dragging = false;

    track.addEventListener("pointerdown", event => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      if (
        event.target instanceof Element &&
        event.target.closest(
          "button, a, input, textarea, select, summary"
        )
      ) {
        return;
      }

      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
    });

    track.addEventListener("pointerup", event => {
      if (!dragging) return;

      dragging = false;

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        changeClassic(type, dx < 0 ? 1 : -1);
      }
    });

    track.addEventListener("pointercancel", () => {
      dragging = false;
    });

    track.addEventListener("pointerleave", () => {
      dragging = false;
    });
  }

  enableDrag(
    document.getElementById("europeClassicTrack"),
    "europe"
  );

  enableDrag(
    document.getElementById("oceaniaClassicTrack"),
    "oceania"
  );


  /* =========================================================
     18. 視窗尺寸變更
  ========================================================= */

  let classicResizeTimer = null;

  window.addEventListener("resize", () => {
    clearTimeout(classicResizeTimer);

    classicResizeTimer = setTimeout(() => {
      renderFeatured(false);

      updateClassicPosition("europe");
      updateClassicPosition("oceania");

      $$(".classic-card.is-open .trip-more, .trip-card.is-open .trip-more")
        .forEach(more => {
          more.style.height = "auto";
        });
    }, 120);
  });


  /* =========================================================
     19. 初始化完成
  ========================================================= */

  if (featured.items.length) {
    renderFeatured(false);
  }

})();
