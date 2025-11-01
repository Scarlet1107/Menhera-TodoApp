import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function Terms() {
    return (
        <article className="prose prose-pink dark:prose-invert max-w-none px-6 py-8">

            <aside className="bg-pink-50 border-l-4 border-pink-200 p-4 mb-6 dark:bg-stone-800/80 dark:border-pink-400/60 dark:text-pink-100">
                <p>※以下は要約です。本文が正式な規約内容となります。</p>
                <br />
                <ul className="list-disc list-inside space-y-2 text-base">
                    <li>基本はゆる～く使ってOK！SNSとかにスクショ上げるのもご自由にどうぞ！</li>
                    <li>アプリの性質上、勝手にアカウントを消去されたり、Todoが編集される場合があるのでお気をつけください</li>
                    <li>Botを使ってアカウントを大量に作ったり、スパム投稿はやめてください🚫 開発者が破産します</li>
                </ul>
            </aside>

            <p className="text-sm text-right">最終更新日：2025年5月19日</p>
            <h1 className="text-3xl font-bold">メンヘラTodo 利用規約</h1>

            {/* 第1条 定義 */}
            <h2 className="text-2xl font-semibold mt-6">第1条（定義）</h2>
            <ul className="list-disc list-inside space-y-2 text-base">
                <li>「本サービス」とは、当運営者が提供する「メンヘラTodo」ウェブアプリケーションを指します。</li>
                <li>「ユーザー」とは、本サービスに登録し利用する個人を指します。</li>
                <li>「コンテンツ」とは、本サービス上でユーザーが投稿または生成するテキスト、画像、データ等を指します。</li>
            </ul>

            {/* 第2条 利用登録 */}
            <h2 className="text-2xl font-semibold mt-6">第2条（利用登録）</h2>
            <p className="text-base">本サービスの利用にはアカウント登録が必要です。ユーザーは本規約に同意のうえ、所定の方法で登録を申請すると、即時に利用登録が完了します。</p>
            <p className="text-base">ユーザーは登録情報を常に正確に保つよう努め、変更があった場合は速やかに運営へご連絡ください。</p>
            <p className="text-base">ユーザーはパスワードを安全に管理し、万が一不正利用があった場合はできるだけ早く運営にお知らせください。</p>

            {/* 第3条 利用料金および支払方法 */}
            <h2 className="text-2xl font-semibold mt-6">第3条（利用料金および支払方法）</h2>
            <p className="text-base">本サービスは基本的に無料で提供されますが、将来的に課金要素を導入する可能性があります。課金サービスを利用する場合は別途案内します。</p>

            {/* 第4条（禁止行為） */}
            <h2 className="text-2xl font-semibold mt-6">第4条（禁止行為）</h2>
            <ul className="list-disc list-inside space-y-2 text-base">
                <li>法令または公序良俗に反する行為</li>
                <li>他者の権利（著作権、肖像権、プライバシー等）を侵害する行為</li>
                <li>スパム投稿、ボットによる大量登録など運営に支障をきたす行為</li>
                <li>その他、運営者が悪質と判断する一切の行為</li>
            </ul>

            {/* 第5条（利用停止等） */}
            <h2 className="text-2xl font-semibold mt-6">第5条（利用停止等）</h2>
            <p className="text-base">
                当運営者は、以下の場合において、事前通知なくユーザーの利用停止または登録抹消を行うことができます。
            </p>
            <ul className="list-disc list-inside space-y-2 text-base">
                <li>第4条に定める禁止行為に該当する場合</li>
                <li>システム保守・サーバー障害等で運営上必要と判断した場合</li>
            </ul>


            {/* 第5条の2 自動データ管理機能 */}
            <h2 className="text-2xl font-semibold mt-6">第5条の2（自動データ管理機能）</h2>
            <ul className="list-disc list-inside space-y-2 text-base">
                <li>
                    当運営者は、ユーザーの好感度が一定の基準を下回った場合、
                    アカウントを自動的に削除する機能を備えています。削除後のデータ復元は一切できません。
                </li>
                <li>
                    当運営者は、ユーザーが数日以上ログインしなかった場合、
                    登録されたTodoを自動的に削除・編集する機能を備えています。削除または編集されたデータは復元できません。
                </li>
                <li>
                    当運営者は、期限切れのTodoを自動的に削除する機能を備えています。削除後のデータ復元は一切できません。
                </li>
            </ul>

            {/* 第6条（退会） */}
            <h2 className="text-2xl font-semibold mt-6">第6条（退会）</h2>
            <p className="text-base">
                ユーザーは当運営者指定のメールアドレス（scarlet7.net@gmail.com）宛に退会希望の旨を送信することで、いつでも退会（アカウント削除）を申請できます。退会申請を受信後、当運営者は7日以内に保有するユーザーの個人情報（メールアドレス、アクセスログ等）およびコンテンツをすべて削除します。
            </p>


            {/* 第7条 知的財産権 */}
            <h2 className="text-2xl font-semibold mt-6">第7条（知的財産権）</h2>
            <p className="text-base">本サービスに関する著作権、商標権その他の知的財産権はすべて当運営者または正当な権利者に帰属します。</p>
            <p className="text-base">ユーザーは本サービスの画面キャプチャ（スクリーンショット）をSNSへ投稿することや、非営利目的での共有を自由に行うことができます。それ以外の複製・改変・転載・再配布等の行為は禁じます。</p>

            {/* 第8条 投稿データの取扱い */}
            <h2 className="text-2xl font-semibold mt-6">第8条（投稿データの取扱い）</h2>
            <p className="text-base">ユーザーが本サービス上に投稿または登録したコンテンツ（テキスト、画像等）の著作権はユーザーに帰属します。</p>
            <p className="text-base">当運営者は本サービスの宣伝・改善等を目的として、当該コンテンツを無償かつ無期限で複製、表示、加工等できるものとします。</p>

            {/* 第9条 画像素材の取り扱い */}
            <h2 className="text-2xl font-semibold mt-6">第9条（画像素材の取り扱い）</h2>
            <p className="text-base">本アプリや公式SNSで提供されるキャラクター「ヘラちゃん」の画像素材について、以下の通り定めます。</p>
            <ul className="list-disc list-inside space-y-2 text-base">
                <li>SNSなどへのアップロードや共有は自由に行えます。</li>
                <li>SNSで転載・二次利用する際は、可能な限り「©メンヘラTodo／ヘラちゃん」のクレジット表記を推奨します。</li>
                <li>画像を自らが作成したかのように誤認させる行為は禁止します。</li>
            </ul>

            {/* 第10条 免責および保証の否認 */}
            <h2 className="text-2xl font-semibold mt-6">第10条（免責および保証の否認）</h2>
            <p className="text-base">本サービスはジョーク要素を含むサービスとして現状有姿で提供されます。運営者はプログラムの不具合、データ消失、精神的苦痛等について一切の責任を負いません。</p>
            <p className="text-base">また、本サービスのメンテナンスやシステム障害等によりユーザーのデータが消失した場合でも、当運営者に故意または重過失がある場合を除き、当運営者は一切の責任を負いません。</p>

            {/* 第11条 プライバシー */}
            <h2 className="text-2xl font-semibold mt-6">第11条（プライバシー）</h2>
            <p className="text-base">運営者はユーザーの個人情報を以下の目的で収集・利用します。</p>
            <ul className="list-disc list-inside space-y-2 text-base">
                <li>アカウント登録および認証のため</li>
                <li>本サービス提供および改善のため</li>
                <li>お問い合わせ対応のため</li>
            </ul>
            <p className="text-base">取得した個人情報は第三者に提供せず、適切な安全管理措置を講じます。</p>

            {/* 第12条 規約変更 */}
            <h2 className="text-2xl font-semibold mt-6">第12条（規約変更）</h2>
            <p className="text-base">運営者は本規約を随時変更でき、変更後の規約は本サービス内で公表した時点から効力を生じます。</p>

            {/* 第13条 準拠法と管轄 */}
            <h2 className="text-2xl font-semibold mt-6">第13条（準拠法と管轄）</h2>
            <p className="text-base">本規約の解釈には日本法を準拠法とし、紛争が生じた場合は東京地方裁判所を専属的合意管轄裁判所とします。</p>

            {/* お問い合わせ */}
            <h2 className="text-2xl font-semibold mt-6">お問い合わせ</h2>
            <p className="text-base">ご質問・ご要望は以下のメールアドレスまでご連絡ください。</p>
            <p className="text-base">メールアドレス: scarlet7.net@gmail.com</p>

            <div className="mt-8 text-center">
                <Link href="/sign-up">
                    <Button variant="outline">アカウント登録に戻る</Button>
                </Link>
            </div>
        </article>
    );
}
