import type {LinksFunction, MetaFunction} from '@remix-run/cloudflare'
import {ClientOnly} from 'remix-utils'
import {Studio} from 'sanity'

import studio from '~/styles/studio.css'

import {config} from '../../sanity.config'

export const meta: MetaFunction = () => [
  {title: 'Sanity Studio'},
  {name: 'robots', content: 'noindex'},
]

export const links: LinksFunction = () => {
  return [{rel: 'stylesheet', href: studio}]
}

export default function StudioPage() {
  return (
    <ClientOnly>
      {() => (
        <Studio
          config={config}
          // To enable guests view-only access to your Studio,
          // uncomment this line!
          // unstable_noAuthBoundary
        />
      )}
    </ClientOnly>
  )
}
