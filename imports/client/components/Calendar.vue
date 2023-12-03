<script
  lang="ts"
  setup
>
import { ref } from 'vue'
import FullCalendar, {
  CalendarOptions,
  EventApi,
  EventInput,
  DateSelectArg,
  EventClickArg,
} from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const props = withDefaults(
  defineProps<{
    data?: EventInput[]
  }>(),
  {
    data: () => [],
  }
)

const emit = defineEmits<{
  (e: 'eventClick', value: EventClickArg): void
}>()

// const handleDateSelect = (selectInfo: DateSelectArg) => {
//   console.log('handleDateSelect', selectInfo)
// }

const handleEventClick = (clickInfo: EventClickArg) => {
  emit('eventClick', clickInfo)
}

// const handleEvents = (events: EventApi[]) => {
//   console.log('handleEvents', events)
//   // this.currentEvents = events
// }

const calendarOptions = ref<CalendarOptions>({
  // timeZone: 'Asia/Phnom_Penh',
  plugins: [
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin, // needed for dateClick
  ],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  initialView: 'dayGridMonth',
  initialEvents: props.data, // alternatively, use the `events` setting to fetch from a feed
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  // select: handleDateSelect,
  eventClick: handleEventClick,
  // eventsSet: handleEvents,
  /* you can update a remote database when these fire:
        eventAdd:
        eventChange:
        eventRemove:
        */
})
</script>

<template>
  <full-calendar :options="calendarOptions">
    <!-- <template #eventContent="arg">
          <b>{{ arg.timeText }}</b>
          <i>{{ arg.event.title }}</i>
        </template> -->
  </full-calendar>
</template>
