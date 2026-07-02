import SummaryCard from './SummaryCard'

export default function DashboardSection({ title, cards }) {
  if (!cards?.length) return null
  return (
    <section>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map(card => <SummaryCard key={card.key} vm={card} />)}
      </div>
    </section>
  )
}
