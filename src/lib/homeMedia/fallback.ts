import type { HomeMedia } from '@/lib/homeMedia/types'

export const fallbackHomeMedia: HomeMedia = {
  watchingItems: [
    {
      accent: 'green',
      currentEpisode: {
        description:
          'The team is sent on an unsettling winter retreat where old loyalties and new suspicions begin to surface.',
        number: 4,
        title: 'Woe’s Hollow',
      },
      id: 'severance',
      kind: 'series',
      nextEpisode: {
        description:
          'Tensions follow the team back to Lumon as the consequences of the retreat begin to settle in.',
        number: 5,
        title: 'Trojan’s Horse',
      },
      season: 2,
      showDescription:
        'Office workers whose memories have been surgically divided uncover the truth about their jobs and themselves.',
      title: 'Severance',
      totalEpisodes: 10,
      watchedEpisodes: 3,
    },
    {
      accent: 'blue',
      currentEpisode: {
        description:
          'The restaurant pushes through another demanding service while the team confronts what they want from its future.',
        number: 7,
        title: 'Legacy',
      },
      id: 'the-bear',
      kind: 'series',
      nextEpisode: {
        description:
          'The staff weighs the cost of perfection as pressure builds both inside and outside the kitchen.',
        number: 8,
        title: 'Ice Chips',
      },
      season: 3,
      showDescription:
        'A young chef returns home to run his family sandwich shop and transform it alongside a determined crew.',
      title: 'The Bear',
      totalEpisodes: 10,
      watchedEpisodes: 6,
    },
    {
      accent: 'ochre',
      currentEpisode: {
        description:
          'A dangerous new assignment puts the team back in the field while old mistakes threaten to catch up with them.',
        number: 3,
        title: 'Penny for Your Thoughts',
      },
      id: 'slow-horses',
      kind: 'series',
      nextEpisode: {
        description:
          'River closes in on an answer while the rest of Slough House tries to stay ahead of a growing threat.',
        number: 4,
        title: 'Returns',
      },
      season: 4,
      showDescription:
        'A dysfunctional team of British intelligence agents navigates the espionage world’s smoke and mirrors.',
      title: 'Slow Horses',
      totalEpisodes: 6,
      watchedEpisodes: 2,
    },
    {
      accent: 'slate',
      currentEpisode: {
        description:
          'Juliette searches for a way forward as new evidence challenges what everyone believes about the silo.',
        number: 5,
        title: 'Descent',
      },
      id: 'silo',
      kind: 'series',
      nextEpisode: {
        description:
          'A fragile alliance offers Juliette a path forward, while unrest deepens among those left behind.',
        number: 6,
        title: 'Barricades',
      },
      season: 2,
      showDescription:
        'Thousands live deep underground under rules they believe protect them from the ruined world outside.',
      title: 'Silo',
      totalEpisodes: 10,
      watchedEpisodes: 4,
    },
    {
      accent: 'plum',
      currentEpisode: {
        description:
          'A routine school day becomes anything but routine when competing plans throw the teachers into chaos.',
        number: 6,
        title: 'The Deli',
      },
      id: 'abbott-elementary',
      kind: 'series',
      nextEpisode: {
        description:
          'The teachers rally around a new school challenge while Janine tries to keep an ambitious plan on track.',
        number: 7,
        title: 'Winter Break',
      },
      season: 4,
      showDescription:
        'A group of dedicated teachers works to help their students succeed at an underfunded Philadelphia school.',
      title: 'Abbott Elementary',
      totalEpisodes: 22,
      watchedEpisodes: 5,
    },
  ],
  recentItems: [
    {
      accent: 'green',
      id: 'recent-severance',
      meta: 'S2 E3 · Who Is Alive?',
      time: '2 hours ago',
      title: 'Severance',
    },
    {
      accent: 'ochre',
      id: 'recent-shogun',
      meta: 'S1 E10 · A Dream of a Dream',
      time: 'Yesterday',
      title: 'Shōgun',
    },
    {
      accent: 'rust',
      id: 'recent-dune',
      meta: 'Movie · 2h 46m',
      time: '3 days ago',
      title: 'Dune: Part Two',
    },
  ],
  savedItems: [
    {
      accent: 'blue',
      availability: 'Streaming',
      description:
        'Two childhood friends reunite decades after their lives take them in different directions.',
      id: 'past-lives',
      runtime: '1h 46m',
      title: 'Past Lives',
    },
    {
      accent: 'plum',
      availability: 'In theaters',
      description:
        'A young woman’s whirlwind romance collides with the expectations of a powerful family.',
      id: 'anora',
      runtime: '2h 19m',
      title: 'Anora',
    },
    {
      accent: 'amber',
      availability: 'Streaming',
      description:
        'A shipwrecked robot must learn to survive—and connect—with the animals of a remote island.',
      id: 'wild-robot',
      runtime: '1h 42m',
      title: 'The Wild Robot',
    },
    {
      accent: 'slate',
      availability: 'Rent or buy',
      description:
        'Three tennis players find old rivalries resurfacing on and off the court.',
      id: 'challengers',
      runtime: '2h 11m',
      title: 'Challengers',
    },
  ],
}
