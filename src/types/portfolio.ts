export interface SeoData {
  title: string;
  description: string; // max 160 chars (enforced by Zod)
  ogImage: string; // URL, min 1200×630 recommended
  siteUrl: string; // https://... base URL
}

export interface HeroData {
  headline: string[]; // words array, accentWord applied to matching word
  accentWord: string; // word in headline to colour red
  bio: string; // max 300 chars
  techStack: string[]; // displayed as ghost chips
  terminalCode: string; // code string typed out in TerminalWidget
}

export interface SocialLink {
  platform: string; // e.g. "GitHub", "LinkedIn", "Twitter"
  url: string; // must start with https://
}

export interface ProjectData {
  id: string; // unique slug
  title: string;
  description: string; // max 160 chars
  techStack: string[]; // displayed as ghost chips on card
  thumbnailUrl?: string; // optional image URL
  demoUrl?: string; // optional live demo link
  githubUrl?: string; // optional GitHub link
}

export interface ExperienceData {
  id: string; // unique slug
  company: string;
  role: string;
  startDate: string; // ISO format: "YYYY-MM" or "YYYY-MM-DD"
  endDate: string | 'Present'; // ISO format or literal "Present"
  bullets: string[]; // responsibility/achievement bullets
}

export interface ContactData {
  heading: string; // section heading, e.g. "Get In Touch"
}

export interface PortfolioData {
  name: string; // owner full name
  title: string; // professional title (used in meta/footer)
  hero: HeroData;
  skills: string[]; // flat list of skill names
  projects: ProjectData[];
  experience: ExperienceData[];
  socialLinks: SocialLink[];
  email: string; // contact email
  cvUrl: string; // https://... URL to CV PDF
  contact: ContactData;
  seo: SeoData;
}
