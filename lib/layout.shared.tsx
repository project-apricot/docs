import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { LogoMark } from '@/components/logo';
import { GITHUB_URL } from '@/lib/libraries';

export { GITHUB_URL };

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <LogoMark className="size-5 rounded-[3px]" />
          <span className="font-semibold">Apricot Framework</span>
        </>
      ),
    },
    githubUrl: GITHUB_URL,
  };
}
