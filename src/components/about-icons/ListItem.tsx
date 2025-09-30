import Image from 'next/image'

type ListItemProps = {
    imagePath: string
    description: string
    isLast?: boolean
    wideIcon?: boolean
}

export default function ListItem({
    imagePath,
    description,
    isLast,
    wideIcon,
}: ListItemProps) {
    return (
        <li className={`flex items-center gap-5 ${isLast ? 'mb-2' : 'mb-12'} `}>
            <Image
                src={`/images/icon/about-icons/${imagePath}`}
                alt=""
                width={wideIcon ? 120 : 65}
                height={64}
            />
            <div>{description}</div>
        </li>
    )
}
