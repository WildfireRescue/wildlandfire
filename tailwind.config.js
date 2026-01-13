import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--body-text)',
            '--tw-prose-headings': 'var(--heading)',
            '--tw-prose-links': theme('colors.orange[500]'),
            '--tw-prose-bold': 'var(--heading)',
            '--tw-prose-counters': 'var(--body-text-muted)',
            '--tw-prose-bullets': 'var(--body-text-muted)',
            '--tw-prose-hr': 'var(--border)',
            '--tw-prose-quotes': 'var(--body-text)',
            '--tw-prose-quote-borders': theme('colors.orange[500]'),
            '--tw-prose-captions': 'var(--body-text-muted)',
            '--tw-prose-code': theme('colors.orange[300]'),
            '--tw-prose-pre-code': theme('colors.stone[200]'),
            '--tw-prose-pre-bg': theme('colors.stone[900]'),
            '--tw-prose-th-borders': 'var(--border)',
            '--tw-prose-td-borders': 'var(--border)',
            
            color: 'var(--body-text)',
            maxWidth: 'none',
            fontSize: '1.0625rem',
            lineHeight: '1.75',
            
            h1: {
              color: 'var(--heading)',
              fontWeight: '700',
              fontSize: '2.25em',
              marginTop: '0',
              marginBottom: '0.8888889em',
              lineHeight: '1.1111111',
            },
            h2: {
              color: 'var(--heading)',
              fontWeight: '600',
              fontSize: '1.875em',
              marginTop: '1.5em',
              marginBottom: '1em',
              lineHeight: '1.3333333',
            },
            h3: {
              color: 'var(--heading)',
              fontWeight: '600',
              fontSize: '1.5em',
              marginTop: '1.6em',
              marginBottom: '0.6em',
              lineHeight: '1.6',
            },
            h4: {
              color: 'var(--heading)',
              fontWeight: '600',
              fontSize: '1.25em',
              marginTop: '1.5em',
              marginBottom: '0.5em',
              lineHeight: '1.5',
            },
            a: {
              color: theme('colors.orange[500]'),
              textDecoration: 'underline',
              fontWeight: '500',
              '&:hover': {
                color: theme('colors.orange[400]'),
              },
            },
            strong: {
              color: 'var(--heading)',
              fontWeight: '600',
            },
            blockquote: {
              fontWeight: '400',
              fontStyle: 'italic',
              color: 'var(--body-text)',
              borderLeftWidth: '0.25rem',
              borderLeftColor: theme('colors.orange[500]'),
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
              marginTop: '1.6em',
              marginBottom: '1.6em',
              paddingLeft: '1em',
            },
            code: {
              color: theme('colors.orange[300]'),
              fontWeight: '600',
              fontSize: '0.875em',
              '&::before': {
                content: '"`"',
              },
              '&::after': {
                content: '"`"',
              },
            },
            'code::before': {
              content: '"`"',
            },
            'code::after': {
              content: '"`"',
            },
            pre: {
              backgroundColor: theme('colors.stone[900]'),
              color: theme('colors.stone[200]'),
              fontSize: '0.875em',
              lineHeight: '1.7142857',
              marginTop: '1.7142857em',
              marginBottom: '1.7142857em',
              borderRadius: theme('borderRadius.lg'),
              paddingTop: '0.8571429em',
              paddingRight: '1.1428571em',
              paddingBottom: '0.8571429em',
              paddingLeft: '1.1428571em',
            },
            'pre code': {
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: '0',
              padding: '0',
              fontWeight: '400',
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              lineHeight: 'inherit',
              '&::before': {
                content: 'none',
              },
              '&::after': {
                content: 'none',
              },
            },
            ul: {
              listStyleType: 'disc',
              marginTop: '1.25em',
              marginBottom: '1.25em',
              paddingLeft: '1.625em',
            },
            ol: {
              listStyleType: 'decimal',
              marginTop: '1.25em',
              marginBottom: '1.25em',
              paddingLeft: '1.625em',
            },
            li: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            'ul > li': {
              paddingLeft: '0.375em',
            },
            'ol > li': {
              paddingLeft: '0.375em',
            },
            img: {
              marginTop: '2em',
              marginBottom: '2em',
              borderRadius: theme('borderRadius.lg'),
            },
            hr: {
              borderColor: 'var(--border)',
              borderTopWidth: 1,
              marginTop: '3em',
              marginBottom: '3em',
            },
            p: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};
