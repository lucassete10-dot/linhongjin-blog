import { Link, useNavigate } from 'react-router-dom'
import { categories, type Category } from '@/data/posts'
import { NavSearch } from './NavSearch'

export function SiteNav() {
  const navigate = useNavigate()

  const goCategory = (category: Category) => {
    navigate(`/articles?cat=${encodeURIComponent(category)}`)
  }

  return (
    <nav className="sticky top-0 z-50 flex h-[74px] w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-8 backdrop-blur-xl max-md:h-[64px] max-md:px-4">
      <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap font-sans text-[17px] font-bold tracking-[-0.04em] text-slate-950">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-slate-950 text-[9px] font-bold tracking-[-0.02em] text-white">HM</span>
        <span>Help Myself</span>
      </Link>

      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-8 max-lg:hidden">
        <Link to="/" className="font-sans text-[13px] font-semibold text-slate-600 transition-colors hover:text-slate-950">首页</Link>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => goCategory(category)}
            className="cursor-pointer border-none bg-transparent font-sans text-[13px] font-semibold text-slate-600 transition-colors hover:text-slate-950"
          >
            {category}
          </button>
        ))}
        <Link to="/about" className="font-sans text-[13px] font-semibold text-slate-600 transition-colors hover:text-slate-950">关于</Link>
      </div>

      <NavSearch />
    </nav>
  )
}
