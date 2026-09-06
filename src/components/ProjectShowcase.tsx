import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  FileText,
  MessageSquare,
  Plus,
  Terminal,
  Zap,
} from "lucide-react";

function NotesDemo() {
  const [tab, setTab] = useState<"note" | "chat">("note");
  return (
    <div className="notes-demo">
      <div className="demo-window-bar">
        <span className="window-dots">
          <i />
          <i />
          <i />
        </span>
        <span>我的思考空间</span>
        <span>↗</span>
      </div>
      <div className="notes-layout">
        <div className="notes-sidebar">
          <span>WORKSPACE</span>
          <button aria-pressed={tab === "note"} onClick={() => setTab("note")}>
            <FileText size={13} /> 灵感笔记
          </button>
          <button aria-pressed={tab === "chat"} onClick={() => setTab("chat")}>
            <MessageSquare size={13} /> 和 AI 聊聊
          </button>
          <span className="sidebar-line" />
          <small>从一条笔记开始。</small>
        </div>
        <div className="notes-content" aria-live="polite">
          {tab === "note" ? (
            <>
              <small>今天 / 一个小想法</small>
              <h4>
                让想法，
                <br />
                留在笔记里<span>。</span>
              </h4>
              <p>记录 → 思考 → 动手</p>
              <div className="note-check">
                <Check size={12} /> 整理今天的灵感
              </div>
              <div className="note-check">
                <span className="tiny-square" /> 接着往前走一步
              </div>
              <span className="purple-caret" />
            </>
          ) : (
            <>
              <small>CODEX / 对话示意</small>
              <p className="demo-chat-question">帮我把这个想法拆成第一步。</p>
              <p className="demo-chat-answer">
                先选一个最小的问题。
                <br />
                <br />
                做出能看见的结果，再决定下一步。
              </p>
              <span className="chat-ready">
                <span /> 想法有了新方向
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FitnessDemo() {
  const [day, setDay] = useState(0);
  const [sets, setSets] = useState([0, 0, 0]);
  const names = ["推 / PUSH", "拉 / PULL", "腿 / LEGS"];
  const moves = ["杠铃卧推", "高位下拉", "杠铃深蹲"];
  return (
    <div className="fitness-demo">
      <div className="fitness-top">
        <span className="fitness-brand">
          PPL<span>↗</span>
        </span>
        <span className="micro">一点点，变强。</span>
      </div>
      <div className="fitness-days">
        {names.map((name, i) => (
          <button key={name} aria-pressed={day === i} onClick={() => setDay(i)}>
            {name}
          </button>
        ))}
      </div>
      <div className="exercise">
        <div>
          <small>今日动作</small>
          <h4>{moves[day]}</h4>
        </div>
        <strong>
          {sets[day]}
          <span> / 4 组</span>
        </strong>
      </div>
      <div className="set-dots" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i < sets[day] ? "done" : ""}>
            {i < sets[day] ? <Check size={15} /> : `0${i + 1}`}
          </span>
        ))}
      </div>
      <button
        className="record-set"
        onClick={() =>
          setSets(sets.map((n, i) => (i === day ? (n + 1) % 5 : n)))
        }
      >
        {sets[day] === 4 ? <Check size={15} /> : <Plus size={15} />}
        <span aria-live="polite">
          {sets[day] === 4 ? "做得不错！点击重新体验" : "试记一组"}
        </span>
      </button>
    </div>
  );
}

function VisionDemo() {
  const [position, setPosition] = useState(48);
  return (
    <div className="vision-demo">
      <div className="vision-title">
        <Terminal size={14} />
        <span>K230 / VISION LAB</span>
        <span className="vision-live">交互示意</span>
      </div>
      <div className="vision-screen">
        <div className="vision-cross horizontal" />
        <div className="vision-cross vertical" />
        <svg viewBox="0 0 330 140" aria-hidden="true">
          <path
            d="M0 100Q40 20 90 65T190 70T280 70T330 65"
            fill="none"
            stroke="#ccc"
            strokeWidth="1"
            strokeDasharray="4 5"
          />
        </svg>
        <div
          className="vision-target"
          style={{
            left: `${position}%`,
            top: `${45 + Math.sin(position / 12) * 13}%`,
          }}
        >
          <span />
          <i />
          <b>TARGET</b>
        </div>
        <span className="vision-coordinate">
          X {String(Math.round(position * 3.2)).padStart(3, "0")} : Y 120
        </span>
      </div>
      <label className="vision-control">
        <span>移动目标</span>
        <input
          aria-label="视觉实验目标位置"
          type="range"
          min="15"
          max="85"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
        />
        <ArrowUpRight size={15} />
      </label>
    </div>
  );
}

const projects = [
  {
    name: "Codexian",
    tag: "AI × NOTES",
    icon: "✳",
    className: "codexian-card",
    description:
      "让 Codex 住进 Obsidian。在熟悉的笔记空间里，把想法接着往下做。",
    url: "codexian",
    demo: <NotesDemo />,
  },
  {
    name: "PPL Fitness",
    tag: "LIFE × BUILD",
    icon: "↗",
    className: "fitness-card",
    description:
      "一个简单的力量训练记录工具。少一点操作，多一点对每次进步的关注。",
    url: "ppl-fitness",
    demo: <FitnessDemo />,
  },
  {
    name: "K230 视觉实验",
    tag: "CODE × HARDWARE",
    icon: "⌘",
    className: "vision-card",
    description:
      "让代码走出屏幕。关于机器视觉、图像处理，以及动手调试的小实验。",
    url: "K230_py",
    demo: <VisionDemo />,
  },
];

export function ProjectShowcase() {
  return (
    <div className="projects-list">
      {projects.map((p, i) => (
        <article className={`project-card ${p.className}`} key={p.name}>
          <div className="project-demo">
            <span className="demo-hint">
              <Zap size={10} /> 可以动手试试
            </span>
            {p.demo}
          </div>
          <div className="project-copy">
            <span className="micro project-tag">{p.tag}</span>
            <h2>
              <span className="project-icon" aria-hidden="true">
                {p.icon}
              </span>
              {p.name}
            </h2>
            <p>{p.description}</p>
            <a
              href={`https://github.com/lucassete10-dot/${p.url}`}
              target="_blank"
              rel="noreferrer"
            >
              查看项目 <ArrowUpRight size={16} />
            </a>
          </div>
          <span className="project-number" aria-hidden="true">
            0{i + 1}
          </span>
        </article>
      ))}
    </div>
  );
}
