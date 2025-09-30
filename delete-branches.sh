#!/bin/bash

# delete-branches.sh PREFIX START END [options]
# Example: sh delete-branches.sh feature PTM-26 PTM-56 --origin -D

PREFIX=$1
START=$2
END=$3
shift 3

DELETE_FLAG="-D"  # デフォルトは強制削除
DELETE_REMOTE=false

# オプションの処理
for arg in "$@"; do
  case "$arg" in
    -d|-D)
      DELETE_FLAG="$arg"
      ;;
    --origin)
      DELETE_REMOTE=true
      ;;
  esac
done

# START と END の数値部分を抽出
START_NUM=$(echo $START | grep -o '[0-9]\+')
END_NUM=$(echo $END | grep -o '[0-9]\+')

# PTM の prefix 部分を抽出 (PTM-)
TICKET_PREFIX=$(echo $START | sed -E "s/[0-9]+//")

for i in $(seq $START_NUM $END_NUM); do
  BRANCH="${PREFIX}/${TICKET_PREFIX}${i}"

  # ブランチが存在するか確認
  if git show-ref --quiet "refs/heads/$BRANCH" || git ls-remote --exit-code origin "$BRANCH" &>/dev/null; then
    echo "Deleting local branch: $BRANCH ($DELETE_FLAG)"
    git branch $DELETE_FLAG "$BRANCH" 2>/dev/null || true

    if $DELETE_REMOTE; then
      echo "Deleting remote branch: $BRANCH"
      git push origin --delete "$BRANCH" 2>/dev/null || true
    fi
  else
    echo "Skipping (not found): $BRANCH"
  fi
done
