import { useEffect, useRef, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Github,
  Rss,
  Search,
  X,
} from "lucide-react";
import { posts, categories, type Post } from "./data/posts";
import { ExplorerDrawing, Spark } from "./components/ExplorerDrawing";
import { ProjectShowcase } from "./components/ProjectShowcase";
import { MarkdownContent } from "./components/MarkdownContent";

const PROFILE = "https://github.com/lucassete10-dot";
const published = posts.filter((post) => !post.sample);
const sections = [
  { id: "projects", label: "项目" },
  { id: "writing", label: "文章" },
  { id: "about", label: "关于我" },
  { id: "contact", label: "交流" },
];
declare global {
  interface Window {
    goatcounter?: { count?: (opts: { path: string }) => void };
  }
}

function PageEffects() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    const section = new URLSearchParams(search).get("section");
    if (
      pathname === "/" &&
      section &&
      sections.some((item) => item.id === section)
    ) {
      const timer = setTimeout(
        () =>
          document
            .getElementById(section)
            ?.scrollIntoView({
              behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "instant"
                : "smooth",
            }),
        50,
      );
      return () => clearTimeout(timer);
    }
  }, [pathname, search]);
  useEffect(() => {
    if (!new URLSearchParams(search).get("section"))
      window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  useEffect(() => {
    const post = pathname.startsWith("/post/")
      ? posts.find((p) => p.slug === pathname.slice(6))
      : undefined;
    const label =
      post?.title ||
      (pathname === "/articles"
        ? "所有文章"
        : pathname === "/about"
          ? "关于我"
          : "学习、创造与记录");
    document.title = `${label} · 林泓锦 / Lin`;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute(
      "content",
      post?.excerpt ||
        "林泓锦的个人博客。在学习中创造，在创造中记录。分享 AI、编程、开源项目与日常思考。",
    );
    window.goatcounter?.count?.({ path: pathname + search });
  }, [pathname, search]);
  return null;
}

function SearchDialog({ open, close }: { open: boolean; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (open) {
      setQuery("");
      dialog.current?.showModal();
    } else dialog.current?.close();
  }, [open]);
  const found = published.filter((p) =>
    `${p.title} ${p.excerpt} ${p.tags.join(" ")} ${p.markdown}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  return (
    <dialog
      ref={dialog}
      className="search-dialog"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClose={() => {
        // A queued close event may arrive after the dialog has reopened.
        if (!dialog.current?.open) close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      aria-labelledby="search-title"
    >
      <div className="search-surface">
        <div className="search-top">
          <h2 id="search-title">找一篇笔记</h2>
          <button className="icon-button" onClick={close} aria-label="关闭搜索">
            <X size={20} />
          </button>
        </div>
        <label className="search-field">
          <Search size={20} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索标题、标签或正文…"
            aria-label="搜索文章"
          />
          <kbd>ESC</kbd>
        </label>
        <p className="micro search-count">
          {query ? `${found.length} 篇相关笔记` : "从这些笔记开始"}
        </p>
        <div className="search-results">
          {found.map((p) => (
            <button
              key={p.slug}
              onClick={() => {
                close();
                navigate(`/post/${p.slug}`);
              }}
            >
              <span>{p.title}</span>
              <ArrowUpRight size={18} />
              <small>
                {p.date} · {p.category}
              </small>
            </button>
          ))}
        </div>
        {!found.length && (
          <p className="empty-search">
            暂时没找到，换个关键词试试。
            <br />
            <span>可以试试「Codex」或「学习」。</span>
          </p>
        )}
      </div>
    </dialog>
  );
}

function Header({ onSearch }: { onSearch: () => void }) {
  return (
    <header className="site-header shell">
      <Link to="/" className="wordmark" aria-label="Lin 首页">
        <span className="status-dot" /> LIN
        <span className="wordmark-year">26</span>
      </Link>
      <div className="header-actions">
        <Link to="/articles" className="header-writing">
          所有文章
        </Link>
        <button
          className="icon-button"
          onClick={onSearch}
          aria-label="打开搜索"
        >
          <Search size={18} />
        </button>
        <a
          className="github-link"
          href={PROFILE}
          target="_blank"
          rel="noreferrer"
        >
          <Github size={16} />
          <span>github.com/lucassete10-dot</span>
          <ArrowUpRight size={13} />
        </a>
      </div>
    </header>
  );
}

function Progress() {
  const [progress, setProgress] = useState(0);
  const { pathname } = useLocation();
  useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - innerHeight;
      setProgress(
        total > 0 ? Math.min(100, Math.round((scrollY / total) * 100)) : 0,
      );
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, [pathname]);
  return (
    <div className="reading-progress" aria-hidden="true">
      <div className="progress-track">
        <span style={{ transform: `scaleY(${progress / 100})` }} />
      </div>
      <span>{String(progress).padStart(2, "0")}</span>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero shell" aria-labelledby="hero-title">
      <div className="hero-main">
        <p className="eyebrow hero-eyebrow">
          <span /> A PERSONAL SPACE ON THE INTERNET
        </p>
        <h1 id="hero-title">
          Lin<span className="hero-period">.</span>
          <br />
          builds
          <br />
          <span className="hero-last">
            & shares<span className="hero-period">.</span>
          </span>
        </h1>
        <div className="hero-drawing">
          <ExplorerDrawing />
          <span className="handwritten drawing-caption">
            always a work in progress ↗
          </span>
        </div>
        <div className="hero-intro">
          <strong>林 泓 锦</strong>
          <span>LEARN / BUILD / SHARE</span>
        </div>
        <p className="hero-description">把好奇心写进代码，也写进生活。</p>
      </div>
      <div className="hero-bottom">
        <Link to="/?section=projects" className="scroll-link">
          <ArrowDown size={17} /> 往下逛逛
        </Link>
        <span className="micro hero-footnote">
          一点想法，一点动手。
          <br />
          还有一些未完成的可能。
        </span>
      </div>
    </section>
  );
}

function SectionNav() {
  const [active, setActive] = useState("projects");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-18% 0px -56% 0px", threshold: 0 },
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return (
    <nav className="section-nav" aria-label="首页内容导航">
      {sections.map((s) => (
        <Link
          className={active === s.id ? "active" : ""}
          key={s.id}
          to={`/?section=${s.id}`}
          aria-current={active === s.id ? "location" : undefined}
        >
          {s.label}
        </Link>
      ))}
      <span className="nav-star" aria-hidden="true">
        ✳
      </span>
    </nav>
  );
}

function SectionLabel({
  number,
  title,
  english,
}: {
  number: string;
  title: string;
  english: string;
}) {
  return (
    <div className="section-label">
      <span>
        {number} / {english}
      </span>
      <span>{title}</span>
    </div>
  );
}

function PostRow({ post, number }: { post: Post; number: number }) {
  return (
    <Link to={`/post/${post.slug}`} className="post-row">
      <div className="post-date">
        <span>{post.date.replace(/-/g, ".")}</span>
        <small>
          {post.category} / {post.readTime}
        </small>
      </div>
      <div className="post-row-main">
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
      </div>
      <ArrowUpRight className="post-arrow" size={22} />
      <span className="row-number">{String(number + 1).padStart(2, "0")}</span>
    </Link>
  );
}

function Writing() {
  return (
    <section id="writing" className="writing-section anchored">
      <SectionLabel number="02" title="边做边记" english="FIELD NOTES" />
      <div className="section-heading">
        <h2>
          写下来，
          <br />
          <span className="soft-heading">才算真的想过。</span>
        </h2>
        <Spark />
      </div>
      <div className="post-list">
        {published.slice(0, 4).map((post, i) => (
          <PostRow key={post.slug} post={post} number={i} />
        ))}
      </div>
      <Link className="text-link all-posts" to="/articles">
        所有文章 <span className="count-pill">{published.length}</span>
        <ArrowRight size={17} />
      </Link>
    </section>
  );
}

function AboutSection({ standalone = false }: { standalone?: boolean }) {
  return (
    <section
      id="about"
      className={`about-section anchored ${standalone ? "standalone-about" : ""}`}
    >
      <SectionLabel number="03" title="不止代码" english="THE PERSON BEHIND" />
      <div className="about-grid">
        <div className="about-note">
          <span className="note-pin" />
          <p className="micro">NOTE TO SELF</p>
          <p className="handwritten">
            保持好奇，
            <br />
            慢慢来，
            <br />
            也认真做。
          </p>
          <div className="note-signature">
            Lin <span>✳</span>
          </div>
        </div>
        <div className="about-copy">
          <h2>
            你好，我是<span className="highlight">林泓锦</span>。
          </h2>
          <p>喜欢把「如果能这样就好了」，变成一个真的能用的小东西。</p>
          <p>
            这里是我的个人空间。记录 AI
            和编程的实践，也收集学习、生活里值得停下来想一想的事。不急着给每个问题一个答案，先动手，再慢慢想明白。
          </p>
          <div className="interest-tags">
            <span>AI & 编程</span>
            <span>开源项目</span>
            <span>学习方法</span>
            <span>日常记录</span>
          </div>
          <a
            className="text-link"
            href={PROFILE}
            target="_blank"
            rel="noreferrer"
          >
            去 GitHub 看看我在做什么 <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText("https://linhongjin.top");
      setCopied(true);
      setCopyError(false);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopyError(true);
    }
  };
  return (
    <section id="contact" className="contact-section anchored">
      <SectionLabel number="04" title="保持联络" english="SAY HELLO" />
      <div className="contact-main">
        <h2>
          有意思的事，
          <br />
          可以一起聊聊<span className="yellow-dot">。</span>
        </h2>
        <span className="contact-flower" aria-hidden="true">
          ✳
        </span>
      </div>
      <p>关于代码、学习，或者一个还没成形的想法。</p>
      <div className="contact-links">
        <a
          href={`${PROFILE}/linhongjin-blog/discussions`}
          target="_blank"
          rel="noreferrer"
        >
          <Github size={18} /> GitHub 交流 <ArrowUpRight size={15} />
        </a>
        <a href="/feed.xml">
          <Rss size={18} /> RSS 订阅 <ArrowUpRight size={15} />
        </a>
        <button onClick={copy}>
          {copied ? <Check size={18} /> : <Copy size={18} />}
          <span aria-live="polite">
            {copied ? "链接已复制" : "分享这个小站"}
          </span>
        </button>
      </div>
      {copyError && (
        <p className="copy-fallback" role="status">
          网站地址：https://linhongjin.top，可直接选中复制。
        </p>
      )}
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer shell">
      <Link to="/" className="footer-logo">
        Lin<span>.</span>
      </Link>
      <div>
        <p>保持好奇，持续创造。</p>
        <span>© {new Date().getFullYear()} 林泓锦 · linhongjin.top</span>
      </div>
      <button
        className="back-top"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "instant"
              : "smooth",
          })
        }
        aria-label="回到顶部"
      >
        <ArrowUpRight size={20} />
      </button>
    </footer>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <div className="shell home-content">
        <SectionNav />
        <section id="projects" className="projects-section anchored">
          <SectionLabel
            number="01"
            title="一些动手的结果"
            english="SELECTED PROJECTS"
          />
          <ProjectShowcase />
          <a
            className="text-link projects-more"
            href={`${PROFILE}?tab=repositories`}
            target="_blank"
            rel="noreferrer"
          >
            更多小实验，都在 GitHub <ArrowUpRight size={16} />
          </a>
        </section>
        <Writing />
        <AboutSection />
        <Contact />
      </div>
    </>
  );
}

function ArticleIndex() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const category = params.get("cat") || "全部";
  const filtered = published.filter(
    (p) =>
      (category === "全部" || p.category === category) &&
      `${p.title} ${p.excerpt} ${p.tags.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== "全部") next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  return (
    <section className="shell archive-page">
      <Link className="text-link" to="/">
        <ArrowLeft size={16} /> 回到首页
      </Link>
      <p className="eyebrow">THE NOTEBOOK</p>
      <h1>
        所有文章<span className="yellow-dot">。</span>
      </h1>
      <p className="page-description">实践、观察，还有那些正在想明白的事。</p>
      <div className="archive-tools">
        <div className="filters" aria-label="文章分类">
          {["全部", ...categories].map((cat) => (
            <button
              key={cat}
              aria-pressed={category === cat}
              onClick={() => update("cat", cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <label className="archive-search">
          <Search size={17} />
          <input
            aria-label="筛选文章"
            placeholder="找点什么…"
            value={query}
            onChange={(e) => update("q", e.target.value)}
          />
        </label>
      </div>
      <div className="archive-count micro">{filtered.length} 篇笔记</div>
      <div className="post-list">
        {filtered.map((post, i) => (
          <PostRow key={post.slug} post={post} number={i} />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <Spark />
          <h2>{query ? "还没有找到这篇笔记。" : "这一页，留给下一次记录。"}</h2>
          <p>
            {query
              ? "换个关键词，或者看看全部文章。"
              : "有些故事正在发生，写好了就放在这里。"}
          </p>
          <button className="text-link" onClick={() => setParams({})}>
            查看全部文章 <ArrowRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}

function ArticlePage() {
  const { pathname } = useLocation();
  const post = posts.find((p) => p.slug === pathname.slice("/post/".length));
  const [copied, setCopied] = useState(false);
  const next = post ? published.find((p) => p.slug !== post.slug) : undefined;
  useEffect(() => {
    setCopied(false);
  }, [pathname]);
  if (!post) return <NotFound />;
  const headings = [...post.markdown.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  return (
    <article className="article-shell">
      <Link to="/articles" className="text-link article-back">
        <ArrowLeft size={16} /> 所有文章
      </Link>
      <header className="article-header">
        <p className="eyebrow">
          {post.category} / {post.kind}
        </p>
        {post.sample && (
          <p className="sample-notice">旧版示例文章 · 非博主真实经历</p>
        )}
        <h1>{post.title}</h1>
        <div className="article-meta">
          <span>林泓锦</span>
          <time dateTime={post.date}>{post.date.replace(/-/g, ".")}</time>
          <span>{post.readTime}</span>
        </div>
        <p className="article-lead">{post.excerpt}</p>
        <div className="article-tags">
          {post.tags.map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </div>
      </header>
      {headings.length > 0 && (
        <details className="article-toc">
          <summary>
            这篇文章里有什么 <span>{headings.length}</span>
          </summary>
          <ol>
            {headings.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ol>
        </details>
      )}
      <div className="article-prose">
        <MarkdownContent markdown={post.markdown} />
      </div>
      <div className="article-end">
        <Spark />
        <span>写到这里，下一次再见。</span>
      </div>
      <div className="article-actions">
        <Link className="text-link" to="/articles">
          <ArrowLeft size={16} /> 继续读点什么
        </Link>
        <button
          className="text-link"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                `https://linhongjin.top/#/post/${post.slug}`,
              );
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span aria-live="polite">
            {copied ? "文章链接已复制" : "复制文章链接"}
          </span>
        </button>
      </div>
      {next && (
        <Link className="next-article" to={`/post/${next.slug}`}>
          <span className="micro">NEXT NOTE / 下一篇</span>
          <strong>{next.title}</strong>
          <ArrowUpRight size={25} />
        </Link>
      )}
    </article>
  );
}

function NotFound() {
  return (
    <section className="shell not-found">
      <span className="micro">404 / A LITTLE DETOUR</span>
      <h1>
        好像走到
        <br />
        空白页了<span className="yellow-dot">。</span>
      </h1>
      <p>这篇内容可能还没写好，先回去逛逛吧。</p>
      <Link className="text-link" to="/">
        回到首页 <ArrowRight size={18} />
      </Link>
    </section>
  );
}

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    addEventListener("keydown", listener);
    return () => removeEventListener("keydown", listener);
  }, []);
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        跳到主要内容
      </a>
      <PageEffects />
      <Header onSearch={() => setSearchOpen(true)} />
      <Progress />
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles" element={<ArticleIndex />} />
          <Route
            path="/about"
            element={
              <div className="shell">
                <AboutSection standalone />
                <Contact />
              </div>
            }
          />
          <Route path="/post/:slug" element={<ArticlePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <SearchDialog open={searchOpen} close={() => setSearchOpen(false)} />
    </>
  );
}
