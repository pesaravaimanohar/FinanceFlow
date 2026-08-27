import { useState } from 'react'
import { Search, Calendar, X, Filter, SlidersHorizontal } from 'lucide-react'
import { DATE_FILTERS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../lib/constants'

export default function TransactionFilters({
  search, setSearch,
  dateFilter, setDateFilter,
  customDateRange, setCustomDateRange,
  selectedType, setSelectedType,
  selectedCategory, setSelectedCategory,
  selectedTags, setSelectedTags,
  allTags,
}) {
  const [showMore, setShowMore] = useState(false)

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="space-y-3">
      {/* Search + Date */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by note, category, amount..."
            className="input pl-9 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowMore(s => !s)}
          className={`btn-secondary text-sm px-3 ${showMore ? 'bg-indigo-900/30 text-indigo-300 border-indigo-800' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Date Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {DATE_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setDateFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              dateFilter === f.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      {dateFilter === 'custom' && (
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="label text-xs">From</label>
            <input
              type="date"
              value={customDateRange.start}
              onChange={e => setCustomDateRange(p => ({ ...p, start: e.target.value }))}
              className="input text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="label text-xs">To</label>
            <input
              type="date"
              value={customDateRange.end}
              onChange={e => setCustomDateRange(p => ({ ...p, end: e.target.value }))}
              className="input text-sm"
            />
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showMore && (
        <div className="card-sm space-y-3 animate-fade-in">
          {/* Type */}
          <div>
            <label className="label text-xs">Type</label>
            <div className="flex gap-2">
              {['all', 'expense', 'income'].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    selectedType === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="label text-xs">Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="input text-sm"
            >
              <option value="">All Categories</option>
              {[...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <label className="label text-xs">Filter by Tag</label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-indigo-300 border border-slate-700'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setSelectedType('all')
              setSelectedCategory('')
              setSelectedTags([])
              setSearch('')
              setDateFilter('month')
            }}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
