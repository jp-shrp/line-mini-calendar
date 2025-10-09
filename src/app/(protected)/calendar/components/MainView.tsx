import CalendarHeader from '@/src/app/(protected)/calendar/components/CalendarHeader'
import CalendarView from '@/src/app/(protected)/calendar/components/CalendarView'
import NewEventButton from '@/src/app/(protected)/calendar/components/NewEventButton'
import TodayEventList from '@/src/app/(protected)/calendar/components/TodayEventList'
import SelectedDateEventList from '@/src/app/(protected)/calendar/components/SelectedDateEventList'
import UpcomingEventList from '@/src/app/(protected)/calendar/components/UpcomingEventList'
import type { useCalendar } from '@/src/app/(protected)/calendar/hooks/useCalendar'
import type { FC } from 'react'

const MainView: FC<ReturnType<typeof useCalendar>> = ({
    selectedDate,
    displayMonth,
    viewMode,
    todayEvents,
    upcomingEvents,
    selectedDateEvents,
    handleDateChange,
    handleMonthChange,
    handleViewModeChange,
}) => {
    return (
        <div className="mx-auto min-h-screen max-w-md bg-white p-6">
            <CalendarHeader
                displayMonth={displayMonth}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
            />
            <CalendarView
                viewMode={viewMode}
                selectedDate={selectedDate}
                displayMonth={displayMonth}
                onDateChange={handleDateChange}
                onMonthChange={handleMonthChange}
            />
            <TodayEventList events={todayEvents} />
            <SelectedDateEventList
                events={selectedDateEvents}
                selectedDate={selectedDate}
            />
            <UpcomingEventList events={upcomingEvents} />
            <NewEventButton />
        </div>
    )
}

export default MainView
