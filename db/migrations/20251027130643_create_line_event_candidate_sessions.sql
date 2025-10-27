/**
 * LINE イベント候補セッション管理テーブル
 *
 * @description
 * LINE経由でAI生成したイベント候補を一時保存するためのセッション管理テーブル
 * ユーザーがLINEでメッセージを送信すると、AIがイベント候補を生成し、
 * このテーブルに保存してセッションIDを発行します。
 * LIFFアプリはこのセッションIDを使って候補を取得し、表示・登録を行います。
 */

-- LINE イベント候補セッションテーブル
CREATE TABLE IF NOT EXISTS line_event_candidate_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    line_user_id TEXT NOT NULL,
    query TEXT NOT NULL,
    ai_message TEXT,
    candidates JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours') NOT NULL
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_line_event_candidate_sessions_session_id
    ON line_event_candidate_sessions(session_id);

CREATE INDEX IF NOT EXISTS idx_line_event_candidate_sessions_line_user_id
    ON line_event_candidate_sessions(line_user_id);

CREATE INDEX IF NOT EXISTS idx_line_event_candidate_sessions_expires_at
    ON line_event_candidate_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_line_event_candidate_sessions_user_id
    ON line_event_candidate_sessions(user_id);

-- テーブルコメント
COMMENT ON TABLE line_event_candidate_sessions IS 'LINE経由でAI生成したイベント候補を一時保存するセッション管理テーブル';
COMMENT ON COLUMN line_event_candidate_sessions.id IS 'プライマリキー（UUID）';
COMMENT ON COLUMN line_event_candidate_sessions.session_id IS 'セッション識別子（LIFF URLパラメータで使用）';
COMMENT ON COLUMN line_event_candidate_sessions.user_id IS 'ユーザーID（usersへの外部キー）';
COMMENT ON COLUMN line_event_candidate_sessions.line_user_id IS 'LINEユーザーID';
COMMENT ON COLUMN line_event_candidate_sessions.query IS 'ユーザーの元のクエリ（LINEメッセージ）';
COMMENT ON COLUMN line_event_candidate_sessions.ai_message IS 'AIが生成したメッセージ';
COMMENT ON COLUMN line_event_candidate_sessions.candidates IS 'イベント候補データ（JSON配列）';
COMMENT ON COLUMN line_event_candidate_sessions.created_at IS '作成日時';
COMMENT ON COLUMN line_event_candidate_sessions.expires_at IS '有効期限（デフォルト: 作成から24時間後）';
