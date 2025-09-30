FROM node:22-alpine

# タイムゾーンの設定
RUN ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime

# 作業ディレクトリ
WORKDIR /app

# git のインストー
RUN apk add --no-cache git

#  tsx をグローバルインストール
RUN npm install -g  tsx