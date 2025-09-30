'use client'

import AppContainerHeader from '@/components/AppContainerHeader'
import AppContainer from '@/components/AppContainer'
import SearchMenu from '@/components/SearchMenu'

export default function CustomSearch() {
    return (
        <AppContainer>
            <div>
                <AppContainerHeader
                    title="Custom Search"
                    subtitle="カスタム検索"
                />
                <SearchMenu isCustomSearchPage />
            </div>
        </AppContainer>
    )
}
