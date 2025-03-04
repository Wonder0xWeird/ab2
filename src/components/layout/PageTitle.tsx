import { headers } from 'next/headers';
import { Title } from './Title';
import { parseSubdomain, getTitleConfigForSubdomain } from '../../utils/subdomain';

export async function PageTitle({ className = '' }: { className?: string }) {
  // This code runs on the server
  const headersList = await headers();
  const hostname = headersList.get('host') || '';

  // Get subdomain from hostname
  const subdomain = parseSubdomain(hostname);

  // Get title config based on subdomain
  const titleConfig = getTitleConfigForSubdomain(subdomain);

  // Pass the title config to the client component
  return <Title titleConfig={titleConfig} className={className} />;
} 