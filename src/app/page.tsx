import portfolioData from '@/data/portfolio.json';
import Nav from '@/components/Nav/Nav';
import HeroSection from '@/components/Hero/HeroSection';
import SkillsSection from '@/components/Skills/SkillsSection';
import ProjectsSection from '@/components/Projects/ProjectsSection';
import ExperienceSection from '@/components/Experience/ExperienceSection';
import ContactSection from '@/components/Contact/ContactSection';
import Footer from '@/components/Footer/Footer';

const sections = [
  { id: 'hero', label: 'Hero' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];

export default function Home() {
  return (
    <>
      <Nav ownerName={portfolioData.name} cvUrl={portfolioData.cvUrl} sections={sections} />
      <main className="max-w-content mx-auto pt-16">
        <section id="hero">
          <HeroSection data={portfolioData.hero} cvUrl={portfolioData.cvUrl} />
        </section>
        <section id="skills">
          <SkillsSection skills={portfolioData.skills} heading="Skills" />
        </section>
        <section id="projects">
          <ProjectsSection projects={portfolioData.projects} heading="Projects" />
        </section>
        <section id="experience">
          <ExperienceSection experience={portfolioData.experience} heading="Experience" />
        </section>
        <section id="contact">
          <ContactSection
            email={portfolioData.email}
            socialLinks={portfolioData.socialLinks}
            heading={portfolioData.contact.heading}
          />
        </section>
      </main>
      <Footer ownerName={portfolioData.name} />
    </>
  );
}
