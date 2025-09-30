import { ReactNode, forwardRef } from 'react'

interface ScrollCardContentsProps {
    children: ReactNode
}

export default forwardRef<HTMLDivElement, ScrollCardContentsProps>(
    function ScrollCardContents({ children }, ref) {
        return (
            <div
                ref={ref}
                className="hidden-scrollbar relative w-full snap-x snap-mandatory overflow-x-auto">
                <div className="flex scroll-smooth">
                    <div className="container mx-auto flex pl-4 sm:pl-6">
                        {children}
                    </div>
                </div>
            </div>
        )
    }
)
