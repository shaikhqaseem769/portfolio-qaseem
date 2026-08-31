interface FooterProps {
  ownerName: string;
}

export default function Footer({ ownerName }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 py-8 text-center">
      <p className="text-white/50 font-mono text-xs">
        © {year} {ownerName}. All rights reserved.
      </p>
    </footer>
  );
}
