(() => {
  "use strict";

  /* =========================================================
     巨匠・典藏｜完整互動 JS (含滿版 3D 區域輪播置中)

     1. Header 捲動效果
     2. 手機選單
     3. Reveal 淡入動畫
     4. 精選旅程：無限循環＋中央定位＋圓點＋觸控
     5. 歐洲／紐澳區域圖片輪播（已修正滿版置中滑動）
     6. 歐洲經典行程
     7. 紐澳經典行程
     8. 響應式重新定位
  ======================================================== */

  const $ = (selector, scope = document) =>
    scope ? scope.querySelector(selector) : null;

  const $$ = (selector, scope = document) =>
    scope ? [...scope.querySelectorAll(selector)] : [];


  /* =========================================================
     1. Header 捲動效果
  ======================================================== */

  const header = $("#siteHeader");
  const menuToggle = $(".menu-toggle");
  const mainNav = $(".main-nav");

  function handleHeader() {
    if (!header) return;

    header.classList.toggle(
      "scrolled",
      window.scrollY > 70
    );
  }

  if (header) {
    window.addEventListener("scroll", handleHeader, {
      passive: true
    });

    handleHeader();
  }


  /* =========================================================
     2. 手機選單
  ======================================================== */

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("is-open");

      menuToggle.setAttribute(
        "aria-expanded",
        String(open)
      );
    });
  }

  $$(".main-nav a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav?.classList.remove("is-open");

      menuToggle?.setAttribute(
        "aria-expanded",
        "false"
      );
    });
  });


  /* =========================================================
     3. Reveal 淡入動畫
  ======================================================== */

  const revealItems = $$(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");

            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15
      }
    );

    revealItems.forEach(el => {
      revealObserver.observe(el);
    });

  } else {
    revealItems.forEach(el => {
      el.classList.add("is-visible");
    });
  }


  /* =========================================================
     4. 精選旅程｜無限循環輪播
  ======================================================== */

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
    dots: null,
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

  featured.dots = $(
    '[data-dots-for="featuredSlider"]'
  );


  /* =========================================================
     4-1. 建立三組行程卡片
  ======================================================== */

  function setupFeaturedInfinite() {
    const { track, items } = featured;

    if (!track || !items.length) return;
    if (featured.initialized) return;

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

    [...previousSet, ...middleSet, ...nextSet].forEach(
      item => {
        item.classList.remove("is-active");
        item.removeAttribute("aria-current");

        track.appendChild(item);
      }
    );

    featured.renderedItems = [
      ...track.children
    ];

    const activeIndex = originalItems.findIndex(item =>
      item.classList.contains("is-active")
    );

    featured.index = activeIndex >= 0
      ? activeIndex
      : 0;

    featured.position = total + featured.index;

    featured.initialized = true;
  }


  /* =========================================================
     4-2. 建立精選旅程圓點
  ======================================================== */

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

      button.addEventListener("click", () => {
        goToFeatured(index);
      });

      dotWrap.appendChild(button);
    });
  }


  /* =========================================================
     4-3. 更新精選旅程顯示狀態
  ======================================================== */

  function updateFeaturedActive() {
    const { renderedItems } = featured;

    if (!renderedItems.length) return;

    renderedItems.forEach((item, index) => {
      const active = index === featured.position;

      item.classList.toggle("is-active", active);

      if (active) {
        item.setAttribute("aria-current", "true");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    if (featured.dots) {
      [...featured.dots.children].forEach((dot, index) => {
        const active = index === featured.index;

        dot.classList.toggle("is-active", active);

        dot.setAttribute(
          "aria-current",
          active ? "true" : "false"
        );
      });
    }
  }


  /* =========================================================
     4-4. 精選旅程中央定位
  ======================================================== */

  function renderFeatured(animate = true) {
    const {
      root,
      track,
      renderedItems
    } = featured;

    if (!root || !track || !renderedItems.length) return;

    const total = featured.items.length;

    if (!total) return;

    featured.position = Math.max(
      0,
      Math.min(
        featured.position,
        renderedItems.length - 1
      )
    );

    featured.index =
      ((featured.position - total) % total + total) % total;

    updateFeaturedActive();

    const activeItem =
      renderedItems[featured.position];

    if (!activeItem) return;

    const viewportWidth = root.clientWidth;

    const itemCenter =
      activeItem.offsetLeft +
      activeItem.offsetWidth / 2;

    const offset =
      viewportWidth / 2 - itemCenter;

    track.style.transition = animate
      ? "transform .65s cubic-bezier(.22, .75, .25, 1)"
      : "none";

    track.style.transform =
      `translate3d(${offset}px, 0, 0)`;

    featuredPrev?.setAttribute(
      "aria-label",
      "上一個行程"
    );

    featuredNext?.setAttribute(
      "aria-label",
      "下一個行程"
    );

    if (!animate) {
      track.getBoundingClientRect();

      track.style.transition =
        "transform .65s cubic-bezier(.22, .75, .25, 1)";
    }
  }


  /* =========================================================
     4-5. 切換至指定行程
  ======================================================== */

  function goToFeatured(index) {
    const total = featured.items.length;

    if (!total) return;

    const normalizedIndex =
      ((index % total) + total) % total;

    featured.index = normalizedIndex;
    featured.position = total + normalizedIndex;

    renderFeatured(true);
  }


  /* =========================================================
     4-6. 左右無限循環切換
  ======================================================== */

  function featuredMove(step) {
    if (!featured.items.length) return;

    featured.position += step;

    const total = featured.items.length;

    featured.index =
      ((featured.position - total) % total + total) % total;

    renderFeatured(true);
  }

  featuredPrev?.addEventListener("click", () => {
    featuredMove(-1);
  });

  featuredNext?.addEventListener("click", () => {
    featuredMove(1);
  });


  /* =========================================================
     4-7. 動畫結束後無縫歸位
  ======================================================== */

  if (featured.track) {
    featured.track.addEventListener(
      "transitionend",
      event => {
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
          featured.index = featured.position - total;
          renderFeatured(false);

        } else if (featured.position >= total * 2) {
          featured.position -= total;
          featured.index = featured.position - total;
          renderFeatured(false);
        }
      }
    );
  }


  /* =========================================================
     4-8. 精選旅程觸控滑動
  ======================================================== */

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


  /* =========================================================
     4-9. 精選旅程初始化
  ======================================================== */

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
   左側照片｜中間照片＋文字｜右側照片
======================================================== */

function setupRegionSlider(id) {
  const root = document.getElementById(id);
  if (!root) return null;

  const track = $(".region-track", root);
  const prev = $(".region-prev", root);
  const next = $(".region-next", root);
  const dots = $(".region-dots", root);    if (!track) return null; if (root.dataset.regionInitialized === "true") return null;    root.dataset.regionInitialized = "true";    const slides = $$(".region-slide", track);
  const total = slides.length;

  if (!total) return null;

  let index = 0;
  let timer = null;
  let resizeTimer = null;
  let touchStartX = null;
  let touchStartY = null;

  /*
   * 將目前卡片設為主卡片，
   * 左右卡片依索引循環設定。
   */
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

      // 確保只有中間卡片顯示文字
      const copy = $(".region-copy", slide); if (copy) { copy.style.display = i === index ? "" : "none"; } });      if (dots) { const buttons = $$("button", dots);

      buttons.forEach((button, i) => {
        button.classList.toggle("is-active", i === index);
        button.classList.toggle("active", i === index);
        button.setAttribute(
          "aria-current",
          i === index ? "true" : "false"
        );
      });
    }
  }

  /*
   * 3D 絕對定位模式下，由 CSS 負責樣式與排列，
   * JS 只需要更新狀態即可，避免畫面亂跑。
   */
  function render() {
    updateSlides();
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
      button.setAttribute("aria-label", `切換到第 ${i + 1} 張`);
      button.addEventListener("click", () => goTo(i));

      dots.appendChild(button);
    });
  }

  function restart() {
    clearInterval(timer);

    if (total > 1) {
      timer = setInterval(() => move(1), 6000);
    }
  }

  prev?.addEventListener("click", () => move(-1));
  next?.addEventListener("click", () => move(1));

  root.addEventListener("mouseenter", () => clearInterval(timer));
  root.addEventListener("mouseleave", restart);

  root.addEventListener("touchstart", event => {
    if (!event.touches.length) return;

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }, { passive: true });

  root.addEventListener("touchend", event => {
    if (
      touchStartX === null ||
      touchStartY === null ||
      !event.changedTouches.length
    ) return;

    const dx = event.changedTouches[0].clientX - touchStartX;
    const dy = event.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      move(dx < 0 ? 1 : -1);
    }

    touchStartX = null;
    touchStartY = null;
  }, { passive: true });

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
     6. 歐洲經典行程資料
  ======================================================== */

  const europeTrips = {
    western: [
      {
        tag: "FRANCE · 10 DAYS",
        title: "法國深度・巴黎城堡典藏十日",
        meta: "巴黎 × 羅亞爾河 × 南法",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=85",
        desc: "以巴黎為起點，串聯古堡、葡萄酒與南法風光，留足時間感受法式生活。",
        more: "安排巴黎市區經典景點、羅亞爾河城堡與南法小鎮，搭配精選餐食與舒適住宿，讓旅程保有從容節奏。"
      },
      {
        tag: "ITALY · 11 DAYS",
        title: "義大利藝術・美食典藏十一日",
        meta: "羅馬 × 佛羅倫斯 × 威尼斯",
        image: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=900&q=85",
        desc: "古羅馬遺跡、文藝復興與威尼斯水都，串起義大利最值得收藏的經典。",
        more: "從羅馬古蹟到佛羅倫斯美術館，再到威尼斯運河，將藝術史與餐桌文化一次收藏。"
      },
      {
        tag: "UNITED KINGDOM · 16 DAYS",
        title: "英國愛爾蘭・四遊船典藏十六日",
        meta: "愛丁堡 × 湖區 × 倫敦",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=85",
        desc: "四大遊船、經典古堡與自然景致，深入英倫與愛爾蘭最迷人的風景。",
        more: "包含尼斯湖遊船、劍橋撐篙、湖區遊船、泰晤士河遊船，並安排愛丁堡城堡、西敏寺等經典門票。"
      },
      {
        tag: "NETHERLANDS · 10 DAYS",
        title: "新春飛羊・法比荷花季十日",
        meta: "巴黎 × 比利時 × 荷蘭",
        image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=85",
        desc: "花季限定路線，走訪鬱金香花海、運河城市與歐洲經典名城。",
        more: "搭配中華航空、巴黎市區連泊與荷蘭花季，將鬱金香、運河與法比荷經典風景一次串聯。"
      }
    ],

    eastern: [
      {
        tag: "CZECHIA · 9 DAYS",
        title: "布拉格・波希米亞古城典藏九日",
        meta: "布拉格 × 庫倫洛夫 × 維也納",
        image: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=900&q=85",
        desc: "漫步紅瓦屋頂與古典廣場，感受東歐城市的歷史層次。",
        more: "安排布拉格城堡區、查理大橋與世界文化遺產小鎮，搭配維也納古典音樂與咖啡文化。"
      },
      {
        tag: "AUSTRIA · 10 DAYS",
        title: "奧地利・湖區與音樂之旅",
        meta: "維也納 × 薩爾茲堡 × 哈修塔特",
        image: "https://images.unsplash.com/photo-1609856878074-6d4b9d0f3b1a?auto=format&fit=crop&w=900&q=85",
        desc: "古典樂章、湖區山色與宮殿建築，描繪奧地利的優雅。",
        more: "走訪維也納皇宮、薩爾茲堡與湖區小鎮，讓自然與文化在同一趟旅程裡交會。"
      },
      {
        tag: "CROATIA · 10 DAYS",
        title: "克羅埃西亞・亞得里亞海典藏十日",
        meta: "杜布羅夫尼克 × 斯普利特",
        image: "https://images.unsplash.com/photo-1555990538-1e7b0d7b2a0b?auto=format&fit=crop&w=900&q=85",
        desc: "石造古城、湛藍海岸與地中海餐桌，收藏亞得里亞海的光。",
        more: "深入杜布羅夫尼克與沿岸古城，搭配海岸景觀與在地餐食，呈現東歐南境的另一種優雅。"
      }
    ],

    southern: [
      {
        tag: "GREECE · 9 DAYS",
        title: "希臘愛琴海・聖托里尼典藏九日",
        meta: "雅典 × 聖托里尼 × 米克諾斯",
        image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=85",
        desc: "藍白島嶼、愛琴海夕陽與希臘神話，將南歐最純粹的浪漫收進旅程。",
        more: "以雅典古文明為起點，安排島嶼慢旅與海景時光，適合喜愛風景、美食與生活感的旅人。"
      },
      {
        tag: "SPAIN · 10 DAYS",
        title: "西班牙・建築與美食美學十日",
        meta: "巴塞隆納 × 馬德里 × 塞維亞",
        image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=85",
        desc: "高第建築、弗拉明哥與西班牙餐桌，感受熱情而細膩的南歐風格。",
        more: "精選巴塞隆納與安達魯西亞城市，搭配市場、tapas 與建築巡禮，完整體驗西班牙文化。"
      },
      {
        tag: "PORTUGAL · 9 DAYS",
        title: "葡萄牙・大西洋光影九日",
        meta: "里斯本 × 波多 × 辛特拉",
        image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=85",
        desc: "電車、瓷磚、海岸與葡萄酒，探索葡萄牙溫柔而明亮的旅行風景。",
        more: "走訪里斯本舊城、辛特拉宮殿與波多酒窖，以悠閒節奏享受大西洋沿岸。"
      }
    ],

    northern: [
      {
        tag: "NORWAY · 10 DAYS",
        title: "挪威峽灣・極光典藏十日",
        meta: "奧斯陸 × 峽灣 × 卑爾根",
        image: "https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=900&q=85",
        desc: "峽灣、山岳與北境光影，走進北歐最壯闊的自然。",
        more: "安排峽灣遊船與山景鐵路，依季節搭配極光或午夜太陽，留下北境難忘的自然記憶。"
      },
      {
        tag: "FINLAND · 9 DAYS",
        title: "芬蘭・玻璃屋極光之旅",
        meta: "赫爾辛基 × 拉普蘭",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=85",
        desc: "雪地森林、玻璃屋與北極光，感受北境冬夜的靜謐。",
        more: "入住特色玻璃屋，搭配雪地活動與拉普蘭自然體驗，適合想遠離城市喧囂的旅人。"
      },
      {
        tag: "ICELAND · 9 DAYS",
        title: "冰島・火山冰川環島九日",
        meta: "雷克雅維克 × 南岸 × 冰河湖",
        image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=900&q=85",
        desc: "冰川、黑沙灘、瀑布與地熱，探索世界最奇幻的自然地景。",
        more: "串聯冰島南岸、冰河湖與經典地熱景觀，依季節安排極光觀賞或夏季長日體驗。"
      }
    ]
  };


  /* =========================================================
     7. 紐澳經典行程資料
  ======================================================== */

  const oceaniaTrips = {
    newzealand: [
      {
        tag: "NEW ZEALAND · 10 DAYS",
        title: "紐西蘭南島・湖光山色十日",
        meta: "皇后鎮 × 米佛峽灣 × 蒂卡波",
        image: "https://images.unsplash.com/photo-1469521669194-babb45599def?auto=format&fit=crop&w=900&q=85",
        desc: "湖泊、雪山、峽灣與星空，收藏南島最經典的自然風景。",
        more: "安排米佛峽灣遊船、蒂卡波湖與皇后鎮，搭配舒適住宿，讓山海風景成為旅程主角。"
      },
      {
        tag: "NEW ZEALAND · 12 DAYS",
        title: "紐西蘭雙島・自然極致十二日",
        meta: "奧克蘭 × 羅托魯瓦 × 皇后鎮",
        image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=900&q=85",
        desc: "北島地熱文化與南島山海景致一次收藏。",
        more: "串聯雙島經典景點，以自然、毛利文化與美食為主題，打造完整的新西蘭深度旅程。"
      },
      {
        tag: "NEW ZEALAND · 9 DAYS",
        title: "南島慢旅・峽灣與牧場九日",
        meta: "基督城 × 瓦納卡 × 皇后鎮",
        image: "https://images.unsplash.com/photo-1469521669194-babb45599def?auto=format&fit=crop&w=900&q=85",
        desc: "以較慢的節奏感受湖區、牧場與山谷，享受南島純粹風景。",
        more: "適合喜歡攝影與自然景色的旅人，保留充裕時間在湖畔與山城散步。"
      },
      {
        tag: "NEW ZEALAND · 11 DAYS",
        title: "紐西蘭・花園城市與冰河十一日",
        meta: "基督城 × 福克斯冰河 × 皇后鎮",
        image: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=900&q=85",
        desc: "城市花園、湖泊與冰河景觀交織出南島的多重風貌。",
        more: "以基督城為起點，深入冰河與湖區，搭配精選景觀住宿。"
      }
    ],

    australia: [
      {
        tag: "AUSTRALIA · 10 DAYS",
        title: "澳洲東岸・城市與大堡礁十日",
        meta: "雪梨 × 布里斯本 × 凱恩斯",
        image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d0?auto=format&fit=crop&w=900&q=85",
        desc: "城市天際線、大堡礁與海岸生活，一次感受澳洲東岸魅力。",
        more: "安排雪梨港灣、藍山與大堡礁體驗，結合城市、美食與自然景觀。"
      },
      {
        tag: "AUSTRALIA · 9 DAYS",
        title: "墨爾本・大洋路與酒鄉九日",
        meta: "墨爾本 × 大洋路 × 雅拉河谷",
        image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=900&q=85",
        desc: "藝術城市、海岸公路與酒莊，體驗澳洲南方的生活美學。",
        more: "大洋路沿岸景觀搭配雅拉河谷酒莊，適合喜歡城市與自然兼具的旅人。"
      },
      {
        tag: "AUSTRALIA · 11 DAYS",
        title: "澳洲南北・自然與城市十一日",
        meta: "雪梨 × 愛麗絲泉 × 烏魯魯",
        image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",
        desc: "從海岸城市深入紅土中心，探索澳洲最具代表性的地景。",
        more: "串聯雪梨與烏魯魯，感受原住民文化、星空與澳洲內陸景觀。"
      },
      {
        tag: "AUSTRALIA · 10 DAYS",
        title: "塔斯馬尼亞・荒野與海岸十日",
        meta: "霍巴特 × 搖籃山 × 酒杯灣",
        image: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=900&q=85",
        desc: "原始荒野、森林與海灣，探索澳洲最純粹的一面。",
        more: "以霍巴特為起點，深入國家公園與海岸線，適合自然系旅人。"
      }
    ]
  };


  /* =========================================================
     8. 經典行程狀態
  ======================================================== */

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
     9. 建立經典行程卡片
  ======================================================== */

  function makeTripCard(trip) {
    const card = document.createElement("article");

    card.className = "trip-card";

    card.innerHTML = `
      <div
        class="trip-photo"
        style="--bg:url('${trip.image}')"
      ></div>

      <div class="trip-body">
        <span class="trip-tag">${trip.tag}</span>

        <h3 class="trip-title">${trip.title}</h3>

        <div class="trip-meta">${trip.meta}</div>

        <p class="trip-desc">${trip.desc}</p>

        <button
          class="trip-toggle"
          type="button"
          aria-expanded="false"
        >
          <span>推薦行程</span>
          <span class="plus">＋</span>
        </button>

        <div class="trip-more">
          <div class="trip-more-inner">
            <p>${trip.more}</p>

            <ul>
              <li>精選景點與舒適旅遊節奏</li>
              <li>專業團隊行程規劃與品質把關</li>
              <li>依季節安排最適合的旅行體驗</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    const toggle = $(".trip-toggle", card);

    if (toggle) {
      toggle.addEventListener("click", () => {
        const open = card.classList.toggle("is-open");

        toggle.setAttribute(
          "aria-expanded",
          String(open)
        );
      });
    }

    return card;
  }


  /* =========================================================
     10. 經典行程可見卡片數量
  ======================================================== */

  function cardsVisible() {
    if (window.innerWidth <= 720) return 1;
    if (window.innerWidth <= 1000) return 2;
    return 3;
  }


  /* =========================================================
     11. 更新經典行程位置
  ======================================================== */

  function updateClassicPosition(type) {
    const track = document.getElementById(
      type === "europe"
        ? "europeClassicTrack"
        : "oceaniaClassicTrack"
    );

    if (!track || !track.children.length) return;

    const card = track.children[0];
    const cardWidth = card.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;

    const state = classicState[type];
    if (!state) return;

    const offset = state.offset * (cardWidth + gap);

    track.style.transform = `translateX(${-offset}px)`;
  }


  /* =========================================================
     12. 顯示經典行程
  ======================================================== */

  function renderClassic(type) {
    const isEurope = type === "europe";

    const track = document.getElementById(
      isEurope
        ? "europeClassicTrack"
        : "oceaniaClassicTrack"
    );

    if (!track) return;

    const data = isEurope ? europeTrips : oceaniaTrips;
    const state = classicState[type];

    if (!state) return;

    const list = data[state.category] || [];

    track.innerHTML = "";

    list.forEach(trip => {
      track.appendChild(makeTripCard(trip));
    });

    const maxOffset = Math.max(
      0,
      list.length - cardsVisible()
    );

    state.offset = Math.max(
      0,
      Math.min(state.offset, maxOffset)
    );

    updateClassicPosition(type);
  }


  /* =========================================================
     13. 經典行程左右切換
  ======================================================== */

  function changeClassic(type, step) {
    const isEurope = type === "europe";
    const data = isEurope ? europeTrips : oceaniaTrips;
    const state = classicState[type];

    if (!state) return;

    const total = (data[state.category] || []).length;
    const max = Math.max(0, total - cardsVisible());

    if (max === 0) {
      state.offset = 0;
      updateClassicPosition(type);
      return;
    }

    state.offset += step;

    if (state.offset < 0) {
      state.offset = max;
    }

    if (state.offset > max) {
      state.offset = 0;
    }

    updateClassicPosition(type);
  }


  /* =========================================================
     14. 地區篩選按鈕
  ======================================================== */

  $$("[data-filter-group]").forEach(group => {
    const type = group.dataset.filterGroup;

    if (!classicState[type]) return;

    $$(".filter-btn", group).forEach(btn => { btn.addEventListener("click", () => { $$
(".filter-btn", group).forEach(button => {
          button.classList.remove("is-active");
        });

        btn.classList.add("is-active");

        const category = btn.dataset.filter;
        const data = type === "europe" ? europeTrips : oceaniaTrips;

        if (!Object.prototype.hasOwnProperty.call(data, category)) {
          return;
        }

        classicState[type].category = category;
        classicState[type].offset = 0;

        renderClassic(type);
      });
    });
  });


  /* =========================================================
     15. 經典行程左右按鈕
  ======================================================== */

  $$("[data-classic-prev]").forEach(button => { button.addEventListener("click", () => { const type = button.dataset.classicPrev; if (!classicState[type]) return; changeClassic(type, -1); }); });    $$
("[data-classic-next]").forEach(button => {
    button.addEventListener("click", () => {
      const type = button.dataset.classicNext;
      if (!classicState[type]) return;
      changeClassic(type, 1);
    });
  });


  /* =========================================================
     16. 初始化經典行程
  ======================================================== */

  renderClassic("europe");
  renderClassic("oceania");


  /* =========================================================
     17. 視窗尺寸變更
  ======================================================== */

  let resizeTimer = null;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      renderFeatured(false);

      ["europe", "oceania"].forEach(type => {
        const isEurope = type === "europe";
        const data = isEurope ? europeTrips : oceaniaTrips;
        const state = classicState[type];

        const total = (data[state.category] || []).length;
        const maxOffset = Math.max(0, total - cardsVisible());

        state.offset = Math.max(
          0,
          Math.min(state.offset, maxOffset)
        );

        updateClassicPosition(type);
      });
    }, 120);
  });


  /* =========================================================
     18. 經典行程觸控拖曳
  ======================================================== */

  function enableDrag(track, type) {
    if (!track) return;

    let startX = 0;
    let startY = 0;
    let dragging = false;

    track.addEventListener("pointerdown", event => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      if (event.target.closest("button, a, input, textarea, select")) {
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

  enableDrag($("#europeClassicTrack"), "europe");
  enableDrag($("#oceaniaClassicTrack"), "oceania");


  /* =========================================================
     19. 初始化完成
  ======================================================== */

  if (featured.items.length) {
    renderFeatured(false);
  }

})();
