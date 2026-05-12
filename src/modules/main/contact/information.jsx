import ContactHero from './ContactHero'
import ContactInfo from './ContactInfo'
import ContactForm from './ContactForm'
import ContactMap from './ContactMap'

const Information = () => (
  <div className="min-h-screen bg-background">
    <ContactHero />

    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">
          <ContactInfo />
          <ContactMap />
          {/* <ContactForm /> */}
        </div>
      </div>
    </section>

    
  </div>
)

export default Information
