import { WidgetSwitcher } from '@/app/components/widget/WidgetSwitcher';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VSL</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Voice Sonic Labs</span>
            </div>
            
            <div className="flex items-center gap-6">
            
              <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-all">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Now minimal for switcher */}
      <section className="pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          

          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            
          </div>
        </div>
      </section>

      {/* Widget Switcher */}
      <section className="pb-16">
        <WidgetSwitcher />
      </section>

    

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VSL</span>
              </div>
              <span className="text-xl font-bold">Voice Sonic Labs</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
             
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}