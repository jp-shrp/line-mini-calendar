# 認証フロー

このドキュメントでは、line-mini-calendarアプリケーションにおける認証フローを詳細に説明します。

## 目次

1. [概要](#概要)
2. [認証方式](#認証方式)
3. [Web版の認証フロー](#web版の認証フロー)
4. [LIFF版の認証フロー](#liff版の認証フロー)
5. [実装詳細](#実装詳細)
6. [シーケンス図](#シーケンス図)

---

## 概要

本アプリケーションは、以下の2つの認証方式を環境に応じて自動切り替えする統合認証システムを採用しています。

- **匿名認証**: 通常のWeb環境で使用される、デバイスIDベースの認証
- **LINE認証**: LINE内ブラウザ（LIFF環境）で使用される、LINE IDトークンベースの認証

環境変数 `NEXT_PUBLIC_ENABLE_LIFF` の設定とLIFF環境の検出により、自動的に適切な認証方式が選択されます。

---

## 認証方式

### 1. 匿名認証（Anonymous Authentication）

**使用環境**: 通常のWebブラウザ

**特徴**:

- デバイスIDから決定論的UUIDを生成
- 同じデバイスからは常に同じユーザーとして認証
- ユーザー登録不要で即座に利用開始可能

**技術的実装**:

- デバイスIDは `navigator.userAgent` + `screen` 情報から生成
- SHA-256ハッシュを使用して決定論的UUID（v4形式）を生成
- Supabase Authで匿名ユーザーを作成・管理

### 2. LINE認証（LINE Authentication）

**使用環境**: LINE内ブラウザ（LIFF）

**特徴**:

- LINE ID tokenを使用したOAuth認証
- LINEユーザー情報（プロフィール、表示名、画像）を取得可能
- LINE既存ユーザーとシームレスに連携

**技術的実装**:

- LIFF SDKを使用してID tokenを取得
- LINE Platform APIでID tokenを検証
- LINEユーザーIDから決定論的UUIDを生成してSupabase Authと連携

---

## Web版の認証フロー

### 初期化フロー

```
1. アプリケーション起動
   ↓
2. ClientWrapper: React QueryとContext Providerの初期化
   - QueryClientProvider
   - LoadingProvider
   - ModalProvider
   - OnLoadingProvider
   - LiffProvider
   - AuthProvider（統合認証を実行）
   ↓
3. LiffProvider: LIFF無効のため初期化スキップ
   ↓
4. AuthProvider: useIntegratedAuth実行
   ↓
5. useIntegratedAuth: 環境判定
   - NEXT_PUBLIC_ENABLE_LIFF !== 'true'
   - 匿名認証を選択
   ↓
6. useAnonymousAuth: 匿名認証実行
   ↓
7. Supabaseセッション確認
   ↓
8-A. セッション存在 → 認証完了
8-B. セッション無し → 匿名ログイン実行
```

### 匿名ログイン詳細フロー

```
1. デバイス情報収集
   - navigator.userAgent
   - screen.width, screen.height
   - screen.colorDepth
   ↓
2. 決定論的UUID生成
   - SHA-256でハッシュ化
   - UUID v4形式に変換
   ↓
3. Edge Function呼び出し: POST /auth-api/anonymous-login
   - Body: { deviceId }
   ↓
4. Edge Function処理:
   a. 決定論的UUIDからSupabaseユーザー検索
   b. 存在しない場合: 新規ユーザー作成
      - email: {uuid}@anonymous.local
      - password: SHA-256(password_{deviceId})
      - user_metadata.is_anonymous: true
   c. 存在する場合: メタデータ更新
      - last_login更新
   ↓
5. 認証情報返却
   - userId, email, password
   ↓
6. クライアント: Supabase signInWithPassword
   - email, passwordで認証
   ↓
7. セッション確立
   - Cookieにセッション保存
   - 自動トークンリフレッシュ有効化
   ↓
8. 認証完了
```

### セッション管理

```
- onAuthStateChange監視
  ├─ SIGNED_OUT → 自動再ログイン
  ├─ TOKEN_REFRESHED → セッション更新
  ├─ SIGNED_IN → 認証状態更新
  └─ USER_UPDATED → ユーザー情報更新

- Middleware (src/middleware.ts):
  - 全リクエストでSupabaseセッション取得
  - Cookie経由でセッション管理
  - 公開パス('/')は認証チェックスキップ
```

---

## LIFF版の認証フロー

### 初期化フロー

```
1. アプリケーション起動
   ↓
2. ClientWrapper: React QueryとContext Providerの初期化
   - QueryClientProvider
   - LoadingProvider
   - ModalProvider
   - OnLoadingProvider
   - LiffProvider
   - AuthProvider（統合認証を実行）
   ↓
3. LiffProvider: LIFF初期化
   ↓
4. useLiff実行:
   a. LIFF SDK初期化
      - liff.init({ liffId })
   b. LINE内ブラウザ判定
      - liff.isInClient()
   c. ログイン状態確認
      - liff.isLoggedIn()
   d. プロフィール取得（ログイン済みの場合）
      - liff.getProfile()
   ↓
5. AuthProvider: useIntegratedAuth実行
   ↓
6. useIntegratedAuth: 環境判定
   - NEXT_PUBLIC_ENABLE_LIFF === 'true'
   - isLiffReady && isInLineApp
   - LINE認証を選択
   ↓
7. useLineAuth: LINE認証実行（自動）
```

### LINE認証詳細フロー

```
1. LIFF初期化完了確認
   - isLiffReady: true
   - isInLineApp: true
   - isLiffLoggedIn: true
   ↓
2. LINE ID token取得
   - liff.getIDToken()
   ↓
3. Edge Function呼び出し: POST /auth-api/line-login
   - Body: { idToken }
   ↓
4. Edge Function処理:
   a. LINE Platform APIでID token検証
      - POST https://api.line.me/oauth2/v2.1/verify
      - client_id: LIFF ID
      - 検証成功: LINEユーザー情報取得
        * sub: LINE User ID
        * name: 表示名
        * picture: プロフィール画像URL
        * email: メールアドレス（オプション）

   b. 決定論的UUID生成
      - lineId = "line_" + LINE User ID
      - SHA-256でハッシュ化してUUID生成

   c. Supabaseユーザー検索・作成
      - 存在しない場合: 新規作成
        * email: LINEのメールまたは {uuid}@line.local
        * password: SHA-256(password_line_{lineUserId})
        * user_metadata:
          - line_user_id: LINE User ID
          - display_name: LINE表示名
          - picture_url: プロフィール画像URL
          - provider: "line"
      - 存在する場合: メタデータ更新
        * last_login更新
        * LINE情報更新
   ↓
5. 認証情報返却
   - userId, email, password
   - lineUserId, displayName, pictureUrl
   ↓
6. クライアント: Supabase signInWithPassword
   - email, passwordで認証
   ↓
7. セッション確立
   - Cookieにセッション保存
   ↓
8. 認証完了
```

### LINEログインしていない場合

```
1. isLiffLoggedIn: false
   ↓
2. liff.login()実行
   - redirectUri: 現在のURL
   ↓
3. LINE認証画面へリダイレクト
   ↓
4. ユーザーが認証許可
   ↓
5. redirectUriへリダイレクト
   ↓
6. LIFF再初期化
   ↓
7. 上記「LINE認証詳細フロー」を実行
```

---

## 実装詳細

### ディレクトリ構成

```
src/
├── hooks/
│   ├── useIntegratedAuth.ts    # 統合認証フック（メイン）
│   ├── useAnonymousAuth.ts     # 匿名認証フック
│   ├── useLineAuth.ts          # LINE認証フック
│   └── useLiff.ts              # LIFF SDKフック
├── contexts/
│   ├── AuthContext.tsx         # 認証Context
│   └── LiffContext.tsx         # LIFFContext
├── lib/
│   ├── liff-client.ts          # LIFFクライアント
│   ├── mock-liff.ts            # モックLIFF（開発用）
│   └── deterministic-uuid.ts   # 決定論的UUID生成
├── middleware.ts               # Next.jsミドルウェア
├── components/
│   └── ClientWrapper.tsx       # クライアントラッパー（AuthProviderを含む）
└── app/
    └── (protected)/
        └── layout.tsx          # 保護ルート用レイアウト（AuthGuardのみ）

supabase/functions/
├── auth-api/
│   └── index.ts               # 認証APIエンドポイント
└── _shared/
    ├── services/
    │   └── authService.ts     # 認証サービス
    └── middlewares/
        └── middleware.ts      # Edge Functionミドルウェア

db/
└── supabase.ts               # Supabaseクライアント
```

### 主要コンポーネント

#### 1. useIntegratedAuth（統合認証フック）

**役割**: 環境に応じて認証方式を自動切り替え

**ファイル**: `src/hooks/useIntegratedAuth.ts`

**処理フロー**:

```typescript
1. useAnonymousAuth()とuseLineAuth()を並行実行
2. useLiffContext()でLIFF状態を取得
3. 環境判定:
   - NEXT_PUBLIC_ENABLE_LIFF === 'true'
   - isLiffReady && isInLineApp
   - → shouldUseLine = true
4. shouldUseLine === true の場合:
   - LINE認証を自動実行
   - 戻り値: LINE認証情報
5. shouldUseLine === false の場合:
   - 匿名認証を使用
   - 戻り値: 匿名認証情報
```

**戻り値**:

```typescript
{
    isAuthenticated: boolean // 認証済みフラグ
    isLoading: boolean // ローディング中フラグ
    userId: string | null // SupabaseユーザーID
    error: Error | null // エラー
    authMethod: 'anonymous' | 'line' // 認証方式
    lineProfile: Profile | null // LINEプロフィール（LINE認証時のみ）
    switchToLineAuth: () => Promise<void> // LINE認証切り替え
    logout: () => Promise<void> // ログアウト
}
```

#### 2. useAnonymousAuth（匿名認証フック）

**役割**: デバイスIDベースの匿名認証

**ファイル**: `src/hooks/useAnonymousAuth.ts`

**処理フロー**:

```typescript
1. Supabaseセッション確認
2. セッション存在 → 認証完了
3. セッション無し:
   a. デバイスID生成
   b. Edge Function呼び出し: POST /auth-api/anonymous-login
   c. 認証情報取得（email, password）
   d. Supabase signInWithPassword
4. onAuthStateChange監視:
   - SIGNED_OUT → 自動再ログイン
   - TOKEN_REFRESHED → セッション更新
```

#### 3. useLineAuth（LINE認証フック）

**役割**: LIFF SDKを使用したLINE認証

**ファイル**: `src/hooks/useLineAuth.ts`

**処理フロー**:

```typescript
1. LIFFログイン確認
2. 未ログイン → liff.login()実行
3. ログイン済み:
   a. LINE ID token取得: liff.getIDToken()
   b. Edge Function呼び出し: POST /auth-api/line-login
   c. 認証情報取得（email, password）
   d. Supabase signInWithPassword
```

#### 4. useLiff（LIFFフック）

**役割**: LIFF SDKの初期化とログイン状態管理

**ファイル**: `src/hooks/useLiff.ts`

**処理フロー**:

```typescript
1. LIFF有効判定（NEXT_PUBLIC_ENABLE_LIFF）
2. 無効 → 初期化スキップ
3. 有効:
   a. getLiffClient()でLIFF SDKまたはモックLIFFを取得
   b. liff.init({ liffId })で初期化
   c. isInClient()でLINE内ブラウザ判定
   d. isLoggedIn()でログイン状態確認
   e. getProfile()でプロフィール取得（ログイン済みの場合）
```

**戻り値**:

```typescript
{
  isLiffReady: boolean          // LIFF準備完了
  isInLineApp: boolean          // LINE内ブラウザ判定
  isLoggedIn: boolean           // ログイン済み
  profile: Profile | null       // LINEプロフィール
  liff: Liff | null            // LIFFインスタンス
  error: Error | null          // エラー
  login: () => void            // ログイン
  logout: () => void           // ログアウト
  getAccessToken: () => string | null  // アクセストークン取得
  getIDToken: () => string | null      // IDトークン取得
}
```

### Edge Function実装

#### 1. 匿名ログインAPI

**エンドポイント**: `POST /auth-api/anonymous-login`

**ファイル**: `supabase/functions/auth-api/index.ts`

**リクエスト**:

```typescript
{
    deviceId: string // デバイスID（クライアントで生成）
}
```

**処理フロー**:

```typescript
1. バリデーション（Zod）
2. getOrCreateAnonymousUser()呼び出し:
   a. 決定論的UUID生成: generateDeterministicUUID("anonymous_" + deviceId)
   b. Supabaseユーザー検索: getUserByDeterministicId()
   c. 存在しない場合:
      - createUserWithDeterministicId()で新規作成
      - email: {uuid}@anonymous.local
      - password: generateDeterministicPassword("anonymous_" + deviceId)
      - user_metadata: { device_id, is_anonymous: true }
   d. 存在する場合:
      - updateUserMetadata()でメタデータ更新
      - last_login更新
3. 認証情報返却:
   - userId, email, password
```

**レスポンス**:

```typescript
{
  success: true,
  data: {
    userId: string,
    email: string,
    password: string
  },
  message: "Anonymous login successful"
}
```

#### 2. LINEログインAPI

**エンドポイント**: `POST /auth-api/line-login`

**ファイル**: `supabase/functions/auth-api/index.ts`

**リクエスト**:

```typescript
{
    idToken: string // LINE ID token
}
```

**処理フロー**:

```typescript
1. バリデーション（Zod）
2. verifyLineIdToken()でID token検証:
   a. モックトークン判定（開発環境）
   b. LINE Platform API呼び出し:
      - POST https://api.line.me/oauth2/v2.1/verify
      - Body: { id_token, client_id }
   c. レスポンス: { sub, name, picture, email }
3. getOrCreateLineUser()呼び出し:
   a. 決定論的UUID生成: generateDeterministicUUID("line_" + sub)
   b. Supabaseユーザー検索
   c. 存在しない場合:
      - 新規作成
      - email: LINEのメールまたは {uuid}@line.local
      - password: generateDeterministicPassword("line_" + sub)
      - user_metadata: { line_user_id, display_name, picture_url, provider: "line" }
   d. 存在する場合:
      - メタデータ更新
4. 認証情報返却
```

**レスポンス**:

```typescript
{
  success: true,
  data: {
    userId: string,
    email: string,
    password: string,
    lineUserId: string,
    displayName: string,
    pictureUrl: string
  },
  message: "LINE login successful"
}
```

#### 3. LINEアカウント連携API

**エンドポイント**: `POST /auth-api/link-line`

**ファイル**: `supabase/functions/auth-api/index.ts`

**用途**: 既存の匿名アカウントにLINEアカウントを連携

**リクエスト**:

```typescript
{
    idToken: string // LINE ID token
}
```

**処理フロー**:

```typescript
1. authMiddleware: JWT認証
2. バリデーション（Zod）
3. verifyLineIdToken()でID token検証
4. linkLineToAnonymousAccount()呼び出し:
   a. 既存LINEアカウント確認
   b. 存在する場合: エラー（既に連携済み）
   c. 現在のユーザーのメタデータ更新:
      - line_user_id, display_name, picture_url
      - provider: "line_anonymous"
      - linked_at: 現在時刻
5. 更新されたユーザー情報返却
```

### 決定論的UUID生成

**ファイル**:

- クライアント: `src/lib/deterministic-uuid.ts`
- サーバー: `supabase/functions/_shared/services/authService.ts`

**実装**:

```typescript
async function generateDeterministicUUID(id: string): Promise<string> {
    // 1. SHA-256ハッシュ生成
    const encoder = new TextEncoder()
    const data = encoder.encode(id)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)

    // 2. ハッシュを16進数文字列に変換
    const hashArray = new Uint8Array(hashBuffer)
    const hashHex = Array.from(hashArray)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

    // 3. UUID v4形式に変換
    const uuid = [
        hashHex.slice(0, 8), // time_low
        hashHex.slice(8, 12), // time_mid
        '4' + hashHex.slice(13, 16), // version (4) + time_hi
        ((parseInt(hashHex.slice(16, 17), 16) & 0x3) | 0x8) // variant + clock_seq
            .toString(16) + hashHex.slice(17, 20),
        hashHex.slice(20, 32), // node
    ].join('-')

    return uuid
}
```

**特徴**:

- 同じ入力に対して常に同じUUIDを生成（決定論的）
- UUID v4形式に準拠
- SHA-256による暗号学的安全性

### デバイスID生成

**ファイル**: `src/lib/deterministic-uuid.ts`

**実装**:

```typescript
async function generateDeterministicUUID(): Promise<string> {
    // 1. デバイス情報収集
    const deviceInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenWidth: screen.width,
        screenHeight: screen.height,
        screenColorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }

    // 2. JSON文字列化
    const deviceString = JSON.stringify(deviceInfo)

    // 3. 決定論的UUID生成
    return generateDeterministicUUID(deviceString)
}
```

**収集情報**:

- userAgent: ブラウザ情報
- language: 言語設定
- platform: OS情報
- screen: 画面解像度・色深度
- timezone: タイムゾーン

### ミドルウェア

#### 1. Next.jsミドルウェア

**ファイル**: `src/middleware.ts`

**役割**: 全リクエストでSupabaseセッションを確認・更新

**処理フロー**:

```typescript
1. パス判定:
   - 公開パス('/') → 認証チェックスキップ
   - その他 → 認証チェック実行
2. Supabaseクライアント作成:
   - Cookieベースのセッション管理
3. supabase.auth.getSession()でセッション取得
4. セッション存在 → リクエスト続行
5. セッション無し → リクエスト続行（匿名認証はクライアントで実行）
```

**注意点**:

- 現在は匿名認証を前提としているため、認証チェックはスキップ
- 将来的にLINE認証必須にする場合は、認証チェック機能を有効化

#### 2. Edge Functionミドルウェア

**ファイル**: `supabase/functions/_shared/middlewares/middleware.ts`

**提供機能**:

- `authMiddleware`: JWT認証ミドルウェア
- `corsMiddleware`: CORS設定
- `errorMiddleware`: グローバルエラーハンドリング
- `apiHandler`: APIハンドラーラッパー（try-catch自動化）
- `validatedApiHandler`: バリデーション付きAPIハンドラー

**authMiddleware処理フロー**:

```typescript
1. リクエストヘッダーからAuthorizationを取得
2. Supabaseクライアント作成（Service Role Key使用）
3. supabase.auth.getUser()でユーザー検証
4. 検証失敗 → 401 Unauthorized
5. 検証成功:
   - c.set('user', user)でユーザー情報をContextに保存
   - c.set('supabase', supabase)でSupabaseクライアントを保存
6. 次のハンドラーへ
```

---

## シーケンス図

### Web版（匿名認証）

```
┌──────┐          ┌────────────┐          ┌─────────────┐          ┌──────────┐
│Client│          │useAnonymous│          │Edge Function│          │Supabase  │
│      │          │Auth        │          │             │          │Auth      │
└──┬───┘          └─────┬──────┘          └──────┬──────┘          └────┬─────┘
   │                    │                        │                      │
   │  1. 初期化          │                        │                      │
   ├───────────────────>│                        │                      │
   │                    │                        │                      │
   │  2. セッション確認  │                        │                      │
   │                    ├───────────────────────────────────────────────>│
   │                    │                        │                      │
   │  3. セッション無し  │                        │                      │
   │                    │<───────────────────────────────────────────────┤
   │                    │                        │                      │
   │  4. デバイスID生成  │                        │                      │
   │                    │                        │                      │
   │  5. POST /auth-api/anonymous-login         │                      │
   │                    ├───────────────────────>│                      │
   │                    │   { deviceId }         │                      │
   │                    │                        │                      │
   │                    │         6. ユーザー検索/作成                   │
   │                    │                        ├─────────────────────>│
   │                    │                        │                      │
   │                    │         7. ユーザー情報                        │
   │                    │                        │<─────────────────────┤
   │                    │                        │                      │
   │  8. 認証情報返却    │                        │                      │
   │                    │<───────────────────────┤                      │
   │                    │   { email, password }  │                      │
   │                    │                        │                      │
   │  9. signInWithPassword(email, password)     │                      │
   │                    ├───────────────────────────────────────────────>│
   │                    │                        │                      │
   │  10. セッション確立 │                        │                      │
   │                    │<───────────────────────────────────────────────┤
   │                    │                        │                      │
   │  11. 認証完了       │                        │                      │
   │<───────────────────┤                        │                      │
   │                    │                        │                      │
```

### LIFF版（LINE認証）

```
┌──────┐    ┌───────┐    ┌─────────┐    ┌─────────────┐    ┌──────────┐    ┌──────────┐
│Client│    │useLiff│    │useLineA │    │Edge Function│    │LINE API  │    │Supabase  │
│      │    │       │    │uth      │    │             │    │          │    │Auth      │
└──┬───┘    └───┬───┘    └────┬────┘    └──────┬──────┘    └────┬─────┘    └────┬─────┘
   │            │             │                 │                 │               │
   │  1. LIFF初期化           │                 │                 │               │
   ├───────────>│             │                 │                 │               │
   │            │             │                 │                 │               │
   │  2. liff.init()          │                 │                 │               │
   │            │             │                 │                 │               │
   │  3. isInClient() = true  │                 │                 │               │
   │            │             │                 │                 │               │
   │  4. isLoggedIn() = true  │                 │                 │               │
   │            │             │                 │                 │               │
   │  5. getProfile()         │                 │                 │               │
   │            │             │                 │                 │               │
   │  6. LIFF準備完了         │                 │                 │               │
   │<───────────┤             │                 │                 │               │
   │            │             │                 │                 │               │
   │  7. LINE認証自動実行     │                 │                 │               │
   │            ├────────────>│                 │                 │               │
   │            │             │                 │                 │               │
   │  8. getIDToken()         │                 │                 │               │
   │            │<────────────┤                 │                 │               │
   │            │             │                 │                 │               │
   │  9. POST /auth-api/line-login            │                 │               │
   │            │             ├────────────────>│                 │               │
   │            │             │  { idToken }    │                 │               │
   │            │             │                 │                 │               │
   │            │             │  10. ID token検証                 │               │
   │            │             │                 ├────────────────>│               │
   │            │             │                 │                 │               │
   │            │             │  11. LINEユーザー情報             │               │
   │            │             │                 │<────────────────┤               │
   │            │             │                 │                 │               │
   │            │             │  12. Supabaseユーザー検索/作成    │               │
   │            │             │                 ├─────────────────────────────────>│
   │            │             │                 │                 │               │
   │            │             │  13. ユーザー情報                 │               │
   │            │             │                 │<─────────────────────────────────┤
   │            │             │                 │                 │               │
   │  14. 認証情報返却        │                 │                 │               │
   │            │             │<────────────────┤                 │               │
   │            │             │  { email, password, lineUserId }  │               │
   │            │             │                 │                 │               │
   │  15. signInWithPassword(email, password)   │                 │               │
   │            │             ├───────────────────────────────────────────────────>│
   │            │             │                 │                 │               │
   │  16. セッション確立      │                 │                 │               │
   │            │             │<───────────────────────────────────────────────────┤
   │            │             │                 │                 │               │
   │  17. 認証完了            │                 │                 │               │
   │<───────────────────────┤                 │                 │               │
   │            │             │                 │                 │               │
```

---

## 環境変数

### クライアント側

| 変数名                          | 説明                           | 必須       | デフォルト |
| ------------------------------- | ------------------------------ | ---------- | ---------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase プロジェクトURL       | ✓          | -          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー              | ✓          | -          |
| `NEXT_PUBLIC_ENABLE_LIFF`       | LIFF有効化フラグ               | -          | `false`    |
| `NEXT_PUBLIC_LIFF_ID`           | LIFF ID                        | LIFF有効時 | -          |
| `NEXT_PUBLIC_USE_MOCK_LIFF`     | モックLIFF使用フラグ（開発用） | -          | `false`    |

### サーバー側（Edge Functions）

| 変数名                      | 説明                      | 必須       |
| --------------------------- | ------------------------- | ---------- |
| `SUPABASE_URL`              | Supabase プロジェクトURL  | ✓          |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | ✓          |
| `LINE_LIFF_ID`              | LIFF ID（ID token検証用） | LIFF有効時 |

---

## セキュリティ

### 決定論的パスワードの安全性

**生成方法**:

```typescript
password = SHA - 256('password_' + id)
```

**安全性の理由**:

1. **SHA-256ハッシュ**: 暗号学的に安全なハッシュ関数
2. **サーバー側でのみ生成**: クライアントに決定論的パスワードは送信されない
3. **Supabase Auth内部で再ハッシュ化**: bcryptなどで再度ハッシュ化される
4. **セッショントークンベース**: 実際の認証はJWTトークンで行われる

**注意点**:

- 決定論的パスワードはあくまで初期認証用
- セッション確立後はJWTトークンで認証
- トークンはSupabase Authで自動管理（リフレッシュ、失効）

### LINE ID token検証

**検証フロー**:

1. クライアント: LIFF SDKでID token取得
2. Edge Function: LINE Platform APIで検証
3. 検証成功: LINEユーザー情報取得
4. 検証失敗: 401 Unauthorized

**セキュリティ対策**:

- クライアント側でのトークン検証は行わない（改ざん可能）
- 必ずサーバー側（Edge Function）でLINE APIを使用して検証
- LIFF IDを使用してトークンの正当性を確認

---

## トラブルシューティング

### 匿名認証が失敗する

**原因**:

- Edge Functionが応答していない
- Supabase Authの設定問題

**確認項目**:

1. Edge Functionのログ確認: `supabase functions logs auth-api`
2. Supabase Authの有効化確認
3. Service Role Keyの設定確認

### LINE認証が失敗する

**原因**:

- LIFF IDが正しくない
- LINE Platform APIの検証エラー
- ID tokenの有効期限切れ

**確認項目**:

1. `NEXT_PUBLIC_LIFF_ID`の設定確認
2. LINE Developers Consoleでチャネル設定確認
3. Edge Functionのログで詳細エラー確認
4. LIFF IDが環境変数`LINE_LIFF_ID`に設定されているか確認

### セッションが切れる

**原因**:

- トークンの有効期限切れ
- 自動リフレッシュの失敗

**対処法**:

1. `onAuthStateChange`でSIGNED_OUTイベントを監視
2. 自動再ログインを実装（現在実装済み）
3. ログ確認: `supabase.auth.getSession()`のエラー

---

## まとめ

本アプリケーションの認証システムは、以下の特徴を持ちます:

1. **環境自動判定**: Web版とLIFF版を自動切り替え
2. **シームレスな認証**: ユーザー登録不要で即座に利用開始
3. **決定論的UUID**: 同一デバイス/ユーザーからは常に同じIDで認証
4. **セキュアな実装**: サーバー側での検証とハッシュ化
5. **統一された認証フロー**: 匿名認証とLINE認証で共通のインターフェース

この設計により、ユーザーは環境を意識することなく、シームレスにアプリケーションを利用できます。
