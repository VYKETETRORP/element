const sampleNotifyMixin = {
  data() {
    return {
      sampleNotify: [
        {
          title: 'Welcome to Sample Notification!',
          icon: 'fas fa-bell',
          route: { name: 'Dashboard' },
        },
      ],
    }
  },
}

export default sampleNotifyMixin
