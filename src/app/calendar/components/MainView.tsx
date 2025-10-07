import type { FC } from 'react'
import type { useCalendar } from '@/src/app/calendar/hooks/useCalendar'
import CalendarHeader from '@/src/app/calendar/components/CalendarHeader'
import CalendarView from '@/src/app/calendar/components/CalendarView'
import TodayEventList from '@/src/app/calendar/components/TodayEventList'
import UpcomingEventList from '@/src/app/calendar/components/UpcomingEventList'
import NewEventButton from '@/src/app/calendar/components/NewEventButton'

const MainView: FC<ReturnType<typeof useCalendar>> = ({
    selectedDate,
    displayMonth,
    viewMode,
    todayEvents,
    upcomingEvents,
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
            <UpcomingEventList events={upcomingEvents} />
            <NewEventButton />
        </div>
    )
}

export default MainView
