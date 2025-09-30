'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSearchFields } from '@/actions/productAction'
import BaseButton from '@/components/BaseButton'
import { useLoading } from '@/contexts/LoadingContext'

type AccordionProps = {
    title: string
    children: ReactNode
    className?: string
    defaultOpen?: boolean
    isCustomSearchPage?: boolean
}
function Accordion({
    title,
    children,
    className = '',
    defaultOpen,
    isCustomSearchPage,
}: AccordionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    const contentRef = useRef<HTMLDivElement>(null)
    const [maxHeight, setMaxHeight] = useState('0px')

    useEffect(() => {
        if (contentRef.current) {
            if (isOpen) {
                setMaxHeight(`${contentRef.current.scrollHeight}px`)
            } else {
                setMaxHeight('0px')
            }
        }
    }, [isOpen, children])

    return (
        <div className="w-full">
            <div
                onClick={() => setIsOpen((o) => !o)}
                className={`flex w-full cursor-pointer items-center justify-between py-6 text-lg md:py-7 md:text-2xl ${isCustomSearchPage ? '' : 'md:px-3'} `}
                style={{ borderBottom: '1px solid #e9eaeb' }}>
                <div>{title}</div>
                <div>{isOpen ? 'ー' : '＋'}</div>
            </div>

            <div
                ref={contentRef}
                className={`overflow-hidden bg-zinc-100 transition-all duration-600 ease-in-out ${className}`}
                style={maxHeight !== null ? { maxHeight } : undefined} // 初回はスタイル未適用
            >
                <div className="px-3 py-4 md:px-5 md:py-6">{children}</div>
            </div>
        </div>
    )
}

type SelectOption = {
    name: string
    value: { min: number; max: number | null }
}
type SelectProps = {
    label: string
    options: SelectOption[]
    value: { min: number; max: number | null } | null
    onChange: (value: { min: number; max: number | null }) => void
    isLastItem?: boolean
}
function Select({ label, options, value, onChange, isLastItem }: SelectProps) {
    return (
        <div>
            <label className="mb-2 block">{label}</label>
            <select
                className={`h-[56px] w-full rounded border border-gray-300 bg-white ${!isLastItem ? 'mb-7' : ''} `}
                value={value ? JSON.stringify(value) : ''}
                onChange={(e) => onChange(JSON.parse(e.target.value))}>
                <option value="" className="text-gray-200">
                    {label}を選択
                </option>
                {options.map((opt, i) => (
                    <option key={i} value={JSON.stringify(opt.value)}>
                        {opt.name}
                    </option>
                ))}
            </select>
        </div>
    )
}

type CheckboxItem = { name: string; id: string }
type ExclusiveGroup = { parent: string; children: string[] }
type CheckboxProps = {
    label: string
    parentItems: CheckboxItem[]
    childItems: CheckboxItem[]
    selected: string[]
    onChange: (next: string[]) => void
    isCustomSearchPage?: boolean
    exclusiveGroups: ExclusiveGroup[]
}

