import { Link, useNavigate } from 'react-router-dom'
import { categories, type Category } from '@/data/posts'
import { NavSearch } from './NavSearch'

function NavButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer border-none bg-transparent font-sans text-[15px] font-medium uppercase tracking-[0.04em] text-wandor-text transition-opacity hover:opacity-55"
    >
      {label}
    </button>
  )
}

export function SiteNav() {
  const navigate = useNavigate()

  const scrollJournal = () => {
    window.setTimeout(() => document.getElementById('journal')?.scrollIntoView({ behavior: 'smooth' }), 90)
  }

  const goCategory = (category: Category) => {
    navigate(`/articles?cat=${encodeURIComponent(category)}`)
    scrollJournal()
  }

  const goJournal = () => {
    navigate('/articles')
    scrollJournal()
  }

  return (
    <nav className="relative z-10 mx-auto flex max-w-[1360px] items-center justify-between px-20 pb-4 pt-6 max-md:px-6 max-md:pt-5">
      <Link
        to="/"
        className="select-none whitespace-nowrap font-display text-[40px] leading-none text-black max-md:text-[26px]"
      >
        wandor
      </Link>
      <div className="absolute left-1/2 flex -translate-x-1/2 gap-8 max-md:hidden">
        {categories.map((category) => (
          <NavButton key={category} label={category} onClick={() => goCategory(category)} />
        ))}
        <NavButton label="关于" onClick={() => navigate('/about')} />
      </div>
      <div className="flex items-center gap-3">
        <NavSearch />
        <button
          type="button"
          onClick={goJournal}
          className="cursor-pointer whitespace-nowrap rounded-full border-none bg-wandor-dark px-5 py-3.5 font-sans text-[15px] font-medium uppercase tracking-[0.04em] text-[#fafafa] transition-all hover:bg-[#333] active:scale-95 max-md:px-4 max-md:py-2.5 max-md:text-[13px]"
        >
          开始阅读
        </button>
      </div>
    </nav>
  )
}
