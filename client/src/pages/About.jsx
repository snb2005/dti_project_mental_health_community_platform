import Navbar from "../components/Navbar"
import { Users, BookOpen, Shield, Heart } from "lucide-react"

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-lighter/20 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12 mt-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-primary">About Us</h1>

          {/* Mission Statement */}
          <section className="mb-12 bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-semibold mb-4 text-primary-light">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              We are dedicated to creating a safer world by raising awareness and providing support for those affected
              by child abuse, domestic women abuse, and workplace harassment. Our platform serves as a comprehensive
              resource hub, combining education, community support, and immediate assistance for those in need.
            </p>
          </section>

          {/* Key Features */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-primary-light">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <FeatureCard
                icon={<BookOpen className="h-6 w-6" />}
                title="Educational Resources"
                description="Comprehensive guides and materials for understanding and preventing abuse."
              />
              <FeatureCard
                icon={<Users className="h-6 w-6" />}
                title="Community Support"
                description="A safe space for sharing experiences and finding support through our moderated forums."
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6" />}
                title="24/7 Assistance"
                description="Immediate support through our AI-powered chatbot and emergency contact information."
              />
              <FeatureCard
                icon={<Heart className="h-6 w-6" />}
                title="Expert Guidance"
                description="Access to professional resources and verified information from field experts."
              />
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-primary-light">Our Team</h2>
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
              <p className="text-gray-600 leading-relaxed mb-6">
                Our team is dedicated to creating a platform that empowers victims of abuse and their families. We combine expertise in mental health, legal guidance, education, and technology to provide accurate, accessible, and supportive resources. Together, we strive to ensure that individuals facing child abuse, domestic violence, or workplace harassment receive the help they need in a safe and informed environment.
              </p>
            </div>
          </section>

          {/* Privacy Commitment */}
          <section className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-primary-light">Our Commitment to Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              We prioritize user privacy and data protection, ensuring compliance with GDPR and other relevant data
              protection laws. All interactions on our platform are encrypted and handled with the utmost
              confidentiality. We believe that privacy is essential for creating a safe environment where users can seek
              help and support without fear.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center mb-4">
        <div className="p-3 bg-primary-lighter/20 rounded-full text-primary mr-4">{icon}</div>
        <h3 className="text-xl font-semibold text-primary">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function TeamMember({ name, role }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-primary-lighter/30 rounded-full mx-auto mb-3 flex items-center justify-center text-primary font-bold text-xl">
        {name.charAt(0)}
      </div>
      <h4 className="font-medium text-primary">{name}</h4>
      <p className="text-sm text-gray-500">{role}</p>
    </div>
  )
}

export default About

