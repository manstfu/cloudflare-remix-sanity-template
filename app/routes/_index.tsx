import type {
  LinksFunction,
  LoaderFunctionArgs,
  SerializeFrom,
  MetaFunction,
} from '@remix-run/cloudflare'
import {json} from '@remix-run/cloudflare'
import {useLoaderData} from '@remix-run/react'
import groq from 'groq'

import {PreviewWrapper} from '~/components/PreviewWrapper'
import {Records} from '~/components/Records'
import {Title} from '~/components/Title'
import {deduplicateDrafts} from '~/lib/deduplicateDrafts'
import {getPreviewToken} from '~/lib/getPreviewToken'
import {useRootLoaderData} from '~/lib/useRootLoaderData'
import type {loader as rootLoader} from '~/root'
import {getClient} from '~/sanity/client'
import tailwind from '~/tailwind.css'
import {recordStubsZ} from '~/types/record'

export const links: LinksFunction = () => {
  return [{rel: 'stylesheet', href: tailwind}]
}

export const meta: MetaFunction = ({matches}) => {
  const rootData = matches.find((match) => match.id === `root`) as
    | {data: SerializeFrom<typeof rootLoader>}
    | undefined

  const home = rootData ? rootData.data.home : null
  const title = [home?.title, home?.siteTitle].filter(Boolean).join(' | ')

  return [{title}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {preview} = await getPreviewToken(request)
  const query = groq`*[_type == "record"][0...12]|order(title asc){
    _id,
    _type,
    title,
    "slug": slug.current,
    "artist": artist->title,
    image
  }`

  const records = await getClient(preview)
    .fetch(query)
    .then((res) => (res ? recordStubsZ.parse(res) : null))

  const recordsDeduped =
    records?.length && preview
      ? recordStubsZ.parse(deduplicateDrafts(records))
      : records

  if (!records) {
    throw new Response('Not found', {status: 404})
  }

  return json({
    records: recordsDeduped,
    query: preview ? query : null,
    params: preview ? {} : null,
  })
}

export default function Index() {
  const {records = [], query, params}:any = useLoaderData<typeof loader>()
  const {home, query: homeQuery, params: homeParams}:any = useRootLoaderData()

  return (
    <div className="grid grid-cols-1 gap-6 md:gap-12">
      <PreviewWrapper
        data={home}
        render={(data) => (data?.title ? <Title>{data.title}</Title> : null)}
        query={homeQuery}
        params={homeParams}
      />
      <PreviewWrapper
        data={records}
        render={(data) => <Records records={data ?? []} />}
        query={query}
        params={params}
      />
    </div>
  )
}
