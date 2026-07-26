import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

/* 右上角的站内搜索：提交后跳到首页文章区并带上 ?q= */
export function NavSearch() {
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const query = value.trim()
    navigate(query ? `/articles?q=${encodeURIComponent(query)}` : '/articles')
    window.setTimeout(() => document.getElementById('journal')?.scrollIntoView({ behavior: 'smooth' }), 120)
  }

  return (
    <form
      onSubmit={submit}
      className="flex h-11 items-center gap-1.5 rounded-full border border-[#d8c9a6] bg-white/70 pl-4 pr-1.5 backdrop-blur-sm max-md:hidden"
    >
      <span className="text-[18px] leading-none text-wandor-muted" aria-hidden="true">
        ⌕
      </span>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="搜索文章…"
        aria-label="搜索文章"
        className="w-[110px] border-none bg-transparent font-sans text-[14px] text-wandor-text outline-none transition-all placeholder:text-wandor-muted/70 focus:w-[168px]"
      />
      <button
        type="submit"
        className="h-8 cursor-pointer rounded-full border-none bg-wandor-dark px-3.5 font-sans text-[12px] font-medium text-[#fafafa] transition-colors hover:bg-[#333]"
      >
        搜索
      </button>
    </form>
  )
}
