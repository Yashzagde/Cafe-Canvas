'use client'

export function AboutSection({
  title, text, imageUrl
}: {
  title: string | null; text: string | null; imageUrl: string | null
}) {
  if (!title && !text) return null

  return (
    <section id="about" className="py-16 px-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold text-gray-850 tracking-tight leading-tight">
            {title || 'Our Story'}
          </h2>
          <div className="w-12 h-1 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
          <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
            {text || 'Welcome to our store. We brew happiness in every cup and bake delight in every bite.'}
          </p>
        </div>

        {imageUrl && (
          <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg border border-gray-100">
            <img
              src={imageUrl}
              alt={title || 'Our Story'}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
      </div>
    </section>
  )
}
