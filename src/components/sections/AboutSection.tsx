import { Users, Calendar, Trophy } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Unsere Community',
    description: 'Wir sind eine lockere, aber ambitionierte Gilde auf [Server]. Bei uns steht der Spaß im Vordergrund, aber wenn es darauf ankommt, geben wir alles für den Progress!'
  },
  {
    icon: Calendar,
    title: 'Raid-Zeiten',
    description: 'Mittwoch & Sonntag, 20:00-23:00 Uhr. Perfekt für Berufstätige und Studenten. Optional gibt es Donnerstags noch Alt-Runs und M+ Abende.'
  },
  {
    icon: Trophy,
    title: 'Erfolge',
    description: 'Cutting Edge in mehreren Tiers, zahlreiche Server-First Kills und die legendärsten Wipes, die Azeroth je gesehen hat!'
  }
]

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white font-serif">
          Über unsere Gilde
        </h2>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gray-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-red-600 hover:bg-gray-750"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-red-900/30 rounded-full mb-6 mx-auto">
                <feature.icon className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 text-center">
                {feature.title}
              </h3>
              <p className="text-gray-300 text-center leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Guild Story */}
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Unsere Geschichte
          </h3>
          <div className="prose prose-lg mx-auto text-gray-300">
            <p className="mb-4">
              Gegründet wurde "Desperate Hordewipes" im Jahr 2019 von einer Gruppe frustrierter Raiders, 
              die genug von toxischen Gilden hatten. Unser Motto: "Lieber zusammen wipen als allein siegen!"
            </p>
            <p>
              Was als Joke-Gilde begann, entwickelte sich schnell zu einer der respektiertesten Gilden auf dem Server. 
              Unsere Mischung aus Humor, Zusammenhalt und Ehrgeiz hat uns durch dick und dünn gebracht - 
              von den ersten heroischen Kills bis zu aktuellen Mythic-Progressionen.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
