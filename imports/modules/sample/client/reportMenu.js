const reportMenu = [
  {
    title: 'Demo',
    icon: 'fal fa-democrat',
    activeGroups: ['General', 'Summary'],
    data: [
      // General
      {
        groupTitle: 'General',
        icon: 'fal fa-print',
        items: [
          {
            title: 'Post',
            route: { name: 'DemoPostReport' },
            memo: ``,
          },
          {
            title: 'Sample',
            route: { name: 'DemoSampleReport' },
            memo: ``,
          },
        ],
      },
      // Summary
      {
        groupTitle: 'Summary',
        icon: 'fal fa-print',
        items: [
          {
            title: 'Sample',
            route: { name: 'DemoSampleReport' },
            memo: ``,
          },
          {
            title: 'Sample',
            route: { name: 'DemoSampleReport' },
            memo: ``,
          },
        ],
      },
    ],
  },
]

export default reportMenu