function Checkbox({
    label,
    parentItems,
    childItems,
    selected,
    onChange,
    isCustomSearchPage,
    exclusiveGroups,
}: CheckboxProps) {
    const allItems = [...parentItems, ...childItems]
    const handleChange = (idStr: string) => {
        let next = [...selected]
        const group = (exclusiveGroups ?? []).find(
            (g) => g.parent === idStr || g.children.includes(idStr)
        )

        if (group) {
            const isParent = idStr === group.parent

            if (isParent) {
                const isChecked = selected.includes(group.parent)

                if (isChecked) {
                    next = next.filter(
                        (id) =>
                            id !== group.parent && !group.children.includes(id)
                    )
                } else {
                    next.push(group.parent)
                }
            } else {
                next = next.filter((id) => id !== group.parent)
                if (next.includes(idStr)) {
                    next = next.filter((id) => id !== idStr)
                } else {
                    next.push(idStr)
                }
            }
        } else {
            if (next.includes(idStr)) {
                next = next.filter((id) => id !== idStr)
            } else {
                next.push(idStr)
            }
        }

        onChange(next)
    }
    return (
        <div>
            <h3
                className={`mb-4 hidden border-b border-zinc-200 text-xl ${isCustomSearchPage ? 'md:block' : ''} `}>
                {label}
            </h3>
            <div
                className={`${isCustomSearchPage ? 'grid-cols-3 gap-2 md:grid' : ''}`}>
                {allItems.map((item, index) => (
                    <label
                        key={item.id}
                        className={`flex items-center space-x-2 ${index !== allItems.length - 1 ? 'mb-3' : ''} `}>
                        <input
                            type="checkbox"
                            checked={Boolean(
                                selected.includes(item.id) ||
                                    (() => {
                                        const group = exclusiveGroups.find(
                                            (g) => g.parent === item.id
                                        )
                                        return (
                                            group &&
                                            group.children.length > 1 &&
                                            group.children.every((cid) =>
                                                selected.includes(cid)
                                            )
                                        )
                                    })()
                            )}
                            onChange={() => handleChange(item.id)}
                            className="accent-blue-500"
                        />
                        <span>{item.name}</span>
                    </label>
                ))}
            </div>
        </div>
    )
}

const sizeValues = [
    { name: '500mm未満', value: { min: 0, max: 499 } },
    { name: '500 ~ 600mm未満', value: { min: 500, max: 599 } },
    { name: '600 ~ 700mm未満', value: { min: 600, max: 699 } },
    { name: '700 ~ 800mm未満', value: { min: 700, max: 799 } },
    { name: '800 ~ 900mm未満', value: { min: 800, max: 899 } },
    { name: '1000mm以上', value: { min: 1000, max: null } },
]
const massValues = [
    { name: '60kg未満', value: { min: 0, max: 59 } },
    { name: '60 ~ 100kg未満', value: { min: 60, max: 99 } },
    { name: '100 ~ 200kg未満', value: { min: 100, max: 199 } },
    { name: '200 ~ 300kg未満', value: { min: 200, max: 299 } },
    { name: '300 ~ 400kg未満', value: { min: 300, max: 399 } },
    { name: '400 ~ 500kg未満', value: { min: 400, max: 499 } },
    { name: '500kg以上', value: { min: 500, max: null } },
]
const capacityValues = [
    { name: '20リットル未満', value: { min: 0, max: 19 } },
    { name: '20 ~ 50リットル未満', value: { min: 20, max: 49 } },
    { name: '50 ~ 100リットル未満', value: { min: 50, max: 99 } },
    { name: '100 ~ 300リットル未満', value: { min: 100, max: 299 } },
    { name: '300 ~ 500リットル未満', value: { min: 300, max: 499 } },
    { name: '500リットル以上', value: { min: 500, max: null } },
]

type SearchMenuProps = {
    onClose?: () => void
    isCustomSearchPage?: boolean
}

