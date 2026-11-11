/* ============================================================
   光辉足迹 · 交互脚本  js/main.js
   1. 滚动进场动画（.reveal → .is-visible）
   2. 长征时间轴逐条点亮（.timeline-item → .is-lit）
   3. 导航高亮当前区块（.site-nav a.is-current）
   依赖：IntersectionObserver（Chrome 129 原生支持），无第三方库
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ---------- 1. 滚动进场 ---------- */
  var revealItems = document.querySelectorAll(".reveal");

  function showAll(items) {
    Array.prototype.forEach.call(items, function (el) {
      el.classList.add("is-visible");
    });
  }

  if (!hasIO || reduceMotion) {
    showAll(revealItems);
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );

    Array.prototype.forEach.call(revealItems, function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------- 2. 时间轴逐条点亮 ---------- */
  var timelineItems = document.querySelectorAll(".timeline-item");

  if (timelineItems.length) {
    if (!hasIO || reduceMotion) {
      Array.prototype.forEach.call(timelineItems, function (el) {
        el.classList.add("is-lit");
      });
    } else {
      var timelineObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            entry.target.classList.toggle("is-lit", entry.isIntersecting);
          });
        },
        // 视口中部一条“扫描带”，进入即点亮
        { root: null, rootMargin: "-24% 0px -34% 0px", threshold: 0 }
      );

      Array.prototype.forEach.call(timelineItems, function (el) {
        timelineObserver.observe(el);
      });
    }
  }

  /* ---------- 3. 导航高亮当前区块 ---------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.site-nav a[href^="#"]')
  );

  if (navLinks.length && hasIO) {
    var sectionMap = [];

    navLinks.forEach(function (link) {
      var hash = link.getAttribute("href");
      if (hash.length < 2) return;
      var target = document.querySelector(hash);
      if (!target) return;
      sectionMap.push({ link: link, target: target });
      if (!target.id) target.id = hash.slice(1);
    });

    var setCurrent = function (activeLink) {
      navLinks.forEach(function (link) {
        link.classList.toggle("is-current", link === activeLink);
      });
    };

    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var hit = null;
          sectionMap.forEach(function (pair) {
            if (pair.target === entry.target) hit = pair.link;
          });
          if (hit) setCurrent(hit);
        });
      },
      { root: null, rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sectionMap.forEach(function (pair) {
      navObserver.observe(pair.target);
    });

    // 回到顶部时清空高亮
    window.addEventListener("scroll", function () {
      if (window.scrollY < 60) setCurrent(null);
    }, { passive: true });
  }

  /* ---------- 4. 锚点平滑滚动（兼容不支持 scroll-behavior 的环境） ---------- */
  if (!("scrollBehavior" in root.style) && !reduceMotion) {
    document.addEventListener("click", function (event) {
      var link = event.target.closest('a[href^="#"]');
      if (!link) return;
      var hash = link.getAttribute("href");
      if (hash.length < 2) return;
      var target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
})();
