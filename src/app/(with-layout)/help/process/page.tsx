import Accordion from '@/components/Accordion'
import AppContentsCard from '@/components/AppContentsCard'

export default function Process() {
    return (
        <AppContentsCard title={'ご購入の手順'}>
            <Accordion title={'商品を探す'}>
                <div>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                </div>
            </Accordion>
            <Accordion title={'商品の詳細情報を見る'}>
                <div>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                </div>
            </Accordion>
            <Accordion title={'カートに商品を入れ、購入手続きへ'}>
                <div>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                </div>
            </Accordion>
            <Accordion title={'ログインする'}>
                <div>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                </div>
            </Accordion>
            <Accordion title={'お届け先の選択・登録'}>
                <div>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                </div>
            </Accordion>
            <Accordion title={'ご注文完了'}>
                <div>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                    <p>sample sample sample</p>
                </div>
            </Accordion>
        </AppContentsCard>
    )
}