export default function SearchMenu({
    onClose,
    isCustomSearchPage,
}: SearchMenuProps) {
    const [word, setWord] = useState('')
    const router = useRouter()
    const { setLoading } = useLoading()

    type SearchItem = { id: string; name: string }
    type SearchFields = {
        sub_categories: SearchItem[]
        lock_system_types: SearchItem[]
        '1hour': SearchItem[]
        '2hour': SearchItem[]
        '30min': SearchItem[]
        standards: SearchItem[]
        rapid_heat_shocks: SearchItem[]
        melt_proofs: SearchItem[]
        tool_proofs: SearchItem[]
        water_proofs: SearchItem[]
        alarm: SearchItem[] // 他の項目も同様に追加
    }
    const [searchFields, setSearchFields] = useState<SearchFields | null>(null)

    useEffect(() => {
        // APIからカテゴリ一覧を取得（DB経由）
        const fetch = async () => {
            await getSearchFields({
                setGlobalLoading: setLoading,
                onSuccess: (data) => {
                    setSearchFields(data)
                },
                onError: (error) => {
                    console.error('サブカテゴリ取得エラー:', error)
                },
            })
        }

        fetch()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const params = new URLSearchParams({
            word: word,
        })

        router.push(`/product/list?${params.toString()}`)
        if (onClose) onClose()
    }

    const [selectedSubCategories, setSelectedSubCategories] = useState<
        string[]
    >([])
    const [selectedLockSystemTypes, setSelectedLockSystemTypes] = useState<
        string[]
    >([])
    const [selectedPerformances, setSelectedPerformances] = useState<string[]>(
        []
    )

    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')

    const [outsideWidth, setOutsideWidth] = useState<{
        min: number
        max: number | null
    } | null>(null)
    const [outsideDepth, setOutsideDepth] = useState<{
        min: number
        max: number | null
    } | null>(null)
    const [outsideHeight, setOutsideHeight] = useState<{
        min: number
        max: number | null
    } | null>(null)
    const [insideWidth, setInsideWidth] = useState<{
        min: number
        max: number | null
    } | null>(null)
    const [insideDepth, setInsideDepth] = useState<{
        min: number
        max: number | null
    } | null>(null)
    const [insideHeight, setInsideHeight] = useState<{
        min: number
        max: number | null
    } | null>(null)
    const [mass, setMass] = useState<{
        min: number
        max: number | null
    } | null>(null)
    const [capacity, setCapacity] = useState<{
        min: number
        max: number | null
    } | null>(null)

    const handleConditionSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()

        if (selectedSubCategories.length) {
            params.append('sub_categories', selectedSubCategories.join(','))
        }
        if (selectedLockSystemTypes.length) {
            params.append(
                'lock_system_types',
                selectedLockSystemTypes.join(',')
            )
        }

        if (selectedPerformances.includes('is_fire_proof')) {
            params.append('is_fire_proof', 'true')
        } else if (selectedPerformances.length) {
            const performancesToAdd: string[] = []

            for (const id of selectedPerformances) {
                if (id === 'tool_all') {
                    const toolProofIds = (searchFields?.tool_proofs ?? []).map(
                        (item) => item.id
                    )
                    performancesToAdd.push(...toolProofIds)
                } else if (id === 'water_all') {
                    const waterProofIds = (
                        searchFields?.water_proofs ?? []
                    ).map((item) => item.id)
                    performancesToAdd.push(...waterProofIds)
                } else {
                    performancesToAdd.push(id)
                }
            }

            // 重複排除
            const uniquePerformances = Array.from(new Set(performancesToAdd))

            if (uniquePerformances.length > 0) {
                params.append('performances', uniquePerformances.join(','))
            }
        }

        if (minPrice) params.append('minPrice', minPrice)
        if (maxPrice) params.append('maxPrice', maxPrice)

        if (outsideWidth) {
            params.append('outsideWidthMin', String(outsideWidth.min))
            if (outsideWidth.max !== null) {
                params.append('outsideWidthMax', String(outsideWidth.max))
            }
        }
        if (outsideDepth) {
            params.append('outsideDepthMin', String(outsideDepth.min))
            if (outsideDepth.max !== null) {
                params.append('outsideDepthMax', String(outsideDepth.max))
            }
        }
        if (outsideHeight) {
            params.append('outsideHeightMin', String(outsideHeight.min))
            if (outsideHeight.max !== null) {
                params.append('outsideHeightMax', String(outsideHeight.max))
            }
        }
        if (insideWidth) {
            params.append('insideWidthMin', String(insideWidth.min))
            if (insideWidth.max !== null) {
                params.append('insideWidthMax', String(insideWidth.max))
            }
        }
        if (insideDepth) {
            params.append('insideDepthMin', String(insideDepth.min))
            if (insideDepth.max !== null) {
                params.append('insideDepthMax', String(insideDepth.max))
            }
        }
        if (insideHeight) {
            params.append('insideHeightMin', String(insideHeight.min))
            if (insideHeight.max !== null) {
                params.append('insideHeightMax', String(insideHeight.max))
            }
        }
        if (mass) {
            params.append('massMin', String(mass.min))
            if (mass.max !== null) {
                params.append('massMax', String(mass.max))
            }
        }
        if (capacity) {
            params.append('capacityMin', String(capacity.min))
            if (capacity.max !== null) {
                params.append('capacityMax', String(capacity.max))
            }
        }

        router.push(`/product/list?${params.toString()}`)
        if (onClose) onClose()
    }

    const handleClear = () => {
        setSelectedSubCategories([])
        setSelectedLockSystemTypes([])
        setSelectedPerformances([])

        setMinPrice('')
        setMaxPrice('')

        setOutsideWidth(null)
        setOutsideDepth(null)
        setOutsideHeight(null)
        setInsideWidth(null)
        setInsideDepth(null)
        setInsideHeight(null)
        setMass(null)
        setCapacity(null)
    }

    return (
        <div className={` ${isCustomSearchPage ? '' : 'h-fit'} `}>
            <form onSubmit={handleSubmit}>
                <div
                    className={`mb-0 ${isCustomSearchPage ? 'px-3 pt-8 md:mb-10 md:rounded-2xl md:bg-white md:px-6 md:py-10' : 'w-full border-b border-gray-200 bg-white md:w-[320px] md:rounded-t-2xl md:px-3 md:py-7'} `}>
                    {isCustomSearchPage && (
                        <h2 className="mb-12 hidden text-3xl md:block">
                            フリーワード検索
                        </h2>
                    )}
                    <h2
                        className={` ${isCustomSearchPage ? 'mb-6 block text-xl md:hidden' : 'mb-5 text-base md:mt-6 md:mb-7 md:text-xl'} `}>
                        フリーワードから探す
                    </h2>
                    <input
                        type="text"
                        value={word}
                        onChange={(e) => setWord(e.target.value)}
                        className={`block w-full rounded border border-gray-300 ${isCustomSearchPage ? 'mb-6 h-[56px] md:mb-12' : 'mb-8 h-[54px] md:mb-6'} `}
                    />
                    <BaseButton
                        type="submit"
                        label="フリーワードから検索する"
                        variant="primary"
                        className={`${isCustomSearchPage ? 'md:w-[298px]' : 'mb-8 md:mb-0'} mx-auto`}
                    />
                </div>
                {isCustomSearchPage && (
                    <div className="mx-3 border-b border-gray-200 pt-8"></div>
                )}
            </form>

            <form onSubmit={handleConditionSearch}>
                <div
                    className={`pb-8 ${isCustomSearchPage ? 'mb-8 rounded-2xl px-3 md:mb-24 md:bg-white md:px-6 md:py-10' : 'w-full rounded-b-2xl bg-white md:w-[320px]'} `}>
                    {isCustomSearchPage && (
                        <div>
                            <h2 className="mb-8 hidden text-3xl md:block">
                                検索条件を指定する
                            </h2>
                            <p className="mb-7 hidden md:block">
                                金庫の価格や種類など基本的な情報を選択してください。
                            </p>
                            <div className="mb-8 hidden md:block">
                                <Checkbox
                                    isCustomSearchPage={isCustomSearchPage}
                                    label="種類"
                                    parentItems={[]}
                                    childItems={
                                        searchFields?.sub_categories ?? []
                                    }
                                    selected={selectedSubCategories}
                                    onChange={setSelectedSubCategories}
                                    exclusiveGroups={[]}
                                />
                            </div>
                            <div className="mb-8 hidden md:block">
                                <Checkbox
                                    isCustomSearchPage={isCustomSearchPage}
                                    label="ロック"
                                    parentItems={[]}
                                    childItems={
                                        searchFields?.lock_system_types ?? []
                                    }
                                    selected={selectedLockSystemTypes}
                                    onChange={setSelectedLockSystemTypes}
                                    exclusiveGroups={[]}
                                />
                            </div>
                            <div className="mb-8 hidden md:block">
                                <h3 className="mb-4 border-b border-zinc-200 text-xl">
                                    販売価格
                                </h3>
                                <div className="flex items-end justify-between">
                                    <input
                                        type="number"
                                        className="input-style h-[56px] w-5/12 rounded border border-gray-300"
                                        value={minPrice}
                                        onChange={(e) =>
                                            setMinPrice(e.target.value)
                                        }
                                    />
                                    <span>円　〜</span>
                                    <input
                                        type="number"
                                        className="input-style h-[56px] w-5/12 rounded border border-gray-300"
                                        value={maxPrice}
                                        onChange={(e) =>
                                            setMaxPrice(e.target.value)
                                        }
                                    />
                                    <span>円</span>
                                </div>
                            </div>
                            <div className="mb-8 hidden md:block">
                                <h3 className="mb-4 border-b border-zinc-200 text-xl">
                                    金庫の外寸
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <Select
                                        label="幅"
                                        options={sizeValues}
                                        value={outsideWidth}
                                        onChange={setOutsideWidth}
                                    />
                                    <Select
                                        label="奥行"
                                        options={sizeValues}
                                        value={outsideDepth}
                                        onChange={setOutsideDepth}
                                    />
                                    <Select
                                        label="高さ"
                                        options={sizeValues}
                                        value={outsideHeight}
                                        onChange={setOutsideHeight}
                                    />
                                </div>
                            </div>
                            <div className="mb-8 hidden md:block">
                                <h3 className="mb-4 border-b border-zinc-200 text-xl">
                                    金庫の内寸
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <Select
                                        label="幅"
                                        options={sizeValues}
                                        value={insideWidth}
                                        onChange={setInsideWidth}
                                    />
                                    <Select
                                        label="奥行"
                                        options={sizeValues}
                                        value={insideDepth}
                                        onChange={setInsideDepth}
                                    />
                                    <Select
                                        label="高さ"
                                        options={sizeValues}
                                        value={insideHeight}
                                        onChange={setInsideHeight}
                                    />
                                </div>
                            </div>
                            <div className="mb-8 hidden md:block">
                                <h3 className="mb-4 border-b border-zinc-200 text-xl">
                                    質量/内容積
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <Select
                                        label="質量"
                                        options={massValues}
                                        value={mass}
                                        onChange={setMass}
                                    />
                                    <Select
                                        label="内容積"
                                        options={capacityValues}
                                        value={capacity}
                                        onChange={setCapacity}
                                    />
                                </div>
                                <p className="mt-7 text-sm text-zinc-600">
                                    ※収納物のサイズや、設置したいスペースをお調べのうえお選びください。
                                </p>
                            </div>
                            <div className="mb-8 hidden md:block">
                                <Checkbox
                                    isCustomSearchPage={isCustomSearchPage}
                                    label="耐火"
                                    parentItems={[
                                        {
                                            id: 'is_fire_proof',
                                            name: '耐火性能あり',
                                        },
                                    ]}
                                    childItems={[
                                        { id: '30min', name: '30分耐火' },
                                        { id: '1hour', name: '1時間耐火' },
                                        { id: '2hour', name: '2時間耐火' },
                                    ]}
                                    selected={selectedPerformances}
                                    onChange={setSelectedPerformances}
                                    exclusiveGroups={[
                                        {
                                            parent: 'is_fire_proof',
                                            children: [
                                                '30min',
                                                '1hour',
                                                '2hour',
                                            ],
                                        },
                                    ]}
                                />
                            </div>
                            <div className="mb-8 hidden md:block">
                                <Checkbox
                                    isCustomSearchPage={isCustomSearchPage}
                                    label="規格"
                                    parentItems={[]}
                                    childItems={searchFields?.standards ?? []}
                                    selected={selectedPerformances}
                                    onChange={setSelectedPerformances}
                                    exclusiveGroups={[]}
                                />
                            </div>
                            <div className="mb-8 hidden md:block">
                                <Checkbox
                                    isCustomSearchPage={isCustomSearchPage}
                                    label="耐急加熱・衝撃落下"
                                    parentItems={[]}
                                    childItems={
                                        searchFields?.rapid_heat_shocks ?? []
                                    }
                                    selected={selectedPerformances}
                                    onChange={setSelectedPerformances}
                                    exclusiveGroups={[]}
                                />
                            </div>
                            <div className="mb-8 hidden md:block">
                                <Checkbox
                                    isCustomSearchPage={isCustomSearchPage}
                                    label="耐溶断"
                                    parentItems={[]}
                                    childItems={searchFields?.melt_proofs ?? []}
                                    selected={selectedPerformances}
                                    onChange={setSelectedPerformances}
                                    exclusiveGroups={[]}
                                />
                            </div>
                            <div className="mb-8 hidden md:block">
                                <Checkbox
                                    isCustomSearchPage={isCustomSearchPage}
                                    label="耐工具"
                                    parentItems={[
                                        {
                                            id: 'tool_all',
                                            name: '耐工具性能あり',
                                        },
                                    ]}
                                    childItems={searchFields?.tool_proofs ?? []}
                                    selected={selectedPerformances}
                                    onChange={setSelectedPerformances}
                                    exclusiveGroups={[
                                        {
                                            parent: 'tool_all',
                                            children: (
                                                searchFields?.tool_proofs ?? []
                                            ).map((item) => item.id),
                                        },
                                    ]}
                                />
                            </div>
                            <div className="mb-8 hidden md:block">
                                <Checkbox
                                    isCustomSearchPage={isCustomSearchPage}
                                    label="防水"
                                    parentItems={[
                                        {
                                            id: 'water_all',
                                            name: '防水性能あり',
                                        },
                                    ]}
                                    childItems={
                                        searchFields?.water_proofs ?? []
                                    }
                                    selected={selectedPerformances}
                                    onChange={setSelectedPerformances}
                                    exclusiveGroups={[
                                        {
                                            parent: 'water_all',
                                            children: (
                                                searchFields?.water_proofs ?? []
                                            ).map((item) => item.id),
                                        },
                                    ]}
                                />
                            </div>
                            <div className="mb-8 hidden md:block">
                                <Checkbox
                                    isCustomSearchPage={isCustomSearchPage}
                                    label="警報機（アラーム）"
                                    parentItems={[
                                        { id: 'has_alarm', name: 'あり' },
                                    ]}
                                    childItems={[
                                        { id: 'has_not_alarm', name: 'なし' },
                                    ]}
                                    selected={selectedPerformances}
                                    onChange={setSelectedPerformances}
                                    exclusiveGroups={[
                                        {
                                            parent: 'has_alarm',
                                            children: ['has_not_alarm'],
                                        },
                                    ]}
                                />
                                <p className="mt-7 text-sm text-zinc-600">
                                    ※性能についての詳細は「
                                    <a href="" className="text-blue-600">
                                        金庫の性能
                                    </a>
                                    」のページからご確認いただけます。
                                </p>
                            </div>
                        </div>
                    )}

                    <div
                        className={`${isCustomSearchPage ? 'mb-6 md:hidden' : ''}`}>
                        <Accordion
                            title="種類"
                            isCustomSearchPage={isCustomSearchPage}>
                            <Checkbox
                                isCustomSearchPage={isCustomSearchPage}
                                label="種類"
                                parentItems={[]}
                                childItems={searchFields?.sub_categories ?? []}
                                selected={selectedSubCategories}
                                onChange={setSelectedSubCategories}
                                exclusiveGroups={[]}
                            />
                        </Accordion>
                        <Accordion
                            title="ロック"
                            isCustomSearchPage={isCustomSearchPage}>
                            <Checkbox
                                isCustomSearchPage={isCustomSearchPage}
                                label="ロック"
                                parentItems={[]}
                                childItems={
                                    searchFields?.lock_system_types ?? []
                                }
                                selected={selectedLockSystemTypes}
                                onChange={setSelectedLockSystemTypes}
                                exclusiveGroups={[]}
                            />
                        </Accordion>
                        <Accordion
                            title="販売価格"
                            isCustomSearchPage={isCustomSearchPage}>
                            <div>
                                <div className="mb-3 w-full">
                                    <input
                                        type="number"
                                        className="input-style h-[56px] rounded border border-gray-300 bg-white"
                                        value={minPrice}
                                        onChange={(e) =>
                                            setMinPrice(e.target.value)
                                        }
                                    />
                                    <span className="ml-2">円　〜</span>
                                </div>
                                <div className="w-full">
                                    <input
                                        type="number"
                                        className="input-style h-[56px] rounded border border-gray-300 bg-white"
                                        value={maxPrice}
                                        onChange={(e) =>
                                            setMaxPrice(e.target.value)
                                        }
                                    />
                                    <span className="ml-2">円</span>
                                </div>
                            </div>
                        </Accordion>
                        <Accordion
                            title="金庫の外寸"
                            isCustomSearchPage={isCustomSearchPage}>
                            <div>
                                <Select
                                    label="幅"
                                    options={sizeValues}
                                    value={outsideWidth}
                                    onChange={setOutsideWidth}
                                />
                                <Select
                                    label="奥行"
                                    options={sizeValues}
                                    value={outsideDepth}
                                    onChange={setOutsideDepth}
                                />
                                <Select
                                    label="高さ"
                                    options={sizeValues}
                                    value={outsideHeight}
                                    onChange={setOutsideHeight}
                                    isLastItem
                                />
                            </div>
                        </Accordion>
                        <Accordion
                            title="金庫の内寸"
                            isCustomSearchPage={isCustomSearchPage}>
                            <div>
                                <Select
                                    label="幅"
                                    options={sizeValues}
                                    value={insideWidth}
                                    onChange={setInsideWidth}
                                />
                                <Select
                                    label="奥行"
                                    options={sizeValues}
                                    value={insideDepth}
                                    onChange={setInsideDepth}
                                />
                                <Select
                                    label="高さ"
                                    options={sizeValues}
                                    value={insideHeight}
                                    onChange={setInsideHeight}
                                    isLastItem
                                />
                            </div>
                        </Accordion>
                        <Accordion
                            title="質量/内容積"
                            isCustomSearchPage={isCustomSearchPage}>
                            <div>
                                <Select
                                    label="質量"
                                    options={massValues}
                                    value={mass}
                                    onChange={setMass}
                                />
                                <Select
                                    label="内容積"
                                    options={capacityValues}
                                    value={capacity}
                                    onChange={setCapacity}
                                    isLastItem
                                />
                            </div>
                            <p className="mt-7 text-sm text-zinc-600">
                                ※収納物のサイズや、設置したいスペースをお調べのうえお選びください。
                            </p>
                        </Accordion>
                        <Accordion
                            title="耐火"
                            isCustomSearchPage={isCustomSearchPage}>
                            <Checkbox
                                isCustomSearchPage={isCustomSearchPage}
                                label="耐火"
                                parentItems={[
                                    {
                                        id: 'is_fire_proof',
                                        name: '耐火性能あり',
                                    },
                                ]}
                                childItems={[
                                    { id: '30min', name: '30分耐火' },
                                    { id: '1hour', name: '1時間耐火' },
                                    { id: '2hour', name: '2時間耐火' },
                                ]}
                                selected={selectedPerformances}
                                onChange={setSelectedPerformances}
                                exclusiveGroups={[
                                    {
                                        parent: 'is_fire_proof',
                                        children: ['30min', '1hour', '2hour'],
                                    },
                                ]}
                            />
                        </Accordion>
                        <Accordion
                            title="規格"
                            isCustomSearchPage={isCustomSearchPage}>
                            <Checkbox
                                isCustomSearchPage={isCustomSearchPage}
                                label="JIS認証規格"
                                parentItems={[]}
                                childItems={searchFields?.standards ?? []}
                                selected={selectedPerformances}
                                onChange={setSelectedPerformances}
                                exclusiveGroups={[]}
                            />
                        </Accordion>
                        <Accordion
                            title="耐急加熱・衝撃落下"
                            isCustomSearchPage={isCustomSearchPage}>
                            <Checkbox
                                isCustomSearchPage={isCustomSearchPage}
                                label="耐急加熱・衝撃落下"
                                parentItems={[]}
                                childItems={
                                    searchFields?.rapid_heat_shocks ?? []
                                }
                                selected={selectedPerformances}
                                onChange={setSelectedPerformances}
                                exclusiveGroups={[]}
                            />
                        </Accordion>
                        <Accordion
                            title="耐溶断"
                            isCustomSearchPage={isCustomSearchPage}>
                            <Checkbox
                                isCustomSearchPage={isCustomSearchPage}
                                label="耐溶断"
                                parentItems={[]}
                                childItems={searchFields?.melt_proofs ?? []}
                                selected={selectedPerformances}
                                onChange={setSelectedPerformances}
                                exclusiveGroups={[]}
                            />
                        </Accordion>
                        <Accordion
                            title="耐工具"
                            isCustomSearchPage={isCustomSearchPage}>
                            <Checkbox
                                isCustomSearchPage={isCustomSearchPage}
                                label="耐工具"
                                parentItems={[
                                    { id: 'tool_all', name: '耐工具性能あり' },
                                ]}
                                childItems={searchFields?.tool_proofs ?? []}
                                selected={selectedPerformances}
                                onChange={setSelectedPerformances}
                                exclusiveGroups={[
                                    {
                                        parent: 'tool_all',
                                        children: (
                                            searchFields?.tool_proofs ?? []
                                        ).map((item) => item.id),
                                    },
                                ]}
                            />
                        </Accordion>
                        <Accordion
                            title="防水"
                            isCustomSearchPage={isCustomSearchPage}>
                            <Checkbox
                                isCustomSearchPage={isCustomSearchPage}
                                label="防水"
                                parentItems={[
                                    { id: 'water_all', name: '防水性能あり' },
                                ]}
                                childItems={searchFields?.water_proofs ?? []}
                                selected={selectedPerformances}
                                onChange={setSelectedPerformances}
                                exclusiveGroups={[
                                    {
                                        parent: 'water_all',
                                        children: (
                                            searchFields?.water_proofs ?? []
                                        ).map((item) => item.id),
                                    },
                                ]}
                            />
                        </Accordion>
                        <Accordion
                            title="警報機（アラーム）"
                            isCustomSearchPage={isCustomSearchPage}>
                            <Checkbox
                                isCustomSearchPage={isCustomSearchPage}
                                label="警報機（アラーム）"
                                parentItems={[
                                    { id: 'has_alarm', name: 'あり' },
                                ]}
                                childItems={[
                                    { id: 'has_not_alarm', name: 'なし' },
                                ]}
                                selected={selectedPerformances}
                                onChange={setSelectedPerformances}
                                exclusiveGroups={[
                                    {
                                        parent: 'has_alarm',
                                        children: ['has_not_alarm'],
                                    },
                                ]}
                            />
                            <p className="mt-7 text-sm text-zinc-600">
                                ※性能についての詳細は「
                                <a href="" className="text-blue-600">
                                    金庫の性能
                                </a>
                                」のページからご確認いただけます。
                            </p>
                        </Accordion>
                    </div>

                    <div
                        className={`${isCustomSearchPage ? 'justify-center gap-12 md:flex' : 'px-3 pt-7'}`}>
                        <BaseButton
                            onClick={handleClear}
                            label="すべてクリア"
                            variant="secondary"
                            className={isCustomSearchPage ? 'md:w-[206px]' : ''}
                        />
                        <BaseButton
                            type="submit"
                            label="検索"
                            variant="primary"
                            className={
                                isCustomSearchPage
                                    ? 'mt-5 md:mt-0 md:w-[206px]'
                                    : 'mt-6'
                            }
                        />
                    </div>
                </div>
            </form>
        </div>
    )
}
