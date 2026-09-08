import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import TopBar from './TopBar'
import Footer from './Footer'

export default function Layout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-parchment-100">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav />
        <TopBar title={title} subtitle={subtitle} />
        <main className="px-6 md:px-10 pb-8 flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
