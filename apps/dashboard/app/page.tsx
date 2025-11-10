export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            WCAG AI Compliance Consultant
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered web accessibility compliance platform for automated WCAG scanning and reporting
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Quick Scan
            </h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200"
              >
                Start Scan
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🎯 Accurate Detection
              </h3>
              <p className="text-gray-600 text-sm">
                Powered by axe-core 4.8 with confidence scoring
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🚀 Fast Scanning
              </h3>
              <p className="text-gray-600 text-sm">
                Puppeteer 22 for rapid browser automation
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                📊 Detailed Reports
              </h3>
              <p className="text-gray-600 text-sm">
                Comprehensive WCAG 2.2 compliance analysis
              </p>
            </div>
          </div>
        </main>

        <footer className="text-center mt-16 text-gray-600">
          <p>WCAG AI Platform MVP • Built with Next.js 15 & React 19</p>
        </footer>
      </div>
    </div>
  );
}
