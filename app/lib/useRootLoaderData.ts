import type {SerializeFrom} from '@remix-run/cloudflare'
import {useRouteLoaderData} from '@remix-run/react'

import type {loader as rootLoader} from '~/root'

export function useRootLoaderData() {
  const data = useRouteLoaderData(`root`) as SerializeFrom<typeof rootLoader>

  return data
}
